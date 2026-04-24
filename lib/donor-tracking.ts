// Donor live location tracking utilities
// Uses watchPosition for real-time GPS updates

let watchId: number | null = null;

/**
 * Start donor GPS tracking with watchPosition
 * Sends location updates to backend every time position changes
 */
export async function startDonorTracking(
  donorId: string,
  centerLat: number,
  centerLon: number,
  onLocationUpdate?: (lat: number, lng: number) => void,
  onArrival?: () => void
): Promise<void> {
  if (!navigator.geolocation) {
    throw new Error('GPS not supported on this device');
  }

  watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;

      // Send to backend
      try {
        await fetch('/api/donor-location/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donorId,
            lat,
            lng,
            timestamp: Date.now()
          })
        });
      } catch (e) {
        console.error('Failed to send location:', e);
      }

      // Check geofence arrival (200 meters)
      const dist = getDistanceMeters(lat, lng, centerLat, centerLon);
      if (dist < 200 && onArrival) {
        onArrival();
      }

      // Callback for UI updates
      if (onLocationUpdate) {
        onLocationUpdate(lat, lng);
      }
    },
    (err) => {
      console.error('GPS error:', err.message);
      throw new Error('GPS error: ' + err.message);
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );
}

/**
 * Stop donor GPS tracking
 */
export function stopDonorTracking(donorId: string): void {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  // Clear location from backend
  fetch('/api/donor-location/clear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ donorId })
  }).catch(err => console.error('Failed to clear location:', err));
}

/**
 * Check if tracking is currently active
 */
export function isTrackingActive(): boolean {
  return watchId !== null;
}

/**
 * Calculate distance between two coordinates in meters (Haversine formula)
 */
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
