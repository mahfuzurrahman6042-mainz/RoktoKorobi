import React from 'react';

const items = [
  "DONATE BLOOD", "SAVE LIVES", "24/7 SUPPORT",
  "COUNTRY WIDE NETWORK", "EMERGENCY SOS", "VERIFIED DONORS",
  "FREE SERVICE", "INSTANT BLOOD REQUEST", "JOIN AS A DONOR",
  "SAFE & TRUSTED", "REAL TIME ALERTS",
  "BANGLADESH'S LARGEST PLATFORM", "BLOOD DONATION SAVES LIVES",
  "EVERY DROP COUNTS", "BE A HERO TODAY", "HELP SOMEONE IN NEED",
  "QUICK RESPONSE", "RELIABLE SERVICE", "COMMUNITY SUPPORT",
  "LIFE SAVING MISSION", "BLOOD CONNECTS US ALL", "MAKE A DIFFERENCE",
  "URGENT BLOOD NEEDED", "DONATE NOW", "SAVE A LIFE TODAY",
];

const TickerBanner = () => {
  const octupled = [...items, ...items, ...items, ...items, ...items, ...items, ...items, ...items];
  return (
    <div style={{
      backgroundColor: '#1C1008',
      paddingTop: '14px',
      paddingBottom: '14px',
      width: '100%',
      overflow: 'hidden',
      marginTop: '32px',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', width: 'max-content',
        animation: 'ticker 35s linear infinite', willChange: 'transform' }}>
        {octupled.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex',
            alignItems: 'center', color: '#E8DCC8', fontSize: '12px',
            fontWeight: '500', letterSpacing: '3px',
            whiteSpace: 'nowrap', paddingRight: '100px' }}>
            <span style={{ color: '#DC2626', fontSize: '9px',
              marginRight: '16px' }}>●</span>
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-12.5%); }
        }
        @media (max-width: 768px) {
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-25%); }
          }
        }
      `}</style>
    </div>
  );
};

export default TickerBanner;
