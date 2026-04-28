'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AboutPage() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
  }, []);

  const content = {
    en: {
      title: 'About Us',
      subtitle: 'RoktoKorobi (রক্তকরবী) — Blood Donation Platform (Bangladesh)',
      lastUpdated: 'English Version | April 2026',
      aboutTitle: 'ABOUT ROKTOKOROBI',
      aboutText: 'RoktoKorobi (রক্তকরবী) is a voluntary blood donation coordination platform built for Bangladesh. The name means "Bloodroot" — a flower associated with life, resilience, and renewal — chosen to reflect our belief that every act of donation is an act of living commitment to another human being.\n\nWe exist for one reason: in Bangladesh, blood is still found through phone calls, desperate social media posts, and networks of personal contacts. People in crisis lose critical hours searching. Donors willing to help have no reliable way to be found. RoktoKorobi exists to close that gap.',
      missionTitle: 'OUR MISSION',
      missionText: 'To make voluntary, safe, and timely blood donation accessible to everyone in Bangladesh — through technology that is simple enough for anyone to use and reliable enough to trust in a crisis.',
      visionTitle: 'OUR VISION',
      visionText: 'A Bangladesh where no one waits for blood. Where every willing donor is findable, every urgent request is heard, and every life that can be saved, is.',
      whatWeDoTitle: 'WHAT WE DO',
      whatWeDoText: 'RoktoKorobi connects blood donors with people in urgent need — directly, quickly, and without intermediaries.\n\nDonors register their blood group, location, and availability. When someone nearby needs blood urgently, the right donors are notified immediately. No middlemen. No blood brokering. No commercial transactions.\n\nOur platform is designed to work on any device, even on low-bandwidth connections, because emergencies do not wait for good Wi-Fi.',
      howItWorksTitle: 'HOW IT WORKS',
      donorsTitle: 'For Donors:',
      donorsText: '1. Register with your blood group, district, and availability status.\n2. Receive instant notifications when someone nearby needs your blood type.\n3. Respond, connect, and help — directly and voluntarily.\n4. Track your donation history and impact.',
      requestorsTitle: 'For Requestors:',
      requestorsText: '1. Post a blood request with blood group, quantity, hospital, and urgency.\n2. Eligible nearby donors are immediately notified.\n3. Receive responses and coordinate directly.',
      principlesTitle: 'OUR PRINCIPLES',
      voluntaryTitle: 'Voluntary:',
      voluntaryText: 'Every donation on RoktoKorobi is entirely voluntary. We do not facilitate paid blood donation under any circumstances.',
      safeTitle: 'Safe:',
      safeText: 'We follow WHO guidelines for voluntary blood donation. Donors are guided on eligibility and encouraged to consult healthcare professionals when in doubt.',
      privateTitle: 'Private:',
      privateText: 'Donor and recipient anonymity is maintained. Personal information is never sold, rented, or commercially exploited. See our Privacy Policy for full details.',
      freeTitle: 'Free:',
      freeText: 'RoktoKorobi is free for donors and requestors. Blood should not cost money to find.',
      nonCommercialTitle: 'Non-commercial:',
      nonCommercialText: 'We are a mission-driven platform. We do not run advertisements, accept payments for donor listings, or monetise user data.',
      whoWeAreTitle: 'WHO WE ARE',
      whoWeAreText: 'RoktoKorobi was built by a team in Dhaka, Bangladesh — young people who believe technology should solve real problems for real communities. The project grew from direct experience with the broken, stressful way blood is currently found in Bangladesh.\n\nWe are not a blood bank. We are not a hospital. We are not a government agency. We are a small, committed team using technology to connect people who want to help with people who need it.',
      commitmentTitle: 'OUR COMMITMENT',
      commitmentText: 'We commit to:\n- Keeping the platform free for all users\n- Never selling or exploiting donor data\n- Following WHO ethical guidelines for voluntary blood donation\n- Protecting the privacy and dignity of every user\n- Improving continuously based on the real needs of our community',
      contactTitle: 'CONTACT US',
      generalEnquiries: 'General Enquiries: hello@roktokorobi.com.bd',
      support: 'Support: support@roktokorobi.com.bd',
      partnerships: 'Partnerships & Institutions: partner@roktokorobi.com.bd',
      dpo: 'Data Protection Officer: privacy@roktokorobi.com.bd',
      address: 'Address: [Your registered address], Dhaka, Bangladesh',
      website: 'Website: www.roktokorobi.com.bd',
      socialMedia: 'Follow us: [Social media handles]',
    },
    bn: {
      title: 'আমাদের সম্পর্কে',
      subtitle: 'রক্তকরবী (RoktoKorobi) — রক্তদান প্ল্যাটফর্ম (বাংলাদেশ)',
      lastUpdated: 'বাংলা সংস্করণ | এপ্রিল ২০২৬',
      aboutTitle: 'রক্তকরবী সম্পর্কে',
      aboutText: 'রক্তকরবী বাংলাদেশের জন্য নির্মিত একটি স্বেচ্ছামূলক রক্তদান সমন্বয় প্ল্যাটফর্ম। "রক্তকরবী" নামটি এসেছে জীবন, প্রতিরোধ ও নবায়নের প্রতীক একটি ফুলের নাম থেকে — কারণ আমরা বিশ্বাস করি প্রতিটি রক্তদান একজন মানুষের জন্য আরেকজনের জীবন্ত প্রতিশ্রুতি।\n\nআমাদের অস্তিত্বের একটিই কারণ: বাংলাদেশে রক্ত এখনো ফোনকল, মরিয়া সোশ্যাল মিডিয়া পোস্ট আর ব্যক্তিগত যোগাযোগের মাধ্যমে খোঁজা হয়। সংকটের মুহূর্তে মানুষ অমূল্য সময় নষ্ট করে। রক্ত দিতে প্রস্তুত দাতাদের খুঁজে পাওয়ার কোনো নির্ভরযোগ্য পথ নেই। রক্তকরবী এই শূন্যতা পূরণ করতে এসেছে।',
      missionTitle: 'আমাদের লক্ষ্য',
      missionText: 'বাংলাদেশের প্রতিটি মানুষের কাছে স্বেচ্ছামূলক, নিরাপদ ও সময়মতো রক্তদান সহজলভ্য করা — এমন প্রযুক্তির মাধ্যমে যা যেকেউ ব্যবহার করতে পারে এবং সংকটে বিশ্বাস করা যায়।',
      visionTitle: 'আমাদের দৃষ্টিভঙ্গি',
      visionText: 'এমন একটি বাংলাদেশ যেখানে কেউ রক্তের জন্য অপেক্ষা করে না। যেখানে প্রতিটি ইচ্ছুক দাতাকে খুঁজে পাওয়া যায়, প্রতিটি জরুরি অনুরোধ শোনা যায় এবং যে জীবন বাঁচানো সম্ভব, তা বাঁচানো হয়।',
      whatWeDoTitle: 'আমরা কী করি',
      whatWeDoText: 'রক্তকরবী রক্তদাতাদের সাথে জরুরি প্রয়োজনে রক্তের সন্ধানীদের সরাসরি, দ্রুত এবং কোনো মধ্যস্থতাকারী ছাড়া সংযুক্ত করে।\n\nদাতারা তাদের রক্তের গ্রুপ, অবস্থান ও উপলব্ধতা নিবন্ধন করেন। কাছাকাছি কেউ জরুরিভাবে রক্তের প্রয়োজন হলে সঠিক দাতাদের তাৎক্ষণিকভাবে বিজ্ঞপ্তি পাঠানো হয়। কোনো দালাল নেই, কোনো বাণিজ্যিক লেনদেন নেই।\n\nআমাদের প্ল্যাটফর্ম যেকোনো ডিভাইসে, এমনকি কম গতির ইন্টারনেটেও কাজ করে — কারণ জরুরি পরিস্থিতি ভালো নেটওয়ার্কের অপেক্ষা করে না।',
      howItWorksTitle: 'কীভাবে কাজ করে',
      donorsTitle: 'রক্তদাতাদের জন্য:',
      donorsText: '১. আপনার রক্তের গ্রুপ, জেলা ও উপলব্ধতার অবস্থা নিবন্ধন করুন।\n২. কাছাকাছি কেউ আপনার রক্তের গ্রুপ প্রয়োজন হলে তাৎক্ষণিক বিজ্ঞপ্তি পান।\n৩. সাড়া দিন, সংযুক্ত হন এবং স্বেচ্ছায় সাহায্য করুন।\n৪. আপনার দানের ইতিহাস ও প্রভাব ট্র্যাক করুন।',
      requestorsTitle: 'রক্তের অনুরোধকারীদের জন্য:',
      requestorsText: '১. রক্তের গ্রুপ, পরিমাণ, হাসপাতাল ও জরুরিতা সহ অনুরোধ পোস্ট করুন।\n২. কাছাকাছি যোগ্য দাতারা তাৎক্ষণিকভাবে বিজ্ঞপ্তি পাবেন।\n৩. সাড়া পান এবং সরাসরি সমন্বয় করুন।',
      principlesTitle: 'আমাদের নীতিসমূহ',
      voluntaryTitle: 'স্বেচ্ছামূলক:',
      voluntaryText: 'রক্তকরবীতে সকল রক্তদান সম্পূর্ণ স্বেচ্ছামূলক। আমরা কোনো অবস্থাতেই অর্থের বিনিময়ে রক্তদানের সুবিধা দিই না।',
      safeTitle: 'নিরাপদ:',
      safeText: 'আমরা স্বেচ্ছামূলক রক্তদানের জন্য WHO নির্দেশিকা অনুসরণ করি। দাতাদের যোগ্যতা সম্পর্কে পথনির্দেশনা দেওয়া হয় এবং সন্দেহ হলে স্বাস্থ্যসেবা পেশাদারের পরামর্শ নিতে উৎসাহিত করা হয়।',
      privateTitle: 'ব্যক্তিগত:',
      privateText: 'দাতা ও গ্রহীতার গোপনীয়তা বজায় রাখা হয়। ব্যক্তিগত তথ্য কখনো বিক্রয়, ভাড়া বা বাণিজ্যিকভাবে ব্যবহার করা হয় না।',
      freeTitle: 'বিনামূল্যে:',
      freeText: 'রক্তকরবী দাতা ও অনুরোধকারী সকলের জন্য বিনামূল্যে। রক্ত খোঁজার জন্য অর্থ ব্যয় করতে হবে না।',
      nonCommercialTitle: 'অ-বাণিজ্যিক:',
      nonCommercialText: 'আমরা একটি লক্ষ্য-চালিত প্ল্যাটফর্ম। আমরা বিজ্ঞাপন প্রদর্শন করি না, দাতাদের তালিকার জন্য অর্থ গ্রহণ করি না এবং ব্যবহারকারীর তথ্য থেকে আয় করি না।',
      whoWeAreTitle: 'আমরা কারা',
      whoWeAreText: 'রক্তকরবী ঢাকা, বাংলাদেশের একটি দলের তৈরি — এমন তরুণ যারা বিশ্বাস করে প্রযুক্তি বাস্তব সম্প্রদায়ের বাস্তব সমস্যা সমাধান করা উচিত। এই প্রকল্পটি জন্ম নিয়েছে বাংলাদেশে রক্ত সংগ্রহের বর্তমান ভাঙা, চাপযুক্ত পদ্ধতির সরাসরি অভিজ্ঞতা থেকে।\n\nআমরা ব্লাড ব্যাংক নই। হাসপাতাল নই। সরকারি সংস্থা নই। আমরা একটি ছোট, প্রতিশ্রুতিবদ্ধ দল — যারা প্রযুক্তি ব্যবহার করে সাহায্য করতে চাওয়া মানুষদের সাথে সাহায্যের প্রয়োজন এমন মানুষদের সংযুক্ত করছে।',
      commitmentTitle: 'আমাদের প্রতিশ্রুতি',
      commitmentText: 'আমরা প্রতিশ্রুতি দিচ্ছি:\n- প্ল্যাটফর্ম সকল ব্যবহারকারীর জন্য বিনামূল্যে রাখার\n- দাতাদের তথ্য কখনো বিক্রয় বা শোষণ না করার\n- স্বেচ্ছামূলক রক্তদানের জন্য WHO নৈতিক নির্দেশিকা অনুসরণ করার\n- প্রতিটি ব্যবহারকারীর গোপনীয়তা ও মর্যাদা রক্ষা করার\n- আমাদের সম্প্রদায়ের প্রকৃত প্রয়োজনের ভিত্তিতে ক্রমাগত উন্নতি করার',
      contactTitle: 'যোগাযোগ করুন',
      generalEnquiries: 'সাধারণ জিজ্ঞাসা: hello@roktokorobi.com.bd',
      support: 'সহায়তা: support@roktokorobi.com.bd',
      partnerships: 'অংশীদারিত্ব ও প্রতিষ্ঠান: partner@roktokorobi.com.bd',
      dpo: 'তথ্য সুরক্ষা কর্মকর্তা: privacy@roktokorobi.com.bd',
      address: 'ঠিকানা: [আপনার নিবন্ধিত ঠিকানা], ঢাকা, বাংলাদেশ',
      website: 'ওয়েবসাইট: www.roktokorobi.com.bd',
      socialMedia: 'সোশ্যাল মিডিয়া: [আপনার হ্যান্ডেলসমূহ]',
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
          <p style={{ color: '#666', marginBottom: '0.5rem', fontWeight: '500' }}>
            {t.subtitle}
          </p>
          <p style={{ color: '#999', marginBottom: '2rem', fontSize: '0.9rem' }}>
            {t.lastUpdated}
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.aboutTitle}
            </h2>
            <p style={{ lineHeight: '1.8', color: '#333', whiteSpace: 'pre-line' }}>
              {t.aboutText}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.missionTitle}
            </h2>
            <p style={{ lineHeight: '1.8', color: '#333', whiteSpace: 'pre-line' }}>
              {t.missionText}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.visionTitle}
            </h2>
            <p style={{ lineHeight: '1.8', color: '#333', whiteSpace: 'pre-line' }}>
              {t.visionText}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.whatWeDoTitle}
            </h2>
            <p style={{ lineHeight: '1.8', color: '#333', whiteSpace: 'pre-line' }}>
              {t.whatWeDoText}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.howItWorksTitle}
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#424242', marginBottom: '0.5rem', fontWeight: '600' }}>
                {t.donorsTitle}
              </h3>
              <p style={{ lineHeight: '1.8', color: '#333', whiteSpace: 'pre-line' }}>
                {t.donorsText}
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#424242', marginBottom: '0.5rem', fontWeight: '600' }}>
                {t.requestorsTitle}
              </h3>
              <p style={{ lineHeight: '1.8', color: '#333', whiteSpace: 'pre-line' }}>
                {t.requestorsText}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.principlesTitle}
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#424242', marginBottom: '0.5rem', fontWeight: '600' }}>
                {t.voluntaryTitle}
              </h3>
              <p style={{ lineHeight: '1.8', color: '#333' }}>
                {t.voluntaryText}
              </p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#424242', marginBottom: '0.5rem', fontWeight: '600' }}>
                {t.safeTitle}
              </h3>
              <p style={{ lineHeight: '1.8', color: '#333' }}>
                {t.safeText}
              </p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#424242', marginBottom: '0.5rem', fontWeight: '600' }}>
                {t.privateTitle}
              </h3>
              <p style={{ lineHeight: '1.8', color: '#333' }}>
                {t.privateText}
              </p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#424242', marginBottom: '0.5rem', fontWeight: '600' }}>
                {t.freeTitle}
              </h3>
              <p style={{ lineHeight: '1.8', color: '#333' }}>
                {t.freeText}
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#424242', marginBottom: '0.5rem', fontWeight: '600' }}>
                {t.nonCommercialTitle}
              </h3>
              <p style={{ lineHeight: '1.8', color: '#333' }}>
                {t.nonCommercialText}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.whoWeAreTitle}
            </h2>
            <p style={{ lineHeight: '1.8', color: '#333', whiteSpace: 'pre-line' }}>
              {t.whoWeAreText}
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
              {t.commitmentTitle}
            </h2>
            <p style={{ lineHeight: '1.8', color: '#333', whiteSpace: 'pre-line' }}>
              {t.commitmentText}
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
