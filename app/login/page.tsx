'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { supabase } from '@/lib/supabase';
import { sanitizeInput, validateEmail, validatePassword } from '@/lib/validation';
import { hashPassword, verifyPassword } from '@/lib/auth';

export default function LoginPage() {
  const { t, language } = useLanguage();
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
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
      padding: '20px'
    }}>
      <div className="card" style={{ 
        maxWidth: '450px',
        width: '100%',
        padding: '40px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #E53935 0%, #FF5252 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🩸
          </div>
          <h1 style={{ 
            color: '#212121', 
            fontSize: '2rem', 
            marginBottom: '0.5rem',
            fontWeight: 'bold' 
          }}>
            {isSuperAdminSignup ? '👑 ' + t('superAdminSignup') : '🔐 ' + t('loginTitle')}
          </h1>
          <p style={{ color: '#757575', fontSize: '1rem' }}>
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
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #fcc',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={isSuperAdminSignup ? handleSuperAdminSignup : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '600',
              color: '#212121',
              fontSize: '0.9rem'
            }}>
              {t('email')}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder={language === 'bn' ? 'আপনার ইমেইল' : 'your@email.com'}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '600',
              color: '#212121',
              fontSize: '0.9rem'
            }}>
              {t('password')}
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input"
              placeholder={language === 'bn' ? 'আপনার পাসওয়ার্ড' : '••••••••'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1rem',
              fontWeight: 'bold',
              marginTop: '0.5rem'
            }}
          >
            {loading ? t('loading') : isSuperAdminSignup ? t('superAdminSignup') : t('loginBtn')}
          </button>
        </form>

        {allowSuperAdminSignup && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setIsSuperAdminSignup(!isSuperAdminSignup)}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: '#E53935',
                border: '2px solid #E53935',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#E53935';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#E53935';
              }}
            >
              {isSuperAdminSignup ? t('login') : t('superAdminSignup')}
            </button>
          </div>
        )}

        {!isSuperAdminSignup && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
            <span style={{ color: '#757575' }}>
              {t('noAccount')}{' '}
            </span>
            <a 
              href="/register" 
              style={{ 
                color: '#E53935', 
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'color 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#C62828';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#E53935';
              }}
            >
              {t('registerLink')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
