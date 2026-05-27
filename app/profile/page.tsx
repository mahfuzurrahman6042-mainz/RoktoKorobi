"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Settings, LogOut, Mail, Phone, MapPin, Droplets, Calendar, Shield, Home, Users, Heart, FileText, Image, MessageCircle, Globe, Menu, X } from 'lucide-react';
import { logoutUser, getCurrentUser, getUserData, updateUserData, onAuthStateChange } from '@/lib/firebase';

export default function Profile() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'test@example.com',
    bloodGroup: 'O+',
    phone: '0171-1234567',
    location: 'Dhaka',
    donations: 0,
    lastDonation: null,
    rating: 4.8
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
        phone: '0171-1234567',
        location: 'Dhaka',
        donations: 0,
        lastDonation: null,
        rating: 4.8
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert(language === 'bn' ? 'লগআউট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Logout failed. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      await updateUserData(currentUser.uid, userData);
      alert(language === 'bn' ? 'প্রোফাইল আপডেট করা হয়েছে!' : 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(language === 'bn' ? 'আপডেট ব্যর্থ হয়েছে' : 'Update failed');
    }
  };

  const navigationItems = [
    { id: 'overview', label: language === 'bn' ? 'ওভারভিউ' : 'Overview', icon: Home },
    { id: 'donors', label: language === 'bn' ? 'রক্তদাতা' : 'Donors', icon: Users },
    { id: 'request', label: language === 'bn' ? 'রক্ত অনুরোধ' : 'Request Blood', icon: Heart },
    { id: 'blog', label: language === 'bn' ? 'ব্লগ' : 'Blog', icon: FileText },
    { id: 'illustrations', label: language === 'bn' ? 'রক্তকরবী চিত্রকথন' : 'RoktoKorobi Chitrokothon', icon: Image },
    { id: 'testimonials', label: language === 'bn' ? 'সাক্ষ্য' : 'Testimonials', icon: MessageCircle },
    { id: 'profile', label: language === 'bn' ? 'প্রোফাইল' : 'Profile', icon: User },
    { id: 'settings', label: language === 'bn' ? 'সেটিংস' : 'Settings', icon: Settings }
  ];

  const t = (key: string) => {
    const translations: Record<string, any> = {
      profile: { en: 'Profile', bn: 'প্রোফাইল' },
      personalInfo: { en: 'Personal Information', bn: 'ব্যক্তিগত তথ্য' },
      contactInfo: { en: 'Contact Information', bn: 'যোগাযোগ তথ্য' },
      donationHistory: { en: 'Donation History', bn: 'রক্তদানের ইতিহাস' },
      settings: { en: 'Settings', bn: 'সেটিংস' },
      logout: { en: 'Logout', bn: 'লগআউট' },
      save: { en: 'Save', bn: 'সংরক্ষ করুন' },
      edit: { en: 'Edit', bn: 'সম্পাদনা করুন' },
      fullName: { en: 'Full Name', bn: 'পুরো নাম' },
      email: { en: 'Email Address', bn: 'ইমেল ঠিকানা' },
      phone: { en: 'Phone Number', bn: 'ফোন নম্বর' },
      bloodGroup: { en: 'Blood Group', bn: 'রক্তের গ্রুপ' },
      location: { en: 'Location', bn: 'অবস্থান' },
      totalDonations: { en: 'Total Donations', bn: 'মোট রক্তদান' },
      lastDonation: { en: 'Last Donation', bn: 'সর্বশেষ রক্তদান' },
      rating: { en: 'Rating', bn: 'রেটিং' },
      notifications: { en: 'Email Notifications', bn: 'ইমেল বিজ্ঞপ্তি' },
      privacy: { en: 'Privacy Settings', bn: 'গোপনীয়তা সেটিংস' },
      accountSettings: { en: 'Account Settings', bn: 'অ্যাকাউন্ট সেটিংস' }
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
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div style={{ minHeight: '100vh', backgroundColor: '#F5EDD8', display: 'flex' }}>
      
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
        backgroundColor: '#1B5E6B',
        color: 'white',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        transition: 'transform 0.3s ease, width 0.3s ease',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        transform: window.innerWidth <= 768 && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px', lineHeight: 1 }}>🩸</span>
            {sidebarOpen && (
              <div>
                <span style={{ fontFamily: 'serif', fontSize: '16px', color: 'white', letterSpacing: '-0.01em' }}>রক্তকরবী</span>
                <span style={{ fontSize: '8px', color: '#F5EDD8', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginTop: '2px' }}>RoktoKorobi</span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px'
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <div style={{ padding: '20px 0', flex: 1, overflowY: 'auto' }}>
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <button
                  onClick={() => {
                    if (item.id === 'profile') {
                      setActiveSection('profile');
                    } else {
                      router.push('/dashboard');
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('navigateToSection', { detail: item.id }));
                      }, 100);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: sidebarOpen ? '12px 20px' : '12px',
                    border: 'none',
                    background: activeSection === item.id 
                      ? 'linear-gradient(135deg, #dc2626 0%, #8B1A1A 100%)' 
                      : 'transparent',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: sidebarOpen ? '12px' : '0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontSize: '14px',
                    fontWeight: activeSection === item.id ? 600 : 400,
                    textAlign: 'left',
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: `translateY(${index * 0.5}px)`,
                    opacity: 0,
                    animation: `slideIn 0.4s ease ${0.1 + index * 0.05}s forwards`
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(192,21,42,0.2) 0%, rgba(139,26,26,0.2) 100%)';
                      e.currentTarget.style.transform = 'translateX(8px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0px)';
                    }
                  }}
                >
                  <Icon 
                    size={20} 
                    style={{
                      transition: 'all 0.3s ease',
                      color: activeSection === item.id ? '#FFD700' : 'white'
                    }}
                  />
                  {sidebarOpen && (
                    <span style={{ 
                      marginLeft: '8px', 
                      textAlign: 'left',
                      transition: 'all 0.3s ease'
                    }}>
                      {item.label}
                    </span>
                  )}
                  {activeSection === item.id && (
                    <div style={{
                      position: 'absolute',
                      right: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#FFD700',
                      borderRadius: '50%',
                      boxShadow: '0 0 12px rgba(255,215,0,0.5)'
                    }} />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* User Profile Section */}
        {sidebarOpen && (
          <div style={{
            padding: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {userData.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{userData.name}</div>
                <div style={{ fontSize: '12px', color: '#F5EDD8' }}>{userData.email}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ marginLeft: sidebarOpen ? '280px' : '80px', flex: 1, transition: 'margin-left 0.3s ease' }}>
        {/* Top Navigation */}
        <div style={{
          backgroundColor: 'white',
          padding: '16px 24px',
          borderBottom: '1px solid #E0DDD6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A0F0A', margin: 0 }}>
              {navigationItems.find(item => item.id === activeSection)?.label || t('profile')}
            </h1>
            <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>
              {language === 'bn' ? 'আপনার প্রোফাইল তথ্য পরিচালনা করুন' : 'Manage your profile information'}
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
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
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
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div style={{ padding: '32px' }}>
          {activeSection === 'profile' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
                {t('profile')}
              </h2>
              <p style={{ color: '#666', marginBottom: '24px', textAlign: 'center' }}>
                {language === 'bn' ? 'আপনার প্রোফাইল তথ্য পরিচালনা করুন' : 'Manage your profile information'}
              </p>
              
              {/* Profile Sections Grid */}
              <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                
                {/* Personal Information */}
                <div style={{
                  backgroundColor: '#FDFAF4',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #E0DDD6'
                }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A0F0A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={24} />
                    {t('personalInfo')}
                  </h2>
                  
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                        {t('fullName')}
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
                        {t('email')}
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
                  </div>
                </div>

                {/* Contact Information */}
                <div style={{
                  backgroundColor: '#FDFAF4',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #E0DDD6'
                }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A0F0A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={24} />
                    {t('contactInfo')}
                  </h2>
                  
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1A0F0A' }}>
                        {t('phone')}
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
                        {t('location')}
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
                </div>

                {/* Donation History */}
                <div style={{
                  backgroundColor: '#FDFAF4',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #E0DDD6'
                }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A0F0A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={24} />
                    {t('donationHistory')}
                  </h2>
                  
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🩸</div>
                    <h3 style={{ fontSize: '18px', color: '#1A0F0A', marginBottom: '8px' }}>
                      {t('totalDonations')}: <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{userData.donations}</span>
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      {t('lastDonation')}: <span style={{ color: '#1B5E6B', fontWeight: '500' }}>{userData.lastDonation || 'Never'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button
                  onClick={handleSave}
                  style={{
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
                  }}
                >
                  <User size={16} />
                  {t('save')}
                </button>
                
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <LogOut size={16} />
                  {t('logout')}
                </button>
              </div>
            </div>
          )}
          
          {activeSection === 'settings' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
                {t('settings')}
              </h2>
              <p style={{ color: '#666', marginBottom: '24px', textAlign: 'center' }}>
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
