"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character] || character));

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
    id: string | number;
    name: string;
    bloodGroup: string;
    location: string;
    lat: number;
    lng: number;
    available: boolean;
    phone?: string;
  }>;
  hospitals?: Array<{
    id: string | number;
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
        center: [center.lat, center.lng],
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
        minZoom: 4,
        // District centroids are approximate; deep zoom would imply a home address.
        maxZoom: 12,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);
      mapInstanceRef.current = map;
      const invalidateSize = () => map.invalidateSize({ pan: false });
      const resizeObserver = typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(invalidateSize)
        : null;
      resizeObserver?.observe(mapRef.current);
      requestAnimationFrame(invalidateSize);
      const firstResize = setTimeout(invalidateSize, 300);
      const secondResize = setTimeout(invalidateSize, 800);
      return () => {
        clearTimeout(firstResize);
        clearTimeout(secondResize);
        resizeObserver?.disconnect();
        map.remove();
        mapInstanceRef.current = null;
      };
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
    if (mapInstanceRef.current && Number.isFinite(center?.lat) && Number.isFinite(center?.lng)) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || !donors || !hospitals) return;

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
      markersRef.current = [];

      // Group donors who share a district centroid so none hide behind another.
      const districtGroups = new Map<string, typeof donors>();
      donors.forEach(donor => {
        if (!Number.isFinite(donor.lat) || !Number.isFinite(donor.lng)) return;
        const key = `${donor.lat}:${donor.lng}`;
        districtGroups.set(key, [...(districtGroups.get(key) || []), donor]);
      });
      districtGroups.forEach(group => {
        const donor = group[0];
        const groupAvailable = group.some(entry => entry.available);
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

        const bgColor = group.length > 1 ? '#A5102F' : (bloodGroupColors[donor.bloodGroup] || '#dc2626');
        const textColor = groupAvailable ? '#ffffff' : '#9ca3af';
        const groupCounts = group.reduce<Record<string, number>>((counts, entry) => {
          counts[entry.bloodGroup] = (counts[entry.bloodGroup] || 0) + 1;
          return counts;
        }, {});
        const bloodGroupsLabel = Object.entries(groupCounts).map(([bloodGroup, count]) => `${escapeHtml(bloodGroup)}: ${count}`).join(', ');

        const markerLabel = group.length > 1
          ? `${group.length} donors`
          : `1 donor · ${escapeHtml(donor.bloodGroup)}`;
        const donorIcon = L.divIcon({
          html: `
            <div style="
              background: ${groupAvailable ? bgColor : '#6b7280'};
              color: ${textColor};
              padding: 4px 10px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              white-space: nowrap;
              cursor: pointer;
              ${!groupAvailable ? 'opacity: 0.6;' : ''}
            ">
              📍 ${markerLabel}
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [112, 28],
          iconAnchor: [56, 14],
        });

        const marker = L.marker([donor.lat, donor.lng], { icon: donorIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="font-family: 'Inter', sans-serif; padding: 12px; min-width: 180px;">
              <h4 style="margin: 0 0 8px 0; color: #111111; font-size: 15px; font-weight: 700;">
                ${group.length} donor${group.length === 1 ? '' : 's'} in ${escapeHtml(donor.location || 'this district')}
              </h4>
              <p style="margin: 4px 0; color: #6b6b6b; font-size: 12px;">
                <strong>রক্তের গ্রুপ:</strong> <span style="color: ${bgColor}; font-weight: 600;">${bloodGroupsLabel}</span>
              </p>
              <p style="margin: 4px 0; color: #6b6b6b; font-size: 12px;">
                <strong>অবস্থান:</strong> ${escapeHtml(donor.location || 'Unknown')}
              </p>
              <p style="margin: 4px 0; color: #6B5A50; font-size: 12px; font-weight: 600;">
                District-level location only. Check current availability before arranging a donation.
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
            🏥 ${escapeHtml(hospital.bloodNeeded || 'হাসপাতাল')}
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
              ${escapeHtml(hospital.name)}
            </h4>
            <p style="margin: 4px 0; color: #6b6b6b; font-size: 12px;">
              <strong>ধরন:</strong> ${hospital.emergency ? 'জরুরি বিভাগ' : 'সাধারণ বিভাগ'}
            </p>
            ${hospital.bloodNeeded ? `
              <p style="margin: 4px 0; color: #dc2626; font-size: 12px; font-weight: 600;">
                রক্ত প্রয়োজন: ${escapeHtml(hospital.bloodNeeded)}
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
    <>
      <div ref={mapRef} aria-label="Public donor map with district-level locations" style={{ width: '100%', height: '100%', borderRadius: '0' }} />
      <style jsx global>{`.leaflet-control-zoom a { width: 44px !important; height: 44px !important; line-height: 44px !important; font-size: 24px !important; }`}</style>
    </>
  );
}
