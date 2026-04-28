'use client';

import { useState, useEffect } from 'react';
import OfflineMap from '@/components/OfflineMap';
import DonationConfirmation from '@/components/DonationConfirmation';
import { startDonorTracking, stopDonorTracking, isTrackingActive } from '@/lib/donor-tracking';
import { subscribeToDonorLocation, unsubscribeFromDonorLocation } from '@/lib/realtime-tracking';

interface DonorLocation {
  donorId: string;
  lat: number;
  lng: number;
  timestamp: string;
  bloodGroup: string;
  status: string;
}

export default function TrackDonorPage({ params }: { params: Promise<{ requestId: string }> }) {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [requestStatus, setRequestStatus] = useState<string>('pending');

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: 'Track Donor', bn: 'রক্তদাতা ট্র্যাক করুন' },
      loading: { en: 'Loading...', bn: 'লোড হচ্ছে...' },
      error: { en: 'Failed to load tracking data', bn: 'ট্র্যাকিং ডেটা লোড করতে ব্যর্থ' },
    };
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();
      setCurrentUser(result.user);
    } catch (err) {
      setCurrentUser(null);
    }
  };

  const [requestId, setRequestId] = useState<string>('');
  const [donorLocation, setDonorLocation] = useState<DonorLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [arrivalDetected, setArrivalDetected] = useState(false);
  const [hospitalLocation, setHospitalLocation] = useState<[number, number] | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

  useEffect(() => {
    params.then(p => setRequestId(p.requestId));
  }, [params]);

  // Fetch blood request details and donor location
  useEffect(() => {
    if (!requestId) return;

    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch blood request to get hospital location
        const response = await fetch(`/api/blood-requests/${requestId}`);
        if (!response.ok) throw new Error('Failed to fetch request');
        
        const requestData = await response.json();
        
        if (requestData.hospital_latitude && requestData.hospital_longitude) {
          setHospitalLocation([requestData.hospital_latitude, requestData.hospital_longitude]);
        }

        // Set request status
        setRequestStatus(requestData.status || 'pending');

        // If donor accepted, fetch their live location
        if (requestData.accepted_donor_id) {
          fetchDonorLocation(requestData.accepted_donor_id);
        } else {
          setError('No donor has accepted this request yet');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId]);

  // Subscribe to real-time donor location updates
  useEffect(() => {
    if (!donorLocation?.donorId) return;

    const channel = subscribeToDonorLocation(donorLocation.donorId, (location) => {
      setDonorLocation({
        donorId: location.donor_id,
        lat: location.lat,
        lng: location.lng,
        timestamp: location.updated_at,
        bloodGroup: donorLocation.bloodGroup,
        status: donorLocation.status,
      });

      // Check if donor arrived at hospital (within 200 meters)
      if (hospitalLocation && location.lat && location.lng) {
        const distance = calculateDistance(
          location.lat,
          location.lng,
          hospitalLocation[0],
          hospitalLocation[1]
        );
        if (distance < 200 && !arrivalDetected) {
          setArrivalDetected(true);
          // Mark donor as arrived
          fetch('/api/donor/arrive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ donorId: location.donor_id, requestId })
          });
        }
      }
    });

    setRealtimeChannel(channel);

    return () => {
      unsubscribeFromDonorLocation(channel);
    };
  }, [donorLocation?.donorId, hospitalLocation, arrivalDetected, requestId]);

  const fetchDonorLocation = async (donorId: string) => {
    try {
      const response = await fetch(`/api/donor-location/${donorId}`);
      if (!response.ok) {
        // Donor might not be tracking yet
        return;
      }
      
      const data: DonorLocation = await response.json();
      setDonorLocation(data);

      // Check if donor arrived at hospital (within 200 meters)
      if (hospitalLocation) {
        const distance = calculateDistance(
          data.lat,
          data.lng,
          hospitalLocation[0],
          hospitalLocation[1]
        );
        if (distance < 200 && !arrivalDetected) {
          setArrivalDetected(true);
          // Mark donor as arrived
          await fetch('/api/donor/arrive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ donorId: data.donorId, requestId })
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch donor location:', err);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleStartTracking = async () => {
    if (!donorLocation || !hospitalLocation) return;
    
    try {
      setIsTracking(true);
      await startDonorTracking(
        donorLocation.donorId,
        hospitalLocation[0],
        hospitalLocation[1],
        (lat, lng) => {
          setDonorLocation(prev => prev ? { ...prev, lat, lng, timestamp: new Date().toISOString() } : null);
        },
        () => {
          setArrivalDetected(true);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start tracking');
      setIsTracking(false);
    }
  };

  const handleStopTracking = () => {
    if (donorLocation) {
      stopDonorTracking(donorLocation.donorId);
      setIsTracking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading tracking information...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#e53935', fontSize: '2rem', marginBottom: '1rem' }}>
        📍 Track Donor Location
      </h1>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f44336',
          color: 'white',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {arrivalDetected && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#4caf50',
          color: 'white',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}>
          ✅ Donor has arrived at the hospital!
        </div>
      )}

      {donorLocation && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Donor Information</h3>
            <p><strong>Blood Group:</strong> {donorLocation.bloodGroup}</p>
            <p><strong>Status:</strong> {donorLocation.status === 'available' ? '🟢 Available' : '🔴 Unavailable'}</p>
            <p><strong>Last Update:</strong> {new Date(donorLocation.timestamp).toLocaleString()}</p>
            {hospitalLocation && donorLocation && (
              <p><strong>Distance to Hospital:</strong> {Math.round(calculateDistance(donorLocation.lat, donorLocation.lng, hospitalLocation[0], hospitalLocation[1]))} meters</p>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={isTracking ? handleStopTracking : handleStartTracking}
              disabled={!hospitalLocation}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isTracking ? '#f44336' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: !hospitalLocation ? 'not-allowed' : 'pointer',
                opacity: !hospitalLocation ? 0.6 : 1,
                marginRight: '0.5rem'
              }}
            >
              {isTracking ? '⏹ Stop Tracking' : '▶ Start Live Tracking'}
            </button>
            
            {isTracking && (
              <span style={{ marginLeft: '1rem', color: '#4caf50', fontWeight: 'bold' }}>
                ● Live Tracking Active
              </span>
            )}
          </div>

          <OfflineMap
            center={donorLocation ? [donorLocation.lat, donorLocation.lng] : [23.8103, 90.4125]}
            zoom={15}
            height="500px"
            markers={[
              ...(donorLocation ? [{
                id: donorLocation.donorId,
                lat: donorLocation.lat,
                lng: donorLocation.lng,
                title: `Blood Donor (${donorLocation.bloodGroup})`,
                description: 'Live GPS location',
                type: 'donor' as const
              }] : []),
              ...(hospitalLocation ? [{
                id: 'hospital',
                lat: hospitalLocation[0],
                lng: hospitalLocation[1],
                title: 'Hospital',
                description: 'Destination',
                type: 'hospital' as const
              }] : [])
            ]}
            showRoute={!!(donorLocation && hospitalLocation)}
            routeFrom={donorLocation ? [donorLocation.lat, donorLocation.lng] : undefined}
            routeTo={hospitalLocation || undefined}
            showUserLocation={true}
          />

          {/* Donation Confirmation Section */}
          {arrivalDetected && currentUser && (
            <div style={{ marginTop: '2rem' }}>
              <DonationConfirmation
                donationId={requestId}
                role={currentUser.is_donor ? 'donor' : 'recipient'}
                onConfirm={() => {
                  setRequestStatus('completed');
                }}
              />
            </div>
          )}
        </div>
      )}

      {!donorLocation && !error && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p>Waiting for donor to start sharing their location...</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            The donor will need to enable GPS tracking on their device
          </p>
        </div>
      )}
    </div>
  );
}
