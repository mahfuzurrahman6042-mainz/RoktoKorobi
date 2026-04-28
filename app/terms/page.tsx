'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function TermsPage() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
  }, []);

  const content = {
    en: {
      title: 'Terms of Service',
      version: 'Version 1.0',
      lastUpdated: 'Last Updated: April 2026',
      intro: 'Welcome to RoktoKorobi. By using our blood donation platform, you agree to these terms.',
      section1: '1. Acceptance of Terms',
      section1Text: 'By accessing and using RoktoKorobi, you accept and agree to be bound by the terms and provisions of this agreement.',
      section2: '2. User Responsibilities',
      section2Text: 'Users must provide accurate information when registering. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
      section3: '3. Blood Donation Guidelines',
      section3Text: 'All donations on RoktoKorobi are voluntary. We do not facilitate paid blood donation under any circumstances. Donors must follow WHO guidelines for voluntary blood donation.',
      section4: '4. Privacy and Data',
      section4Text: 'Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.',
      section5: '5. Disclaimer',
      section5Text: 'RoktoKorobi is a platform connecting donors and recipients. We are not a blood bank, hospital, or medical facility. We do not provide medical advice.',
      section6: '6. Limitation of Liability',
      section6Text: 'RoktoKorobi shall not be liable for any damages arising from the use of our platform, including but not limited to direct, indirect, incidental, or consequential damages.',
      section7: '7. Termination',
      section7Text: 'We reserve the right to terminate or suspend your account at any time for violation of these terms or for any other reason at our sole discretion.',
      section8: '8. Changes to Terms',
      section8Text: 'We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms.',
      contact: 'Contact Us',
      contactEmail: 'For questions about these terms, contact us at: legal@roktokorobi.com.bd',
      downloadFull: 'Download Full Legal Document (PDF)',
      downloadFullBn: 'সম্পূর্ণ আইনি নথি ডাউনলোড করুন (PDF)',
    },
    bn: {
      title: 'শর্তাবলী',
      version: 'সংস্করণ ১.০',
      lastUpdated: 'সর্বশেষ আপডেট: এপ্রিল ২০২৬',
      intro: 'রক্তকরবীতে স্বাগতম। আমাদের রক্তদান প্ল্যাটফর্ম ব্যবহার করে, আপনি এই শর্তাবলীতে সম্মত হন।',
      section1: '১. শর্তাবলী গ্রহণ',
      section1Text: 'রক্তকরবী ব্যবহার করে, আপনি এই চুক্তির শর্তাবলী গ্রহণ করতে সম্মত হন।',
      section2: '২. ব্যবহারকারীর দায়িত্ব',
      section2Text: 'ব্যবহারকারীদের নিবন্ধনের সময় সঠিক তথ্য প্রদান করতে হবে। আপনি আপনার অ্যাকাউন্টের গোপনীয়তা রক্ষা এবং আপনার অ্যাকাউন্টের অধীন সকল কার্যকলাপের জন্য দায়ী।',
      section3: '৩. রক্তদান নির্দেশিকা',
      section3Text: 'রক্তকরবীতে সকল রক্তদান স্বেচ্ছামূলক। আমরা কোনো অবস্থাতেই অর্থের বিনিময়ে রক্তদানের সুবিধা দিই না। দাতাদের WHO নির্দেশিকা অনুসরণ করতে হবে।',
      section4: '৪. গোপনীয়তা এবং তথ্য',
      section4Text: 'আপনার গোপনীয়তা আমাদের কাছে গুরুত্বপূর্ণ। আমরা কীভাবে তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষা করি তা জানতে আমাদের গোপনীয়তা নীতি পড়ুন।',
      section5: '৫. দাবিত্যাগ',
      section5Text: 'রক্তকরবী দাতা ও গ্রহীতাদের সংযুক্ত করার একটি প্ল্যাটফর্ম। আমরা ব্লাড ব্যাংক, হাসপাতাল বা চিকিৎসা সুবিধা নই। আমরা চিকিৎসা পরামর্শ প্রদান করি না।',
      section6: '৬. দায় সীমাবদ্ধতা',
      section6Text: 'প্ল্যাটফর্ম ব্যবহারের কারণে কোনো ক্ষতির জন্য রক্তকরবী দায়ী থাকবে না, সরাসরি, পরোক্ষ, আকস্মিক বা ফলাফলমূলক ক্ষতি সহ।',
      section7: '৭. সমাপ্তি',
      section7Text: 'এই শর্তাবলী লঙ্ঘন বা অন্য কোনো কারণে আমরা যেকোনো সময় আপনার অ্যাকাউন্ট বন্ধ বা স্থগিত করার অধিকার সংরক্ষণ করি।',
      section8: '৮. শর্তাবলী পরিবর্তন',
      section8Text: 'আমরা সময়ে সময়ে এই শর্তাবলী আপডেট করতে পারি। পরিবর্তনের পর প্ল্যাটফর্ম ব্যবহার করা আপডেট করা শর্তাবলী গ্রহণ বলে গণ্য হবে।',
      contact: 'যোগাযোগ করুন',
      contactEmail: 'এই শর্তাবলী সম্পর্কে প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন: legal@roktokorobi.com.bd',
      downloadFull: 'সম্পূর্ণ আইনি নথি ডাউনলোড করুন (PDF)',
    },
  };

  const t = content[language];

  if (!mounted) return null;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '80px 20px 40px' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ fontSize: '2.5rem', color: '#C0152A', marginBottom: '0.5rem' }}>
            {t.title}
          </h1>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>
            {t.version}
          </p>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            {t.lastUpdated}
          </p>

          <a
            href="/legal/terms-of-service.pdf"
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
            {t.downloadFull}
          </a>

          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#333' }}>
              {t.intro}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.section1}
            </h2>
            <p style={{ lineHeight: '1.6', color: '#333' }}>
              {t.section1Text}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.section2}
            </h2>
            <p style={{ lineHeight: '1.6', color: '#333' }}>
              {t.section2Text}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.section3}
            </h2>
            <p style={{ lineHeight: '1.6', color: '#333' }}>
              {t.section3Text}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.section4}
            </h2>
            <p style={{ lineHeight: '1.6', color: '#333' }}>
              {t.section4Text}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.section5}
            </h2>
            <p style={{ lineHeight: '1.6', color: '#333' }}>
              {t.section5Text}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.section6}
            </h2>
            <p style={{ lineHeight: '1.6', color: '#333' }}>
              {t.section6Text}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.section7}
            </h2>
            <p style={{ lineHeight: '1.6', color: '#333' }}>
              {t.section7Text}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.section8}
            </h2>
            <p style={{ lineHeight: '1.6', color: '#333' }}>
              {t.section8Text}
            </p>
          </div>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
            <Link href="/" style={{ color: '#C0152A', textDecoration: 'none', fontWeight: 'bold' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
