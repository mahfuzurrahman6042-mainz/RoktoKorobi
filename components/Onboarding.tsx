'use client';

import { useState, useEffect } from 'react';

interface OnboardingProps {
  onComplete?: () => void;
  language?: 'en' | 'bn';
}

export default function Onboarding({ onComplete = () => {}, language = 'en' }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      welcome: { en: 'Welcome to RoktoKorobi!', bn: 'রক্তকরবীতে স্বাগতম!' },
      welcomeDesc: { en: 'Your blood can save lives. Let us show you how.', bn: 'আপনার রক্ত জীবন বাঁচাতে পারে। আমরা আপনাকে দেখাব কীভাবে।' },
      step1Title: { en: 'Find Blood Donors', bn: 'রক্তদাতা খুঁজুন' },
      step1Desc: { en: 'Search for donors by blood group and location near you.', bn: 'রক্তের গ্রুপ এবং অবস্থান অনুযায়ী কাছাকাছি দাতা খুঁজুন।' },
      step2Title: { en: 'Request Blood', bn: 'রক্তের অনুরোধ করুন' },
      step2Desc: { en: 'Create a blood request when you or someone needs blood urgently.', bn: 'জরুরি প্রয়োজনে রক্তের অনুরোধ তৈরি করুন।' },
      step3Title: { en: 'Track Donors', bn: 'রক্তদাতা ট্র্যাক করুন' },
      step3Desc: { en: 'Track donors in real-time as they travel to the hospital.', bn: 'হাসপাতালে যাওয়ার সময় রক্তদাতাদের রিয়েল-টাইমে ট্র্যাক করুন।' },
      step4Title: { en: 'Earn Badges', bn: 'ব্যাজ অর্জন করুন' },
      step4Desc: { en: 'Get recognition for your donations with achievement badges.', bn: 'অর্জন ব্যাজের সাথে আপনার দানের স্বীকৃতি পান।' },
      next: { en: 'Next', bn: 'পরবর্তী' },
      skip: { en: 'Skip', bn: 'এড়িয়ে যান' },
      getStarted: { en: 'Get Started', bn: 'শুরু করুন' },
    };
    return translations[key]?.[language] || key;
  };

  const steps = [
    {
      icon: '🔍',
      title: t('step1Title'),
      description: t('step1Desc')
    },
    {
      icon: '🩸',
      title: t('step2Title'),
      description: t('step2Desc')
    },
    {
      icon: '📍',
      title: t('step3Title'),
      description: t('step3Desc')
    },
    {
      icon: '🏆',
      title: t('step4Title'),
      description: t('step4Desc')
    }
  ];

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenOnboarding');
    if (seen) {
      setHasSeenOnboarding(true);
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
    onComplete();
  };

  if (hasSeenOnboarding) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center'
      }}>
        {step === 0 ? (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🩸</div>
            <h2 style={{ color: '#E53935', fontSize: '1.8rem', marginBottom: '1rem' }}>
              {t('welcome')}
            </h2>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>
              {t('welcomeDesc')}
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {steps[step - 1].icon}
            </div>
            <h2 style={{ color: '#E53935', fontSize: '1.8rem', marginBottom: '1rem' }}>
              {steps[step - 1].title}
            </h2>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>
              {steps[step - 1].description}
            </p>
          </>
        )}

        {/* Progress Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: index === step - 1 ? '#E53935' : '#ddd'
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={handleSkip}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {t('skip')}
          </button>
          <button
            onClick={handleNext}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#E53935',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {step === steps.length ? t('getStarted') : t('next')}
          </button>
        </div>
      </div>
    </div>
  );
}
