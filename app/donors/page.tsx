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
      <nav className="donors-nav">
        <Link href="/" className="nav-logo-link">
          Rokto<span className="nav-logo-accent">Korobi</span>
        </Link>
        <ul className="nav-links-list">
          <li><Link href="#search" className="nav-link">Find Donors</Link></li>
          <li><Link href="#how" className="nav-link">How It Works</Link></li>
          <li><Link href="/register" className="nav-link">Register</Link></li>
        </ul>
        <Link href="/register" className="nav-cta-link">
          Become a Donor
        </Link>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-bg"></div>

        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-tag">
              <span className="tag-line"></span>
              Blood Donation Platform
            </p>
            <h1 className="hero-title">
              {t('findDonors')}<br/>
              <em className="hero-title-accent">{t('saveLife')}</em><br/>
              {t('today')}
            </h1>
            <p className="hero-subtitle">
              {t('subtitle')}
            </p>
            <div className="hero-actions">
              <Link href="#search" className="hero-btn-primary">
                {t('findDonorsBtn')}
              </Link>
              <Link href="/register" className="hero-btn-secondary">
                {t('registerDonor')}
              </Link>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="hero-visual">
            {/* Live Map badge */}
            <div className="hero-badge hero-badge-map">
              <div className="badge-icon">🗺️</div>
              <div>
                <strong>Live Map</strong>
                <span>GPS Tracking</span>
              </div>
            </div>

            {/* Central pin */}
            <div className="hero-pin">
              <div className="pin-ring pin-ring-1"></div>
              <div className="pin-ring pin-ring-2"></div>
              <div className="pin-ring pin-ring-3"></div>
              <div className="pin-center">📍</div>
            </div>

            {/* Emergency badge */}
            <div className="hero-badge hero-badge-emergency">
              <div className="badge-icon">📞</div>
              <div>
                <strong>Emergency</strong>
                <span>24/7 Support</span>
              </div>
            </div>

            {/* Verified badge */}
            <div className="hero-badge hero-badge-verified">
              <div className="badge-icon">✓</div>
              <div>
                <strong>Verified</strong>
                <span>All Donors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="search-section" id="search">
        <div className="search-container">
          <p className="search-header">
            Find Blood Donors
            <span className="header-line"></span>
          </p>
          <div className="search-form">
            <div className="search-field">
              <label>{t('bloodGroup')}</label>
              <select
                value={filters.bloodGroup}
                onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
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
            <div className="search-field search-field-location">
              <label>{t('location')}</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="Enter city, district or area…"
              />
            </div>
            <button className="search-btn" onClick={applyFilters}>
              {t('search')}
            </button>
            <button className="map-toggle-btn" onClick={() => setShowMap(!showMap)}>
              {showMap ? '📋 List' : '⊞ Map'}
            </button>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="results-section" id="results">
        <div className="results-container">
          <div className="results-header">
            <h2>{t('availableDonors')}</h2>
            <span>{filteredDonors.length} {t('resultsShown')}</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div>{t('loading')}</div>
            </div>
          ) : filteredDonors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◎</div>
              <h3>{t('searchForDonors')}</h3>
              <p>{t('searchDesc')}</p>
            </div>
          ) : showMap ? (
            <div className="map-container">
              {/* Hospital Search Bar */}
              <div className="hospital-search-bar">
                <input
                  type="text"
                  value={hospitalSearch}
                  onChange={(e) => setHospitalSearch(e.target.value)}
                  placeholder={t('hospitalPlaceholder')}
                />
                <span>{filteredHospitals.length} {t('bloodBank')}</span>
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
              <p className="map-stats">
                🩸 {filteredDonors.filter(d => d.latitude && d.longitude).length} donors • 🏥 {filteredHospitals.filter(h => h.latitude && h.longitude).length} hospitals
              </p>
            </div>
          ) : (
            <div className="donors-grid">
              {filteredDonors.map((donor) => (
                <div key={donor.id} className="donor-card">
                  <div className="donor-blood-group">{donor.blood_group}</div>
                  <div className="donor-name">{donor.name}</div>
                  <div className="donor-location">📍 {donor.location}</div>
                  <div className="donor-available">{t('available')}</div>
                  <a href={`tel:${donor.phone}`} className="donor-contact">{t('contact')}</a>
                  {currentUser && (
                    <button onClick={() => { setSelectedDonor(donor); setMessageModalOpen(true); }} className="donor-message-btn">💬 {t('sendMessage')}</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how">
        <div className="how-container">
          <div className="how-header">
            <p>
              {t('process')}
              <span></span>
            </p>
          </div>
          <div className="how-grid">
            <div className="how-card">
              <div className="how-number">01</div>
              <div className="how-title">{t('step1Title')}</div>
              <div className="how-desc">{t('step1Desc')}</div>
            </div>
            <div className="how-card">
              <div className="how-number">02</div>
              <div className="how-title">{t('step2Title')}</div>
              <div className="how-desc">{t('step2Desc')}</div>
            </div>
            <div className="how-card">
              <div className="how-number">03</div>
              <div className="how-title">{t('step3Title')}</div>
              <div className="how-desc">{t('step3Desc')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="donors-footer">
        <div className="footer-logo">Rokto<span>Korobi</span></div>
        <div className="footer-links">
          <Link href="#">{t('privacyPolicy')}</Link>
          <Link href="#">{t('termsOfService')}</Link>
          <Link href="#">{t('aboutUs')}</Link>
        </div>
        <div className="footer-copyright">{t('copyright')}</div>
      </footer>

      {/* Message Modal */}
      {messageModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>💬 {t('sendMessage')}</h2>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={t('messagePlaceholder')}
            />
            <div className="modal-actions">
              <button onClick={() => { setMessageModalOpen(false); setMessageText(''); setSelectedDonor(null); }}>{t('cancel')}</button>
              <button onClick={handleSendMessage} disabled={!messageText.trim()}>{t('send')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Details Modal */}
      {hospitalModalOpen && selectedHospital && (
        <div className="modal-overlay">
          <div className="modal-card modal-card-hospital">
            <div className="modal-header">
              <div>
                <h2>🏥 {selectedHospital.name}</h2>
                {selectedHospital.blood_bank_available && (
                  <span className="blood-bank-badge">{t('bloodBank')}</span>
                )}
              </div>
              <button onClick={() => { setHospitalModalOpen(false); setSelectedHospital(null); }}>×</button>
            </div>

            <div className="modal-body">
              <p className="modal-label">{t('address')}</p>
              <p>{selectedHospital.address}</p>
              <p className="modal-sublabel">{selectedHospital.city}, {selectedHospital.district}</p>
            </div>

            {selectedHospital.phone && (
              <div className="modal-body">
                <p className="modal-label">{t('phone')}</p>
                <a href={`tel:${selectedHospital.phone}`}>{selectedHospital.phone}</a>
              </div>
            )}

            {selectedHospital.blood_groups_available && selectedHospital.blood_groups_available.length > 0 && (
              <div className="modal-body">
                <p className="modal-label">{t('bloodGroups')}</p>
                <div className="blood-groups">
                  {selectedHospital.blood_groups_available.map((group) => (
                    <span key={group}>{group}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="hospital-actions">
              {selectedHospital.phone && (
                <a href={`tel:${selectedHospital.phone}`}>
                  📞 {t('call')}
                </a>
              )}
              {selectedHospital.latitude && selectedHospital.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.latitude},${selectedHospital.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🗺️ {t('getDirections')}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animations & Styles */}
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

        /* Navigation */
        .donors-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 60px;
          background: rgba(250,248,244,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #E8E4DC;
        }
        .nav-logo-link {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #0E0E0E;
          text-decoration: none;
        }
        .nav-logo-accent {
          color: #9B1C1C;
        }
        .nav-links-list {
          list-style: none;
          display: flex;
          gap: 40px;
          margin: 0;
          padding: 0;
        }
        .nav-link {
          font-size: 0.78rem;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8C8680;
          text-decoration: none;
          transition: color 0.25s;
        }
        .nav-cta-link {
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9B1C1C;
          text-decoration: none;
          border: 1px solid #9B1C1C;
          padding: 9px 22px;
          transition: all 0.25s;
        }

        /* Hero */
        .hero-section {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 140px 60px 80px;
          position: relative;
          overflow: hidden;
        }
        .hero-bg {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 45vw;
          height: 100%;
          background: linear-gradient(135deg, #E8E4DC 0%, #DDD8CE 100%);
          clip-path: polygon(15% 0, 100% 0, 100% 100%, 0% 100%);
          z-index: 0;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .hero-text {
          animation: fadeUp 0.9s ease both;
        }
        .hero-tag {
          font-size: 0.72rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #9B1C1C;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tag-line {
          display: block;
          width: 32px;
          height: 1px;
          background: #9B1C1C;
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 5vw, 5.5rem);
          font-weight: 300;
          line-height: 1.08;
          color: #0E0E0E;
          margin: 0 0 28px 0;
        }
        .hero-title-accent {
          font-style: italic;
          color: #9B1C1C;
        }
        .hero-subtitle {
          font-size: 0.95rem;
          font-weight: 300;
          line-height: 1.8;
          color: #8C8680;
          max-width: 380px;
          margin: 0 0 48px 0;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .hero-btn-primary {
          background: #9B1C1C;
          color: #fff;
          font-family: 'Jost, sans-serif';
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: none;
          padding: 15px 36px;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          display: inline-block;
        }
        .hero-btn-secondary {
          font-size: 0.78rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0E0E0E;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: gap 0.25s;
        }
        .hero-visual {
          animation: fadeUp 0.9s 0.2s ease both;
          position: relative;
          width: 100%;
          height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-badge {
          position: absolute;
          background: rgba(250,248,244,0.95);
          border: 1px solid #E8E4DC;
          backdrop-filter: blur(8px);
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          min-width: 190px;
        }
        .hero-badge-map {
          top: 8%;
          left: -10%;
          animation: floatA 5s ease-in-out infinite;
        }
        .hero-badge-emergency {
          top: -4%;
          right: -6%;
          animation: floatB 5s ease-in-out infinite 1s;
        }
        .hero-badge-verified {
          bottom: 8%;
          right: -8%;
          animation: floatA 5s ease-in-out infinite 2s;
        }
        .badge-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }
        .hero-badge-map .badge-icon {
          background: #FEF3F2;
          color: #9B1C1C;
        }
        .hero-badge-emergency .badge-icon {
          background: #FFF7ED;
          color: #C2410C;
        }
        .hero-badge-verified .badge-icon {
          background: #F0FDF4;
          color: #15803D;
        }
        .hero-badge strong {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: #0E0E0E;
          margin-bottom: 2px;
        }
        .hero-badge span {
          font-size: 0.72rem;
          font-weight: 300;
          letter-spacing: 0.06em;
          color: #8C8680;
        }
        .hero-pin {
          position: relative;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pin-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid #E8E4DC;
        }
        .pin-ring-1 {
          inset: 0;
          animation: ringPulse 3s ease-in-out infinite;
        }
        .pin-ring-2 {
          inset: -28px;
          border-color: #E0DBD3;
          animation: ringPulse 3s ease-in-out infinite 0.4s;
        }
        .pin-ring-3 {
          inset: -58px;
          border-color: #EAE6DF;
          animation: ringPulse 3s ease-in-out infinite 0.8s;
        }
        .pin-center {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #9B1C1C;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 8px rgba(155,28,28,0.08), 0 0 0 16px rgba(155,28,28,0.04);
          position: relative;
          z-index: 2;
          font-size: 28px;
        }

        /* Search Section */
        .search-section {
          padding: 80px 60px;
          background: #0E0E0E;
          position: relative;
        }
        .search-container {
          max-width: 1100px;
          margin: 0 auto;
        }
        .search-header {
          font-size: 0.7rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #8C8680;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-line {
          flex: 1;
          height: 1px;
          background: #222;
        }
        .search-form {
          display: grid;
          grid-template-columns: 1fr 1.4fr auto auto;
          gap: 16px;
          align-items: end;
        }
        .search-field {
          display: flex;
          flex-direction: column;
        }
        .search-field label {
          display: block;
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8C8680;
          margin-bottom: 10px;
        }
        .search-field select,
        .search-field input {
          width: 100%;
          background: transparent;
          border: 1px solid #2A2A2A;
          color: #E8E4DC;
          font-family: 'Jost', sans-serif;
          font-size: 0.9rem;
          font-weight: 300;
          padding: 14px 18px;
          outline: none;
          transition: border-color 0.25s;
        }
        .search-btn {
          background: #9B1C1C;
          color: #fff;
          font-family: 'Jost', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: none;
          padding: 14px 32px;
          cursor: pointer;
          transition: background 0.25s;
          white-space: nowrap;
        }
        .map-toggle-btn {
          background: transparent;
          color: #E8E4DC;
          font-family: 'Jost', sans-serif;
          font-size: 0.78rem;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: 1px solid #2A2A2A;
          padding: 14px 24px;
          cursor: pointer;
          transition: all 0.25s;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Results Section */
        .results-section {
          padding: 0 60px 80px;
          max-width: 1220px;
          margin: 0 auto;
        }
        .results-container {
          max-width: 1100px;
          margin: 0 auto;
          padding-top: 64px;
        }
        .results-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 48px;
          border-bottom: 1px solid #E8E4DC;
          padding-bottom: 24px;
        }
        .results-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          color: #0E0E0E;
          margin: 0;
        }
        .results-header span {
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #8C8680;
        }
        .loading-state,
        .empty-state {
          text-align: center;
          padding: 80px 0;
        }
        .empty-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 32px;
          border: 1px solid #E8E4DC;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #8C8680;
          font-size: 1.4rem;
        }
        .empty-state h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          color: #0E0E0E;
          margin: 0 0 12px 0;
        }
        .empty-state p {
          font-size: 0.88rem;
          font-weight: 300;
          color: #8C8680;
          line-height: 1.7;
        }
        .map-container {
          padding: 20px;
          background: #FAF8F4;
          border-radius: 16px;
        }
        .hospital-search-bar {
          margin-bottom: 16px;
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .hospital-search-bar input {
          flex: 1;
          background: #fff;
          border: 1px solid #ddd;
          color: #0E0E0E;
          font-family: 'Jost', sans-serif;
          font-size: 0.9rem;
          font-weight: 300;
          padding: 12px 16px;
          outline: none;
          transition: border-color 0.25s;
          border-radius: 8px;
        }
        .hospital-search-bar span {
          font-size: 0.85rem;
          color: #8C8680;
        }
        .map-stats {
          margin-top: 16px;
          font-size: 0.9rem;
          color: #8C8680;
          text-align: center;
        }
        .donors-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #E8E4DC;
        }
        .donor-card {
          background: #FAF8F4;
          padding: 36px 32px;
          transition: background 0.25s;
          cursor: pointer;
        }
        .donor-card:hover {
          background: #F5F3EF;
        }
        .donor-blood-group {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.8rem;
          font-weight: 300;
          color: #9B1C1C;
          line-height: 1;
          margin-bottom: 20px;
        }
        .donor-name {
          font-size: 1rem;
          font-weight: 400;
          color: #0E0E0E;
          margin-bottom: 6px;
        }
        .donor-location {
          font-size: 0.8rem;
          font-weight: 300;
          color: #8C8680;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .donor-available {
          display: inline-block;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #9B1C1C;
          border: 1px solid #9B1C1C;
          padding: 4px 12px;
          margin-bottom: 16px;
        }
        .donor-contact {
          float: right;
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8C8680;
          text-decoration: none;
          padding: 4px 0;
          border-bottom: 1px solid #E8E4DC;
          transition: color 0.2s, border-color 0.2s;
        }
        .donor-contact:hover {
          color: #9B1C1C;
          border-color: #9B1C1C;
        }
        .donor-message-btn {
          display: block;
          width: 100%;
          margin-top: 16px;
          padding: 12px;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: bold;
          cursor: pointer;
        }

        /* How It Works */
        .how-section {
          padding: 80px 60px;
          background: #F5F3EF;
        }
        .how-container {
          max-width: 1100px;
          margin: 0 auto;
        }
        .how-header {
          margin-bottom: 60px;
        }
        .how-header p {
          font-size: 0.7rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #8C8680;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .how-header p span {
          flex: 1;
          height: 1px;
          background: #E8E4DC;
        }
        .how-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #E8E4DC;
        }
        .how-card {
          background: #F5F3EF;
          padding: 48px 40px;
        }
        .how-number {
          font-family: 'Cormorant Garamond', serif;
          font-size: 4rem;
          font-weight: 300;
          color: #9B1C1C;
          line-height: 1;
          margin-bottom: 24px;
        }
        .how-title {
          font-size: 1rem;
          font-weight: 500;
          color: #0E0E0E;
          margin-bottom: 12px;
        }
        .how-desc {
          font-size: 0.85rem;
          font-weight: 300;
          color: #8C8680;
          line-height: 1.75;
        }

        /* Footer */
        .donors-footer {
          background: #0E0E0E;
          color: #555;
          padding: 48px 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .footer-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          color: #888;
        }
        .footer-logo span {
          color: #9B1C1C;
        }
        .footer-links {
          display: flex;
          gap: 32px;
        }
        .footer-links a {
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #555;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-copyright {
          font-size: 0.72rem;
          color: #333;
        }

        /* Modals */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-card {
          background: white;
          padding: 32px;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
        }
        .modal-card h2 {
          font-size: 1.5rem;
          color: #0E0E0E;
          margin-bottom: 1.5rem;
        }
        .modal-card textarea {
          width: 100%;
          min-height: 150px;
          margin-bottom: 1.5rem;
          padding: 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          resize: vertical;
          font-family: inherit;
        }
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        .modal-actions button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
        }
        .modal-actions button:first-child {
          background: #9E9E9E;
          color: white;
        }
        .modal-actions button:last-child {
          background: #2196F3;
          color: white;
        }
        .modal-actions button:last-child:disabled {
          opacity: 0.6;
        }
        .modal-card-hospital {
          max-width: 500px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 20px;
        }
        .modal-header h2 {
          font-size: 1.5rem;
          color: #0E0E0E;
          margin: 0 0 8px 0;
        }
        .blood-bank-badge {
          display: inline-block;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9B1C1C;
          border: 1px solid #9B1C1C;
          padding: 4px 12px;
          border-radius: 4px;
        }
        .modal-header button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #8C8680;
        }
        .modal-body {
          margin-bottom: 20px;
        }
        .modal-label {
          font-size: 0.85rem;
          color: #8C8680;
          margin-bottom: 4px;
          margin: 0;
        }
        .modal-body > p {
          font-size: 1rem;
          color: #0E0E0E;
          margin: 0 0 12px 0;
        }
        .modal-sublabel {
          font-size: 0.85rem;
          color: #8C8680;
          margin: 0;
        }
        .modal-body a {
          font-size: 1.1rem;
          color: #9B1C1C;
          text-decoration: none;
          font-weight: 500;
        }
        .blood-groups {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .blood-groups span {
          background: #FEF3F2;
          color: #9B1C1C;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .hospital-actions {
          display: flex;
          gap: 12px;
        }
        .hospital-actions a {
          flex: 1;
          background: #9B1C1C;
          color: white;
          padding: 14px 24px;
          border-radius: 8px;
          text-align: center;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          display: block;
        }
        .hospital-actions a:last-child {
          background: #2196F3;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .donors-nav {
            padding: 16px 24px;
          }
          .nav-links-list {
            gap: 24px;
          }
          .search-section {
            padding: 60px 24px;
          }
          .search-form {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .search-form button:last-child {
            grid-column: span 2;
          }
          .results-section {
            padding: 0 24px 60px;
          }
          .how-section {
            padding: 60px 24px;
          }
          .donors-footer {
            padding: 40px 24px;
            flex-wrap: wrap;
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .donors-nav {
            padding: 12px 16px;
          }
          .nav-logo-link {
            font-size: 1.2rem;
          }
          .nav-links-list {
            display: none;
          }
          .nav-cta-link {
            padding: 8px 14px;
            font-size: 0.7rem;
          }
          
          .hero-section {
            padding: 100px 16px 60px;
            min-height: auto;
          }
          .hero-content {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .hero-visual {
            height: 300px;
            order: -1;
          }
          .hero-badge {
            display: none;
          }
          
          .search-section {
            padding: 40px 16px;
          }
          .search-form {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .search-form button:last-child {
            grid-column: span 1;
          }
          
          .results-section {
            padding: 0 16px 40px;
          }
          .donors-grid {
            grid-template-columns: 1fr;
          }
          
          .how-section {
            padding: 40px 16px;
          }
          .how-grid {
            grid-template-columns: 1fr;
          }
          .how-card {
            padding: 32px 24px;
          }
          
          .donors-footer {
            padding: 32px 16px;
            flex-direction: column;
            text-align: center;
            gap: 24px;
          }
          .footer-copyright {
            order: -1;
          }
          
          .modal-card {
            max-width: calc(100vw - 32px);
            margin: 16px;
            padding: 24px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2.2rem;
          }
          .results-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          .hospital-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
