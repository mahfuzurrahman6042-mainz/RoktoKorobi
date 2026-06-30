"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/lib/firebase';

export default function ForgotPassword() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('en');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
  }, []);

  const t = (key: string) => {
    const translations: Record<string, any> = {
      title: { en: 'Reset Password', bn: 'পাসওয়ার্ড পুনরায় সেট করুন' },
      subtitle: { en: 'Enter your email address and we\'ll send you a link to reset your password', bn: 'আপনার ইমেল ঠিকানা দিন এবং আমরা আপনাকে পাসওয়ার্ড পুনরায় সেট করার লিঙ্ক পাঠাব' },
      email: { en: 'Email Address', bn: 'ইমেল ঠিকানা' },
      submit: { en: 'Send Reset Link', bn: 'রিসেট লিঙ্ক পাঠান' },
      submitting: { en: 'Sending...', bn: 'পাঠানো হচ্ছে...' },
      back: { en: 'Back to Login', bn: 'লগইনে ফিরে যান' },
      success: { en: 'Password reset email sent! Check your inbox for instructions.', bn: 'পাসওয়ার্ড রিসেট ইমেল পাঠানো হয়েছে! নির্দেশাবলীর জন্য আপনার ইনবক্স চেক করুন।' },
      invalid: { en: 'Please enter a valid email address', bn: 'অনুগ্রহ করে একটি সঠিক ইমেল ঠিকানা দিন' },
      error: { en: 'Failed to send reset email. Please try again.', bn: 'রিসেট ইমেল পাঠাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' },
      emailRequired: { en: 'Email is required', bn: 'ইমেল প্রয়োজন' }
    };
    return translations[key]?.[language] || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validate email
    if (!email) {
      setError(t('emailRequired'));
      setSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('invalid'));
      setSubmitting(false);
      return;
    }

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(t('error'));
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
        <Link href="/login" style={{ background: '#dc2626', color: '#fff', padding: '10px 26px', borderRadius: '100px', fontWeight: 600, fontSize: '13px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(220,38,38,0.3)' }}>
          {t('back')}
        </Link>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#F5EDD8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '450px', width: '100%', padding: '20px' }}>
          
          {/* Reset Card */}
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

            {/* Success Message */}
            {success ? (
              <div style={{
                background: '#E8F5E8', border: '2px solid #22C55E', borderRadius: '12px',
                padding: '20px', marginBottom: '24px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✉️</div>
                <p style={{ color: '#166534', fontSize: '15px', fontWeight: 500 }}>
                  {t('success')}
                </p>
              </div>
            ) : (
              <>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={language === 'bn' ? 'আপনার ইমেল লিখুন' : 'Enter your email'}
                      style={{
                        width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    />
                  </div>

                  {/* Submit Button */}
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
                    {submitting ? t('submitting') : t('submit')}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
