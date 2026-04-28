'use client';

import { useState, useEffect } from 'react';
import OfflineMap from '@/components/OfflineMap';
import Link from 'next/link';
import { getGPSLocation, geocode, getDistanceMeters } from '@/lib/geolocation-utils';

export default function NavigationPage() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: 'Navigation', bn: 'নেভিগেশন' },
      donorMode: { en: 'Donor Mode', bn: 'রক্তদাতা মোড' },
      recipientMode: { en: 'Recipient Mode', bn: 'প্রাপক মোড' },
      getLocation: { en: 'Get My Location', bn: 'আমার অবস্থান পান' },
      searchHospital: { en: 'Search Hospital', bn: 'হাসপাতাল অনুসন্ধান' },
    };
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
  }, []);
  const [mode, setMode] = useState<'donor' | 'recipient'>('donor');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [routeInstructions, setRouteInstructions] = useState<any[]>([]);
  const [showRoute, setShowRoute] = useState(false);
  const [trackingDonorId, setTrackingDonorId] = useState<string | null>(null);
  const [donorLocation, setDonorLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null);
  const [offlineWarningCount, setOfflineWarningCount] = useState(0);
  const [donorDistance, setDonorDistance] = useState<string>('');

  const handleGetLocation = async () => {
    try {
      const location = await getGPSLocation();
      setUserLocation([location.lat, location.lon]);
      setLocationError(null);
      setShowManualInput(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown location error';
      setUserLocation(null);
      setLocationError(errorMessage);
      setShowManualInput(true);
    }
  };

  const handleGeocodeLocation = async () => {
    if (!placeName.trim()) {
      setLocationError('Please enter a location name');
      return;
    }

    setGeocoding(true);
    try {
      const location = await geocode(placeName);
      if (location) {
        setUserLocation([location.lat, location.lon]);
        setLocationError(null);
        setShowManualInput(false);
        setPlaceName('');
        // Reset route when location changes
        setRouteInstructions([]);
        setShowRoute(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to find location';
      setLocationError(errorMessage);
    } finally {
      setGeocoding(false);
    }
  };

  const handleRouteFound = (instructions: any[]) => {
    setRouteInstructions(instructions);
  };

  // Show route when both location and hospital are selected
  useEffect(() => {
    if (userLocation && selectedHospital) {
      setShowRoute(true);
    } else {
      setShowRoute(false);
      setRouteInstructions([]);
    }
  }, [userLocation, selectedHospital]);

  // Start recipient tracking
  const startRecipientTracking = (donorId: string, centerLat: number, centerLon: number) => {
    setTrackingDonorId(donorId);
    setOfflineWarningCount(0);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/donor-location/${donorId}`);
        if (!res.ok) {
          setOfflineWarningCount(prev => prev + 1);
          if (offlineWarningCount >= 6) {
            setLocationError('⚠️ Donor location unavailable — they may be offline');
          }
          return;
        }
        setOfflineWarningCount(0);
        const data = await res.json();
        setDonorLocation({ lat: data.lat, lng: data.lng });

        // Calculate distance to donation center
        const distMeters = getDistanceMeters(data.lat, data.lng, centerLat, centerLon);
        const distKm = (distMeters / 1000).toFixed(1);
        const estMins = Math.round(distMeters / 250);
        setDonorDistance(`🩸 Donor is ${distKm} km away — ~${estMins} mins`);

        // Arrival detection
        if (distMeters < 200) {
          setLocationError('✅ Donor has arrived at the donation center!');
        }
      } catch (err) {
        console.error('Tracking poll failed:', err);
      }
    }, 5000);

    setTrackingInterval(interval);
  };

  // Stop recipient tracking
  const stopRecipientTracking = () => {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
    setTrackingDonorId(null);
    setDonorLocation(null);
    setDonorDistance('');
  };

  // Cleanup tracking on unmount
  useEffect(() => {
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [trackingInterval]);

  // Sample hospital data (in production, this would come from database)
  const hospitals = [
    { id: 1, name: 'Dhaka Medical College Hospital', address: 'Dhaka, Bangladesh', lat: 23.7259, lng: 90.3977, phone: '+880-2-55165088' },
    { id: 2, name: 'Bangabandhu Sheikh Mujib Medical University', address: 'Dhaka, Bangladesh', lat: 23.7315, lng: 90.4018, phone: '+880-2-9661044' },
    { id: 3, name: 'Sir Salimullah Medical College', address: 'Dhaka, Bangladesh', lat: 23.7132, lng: 90.4096, phone: '+880-2-7319971' },
    { id: 4, name: 'Chittagong Medical College Hospital', address: 'Chittagong, Bangladesh', lat: 22.3591, lng: 91.8215, phone: '+880-31-619400' },
    { id: 5, name: 'Rajshahi Medical College Hospital', address: 'Rajshahi, Bangladesh', lat: 24.3733, lng: 88.5853, phone: '+880-721-770350' },
  ];

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '80px 20px 40px' }}>
      <div className="container">
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
          padding: '60px 40px',
          borderRadius: '16px',
          marginBottom: '2rem',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            🗺️ Find Your Way
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.95 }}>
            Navigate to donation centers or track donors with live GPS sharing
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="card" style={{ marginBottom: '2rem', padding: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => setMode('donor')}
              style={{
                padding: '12px 32px',
                background: mode === 'donor' ? '#9C27B0' : '#e0e0e0',
                color: mode === 'donor' ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🩸 Donor Mode
            </button>
            <button
              onClick={() => setMode('recipient')}
              style={{
                padding: '12px 32px',
                background: mode === 'recipient' ? '#9C27B0' : '#e0e0e0',
                color: mode === 'recipient' ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              📍 Recipient Mode
            </button>
          </div>
        </div>

        {mode === 'donor' ? (
          /* Donor Mode - Find Hospitals */
          <div>
            <div className="card" style={{ marginBottom: '2rem', padding: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
                Find Donation Centers
              </h2>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Search hospitals by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
                <button
                  onClick={handleGetLocation}
                  style={{
                    padding: '12px 24px',
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  📍 My Location
                </button>
                <button
                  onClick={() => setShowManualInput(!showManualInput)}
                  style={{
                    padding: '12px 24px',
                    background: showManualInput ? '#9E9E9E' : '#757575',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Manual
                </button>
              </div>
              {locationError && (
                <div style={{ padding: '12px', background: '#FFF3E0', borderRadius: '8px', marginBottom: '16px', color: '#E65100', fontSize: '0.9rem' }}>
                  ⚠️ {locationError}
                </div>
              )}
              {showManualInput && (
                <div style={{ padding: '16px', background: '#F5F5F5', borderRadius: '8px', marginBottom: '16px' }}>
                  <h4 style={{ marginBottom: '12px', color: '#333' }}>Enter Your Starting Location</h4>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '12px' }}>
                    Type your area name (e.g., baunia, gulshan, mirpur, dhanmondi) and we'll find it on the map
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="e.g., baunia, dhaka medical, gulshan 1..."
                      value={placeName}
                      onChange={(e) => setPlaceName(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                    <button
                      onClick={handleGeocodeLocation}
                      disabled={geocoding}
                      style={{
                        padding: '12px 24px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: geocoding ? 'not-allowed' : 'pointer',
                        opacity: geocoding ? 0.6 : 1
                      }}
                    >
                      {geocoding ? 'Finding...' : '📍 Find on Map'}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {filteredHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    onClick={() => setSelectedHospital(hospital)}
                    style={{
                      padding: '16px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      background: selectedHospital?.id === hospital.id ? '#E3F2FD' : 'white',
                      transition: 'background 0.2s'
                    }}
                  >
                    <h3 style={{ margin: '0 0 8px 0', color: '#212121' }}>{hospital.name}</h3>
                    <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.9rem' }}>{hospital.address}</p>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>📞 {hospital.phone}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '16px', color: '#212121' }}>
                {selectedHospital ? `Route to ${selectedHospital.name}` : 'Select a hospital to see route'}
              </h3>
              <OfflineMap
                center={selectedHospital ? [selectedHospital.lat, selectedHospital.lng] : [23.8103, 90.4125]}
                zoom={selectedHospital ? 15 : 13}
                height="400px"
                markers={selectedHospital ? [
                  {
                    id: 'hospital',
                    lat: selectedHospital.lat,
                    lng: selectedHospital.lng,
                    title: selectedHospital.name,
                    description: selectedHospital.address,
                    type: 'hospital'
                  },
                  ...(userLocation ? [{
                    id: 'user',
                    lat: userLocation[0],
                    lng: userLocation[1],
                    title: 'Your Location',
                    type: 'user' as const
                  }] : [])
                ] : []}
                showUserLocation={true}
                showRoute={showRoute}
                routeFrom={userLocation}
                routeTo={selectedHospital ? [selectedHospital.lat, selectedHospital.lng] : undefined}
                onRouteFound={handleRouteFound}
              />
              {selectedHospital && userLocation && (
                <div style={{ marginTop: '16px', padding: '16px', background: '#E8F5E9', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2E7D32' }}>Route Information</h4>
                  <p style={{ margin: 0, color: '#333' }}>
                    🏥 Destination: {selectedHospital.name}<br />
                    📍 Distance: ~{Math.round(Math.sqrt(
                      Math.pow(selectedHospital.lat - userLocation[0], 2) +
                      Math.pow(selectedHospital.lng - userLocation[1], 2)
                    ) * 111)} km away
                  </p>
                  
                  {/* Turn-by-turn directions */}
                  {routeInstructions.length > 0 && (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 12px 0', color: '#212121' }}>🗺️ Step-by-Step Directions</h5>
                      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {routeInstructions.map((instruction, index) => (
                          <div key={index} style={{ 
                            padding: '8px', 
                            background: index === 0 ? '#E3F2FD' : '#F5F5F5',
                            borderRadius: '4px',
                            marginBottom: '8px',
                            border: index === 0 ? '2px solid #2196F3' : '1px solid #ddd',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px'
                          }}>
                            <div style={{
                              minWidth: '24px',
                              height: '24px',
                              background: index === 0 ? '#2196F3' : '#757575',
                              color: 'white',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.8rem'
                            }}>
                              {index + 1}
                            </div>
                            <div>
                              <div style={{ fontWeight: 'bold', color: '#212121', fontSize: '0.9rem', marginBottom: '2px' }}>
                                {instruction.text}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                {instruction.distance && `${instruction.distance.toFixed(0)}m`}
                                {instruction.distance && instruction.time && ' • '}
                                {instruction.time && `${(instruction.time / 60).toFixed(1)} min`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <a
                    href={`https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${selectedHospital.lat},${selectedHospital.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '12px',
                      padding: '10px 20px',
                      background: '#4CAF50',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}
                  >
                    Get Directions on Google Maps →
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Recipient Mode - Track Donor */
          <div>
            <div className="card" style={{ marginBottom: '2rem', padding: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
                Track Donor Location
              </h2>
              <p style={{ color: '#666', marginBottom: '16px' }}>
                Enter the request ID to track the donor's live location. The donor must have consented to share their location.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Enter request ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
                <button
                  onClick={() => {
                    if (searchQuery) {
                      // In production, fetch the blood request to get donor ID and donation center
                      // For now, use a simulated donor ID
                      const donorId = searchQuery; // In production, this would be the actual donor ID from the request
                      const centerLat = 23.7259; // Donation center lat
                      const centerLon = 90.3977; // Donation center lon
                      
                      setSelectedHospital({
                        id: 'tracking',
                        name: 'Donation Center',
                        address: 'Live tracking',
                        lat: centerLat,
                        lng: centerLon,
                        phone: 'N/A'
                      });
                      
                      startRecipientTracking(donorId, centerLat, centerLon);
                    }
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#9C27B0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Track Donor
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#999' }}>
                Note: Location sharing requires explicit donor consent for each request. The donor can revoke access at any time.
              </p>
            </div>

            {selectedHospital && (
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: '#212121' }}>
                    📍 Live Donor Tracking
                  </h3>
                  <span style={{ padding: '6px 12px', background: '#4CAF50', color: 'white', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    ● Live
                  </span>
                </div>
                
                {donorDistance && (
                  <div style={{ marginBottom: '16px', padding: '12px', background: '#E3F2FD', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', color: '#1976D2' }}>
                    {donorDistance}
                  </div>
                )}
                
                <OfflineMap
                  center={donorLocation ? [donorLocation.lat, donorLocation.lng] : [selectedHospital.lat, selectedHospital.lng]}
                  zoom={14}
                  height="500px"
                  markers={[
                    {
                      id: 'hospital',
                      lat: selectedHospital.lat,
                      lng: selectedHospital.lng,
                      title: selectedHospital.name,
                      description: selectedHospital.address,
                      type: 'hospital'
                    },
                    ...(donorLocation ? [{
                      id: 'donor',
                      lat: donorLocation.lat,
                      lng: donorLocation.lng,
                      title: 'Donor',
                      description: 'Live location',
                      type: 'donor' as const
                    }] : [])
                  ]}
                  showUserLocation={false}
                />
                
                {locationError && (
                  <div style={{ marginTop: '16px', padding: '12px', background: offlineWarningCount >= 6 ? '#FFF3E0' : '#E8F5E9', borderRadius: '8px', color: offlineWarningCount >= 6 ? '#E65100' : '#2E7D32', fontSize: '0.9rem' }}>
                    {locationError}
                  </div>
                )}
                
                {!donorLocation && !locationError && (
                  <div style={{ marginTop: '16px', padding: '12px', background: '#E3F2FD', borderRadius: '8px', color: '#1976D2', fontSize: '0.9rem' }}>
                    Waiting for donor to share location...
                  </div>
                )}
                
                <div style={{ marginTop: '16px' }}>
                  <button
                    onClick={() => {
                      setSelectedHospital(null);
                      stopRecipientTracking();
                      setLocationError(null);
                    }}
                    style={{
                      padding: '12px 24px',
                      background: '#F44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Stop Tracking
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
