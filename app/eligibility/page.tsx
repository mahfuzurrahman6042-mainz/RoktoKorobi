'use client';

import { useState } from 'react';
import { useEligibility } from '@/lib/hooks/useEligibility';

export default function EligibilityPage() {
  const [donorId, setDonorId] = useState('');
  const { status, loading, error } = useEligibility(donorId || undefined);

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#e53935', fontSize: '2rem', marginBottom: '1rem' }}>
        🩺 Check Donation Eligibility
      </h1>

      <div style={{
        padding: '1.5rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Enter Donor ID
        </label>
        <input
          type="text"
          value={donorId}
          onChange={(e) => setDonorId(e.target.value)}
          placeholder="Enter your donor ID"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Checking eligibility...</div>
      )}

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

      {status && (
        <div style={{
          padding: '2rem',
          backgroundColor: status.isEligible ? '#e8f5e9' : '#ffebee',
          border: `2px solid ${status.isEligible ? '#4caf50' : '#f44336'}`,
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '0.5rem'
            }}>
              {status.isEligible ? '✅' : '❌'}
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              color: status.isEligible ? '#2e7d32' : '#c62828',
              margin: 0
            }}>
              {status.isEligible ? 'Eligible to Donate' : 'Not Eligible'}
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 'bold' }}>Days Since Last Donation:</span>
              <span style={{ fontSize: '1.2rem' }}>
                {status.daysSince === null ? 'Never donated' : `${status.daysSince} days`}
              </span>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 'bold' }}>Days Until Eligible:</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e53935' }}>
                {status.daysUntilEligible === 0 ? 'Now!' : `${status.daysUntilEligible} days`}
              </span>
            </div>

            {status.nextEligibleDate && (
              <div style={{
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 'bold' }}>Next Eligible Date:</span>
                <span style={{ fontSize: '1.2rem' }}>
                  {new Date(status.nextEligibleDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {!status.isEligible && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#fff3e0',
              borderRadius: '8px',
              borderLeft: '4px solid #ff9800'
            }}>
              <strong>Note:</strong> You must wait at least 90 days between blood donations.
            </div>
          )}
        </div>
      )}

      {!donorId && (
        <div style={{
          padding: '2rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#1565c0'
        }}>
          <p style={{ fontSize: '1.1rem' }}>
            Enter your donor ID above to check your donation eligibility status.
          </p>
        </div>
      )}
    </div>
  );
}
