'use client';

import { useState, useEffect } from 'react';
import { getBadgesForDonationCount, getNextBadge, getProgressToNextBadge } from '@/lib/gamification';

interface LeaderboardDonor {
  id: string;
  name: string;
  blood_group: string;
  location: string;
  total_donations: number;
  last_donation_date: string;
  rank: number;
}

export default function LeaderboardPage() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [mounted, setMounted] = useState(false);
  const [donors, setDonors] = useState<LeaderboardDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDistrict, setFilterDistrict] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      title: { en: 'Donor Leaderboard', bn: 'রক্তদাতা লিডারবোর্ড' },
      subtitle: { en: 'Top blood donors in Bangladesh', bn: 'বাংলাদেশের শীর্ষ রক্তদাতা' },
      loading: { en: 'Loading leaderboard...', bn: 'লিডারবোর্ড লোড হচ্ছে...' },
      rank: { en: 'Rank', bn: 'অবস্থান' },
      donor: { en: 'Donor', bn: 'রক্তদাতা' },
      donations: { en: 'Donations', bn: 'দান' },
      bloodGroup: { en: 'Blood Group', bn: 'রক্তের গ্রুপ' },
      location: { en: 'Location', bn: 'অবস্থান' },
      lastDonation: { en: 'Last Donation', bn: 'শেষ দান' },
      filter: { en: 'Filter by District', bn: 'জেলা দিয়ে ফিল্টার করুন' },
      allDistricts: { en: 'All Districts', bn: 'সব জেলা' },
      yourRank: { en: 'Your Rank', bn: 'আপনার অবস্থান' },
      notOnLeaderboard: { en: 'Make your first donation to appear on the leaderboard', bn: 'লিডারবোর্ডে আসতে প্রথম রক্তদান করুন' },
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
    fetchLeaderboard();
  }, [filterDistrict]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const url = filterDistrict 
        ? `/api/leaderboard?district=${encodeURIComponent(filterDistrict)}`
        : '/api/leaderboard';
      
      const response = await fetch(url);
      const result = await response.json();
      setDonors(result.donors || []);

      // Find current user's rank
      if (currentUser) {
        const userRank = result.donors?.find((d: LeaderboardDonor) => d.id === currentUser.id);
        setCurrentUserRank(userRank ? userRank.rank : null);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#666';
  };

  const getBadges = (donationCount: number) => {
    return getBadgesForDonationCount(donationCount);
  };

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#E53935', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          🏆 {t('title')}
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>{t('subtitle')}</p>
      </div>

      {/* Current User Rank */}
      {currentUser && currentUser.is_donor && (
        <div style={{
          background: 'linear-gradient(135deg, #E53935 0%, #FF5252 100%)',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          color: 'white'
        }}>
          <h3 style={{ marginBottom: '0.5rem' }}>{t('yourRank')}</h3>
          {currentUserRank ? (
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {getRankIcon(currentUserRank)}
            </div>
          ) : (
            <p>{t('notOnLeaderboard')}</p>
          )}
        </div>
      )}

      {/* Filter */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <input
          type="text"
          placeholder={t('filter')}
          value={filterDistrict}
          onChange={(e) => setFilterDistrict(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>{t('loading')}</p>
        </div>
      ) : donors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#f5f5f5', borderRadius: '12px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <p style={{ color: '#666' }}>No donors found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {donors.map((donor) => (
            <div
              key={donor.id}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                border: donor.id === currentUser?.id ? '2px solid #E53935' : 'none'
              }}
            >
              {/* Rank */}
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: getRankColor(donor.rank),
                minWidth: '60px',
                textAlign: 'center'
              }}>
                {getRankIcon(donor.rank)}
              </div>

              {/* Donor Info */}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  {donor.name}
                  {donor.id === currentUser?.id && (
                    <span style={{
                      marginLeft: '0.5rem',
                      fontSize: '0.8rem',
                      background: '#E53935',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      You
                    </span>
                  )}
                </h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem', color: '#666' }}>
                  <span>🩸 {donor.blood_group}</span>
                  <span>📍 {donor.location}</span>
                  <span>📅 {donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>

              {/* Donations & Badges */}
              <div style={{ textAlign: 'right', minWidth: '120px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#E53935' }}>
                  {donor.total_donations}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>{t('donations')}</div>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                  {getBadges(donor.total_donations).slice(0, 3).map(badge => (
                    <span key={badge.id} title={badge.name} style={{ fontSize: '1.2rem' }}>
                      {badge.icon}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
