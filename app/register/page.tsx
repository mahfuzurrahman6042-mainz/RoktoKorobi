"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { registerUser, saveUserData, updateProfile, sendVerificationEmail } from '@/lib/firebase';

export default function RegisterDonor() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('en');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bloodGroup: '',
    age: '',
    weight: '',
    gender: '',
    location: '',
    district: '',
    availability: true,
    lastDonation: '',
    medicalConditions: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
  }, []);

  const t = (key: string) => {
    const translations: Record<string, any> = {
      title: { en: 'Register as Blood Donor', bn: 'রক্তদাতা হিসেবে নিবন্ধন করুন' },
      subtitle: { en: 'Join our life-saving community and help those in need', bn: 'আমাদের জীবন রক্ষাকারী সম্প্রদায়ে যোগ দিন এবং প্রয়োজনে থাকা মানুষদের সাহায্য করুন' },
      name: { en: 'Full Name', bn: 'পূর্ণ নাম' },
      email: { en: 'Email Address', bn: 'ইমেল ঠিকানা' },
      password: { en: 'Password', bn: 'পাসওয়ার্ড' },
      phone: { en: 'Phone Number', bn: 'ফোন নম্বর' },
      bloodGroup: { en: 'Blood Group', bn: 'রক্তের গ্রুপ' },
      age: { en: 'Age', bn: 'বয়স' },
      weight: { en: 'Weight (kg)', bn: 'ওজন (কেজি)' },
      gender: { en: 'Gender', bn: 'লিঙ্গ' },
      location: { en: 'Current Location', bn: 'বর্তমান ঠিকানা' },
      district: { en: 'District', bn: 'জেলা' },
      availability: { en: 'Available for Donation', bn: 'রক্তদানের জন্য উপলব্ধ' },
      lastDonation: { en: 'Last Donation Date', bn: 'সর্বশেষ রক্তদানের তারিখ' },
      medicalConditions: { en: 'Medical Conditions (if any)', bn: 'চিকিৎসা সংক্রান্ত সমস্যা (যদি থাকে)' },
      male: { en: 'Male', bn: 'পুরুষ' },
      female: { en: 'Female', bn: 'মহিলা' },
      other: { en: 'Other', bn: 'অন্যান্য' },
      submit: { en: 'Register Now', bn: 'এখনই নিবন্ধন করুন' },
      back: { en: 'Back to Home', bn: 'হোমে ফিরে যান' },
      login: { en: 'Already have an account? Login', bn: 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন' },
      success: { en: 'Registration successful! You are now a registered blood donor.', bn: 'নিবন্ধন সফল! আপনি এখন একজন নিবন্ধিত রক্তদাতা।' },
      submitting: { en: 'Registering...', bn: 'নিবন্ধন করছে...' },
      acceptTerms: { en: 'I accept the Terms of Service', bn: 'আমি শর্তাবলী গ্রহণ করি' },
      acceptPrivacy: { en: 'I accept the Privacy Policy', bn: 'আমি গোপনীয়তা নীতি গ্রহণ করি' },
      viewTerms: { en: 'View Terms', bn: 'শর্তাবলী দেখুন' },
      viewPrivacy: { en: 'View Privacy Policy', bn: 'গোপনীয়তা নীতি দেখুন' },
      termsRequired: { en: 'You must accept the Terms of Service to register', bn: 'নিবন্ধন করতে আপনাকে শর্তাবলী গ্রহণ করতে হবে' },
      privacyRequired: { en: 'You must accept the Privacy Policy to register', bn: 'নিবন্ধন করতে আপনাকে গোপনীয়তা নীতি গ্রহণ করতে হবে' }
    };
    return translations[key]?.[language] || key;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.password || !formData.phone || 
        !formData.bloodGroup || !formData.age || !formData.weight || !formData.gender || 
        !formData.location || !formData.district) {
      alert(language === 'bn' ? 'সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন' : 'Please fill in all required fields');
      return;
    }
    
    // Validate checkboxes
    if (!acceptTerms) {
      alert(t('termsRequired'));
      return;
    }
    
    if (!acceptPrivacy) {
      alert(t('privacyRequired'));
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert(language === 'bn' ? 'সঠিক ইমেল ঠিকানা দিন' : 'Please enter a valid email address');
      return;
    }
    
    // Validate password strength
    if (!formData.password || formData.password.length < 8) {
      alert(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে' : 'Password must be at least 8 characters');
      return;
    }
    
    // Validate age (18-65)
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 18 || age > 65) {
      alert(language === 'bn' ? 'বয়স ১৮-৬৫ বছরের মধ্যে হতে হবে' : 'Age must be between 18 and 65');
      return;
    }
    
    // Validate weight (minimum 50kg)
    const weight = parseFloat(formData.weight);
    if (isNaN(weight) || weight < 50) {
      alert(language === 'bn' ? 'ওজন কমপক্ষে ৫০ কেজি হতে হবে' : 'Weight must be at least 50 kg');
      return;
    }
    
    setSubmitting(true);

    try {
      // Create Firebase user
      const userCredential = await registerUser(formData.email, formData.password);
      
      // Update user profile with name
      await updateProfile(userCredential.user, { displayName: formData.name });

      // Send email verification
      try {
        await sendVerificationEmail(userCredential.user);
      } catch (verifyError) {
        console.error('Email verification error:', verifyError);
        // Continue with registration even if verification fails
      }

      // Save donor data to Firestore
      const donorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        age: age,
        weight: weight,
        gender: formData.gender,
        location: formData.location,
        district: formData.district,
        availability: formData.availability,
        lastDonation: formData.lastDonation,
        medicalConditions: formData.medicalConditions,
        createdAt: new Date().toISOString(),
        uid: userCredential.user.uid,
        acceptedTerms: true,
        acceptedPrivacy: true,
        isDonor: true,
        donations: 0,
        fulfilledRequests: 0,
        rating: 4.8,
        emailVerified: userCredential.user.emailVerified
      };

      // Save to Firestore
      await saveUserData(userCredential.user.uid, donorData);

      setSubmitted(true);
      setSubmitting(false);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error: any) {
      console.error('Registration error:', error);
      setSubmitting(false);
      if (error.code === 'auth/email-already-in-use') {
        alert(language === 'bn' ? 'এই ইমেলটি ইতিমধ্যেই ব্যবহৃত হয়েছে' : 'This email is already in use');
      } else if (error.code === 'auth/weak-password') {
        alert(language === 'bn' ? 'পাসওয়ার্ড খুব দুর্বল' : 'Password is too weak');
      } else if (error.code === 'auth/invalid-email') {
        alert(language === 'bn' ? 'অবৈধ ইমেল ঠিকানা' : 'Invalid email address');
      } else {
        alert(language === 'bn' ? 'নিবন্ধন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Registration failed. Please try again.');
      }
    }
  };

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          nav {
            padding: 16px 20px !important;
          }
          
          nav span:first-child {
            font-size: 24px !important;
          }
          
          nav .font-serif {
            font-size: 18px !important;
          }
          
          h1[style*="fontSize: '48px'"] {
            font-size: 28px !important;
          }
          
          form[style*="padding: '48px'"] {
            padding: 24px 20px !important;
          }
          
          div[style*="gridTemplateColumns: '1fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
          
          div[style*="gridTemplateColumns: '1fr 1fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
          
          div[style*="display: 'flex'"][style*="alignItems: 'flex-start'"] {
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          input[type="checkbox"] {
            width: 24px !important;
            height: 24px !important;
          }
        }
      `}</style>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        background: 'rgba(245,237,216,0.95)', backdropFilter: 'blur(24px)',
        padding: '14px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(192,21,42,0.12)', boxShadow: '0 2px 40px rgba(26,15,10,0.08)'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <span style={{ fontSize: '36px', lineHeight: 1 }}>🩸</span>
          <div>
            <span style={{ fontFamily: 'serif', fontSize: '24px', color: '#C0152A', letterSpacing: '-0.01em' }}>রক্তকরবী</span>
            <span style={{ fontSize: '10px', color: '#1B5E6B', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginTop: '2px' }}>RoktoKorobi</span>
          </div>
        </Link>
        <Link href="/" style={{ background: '#C0152A', color: '#fff', padding: '10px 26px', borderRadius: '100px', fontWeight: 600, fontSize: '13px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(192,21,42,0.3)' }}>
          {t('back')}
        </Link>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#F5EDD8' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1A0F0A', marginBottom: '16px' }}>
              {t('title')}
            </h1>
            <p style={{ fontSize: '18px', color: '#3D2314', lineHeight: 1.6 }}>
              {t('subtitle')}
            </p>
          </div>

          {/* Form */}
          {submitted ? (
            <div style={{
              background: '#E8F5E8', border: '2px solid #22C55E', borderRadius: '16px',
              padding: '48px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ fontSize: '24px', color: '#166534', marginBottom: '16px' }}>
                {t('success')}
              </h2>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              background: '#FDFAF4', borderRadius: '24px', padding: '48px',
              boxShadow: '0 4px 60px rgba(26,15,10,0.06)', border: '1px solid rgba(192,21,42,0.08)'
            }}>
              <div style={{ display: 'grid', gap: '24px' }}>
                
                {/* Personal Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                      {t('name')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                      {t('email')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    {t('password')} *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      placeholder={language === 'bn' ? 'কমপক্ষে ৬ অক্ষর' : 'Minimum 6 characters'}
                      style={{
                        width: '100%', padding: '14px 18px', paddingRight: '48px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#3D2314',
                        padding: 0
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Contact and Medical Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                      {t('phone')} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                      {t('bloodGroup')} *
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    >
                      <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                {/* Age, Weight, Gender */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                      {t('age')} *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      min="18"
                      max="65"
                      required
                      style={{
                        width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                      {t('weight')} *
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      min="45"
                      required
                      style={{
                        width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                      {t('gender')} *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    >
                      <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                      <option value="male">{t('male')}</option>
                      <option value="female">{t('female')}</option>
                      <option value="other">{t('other')}</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                      {t('district')} *
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    >
                      <option value="">{language === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select District'}</option>
                      <option value="Dhaka">{language === 'bn' ? 'ঢাকা' : 'Dhaka'}</option>
                      <option value="Chattogram">{language === 'bn' ? 'চট্টগ্রাম' : 'Chattogram'}</option>
                      <option value="Rajshahi">{language === 'bn' ? 'রাজশাহী' : 'Rajshahi'}</option>
                      <option value="Khulna">{language === 'bn' ? 'খুলনা' : 'Khulna'}</option>
                      <option value="Sylhet">{language === 'bn' ? 'সিলেট' : 'Sylhet'}</option>
                      <option value="Barishal">{language === 'bn' ? 'বরিশাল' : 'Barishal'}</option>
                      <option value="Rangpur">{language === 'bn' ? 'রংপুর' : 'Rangpur'}</option>
                      <option value="Mymensingh">{language === 'bn' ? 'ময়মনসিংহ' : 'Mymensingh'}</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                      {t('location')} *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                      {t('lastDonation')}
                    </label>
                    <input
                      type="date"
                      name="lastDonation"
                      value={formData.lastDonation}
                      onChange={handleInputChange}
                      style={{
                        width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '32px' }}>
                    <input
                      type="checkbox"
                      name="availability"
                      checked={formData.availability}
                      onChange={handleInputChange}
                      style={{ width: '20px', height: '20px' }}
                    />
                    <label style={{ fontSize: '16px', color: '#3D2314' }}>
                      {t('availability')}
                    </label>
                  </div>
                </div>

                {/* Medical Conditions */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    {t('medicalConditions')}
                  </label>
                  <textarea
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder={language === 'bn' ? 'কোনো চিকিৎসা সংক্রান্ত সমস্যা থাকলে উল্লেখ করুন' : 'Mention any medical conditions if any'}
                    style={{
                      width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                      borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                      outline: 'none', transition: 'all 0.3s', resize: 'vertical'
                    }}
                  />
                </div>

                {/* Terms and Privacy Checkboxes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                  {/* Terms of Service */}
                  <div style={{
                    background: '#F5EDD8',
                    border: '1.5px solid rgba(192,21,42,0.12)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        required
                        style={{ width: '20px', height: '20px', marginTop: '2px', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '4px', display: 'block' }}>
                          {t('acceptTerms')} *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowTerms(!showTerms)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#C0152A',
                            fontSize: '13px',
                            cursor: 'pointer',
                            padding: 0,
                            textDecoration: 'underline',
                            fontWeight: 500
                          }}
                        >
                          {showTerms ? '▼ ' : '▶ '}{t('viewTerms')}
                        </button>
                        {showTerms && (
                          <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            background: 'white',
                            borderRadius: '8px',
                            fontSize: '13px',
                            lineHeight: '1.6',
                            color: '#3D2314',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            borderLeft: '3px solid #C0152A'
                          }}>
                            <p style={{ margin: '0 0 8px 0' }}>
                              <strong>{language === 'bn' ? '১. শর্তাবলী গ্রহণ' : '1. Acceptance of Terms'}</strong>: {language === 'bn' ? 'আপনি অন্তত ১৮ বছর বয়সী হতে হবে এবং এই শর্তাবলী মেনে চলতে সম্মত হন।' : 'You must be at least 18 years old and agree to these terms.'}
                            </p>
                            <p style={{ margin: '0 0 8px 0' }}>
                              <strong>{language === 'bn' ? '২. ব্যবহারকারীর আচরণ' : '2. User Conduct'}</strong>: {language === 'bn' ? 'আপনি শুধুমাত্র আইনি উদ্দেশ্যে পরিষেবাটি ব্যবহার করবেন।' : 'Use the service only for lawful purposes.'}
                            </p>
                            <p style={{ margin: '0 0 8px 0' }}>
                              <strong>{language === 'bn' ? '৩. দায়বদ্ধতার সীমাবদ্ধতা' : '3. Limitation of Liability'}</strong>: {language === 'bn' ? 'আমরা পরোক্ষ বা ফলস্বরূপ ক্ষতির জন্য দায়ী থাকব না।' : 'We are not liable for indirect or consequential damages.'}
                            </p>
                            <Link href="/terms-of-service" target="_blank" style={{ color: '#C0152A', textDecoration: 'underline', fontSize: '12px' }}>
                              {language === 'bn' ? 'সম্পূর্ণ শর্তাবলী পড়ুন' : 'Read full Terms of Service'}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Privacy Policy */}
                  <div style={{
                    background: '#F5EDD8',
                    border: '1.5px solid rgba(192,21,42,0.12)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={acceptPrivacy}
                        onChange={(e) => setAcceptPrivacy(e.target.checked)}
                        required
                        style={{ width: '20px', height: '20px', marginTop: '2px', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '4px', display: 'block' }}>
                          {t('acceptPrivacy')} *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPrivacy(!showPrivacy)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#C0152A',
                            fontSize: '13px',
                            cursor: 'pointer',
                            padding: 0,
                            textDecoration: 'underline',
                            fontWeight: 500
                          }}
                        >
                          {showPrivacy ? '▼ ' : '▶ '}{t('viewPrivacy')}
                        </button>
                        {showPrivacy && (
                          <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            background: 'white',
                            borderRadius: '8px',
                            fontSize: '13px',
                            lineHeight: '1.6',
                            color: '#3D2314',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            borderLeft: '3px solid #C0152A'
                          }}>
                            <p style={{ margin: '0 0 8px 0' }}>
                              <strong>{language === 'bn' ? '১. তথ্য সংগ্রহ' : '1. Information Collection'}</strong>: {language === 'bn' ? 'আমরা আপনার নাম, যোগাযোগ, রক্তের গ্রুপ সংগ্রহ করি।' : 'We collect your name, contact, blood group.'}
                            </p>
                            <p style={{ margin: '0 0 8px 0' }}>
                              <strong>{language === 'bn' ? '২. তথ্য ব্যবহার' : '2. Information Usage'}</strong>: {language === 'bn' ? 'আমরা রক্তদান মিলানের জন্য তথ্য ব্যবহার করি।' : 'We use information for blood donation matching.'}
                            </p>
                            <p style={{ margin: '0 0 8px 0' }}>
                              <strong>{language === 'bn' ? '৩. তথ্য নিরাপত্তা' : '3. Data Security'}</strong>: {language === 'bn' ? 'আমরা শিল্প-মানের নিরাপত্তা ব্যবস্থা ব্যবহার করি।' : 'We use industry-standard security measures.'}
                            </p>
                            <Link href="/privacy-policy" target="_blank" style={{ color: '#C0152A', textDecoration: 'underline', fontSize: '12px' }}>
                              {language === 'bn' ? 'সম্পূর্ণ গোপনীয়তা নীতি পড়ুন' : 'Read full Privacy Policy'}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '16px', background: '#C0152A',
                    color: '#fff', border: 'none', borderRadius: '14px',
                    fontSize: '16px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s', boxShadow: '0 8px 24px rgba(192,21,42,0.3)',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? t('submitting') : t('submit')}
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/login" style={{ color: '#C0152A', textDecoration: 'none', fontSize: '16px' }}>
              {t('login')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
