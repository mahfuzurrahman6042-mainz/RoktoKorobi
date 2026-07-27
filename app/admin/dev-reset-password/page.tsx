'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DevResetPasswordPage() {
  const [email, setEmail] = useState('mahfuzurrahman6042@gmail.com');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    if (!email || !newPassword || newPassword.length < 6) {
      setError('Please enter email and password (min 6 characters)');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/dev-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successfully! You can now login with your new password.');
        setNewPassword('');
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8', fontFamily: "'DM Sans', sans-serif", padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '450px', width: '100%' }}>
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '12px', color: '#92400E' }}>
          <strong>⚠️ Development Only</strong><br />
          This is a development tool. Do not use in production.
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1A0808', marginBottom: '8px', textAlign: 'center' }}>
          Developer Password Reset
        </h1>
        <p style={{ fontSize: '14px', color: '#6B5045', marginBottom: '24px', textAlign: 'center' }}>
          Reset password for any user (development only)
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1A0808', marginBottom: '8px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
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
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#6B5045' }}>
          <a href="/login" style={{ color: '#8B1A1A', textDecoration: 'none' }}>
            ← Go to Login
          </a>
        </div>
      </div>
    </div>
  );
}
