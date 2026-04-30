'use client';

import { useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icons in Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface Marker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type?: 'donor' | 'hospital' | 'user';
  hospitalData?: any;
}

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Marker[];
  height?: string;
  onMarkerClick?: (marker: Marker) => void;
  showUserLocation?: boolean;
  showRoute?: boolean;
  routeFrom?: [number, number];
  routeTo?: [number, number];
  onRouteFound?: (instructions: any[]) => void;
}

export default function LeafletMap({
  center = [23.8103, 90.4125], // Default: Dhaka, Bangladesh
  zoom = 7,
  markers = [],
  height = '500px',
  onMarkerClick,
  showUserLocation = false,
  showRoute = false,
  routeFrom,
  routeTo,
  onRouteFound,
}: LeafletMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [tilesLoading, setTilesLoading] = useState(true);
  const [tilesError, setTilesError] = useState(false);
  const [routeControl, setRouteControl] = useState<any>(null);
  const [routingError, setRoutingError] = useState<string | null>(null);
  const [routingAttempts, setRoutingAttempts] = useState(0);
  const [maxAttempts] = useState(3);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const container = document.getElementById('map-container');
    if (!container) return;

    // Initialize map
    const mapInstance = L.map('map-container', {
      center,
      zoom,
      zoomControl: true,
    });

    // Add tile layer - uses OpenStreetMap which can work with cached tiles
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      // Try to use cached tiles when offline
      crossOrigin: true,
    });

    tileLayer.on('loading', () => setTilesLoading(true));
    tileLayer.on('load', () => setTilesLoading(false));
    tileLayer.on('tileerror', () => {
      setTilesLoading(false);
      setTilesError(true);
    });

    tileLayer.addTo(mapInstance);
    setMap(mapInstance);

    // Force map to invalidate size after rendering - with safety check
    const invalidateTimer = setTimeout(() => {
      if (mapInstance && mapInstance._container) {
        try {
          mapInstance.invalidateSize();
        } catch (error) {
          // Error handled silently - map size invalidation failed
        }
      }
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(invalidateTimer);
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (map && center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  // Add markers
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add new markers
    markers.forEach((marker) => {
      const icon = getMarkerIcon(marker.type);
      const markerInstance = L.marker([marker.lat, marker.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 200px;">
            <strong>${marker.title}</strong>
            ${marker.description ? `<p style="margin: 5px 0 0 0; font-size: 13px;">${marker.description}</p>` : ''}
          </div>
        `);

      if (onMarkerClick) {
        markerInstance.on('click', () => onMarkerClick(marker));
      }
    });

    // Add user location marker if enabled
    if (showUserLocation && userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<div style="background: #2196F3; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker(userLocation, { icon: userIcon }).addTo(map);
    }
  }, [map, markers, userLocation, showUserLocation, onMarkerClick]);

  // Retry routing
  const retryRouting = useCallback(() => {
    setRoutingAttempts(0);
    setRoutingError(null);
    if (routeControl) {
      map?.removeControl(routeControl);
      setRouteControl(null);
    }
  }, [routeControl, map]);

  // Handle routing with Mapbox/OSRM fallback + error handling
  useEffect(() => {
    if (!map || !showRoute || !routeFrom || !routeTo) {
      if (routeControl) {
        map.removeControl(routeControl);
        setRouteControl(null);
      }
      return;
    }

    if (routingAttempts >= maxAttempts) {
      setRoutingError('Routing service unavailable after 3 attempts');
      return;
    }

    if (routeControl) {
      map.removeControl(routeControl);
    }

    // Use Mapbox routing if token available, otherwise OSRM
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const useMapbox = !!mapboxToken;

    let routingTimeout: NodeJS.Timeout;

    const routingControl = (L as any).Routing.control({
      waypoints: [L.latLng(routeFrom[0], routeFrom[1]), L.latLng(routeTo[0], routeTo[1])],
      routeWhileDragging: false,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#2196F3', weight: 5, opacity: 0.7 }],
      },
      router: useMapbox
        ? L.Routing.mapbox(mapboxToken, { profile: 'mapbox/driving' })
        : L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
          }),
    }).addTo(map);

    setRouteControl(routingControl);
    setRoutingAttempts(prev => prev + 1);

    // Timeout for routing
    routingTimeout = setTimeout(() => {
      if (routingAttempts < maxAttempts - 1) {
        // Retry automatically
        map.removeControl(routingControl);
        setRouteControl(null);
        retryRouting();
      } else {
        setRoutingError('Routing timed out. Please try again or use Google Maps.');
      }
    }, 10000); // 10 second timeout

    routingControl.on('routesfound', (e: any) => {
      clearTimeout(routingTimeout);
      setRoutingError(null);
      if (onRouteFound && e.routes && e.routes[0]) {
        onRouteFound(e.routes[0].instructions);
      }
    });

    routingControl.on('routingerror', (e: any) => {
      clearTimeout(routingTimeout);
      console.error('Routing error:', e);
      
      if (routingAttempts < maxAttempts) {
        // Retry automatically after 2 seconds
        setTimeout(() => {
          map.removeControl(routingControl);
          setRouteControl(null);
        }, 2000);
      } else {
        setRoutingError('Unable to calculate route. Please try again or use Google Maps.');
      }
    });

    return () => {
      clearTimeout(routingTimeout);
      if (routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, showRoute, routeFrom, routeTo, onRouteFound, routeControl, routingAttempts, maxAttempts, retryRouting]);

  // Get user location
  useEffect(() => {
    if (!showUserLocation) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          if (map) {
            map.setView([latitude, longitude], 15);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [showUserLocation, map]);

  function getMarkerIcon(type?: string) {
    const colors: Record<string, string> = {
      donor: '#e53935',
      hospital: '#2196F3',
      user: '#4CAF50',
    };
    const color = colors[type || 'donor'] || '#e53935';

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  }

  return (
    <div style={{ position: 'relative', height }}>
      <div id="map-container" style={{ height: '100%', width: '100%' }}></div>
      
      {tilesLoading && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          fontSize: '12px',
          zIndex: 1000,
        }}>
          Loading map tiles...
        </div>
      )}

      {tilesError && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: '#ffebee',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          fontSize: '12px',
          zIndex: 1000,
          color: '#c62828',
        }}>
          Map tiles unavailable. Check your internet connection.
        </div>
      )}

      {isOffline && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          background: '#fff3e0',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          fontSize: '12px',
          zIndex: 1000,
          color: '#e65100',
        }}>
          ⚠️ Offline mode - cached tiles only
        </div>
      )}

      {/* Routing Error UI */}
      {showRoute && routingError && routeFrom && routeTo && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ffebee',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontSize: '14px',
          zIndex: 1000,
          color: '#c62828',
          textAlign: 'center',
          maxWidth: '90%',
          width: '400px',
        }}>
          <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
            ⚠️ {routingError}
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={retryRouting}
              style={{
                padding: '8px 16px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              🔄 Retry
            </button>
            <a
              href={`https://www.google.com/maps/dir/${routeFrom[0]},${routeFrom[1]}/${routeTo[0]},${routeTo[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              🗺️ Open in Google Maps
            </a>
          </div>
        </div>
      )}

      {/* Routing loading indicator */}
      {showRoute && !routingError && routingAttempts > 0 && !routeControl && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#e3f2fd',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontSize: '13px',
          zIndex: 1000,
          color: '#1976D2',
          textAlign: 'center',
        }}>
          🔄 Calculating route (attempt {routingAttempts}/{maxAttempts})...
        </div>
      )}
    </div>
  );
}
