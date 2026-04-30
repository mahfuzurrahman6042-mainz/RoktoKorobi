'use client';

import { useState, useEffect } from 'react';

interface DonationConfirmationProps {
  donationId: string;
  role: 'donor' | 'recipient';
  onConfirm?: () => void;
  donationData?: any;
}

export default function DonationConfirmation({ donationId, role, onConfirm, donationData }: DonationConfirmationProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Calculate time remaining for auto-complete
  useEffect(() => {
    if (donationData?.auto_complete_at && !donationData?.dispute_raised) {
      const interval = setInterval(() => {
        const now = new Date();
        const autoCompleteTime = new Date(donationData.auto_complete_at);
        const diff = autoCompleteTime.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeRemaining('Auto-completing soon...');
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeRemaining(`${hours}h ${minutes}m remaining`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [donationData]);

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
        const data = await response.json();
        throw new Error(data.error || 'Failed to confirm donation');
      }

      setConfirmed(true);
      if (onConfirm) onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm');
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/donation/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId, reason: disputeReason })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to raise dispute');
      }

      alert('Dispute raised successfully. An admin will review this case.');
      setShowDispute(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to raise dispute');
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
            : 'The donation has been confirmed. Thank you for using RoktoKorobi!'}
        </p>
        {timeRemaining && (
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '8px' }}>
            ⏱️ {timeRemaining}
          </p>
        )}
      </div>
    );
  }

  if (donationData?.dispute_raised) {
    return (
      <div style={{
        padding: '24px',
        background: '#FFF3E0',
        borderRadius: '12px',
        textAlign: 'center',
        border: '2px solid #FF9800'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
        <h3 style={{ color: '#E65100', marginBottom: '8px' }}>
          Dispute Raised
        </h3>
        <p style={{ color: '#666' }}>
          A dispute has been raised for this donation. An admin will review this case.
        </p>
      </div>
    );
  }

  const isDonorConfirmed = donationData?.donor_confirmed;
  const isRecipientConfirmed = donationData?.recipient_confirmed;
  const hasAnyConfirmation = isDonorConfirmed || isRecipientConfirmed;
  const isOtherPartyConfirmed = role === 'donor' ? isRecipientConfirmed : isDonorConfirmed;

  return (
    <div 
      role="dialog" 
      aria-labelledby="confirmation-title" 
      aria-describedby="confirmation-description"
      style={{
        padding: '24px',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #ddd'
      }}>
      <h3 id="confirmation-title" style={{ color: '#212121', marginBottom: '12px' }}>
        {role === 'donor' ? 'Did you complete your donation?' : 'Did you receive the blood?'}
      </h3>
      
      {isOtherPartyConfirmed && (
        <div style={{
          padding: '12px',
          background: '#E3F2FD',
          borderRadius: '8px',
          marginBottom: '16px',
          color: '#1565C0',
          fontSize: '0.9rem'
        }}>
          {role === 'donor' ? '✅ Recipient has confirmed' : '✅ Donor has confirmed'}
        </div>
      )}

      <p id="confirmation-description" style={{ color: '#666', marginBottom: '16px', lineHeight: '1.6' }}>
        {role === 'donor'
          ? 'Please confirm that you have successfully donated blood at the donation center.'
          : 'Please confirm that you have received the blood from the donor.'}
      </p>
      
      {hasAnyConfirmation && timeRemaining && (
        <div style={{
          padding: '12px',
          background: '#F5F5F5',
          borderRadius: '8px',
          marginBottom: '16px',
          color: '#666',
          fontSize: '0.9rem',
          textAlign: 'center'
        }}>
          ⏱️ Auto-complete in: {timeRemaining}
        </div>
      )}
      
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
        disabled={loading || donationData?.dispute_raised}
        style={{
          width: '100%',
          padding: '16px',
          background: loading ? '#9E9E9E' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: loading || donationData?.dispute_raised ? 'not-allowed' : 'pointer',
          opacity: loading || donationData?.dispute_raised ? 0.6 : 1
        }}
      >
        {loading ? 'Confirming...' : role === 'donor' ? '✅ Yes, I Have Donated Blood' : '✅ Yes, I Have Received Blood'}
      </button>
      
      {hasAnyConfirmation && !donationData?.dispute_raised && (
        <button
          onClick={() => setShowDispute(!showDispute)}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            color: '#F44336',
            border: '1px solid #F44336',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '12px'
          }}
        >
          ⚠️ Raise Dispute
        </button>
      )}

      {showDispute && (
        <div style={{ marginTop: '16px' }}>
          <textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            placeholder="Please explain why you want to raise a dispute..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.9rem',
              minHeight: '80px',
              marginBottom: '12px'
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDispute}
              disabled={loading || !disputeReason}
              style={{
                flex: 1,
                padding: '12px',
                background: loading ? '#9E9E9E' : '#F44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: loading || !disputeReason ? 'not-allowed' : 'pointer'
              }}
            >
              Submit Dispute
            </button>
            <button
              onClick={() => setShowDispute(false)}
              style={{
                flex: 1,
                padding: '12px',
                background: '#F5F5F5',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '12px', textAlign: 'center' }}>
        {hasAnyConfirmation 
          ? 'This action cannot be undone. Please confirm only when the donation is complete.'
          : 'Single-party confirmation: Only one person needs to confirm. Auto-completes in 6 hours if no dispute.'}
      </p>
    </div>
  );
}
