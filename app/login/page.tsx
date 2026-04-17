'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { sanitizeInput, validateEmail, validatePassword } from '@/lib/validation';

export default function LoginPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuperAdminSignup, setIsSuperAdminSignup] = useState(false);
  const router = useRouter();

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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', sanitizedEmail)
        .single();

      if (error || !data) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      // Verify hashed password
      const isPasswordValid = await verifyPassword(formData.password, data.password);
      if (!isPasswordValid) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      // Store only non-sensitive user info in localStorage
      const safeUserData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        is_donor: data.is_donor,
      };
      localStorage.setItem('user', JSON.stringify(safeUserData));
      
      // Redirect based on role
      switch (data.role) {
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
      // Check if super admin already exists
      const { data: existingAdmin } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'super_admin')
        .single();

      if (existingAdmin) {
        setError('Super admin already exists. Contact the existing super admin.');
        setLoading(false);
        return;
      }

      // Hash password before storing
      const hashedPassword = await hashPassword(formData.password);

      // Create super admin
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            name: 'Super Admin',
            email: sanitizedEmail,
            password: hashedPassword,
            role: 'super_admin',
            is_donor: false,
            age: 18,
            location: 'System',
            weight: 50,
          },
        ]);

      if (insertError) throw insertError;

      // Login the new super admin
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (data) {
        // Store only non-sensitive user info in localStorage
        const safeUserData = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          is_donor: data.is_donor,
        };
        localStorage.setItem('user', JSON.stringify(safeUserData));
        router.push('/dashboard/super-admin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Super admin signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#e53935', fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>
        {isSuperAdminSignup ? '👑 ' + t('superAdminSignup') : '🔐 ' + t('loginTitle')}
      </h1>

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

      <form onSubmit={isSuperAdminSignup ? handleSuperAdminSignup : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          {loading ? t('loading') : isSuperAdminSignup ? t('superAdminSignup') : t('loginBtn')}
        </button>
      </form>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setIsSuperAdminSignup(!isSuperAdminSignup)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          {isSuperAdminSignup ? t('login') : t('superAdminSignup')}
        </button>
      </div>

      {!isSuperAdminSignup && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <a href="/register" style={{ color: '#2196f3', textDecoration: 'none' }}>
            {t('noAccount')} {t('registerLink')}
          </a>
        </div>
      )}
    </div>
  );
}
