'use client';

import React from 'react';

const OfflineMap = () => {
  return (
    <div className="offline-map-container">
      <div className="map-placeholder">
        <svg width="100%" height="400" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="400" fill="#F5F5F5"/>
          <circle cx="400" cy="200" r="120" fill="#C0152A" opacity="0.1"/>
          <circle cx="400" cy="200" r="80" fill="#C0152A" opacity="0.2"/>
          <circle cx="400" cy="200" r="40" fill="#C0152A"/>
          <text x="400" y="350" textAnchor="middle" fill="#666" fontSize="16">Interactive Map Coming Soon</text>
        </svg>
      </div>
    </div>
  );
};

export default OfflineMap;
