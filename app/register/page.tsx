'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { validateEmail, validatePhone, validatePassword, validateAge, validateWeight, sanitizeInput } from '@/lib/validation';
import { validateRegistrationForm as enhancedValidateRegistrationForm } from '@/lib/enhanced-validation';
import { geocodeDonorArea } from '@/lib/geolocation-utils';
import PrivacyPolicyConsent from '@/components/PrivacyPolicyConsent';

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
  }, []);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: 'Register', bn: 'রেজিস্টার' },
      subtitle: { en: 'Join our community of blood donors', bn: 'আমাদের রক্তদাতা সম্প্রদায়ে যোগ দিন' },
      name: { en: 'Full Name', bn: 'পূর্ণ নাম' },
      email: { en: 'Email', bn: 'ইমেইল' },
      phone: { en: 'Phone', bn: 'ফোন' },
      bloodGroup: { en: 'Blood Group', bn: 'রক্তের গ্রুপ' },
      dateOfBirth: { en: 'Date of Birth', bn: 'জন্ম তারিখ' },
      district: { en: 'District', bn: 'জেলা' },
      location: { en: 'Area/Location', bn: 'এলাকা/অবস্থান' },
      weight: { en: 'Weight (kg)', bn: 'ওজন (কেজি)' },
      password: { en: 'Password', bn: 'পাসওয়ার্ড' },
      wantsToBeDonor: { en: 'I want to be a blood donor', bn: 'আমি রক্তদাতা হতে চাই' },
      ageConfirmation: { en: 'I confirm that I am 18 years or older', bn: 'আমি নিশ্চিত করছি যে আমার বয়স ১৮ বছর বা তার বেশি' },
      privacyConsent: { en: 'I agree to the Privacy Policy', bn: 'আমি গোপনীয়তা নীতিতে সম্মত' },
      register: { en: 'Register', bn: 'রেজিস্টার করুন' },
      alreadyHaveAccount: { en: 'Already have an account?', bn: 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?' },
      login: { en: 'Login', bn: 'লগ ইন' },
      ageWarning: { en: 'You must be 18 or older to register as a donor', bn: 'রক্তদাতা হিসেবে নিবন্ধন করতে আপনার বয়স ১৮ বা তার বেশি হতে হবে' },
      loading: { en: 'Creating your account...', bn: 'আপনার অ্যাকাউন্ট তৈরি হচ্ছে...' },
      success: { en: 'Registration successful! Redirecting to login...', bn: 'রেজিস্ট্রেশন সফল! লগ ইন পেজে রিডাইরেক্ট হচ্ছে...' },
    };
    return translations[key]?.[language] || key;
  };
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
      <div className="loading-wrapper">
        <div className="loading-inner">
          <svg className="loading-drop" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0C8.954 0 0 8.954 0 20c0 11.046 8.954 20 20 20s20-8.954 20-20C40 8.954 31.046 0 20 0zm0 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16-7.163 16-16 16z" fill="#C0152A"/>
            <path d="M20 8c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm0 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" fill="#E8324A"/>
            <circle cx="20" cy="20" r="4" fill="#FDFAF4"/>
          </svg>
          <span className="loading-text">Loading...</span>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Calculate age from date of birth
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;

    // Enhanced validation using new validation library
    const enhancedValidation = enhancedValidateRegistrationForm({...formData, area: formData.location});
    if (!enhancedValidation.isValid) {
      setError(enhancedValidation.errors.join(', '));
      setLoading(false);
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(formData.email);
    const sanitizedPhone = sanitizeInput(formData.phone);
    const sanitizedName = sanitizeInput(formData.name);
    const sanitizedDistrict = sanitizeInput(formData.district);
    const sanitizedLocation = sanitizeInput(formData.location);
    const weight = parseInt(formData.weight);

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
      .select('id, phone, email, name')
      .or(`phone.eq.${sanitizedPhone},email.eq.${sanitizedEmail}`)
      .limit(1);

    if (checkError) {
      setError('Database error occurred. Please try again.');
      setLoading(false);
      return;
    }

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
            district: formData.district,
            location: sanitizedLocation,
            weight: weight,
            is_donor: formData.wantsToBeDonor && finalAge >= 18,
            password_hash: hashedPassword,
            role: 'user',
            area_name: areaName,
            area_lat: areaLat,
            area_lon: areaLon,
            is_available: true,
            total_donations: 0,
            privacy_consent: formData.privacyConsent,
            age_declaration: formData.ageConfirmed,
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
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <svg className="auth-logo" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0C8.954 0 0 8.954 0 20c0 11.046 8.954 20 20 20s20-8.954 20-20C40 8.954 31.046 0 20 0zm0 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16-7.163 16-16 16z" fill="#C0152A"/>
            <path d="M20 8c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm0 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" fill="#E8324A"/>
            <circle cx="20" cy="20" r="4" fill="#FDFAF4"/>
          </svg>
          <h1 className="auth-title">
            {language === 'bn' ? 'রক্তদাতা নিবন্ধন' : 'Register as Donor'}
          </h1>
          <p className="auth-sub">
            {language === 'bn' ? 'রক্তকরবী নেটওয়ার্কে যোগ দিন এবং জীবন বাঁচাতে সাহায্য করুন' : 'Join RoktoKorobi network and help save lives'}
          </p>
        </div>

        {success && (
          <div className="auth-alert success">
            {t('success')}
          </div>
        )}

        {error && (
          <div className="auth-alert error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <label className="form-label">{t('fullName')}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              placeholder={language === 'bn' ? 'আপনার নাম' : 'Your name'}
            />
          </div>

          <div className="form-row">
            <label className="form-label">{t('email')}</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
              placeholder={language === 'bn' ? 'আপনার ইমেইল' : 'Your email'}
            />
          </div>

          <div className="form-row">
            <label className="form-label">{t('password')}</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="form-input"
              placeholder={language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
            />
          </div>

          <div className="form-row">
            <label className="form-label">{t('phoneNumber')}</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="form-input"
              placeholder={language === 'bn' ? 'আপনার ফোন নম্বর' : 'Your phone number'}
            />
          </div>

          <div className="form-row">
            <label className="form-label">{t('bloodGroup')}</label>
            <select
              required
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              className="form-select"
            >
              <option value="">{language === 'bn' ? 'রক্তের গ্রুপ নির্বাচন করুন' : 'Select blood group'}</option>
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

          <div className="form-row">
            <label className="form-label">{t('dateOfBirth') || 'Date of Birth'}</label>
            <input
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <label className="form-label">{t('district') || 'District'}</label>
            <input
              type="text"
              required
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              placeholder={language === 'bn' ? 'জেলা লিখুন' : 'Enter your district'}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={formData.wantsToBeDonor}
                onChange={(e) => setFormData({ ...formData, wantsToBeDonor: e.target.checked })}
              />
              <span>{t('registerAs')} {t('donor')}</span>
            </label>
            {formData.wantsToBeDonor && formData.dateOfBirth && (() => {
                const dob = new Date(formData.dateOfBirth);
                const today = new Date();
                const age = today.getFullYear() - dob.getFullYear();
                const monthDiff = today.getMonth() - dob.getMonth();
                const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
                return finalAge < 18;
              })() && (
              <div className="form-warning">
                ⚠️ {t('ageWarning')}
              </div>
            )}
          </div>

          <div className="form-row">
            <label className="form-label">{t('location')}</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={language === 'bn' ? 'আপনার এলাকা লিখুন' : 'Enter your area'}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <label className="form-label">{t('weight')}</label>
            <input
              type="number"
              required
              min="50"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder={language === 'bn' ? 'আপনার ওজন (কেজিতে)' : 'Your weight (kg)'}
              className="form-input"
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
            className="auth-submit"
          >
            {loading ? t('loading') : t('register')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
            <Link href="/login" className="auth-link">
              {language === 'bn' ? 'লগ ইন করুন' : 'Login'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
