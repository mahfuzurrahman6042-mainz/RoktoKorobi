'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/LanguageContext';
import { hashPassword } from '@/lib/auth';
import { sanitizeInput, validateEmail, validatePhone, validatePassword, validateAge, validateWeight } from '@/lib/validation';
import { geocodeDonorArea } from '@/lib/geolocation-utils';
import PrivacyPolicyConsent from '@/components/PrivacyPolicyConsent';

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const languageContext = useLanguage();
  const { t, language } = languageContext;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: '',
    dateOfBirth: '',
    district: '',
    location: '',
    weight: '',
    wantsToBeDonor: false,
    password: '',
    ageConfirmed: false,
    privacyConsent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#757575', fontSize: '1.1rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Sanitize inputs
    const sanitizedName = sanitizeInput(formData.name);
    const sanitizedEmail = sanitizeInput(formData.email);
    const sanitizedPhone = sanitizeInput(formData.phone);
    const sanitizedLocation = sanitizeInput(formData.location);

    // Validate inputs
    if (!validateEmail(sanitizedEmail)) {
      setError('Invalid email address');
      setLoading(false);
      return;
    }

    if (!validatePhone(sanitizedPhone)) {
      setError('Invalid phone number');
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      setLoading(false);
      return;
    }

    // Calculate age from date of birth
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;

    if (!validateAge(finalAge)) {
      setError('Age must be between 13 and 100');
      setLoading(false);
      return;
    }

    const weight = parseInt(formData.weight);
    if (!validateWeight(weight)) {
      setError('Weight must be between 30 and 200 kg');
      setLoading(false);
      return;
    }

    // Validate donor eligibility
    if (formData.wantsToBeDonor && finalAge < 18) {
      setError(t('ageWarning'));
      setLoading(false);
      return;
    }

    // Validate age confirmation
    if (!formData.ageConfirmed) {
      setError('You must confirm that you are 18 years or older');
      setLoading(false);
      return;
    }

    // Validate privacy consent
    if (!formData.privacyConsent) {
      setError('You must agree to the Privacy Policy to continue');
      setLoading(false);
      return;
    }

    // Soft deduplication check - check if user already exists by phone or email
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id, phone, email')
      .or(`phone.eq.${sanitizedPhone},email.eq.${sanitizedEmail}`)
      .limit(1);

    if (existingUser && existingUser.length > 0) {
      const existing = existingUser[0];
      if (existing.phone === sanitizedPhone) {
        setError('A user with this phone number already exists');
      } else if (existing.email === sanitizedEmail) {
        setError('A user with this email already exists');
      } else {
        setError('An account with these details already exists');
      }
      setLoading(false);
      return;
    }

    try {
      // Hash password before storing
      const hashedPassword = await hashPassword(formData.password);

      // Geocode donor's area if they want to be a donor
      let areaLat = null;
      let areaLon = null;
      let areaName = null;

      if (formData.wantsToBeDonor && finalAge >= 18 && sanitizedLocation) {
        const locationCoords = await geocodeDonorArea(sanitizedLocation);
        if (locationCoords) {
          areaLat = locationCoords.lat;
          areaLon = locationCoords.lon;
          areaName = sanitizedLocation;
        }
      }

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            name: sanitizedName,
            email: sanitizedEmail,
            phone: sanitizedPhone,
            blood_group: formData.bloodGroup,
            date_of_birth: formData.dateOfBirth,
            age: finalAge,
            district: formData.district,
            location: sanitizedLocation,
            weight: weight,
            is_donor: formData.wantsToBeDonor && finalAge >= 18,
            password: hashedPassword,
            role: 'user', // Default role
            area_name: areaName,
            area_lat: areaLat,
            area_lon: areaLon,
            is_available: true,
            total_donations: 0,
            privacy_consent: true,
            age_declaration: true,
          },
        ]);

      if (insertError) throw insertError;

      // Increment donor count in stats if user wants to be a donor
      if (formData.wantsToBeDonor && finalAge >= 18) {
        try {
          await fetch('/api/stats/increment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'donor' }),
          });
        } catch (statsError) {
          // Don't fail registration if stats update fails, just continue
        }

        // Increment district count
        try {
          await fetch('/api/stats/increment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'district' }),
          });
        } catch (statsError) {
          // Don't fail registration if stats update fails, just continue
        }
      }

      // Send verification email
      try {
        await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: sanitizedEmail }),
        });
      } catch (emailError) {
        // Don't fail registration if email fails, just continue
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        bloodGroup: '',
        dateOfBirth: '',
        district: '',
        location: '',
        weight: '',
        wantsToBeDonor: false,
        password: '',
        ageConfirmed: false,
        privacyConsent: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#e53935', fontSize: '2rem', marginBottom: '1rem' }}>
        🩸 {t('registerTitle')}
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
            {t('fullName')}
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            {t('email')}
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            {t('password')}
          </label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            {t('phone')}
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
            {t('bloodGroup')}
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
            {t('dateOfBirth') || 'Date of Birth'}
          </label>
          <input
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
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
            {t('district') || 'District'}
          </label>
          <input
            type="text"
            required
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            placeholder={language === 'bn' ? 'জেলা লিখুন' : 'Enter your district'}
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
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            <input
              type="checkbox"
              checked={formData.wantsToBeDonor}
              onChange={(e) => setFormData({ ...formData, wantsToBeDonor: e.target.checked })}
              style={{ marginRight: '0.5rem' }}
            />
            {t('registerAs')} {t('donor')}
          </label>
          {formData.wantsToBeDonor && formData.dateOfBirth && (() => {
              const dob = new Date(formData.dateOfBirth);
              const today = new Date();
              const age = today.getFullYear() - dob.getFullYear();
              const monthDiff = today.getMonth() - dob.getMonth();
              const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
              return finalAge < 18;
            })() && (
            <div style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              ⚠️ {t('ageWarning')}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {t('location')}
          </label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
            {t('weight')}
          </label>
          <input
            type="number"
            required
            min="50"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        <PrivacyPolicyConsent
          language={language === 'bn' ? 'bn' : 'en'}
          onConsentChange={(consented) => setFormData({ ...formData, privacyConsent: consented })}
          showAgeDeclaration={true}
          onAgeDeclarationChange={(declared) => setFormData({ ...formData, ageConfirmed: declared })}
          required={true}
        />

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
          {loading ? t('loading') : t('registerBtn')}
        </button>
      </form>
    </div>
  );
}
