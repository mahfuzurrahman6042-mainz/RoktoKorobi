'use client';

import { useState, useEffect } from 'react';

export default function EligibilityPage() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [result, setResult] = useState<{ eligible: boolean; reason: string } | null>(null);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      checkEligibility: { en: 'Check Eligibility', bn: 'যোগ্যতা যাচাই করুন' },
      age: { en: 'Age', bn: 'বয়স' },
      weight: { en: 'Weight (kg)', bn: 'ওজন (কেজি)' },
      healthStatus: { en: 'Health Status', bn: 'স্বাস্থ্য অবস্থা' },
      goodHealth: { en: 'Good Health', bn: 'ভালো স্বাস্থ্য' },
      check: { en: 'Check', bn: 'যাচাই করুন' },
      eligible: { en: 'Eligible', bn: 'যোগ্য' },
      notEligible: { en: 'Not Eligible', bn: 'যোগ্য নয়' },
      reason: { en: 'Reason', bn: 'কারণ' },
      ageReason: { en: 'You must be between 18 and 65 years old', bn: 'আপনার বয়স ১৮ থেকে ৬৫ বছরের মধ্যে হতে হবে' },
      weightReason: { en: 'You must weigh at least 50 kg', bn: 'আপনার ওজন কমপক্ষে ৫০ কেজি হতে হবে' },
      healthReason: { en: 'You must be in good health', bn: 'আপনার স্বাস্থ্য ভালো থাকতে হবে' },
      enterDetails: { en: 'Enter your details to check eligibility', bn: 'যোগ্যতা যাচাই করতে আপনার বিবরণ লিখুন' },
    };
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
  }, []);

  const handleCheck = () => {
    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);

    if (!age || !weight || !healthStatus) {
      setResult({ eligible: false, reason: 'Please fill in all fields' });
      return;
    }

    if (isNaN(ageNum) || isNaN(weightNum)) {
      setResult({ eligible: false, reason: 'Please enter valid numbers for age and weight' });
      return;
    }

    if (ageNum < 18 || ageNum > 65) {
      setResult({ eligible: false, reason: t('ageReason') });
      return;
    }

    if (weightNum < 50) {
      setResult({ eligible: false, reason: t('weightReason') });
      return;
    }

    if (healthStatus !== 'good') {
      setResult({ eligible: false, reason: t('healthReason') });
      return;
    }

    setResult({ eligible: true, reason: 'You meet all eligibility criteria' });
  };

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h1 style={{ color: '#e53935', fontSize: '2rem', marginBottom: '1rem' }}>
        🩺 {t('checkEligibility')}
      </h1>

      <div style={{
        padding: '1.5rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {t('age')}
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="18-65"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {t('weight')}
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="50+"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {t('healthStatus')}
          </label>
          <select
            value={healthStatus}
            onChange={(e) => setHealthStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          >
            <option value="">Select...</option>
            <option value="good">{t('goodHealth')}</option>
            <option value="poor">Poor Health</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleCheck}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#e53935',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {t('check')}
        </button>
      </div>

      {result && (
        <div style={{
          padding: '2rem',
          backgroundColor: result.eligible ? '#e8f5e9' : '#ffebee',
          border: `2px solid ${result.eligible ? '#4caf50' : '#f44336'}`,
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
              {result.eligible ? '✅' : '❌'}
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              color: result.eligible ? '#2e7d32' : '#c62828',
              margin: 0
            }}>
              {result.eligible ? t('eligible') : t('notEligible')}
            </h2>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <span style={{ fontWeight: 'bold' }}>{t('reason')}:</span>
            <span style={{ marginLeft: '0.5rem' }}>{result.reason}</span>
          </div>
        </div>
      )}

      {!result && (
        <div style={{
          padding: '2rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#1565c0'
        }}>
          <p style={{ fontSize: '1.1rem' }}>
            {t('enterDetails')}
          </p>
        </div>
      )}
    </div>
  );
}
