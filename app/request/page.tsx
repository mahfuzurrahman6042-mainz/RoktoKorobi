'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import OfflineMap from '@/components/OfflineMap';

export default function RequestPage() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      requestBlood: { en: 'Request Blood', bn: 'রক্তের প্রয়োজন' },
      patientName: { en: 'Patient Name', bn: 'রোগীর নাম' },
      bloodGroup: { en: 'Blood Group', bn: 'রক্তের গ্রুপ' },
      bloodGroupRequired: { en: 'Blood Group Required', bn: 'প্রয়োজনীয় রক্তের গ্রুপ' },
      hospitalName: { en: 'Hospital Name', bn: 'হাসপাতালের নাম' },
      hospitalAddress: { en: 'Hospital Address', bn: 'হাসপাতালের ঠিকানা' },
      hospitalCity: { en: 'Hospital City', bn: 'হাসপাতালের শহর' },
      hospitalDistrict: { en: 'Hospital District', bn: 'হাসপাতালের জেলা' },
      hospitalLocation: { en: 'Hospital Location', bn: 'হাসপাতালের অবস্থান' },
      urgency: { en: 'Urgency', bn: 'জরুরিতা' },
      phone: { en: 'Phone Number', bn: 'ফোন নম্বর' },
      unitsNeeded: { en: 'Units Needed', bn: 'প্রয়োজনীয় ইউনিট' },
      submitRequest: { en: 'Submit Request', bn: 'অনুরোধ জমা দিন' },
      success: { en: 'Blood request submitted successfully!', bn: 'রক্তের অনুরোধ সফলভাবে জমা হয়েছে!' },
      loading: { en: 'Submitting...', bn: 'জমা দিচ্ছে...' },
    };
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
  }, []);
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
  const [gpsLocation, setGpsLocation] = useState('Not set');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [location, setLocation] = useState({ latitude: null as number | null, longitude: null as number | null });
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) { 
      alert('Geolocation is not supported by your browser.'); 
      return; 
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoords({ lat: latitude, lng: longitude });
        setGpsLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setLocation({ latitude, longitude });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED: 
            alert('Location permission denied.'); 
            break;
          case error.POSITION_UNAVAILABLE: 
            alert('Location information is unavailable.'); 
            break;
          case error.TIMEOUT: 
            alert('Location request timed out.'); 
            break;
          default: 
            alert('An unknown error occurred.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form data
    const units = parseInt(formData.units);
    if (isNaN(units) || units < 1 || units > 10) {
      setError('Units needed must be between 1 and 10');
      setLoading(false);
      return;
    }

    // Calculate needed by date based on urgency
    const neededBy = new Date();
    switch (formData.urgency) {
      case 'critical':
        neededBy.setHours(neededBy.getHours() + 1);
        break;
      case 'high':
        neededBy.setHours(neededBy.getHours() + 6);
        break;
      case 'medium':
        neededBy.setHours(neededBy.getHours() + 12);
        break;
      case 'low':
        neededBy.setDate(neededBy.getDate() + 1);
        break;
    }

    try {
      const requestData = {
        patient_name: formData.patientName.trim(),
        patient_age: 0, // Will be calculated or should be added to form
        blood_group: formData.bloodGroup,
        units_needed: units,
        hospital_name: formData.hospitalName.trim(),
        hospital_address: formData.hospitalAddress.trim(),
        district: formData.hospitalDistrict.trim(),
        location: `${formData.hospitalAddress}, ${formData.hospitalCity}, ${formData.hospitalDistrict}`,
        contact_person: formData.patientName.trim(),
        contact_phone: formData.contact.trim(),
        urgency_level: formData.urgency,
        status: 'pending',
        needed_by: neededBy.toISOString(),
        request_date: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        notes: `Requested via RoktoKorobi app. Urgency: ${formData.urgency}`
      };

      // Add location coordinates if available
      if (location.latitude && location.longitude) {
        Object.assign(requestData, {
          area_lat: location.latitude,
          area_lon: location.longitude,
          area_name: `${formData.hospitalName} - ${formData.hospitalAddress}`
        });
      }

      const { error: insertError } = await supabase
        .from('blood_requests')
        .insert([requestData]);

      if (insertError) {
        throw insertError;
      }

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
      setGpsLocation('Not set');
      setGpsCoords(null);
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
            {t('hospitalAddress')}
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
            {t('hospitalCity')}
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
            {t('hospitalDistrict')}
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
            {t('hospitalLocation')}
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              readOnly
              value={gpsLocation}
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
            {t('unitsNeeded')}
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
