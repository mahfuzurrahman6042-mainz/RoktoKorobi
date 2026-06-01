'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { listAllDonors } from '@/lib/firebase';

// Dynamic import for Leaflet map (SSR disabled)
const BangladeshMap = dynamic(() => import('@/components/BangladeshMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '480px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      borderRadius: '0 0 16px 16px',
      gap: '12px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #8B1A1A',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ color: '#6b7280', fontSize: '14px' }}>Loading map...</span>
    </div>
  )
});

const bloodColors = {
  'A+': '#c0392b', 'A-': '#e74c3c', 'B+': '#1565C0', 'B-': '#1976D2',
  'AB+': '#6A1B9A', 'AB-': '#7B1FA2', 'O+': '#2E7D32', 'O-': '#388E3C'
};

const translations = {
  en: {
    hero_eyebrow: "Blood Donation Platform",
    hero_words: [
      { text: "Every ", red: false },
      { text: "Drop ", red: false },
      { text: "Matters,\n", red: true },
      { text: "Every ", red: false },
      { text: "Drop ", red: false },
      { text: "Saves ", red: false },
      { text: "Lives", red: false }
    ],
    hero_subtitle: "Connecting donors, saving lives",
    find_btn: "FIND DONORS",
    request_btn: "REQUEST BLOOD",
    register_btn: "REGISTER AS DONOR →",
    section_label: "Donors & Hospitals",
    section_title: "Find on Map",
    section_sub: "Find blood donors near you",
    stat_active: "Active Donors",
    stat_districts: "Districts Covered",
    stat_support: "Available Support",
    filter_title: "Filter Results",
    blood_filter: "Blood Group",
    district_filter: "District",
    all_blood: "All Blood Groups",
    all_districts: "All Districts",
    search_btn: "Search",
    map_header: "Interactive Donor Map",
    map_street: "Street",
    map_satellite: "Satellite",
    map_legend: "Blood Group",
    view_all: "VIEW ALL DONORS →",
    live_map: "Live Map",
    gps_tracking: "GPS Tracking",
    verified_donors: "Verified Donors",
    all_available: "All Available"
  },
  bn: {
    hero_eyebrow: "রক্তদান প্ল্যাটফর্ম",
    hero_words: [
      { text: "প্রতিটি ", red: false },
      { text: "ফোঁটা ", red: false },
      { text: "মূল্যবান,\n", red: true },
      { text: "প্রতিটি ", red: false },
      { text: "ফোঁটা ", red: false },
      { text: "জীবন ", red: false },
      { text: "বাঁচায়", red: false }
    ],
    hero_subtitle: "দাতাদের সংযুক্ত করে, জীবন বাঁচায়",
    find_btn: "দাতা খুঁজুন",
    request_btn: "রক্তের অনুরোধ করুন",
    register_btn: "দাতা হিসেবে নিবন্ধন করুন →",
    section_label: "দাতা ও হাসপাতাল",
    section_title: "ম্যাপে দেখুন",
    section_sub: "আপনার কাছাকাছি রক্তদাতা খুঁজুন",
    stat_active: "সক্রিয় দাতা",
    stat_districts: "জেলা",
    stat_support: "সহায়তা",
    filter_title: "ফিল্টার করুন",
    blood_filter: "রক্তের গ্রুপ",
    district_filter: "জেলা",
    all_blood: "সব রক্তের গ্রুপ",
    all_districts: "সব জেলা",
    search_btn: "খুঁজুন",
    map_header: "ইন্টারঅ্যাক্টিভ দাতার ম্যাপ",
    map_street: "স্ট্রিট",
    map_satellite: "স্যাটেলাইট",
    map_legend: "রক্তের গ্রুপ",
    view_all: "সব দাতা দেখুন →",
    live_map: "লাইভ ম্যাপ",
    gps_tracking: "GPS ট্র্যাকিং",
    verified_donors: "যাচাইকৃত দাতা",
    all_available: "সকল দাতা"
  }
};

const districts = [
  {
    division: "Dhaka",
    division_bn: "ঢাকা",
    districts: [
      { en: "Dhaka", bn: "ঢাকা" },
      { en: "Narayanganj", bn: "নারায়ণগঞ্জ" },
      { en: "Gazipur", bn: "গাজীপুর" },
      { en: "Manikganj", bn: "মানিকগঞ্জ" },
      { en: "Munshiganj", bn: "মুন্সীগঞ্জ" },
      { en: "Narsingdi", bn: "নরসিংদী" },
      { en: "Tangail", bn: "টাঙ্গাইল" },
      { en: "Kishoreganj", bn: "কিশোরগঞ্জ" },
      { en: "Faridpur", bn: "ফরিদপুর" },
      { en: "Gopalganj", bn: "গোপালগঞ্জ" },
      { en: "Madaripur", bn: "মাদারীপুর" },
      { en: "Rajbari", bn: "রাজবাড়ী" },
      { en: "Shariatpur", bn: "শরিয়তপুর" }
    ]
  },
  {
    division: "Mymensingh",
    division_bn: "ময়মনসিংহ",
    districts: [
      { en: "Mymensingh", bn: "ময়মনসিংহ" },
      { en: "Jamalpur", bn: "জামালপুর" },
      { en: "Sherpur", bn: "শেরপুর" },
      { en: "Netrokona", bn: "নেত্রকোণা" }
    ]
  },
  {
    division: "Chattogram",
    division_bn: "চট্টগ্রাম",
    districts: [
      { en: "Chattogram", bn: "চট্টগ্রাম" },
      { en: "Cox's Bazar", bn: "কক্সবাজার" },
      { en: "Rangamati", bn: "রাঙ্গামাটি" },
      { en: "Bandarban", bn: "বান্দরবান" },
      { en: "Khagrachhari", bn: "খাগড়াছড়ি" },
      { en: "Feni", bn: "ফেনী" },
      { en: "Noakhali", bn: "নোয়াখালী" },
      { en: "Lakshmipur", bn: "লক্ষ্মীপুর" },
      { en: "Comilla", bn: "কুমিল্লা" },
      { en: "Chandpur", bn: "চাঁদপুর" },
      { en: "Brahmanbaria", bn: "ব্রাহ্মণবাড়িয়া" }
    ]
  },
  {
    division: "Sylhet",
    division_bn: "সিলেট",
    districts: [
      { en: "Sylhet", bn: "সিলেট" },
      { en: "Moulvibazar", bn: "মৌলভীবাজার" },
      { en: "Habiganj", bn: "হবিগঞ্জ" },
      { en: "Sunamganj", bn: "সুনামগঞ্জ" }
    ]
  },
  {
    division: "Rajshahi",
    division_bn: "রাজশাহী",
    districts: [
      { en: "Rajshahi", bn: "রাজশাহী" },
      { en: "Chapainawabganj", bn: "চাঁপাইনবাবগঞ্জ" },
      { en: "Naogaon", bn: "নওগাঁ" },
      { en: "Natore", bn: "নাটোর" },
      { en: "Bogura", bn: "বগুড়া" },
      { en: "Joypurhat", bn: "জয়পুরহাট" },
      { en: "Sirajganj", bn: "সিরাজগঞ্জ" },
      { en: "Pabna", bn: "পাবনা" }
    ]
  },
  {
    division: "Rangpur",
    division_bn: "রংপুর",
    districts: [
      { en: "Rangpur", bn: "রংপুর" },
      { en: "Dinajpur", bn: "দিনাজপুর" },
      { en: "Thakurgaon", bn: "ঠাকুরগাঁও" },
      { en: "Panchagarh", bn: "পঞ্চগড়" },
      { en: "Nilphamari", bn: "নীলফামারী" },
      { en: "Lalmonirhat", bn: "লালমনিরহাট" },
      { en: "Kurigram", bn: "কুড়িগ্রাম" },
      { en: "Gaibandha", bn: "গাইবান্ধা" }
    ]
  },
  {
    division: "Khulna",
    division_bn: "খুলনা",
    districts: [
      { en: "Khulna", bn: "খুলনা" },
      { en: "Bagerhat", bn: "বাগেরহাট" },
      { en: "Satkhira", bn: "সাতক্ষীরা" },
      { en: "Jessore", bn: "যশোর" },
      { en: "Narail", bn: "নড়াইল" },
      { en: "Magura", bn: "মাগুরা" },
      { en: "Jhenaidah", bn: "ঝিনাইদহ" },
      { en: "Kushtia", bn: "কুষ্টিয়া" },
      { en: "Chuadanga", bn: "চুয়াডাঙ্গা" },
      { en: "Meherpur", bn: "মেহেরপুর" }
    ]
  },
  {
    division: "Barishal",
    division_bn: "বরিশাল",
    districts: [
      { en: "Barishal", bn: "বরিশাল" },
      { en: "Bhola", bn: "ভোলা" },
      { en: "Patuakhali", bn: "পটুয়াখালী" },
      { en: "Barguna", bn: "বরগুনা" },
      { en: "Jhalokathi", bn: "ঝালকাঠি" },
      { en: "Pirojpur", bn: "পিরোজপুর" }
    ]
  }
];

// Hospital data for map (empty - will be populated from Firebase)
const hospitals: any[] = [];

export default function DonorsPage() {
  const [language, setLanguage] = useState('en');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [statCount, setStatCount] = useState(0);
  const [districtCount, setDistrictCount] = useState(0);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'bn')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    if (language) {
      localStorage.setItem('language', language);
    }
  }, [language]);

  useEffect(() => {
    // Load donors from Firebase Realtime Database
    const loadDonors = async () => {
      try {
        const donorsData = await listAllDonors();
        if (donorsData && donorsData.length > 0) {
          const donorsArray = donorsData.map((doc: any) => ({
            id: doc.id,
            name: doc.name || 'Unknown',
            nameEn: doc.name || 'Unknown',
            blood: doc.bloodGroup || 'Unknown',
            district: doc.district || 'Unknown',
            districtBn: doc.district || 'Unknown',
            lat: doc.lat || 23.8103,
            lng: doc.lng || 90.4125,
            lastDonated: doc.lastDonation || 'Unknown',
            lastDonatedEn: doc.lastDonation || 'Unknown'
          }));
          setDonors(donorsArray);
          setFilteredDonors(donorsArray);
        } else {
          // No donors in database yet
          setDonors([]);
          setFilteredDonors([]);
        }
      } catch (error) {
        console.log('Firebase error:', error);
        setDonors([]);
        setFilteredDonors([]);
      }
    };

    loadDonors();
  }, []);

  useEffect(() => {
    // Count up animation for stat
    const target = donors.length;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setStatCount(target);
        clearInterval(timer);
      } else {
        setStatCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [donors.length]);

  useEffect(() => {
    // Calculate unique districts from donors
    const uniqueDistricts = new Set(donors.map((donor: any) => donor.district));
    setDistrictCount(uniqueDistricts.size);
  }, [donors]);

  const handleFilter = () => {
    setLoading(true);
    setTimeout(() => {
      const filtered = donors.filter(donor => {
        const matchesBlood = !selectedBloodGroup || donor.blood === selectedBloodGroup;
        const matchesDistrict = !selectedDistrict || donor.district === selectedDistrict;
        return matchesBlood && matchesDistrict;
      });
      setFilteredDonors(filtered.length > 0 ? filtered : []);
      setLoading(false);
    }, 600);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  const t = translations[language];

  if (!mounted) return null;

  return (
    <div style={{
      fontFamily: language === 'bn' ? "'Noto Sans Bengali', 'DM Sans', sans-serif" : "'DM Sans', system-ui, sans-serif",
      background: '#F5F0E8',
      color: '#1A1A1A',
      minHeight: '100vh',
      padding: 0,
      margin: 0
    }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: ${language === 'bn' ? "'Noto Sans Bengali', 'DM Sans', sans-serif" : "'DM Sans', system-ui, sans-serif"};
          background: #F5F0E8;
          color: #1A1A1A;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes radar {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #8B1A1A 0%, #6B1010 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 800
          }}>
            R
          </div>
          <span style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#8B1A1A'
          }}>
            RoktoKorobi
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleLanguageChange('en')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '24px',
              background: language === 'en' ? '#8B1A1A' : 'transparent',
              color: language === 'en' ? 'white' : '#8B1A1A',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            EN
          </button>
          <button
            onClick={() => handleLanguageChange('bn')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '24px',
              background: language === 'bn' ? '#8B1A1A' : 'transparent',
              color: language === 'bn' ? 'white' : '#8B1A1A',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            বাংলা
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        paddingTop: '120px',
        paddingBottom: '80px',
        padding: '120px 32px 80px',
        background: 'linear-gradient(135deg, #8B1A1A 0%, #6B1010 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          animation: 'pulse 3s infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          animation: 'pulse 4s infinite 1s'
        }} />
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center'
        }}>
          <div style={{ animation: 'fadeIn 1s ease-out' }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 20px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '24px',
              backdropFilter: 'blur(10px)'
            }}>
              {t.hero_eyebrow}
            </span>
            <h1 style={{
              fontSize: language === 'bn' ? '48px' : '56px',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '24px',
              whiteSpace: 'pre-line'
            }}>
              {t.hero_words.map((word, index) => (
                <span key={index} style={{ color: word.red ? '#FF6B6B' : 'white' }}>
                  {word.text}
                </span>
              ))}
            </h1>
            <p style={{
              fontSize: language === 'bn' ? '18px' : '20px',
              marginBottom: '40px',
              opacity: 0.9
            }}>
              {t.hero_subtitle}
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button style={{
                padding: '16px 32px',
                background: 'white',
                color: '#8B1A1A',
                border: 'none',
                borderRadius: '32px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}>
                {t.find_btn}
              </button>
              <button style={{
                padding: '16px 32px',
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '32px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                {t.request_btn}
              </button>
            </div>
          </div>
          
          {/* Phone Mockup with Radar */}
          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            animation: 'float 3s ease-in-out infinite'
          }}>
            <div style={{
              width: '280px',
              height: '560px',
              background: '#1A1A1A',
              borderRadius: '40px',
              padding: '12px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #8B1A1A 0%, #6B1010 100%)',
                borderRadius: '32px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  zIndex: 10
                }}>
                  🩸
                </div>
                <div style={{
                  position: 'absolute',
                  width: '100px',
                  height: '100px',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '50%',
                  animation: 'radar 2s infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  width: '100px',
                  height: '100px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  animation: 'radar 2s infinite 0.5s'
                }} />
                <div style={{
                  position: 'absolute',
                  width: '100px',
                  height: '100px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  animation: 'radar 2s infinite 1s'
                }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '80px 32px',
        background: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px'
        }}>
          <div style={{
            background: '#F5F0E8',
            padding: '40px',
            borderRadius: '24px',
            textAlign: 'center',
            animation: 'slideUp 0.6s ease-out'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🩸</div>
            <div style={{
              fontSize: '48px',
              fontWeight: 800,
              color: '#8B1A1A',
              marginBottom: '8px'
            }}>
              {statCount}
            </div>
            <div style={{ fontSize: '18px', color: '#666' }}>{t.stat_active}</div>
          </div>
          <div style={{
            background: '#F5F0E8',
            padding: '40px',
            borderRadius: '24px',
            textAlign: 'center',
            animation: 'slideUp 0.6s ease-out 0.2s'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
            <div style={{
              fontSize: '48px',
              fontWeight: 800,
              color: '#8B1A1A',
              marginBottom: '8px'
            }}>
              {districtCount}
            </div>
            <div style={{ fontSize: '18px', color: '#666' }}>{t.stat_districts}</div>
          </div>
          <div style={{
            background: '#F5F0E8',
            padding: '40px',
            borderRadius: '24px',
            textAlign: 'center',
            animation: 'slideUp 0.6s ease-out 0.4s'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕐</div>
            <div style={{
              fontSize: '48px',
              fontWeight: 800,
              color: '#8B1A1A',
              marginBottom: '8px'
            }}>
              24/7
            </div>
            <div style={{ fontSize: '18px', color: '#666' }}>{t.stat_support}</div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section ref={mapSectionRef} style={{
        padding: '80px 32px',
        background: '#F5F0E8'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 20px',
              background: '#8B1A1A',
              color: 'white',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              {t.section_label}
            </span>
            <h2 style={{
              fontSize: language === 'bn' ? '36px' : '42px',
              fontWeight: 800,
              marginBottom: '12px',
              color: '#1A1A1A'
            }}>
              {language === 'bn' ? 'রক্তদাতা ও হাসপাতাল' : 'Donors & Hospitals'}{" "}
              <span style={{ color: '#dc2626', fontWeight: 800, fontStyle: 'italic' }}>
                {language === 'bn' ? 'মানচিত্রে' : 'on Map'}
              </span>
            </h2>
            <p style={{ fontSize: '18px', color: '#666' }}>
              {t.section_sub}
            </p>
          </div>

          {/* Filter Card */}
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '24px',
            marginBottom: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '24px',
              color: '#1A1A1A'
            }}>
              {t.filter_title}
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: '#666'
                }}>
                  {t.blood_filter}
                </label>
                <select
                  value={selectedBloodGroup}
                  onChange={(e) => setSelectedBloodGroup(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">{t.all_blood}</option>
                  {Object.keys(bloodColors).map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: '#666'
                }}>
                  {t.district_filter}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">{t.all_districts}</option>
                  {districts.map(division => (
                    <optgroup key={division.division} label={language === 'bn' ? division.division_bn : division.division}>
                      {division.districts.map(district => (
                        <option key={district.en} value={district.en}>
                          {language === 'bn' ? district.bn : district.en}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleFilter}
              disabled={loading}
              style={{
                padding: '14px 32px',
                background: '#8B1A1A',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Loading...' : t.search_btn}
            </button>
          </div>

          {/* Map */}
          <div style={{
            background: 'white',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A' }}>
                {t.map_header}
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  padding: '8px 16px',
                  background: '#8B1A1A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  {t.map_street}
                </button>
                <button style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  color: '#666',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  {t.map_satellite}
                </button>
              </div>
            </div>
            <BangladeshMap 
              center={{ lat: 23.685, lng: 90.3563 }}
              zoom={7}
              donors={filteredDonors.map(donor => ({
                id: donor.id,
                name: language === 'bn' ? donor.name : donor.nameEn,
                bloodGroup: donor.blood,
                location: language === 'bn' ? donor.districtBn : donor.district,
                lat: donor.lat,
                lng: donor.lng,
                available: true,
                phone: '+8801234567890'
              }))}
              hospitals={hospitals}
            />
          </div>

          {/* Legend */}
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: 'white',
            borderRadius: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
          }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#666' }}>
              {t.map_legend}:
            </span>
            {Object.entries(bloodColors).map(([group, color]) => (
              <div key={group} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  background: color,
                  borderRadius: '50%'
                }} />
                <span style={{ fontSize: '14px', color: '#666' }}>{group}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '48px 32px',
        background: '#1A1A1A',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 800,
            marginBottom: '16px',
            color: '#8B1A1A'
          }}>
            RoktoKorobi
          </div>
          <p style={{ fontSize: '16px', color: '#999', marginBottom: '24px' }}>
            {language === 'bn' ? 'রক্তদান মানে জীবনদান' : 'Every drop counts, every life matters'}
          </p>
          <div style={{ fontSize: '14px', color: '#666' }}>
            © 2026 RoktoKorobi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
