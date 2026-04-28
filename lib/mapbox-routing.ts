// Mapbox Directions API integration for reliable routing
// Fallback to OSRM if Mapbox is unavailable

const MAPBOX_API_URL = 'https://api.mapbox.com/directions/v5/mapbox/driving/';
const OSRM_API_URL = 'https://router.project-osrm.org/route/v1/driving/';

export interface RouteInstruction {
  instruction: string;
  distance: number;
  duration: number;
}

export interface RouteResult {
  distance: number; // meters
  duration: number; // seconds
  geometry: number[][]; // [[lng, lat], ...]
  instructions: RouteInstruction[];
}

/**
 * Get route from Mapbox Directions API
 */
export async function getMapboxRoute(
  from: [number, number],
  to: [number, number],
  mapboxToken: string
): Promise<RouteResult | null> {
  try {
    const response = await fetch(
      `${MAPBOX_API_URL}${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true&access_token=${mapboxToken}`
    );

    if (!response.ok) {
      console.error('Mapbox API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    const geometry = route.geometry.coordinates; // [[lng, lat], ...]

    // Convert steps to instructions
    const instructions: RouteInstruction[] = route.legs[0].steps.map((step: any) => ({
      instruction: step.maneuver.instruction || 'Continue',
      distance: step.distance,
      duration: step.duration,
    }));

    return {
      distance: route.distance,
      duration: route.duration,
      geometry: geometry,
      instructions,
    };
  } catch (error) {
    console.error('Mapbox routing error:', error);
    return null;
  }
}

/**
 * Get route from OSRM (fallback)
 */
export async function getOSRMRoute(
  from: [number, number],
  to: [number, number]
): Promise<RouteResult | null> {
  try {
    const response = await fetch(
      `${OSRM_API_URL}${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
    );

    if (!response.ok) {
      console.error('OSRM API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    const geometry = route.geometry.coordinates; // [[lng, lat], ...]

    // OSRM doesn't provide detailed instructions in the basic response
    const instructions: RouteInstruction[] = [
      { instruction: 'Follow the route to destination', distance: route.distance, duration: route.duration },
    ];

    return {
      distance: route.distance,
      duration: route.duration,
      geometry: geometry,
      instructions,
    };
  } catch (error) {
    console.error('OSRM routing error:', error);
    return null;
  }
}

/**
 * Get route with automatic fallback
 * Tries Mapbox first, falls back to OSRM
 */
export async function getRoute(
  from: [number, number],
  to: [number, number],
  mapboxToken?: string
): Promise<RouteResult | null> {
  // Try Mapbox if token is provided
  if (mapboxToken) {
    const mapboxRoute = await getMapboxRoute(from, to, mapboxToken);
    if (mapboxRoute) {
      return mapboxRoute;
    }
  }

  // Fallback to OSRM
  console.log('Falling back to OSRM routing');
  return await getOSRMRoute(from, to);
}
