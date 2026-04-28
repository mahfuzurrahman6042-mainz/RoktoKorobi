'use client';

import { useState, useEffect } from 'react';

export default function PrivacyPolicyPage() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: 'Privacy Policy', bn: 'গোপনীয়তা নীতি' },
      version: { en: 'Version 1.1', bn: 'সংস্করণ ১.১' },
      lastUpdated: { en: 'Last Updated', bn: 'সর্বশেষ আপডেট' },
      introduction: { en: 'Introduction', bn: 'ভূমিকা' },
      introductionText: { 
        en: 'RoktoKorobi ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our blood donation platform.',
        bn: 'রক্তকরবী ("আমরা", "আমাদের", বা "আমাদের") আপনার গোপনীয়তা রক্ষা করতে প্রতিশ্রুতিবদ্ধ। এই গোপনীয়তা নীতি ব্যাখ্যা করে যে আমরা কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষা করি যখন আপনি আমাদের রক্তদান প্ল্যাটফর্ম ব্যবহার করেন।'
      },
      informationWeCollect: { en: 'Information We Collect', bn: 'আমরা যে তথ্য সংগ্রহ করি' },
      personalInfo: { en: 'Personal Information', bn: 'ব্যক্তিগত তথ্য' },
      personalInfoText: {
        en: 'We collect personal information including your name, email address, phone number, blood group, age, weight, and location when you register as a donor or request blood.',
        bn: 'আমরা ব্যক্তিগত তথ্য সংগ্রহ করি যার মধ্যে আপনার নাম, ইমেইল ঠিকানা, ফোন নম্বর, রক্তের গ্রুপ, বয়স, ওজন এবং অবস্থান অন্তর্ভুক্ত যখন আপনি রক্তদাতা হিসাবে নিবন্ধন করেন বা রক্তের প্রয়োজন করেন।'
      },
      medicalInfo: { en: 'Medical Information', bn: 'চিকিৎসা তথ্য' },
      medicalInfoText: {
        en: 'We collect medical information related to blood donation eligibility, including your last donation date and any health conditions that may affect donation.',
        bn: 'আমরা রক্তদানের যোগ্যতা সম্পর্কিত চিকিৎসা তথ্য সংগ্রহ করি, যার মধ্যে আপনার শেষ রক্তদানের তারিখ এবং রক্তদানকে প্রভাবিত করতে পারে এমন কোনো স্বাস্থ্য অবস্থা অন্তর্ভুক্ত।'
      },
      locationInfo: { en: 'Location Information', bn: 'অবস্থান তথ্য' },
      locationInfoText: {
        en: 'We collect location information to help match donors with blood requests. This includes your general location (city/district) and, with your consent, GPS coordinates.',
        bn: 'আমরা রক্তদাতাদের রক্তের প্রয়োজনের সাথে মিলিয়ে দিতে সহায়তা করার জন্য অবস্থান তথ্য সংগ্রহ করি। এর মধ্যে আপনার সাধারণ অবস্থান (শহর/জেলা) এবং, আপনার সম্মতি সাপেক্ষে, GPS স্থানাঙ্ক অন্তর্ভুক্ত।'
      },
      howWeUseInfo: { en: 'How We Use Your Information', bn: 'আমরা কীভাবে আপনার তথ্য ব্যবহার করি' },
      matching: { en: 'Matching Donors with Requests', bn: 'রক্তদাতাদের প্রয়োজনের সাথে মিলিয়ে দেওয়া' },
      communication: { en: 'Communication', bn: 'যোগাযোগ' },
      communicationText: {
        en: 'We use your contact information to send important notifications about blood requests, donation reminders, and platform updates.',
        bn: 'আমরা আপনার যোগাযোগ তথ্য ব্যবহার করি রক্তের প্রয়োজন, রক্তদান স্মরণ এবং প্ল্যাটফর্ম আপডেট সম্পর্কে গুরুত্বপূর্ণ বিজ্ঞপ্তি পাঠানোর জন্য।'
      },
      improvement: { en: 'Service Improvement', bn: 'সেবা উন্নতি' },
      dataSecurity: { en: 'Data Security', bn: 'তথ্য নিরাপত্তা' },
      dataSecurityText: {
        en: 'We implement industry-standard security measures to protect your data, including encryption, secure authentication, and regular security audits.',
        bn: 'আমরা আপনার তথ্য রক্ষা করতে শিল্প-মানের নিরাপত্তা ব্যবস্থা বাস্তবায়ন করি, যার মধ্যে এনক্রিপশন, সুরক্ষিত প্রমাণীকরণ এবং নিয়মিত নিরাপত্তা অডিট অন্তর্ভুক্ত।'
      },
      dataSharing: { en: 'Data Sharing', bn: 'তথ্য ভাগাভাগি' },
      dataSharingText: {
        en: 'We do not sell your personal information. We only share your information with blood request recipients when you agree to donate, and with healthcare providers when necessary for emergency situations.',
        bn: 'আমরা আপনার ব্যক্তিগত তথ্য বিক্রি করি না। আমরা আপনার তথ্য শুধুমাত্র রক্তের প্রয়োজনে থাকা ব্যক্তিদের সাথে ভাগ করি যখন আপনি রক্তদানে সম্মত হন, এবং জরুরি পরিস্থিতিতে প্রয়োজনীয় হলে স্বাস্থ্যসেবা প্রদানকারীদের সাথে।'
      },
      yourRights: { en: 'Your Rights', bn: 'আপনার অধিকার' },
      access: { en: 'Access', bn: 'অ্যাক্সেস' },
      accessText: {
        en: 'You have the right to access, update, or delete your personal information at any time through your account settings.',
        bn: 'আপনার অ্যাকাউন্ট সেটিংসের মাধ্যমে আপনি যেকোনো সময় আপনার ব্যক্তিগত তথ্য অ্যাক্সেস, আপডেট বা মুছে ফেলার অধিকার রাখেন।'
      },
      consent: { en: 'Consent', bn: 'সম্মতি' },
      consentText: {
        en: 'You can withdraw your consent for data processing at any time, though this may affect your ability to use certain features of the platform.',
        bn: 'আপনি যেকোনো সময় তথ্য প্রক্রিয়াকরণের জন্য আপনার সম্মতি প্রত্যাহার করতে পারেন, যদিও এটি প্ল্যাটফর্মের নির্দিষ্ট বৈশিষ্ট্যগুলি ব্যবহার করার আপনার ক্ষমতাকে প্রভাবিত করতে পারে।'
      },
      contact: { en: 'Contact Us', bn: 'আমাদের সাথে যোগাযোগ করুন' },
      contactText: {
        en: 'If you have questions about this Privacy Policy or our data practices, please contact us at support@roktokorobi.org',
        bn: 'আপনার যদি এই গোপনীয়তা নীতি বা আমাদের তথ্য অনুশীলন সম্পর্কে প্রশ্ন থাকে, দয়া করে আমাদের সাথে support@roktokorobi.org এ যোগাযোগ করুন'
      },
      downloadFull: { en: 'Download Full Privacy Policy (PDF)', bn: 'সম্পূর্ণ গোপনীয়তা নীতি ডাউনলোড করুন (PDF)' },
    };
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ color: '#C0152A', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
        {t('title')}
      </h1>
      <p style={{ color: '#666', marginBottom: '0.5rem' }}>
        {t('version')}
      </p>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        {t('lastUpdated')}: April 25, 2026
      </p>

      <a
        href="/legal/privacy-policy.pdf"
        download
        style={{
          display: 'inline-block',
          background: '#C0152A',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          marginBottom: '2rem',
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#A01222'}
        onMouseOut={(e) => e.currentTarget.style.background = '#C0152A'}
      >
        {t('downloadFull')}
      </a>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#1B5E6B', fontSize: '1.5rem', marginBottom: '1rem' }}>
          {t('introduction')}
        </h2>
        <p style={{ lineHeight: '1.6', color: '#333' }}>{t('introductionText')}</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#1B5E6B', fontSize: '1.5rem', marginBottom: '1rem' }}>
          {t('informationWeCollect')}
        </h2>
        
        <h3 style={{ color: '#C8922A', fontSize: '1.2rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          {t('personalInfo')}
        </h3>
        <p style={{ lineHeight: '1.6', color: '#333' }}>{t('personalInfoText')}</p>
        
        <h3 style={{ color: '#C8922A', fontSize: '1.2rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          {t('medicalInfo')}
        </h3>
        <p style={{ lineHeight: '1.6', color: '#333' }}>{t('medicalInfoText')}</p>
        
        <h3 style={{ color: '#C8922A', fontSize: '1.2rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          {t('locationInfo')}
        </h3>
        <p style={{ lineHeight: '1.6', color: '#333' }}>{t('locationInfoText')}</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#1B5E6B', fontSize: '1.5rem', marginBottom: '1rem' }}>
          {t('howWeUseInfo')}
        </h2>
        <ul style={{ lineHeight: '1.8', color: '#333', paddingLeft: '1.5rem' }}>
          <li>{t('matching')}</li>
          <li>{t('communication')}: {t('communicationText')}</li>
          <li>{t('improvement')}</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#1B5E6B', fontSize: '1.5rem', marginBottom: '1rem' }}>
          {t('dataSecurity')}
        </h2>
        <p style={{ lineHeight: '1.6', color: '#333' }}>{t('dataSecurityText')}</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#1B5E6B', fontSize: '1.5rem', marginBottom: '1rem' }}>
          {t('dataSharing')}
        </h2>
        <p style={{ lineHeight: '1.6', color: '#333' }}>{t('dataSharingText')}</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#1B5E6B', fontSize: '1.5rem', marginBottom: '1rem' }}>
          {t('yourRights')}
        </h2>
        <ul style={{ lineHeight: '1.8', color: '#333', paddingLeft: '1.5rem' }}>
          <li>{t('access')}: {t('accessText')}</li>
          <li>{t('consent')}: {t('consentText')}</li>
        </ul>
      </section>
    </div>
  );
}
