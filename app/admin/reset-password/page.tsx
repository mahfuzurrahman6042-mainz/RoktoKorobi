'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { updatePassword as updatePasswordAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const user = auth?.currentUser;
      if (!user) {
        setError('No user is currently logged in. Please login first.');
        setLoading(false);
        return;
      }

      await updatePasswordAuth(user, newPassword);
      setMessage('Password updated successfully! You can now login with your new password.');

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setError('You need to re-login before changing your password. Please logout and login again.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1A0808', marginBottom: '8px', textAlign: 'center' }}>
          Reset Password
        </h1>
        <p style={{ fontSize: '14px', color: '#6B5045', marginBottom: '24px', textAlign: 'center' }}>
          Set a new password for your account
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1A0808', marginBottom: '8px' }}>
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 6 characters)"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E0D5C9',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {message}
          </div>
        )}

        <button
          onClick={handleResetPassword}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#9E1621' : '#8B1A1A',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#6B5045' }}>
          <a href="/dashboard" style={{ color: '#8B1A1A', textDecoration: 'none' }}>
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
