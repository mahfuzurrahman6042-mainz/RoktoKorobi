// Geolocation utility functions for RoktoKorobi
// Uses FREE APIs: Nominatim (OpenStreetMap) and OSRM

/**
 * Geocode a place name to coordinates using Nominatim
 */
export async function geocode(placeName: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)},Bangladesh&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    
    if (!data || !data.length) {
      throw new Error(`Could not find "${placeName}". Try a nearby landmark.`);
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  } catch (err) {
    console.error('Geocoding failed:', err);
    throw err;
  }
}

/**
 * Geocode donor's area during registration
 */
export async function geocodeDonorArea(areaName: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(areaName)},Dhaka,Bangladesh&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    
    if (!data || !data.length) {
      throw new Error('Area not found');
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  } catch (err) {
    console.error('Geocoding failed:', err);
    return null;
  }
}

/**
 * Get route between two points using OSRM
 */
export async function getRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number
): Promise<{ coords: [number, number][]; distance: string; duration: string }> {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    
    if (!data.routes || !data.routes.length) {
      throw new Error('No route found');
    }
    
    const coords = data.routes[0].geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
    const distance = (data.routes[0].distance / 1000).toFixed(1);
    const duration = Math.round(data.routes[0].duration / 60);
    
    return { coords, distance, duration: duration.toString() };
  } catch (err) {
    console.error('Route calculation failed:', err);
    // Fallback: draw straight line
    return {
      coords: [[startLat, startLon], [endLat, endLon]],
      distance: 'N/A',
      duration: 'N/A'
    };
  }
}

/**
 * Calculate distance between two coordinates in meters using Haversine formula
 */
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Get GPS location with proper error handling
 */
export async function getGPSLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      }),
      (err) => {
        switch (err.code) {
          case 1:
            reject(new Error('Location permission denied. Go to browser Settings → Site Settings → Location → Allow'));
            break;
          case 2:
            reject(new Error('Location unavailable. Please type your area manually.'));
            break;
          case 3:
            reject(new Error('Location request timed out. Please try again or enter manually.'));
            break;
          default:
            reject(new Error('Unknown location error. Please enter manually.'));
        }
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
  });
}
