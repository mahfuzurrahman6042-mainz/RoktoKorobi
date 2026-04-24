'use client';

import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Marker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  type?: 'donor' | 'hospital' | 'user';
}

interface OfflineMapProps {
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

export default function OfflineMap({
  center = [23.8103, 90.4125], // Default: Dhaka, Bangladesh
  zoom = 13,
  markers = [],
  height = '400px',
  onMarkerClick,
  showUserLocation = false,
  showRoute = false,
  routeFrom,
  routeTo,
  onRouteFound,
}: OfflineMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [tilesLoading, setTilesLoading] = useState(true);
  const [tilesError, setTilesError] = useState(false);
  const [routeControl, setRouteControl] = useState<any>(null);

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
    if (!document.getElementById('map-container')) return;

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

    // Force map to invalidate size after rendering
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 100);

    // Cleanup
    return () => {
      mapInstance.remove();
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

      L.marker(userLocation, { icon: userIcon })
        .addTo(map)
        .bindPopup('<strong>Your Location</strong>');
    }
  }, [markers, map, onMarkerClick, showUserLocation, userLocation]);

  // Get user location if requested
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          if (map) {
            map.setView([latitude, longitude], zoom);
          }
        },
        (error) => {
          // Silently handle geolocation errors - user may have denied permission
          // Don't log to console to avoid cluttering
          setUserLocation(null);
        }
      );
    }
  }, [showUserLocation, map, zoom]);

  // Add routing control when route points are provided
  useEffect(() => {
    if (!map || !showRoute || !routeFrom || !routeTo) return;

    // Remove existing route control if any
    if (routeControl) {
      map.removeControl(routeControl);
      setRouteControl(null);
    }

    // Add new route control
    const control = (L as any).Routing.control({
      waypoints: [
        L.latLng(routeFrom[0], routeFrom[1]),
        L.latLng(routeTo[0], routeTo[1])
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      router: (L as any).Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      lineOptions: {
        styles: [{ color: '#E53935', weight: 6, opacity: 0.8 }]
      },
      createMarker: (i: number, waypoint: any, n: number) => {
        const icon = i === 0 ? getMarkerIcon('user') : getMarkerIcon('hospital');
        return L.marker(waypoint.latLng, { icon });
      }
    }).addTo(map);

    // Get route instructions when route is calculated
    control.on('routesfound', (e: any) => {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const instructions = routes[0].instructions;
        if (onRouteFound) {
          onRouteFound(instructions);
        }
      }
    });

    setRouteControl(control);

    // Cleanup
    return () => {
      if (control) {
        map.removeControl(control);
      }
    };
  }, [map, showRoute, routeFrom, routeTo, onRouteFound]);

  function getMarkerIcon(type?: string): L.Icon {
    const colors = {
      donor: '#E53935',
      hospital: '#4CAF50',
      user: '#2196F3',
    };

    const color = type ? colors[type as keyof typeof colors] || '#E53935' : '#E53935';

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">${type === 'donor' ? '🩸' : type === 'hospital' ? '🏥' : '📍'}</div>
      </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
  }

  return (
    <div style={{ position: 'relative' }}>
      {isOffline && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          background: '#FF9800',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        }}>
          ⚠️ Offline Mode - Using cached map data
        </div>
      )}
      {tilesLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          textAlign: 'center',
          color: '#666',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
          <p>Loading map...</p>
        </div>
      )}
      {tilesError && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          background: '#F44336',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        }}>
          ⚠️ Map tiles failed to load. Check your internet connection.
        </div>
      )}
      <div
        id="map-container"
        style={{
          height,
          width: '100%',
          borderRadius: '8px',
          border: '1px solid #ddd',
          backgroundColor: '#e5e3df',
        }}
      />
      {markers.length === 0 && !showUserLocation && !tilesLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#666',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🗺️</div>
          <p>No locations to display</p>
        </div>
      )}
    </div>
  );
}
