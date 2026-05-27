"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Users, Heart, FileText, FileImage, Image, Settings, 
  MapPin, Phone, Clock, Calendar, Star, MessageCircle, 
  Menu, X, Search, Bell, User, ChevronDown, Droplets,
  Activity, Shield, Globe, Filter, LogOut
} from 'lucide-react';
import { logoutUser, getCurrentUser, getUserData, updateUserData, onAuthStateChange } from '@/lib/firebase';

export default function Dashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'test@example.com',
    bloodGroup: 'O+',
    donations: 0,
    lastDonation: null,
    phone: '0171-1234567',
    location: 'Dhaka',
    rating: 4.8,
    isDonor: false,
    fulfilledRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
    
    // Check Firebase authentication
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
          try {
            const data = await getUserData(user.uid);
            if (data) {
              setUserData(prev => ({ ...prev, ...data }));
            } else {
              setUserData(prev => ({ ...prev, email: user.email || '', name: user.displayName || 'User' }));
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    if (!confirm(language === 'bn' ? 'আপনি কি লগআউট করতে চান?' : 'Are you sure you want to logout?')) {
      return;
    }

    setLoggingOut(true);
    try {
      await logoutUser();
      // Clear local storage
      localStorage.removeItem('language');
      setCurrentUser(null);
      setUserData({
        name: 'John Doe',
        email: 'test@example.com',
        bloodGroup: 'O+',
        donations: 0,
        lastDonation: null,
        phone: '0171-1234567',
        location: 'Dhaka',
        rating: 4.8,
        isDonor: false,
        fulfilledRequests: 0
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert(language === 'bn' ? 'লগআউট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Logout failed. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'bn' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  // Navigation items - conditionally include "Become a Donor" for non-donor users
  const navigationItems = [
    { id: 'overview', label: language === 'bn' ? 'ওভারভিউ' : 'Overview', icon: Home },
    { id: 'donors', label: language === 'bn' ? 'রক্তদাতা' : 'Donors', icon: Users },
    { id: 'request', label: language === 'bn' ? 'রক্ত অনুরোধ' : 'Request Blood', icon: Heart },
    ...(userData.isDonor === false ? [
      { id: 'become-donor', label: language === 'bn' ? 'দাতা হন' : 'Become a Donor', icon: Droplets }
    ] : []),
    { id: 'blog', label: language === 'bn' ? 'ব্লগ' : 'Blog', icon: FileText },
    { id: 'illustrations', label: language === 'bn' ? 'রক্তকরবী চিত্রকথন' : 'RoktoKorobi Chitrokothon', icon: Image },
    { id: 'testimonials', label: language === 'bn' ? 'সাক্ষ্য' : 'Testimonials', icon: MessageCircle },
    { id: 'profile', label: language === 'bn' ? 'প্রোফাইল' : 'Profile', icon: User },
    { id: 'settings', label: language === 'bn' ? 'সেটিংস' : 'Settings', icon: Settings },
  ];

  const t = (key: string) => {
    const translations: Record<string, any> = {
      welcome: { en: 'Welcome back', bn: 'স্বাগতম ফিরে' },
      dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
      profile: { en: 'My Profile', bn: 'আমার প্রোফাইল' },
      donations: { en: 'My Donations', bn: 'আমার রক্তদান' },
      requests: { en: 'Blood Requests', bn: 'রক্তের অনুরোধ' },
      settings: { en: 'Settings', bn: 'সেটিংস' },
      logout: { en: 'Logout', bn: 'লগআউট' },
      totalDonations: { en: 'Total Donations', bn: 'মোট রক্তদান' },
      lastDonation: { en: 'Last Donation', bn: 'সর্বশেষ রক্তদান' },
      bloodGroup: { en: 'Blood Group', bn: 'রক্তের গ্রুপ' },
      never: { en: 'Never', bn: 'কখনও না' },
      findDonors: { en: 'Find Donors', bn: 'দাতা খুঁজুন' },
      requestBlood: { en: 'Request Blood', bn: 'রক্তের অনুরোধ করুন' },
      editProfile: { en: 'Edit Profile', bn: 'প্রোফাইল সম্পাদনা করুন' }
    };
    return translations[key]?.[language] || key;
  };

  if (!mounted) return null;
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F5EDD8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🩸</div>
          <p style={{ fontSize: '18px', color: '#666' }}>{language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%) !important;
          }
          .sidebar.open {
            transform: translateX(0) !important;
          }
          .main-content {
            margin-left: 0 !important;
          }
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          .donor-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5EDD8' }}>
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1001,
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px',
          cursor: 'pointer',
          display: window.innerWidth <= 768 ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{
        width: sidebarOpen ? '280px' : '80px',
        backgroundColor: '#1A0F0A',
        color: 'white',
        transition: 'transform 0.3s ease, width 0.3s ease',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 1000,
        overflow: 'hidden',
        transform: window.innerWidth <= 768 && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)'
      }}>
        
        {/* Sidebar Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center'
        }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>🩸</span>
              <div>
                <div style={{ fontFamily: 'serif', fontSize: '20px', color: '#dc2626', letterSpacing: '-0.01em' }}>রক্তকরবী</div>
                <div style={{ fontSize: '10px', color: '#1B5E6B', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' }}>RoktoKorobi</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <div style={{ padding: '20px 0' }}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    width: '100%',
                    padding: sidebarOpen ? '12px 20px' : '12px',
                    border: 'none',
                    background: activeSection === item.id ? '#dc2626' : 'transparent',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: sidebarOpen ? '12px' : '0',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    fontWeight: activeSection === item.id ? 600 : 400,
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(192,21,42,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span style={{ marginLeft: '8px', textAlign: 'left' }}>{item.label}</span>}
                </button>
              </div>
            );
          })}
        </div>

        {/* User Profile Section */}
        {sidebarOpen && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            padding: '16px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {userData.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{userData.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>{userData.bloodGroup}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '8px',
                background: 'rgba(192,21,42,0.2)',
                border: '1px solid rgba(192,21,42,0.3)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={14} />
              {t('logout')}
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="main-content" style={{
        marginLeft: sidebarOpen ? '280px' : '80px',
        flex: 1,
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh'
      }}>
        
        {/* Top Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px 32px',
          borderBottom: '1px solid #E0DDD6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A0F0A', margin: 0 }}>
              {navigationItems.find(item => item.id === activeSection)?.label || t('dashboard')}
            </h1>
            <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>
              {language === 'bn' ? 'আপনার রক্তদান কার্যক্রম পরিচালনা করুন' : 'Manage your blood donation activities'}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1B5E6B',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500',
                textAlign: 'center'
              }}
            >
              <Home size={16} />
              <span style={{ marginLeft: '8px' }}>{language === 'bn' ? 'হোমপেজ' : 'Go to Home'}</span>
            </button>
            
            <button
              onClick={toggleLanguage}
              style={{
                padding: '8px 16px',
                backgroundColor: '#F5EDD8',
                border: '1px solid #E0DDD6',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500',
                textAlign: 'center'
              }}
            >
              <Globe size={16} />
              <span style={{ marginLeft: '8px' }}>{language === 'bn' ? 'বাংলা' : 'English'}</span>
            </button>
            
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              {userData.name.charAt(0)}
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div style={{ padding: '32px' }}>
          {activeSection === 'overview' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
                {language === 'bn' ? 'ওভারভিউ' : 'Overview'}
              </h2>
              <p style={{ color: '#666', textAlign: 'center' }}>
                {language === 'bn' ? 'আপনার রক্তদান কার্যক্রম পরিচালনা করুন' : 'Summary of your blood donation activities'}
              </p>

              {/* Stats Cards */}
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '32px' }}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(26,15,10,0.08)',
                  border: '1px solid #E0DDD6',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#dc2626', marginBottom: '8px' }}>
                    {userData.donations}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                    {language === 'bn' ? 'মোট রক্তদান' : 'Total Donations'}
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(26,15,10,0.08)',
                  border: '1px solid #E0DDD6',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#22C55E', marginBottom: '8px' }}>
                    {userData.fulfilledRequests}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                    {language === 'bn' ? 'সম্পন্ন অনুরোধ' : 'Fulfilled Requests'}
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(26,15,10,0.08)',
                  border: '1px solid #E0DDD6',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1B5E6B', marginBottom: '8px' }}>
                    {userData.rating}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                    {language === 'bn' ? 'রেটিং' : 'Rating'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'donors' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
                {language === 'bn' ? 'রক্তদাতা খুঁজুন' : 'Find Donors'}
              </h2>
              <p style={{ color: '#666', marginBottom: '24px', textAlign: 'center' }}>
                {language === 'bn' ? 'রক্তের গ্রুপ এবং অবস্থান অনুযায়ী রক্তদাতা খুঁজুন' : 'Search for donors by blood group and location'}
              </p>
              
              {/* Donor Search Section */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(26,15,10,0.08)',
                border: '1px solid #E0DDD6',
                marginBottom: '24px'
              }}>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
                    </label>
                    <select style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E0DDD6',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}>
                      <option value="all">{language === 'bn' ? 'সব গ্রুপ' : 'All Groups'}</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'জেলা' : 'District'}
                    </label>
                    <select style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E0DDD6',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}>
                      <option value="all">{language === 'bn' ? 'সব জেলা' : 'All Districts'}</option>
                      <option value="dhaka">{language === 'bn' ? 'ঢাকা' : 'Dhaka'}</option>
                      <option value="chattogram">{language === 'bn' ? 'চট্টগ্রাম' : 'Chattogram'}</option>
                      <option value="rajshahi">{language === 'bn' ? 'রাজশাহী' : 'Rajshahi'}</option>
                      <option value="khulna">{language === 'bn' ? 'খুলনা' : 'Khulna'}</option>
                      <option value="sylhet">{language === 'bn' ? 'সিলেট' : 'Sylhet'}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'অনুসন্ধান' : 'Search'}
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder={language === 'bn' ? 'নাম বা অবস্থান...' : 'Name or location...'}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          border: '1px solid #E0DDD6',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                      <button style={{
                        padding: '10px 20px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Search size={16} />
                        {language === 'bn' ? 'খুঁজুন' : 'Search'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Donor Results */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(26,15,10,0.08)',
                border: '1px solid #E0DDD6'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1A0F0A' }}>
                  {language === 'bn' ? 'উপলব্ধ রক্তদাতা' : 'Available Donors'}
                </h3>
                
                {/* Donor Cards */}
                <div className="donor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {/* Sample Donor Card */}
                  <div style={{
                    border: '1px solid #E0DDD6',
                    borderRadius: '12px',
                    padding: '16px',
                    backgroundColor: '#FDFAF4'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        ম
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0', color: '#1A0F0A' }}>
                          মোঃ রহিম
                        </h4>
                        <p style={{ fontSize: '14px', color: '#666', margin: '2px 0' }}>
                          ঢাকা মেডিকেল
                        </p>
                      </div>
                      <div style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        A+
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                      <Phone size={14} />
                      <span>0171-1234567</span>
                      <span style={{ marginLeft: 'auto', color: '#22C55E', fontWeight: '500' }}>
                        ✓ {language === 'bn' ? 'উপলব্ধ' : 'Available'}
                      </span>
                    </div>
                    
                    <button style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#1B5E6B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <MessageCircle size={14} />
                      {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact'}
                    </button>
                  </div>
                  
                  {/* More donor cards would go here */}
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'request' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
                {language === 'bn' ? 'রক্ত অনুরোধ' : 'Request Blood'}
              </h2>
              <p style={{ color: '#666', marginBottom: '24px', textAlign: 'center' }}>
                {language === 'bn' ? 'জরুরি রক্ত প্রয়ে আমার বাবার জীবন বাঁচাল। ধন্যবাদ রক্তকরবী।' : 'Submit blood request for emergency needs'}
              </p>
              
              {/* Blood Request Form */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(26,15,10,0.08)',
                border: '1px solid #E0DDD6'
              }}>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'রোগীর নাম' : 'Patient Name'} *
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'bn' ? 'রোগীর নাম লিখুন' : 'Enter patient name'}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'} *
                    </label>
                    <select style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E0DDD6',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}>
                      <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'হাসপাতাল' : 'Hospital'} *
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'bn' ? 'হাসপাতালের নাম' : 'Hospital name'}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'জেলা' : 'District'} *
                    </label>
                    <select style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E0DDD6',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}>
                      <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                      <option value="dhaka">{language === 'bn' ? 'ঢাকা' : 'Dhaka'}</option>
                      <option value="chattogram">{language === 'bn' ? 'চট্টগ্রাম' : 'Chattogram'}</option>
                      <option value="rajshahi">{language === 'bn' ? 'রাজশাহী' : 'Rajshahi'}</option>
                      <option value="khulna">{language === 'bn' ? 'খুলনা' : 'Khulna'}</option>
                      <option value="sylhet">{language === 'bn' ? 'সিলেট' : 'Sylhet'}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'যোগাযোগ নম্বর' : 'Contact Number'} *
                    </label>
                    <input
                      type="tel"
                      placeholder={language === 'bn' ? 'ফোন নম্বর' : 'Phone number'}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'রক্তের পরিমাণ (ব্যাগ)' : 'Blood Units (bags)'} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'অনুরোধের বিবরণ' : 'Request Details'}
                    </label>
                    <textarea
                      rows={4}
                      placeholder={language === 'bn' ? 'অনুরোধের বিস্তারিত বিবরণ...' : 'Detailed request description...'}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
                      <input
                        type="checkbox"
                        style={{ width: '16px', height: '16px' }}
                      />
                      {language === 'bn' ? 'এটি জরুরি অনুরোধ' : 'This is an emergency request'}
                    </label>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button style={{
                    padding: '12px 24px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Heart size={16} />
                    {language === 'bn' ? 'অনুরোধ জমা দিন' : 'Submit Request'}
                  </button>
                  
                  <button style={{
                    padding: '12px 24px',
                    backgroundColor: '#F5EDD8',
                    color: '#1A0F0A',
                    border: '1px solid #E0DDD6',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    {language === 'bn' ? 'পরিষ্কার করুন' : 'Clear'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'blog' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
                {language === 'bn' ? 'ব্লগ' : 'Blog'}
              </h2>
              <p style={{ color: '#666', marginBottom: '24px', textAlign: 'center' }}>
                {language === 'bn' ? 'রক্তদান সম্পর্কিত আর্টিকেল এবং তথ্য' : 'Blood donation articles and information'}
              </p>
              
              {/* Blog Categories */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {['All', 'Donation Tips', 'Success Stories', 'Health', 'Events'].map((category) => (
                  <button
                    key={category}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: category === 'All' ? '#dc2626' : '#F5EDD8',
                      color: category === 'All' ? 'white' : '#1A0F0A',
                      border: '1px solid #E0DDD6',
                      borderRadius: '20px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {language === 'bn' ? 
                      category === 'All' ? 'সব' :
                      category === 'Donation Tips' ? 'দান টিপস' :
                      category === 'Success Stories' ? 'সাফল্যের গল্প' :
                      category === 'Health' ? 'স্বাস্থ্য' : 'ইভেন্টিস'
                      : category}
                  </button>
                ))}
              </div>
              
              {/* Blog Posts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {/* Blog Post 1 */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(26,15,10,0.08)',
                  border: '1px solid #E0DDD6'
                }}>
                  <div style={{
                    height: '200px',
                    backgroundColor: 'linear-gradient(135deg, #dc2626, #1B5E6B)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '48px'
                  }}>
                    🩸
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {language === 'bn' ? 'দান টিপস' : 'Donation Tips'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {language === 'bn' ? '২ দিন আগে' : '2 days ago'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'রক্তদানের আগে যা করণীয়' : 'What to Do Before Donating Blood'}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: '1.5' }}>
                      {language === 'bn' ? 
                        'রক্তদানের আগে প্রয়োজনীয় প্রস্তুতি এবং সতর্কতা অবলম্বন করা উচিত। এটি আপনার এবং প্রাপক উভয়ের জন্যই নিরাপদ।' :
                        'Essential preparations and precautions before donating blood ensure safety for both you and the recipient.'
                      }
                    </p>
                    <button style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: '#dc2626',
                      border: '1px solid #dc2626',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      {language === 'bn' ? 'আরও পড়ুন' : 'Read More'}
                    </button>
                  </div>
                </div>
                
                {/* Blog Post 2 */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(26,15,10,0.08)',
                  border: '1px solid #E0DDD6'
                }}>
                  <div style={{
                    height: '200px',
                    backgroundColor: 'linear-gradient(135deg, #1B5E6B, #22C55E)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '48px'
                  }}>
                    ❤️
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{
                        backgroundColor: '#1B5E6B',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {language === 'bn' ? 'সাফল্যের গল্প' : 'Success Stories'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {language === 'bn' ? '১ সপ্তাহ আগে' : '1 week ago'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'একজন রক্তদাতার অনুপ্রেরণামূলক গল্প' : 'An Inspiring Donor Story'}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: '1.5' }}>
                      {language === 'bn' ? 
                        'কীভাবে নিয়মিত রক্তদান একজন মানুষের জীবন বদলে দিয়েছিল এবং সমাজে পরিবর্তন আনতে সাহায্য করেছিল।' :
                        'How regular blood donation transformed one person\'s life and helped bring change to society.'
                      }
                    </p>
                    <button style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: '#1B5E6B',
                      border: '1px solid #1B5E6B',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      {language === 'bn' ? 'আরও পড়ুন' : 'Read More'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'become-donor' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                {language === 'bn' ? 'দাতা হন' : 'Become a Donor'}
              </h2>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                {language === 'bn' ? 'রক্তদান করে জীবন বাঁচান, একজন দাতা হিসাবে নিবন্ধন করুন' : 'Save lives by donating blood, register as a donor'}
              </p>
              
              {/* Donor Registration Form */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(26,15,10,0.08)',
                border: '1px solid #E0DDD6'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'পুরো নাম' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'bn' ? 'আপনার পুরো নাম' : 'Your full name'}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'ইমেল ঠিকানা' : 'Email Address'} *
                    </label>
                    <input
                      type="email"
                      placeholder={language === 'bn' ? 'ইমেল ঠিকানা' : 'Email address'}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'} *
                    </label>
                    <input
                      type="tel"
                      placeholder={language === 'bn' ? 'ফোন নম্বর' : 'Phone number'}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'} *
                    </label>
                    <select style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E0DDD6',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}>
                      <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'} *
                    </label>
                    <input
                      type="date"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'লিঙ্গ' : 'Gender'} *
                    </label>
                    <select style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E0DDD6',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}>
                      <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                      <option value="male">{language === 'bn' ? 'পুরুষ' : 'Male'}</option>
                      <option value="female">{language === 'bn' ? 'মহিলা' : 'Female'}</option>
                      <option value="other">{language === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'জেলা' : 'District'} *
                    </label>
                    <select style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #E0DDD6',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}>
                      <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                      <option value="dhaka">{language === 'bn' ? 'ঢাকা' : 'Dhaka'}</option>
                      <option value="chattogram">{language === 'bn' ? 'চট্টগ্রাম' : 'Chattogram'}</option>
                      <option value="rajshahi">{language === 'bn' ? 'রাজশাহী' : 'Rajshahi'}</option>
                      <option value="khulna">{language === 'bn' ? 'খুলনা' : 'Khulna'}</option>
                      <option value="sylhet">{language === 'bn' ? 'সিলেট' : 'Sylhet'}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'ঠিকানা' : 'Address'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={language === 'bn' ? 'আপনার ঠিকানা' : 'Your address'}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
                      <input
                        type="checkbox"
                        style={{ width: '16px', height: '16px' }}
                      />
                      {language === 'bn' ? 'আমি রক্তদানের শর্তাবলী সম্পর্কে সম্মতি দিচ্ছি' : 'I agree to the blood donation terms and conditions'}
                    </label>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button style={{
                    padding: '12px 24px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Droplets size={16} />
                    {language === 'bn' ? 'নিবন্ধন করুন' : 'Register as Donor'}
                  </button>
                  
                  <button style={{
                    padding: '12px 24px',
                    backgroundColor: '#F5EDD8',
                    color: '#1A0F0A',
                    border: '1px solid #E0DDD6',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    {language === 'bn' ? 'পরিষ্কার করুন' : 'Clear'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'illustrations' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
                {language === 'bn' ? 'রক্তকরবী চিত্রকথন' : 'RoktoKorobi Chitrokothon'}
              </h2>
              <p style={{ color: '#666', marginBottom: '24px', textAlign: 'center' }}>
                {language === 'bn' ? 'রক্তদান বিষয়ক চিত্রকল্পনা' : 'Blood donation awareness illustrations'}
              </p>
              
              {/* RoktoKorobi Chitrokothon Gallery */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(26,15,10,0.08)',
                    border: '1px solid #E0DDD6',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}>
                    <div style={{
                      height: '200px',
                      backgroundColor: `linear-gradient(135deg, #${item % 2 === 0 ? 'dc2626' : '1B5E6B'}, #${item % 2 === 0 ? '1B5E6B' : '22C55E'})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '64px'
                    }}>
                      {item % 2 === 0 ? '🩸' : '❤️'}
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#1A0F0A' }}>
                        {language === 'bn' ? `চিত্রকল্পনা ${item}` : `Illustration ${item}`}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                        {language === 'bn' ? 
                          `রক্তদান সচেতনতার জন্য চিত্রকল্পনা ${item}` :
                          `Blood donation awareness illustration ${item}`
                        }
                      </p>
                      <button style={{
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        color: '#dc2626',
                        border: '1px solid #dc2626',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}>
                        {language === 'bn' ? 'দেখুন' : 'View'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeSection === 'testimonials' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                {language === 'bn' ? 'সাক্ষ্য' : 'Testimonials'}
              </h2>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                {language === 'bn' ? 'রক্তদাতা এবং প্রাপকদের অভিজ্ঞতা' : 'Experiences from donors and recipients'}
              </p>
              
              {/* Testimonials List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                {[
                  { name: 'মোঃ রহিম', enName: 'Rahim Uddin', role: 'donor', bloodGroup: 'A+', rating: 5, message: 'রক্তদান করে আমি অনেক খুশি। আমার ১০তম রক্তদান হল।' },
                  { name: 'সারা আক্তার', enName: 'Sara Akter', role: 'recipient', bloodGroup: 'O+', rating: 5, message: 'জরুরি মুহূর্তে রক্ত পেয়ে আমার বাবার জীবন বাঁচাল। ধন্যবাদ রক্তকরবী।' },
                  { name: 'কামাল হোসেন', enName: 'Kamal Hossain', role: 'volunteer', bloodGroup: 'B+', rating: 4, message: 'স্বেচ্ছাসে রক্তদান ক্যাম্পেইন করতে পারি। সবাইকে এগিয়ে আসুন।' }
                ].map((testimonial, index) => (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 20px rgba(26,15,10,0.08)',
                    border: '1px solid #E0DDD6'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        {testimonial.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0', color: '#1A0F0A' }}>
                          {testimonial.name}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
                          <span style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {testimonial.bloodGroup}
                          </span>
                          <span>•</span>
                          <span>{language === 'bn' ? 
                            testimonial.role === 'donor' ? 'দাতা' :
                            testimonial.role === 'recipient' ? 'প্রাপক' : 'স্বেচ্ছাসকারী'
                            : testimonial.role === 'donor' ? 'Donor' :
                            testimonial.role === 'recipient' ? 'Recipient' : 'Volunteer'
                          }</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <div key={i} style={{
                            width: '16px',
                            height: '16px',
                            backgroundColor: i < testimonial.rating ? '#FFC107' : '#E0DDD6',
                            borderRadius: '50%',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: i < testimonial.rating ? 'white' : '#666'
                          }}>
                            ★
                          </div>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', fontStyle: 'italic' }}>
                      "{testimonial.message}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeSection === 'profile' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                {language === 'bn' ? 'প্রোফাইল' : 'Profile'}
              </h2>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                {language === 'bn' ? 'আপনার প্রোফাইল তথ্য পরিচালনা করুন' : 'Manage your profile information'}
              </p>
              
              {/* Profile Form */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(26,15,10,0.08)',
                border: '1px solid #E0DDD6'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'পুরো নাম' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'ইমেল ঠিকানা' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
                    </label>
                    <select
                      value={userData.bloodGroup}
                      onChange={(e) => setUserData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: 'white'
                      }}>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                      {language === 'bn' ? 'অবস্থান' : 'Location'}
                    </label>
                    <input
                      type="text"
                      value={userData.location}
                      onChange={(e) => setUserData(prev => ({ ...prev, location: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button style={{
                    padding: '12px 24px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <User size={16} />
                    {language === 'bn' ? 'আপডেট করুন' : 'Update Profile'}
                  </button>
                  
                  <button style={{
                    padding: '12px 24px',
                    backgroundColor: '#F5EDD8',
                    color: '#1A0F0A',
                    border: '1px solid #E0DDD6',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'settings' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                {language === 'bn' ? 'সেটিংস' : 'Settings'}
              </h2>
              <p style={{ color: '#666', marginBottom: '24px' }}>
                {language === 'bn' ? 'অ্যাপ্লিকেশন সেটিংস পরিচালনা করুন' : 'Manage application settings'}
              </p>
              
              {/* Settings Options */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(26,15,10,0.08)',
                border: '1px solid #E0DDD6'
              }}>
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #E0DDD6', borderRadius: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0', color: '#1A0F0A' }}>
                        {language === 'bn' ? 'ইমেল বিজ্ঞপ্তি' : 'Email Notifications'}
                      </h4>
                      <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>
                        {language === 'bn' ? 'রক্তদান সম্পর্কিত ইমেল পান' : 'Receive blood donation related emails'}
                      </p>
                    </div>
                    <div style={{
                      width: '48px',
                      height: '24px',
                      backgroundColor: '#dc2626',
                      borderRadius: '12px',
                      position: 'relative',
                      cursor: 'pointer'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: '2px',
                        width: '20px',
                        height: '20px',
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        transition: 'transform 0.2s ease'
                      }}></div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #E0DDD6', borderRadius: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0', color: '#1A0F0A' }}>
                        {language === 'bn' ? 'ভাষা' : 'Language'}
                      </h4>
                      <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>
                        {language === 'bn' ? 'অ্যাপ্লিকেশন ভাষা নির্বাচন করুন' : 'Choose application language'}
                      </p>
                    </div>
                    <select
                      value={language}
                      onChange={toggleLanguage}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #E0DDD6',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: 'white'
                      }}>
                      <option value="en">English</option>
                      <option value="bn">বাংলা</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #E0DDD6', borderRadius: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0', color: '#1A0F0A' }}>
                        {language === 'bn' ? 'ডাটা মুছে ফেলা' : 'Delete Account'}
                      </h4>
                      <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>
                        {language === 'bn' ? 'আপনার অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলুন' : 'Permanently delete your account'}
                      </p>
                    </div>
                    <button style={{
                      padding: '8px 16px',
                      backgroundColor: '#DC2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      {language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
