'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/LanguageContext';
import OfflineMap from '@/components/OfflineMap';

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

export default function DonorsPage() {
  const { t, language } = useLanguage();
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
  const [locationSharing, setLocationSharing] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

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

  const handleShareLocation = async (requestId: string) => {
    if (!currentUser) return;

    // Check if user has global consent enabled
    try {
      const response = await fetch('/api/user/location-consent');
      const result = await response.json();
      
      if (!result.consent) {
        // Show consent modal for this specific request
        setSelectedRequestId(requestId);
        setShowConsentModal(true);
        return;
      }
    } catch (err) {
      // If check fails, show consent modal as fallback
      setSelectedRequestId(requestId);
      setShowConsentModal(true);
      return;
    }

    // If consent is already enabled, proceed with location sharing
    shareLocation(requestId);
  };

  const shareLocation = async (requestId: string) => {
    if (!currentUser) return;

    setLocationSharing(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            const response = await fetch('/api/geolocation/share', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                request_id: requestId,
                donor_id: currentUser.id,
                latitude,
                longitude,
              }),
            });

            if (response.ok) {
              setLocationShared(true);
              setLocationSharing(false);
            } else {
              setLocationSharing(false);
              alert('Failed to share location');
            }
          },
          (error) => {
            setLocationSharing(false);
            alert('Failed to get location');
          }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
        setLocationSharing(false);
      }
    } catch (err) {
      setLocationSharing(false);
      alert('Failed to share location');
    }
  };

  const handleConsentResponse = async (consent: boolean) => {
    if (!selectedRequestId) return;

    if (consent) {
      // Enable consent globally and share location
      try {
        await fetch('/api/user/location-consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consent: true })
        });
        shareLocation(selectedRequestId);
      } catch (err) {
        alert('Failed to enable location sharing');
      }
    }

    setShowConsentModal(false);
    setSelectedRequestId(null);
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '80px 20px 40px' }}>
      <div className="container">
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #E53935 0%, #FF5252 100%)',
          padding: '60px 40px',
          borderRadius: '16px',
          marginBottom: '3rem',
          color: 'white',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            🔍 {language === 'bn' ? 'রক্তদাতা খুঁজুন' : t('findDonors')}
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.95 }}>
            {language === 'bn' 
              ? 'জরুরি প্রয়োজনে রক্তদাতা খুঁজুন এবং যোগাযোগ করুন'
              : 'Find blood donors for emergency needs and contact them'}
          </p>
        </div>

        {/* Filter Section */}
        <div className="card" style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#212121', margin: 0 }}>
              {language === 'bn' ? 'ফিল্টার করুন' : t('search')}
            </h2>
            <button
              onClick={() => setShowMap(!showMap)}
              style={{
                padding: '10px 20px',
                background: showMap ? '#E53935' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {showMap ? '📋 List View' : '🗺️ Map View'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#212121', fontSize: '0.9rem' }}>
                {t('filterByBloodGroup')}
              </label>
              <select
                value={filters.bloodGroup}
                onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                className="input"
              >
                <option value="">{language === 'bn' ? 'সব রক্তের গ্রুপ' : 'All Blood Groups'}</option>
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#212121', fontSize: '0.9rem' }}>
                {t('filterByLocation')}
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder={language === 'bn' ? 'অবস্থান লিখুন' : t('location')}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Donors List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: '#757575', fontSize: '1.1rem' }}>{t('loading')}</p>
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ color: '#212121', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {language === 'bn' ? 'কোন রক্তদাতা পাওয়া যায়নি' : 'No donors found'}
            </h3>
            <p style={{ color: '#757575' }}>
              {language === 'bn' 
                ? 'অন্য ফিল্টার চেষ্টা করুন বা পরে আবার চেক করুন'
                : 'Try different filters or check back later'}
            </p>
          </div>
        ) : showMap ? (
          <div className="card" style={{ padding: '20px' }}>
            <OfflineMap
              center={[23.8103, 90.4125]}
              zoom={12}
              height="500px"
              markers={filteredDonors
                .filter(d => d.latitude && d.longitude)
                .map(donor => ({
                  id: donor.id,
                  lat: donor.latitude!,
                  lng: donor.longitude!,
                  title: donor.name.split(' ')[0], // First name only for privacy
                  description: `${donor.blood_group} • ${donor.location}`,
                  type: 'donor' as const
                }))}
              showUserLocation={true}
            />
            <p style={{ marginTop: '16px', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
              🩸 Showing {filteredDonors.filter(d => d.latitude && d.longitude).length} donors with location data
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {filteredDonors.map((donor) => (
              <div key={donor.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #E53935 0%, #FF5252 100%)',
                  padding: '20px',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>{donor.name}</h3>
                  <span className="badge" style={{
                    background: 'white',
                    color: '#E53935',
                    padding: '8px 16px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}>
                    {donor.blood_group}
                  </span>
                </div>

                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#757575' }}>
                      <span style={{ fontSize: '1.2rem' }}>🎂</span>
                      <span><strong>{language === 'bn' ? 'বয়স:' : 'Age:'}</strong> {donor.age} {language === 'bn' ? 'বছর' : 'years'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#757575' }}>
                      <span style={{ fontSize: '1.2rem' }}>📍</span>
                      <span><strong>{language === 'bn' ? 'অবস্থান:' : 'Location:'}</strong> {donor.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#757575' }}>
                      <span style={{ fontSize: '1.2rem' }}>📞</span>
                      <span><strong>{language === 'bn' ? 'ফোন:' : 'Phone:'}</strong> {donor.phone}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <a
                      href={`tel:${donor.phone}`}
                      className="btn"
                      style={{
                        flex: 1,
                        background: '#4CAF50',
                        color: 'white',
                        padding: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                    >
                      📞 {t('contactDonor')}
                    </a>
                    {currentUser && (
                      <button
                        onClick={() => {
                          setSelectedDonor(donor);
                          setMessageModalOpen(true);
                        }}
                        className="btn"
                        style={{
                          flex: 1,
                          background: '#2196F3',
                          color: 'white',
                          padding: '12px',
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}
                      >
                        💬 {t('sendMessage')}
                      </button>
                    )}
                  </div>
                  <div style={{ marginTop: '12px', padding: '8px', background: '#E3F2FD', borderRadius: '8px', fontSize: '0.8rem', color: '#1976D2' }}>
                    📍 Location sharing enabled when accepting blood requests
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message Modal */}
        {messageModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1.5rem' }}>
                💬 {t('sendMessage')}
              </h2>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={language === 'bn' ? 'আপনার বার্তা লিখুন...' : t('messagePlaceholder')}
                className="input"
                style={{
                  minHeight: '150px',
                  marginBottom: '1.5rem',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setMessageModalOpen(false);
                    setMessageText('');
                    setSelectedDonor(null);
                  }}
                  className="btn"
                  style={{
                    background: '#9E9E9E',
                    color: 'white',
                    padding: '12px 24px'
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="btn btn-primary"
                  style={{
                    padding: '12px 24px',
                    opacity: !messageText.trim() ? 0.6 : 1
                  }}
                >
                  {t('send')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Location Consent Modal */}
        {showConsentModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="card" style={{
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              background: 'white'
            }}>
              <h3 style={{ fontSize: '1.5rem', color: '#212121', marginBottom: '1rem' }}>
                📍 Share Your Location?
              </h3>
              <p style={{ color: '#666', marginBottom: '1rem', lineHeight: '1.6' }}>
                The blood requester would like to see your live location to coordinate the donation. 
                This will allow them to track your location until you reach the hospital.
              </p>
              <div style={{ padding: '16px', background: '#FFF3E0', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', color: '#E65100' }}>
                <strong>Privacy Note:</strong> You can disable location sharing at any time from your dashboard. 
                Location is only shared for this specific donation request.
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleConsentResponse(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#9E9E9E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Decline
                </button>
                <button
                  onClick={() => handleConsentResponse(true)}
                  style={{
                    padding: '12px 24px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Allow & Share Location
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
