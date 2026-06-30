'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(150deg, #faf5f0 0%, #fef5f5 45%, #fff9f5 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: '#FDFAF4',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: '0 4px 60px rgba(26,15,10,0.06)',
        border: '1px solid rgba(192,21,42,0.08)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚨</div>
        
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1A0F0A',
          marginBottom: '16px',
          fontFamily: 'serif'
        }}>
          Something went wrong
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#5c2a2a',
          lineHeight: 1.6,
          marginBottom: '32px'
        }}>
          We apologize for the inconvenience. An unexpected error occurred. Our team has been notified and is working to fix the issue.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left',
            overflow: 'auto',
            maxHeight: '200px'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#DC2626',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              Error Details (Development Mode):
            </p>
            <pre style={{
              fontSize: '12px',
              color: '#991B1B',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              background: '#dc2626',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: '14px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(220,38,38,0.3)',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(220,38,38,0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,38,38,0.3)';
            }}
          >
            Try Again
          </button>
          
          <a
            href="/"
            style={{
              background: '#FDFAF4',
              color: '#dc2626',
              padding: '14px 32px',
              borderRadius: '14px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 600,
              border: '2px solid #dc2626',
              transition: 'all 0.3s',
              display: 'inline-block'
            }}
          >
            Go to Home
          </a>
        </div>

        <div style={{ marginTop: '32px' }}>
          <p style={{ fontSize: '14px', color: '#7a4040' }}>
            If the problem persists, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
