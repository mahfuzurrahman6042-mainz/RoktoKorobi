"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser, getCurrentUser } from '@/lib/appwrite';

export default function Login() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('en');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);

    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          router.push('/dashboard');
        }
      } catch (error) {
        // User not logged in, that's fine
      }
    };

    checkAuth();
  }, [router]);

  const t = (key: string) => {
    const translations: Record<string, any> = {
      title: { en: 'Login to Your Account', bn: 'আপনার অ্যাকাউন্টে লগইন করুন' },
      subtitle: { en: 'Welcome back! Please login to continue', bn: 'স্বাগতম! চালিয়ে যেতে লগইন করুন' },
      email: { en: 'Email Address', bn: 'ইমেল ঠিকানা' },
      password: { en: 'Password', bn: 'পাসওয়ার্ড' },
      remember: { en: 'Remember me', bn: 'আমাকে মনে রাখুন' },
      forgot: { en: 'Forgot password?', bn: 'পাসওয়ার্ড ভুলে গেছেন?' },
      login: { en: 'Login', bn: 'লগইন' },
      back: { en: 'Back to Home', bn: 'হোমে ফিরে যান' },
      signup: { en: "Don't have an account? Register", bn: 'অ্যাকাউন্ট নেই? নিবন্ধন করুন' },
      invalid: { en: 'Invalid email or password', bn: 'অবৈধ ইমেল বা পাসওয়ার্ড' },
      logging: { en: 'Logging in...', bn: 'লগইন করছে...' },
      verifyEmail: { en: 'Please verify your email before logging in', bn: 'লগইন করার আগে আপনার ইমেল যাচাই করুন' },
      emailRequired: { en: 'Email is required', bn: 'ইমেল প্রয়োজন' },
      passwordRequired: { en: 'Password is required', bn: 'পাসওয়ার্ড প্রয়োজন' }
    };
    return translations[key]?.[language] || key;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validate form
    if (!formData.email) {
      setError(t('emailRequired'));
      setSubmitting(false);
      return;
    }

    if (!formData.password) {
      setError(t('passwordRequired'));
      setSubmitting(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(language === 'bn' ? 'সঠিক ইমেল ঠিকানা দিন' : 'Please enter a valid email address');
      setSubmitting(false);
      return;
    }

    try {
      // Appwrite Authentication
      await loginUser(formData.email, formData.password);
      
      // Get current user
      const user = await getCurrentUser();
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message?.includes('invalid') || error.message?.includes('credentials')) {
        setError(t('invalid'));
      } else if (error.message?.includes('email')) {
        setError(language === 'bn' ? 'অবৈধ ইমেল ঠিকানা' : 'Invalid email address');
      } else if (error.message?.includes('too many')) {
        setError(language === 'bn' ? 'অনেক চেষ্টা করেছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।' : 'Too many attempts. Please try again later.');
      } else {
        setError(language === 'bn' ? 'লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
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
            <span style={{ fontFamily: 'serif', fontSize: '24px', color: '#dc2626', letterSpacing: '-0.01em' }}>রক্তকরবী</span>
            <span style={{ fontSize: '10px', color: '#1B5E6B', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginTop: '2px' }}>RoktoKorobi</span>
          </div>
        </Link>
        <Link href="/" style={{ background: '#dc2626', color: '#fff', padding: '10px 26px', borderRadius: '100px', fontWeight: 600, fontSize: '13px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(220,38,38,0.3)' }}>
          {t('back')}
        </Link>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#F5EDD8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '450px', width: '100%', padding: '20px' }}>
          
          {/* Login Card */}
          <div style={{
            background: '#FDFAF4', borderRadius: '24px', padding: '48px',
            boxShadow: '0 4px 60px rgba(26,15,10,0.06)', border: '1px solid rgba(192,21,42,0.08)'
          }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1A0F0A', marginBottom: '12px' }}>
                {t('title')}
              </h1>
              <p style={{ fontSize: '16px', color: '#3D2314', lineHeight: 1.6 }}>
                {t('subtitle')}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px',
                padding: '12px 16px', marginBottom: '24px', color: '#DC2626', fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Email */}
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
                  placeholder={language === 'bn' ? 'আপনার ইমেল লিখুন' : 'Enter your email'}
                  style={{
                    width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                    borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                    outline: 'none', transition: 'all 0.3s'
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                  {t('password')} *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder={language === 'bn' ? 'আপনার পাসওয়ার্ড লিখুন' : 'Enter your password'}
                  style={{
                    width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                    borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                    outline: 'none', transition: 'all 0.3s'
                  }}
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3D2314' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                  {t('remember')}
                </label>
                <Link href="/forgot-password" style={{ color: '#dc2626', textDecoration: 'none' }}>
                  {t('forgot')}
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', padding: '16px', background: '#dc2626',
                  color: '#fff', border: 'none', borderRadius: '14px',
                  fontSize: '16px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s', boxShadow: '0 8px 24px rgba(220,38,38,0.3)',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? t('logging') : t('login')}
              </button>
            </form>

            {/* Demo Account Info */}
            <div style={{
              background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '12px',
              padding: '16px', marginTop: '24px', fontSize: '12px', color: '#92400E'
            }}>
              <strong>{language === 'bn' ? 'ডেমো অ্যাকাউন্ট:' : 'Demo Account:'}</strong><br />
              Email: test@example.com<br />
              Password: password
            </div>
          </div>

          {/* Signup Link */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/register" style={{ color: '#dc2626', textDecoration: 'none', fontSize: '16px' }}>
              {t('signup')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
