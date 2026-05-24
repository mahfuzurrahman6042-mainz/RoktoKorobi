'use client';

import React, { useEffect, useRef } from 'react';

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    description: string;
    type: string;
  }>;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ 
  center = [23.6850, 90.3563], 
  zoom = 7, 
  height = '400px',
  markers = [] 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load map on client side
    if (typeof window !== 'undefined') {
      // This would normally initialize Leaflet map
      // For now, we'll show a placeholder
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div class="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <div class="text-gray-500 mb-2">
                <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <p class="text-gray-600">Interactive Map</p>
              <p class="text-sm text-gray-500">Find blood donors near you</p>
            </div>
          </div>
        `;
      }
    }
  }, []);

  return (
    <div 
      ref={mapRef} 
      className="w-full bg-gray-100 rounded-lg flex items-center justify-center"
      style={{ height: height, minHeight: height }}
    >
      <div className="text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <p className="text-gray-600">Interactive Map Coming Soon</p>
        <p className="text-sm text-gray-500">Find blood donors in your area</p>
      </div>
    </div>
  );
};

export default LeafletMap;
