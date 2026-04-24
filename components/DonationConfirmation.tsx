'use client';

import { useState } from 'react';

interface DonationConfirmationProps {
  donationId: string;
  role: 'donor' | 'recipient';
  onConfirm?: () => void;
}

export default function DonationConfirmation({ donationId, role, onConfirm }: DonationConfirmationProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/donation/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId, role })
      });

      if (!response.ok) {
        throw new Error('Failed to confirm donation');
      }

      setConfirmed(true);
      if (onConfirm) onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm');
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div style={{
        padding: '24px',
        background: '#E8F5E9',
        borderRadius: '12px',
        textAlign: 'center',
        border: '2px solid #4CAF50'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
        <h3 style={{ color: '#2E7D32', marginBottom: '8px' }}>
          {role === 'donor' ? 'Thank You for Your Donation!' : 'Blood Received Successfully!'}
        </h3>
        <p style={{ color: '#666' }}>
          {role === 'donor' 
            ? 'Your donation has been confirmed. You have saved a life today!'
            : 'The donation has been confirmed. Thank you for using RoktoKorobi!'
          }
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #ddd'
    }}>
      <h3 style={{ color: '#212121', marginBottom: '12px' }}>
        {role === 'donor' ? 'Did you complete your donation?' : 'Did you receive the blood?'}
      </h3>
      <p style={{ color: '#666', marginBottom: '16px', lineHeight: '1.6' }}>
        {role === 'donor'
          ? 'Please confirm that you have successfully donated blood at the donation center.'
          : 'Please confirm that you have received the blood from the donor.'
        }
      </p>
      
      {error && (
        <div style={{
          padding: '12px',
          background: '#FFEBEE',
          borderRadius: '8px',
          marginBottom: '16px',
          color: '#C62828',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={loading}
        style={{
          width: '100%',
          padding: '16px',
          background: loading ? '#9E9E9E' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? 'Confirming...' : role === 'donor' ? '✅ Yes, I Have Donated Blood' : '✅ Yes, I Have Received Blood'}
      </button>
      
      <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '12px', textAlign: 'center' }}>
        This action cannot be undone. Please confirm only when the donation is complete.
      </p>
    </div>
  );
}
