"use client";

import { useState, useEffect } from 'react';

const urgencyColors = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#A32D2D'
};

const urgencyLabels = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  critical: 'CRITICAL'
};

export default function BloodRequestCard({
  patientName,
  bloodType,
  hospital,
  location,
  contact,
  units,
  message,
  urgency = 'medium',
  timeAgo = '2 min ago',
  donorCount = 0,
  expiresIn,
  status = 'active'
}) {
  const [timeLeft, setTimeLeft] = useState(expiresIn || '2h 30m');

  useEffect(() => {
    if (expiresIn) {
      const timer = setInterval(() => {
        // Simple countdown logic - in production, you'd calculate from actual timestamp
        setTimeLeft(expiresIn);
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [expiresIn]);

  const urgencyColor = urgencyColors[urgency] || urgencyColors.medium;
  const urgencyLabel = urgencyLabels[urgency] || 'MEDIUM';

  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #f0d9d9',
      borderRadius: '20px',
      boxShadow: '0 8px 30px rgba(220,38,38,.06)',
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(220,38,38,.5); }
          70% { box-shadow: 0 0 0 10px rgba(220,38,38,0); }
          100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
          display: inline-block;
          animation: pulseRing 1.8s ease-out infinite;
        }
      `}</style>

      {/* Top Urgency Strip */}
      <div style={{
        background: urgencyColor,
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '2px',
          color: '#fff',
          textTransform: 'uppercase'
        }}>
          <span className="pulse-dot" />
          {urgencyLabel} · NEEDS BLOOD NOW
        </div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          fontWeight: '500',
          color: 'rgba(255,255,255,0.9)'
        }}>
          {timeAgo}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '24px' }}>
        {/* Main Content Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px'
        }}>
          {/* Left: Blood Type + Patient Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {/* Blood Type Badge */}
              <div style={{
                background: 'rgba(220,38,38,0.1)',
                border: '2px solid #dc2626',
                borderRadius: '12px',
                padding: '8px 16px',
                fontFamily: "'Playfair Display', serif",
                fontSize: '20px',
                fontWeight: '700',
                color: '#dc2626'
              }}>
                {bloodType}
              </div>
              {/* Patient Name */}
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '18px',
                fontWeight: '700',
                color: '#2d1515'
              }}>
                {patientName}
              </div>
            </div>
            {/* Hospital */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: '#7a4040',
              marginBottom: '4px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9"/>
              </svg>
              {hospital}
            </div>
          </div>

          {/* Right: Units Needed */}
          <div style={{
            textAlign: 'right',
            background: 'rgba(220,38,38,0.05)',
            borderRadius: '12px',
            padding: '12px 20px'
          }}>
            <div style={{
              fontFamily: "'Playfair Display", serif',
              fontSize: '28px',
              fontWeight: '700',
              color: '#dc2626',
              lineHeight: 1
            }}>
              {units}
            </div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '1.5px',
              color: '#9b6060',
              textTransform: 'uppercase',
              marginTop: '4px'
            }}>
              Units
            </div>
          </div>
        </div>

        {/* Info Tiles: Location | Contact */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '16px'
        }}>
          {/* Location */}
          <div style={{
            background: '#fdf6ee',
            borderRadius: '12px',
            padding: '12px 16px',
            border: '1px solid #f0d9d9'
          }}>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '1.5px',
              color: '#9b6060',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              Location
            </div>
            <div style={{
              fontFamily: "'DM Sans", sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              color: '#2d1515'
            }}>
              {location}
            </div>
          </div>
          {/* Contact */}
          <div style={{
            background: '#fdf6ee',
            borderRadius: '12px',
            padding: '12px 16px',
            border: '1px solid #f0d9d9'
          }}>
            <div style={{
              fontFamily: "'DM Sans", sans-serif',
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '1.5px',
              color: '#9b6060',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              Contact
            </div>
            <div style={{
              fontFamily: "'DM Sans", sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              color: '#2d1515'
            }}>
              {contact}
            </div>
          </div>
        </div>

        {/* Optional Message */}
        {message && (
          <div style={{
            background: 'rgba(220,38,38,0.03)',
            borderLeft: '3px solid #dc2626',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontStyle: 'italic'
          }}>
            <div style={{
              fontFamily: "'DM Sans", sans-serif',
              fontSize: '14px',
              color: '#7a4040',
              lineHeight: '1.6'
            }}>
              {message}
            </div>
          </div>
        )}

        {/* Bottom Row: Status + Donate Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px solid #f0d9d9'
        }}>
          {/* Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#dcfce7',
              border: '1px solid #22c55e',
              borderRadius: '99px',
              padding: '6px 14px',
              fontFamily: "'DM Sans", sans-serif',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '1px',
              color: '#166534',
              textTransform: 'uppercase'
            }}>
              Active
            </div>
            <div style={{
              fontFamily: "'DM Sans", sans-serif',
              fontSize: '13px',
              color: '#7a4040'
            }}>
              {donorCount} {donorCount === 1 ? 'donor' : 'donors'} responded
            </div>
          </div>

          {/* I Can Donate Button */}
          <button style={{
            background: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontFamily: "'DM Sans", sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(220,38,38,.2)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#b91c1c';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(220,38,38,.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#dc2626';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(220,38,38,.2)';
          }}>
            I Can Donate
          </button>
        </div>
      </div>

      {/* Card Footer */}
      <div style={{
        background: '#fdf6ee',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #f0d9d9'
      }}>
        {/* Share | Save Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{
            background: '#fff',
            border: '1.5px solid #f0d9d9',
            borderRadius: '8px',
            padding: '8px 16px',
            fontFamily: "'DM Sans", sans-serif',
            fontSize: '12px',
            fontWeight: '600',
            color: '#7a4040',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#dc2626';
            e.currentTarget.style.color = '#dc2626';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#f0d9d9';
            e.currentTarget.style.color = '#7a4040';
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
            </svg>
            Share
          </button>
          <button style={{
            background: '#fff',
            border: '1.5px solid #f0d9d9',
            borderRadius: '8px',
            padding: '8px 16px',
            fontFamily: "'DM Sans", sans-serif',
            fontSize: '12px',
            fontWeight: '600',
            color: '#7a4040',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#dc2626';
            e.currentTarget.style.color = '#dc2626';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#f0d9d9';
            e.currentTarget.style.color = '#7a4040';
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            Save
          </button>
        </div>

        {/* Expires In */}
        <div style={{
          fontFamily: "'DM Sans", sans-serif',
          fontSize: '12px',
          fontWeight: '500',
          color: '#9b6060'
        }}>
          Expires in {timeLeft}
        </div>
      </div>
    </div>
  );
}
