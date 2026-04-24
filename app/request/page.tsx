'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/LanguageContext';
import OfflineMap from '@/components/OfflineMap';

export default function RequestPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    hospitalName: '',
    hospitalAddress: '',
    hospitalCity: '',
    hospitalDistrict: '',
    urgency: 'medium',
    contact: '',
    units: '1',
  });
  const [location, setLocation] = useState({ latitude: null as number | null, longitude: null as number | null });
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleGetLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocating(false);
        },
        (error) => {
          setError('Unable to get location. Please enable location services.');
          setLocating(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('blood_requests')
        .insert([
          {
            patient_name: formData.patientName,
            blood_group: formData.bloodGroup,
            hospital_name: formData.hospitalName,
            hospital_address: formData.hospitalAddress,
            hospital_city: formData.hospitalCity,
            hospital_district: formData.hospitalDistrict,
            hospital_latitude: location.latitude,
            hospital_longitude: location.longitude,
            urgency: formData.urgency,
            contact: formData.contact,
            units_needed: parseInt(formData.units),
            status: 'pending',
          },
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        patientName: '',
        bloodGroup: '',
        hospitalName: '',
        hospitalAddress: '',
        hospitalCity: '',
        hospitalDistrict: '',
        urgency: 'medium',
        contact: '',
        units: '1',
      });
      setLocation({ latitude: null, longitude: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#e53935', fontSize: '2rem', marginBottom: '1rem' }}>
        🚨 {t('requestBlood')}
      </h1>

      {success && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#4caf50',
          color: 'white',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {t('success')}
        </div>
      )}

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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {t('patientName')}
          </label>
          <input
            type="text"
            required
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {t('bloodGroupRequired')}
          </label>
          <select
            required
            value={formData.bloodGroup}
            onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          >
            <option value="">Select {t('bloodGroup')}</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {t('hospitalName')}
          </label>
          <input
            type="text"
            required
            value={formData.hospitalName}
            onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Hospital Address
          </label>
          <input
            type="text"
            value={formData.hospitalAddress}
            onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            City
          </label>
          <input
            type="text"
            required
            value={formData.hospitalCity}
            onChange={(e) => setFormData({ ...formData, hospitalCity: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            District
          </label>
          <input
            type="text"
            required
            value={formData.hospitalDistrict}
            onChange={(e) => setFormData({ ...formData, hospitalDistrict: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Hospital Location (GPS)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              readOnly
              value={location.latitude && location.longitude ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Not set'}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: '#f5f5f5'
              }}
            />
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: locating ? '#999' : '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: locating ? 'not-allowed' : 'pointer'
              }}
            >
              {locating ? 'Locating...' : '📍 Get Location'}
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
            Click to get hospital GPS coordinates (optional but recommended)
          </p>
        </div>

        {location.latitude && location.longitude && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Hospital Location on Map
            </label>
            <OfflineMap
              center={[location.latitude, location.longitude]}
              zoom={15}
              height="300px"
              markers={[
                {
                  id: 'hospital',
                  lat: location.latitude,
                  lng: location.longitude,
                  title: formData.hospitalName || 'Hospital Location',
                  description: formData.hospitalAddress || 'Hospital address',
                  type: 'hospital'
                }
              ]}
              showUserLocation={true}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {t('urgency')}
          </label>
          <select
            required
            value={formData.urgency}
            onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          >
            <option value="low">Low (within 24 hours)</option>
            <option value="medium">Medium (within 12 hours)</option>
            <option value="high">High (within 6 hours)</option>
            <option value="critical">Critical (Immediately)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {t('phone')}
          </label>
          <input
            type="tel"
            required
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Units Needed
          </label>
          <input
            type="number"
            required
            min="1"
            max="10"
            value={formData.units}
            onChange={(e) => setFormData({ ...formData, units: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '1rem',
            backgroundColor: '#e53935',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? t('loading') : t('submitRequest')}
        </button>
      </form>
    </div>
  );
}
