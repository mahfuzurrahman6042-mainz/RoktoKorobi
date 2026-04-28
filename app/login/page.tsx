'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { sanitizeInput, validateEmail, validatePassword } from '@/lib/validation';
import { hashPassword, verifyPassword } from '@/lib/auth';

export default function LoginPage() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: 'Login', bn: 'লগ ইন' },
      email: { en: 'Email', bn: 'ইমেইল' },
      password: { en: 'Password', bn: 'পাসওয়ার্ড' },
      login: { en: 'Login', bn: 'লগ ইন' },
      noAccount: { en: "Don't have an account?", bn: 'অ্যাকাউন্ট নেই?' },
      register: { en: 'Register', bn: 'রেজিস্টার' },
      superAdminSignup: { en: 'Super Admin Signup', bn: 'সুপার অ্যাডমিন সাইনআপ' },
    };
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
  }, []);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuperAdminSignup, setIsSuperAdminSignup] = useState(false);
  const [allowSuperAdminSignup, setAllowSuperAdminSignup] = useState(true);
  const router = useRouter();

  // Check if super admin signup is allowed
  useEffect(() => {
    const checkSuperAdminSignupSetting = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'self_claim_super_admin')
        .single();
      
      if (data) {
        setAllowSuperAdminSignup(data.value === 'true');
      }
    };
    
    checkSuperAdminSignupSetting();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Sanitize and validate inputs
    const sanitizedEmail = sanitizeInput(formData.email);
    
    if (!validateEmail(sanitizedEmail)) {
      setError('Invalid email address');
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      setLoading(false);
      return;
    }

    try {
      // Call the new login API route with httpOnly cookies
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Login failed');
        setLoading(false);
        return;
      }

      if (result.success && result.user) {
        // Redirect based on role
        switch (result.user.role) {
          case 'super_admin':
            router.push('/dashboard/super-admin');
            break;
          case 'admin':
            router.push('/dashboard/admin');
            break;
          case 'org_advocate':
            router.push('/dashboard/org-advocate');
            break;
          default:
            router.push('/');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Sanitize and validate inputs
    const sanitizedEmail = sanitizeInput(formData.email);
    
    if (!validateEmail(sanitizedEmail)) {
      setError('Invalid email address');
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      setLoading(false);
      return;
    }

    try {
      // Call the server-side API for super admin signup
      const response = await fetch('/api/auth/super-admin-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Super admin signup failed');
        setLoading(false);
        return;
      }

      // Login the new super admin using the API route
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          password: formData.password,
        }),
      });

      const loginResult = await loginResponse.json();

      if (loginResponse.ok && loginResult.success) {
        router.push('/dashboard/super-admin');
      } else {
        setError(loginResult.error || 'Login after signup failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Super admin signup failed');
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
            {isSuperAdminSignup 
              ? (language === 'bn' ? '👑 সুপার অ্যাডমিন সাইনআপ' : '👑 Super Admin Signup')
              : (language === 'bn' ? '🔐 লগ ইন' : '🔐 Login')
            }
          </h1>
          <p className="auth-sub">
            {language === 'bn' 
              ? isSuperAdminSignup 
                ? 'সুপার অ্যাডমিন অ্যাকাউন্ট তৈরি করুন'
                : 'আপনার অ্যাকাউন্টে লগ ইন করুন'
              : isSuperAdminSignup
                ? 'Create super admin account'
                : 'Sign in to your account'
            }
          </p>
        </div>

        {error && (
          <div className="auth-alert error">
            {error}
          </div>
        )}

        <form onSubmit={isSuperAdminSignup ? handleSuperAdminSignup : handleLogin} className="auth-form">
          <div className="form-row">
            <label className="form-label">{t('email')}</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
              placeholder={language === 'bn' ? 'আপনার ইমেইল' : 'your@email.com'}
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
              placeholder={language === 'bn' ? 'আপনার পাসওয়ার্ড' : '••••••••'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit"
          >
            {loading ? t('loading') : isSuperAdminSignup ? t('superAdminSignup') : t('loginBtn')}
          </button>
        </form>

        {allowSuperAdminSignup && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setIsSuperAdminSignup(!isSuperAdminSignup)}
              className="auth-link"
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: 'var(--blood)',
                border: '2px solid var(--blood)',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {isSuperAdminSignup ? t('login') : t('superAdminSignup')}
            </button>
          </div>
        )}

        {!isSuperAdminSignup && (
          <div className="auth-footer">
            <p>
              {t('noAccount')}{' '}
              <Link href="/register" className="auth-link">
                {t('registerLink')}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
