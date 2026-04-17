'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/LanguageContext';
import { hashPassword } from '@/lib/auth';
import { sanitizeInput, validateEmail, validatePhone, validatePassword, validateAge, validateWeight } from '@/lib/validation';

export default function RegisterPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: '',
    age: '',
    location: '',
    weight: '',
    wantsToBeDonor: false,
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

    const age = parseInt(formData.age);
    if (!validateAge(age)) {
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
    if (formData.wantsToBeDonor && age < 18) {
      setError(t('ageWarning'));
      setLoading(false);
      return;
    }

    try {
      // Hash password before storing
      const hashedPassword = await hashPassword(formData.password);

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            name: sanitizedName,
            email: sanitizedEmail,
            phone: sanitizedPhone,
            blood_group: formData.bloodGroup,
            age: age,
            location: sanitizedLocation,
            weight: weight,
            is_donor: formData.wantsToBeDonor && age >= 18,
            password: hashedPassword,
            role: 'user', // Default role
          },
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        bloodGroup: '',
        age: '',
        location: '',
        weight: '',
        wantsToBeDonor: false,
        password: '',
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
            {t('age')}
          </label>
          <input
            type="number"
            required
            min="13"
            max="65"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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
          {formData.wantsToBeDonor && parseInt(formData.age) < 18 && (
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
