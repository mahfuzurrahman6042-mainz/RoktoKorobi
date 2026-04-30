// Map and Location Services Utility
// Handles geolocation, map initialization, and location-based features

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface LocationAddress {
  street?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formatted?: string;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type?: 'donor' | 'hospital' | 'user' | 'request';
  icon?: string;
  popupContent?: string;
}

export interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  instructions: string[];
  coordinates: [number, number][];
}

export class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private currentPosition: LocationCoords | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Check if geolocation is supported
  isGeolocationSupported(): boolean {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  }

  // Get current position once
  async getCurrentPosition(options?: PositionOptions): Promise<LocationCoords> {
    if (!this.isGeolocationSupported()) {
      throw new Error('Geolocation is not supported by this browser');
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: LocationCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined
          };
          
          this.currentPosition = coords;
          resolve(coords);
        },
        (error) => {
          let errorMessage = 'Unknown error occurred';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location.';
          }
          
          reject(new Error(errorMessage));
        },
        defaultOptions
      );
    });
  }

  // Watch position changes
  watchPosition(
    callback: (position: LocationCoords) => void,
    errorCallback?: (error: Error) => void,
    options?: PositionOptions
  ): number {
    if (!this.isGeolocationSupported()) {
      const error = new Error('Geolocation is not supported by this browser');
      if (errorCallback) errorCallback(error);
      return -1;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
      ...options
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords: LocationCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined
        };
        
        this.currentPosition = coords;
        callback(coords);
      },
      (error) => {
        let errorMessage = 'Unknown error occurred';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        if (errorCallback) errorCallback(new Error(errorMessage));
      },
      defaultOptions
    );

    return this.watchId;
  }

  // Stop watching position
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Get current cached position
  getCurrentCachedPosition(): LocationCoords | null {
    return this.currentPosition;
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(from: LocationCoords, to: LocationCoords): number {
    const R = 6371e3; // Earth's radius in meters
    const lat1 = from.latitude * Math.PI / 180;
    const lat2 = to.latitude * Math.PI / 180;
    const deltaLat = (to.latitude - from.latitude) * Math.PI / 180;
    const deltaLon = (to.longitude - from.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Check if a point is within a certain radius
  isWithinRadius(center: LocationCoords, point: LocationCoords, radiusMeters: number): boolean {
    const distance = this.calculateDistance(center, point);
    return distance <= radiusMeters;
  }

  // Format coordinates for display
  formatCoordinates(coords: LocationCoords): string {
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  }

  // Convert coordinates to URL-safe string
  coordsToUrlString(coords: LocationCoords): string {
    return `${coords.latitude},${coords.longitude}`;
  }

  // Parse coordinates from URL string
  parseCoordsFromString(coordString: string): LocationCoords | null {
    try {
      const [lat, lng] = coordString.split(',').map(Number);
      if (isNaN(lat) || isNaN(lng)) {
        return null;
      }
      return { latitude: lat, longitude: lng };
    } catch {
      return null;
    }
  }

  // Validate coordinates
  isValidCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  // Get bearing between two points
  calculateBearing(from: LocationCoords, to: LocationCoords): number {
    const lat1 = from.latitude * Math.PI / 180;
    const lat2 = to.latitude * Math.PI / 180;
    const deltaLon = (to.longitude - from.longitude) * Math.PI / 180;

    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }
}

export class MapService {
  private static instance: MapService;

  static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }
    return MapService.instance;
  }

  // Create marker icon based on type
  createMarkerIcon(type: MapMarker['type']): string {
    const icons = {
      donor: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      hospital: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      user: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      request: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png'
    };
    
    return icons[type || 'user'];
  }

  // Create popup content for marker
  createPopupContent(marker: MapMarker): string {
    let content = `<div class="map-popup">
      <h4>${marker.title}</h4>`;
    
    if (marker.description) {
      content += `<p>${marker.description}</p>`;
    }
    
    if (marker.type) {
      content += `<p><strong>Type:</strong> ${marker.type}</p>`;
    }
    
    content += `<p><strong>Coordinates:</strong> ${marker.lat.toFixed(6)}, ${marker.lng.toFixed(6)}</p>`;
    content += `</div>`;
    
    return content;
  }

  // Filter markers by distance from a center point
  filterMarkersByDistance(
    markers: MapMarker[],
    center: LocationCoords,
    maxDistanceMeters: number
  ): MapMarker[] {
    const locationService = LocationService.getInstance();
    
    return markers.filter(marker => {
      const markerCoords: LocationCoords = {
        latitude: marker.lat,
        longitude: marker.lng
      };
      
      const distance = locationService.calculateDistance(center, markerCoords);
      return distance <= maxDistanceMeters;
    });
  }

  // Sort markers by distance from a center point
  sortMarkersByDistance(
    markers: MapMarker[],
    center: LocationCoords
  ): MapMarker[] {
    const locationService = LocationService.getInstance();
    
    return markers.sort((a, b) => {
      const coordsA: LocationCoords = { latitude: a.lat, longitude: a.lng };
      const coordsB: LocationCoords = { latitude: b.lat, longitude: b.lng };
      
      const distanceA = locationService.calculateDistance(center, coordsA);
      const distanceB = locationService.calculateDistance(center, coordsB);
      
      return distanceA - distanceB;
    });
  }

  // Find nearest markers
  findNearestMarkers(
    markers: MapMarker[],
    center: LocationCoords,
    count: number = 5
  ): MapMarker[] {
    const sortedMarkers = this.sortMarkersByDistance(markers, center);
    return sortedMarkers.slice(0, count);
  }

  // Generate bounds for a set of markers
  getBoundsForMarkers(markers: MapMarker[]): {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null {
    if (markers.length === 0) return null;

    const lats = markers.map(m => m.lat);
    const lngs = markers.map(m => m.lng);

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };
  }

  // Calculate center point for a set of markers
  getCenterForMarkers(markers: MapMarker[]): LocationCoords | null {
    if (markers.length === 0) return null;

    const bounds = this.getBoundsForMarkers(markers);
    if (!bounds) return null;

    return {
      latitude: (bounds.north + bounds.south) / 2,
      longitude: (bounds.east + bounds.west) / 2
    };
  }
}

// Export singleton instances
export const locationService = LocationService.getInstance();
export const mapService = MapService.getInstance();
