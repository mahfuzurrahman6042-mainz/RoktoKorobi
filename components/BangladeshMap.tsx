"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface BangladeshMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  donors: Array<{
    id: number;
    name: string;
    bloodGroup: string;
    location: string;
    lat: number;
    lng: number;
    available: boolean;
    phone: string;
  }>;
  hospitals: Array<{
    id: number;
    name: string;
    lat: number;
    lng: number;
    emergency: boolean;
    bloodNeeded: string | null;
  }>;
}

export default function BangladeshMap({ center, zoom, donors = [], hospitals = [] }: BangladeshMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);

  // Initialize map once only
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    try {
      const map = L.map(mapRef.current, {
        center: [23.6850, 90.3563],
        zoom: 7,
        scrollWheelZoom: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);
      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 300);
      setTimeout(() => map.invalidateSize(), 800);
    } catch (error) {
      console.error('Map init error:', error);
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // empty deps — init once only

  // Update view when props change
  useEffect(() => {
    if (mapInstanceRef.current && center?.lat && center?.lng) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || !donors || !hospitals) return;

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      markersRef.current = [];

      // Add individual donor markers with blood group icons
      donors.forEach((donor) => {
        const bloodGroupColors: Record<string, string> = {
          'A+': '#ef4444',
          'A-': '#f97316',
          'B+': '#eab308',
          'B-': '#84cc16',
          'AB+': '#22c55e',
          'AB-': '#14b8a6',
          'O+': '#06b6d4',
          'O-': '#3b82f6'
        };

        const bgColor = bloodGroupColors[donor.bloodGroup] || '#dc2626';
        const textColor = donor.available ? '#ffffff' : '#9ca3af';

        const donorIcon = L.divIcon({
          html: `
            <div style="
              background: ${donor.available ? bgColor : '#6b7280'};
              color: ${textColor};
              padding: 4px 10px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              white-space: nowrap;
              cursor: pointer;
              ${!donor.available ? 'opacity: 0.6;' : ''}
            ">
              ${donor.bloodGroup}
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [50, 28],
          iconAnchor: [25, 14],
        });

        const marker = L.marker([donor.lat, donor.lng], { icon: donorIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="font-family: 'Inter', sans-serif; padding: 12px; min-width: 180px;">
              <h4 style="margin: 0 0 8px 0; color: #111111; font-size: 15px; font-weight: 700;">
                ${donor.name || 'Donor'}
              </h4>
              <p style="margin: 4px 0; color: #6b6b6b; font-size: 12px;">
                <strong>রক্তের গ্রুপ:</strong> <span style="color: ${bgColor}; font-weight: 600;">${donor.bloodGroup}</span>
              </p>
              <p style="margin: 4px 0; color: #6b6b6b; font-size: 12px;">
                <strong>অবস্থান:</strong> ${donor.location || 'Unknown'}
              </p>
              <p style="margin: 4px 0; color: ${donor.available ? '#22c55e' : '#ef4444'}; font-size: 12px; font-weight: 600;">
                ${donor.available ? '✓ উপলব্ধ' : '✗ অনুপলব্ধ'}
              </p>
            </div>
          `);

        markersRef.current.push(marker);
      });

    // Add hospital markers
    hospitals.forEach(hospital => {
      const hospitalIcon = L.divIcon({
        html: `
          <div style="
            background: ${hospital.emergency ? '#dc2626' : '#2563eb'};
            color: white;
            padding: 6px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            🏥 ${hospital.bloodNeeded || 'হাসপাতাল'}
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [120, 30],
        iconAnchor: [60, 15],
      });

      const marker = L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="font-family: 'Inter', sans-serif; padding: 8px;">
            <h4 style="margin: 0 0 8px 0; color: #111111; font-size: 14px; font-weight: 600;">
              ${hospital.name}
            </h4>
            <p style="margin: 4px 0; color: #6b6b6b; font-size: 12px;">
              <strong>ধরন:</strong> ${hospital.emergency ? 'জরুরি বিভাগ' : 'সাধারণ বিভাগ'}
            </p>
            ${hospital.bloodNeeded ? `
              <p style="margin: 4px 0; color: #dc2626; font-size: 12px; font-weight: 600;">
                রক্ত প্রয়োজন: ${hospital.bloodNeeded}
              </p>
            ` : '<p style="margin: 4px 0; color: #6b6b6b; font-size: 12px;">বর্তমানে রক্তের প্রয়োজন নেই</p>'}
          </div>
        `);

      markersRef.current.push(marker);
    });
    } catch (error) {
      console.error('Error adding markers:', error);
    }
  }, [donors, hospitals]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '0',
      }}
    />
  );
}
