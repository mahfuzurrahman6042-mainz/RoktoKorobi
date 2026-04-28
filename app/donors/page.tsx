'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import OfflineMap from '@/components/OfflineMap';
import Link from 'next/link';

interface Donor {
  id: string;
  name: string;
  blood_group: string;
  location: string;
  phone: string;
  age: number;
  latitude?: number;
  longitude?: number;
}

interface Hospital {
  id: string;
  name: string;
  name_bn?: string;
  address: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  blood_bank_available: boolean;
  has_donation_center: boolean;
  blood_groups_available?: string[];
  verified: boolean;
}

const styles = {
  crimson: '#9B1C1C',
  crimsonLight: '#C0392B',
  ink: '#0E0E0E',
  smoke: '#F5F3EF',
  mist: '#E8E4DC',
  stone: '#8C8680',
  parchment: '#FAF8F4',
};

export default function DonorsPage() {
  const [language, setLanguage] = useState('en');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    location: '',
  });
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [messageText, setMessageText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [hospitalModalOpen, setHospitalModalOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
    fetchCurrentUser();
  }, []);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      findDonors: { en: 'Find a donor.', bn: 'দাতা খুঁজুন।' },
      saveLife: { en: 'Save a life.', bn: 'জীবন বাঁচান।' },
      today: { en: 'Today.', bn: 'আজ।' },
      subtitle: { en: 'Connect with verified blood donors in your area — quickly, discreetly, and without barriers. Every second matters in an emergency.', bn: 'আপনার এলাকায় যাচাইকৃত রক্তদাতাদের সাথে সংযুক্ত হন — দ্রুত, বিচক্ষণভাবে এবং কোন বাধা ছাড়াই। জরুরি পরিস্থিতিতে প্রতিটি সেকেন্ড গুরুত্বপূর্ণ।' },
      findDonorsBtn: { en: 'Find Donors', bn: 'রক্তদাতা খুঁজুন' },
      registerDonor: { en: 'Register as Donor →', bn: 'দাতা হিসেবে নিবন্ধন করুন →' },
      bloodGroup: { en: 'Blood Group', bn: 'রক্তের গ্রুপ' },
      location: { en: 'Location', bn: 'অবস্থান' },
      search: { en: 'Search', bn: 'অনুসন্ধান' },
      mapView: { en: 'Map View', bn: 'ম্যাপ দেখুন' },
      availableDonors: { en: 'Available Donors', bn: 'উপলব্ধ রক্তদাতা' },
      resultsShown: { en: 'results shown', bn: 'ফলাফল দেখানো হয়েছে' },
      searchForDonors: { en: 'Search for donors', bn: 'রক্তদাতা অনুসন্ধান করুন' },
      searchDesc: { en: 'Select a blood group and enter a location above to find available donors near you.', bn: 'উপরে একটি রক্তের গ্রুপ নির্বাচন করুন এবং আপনার কাছাকাছি উপলব্ধ দাতাদের খুঁজতে একটি অবস্থান লিখুন।' },
      process: { en: 'Process', bn: 'প্রক্রিয়া' },
      step1Title: { en: 'Search by Blood Group', bn: 'রক্তের গ্রুপ দিয়ে অনুসন্ধান করুন' },
      step1Desc: { en: 'Select the required blood type and enter a location to instantly surface available donors near you.', bn: 'প্রয়োজনীয় রক্তের ধরন নির্বাচন করুন এবং আপনার কাছাকাছি উপলব্ধ দাতাদের তাৎক্ষণিকভাবে খুঁজতে একটি অবস্থান লিখুন।' },
      step2Title: { en: 'Contact Directly', bn: 'সরাসরি যোগাযোগ করুন' },
      step2Desc: { en: 'Reach out to donors through our platform. No middlemen — direct, private contact when every second counts.', bn: 'আমাদের প্ল্যাটফর্মের মাধ্যমে দাতাদের সাথে যোগাযোগ করুন। কোন মধ্যস্থতাকারী নেই — প্রতিটি সেকেন্ড গণনা করার সময় সরাসরি, ব্যক্তিগত যোগাযোগ।' },
      step3Title: { en: 'Register & Give Back', bn: 'নিবন্ধন করুন এবং ফিরিয়ে দিন' },
      step3Desc: { en: 'Become a listed donor yourself. One registration could mean the difference between life and death for another.', bn: 'নিজেকে তালিকাভুক্ত দাতা হিসেবে তৈরি করুন। একটি নিবন্ধন অন্যের জন্য জীবন এবং মৃত্যুর মধ্যে পার্থক্য হতে পারে।' },
      privacyPolicy: { en: 'Privacy Policy', bn: 'গোপনীয়তা নীতি' },
      termsOfService: { en: 'Terms of Service', bn: 'সেবার শর্তাবলী' },
      aboutUs: { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
      copyright: { en: '© 2026 RoktoKorobi. All rights reserved.', bn: '© ২০২৬ রক্তকরবী। সর্বস্বত্ব সংরক্ষিত।' },
      loading: { en: 'Loading...', bn: 'লোড হচ্ছে...' },
      noDonors: { en: 'No donors found', bn: 'কোন রক্তদাতা পাওয়া যায়নি' },
      contact: { en: 'Contact', bn: 'যোগাযোগ' },
      sendMessage: { en: 'Send Message', bn: 'বার্তা পাঠান' },
      messagePlaceholder: { en: 'Write your message...', bn: 'আপনার বার্তা লিখুন...' },
      send: { en: 'Send', bn: 'পাঠান' },
      cancel: { en: 'Cancel', bn: 'বাতিল' },
      age: { en: 'Age', bn: 'বয়স' },
      years: { en: 'years', bn: 'বছর' },
      phone: { en: 'Phone', bn: 'ফোন' },
      available: { en: 'Available', bn: 'উপলব্ধ' },
      searchHospitals: { en: 'Search Hospitals/Blood Banks', bn: 'হাসপাতাল/রক্ত ব্যাংক অনুসন্ধান করুন' },
      hospitalPlaceholder: { en: 'Enter hospital name...', bn: 'হাসপাতালের নাম লিখুন...' },
      getDirections: { en: 'Get Directions', bn: 'দিকনির্দেশ পান' },
      bloodBank: { en: 'Blood Bank', bn: 'রক্ত ব্যাংক' },
      bloodGroups: { en: 'Blood Groups Available', bn: 'উপলব্ধ রক্তের গ্রুপ' },
      address: { en: 'Address', bn: 'ঠিকানা' },
      call: { en: 'Call', bn: 'কল করুন' },
      noHospitals: { en: 'No hospitals found', bn: 'কোন হাসপাতাল পাওয়া যায়নি' },
    };
    return translations[key]?.[language] || key;
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();
      setCurrentUser(result.user);
    } catch (err) {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchDonors();
    fetchHospitals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [donors, filters]);

  const fetchDonors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_donor', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonors(data || []);
    } catch (err) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .eq('verified', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setHospitals(data || []);
      setFilteredHospitals(data || []);
    } catch (err) {
      // Silent fail
    }
  };

  const applyFilters = () => {
    let filtered = donors;

    if (filters.bloodGroup) {
      filtered = filtered.filter(d => d.blood_group === filters.bloodGroup);
    }

    if (filters.location) {
      filtered = filtered.filter(d =>
        d.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredDonors(filtered);
  };

  useEffect(() => {
    if (hospitalSearch) {
      const filtered = hospitals.filter(h =>
        h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
        (h.name_bn && h.name_bn.includes(hospitalSearch)) ||
        h.city.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
        h.district.toLowerCase().includes(hospitalSearch.toLowerCase())
      );
      setFilteredHospitals(filtered);
    } else {
      setFilteredHospitals(hospitals);
    }
  }, [hospitalSearch, hospitals]);

  const handleSendMessage = async () => {
    if (!currentUser || !selectedDonor || !messageText.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            from_user_id: currentUser.id,
            from_user_name: currentUser.name,
            to_user_id: selectedDonor.id,
            message: messageText,
            status: 'pending',
          },
        ]);

      if (error) throw error;

      alert('Message sent to admin');
      setMessageModalOpen(false);
      setMessageText('');
      setSelectedDonor(null);
    } catch (err) {
      alert('Failed to send message');
    }
  };

  return (
    <>
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 60px',
        background: 'rgba(250,248,244,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${styles.mist}`,
      }}>
        <Link href="/" style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0.04em',
          color: styles.ink, textDecoration: 'none',
        }}>
          Rokto<span style={{ color: styles.crimson }}>Korobi</span>
        </Link>
        <ul style={{ listStyle: 'none', display: 'flex', gap: '40px', margin: 0, padding: 0 }}>
          <li><Link href="#search" style={{ fontSize: '0.78rem', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: styles.stone, textDecoration: 'none', transition: 'color 0.25s' }}>Find Donors</Link></li>
          <li><Link href="#how" style={{ fontSize: '0.78rem', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: styles.stone, textDecoration: 'none', transition: 'color 0.25s' }}>How It Works</Link></li>
          <li><Link href="/register" style={{ fontSize: '0.78rem', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: styles.stone, textDecoration: 'none', transition: 'color 0.25s' }}>Register</Link></li>
        </ul>
        <Link href="/register" style={{
          fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: styles.crimson, textDecoration: 'none',
          border: `1px solid ${styles.crimson}`, padding: '9px 22px',
          transition: 'all 0.25s',
        }}>
          Become a Donor
        </Link>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        display: 'grid', placeItems: 'center',
        padding: '140px 60px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          content: '',
          position: 'absolute', top: 0, right: 0,
          width: '45vw', height: '100%',
          background: 'linear-gradient(135deg, #E8E4DC 0%, #DDD8CE 100%)',
          clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)',
          zIndex: 0,
        }}></div>

        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: '1100px', width: '100%',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center',
        }}>
          <div style={{ animation: 'fadeUp 0.9s ease both' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: styles.crimson, marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ display: 'block', width: '32px', height: '1px', background: styles.crimson }}></span>
              Blood Donation Platform
            </p>
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(3rem, 5vw, 5.5rem)',
              fontWeight: 300, lineHeight: 1.08,
              color: styles.ink, marginBottom: '28px',
            }}>
              {t('findDonors')}<br/>
              <em style={{ fontStyle: 'italic', color: styles.crimson }}>{t('saveLife')}</em><br/>
              {t('today')}
            </h1>
            <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.8, color: styles.stone, maxWidth: '380px', marginBottom: '48px' }}>
              {t('subtitle')}
            </p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Link href="#search" style={{
                background: styles.crimson, color: '#fff',
                fontFamily: 'Jost, sans-serif', fontSize: '0.78rem',
                fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
                border: 'none', padding: '15px 36px', cursor: 'pointer',
                transition: 'all 0.3s', textDecoration: 'none', display: 'inline-block',
              }}>
                {t('findDonorsBtn')}
              </Link>
              <Link href="/register" style={{
                fontSize: '0.78rem', fontWeight: 400, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: styles.ink, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'gap 0.25s',
              }}>
                {t('registerDonor')}
              </Link>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div style={{ animation: 'fadeUp 0.9s 0.2s ease both', position: 'relative', width: '100%', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Live Map badge */}
            <div style={{
              position: 'absolute', top: '8%', left: '-10%',
              background: 'rgba(250,248,244,0.95)',
              border: `1px solid ${styles.mist}`,
              backdropFilter: 'blur(8px)',
              padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: '14px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              minWidth: '190px',
              animation: 'floatA 5s ease-in-out infinite',
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEF3F2', color: styles.crimson, fontSize: '1rem' }}>
                🗺️
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: styles.ink, marginBottom: '2px' }}>Live Map</strong>
                <span style={{ fontSize: '0.72rem', fontWeight: 300, letterSpacing: '0.06em', color: styles.stone }}>GPS Tracking</span>
              </div>
            </div>

            {/* Central pin */}
            <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${styles.mist}`, animation: 'ringPulse 3s ease-in-out infinite' }}></div>
              <div style={{ position: 'absolute', inset: '-28px', borderRadius: '50%', border: '1px solid #E0DBD3', animation: 'ringPulse 3s ease-in-out infinite 0.4s' }}></div>
              <div style={{ position: 'absolute', inset: '-58px', borderRadius: '50%', border: '1px solid #EAE6DF', animation: 'ringPulse 3s ease-in-out infinite 0.8s' }}></div>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: styles.crimson,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 8px rgba(155,28,28,0.08), 0 0 0 16px rgba(155,28,28,0.04)',
                position: 'relative', zIndex: 2, fontSize: '28px',
              }}>
                📍
              </div>
            </div>

            {/* Emergency badge */}
            <div style={{
              position: 'absolute', top: '-4%', right: '-6%',
              background: 'rgba(250,248,244,0.95)',
              border: `1px solid ${styles.mist}`,
              backdropFilter: 'blur(8px)',
              padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: '14px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              minWidth: '190px',
              animation: 'floatB 5s ease-in-out infinite 1s',
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF7ED', color: '#C2410C', fontSize: '1rem' }}>
                📞
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: styles.ink, marginBottom: '2px' }}>Emergency</strong>
                <span style={{ fontSize: '0.72rem', fontWeight: 300, letterSpacing: '0.06em', color: styles.stone }}>24/7 Support</span>
              </div>
            </div>

            {/* Verified badge */}
            <div style={{
              position: 'absolute', bottom: '8%', right: '-8%',
              background: 'rgba(250,248,244,0.95)',
              border: `1px solid ${styles.mist}`,
              backdropFilter: 'blur(8px)',
              padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: '14px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              minWidth: '190px',
              animation: 'floatA 5s ease-in-out infinite 2s',
            }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0FDF4', color: '#15803D', fontSize: '1rem' }}>
                ✓
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: styles.ink, marginBottom: '2px' }}>Verified</strong>
                <span style={{ fontSize: '0.72rem', fontWeight: 300, letterSpacing: '0.06em', color: styles.stone }}>All Donors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section style={{ padding: '80px 60px', background: styles.ink, position: 'relative' }} id="search">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: styles.stone, marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            Find Blood Donors
            <span style={{ flex: 1, height: '1px', background: '#222' }}></span>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr auto auto', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: styles.stone, marginBottom: '10px' }}>{t('bloodGroup')}</label>
              <select
                value={filters.bloodGroup}
                onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                style={{
                  width: '100%',
                  background: 'transparent', border: '1px solid #2A2A2A',
                  color: '#E8E4DC', fontFamily: 'Jost, sans-serif',
                  fontSize: '0.9rem', fontWeight: 300,
                  padding: '14px 18px',
                  outline: 'none', transition: 'border-color 0.25s',
                }}
              >
                <option value="">All Blood Groups</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: styles.stone, marginBottom: '10px' }}>{t('location')}</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="Enter city, district or area…"
                style={{
                  width: '100%',
                  background: 'transparent', border: '1px solid #2A2A2A',
                  color: '#E8E4DC', fontFamily: 'Jost, sans-serif',
                  fontSize: '0.9rem', fontWeight: 300,
                  padding: '14px 18px',
                  outline: 'none', transition: 'border-color 0.25s',
                }}
              />
            </div>
            <button
              onClick={applyFilters}
              style={{
                background: styles.crimson, color: '#fff',
                fontFamily: 'Jost, sans-serif', fontSize: '0.78rem',
                fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
                border: 'none', padding: '14px 32px', cursor: 'pointer',
                transition: 'background 0.25s', whiteSpace: 'nowrap',
              }}
            >
              {t('search')}
            </button>
            <button
              onClick={() => setShowMap(!showMap)}
              style={{
                background: 'transparent', color: '#E8E4DC',
                fontFamily: 'Jost, sans-serif', fontSize: '0.78rem',
                fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase',
                border: '1px solid #2A2A2A', padding: '14px 24px', cursor: 'pointer',
                transition: 'all 0.25s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {showMap ? '📋 List' : '⊞ Map'}
            </button>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section style={{ padding: '0 60px 80px', maxWidth: '1220px', margin: '0 auto' }} id="results">
        <div style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '48px', borderBottom: `1px solid ${styles.mist}`, paddingBottom: '24px' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: styles.ink, margin: 0 }}>{t('availableDonors')}</h2>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: styles.stone }}>
              {filteredDonors.length} {t('resultsShown')}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: '1.4rem', color: styles.stone }}>{t('loading')}</div>
            </div>
          ) : filteredDonors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ width: '64px', height: '64px', margin: '0 auto 32px', border: `1px solid ${styles.mist}`, borderRadius: '50%', display: 'grid', placeItems: 'center', color: styles.stone, fontSize: '1.4rem' }}>◎</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: styles.ink, marginBottom: '12px' }}>{t('searchForDonors')}</h3>
              <p style={{ fontSize: '0.88rem', fontWeight: 300, color: styles.stone, lineHeight: 1.7 }}>{t('searchDesc')}</p>
            </div>
          ) : showMap ? (
            <div style={{ padding: '20px', background: styles.parchment, borderRadius: '16px' }}>
              {/* Hospital Search Bar */}
              <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={hospitalSearch}
                  onChange={(e) => setHospitalSearch(e.target.value)}
                  placeholder={t('hospitalPlaceholder')}
                  style={{
                    flex: 1,
                    background: '#fff', border: '1px solid #ddd',
                    color: styles.ink, fontFamily: 'Jost, sans-serif',
                    fontSize: '0.9rem', fontWeight: 300,
                    padding: '12px 16px',
                    outline: 'none', transition: 'border-color 0.25s',
                    borderRadius: '8px',
                  }}
                />
                <span style={{ fontSize: '0.85rem', color: styles.stone }}>
                  {filteredHospitals.length} {t('bloodBank')}
                </span>
              </div>

              <OfflineMap
                center={[23.8103, 90.4125]}
                zoom={12}
                height="500px"
                markers={[
                  ...filteredDonors
                    .filter(d => d.latitude && d.longitude)
                    .map(donor => ({
                      id: donor.id,
                      lat: donor.latitude!,
                      lng: donor.longitude!,
                      title: donor.name.split(' ')[0],
                      description: `${donor.blood_group} • ${donor.location}`,
                      type: 'donor' as const
                    })),
                  ...filteredHospitals
                    .filter(h => h.latitude && h.longitude)
                    .map(hospital => ({
                      id: hospital.id,
                      lat: hospital.latitude!,
                      lng: hospital.longitude!,
                      title: hospital.name,
                      description: hospital.blood_bank_available ? '🏥 Blood Bank' : '🏥 Hospital',
                      type: 'hospital' as const,
                      hospitalData: hospital
                    }))
                ]}
                showUserLocation={true}
                onMarkerClick={(marker) => {
                  if (marker.type === 'hospital' && (marker as any).hospitalData) {
                    setSelectedHospital((marker as any).hospitalData);
                    setHospitalModalOpen(true);
                  }
                }}
              />
              <p style={{ marginTop: '16px', fontSize: '0.9rem', color: styles.stone, textAlign: 'center' }}>
                🩸 {filteredDonors.filter(d => d.latitude && d.longitude).length} donors • 🏥 {filteredHospitals.filter(h => h.latitude && h.longitude).length} hospitals
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: styles.mist }}>
              {filteredDonors.map((donor) => (
                <div key={donor.id} style={{ background: styles.parchment, padding: '36px 32px', transition: 'background 0.25s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = styles.smoke} onMouseLeave={(e) => e.currentTarget.style.background = styles.parchment}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', fontWeight: 300, color: styles.crimson, lineHeight: 1, marginBottom: '20px' }}>{donor.blood_group}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 400, color: styles.ink, marginBottom: '6px' }}>{donor.name}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 300, color: styles.stone, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>📍 {donor.location}</div>
                  <div style={{ display: 'inline-block', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: styles.crimson, border: `1px solid ${styles.crimson}`, padding: '4px 12px', marginBottom: '16px' }}>{t('available')}</div>
                  <a href={`tel:${donor.phone}`} style={{ float: 'right', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: styles.stone, textDecoration: 'none', padding: '4px 0', borderBottom: `1px solid ${styles.mist}`, transition: 'color 0.2s, border-color 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.color = styles.crimson; e.currentTarget.style.borderColor = styles.crimson; }} onMouseLeave={(e) => { e.currentTarget.style.color = styles.stone; e.currentTarget.style.borderColor = styles.mist; }}>{t('contact')}</a>
                  {currentUser && (
                    <button onClick={() => { setSelectedDonor(donor); setMessageModalOpen(true); }} style={{ display: 'block', width: '100%', marginTop: '16px', padding: '12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>💬 {t('sendMessage')}</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 60px', background: styles.smoke }} id="how">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ marginBottom: '60px' }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: styles.stone, marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {t('process')}
              <span style={{ flex: 1, height: '1px', background: styles.mist }}></span>
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: styles.mist }}>
            <div style={{ background: styles.smoke, padding: '48px 40px' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '4rem', fontWeight: 300, color: styles.crimson, lineHeight: 1, marginBottom: '24px' }}>01</div>
              <div style={{ fontSize: '1rem', fontWeight: 500, color: styles.ink, marginBottom: '12px' }}>{t('step1Title')}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 300, color: styles.stone, lineHeight: 1.75 }}>{t('step1Desc')}</div>
            </div>
            <div style={{ background: styles.smoke, padding: '48px 40px' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '4rem', fontWeight: 300, color: styles.crimson, lineHeight: 1, marginBottom: '24px' }}>02</div>
              <div style={{ fontSize: '1rem', fontWeight: 500, color: styles.ink, marginBottom: '12px' }}>{t('step2Title')}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 300, color: styles.stone, lineHeight: 1.75 }}>{t('step2Desc')}</div>
            </div>
            <div style={{ background: styles.smoke, padding: '48px 40px' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '4rem', fontWeight: 300, color: styles.crimson, lineHeight: 1, marginBottom: '24px' }}>03</div>
              <div style={{ fontSize: '1rem', fontWeight: 500, color: styles.ink, marginBottom: '12px' }}>{t('step3Title')}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 300, color: styles.stone, lineHeight: 1.75 }}>{t('step3Desc')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: styles.ink, color: '#555', padding: '48px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#888' }}>Rokto<span style={{ color: styles.crimson }}>Korobi</span></div>
        <div style={{ display: 'flex', gap: '32px' }}>
          <Link href="#" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', textDecoration: 'none', transition: 'color 0.2s' }}>{t('privacyPolicy')}</Link>
          <Link href="#" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', textDecoration: 'none', transition: 'color 0.2s' }}>{t('termsOfService')}</Link>
          <Link href="#" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555', textDecoration: 'none', transition: 'color 0.2s' }}>{t('aboutUs')}</Link>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#333' }}>{t('copyright')}</div>
      </footer>

      {/* Message Modal */}
      {messageModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', color: styles.ink, marginBottom: '1.5rem' }}>💬 {t('sendMessage')}</h2>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={t('messagePlaceholder')}
              style={{ width: '100%', minHeight: '150px', marginBottom: '1.5rem', padding: '14px', border: '1px solid #ddd', borderRadius: '8px', resize: 'vertical', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setMessageModalOpen(false); setMessageText(''); setSelectedDonor(null); }} style={{ padding: '12px 24px', background: '#9E9E9E', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>{t('cancel')}</button>
              <button onClick={handleSendMessage} disabled={!messageText.trim()} style={{ padding: '12px 24px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', opacity: !messageText.trim() ? 0.6 : 1 }}>{t('send')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Details Modal */}
      {hospitalModalOpen && selectedHospital && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: styles.ink, marginBottom: '8px', margin: 0 }}>🏥 {selectedHospital.name}</h2>
                {selectedHospital.blood_bank_available && (
                  <span style={{ display: 'inline-block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: styles.crimson, border: `1px solid ${styles.crimson}`, padding: '4px 12px', borderRadius: '4px' }}>{t('bloodBank')}</span>
                )}
              </div>
              <button onClick={() => { setHospitalModalOpen(false); setSelectedHospital(null); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: styles.stone }}>×</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: styles.stone, marginBottom: '4px', margin: 0 }}>{t('address')}</p>
              <p style={{ fontSize: '1rem', color: styles.ink, marginBottom: '12px', margin: 0 }}>{selectedHospital.address}</p>
              <p style={{ fontSize: '0.85rem', color: styles.stone, marginBottom: '4px', margin: 0 }}>{selectedHospital.city}, {selectedHospital.district}</p>
            </div>

            {selectedHospital.phone && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.85rem', color: styles.stone, marginBottom: '4px', margin: 0 }}>{t('phone')}</p>
                <a href={`tel:${selectedHospital.phone}`} style={{ fontSize: '1.1rem', color: styles.crimson, textDecoration: 'none', fontWeight: 500 }}>{selectedHospital.phone}</a>
              </div>
            )}

            {selectedHospital.blood_groups_available && selectedHospital.blood_groups_available.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '0.85rem', color: styles.stone, marginBottom: '8px', margin: 0 }}>{t('bloodGroups')}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedHospital.blood_groups_available.map((group) => (
                    <span key={group} style={{ background: '#FEF3F2', color: styles.crimson, padding: '6px 12px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500 }}>{group}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              {selectedHospital.phone && (
                <a href={`tel:${selectedHospital.phone}`} style={{ flex: 1, background: styles.crimson, color: 'white', padding: '14px 24px', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, display: 'block' }}>
                  📞 {t('call')}
                </a>
              )}
              {selectedHospital.latitude && selectedHospital.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.latitude},${selectedHospital.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, background: '#2196F3', color: 'white', padding: '14px 24px', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, display: 'block' }}
                >
                  🗺️ {t('getDirections')}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ringPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.03); }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </>
  );
}
