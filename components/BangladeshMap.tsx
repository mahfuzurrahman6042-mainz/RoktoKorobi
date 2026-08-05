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

      // Group donors by location and count blood groups
      const locationGroups = donors.reduce((acc, donor) => {
        const location = donor.location || 'Unknown';
        if (!acc[location]) {
          acc[location] = {
            location,
            lat: donor.lat,
            lng: donor.lng,
            bloodGroups: {} as Record<string, number>,
            totalDonors: 0,
            availableDonors: 0
          };
        }
        acc[location].bloodGroups[donor.bloodGroup] = (acc[location].bloodGroups[donor.bloodGroup] || 0) + 1;
        acc[location].totalDonors++;
        if (donor.available) acc[location].availableDonors++;
        return acc;
      }, {} as Record<string, any>);

      // Add location-based markers with blood group counts
      Object.values(locationGroups).forEach((group: any) => {
        const bloodGroupsList = Object.entries(group.bloodGroups)
          .map(([bg, count]) => `${bg}: ${count}`)
          .join(', ');

        const locationIcon = L.divIcon({
          html: `
            <div style="
              background: #dc2626;
              color: white;
              padding: 6px 12px;
              border-radius: 16px;
              font-size: 13px;
              font-weight: bold;
              border: 3px solid white;
              box-shadow: 0 4px 8px rgba(0,0,0,0.3);
              white-space: nowrap;
              cursor: pointer;
            ">
              🩸 ${group.availableDonors}/${group.totalDonors}
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [80, 35],
          iconAnchor: [40, 17],
        });

        const marker = L.marker([group.lat, group.lng], { icon: locationIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="font-family: 'Inter', sans-serif; padding: 12px; min-width: 200px;">
              <h4 style="margin: 0 0 10px 0; color: #111111; font-size: 16px; font-weight: 700;">
                ${group.location}
              </h4>
              <p style="margin: 8px 0; color: #6b6b6b; font-size: 13px;">
                <strong>মোট দাতা:</strong> ${group.totalDonors}
              </p>
              <p style="margin: 8px 0; color: #22c55e; font-size: 13px;">
                <strong>উপলব্ধ:</strong> ${group.availableDonors}
              </p>
              <div style="margin: 12px 0; padding: 10px; background: #fef2f2; border-radius: 8px;">
                <p style="margin: 0 0 8px 0; color: #dc2626; font-size: 13px; font-weight: 600;">
                  রক্তের গ্রুপ বিবরণ:
                </p>
                ${Object.entries(group.bloodGroups).map(([bg, count]) => `
                  <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 12px; color: #333;">
                    <span style="font-weight: 600; color: #dc2626;">${bg}</span>
                    <span>${count} জন</span>
                  </div>
                `).join('')}
              </div>
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
