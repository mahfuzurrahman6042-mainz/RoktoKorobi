"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

const publicApplicationsOpen = false;

export default function PartnerInstituteRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    licenseNumber: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/partner-institutes/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSubmitted(true);
      setSubmitting(false);

      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
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
          <BrandLogo />
        </Link>
        <Link href="/" style={{ background: '#C0152A', color: '#fff', padding: '10px 26px', borderRadius: '100px', fontWeight: 600, fontSize: '13px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(192,21,42,0.3)' }}>
          Back to Home
        </Link>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#F5EDD8' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1A0F0A', marginBottom: '16px' }}>
              Partner Institute Registration
            </h1>
            <p style={{ fontSize: '18px', color: '#3D2314', lineHeight: 1.6 }}>
              Join our partner institute program and help your students save lives
            </p>
          </div>

          {/* Form */}
          {submitted ? (
            <div style={{
              background: '#E8F5E8', border: '2px solid #22C55E', borderRadius: '16px',
              padding: '48px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ fontSize: '24px', color: '#166534', marginBottom: '16px' }}>
                Registration Submitted Successfully!
              </h2>
              <p style={{ fontSize: '16px', color: '#166534', marginBottom: '16px' }}>
                Your institute registration has been submitted. We will review and approve it within 24-48 hours.
              </p>
              <p style={{ fontSize: '14px', color: '#166534' }}>
                Redirecting to home page...
              </p>
            </div>
          ) : publicApplicationsOpen ? (
            <form onSubmit={handleSubmit} style={{
              background: '#FDFAF4', borderRadius: '24px', padding: '48px',
              boxShadow: '0 4px 60px rgba(26,15,10,0.06)', border: '1px solid rgba(192,21,42,0.08)'
            }}>
              {error && (
                <div style={{
                  background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: '12px',
                  padding: '16px', marginBottom: '24px', color: '#991B1B'
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gap: '24px' }}>

                {/* Institute Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    Institute Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                      borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                      outline: 'none', transition: 'all 0.3s'
                    }}
                  />
                </div>

                {/* Institute Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    Institute Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                      borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                      outline: 'none', transition: 'all 0.3s'
                    }}
                  >
                    <option value="">Select Type</option>
                    <option value="school">School</option>
                    <option value="college">College</option>
                    <option value="university">University</option>
                    <option value="ngo">NGO</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>

                {/* Contact Person */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                      borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                      outline: 'none', transition: 'all 0.3s'
                    }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                      borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                      outline: 'none', transition: 'all 0.3s'
                    }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                      borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                      outline: 'none', transition: 'all 0.3s'
                    }}
                  />
                </div>

                {/* Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={{
                      width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                      borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                      outline: 'none', transition: 'all 0.3s'
                    }}
                  />
                </div>

                {/* District */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    style={{
                      width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                      borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                      outline: 'none', transition: 'all 0.3s'
                    }}
                  />
                </div>

                {/* License Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    License Number (if applicable)
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    style={{
                      width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                      borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                      outline: 'none', transition: 'all 0.3s'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    background: submitting ? '#9CA3AF' : '#C0152A',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 20px rgba(192,21,42,0.3)'
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Registration'}
                </button>

              </div>
            </form>
          ) : (
            <div role="status" style={{ background: '#FDFAF4', border: '1px solid rgba(192,21,42,0.18)', borderRadius: '24px', padding: '32px', lineHeight: 1.7 }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Partner applications are currently closed</h2>
              <p>For the pilot, a RoktoKorobi super admin activates each partner after the organization leader creates an account. This form is not accepting submissions yet.</p>
              <p style={{ marginTop: '12px' }}>To join as a leader, first <Link href="/partner-account" style={{ color: '#C0152A', fontWeight: 700, textDecoration: 'underline' }}>create your leader account</Link> and verify your email. Then <Link href="/partner-request" style={{ color: '#C0152A', fontWeight: 700, textDecoration: 'underline' }}>request partnership</Link> for super-admin review.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
