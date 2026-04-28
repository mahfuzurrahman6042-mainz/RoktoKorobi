'use client';

import dynamic from 'next/dynamic';

// Dynamically import Leaflet to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <div style={{ height: '400px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map...</div>
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

export default function OfflineMap(props: OfflineMapProps) {
  return <LeafletMap {...props} />;
}
