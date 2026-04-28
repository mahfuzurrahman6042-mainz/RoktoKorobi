'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface BloodRequest {
  id: string;
  patient_name: string;
  blood_group: string;
  hospital_name: string;
  hospital_city: string;
  hospital_district: string;
  urgency: string;
  contact: string;
  units_needed: number;
  status: string;
  created_at: string;
}

export default function BloodRequestsPage() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    district: '',
    urgency: ''
  });
  const router = useRouter();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: 'Blood Requests', bn: 'রক্তের অনুরোধ' },
      subtitle: { en: 'View and accept blood donation requests', bn: 'রক্তদানের অনুরোধ দেখুন এবং গ্রহণ করুন' },
      loading: { en: 'Loading requests...', bn: 'অনুরোধ লোড হচ্ছে...' },
      noRequests: { en: 'No pending requests found', bn: 'কোন মুলতুবি অনুরোধ পাওয়া যায়নি' },
      patientName: { en: 'Patient Name', bn: 'রোগীর নাম' },
      bloodGroup: { en: 'Blood Group', bn: 'রক্তের গ্রুপ' },
      hospital: { en: 'Hospital', bn: 'হাসপাতাল' },
      location: { en: 'Location', bn: 'অবস্থান' },
      urgency: { en: 'Urgency', bn: 'জরুরি' },
      units: { en: 'Units Needed', bn: 'প্রয়োজনীয় ইউনিট' },
      contact: { en: 'Contact', bn: 'যোগাযোগ' },
      accept: { en: 'Accept Request', bn: 'অনুরোধ গ্রহণ করুন' },
      filter: { en: 'Filter', bn: 'ফিল্টার' },
      allGroups: { en: 'All Blood Groups', bn: 'সব রক্তের গ্রুপ' },
      allDistricts: { en: 'All Districts', bn: 'সব জেলা' },
      allUrgency: { en: 'All Urgency Levels', bn: 'সব জরুরি স্তর' },
      low: { en: 'Low', bn: 'কম' },
      medium: { en: 'Medium', bn: 'মাঝারি' },
      high: { en: 'High', bn: 'উচ্চ' },
      critical: { en: 'Critical', bn: 'সংকটজনক' },
      viewMap: { en: 'View on Map', bn: 'ম্যাপে দেখুন' },
    };
    return translations[key]?.[language] || key;
  };

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang as 'en' | 'bn');
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
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, filters]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = requests;

    if (filters.bloodGroup) {
      filtered = filtered.filter(r => r.blood_group === filters.bloodGroup);
    }

    if (filters.district) {
      filtered = filtered.filter(r => 
        r.hospital_district.toLowerCase().includes(filters.district.toLowerCase())
      );
    }

    if (filters.urgency) {
      filtered = filtered.filter(r => r.urgency === filters.urgency);
    }

    setFilteredRequests(filtered);
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!currentUser) {
      alert('Please login to accept requests');
      router.push('/login');
      return;
    }

    if (!currentUser.is_donor) {
      alert('Only donors can accept blood requests');
      return;
    }

    try {
      const response = await fetch(`/api/blood-requests/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorId: currentUser.id })
      });

      const result = await response.json();

      if (response.ok) {
        alert('Request accepted successfully! Redirecting to tracking page...');
        router.push(result.trackingUrl);
      } else {
        alert(result.error || 'Failed to accept request');
      }
    } catch (err) {
      alert('Failed to accept request');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#1976d2';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#e53935', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          🩸 {t('title')}
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>{t('subtitle')}</p>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>{t('filter')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <select
            value={filters.bloodGroup}
            onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          >
            <option value="">{t('allGroups')}</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>

          <input
            type="text"
            placeholder={t('allDistricts')}
            value={filters.district}
            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />

          <select
            value={filters.urgency}
            onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          >
            <option value="">{t('allUrgency')}</option>
            <option value="low">{t('low')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="high">{t('high')}</option>
            <option value="critical">{t('critical')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>{t('loading')}</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#f5f5f5', borderRadius: '12px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <p style={{ color: '#666' }}>{t('noRequests')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getUrgencyColor(request.urgency)}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                    {request.patient_name}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#e53935',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}>
                      {request.blood_group}
                    </span>
                    <span style={{
                      background: getUrgencyColor(request.urgency),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}>
                      {request.urgency.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#999' }}>
                  {new Date(request.created_at).toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <strong>{t('hospital')}:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>{request.hospital_name}</p>
                </div>
                <div>
                  <strong>{t('location')}:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>
                    {request.hospital_city}, {request.hospital_district}
                  </p>
                </div>
                <div>
                  <strong>{t('units')}:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>{request.units_needed}</p>
                </div>
                <div>
                  <strong>{t('contact')}:</strong>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>{request.contact}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => handleAcceptRequest(request.id)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#45a049'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#4CAF50'}
                >
                  {t('accept')}
                </button>
                <a
                  href={`tel:${request.contact}`}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'inline-block'
                  }}
                >
                  📞 {t('contact')}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
