"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { database, ref, get, update } from '@/lib/firebase';

interface Institute {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  licenseNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  referralCode: string;
  adminUserId: string;
  totalDonors: number;
  totalDonations: number;
  createdAt: string;
  updatedAt: string;
}

export default function SuperAdminPartnerInstitutes() {
  const router = useRouter();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | 'suspend'>('approve');

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    try {
      const institutesRef = ref(database, 'partnerInstitutes');
      const snapshot = await get(institutesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const institutesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setInstitutes(institutesArray);
      }
    } catch (error) {
      console.error('Error fetching institutes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedInstitute || !adminEmail || !adminPassword) {
      alert('Please fill in admin email and password');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`/api/partner-institutes/${selectedInstitute.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          adminEmail,
          adminPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Approval failed');
      }

      alert('Institute approved successfully!');
      setSelectedInstitute(null);
      setAdminEmail('');
      setAdminPassword('');
      fetchInstitutes();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedInstitute) return;

    if (!confirm('Are you sure you want to reject this institute?')) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`/api/partner-institutes/${selectedInstitute.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Rejection failed');
      }

      alert('Institute rejected successfully!');
      setSelectedInstitute(null);
      fetchInstitutes();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedInstitute) return;

    if (!confirm('Are you sure you want to suspend this institute?')) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`/api/partner-institutes/${selectedInstitute.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'suspend'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Suspension failed');
      }

      alert('Institute suspended successfully!');
      setSelectedInstitute(null);
      fetchInstitutes();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const filteredInstitutes = institutes.filter(institute => {
    if (filter === 'all') return true;
    return institute.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'suspended': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        background: 'rgba(245,237,216,0.95)', backdropFilter: 'blur(24px)',
        padding: '14px 64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(192,21,42,0.12)', boxShadow: '0 2px 40px rgba(26,15,10,0.08)'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <span style={{ fontSize: '36px', lineHeight: 1 }}>🩸</span>
          <div>
            <span style={{ fontFamily: 'serif', fontSize: '24px', color: '#C0152A', letterSpacing: '-0.01em' }}>রক্তকরবী</span>
            <span style={{ fontSize: '10px', color: '#1B5E6B', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginTop: '2px' }}>RoktoKorobi</span>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/super-admin" style={{ background: '#1B5E6B', color: '#fff', padding: '10px 26px', borderRadius: '100px', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>
            Dashboard
          </Link>
          <Link href="/" style={{ background: '#C0152A', color: '#fff', padding: '10px 26px', borderRadius: '100px', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#F5EDD8' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1A0F0A', marginBottom: '16px' }}>
              Partner Institute Management
            </h1>
            <p style={{ fontSize: '16px', color: '#3D2314' }}>
              Manage partner institute registrations and approvals
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: filter === status ? '#C0152A' : '#FDFAF4',
                  color: filter === status ? '#fff' : '#3D2314',
                  boxShadow: filter === status ? '0 4px 20px rgba(192,21,42,0.3)' : 'none',
                  transition: 'all 0.3s'
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({institutes.filter(i => filter === 'all' || i.status === status).length})
              </button>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: '#FDFAF4', padding: '24px', borderRadius: '16px', border: '1px solid rgba(192,21,42,0.08)' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#C0152A', marginBottom: '8px' }}>
                {institutes.length}
              </div>
              <div style={{ fontSize: '14px', color: '#3D2314' }}>Total Institutes</div>
            </div>
            <div style={{ background: '#FDFAF4', padding: '24px', borderRadius: '16px', border: '1px solid rgba(192,21,42,0.08)' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F59E0B', marginBottom: '8px' }}>
                {institutes.filter(i => i.status === 'pending').length}
              </div>
              <div style={{ fontSize: '14px', color: '#3D2314' }}>Pending</div>
            </div>
            <div style={{ background: '#FDFAF4', padding: '24px', borderRadius: '16px', border: '1px solid rgba(192,21,42,0.08)' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10B981', marginBottom: '8px' }}>
                {institutes.filter(i => i.status === 'approved').length}
              </div>
              <div style={{ fontSize: '14px', color: '#3D2314' }}>Approved</div>
            </div>
            <div style={{ background: '#FDFAF4', padding: '24px', borderRadius: '16px', border: '1px solid rgba(192,21,42,0.08)' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1B5E6B', marginBottom: '8px' }}>
                {institutes.filter(i => i.status === 'approved').reduce((sum, i) => sum + (i.totalDonors || 0), 0)}
              </div>
              <div style={{ fontSize: '14px', color: '#3D2314' }}>Total Donors</div>
            </div>
          </div>

          {/* Institutes Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div style={{ fontSize: '18px', color: '#3D2314' }}>Loading...</div>
            </div>
          ) : filteredInstitutes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: '#FDFAF4', borderRadius: '16px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <div style={{ fontSize: '18px', color: '#3D2314' }}>No institutes found</div>
            </div>
          ) : (
            <div style={{ background: '#FDFAF4', borderRadius: '16px', border: '1px solid rgba(192,21,42,0.08)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(192,21,42,0.05)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#3D2314' }}>Institute</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#3D2314' }}>Type</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#3D2314' }}>Contact</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#3D2314' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#3D2314' }}>Referral Code</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#3D2314' }}>Donors</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#3D2314' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstitutes.map((institute) => (
                    <tr key={institute.id} style={{ borderBottom: '1px solid rgba(26,15,10,0.05)' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600, color: '#1A0F0A', marginBottom: '4px' }}>{institute.name}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{institute.district || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#3D2314' }}>
                        {institute.type.charAt(0).toUpperCase() + institute.type.slice(1)}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '14px', color: '#3D2314', marginBottom: '4px' }}>{institute.contactPerson}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{institute.email}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: `${getStatusColor(institute.status)}20`,
                          color: getStatusColor(institute.status)
                        }}>
                          {institute.status.charAt(0).toUpperCase() + institute.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#3D2314', fontFamily: 'monospace' }}>
                        {institute.referralCode || '-'}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#3D2314' }}>
                        {institute.totalDonors || 0}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedInstitute(institute)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            background: '#1B5E6B',
                            color: '#fff',
                            transition: 'all 0.3s'
                          }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal */}
          {selectedInstitute && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                background: '#FDFAF4', borderRadius: '24px', padding: '32px',
                maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A0F0A' }}>
                    {selectedInstitute.name}
                  </h2>
                  <button
                    onClick={() => setSelectedInstitute(null)}
                    style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Type</div>
                    <div style={{ fontSize: '14px', color: '#3D2314' }}>{selectedInstitute.type}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Contact Person</div>
                    <div style={{ fontSize: '14px', color: '#3D2314' }}>{selectedInstitute.contactPerson}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Email</div>
                    <div style={{ fontSize: '14px', color: '#3D2314' }}>{selectedInstitute.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Phone</div>
                    <div style={{ fontSize: '14px', color: '#3D2314' }}>{selectedInstitute.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Address</div>
                    <div style={{ fontSize: '14px', color: '#3D2314' }}>{selectedInstitute.address || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>District</div>
                    <div style={{ fontSize: '14px', color: '#3D2314' }}>{selectedInstitute.district || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>License Number</div>
                    <div style={{ fontSize: '14px', color: '#3D2314' }}>{selectedInstitute.licenseNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Status</div>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: `${getStatusColor(selectedInstitute.status)}20`,
                      color: getStatusColor(selectedInstitute.status)
                    }}>
                      {selectedInstitute.status.charAt(0).toUpperCase() + selectedInstitute.status.slice(1)}
                    </span>
                  </div>
                  {selectedInstitute.referralCode && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Referral Code</div>
                      <div style={{ fontSize: '18px', color: '#1B5E6B', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {selectedInstitute.referralCode}
                      </div>
                    </div>
                  )}
                </div>

                {/* Approval Form */}
                {selectedInstitute.status === 'pending' && (
                  <div style={{ borderTop: '1px solid rgba(26,15,10,0.1)', paddingTop: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1A0F0A', marginBottom: '16px' }}>
                      Approve Institute
                    </h3>
                    <div style={{ display: 'grid', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                          Admin Email *
                        </label>
                        <input
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="admin@institute.com"
                          style={{
                            width: '100%', padding: '12px 16px', border: '1.5px solid rgba(26,15,10,0.1)',
                            borderRadius: '12px', fontSize: '14px', background: '#F5EDD8',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                          Admin Password *
                        </label>
                        <input
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          style={{
                            width: '100%', padding: '12px 16px', border: '1.5px solid rgba(26,15,10,0.1)',
                            borderRadius: '12px', fontSize: '14px', background: '#F5EDD8',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  {selectedInstitute.status === 'pending' && (
                    <>
                      <button
                        onClick={handleApprove}
                        disabled={processing || !adminEmail || !adminPassword}
                        style={{
                          flex: 1,
                          padding: '14px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: processing || !adminEmail || !adminPassword ? 'not-allowed' : 'pointer',
                          background: processing || !adminEmail || !adminPassword ? '#9CA3AF' : '#10B981',
                          color: '#fff'
                        }}
                      >
                        {processing ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={processing}
                        style={{
                          flex: 1,
                          padding: '14px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: processing ? 'not-allowed' : 'pointer',
                          background: processing ? '#9CA3AF' : '#EF4444',
                          color: '#fff'
                        }}
                      >
                        {processing ? 'Processing...' : 'Reject'}
                      </button>
                    </>
                  )}
                  {selectedInstitute.status === 'approved' && (
                    <button
                      onClick={handleSuspend}
                      disabled={processing}
                      style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: processing ? 'not-allowed' : 'pointer',
                        background: processing ? '#9CA3AF' : '#6B7280',
                        color: '#fff'
                      }}
                    >
                      {processing ? 'Processing...' : 'Suspend'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
