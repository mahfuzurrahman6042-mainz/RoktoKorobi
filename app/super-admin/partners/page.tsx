"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, X, Eye, RefreshCw } from 'lucide-react';
import { getPartnerInstitutes, updatePartnerInstituteStatus } from '@/lib/firebase';

export default function SuperAdminPartners() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const partnersData = await getPartnerInstitutes();
      setPartners(partnersData);
    } catch (error) {
      console.error('Error fetching partners:', error);
      alert('Error fetching partners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (partnerId: string) => {
    try {
      await updatePartnerInstituteStatus(partnerId, 'approved', 'admin_user_id'); // Replace with actual admin user ID
      alert('Partner approved successfully!');
      fetchPartners();
    } catch (error) {
      console.error('Error approving partner:', error);
      alert('Error approving partner');
    }
  };

  const handleReject = async (partnerId: string) => {
    try {
      await updatePartnerInstituteStatus(partnerId, 'rejected');
      alert('Partner rejected successfully!');
      fetchPartners();
    } catch (error) {
      console.error('Error rejecting partner:', error);
      alert('Error rejecting partner');
    }
  };

  if (!mounted) return null;

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
            Partner Institute Management
          </h1>
          <p style={{ color: '#6B5B4F', fontSize: '14px' }}>
            Approve or reject partnership applications
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchPartners}
            style={{
              padding: '10px 20px',
              background: '#C0152A',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <Link
            href="/super-admin"
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
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Partners Table */}
      <div style={{
        background: '#FDFAF4',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B5B4F' }}>
            Loading partners...
          </div>
        ) : partners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B5B4F' }}>
            No pending partner applications
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E7E0D4' }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#1A0F0A', fontSize: '14px', fontWeight: '600' }}>
                    Institution Name
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#1A0F0A', fontSize: '14px', fontWeight: '600' }}>
                    Type
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#1A0F0A', fontSize: '14px', fontWeight: '600' }}>
                    Contact Person
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#1A0F0A', fontSize: '14px', fontWeight: '600' }}>
                    Email
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#1A0F0A', fontSize: '14px', fontWeight: '600' }}>
                    District
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#1A0F0A', fontSize: '14px', fontWeight: '600' }}>
                    Status
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', color: '#1A0F0A', fontSize: '14px', fontWeight: '600' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id} style={{ borderBottom: '1px solid #E7E0D4' }}>
                    <td style={{ padding: '16px', color: '#3D2314', fontSize: '14px' }}>
                      {partner.name}
                    </td>
                    <td style={{ padding: '16px', color: '#3D2314', fontSize: '14px', textTransform: 'capitalize' }}>
                      {partner.type}
                    </td>
                    <td style={{ padding: '16px', color: '#3D2314', fontSize: '14px' }}>
                      {partner.contactPerson}
                    </td>
                    <td style={{ padding: '16px', color: '#3D2314', fontSize: '14px' }}>
                      {partner.email}
                    </td>
                    <td style={{ padding: '16px', color: '#3D2314', fontSize: '14px' }}>
                      {partner.district}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: partner.status === 'pending' ? '#FEF3C7' : '#D1FAE5',
                        color: partner.status === 'pending' ? '#92400E' : '#065F46'
                      }}>
                        {partner.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => { setSelectedPartner(partner); setShowDetails(true); }}
                          style={{
                            padding: '8px',
                            background: '#F5EDD8',
                            border: '1px solid #C0152A',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#C0152A'
                          }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {partner.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(partner.id)}
                              style={{
                                padding: '8px',
                                background: '#22C55E',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: 'white'
                              }}
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(partner.id)}
                              style={{
                                padding: '8px',
                                background: '#EF4444',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: 'white'
                              }}
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedPartner && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#FDFAF4',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1A0F0A' }}>
                Partner Details
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6B5B4F'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#6B5B4F', marginBottom: '4px', display: 'block' }}>
                  Institution Name
                </label>
                <p style={{ fontSize: '16px', color: '#1A0F0A', fontWeight: '500' }}>
                  {selectedPartner.name}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6B5B4F', marginBottom: '4px', display: 'block' }}>
                  Type
                </label>
                <p style={{ fontSize: '16px', color: '#1A0F0A', textTransform: 'capitalize' }}>
                  {selectedPartner.type}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6B5B4F', marginBottom: '4px', display: 'block' }}>
                  Contact Person
                </label>
                <p style={{ fontSize: '16px', color: '#1A0F0A' }}>
                  {selectedPartner.contactPerson}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6B5B4F', marginBottom: '4px', display: 'block' }}>
                  Email
                </label>
                <p style={{ fontSize: '16px', color: '#1A0F0A' }}>
                  {selectedPartner.email}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6B5B4F', marginBottom: '4px', display: 'block' }}>
                  Phone
                </label>
                <p style={{ fontSize: '16px', color: '#1A0F0A' }}>
                  {selectedPartner.phone}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6B5B4F', marginBottom: '4px', display: 'block' }}>
                  District
                </label>
                <p style={{ fontSize: '16px', color: '#1A0F0A' }}>
                  {selectedPartner.district}
                </p>
              </div>
              {selectedPartner.address && (
                <div>
                  <label style={{ fontSize: '12px', color: '#6B5B4F', marginBottom: '4px', display: 'block' }}>
                    Address
                  </label>
                  <p style={{ fontSize: '16px', color: '#1A0F0A' }}>
                    {selectedPartner.address}
                  </p>
                </div>
              )}
              <div>
                <label style={{ fontSize: '12px', color: '#6B5B4F', marginBottom: '4px', display: 'block' }}>
                  Status
                </label>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: selectedPartner.status === 'pending' ? '#FEF3C7' : '#D1FAE5',
                  color: selectedPartner.status === 'pending' ? '#92400E' : '#065F46'
                }}>
                  {selectedPartner.status}
                </span>
              </div>
            </div>
            {selectedPartner.status === 'pending' && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => {
                    handleApprove(selectedPartner.id);
                    setShowDetails(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#22C55E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedPartner.id);
                    setShowDetails(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
