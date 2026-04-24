'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import OfflineMap from '@/components/OfflineMap';
import { startDonorTracking, stopDonorTracking, isTrackingActive } from '@/lib/donor-tracking';
import { supabase } from '@/lib/supabase';

export default function DonorTrackPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { t } = useLanguage();
  const [requestId, setRequestId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitalLocation, setHospitalLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [arrivalConfirmed, setArrivalConfirmed] = useState(false);

  useEffect(() => {
    params.then(p => setRequestId(p.requestId));
  }, [params]);

  useEffect(() => {
    if (!requestId) return;

    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch blood request details
        const { data: request, error: requestError } = await supabase
          .from('blood_requests')
          .select('*')
          .eq('id', requestId)
          .single();

        if (requestError || !request) {
          setError('Blood request not found');
          return;
        }

        if (request.hospital_latitude && request.hospital_longitude) {
          setHospitalLocation({
            lat: request.hospital_latitude,
            lng: request.hospital_longitude,
            name: request.hospital_name
          });
        }

        // Check if current user is the accepted donor
        const { data: { user } } = await supabase.auth.getUser();
        if (user && request.accepted_donor_id === user.id) {
          // User is the accepted donor, allow tracking
        } else {
          setError('You are not the donor assigned to this request');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId]);

  const handleStartTracking = async () => {
    if (!hospitalLocation) {
      setError('Hospital location not available');
      return;
    }

    try {
      setIsTracking(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '';
      
      await startDonorTracking(
        userId,
        hospitalLocation.lat,
        hospitalLocation.lng,
        (lat, lng) => {
          setCurrentLocation({ lat, lng });
          if (hospitalLocation) {
            const dist = calculateDistance(lat, lng, hospitalLocation.lat, hospitalLocation.lng);
            setDistance(dist);
          }
        },
        () => {
          setArrivalConfirmed(true);
          handleConfirmArrival();
        }
      );

      // Get initial location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            if (hospitalLocation) {
              setDistance(calculateDistance(latitude, longitude, hospitalLocation.lat, hospitalLocation.lng));
            }
          },
          (err) => {
            setError('Unable to get GPS location. Please enable location services.');
            setIsTracking(false);
          },
          { enableHighAccuracy: true }
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start tracking');
      setIsTracking(false);
    }
  };

  const handleStopTracking = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '';
    stopDonorTracking(userId);
    setIsTracking(false);
  };

  const handleConfirmArrival = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await fetch('/api/donor/arrive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorId: user.id, requestId })
      });

      setArrivalConfirmed(true);
      handleStopTracking();
    } catch (err) {
      console.error('Failed to confirm arrival:', err);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading request details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#e53935', fontSize: '2rem', marginBottom: '1rem' }}>
        🩸 Share Your Location
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

      {arrivalConfirmed && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#4caf50',
          color: 'white',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}>
          ✅ Arrival confirmed! Thank you for donating blood.
        </div>
      )}

      {hospitalLocation && !arrivalConfirmed && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Destination</h3>
            <p><strong>Hospital:</strong> {hospitalLocation.name}</p>
            {distance !== null && (
              <p><strong>Distance:</strong> {Math.round(distance)} meters</p>
            )}
            {currentLocation && (
              <p><strong>Your Location:</strong> {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</p>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={isTracking ? handleStopTracking : handleStartTracking}
              style={{
                padding: '1rem 2rem',
                backgroundColor: isTracking ? '#f44336' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginRight: '0.5rem'
              }}
            >
              {isTracking ? '⏹ Stop Sharing Location' : '▶ Start Sharing Location'}
            </button>

            {distance !== null && distance < 200 && !arrivalConfirmed && (
              <button
                onClick={handleConfirmArrival}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ✅ Confirm Arrival
              </button>
            )}
          </div>

          {isTracking && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              marginBottom: '1rem',
              color: '#1976d2',
              fontWeight: 'bold'
            }}>
              ● Live GPS tracking active - Your location is being shared with the requester
            </div>
          )}

          <OfflineMap
            center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [hospitalLocation.lat, hospitalLocation.lng]}
            zoom={15}
            height="500px"
            markers={[
              ...(currentLocation ? [{
                id: 'donor',
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                title: 'Your Location',
                description: 'Live GPS position',
                type: 'donor' as const
              }] : []),
              {
                id: 'hospital',
                lat: hospitalLocation.lat,
                lng: hospitalLocation.lng,
                title: hospitalLocation.name,
                description: 'Destination',
                type: 'hospital' as const
              }
            ]}
            showRoute={!!currentLocation}
            routeFrom={currentLocation ? [currentLocation.lat, currentLocation.lng] : undefined}
            routeTo={[hospitalLocation.lat, hospitalLocation.lng]}
            showUserLocation={true}
          />
        </div>
      )}

      {!hospitalLocation && !error && !loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
          <p>Waiting for hospital location information...</p>
        </div>
      )}
    </div>
  );
}
