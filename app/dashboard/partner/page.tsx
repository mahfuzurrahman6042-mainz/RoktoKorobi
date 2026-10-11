"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Heart, Copy, Download, ExternalLink } from 'lucide-react';
import { getPartnerInstituteById, getPartnerStats, getUserData, onAuthStateChange } from '@/lib/firebase';

export default function PartnerDashboard() {
  const router = useRouter();
  const [partnerData, setPartnerData] = useState<any>({
    name: 'Partner workspace preview',
    type: 'Student-led organization',
    status: 'preview',
    referralCode: 'YOUR-CODE',
    totalStudents: 0,
    totalDonations: 0,
    isPreview: true,
  });
  const [loading, setLoading] = useState(false);
  const [signupLink, setSignupLink] = useState('');

  useEffect(() => {
    setSignupLink(window.location.origin);
    if (process.env.NODE_ENV === 'development' && new URLSearchParams(window.location.search).has('preview')) return;
    setLoading(true);
    return onAuthStateChange(async user => {
      if (!user) { router.replace('/login'); return; }
      if (!user.emailVerified) { router.replace('/verify-email'); return; }
      try {
        const profile = await getUserData(user.uid);
        if (profile?.role !== 'partner_admin' || !profile?.instituteId) {
          router.replace('/dashboard');
          return;
        }
        await loadPartnerData(profile.instituteId);
      } catch (error) {
        console.error('Error loading partner account:', error);
        setLoading(false);
      }
    });
  }, [router]);

  const loadPartnerData = async (partnerId: string) => {
    try {
      setLoading(true);

      const partner = await getPartnerInstituteById(partnerId);
      if (!partner) {
        throw new Error('Your partner record was not found');
        return;
      }

      const stats = await getPartnerStats(partnerId);

      setPartnerData({
        ...partner,
        totalStudents: stats?.totalStudents ?? null,
        totalDonations: stats?.totalDonations ?? null,
        isPreview: false
      });
    } catch (error) {
      console.error('Error loading partner data:', error);
      alert('Error loading partner data');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (partnerData?.referralCode) {
      navigator.clipboard.writeText(partnerData.referralCode);
      alert('Referral code copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5EDD8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B5B4F' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5EDD8', padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        padding: '20px',
        background: '#FDFAF4',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1A0F0A', marginBottom: '8px' }}>
            Partner Dashboard
          </h1>
          <p style={{ color: '#6B5B4F', fontSize: '14px' }}>
            {partnerData?.name} ({partnerData?.type})
          </p>
          {partnerData?.isPreview && (
            <p style={{ color: '#1B5E6B', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>
              Preview mode · connect a partner account to load live organization data
            </p>
          )}
        </div>
        <Link
          href="/"
          style={{
            padding: '10px 20px',
            background: '#F5EDD8',
            color: '#1A0F0A',
            border: '1px solid #C0152A',
            borderRadius: '8px',
            cursor: 'pointer',
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          Back to Home
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{
          background: '#FDFAF4',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#C0152A20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} style={{ color: '#C0152A' }} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#6B5B4F', marginBottom: '4px' }}>Total Students</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1A0F0A' }}>
                {partnerData?.totalStudents ?? 'Pending sync'}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: '#FDFAF4',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#22C55E20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={24} style={{ color: '#22C55E' }} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#6B5B4F', marginBottom: '4px' }}>Total Donations</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1A0F0A' }}>
                {partnerData?.totalDonations ?? 'Pending sync'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div style={{
        background: '#FDFAF4',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A0F0A', marginBottom: '16px' }}>
          Your Referral Code
        </h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            flex: 1,
            padding: '16px',
            background: '#F5EDD8',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#C0152A',
            letterSpacing: '2px',
            textAlign: 'center'
          }}>
            {partnerData?.referralCode || 'N/A'}
          </div>
          <button
            onClick={copyReferralCode}
            style={{
              padding: '16px 24px',
              background: '#C0152A',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <Copy size={18} />
            Copy Code
          </button>
        </div>
        <p style={{ fontSize: '14px', color: '#6B5B4F', marginTop: '12px' }}>
          Share this code with your students. They can use it during registration to link to your institution.
        </p>
      </div>

      {/* Student Signup Link */}
      <div style={{
        background: '#FDFAF4',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A0F0A', marginBottom: '16px' }}>
          Student Signup Link
        </h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            flex: 1,
            padding: '16px',
            background: '#F5EDD8',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#3D2314',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {signupLink}/register?ref={partnerData?.referralCode}
          </div>
          <Link
            href={`/register?ref=${partnerData?.referralCode}`}
            target="_blank"
            style={{
              padding: '16px 24px',
              background: '#C0152A',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            <ExternalLink size={18} />
            Open Link
          </Link>
        </div>
        <p style={{ fontSize: '14px', color: '#6B5B4F', marginTop: '12px' }}>
          Share this link with your students for direct signup with your referral code automatically applied.
        </p>
      </div>

      {/* Marketing Materials */}
      <div style={{
        background: '#FDFAF4',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A0F0A', marginBottom: '16px' }}>
          Marketing Materials
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          <button
            style={{
              padding: '16px',
              background: '#F5EDD8',
              border: '1px solid #C0152A',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              color: '#1A0F0A',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E8D5C5'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#F5EDD8'}
          >
            <Download size={18} style={{ color: '#C0152A' }} />
            Download Student Signup Poster
          </button>
          <button
            style={{
              padding: '16px',
              background: '#F5EDD8',
              border: '1px solid #C0152A',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              color: '#1A0F0A',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E8D5C5'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#F5EDD8'}
          >
            <Download size={18} style={{ color: '#C0152A' }} />
            Download QR Code Flyer
          </button>
          <button
            style={{
              padding: '16px',
              background: '#F5EDD8',
              border: '1px solid #C0152A',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              color: '#1A0F0A',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E8D5C5'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#F5EDD8'}
          >
            <Download size={18} style={{ color: '#C0152A' }} />
            Download WhatsApp Message Template
          </button>
          <button
            style={{
              padding: '16px',
              background: '#F5EDD8',
              border: '1px solid #C0152A',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              color: '#1A0F0A',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E8D5C5'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#F5EDD8'}
          >
            <Download size={18} style={{ color: '#C0152A' }} />
            Download Email Template
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div style={{
        background: '#FDFAF4',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#22C55E'
          }}></div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#1A0F0A' }}>
              Partnership Status: {partnerData?.status}
            </p>
            <p style={{ fontSize: '14px', color: '#6B5B4F', marginTop: '4px' }}>
              {partnerData?.isPreview ? 'This preview shows the partner portal layout. Live metrics appear after a partner account is connected.' : 'Your partnership is active and ready to onboard students.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
