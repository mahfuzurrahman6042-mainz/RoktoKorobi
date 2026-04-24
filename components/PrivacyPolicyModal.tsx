'use client';

import { useState } from 'react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose, onAccept }: PrivacyPolicyModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPercentage = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    if (scrollPercentage > 90) {
      setHasScrolled(true);
    }
  };

  if (!isOpen) return null;

  const policyContent = (
    <div className="privacy-policy-content" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '1rem', lineHeight: '1.6', fontSize: '0.9rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#e53935' }}>PRIVACY POLICY AND DATA PROTECTION REGULATIONS</h2>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>RoktoKorobi — Blood Donation Platform (Bangladesh)</h3>
      <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>English Legal Version | Version 1.1 | April 2026</p>
      
      <h4 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>PREAMBLE</h4>
      <p style={{ marginBottom: '1rem' }}>This Privacy Policy governs the collection, storage, processing, use, and disclosure of personal data by RoktoKorobi. By completing registration and affirming consent through the designated checkbox, you acknowledge and declare that you have read, fully understood, and unconditionally agreed to be bound by the terms and conditions of this Policy.</p>

      <h4 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>ARTICLE 1 — DEFINITIONS</h4>
      <p style={{ marginBottom: '0.5rem' }}><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person, including name, date of birth, contact details, blood type, and health-related information.</p>
      <p style={{ marginBottom: '0.5rem' }}><strong>"Sensitive Health Data"</strong> means personal data pertaining to physical or mental health, including blood type, medical history, diagnostic test results, and donor eligibility status.</p>
      <p style={{ marginBottom: '0.5rem' }}><strong>"Age Declaration"</strong> means the self-affirmed declaration made by a Donor at registration, affirming through an active checkbox that they are 18 years of age or older.</p>

      <h4 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>ARTICLE 2 — LEGAL BASIS FOR DATA PROCESSING</h4>
      <p style={{ marginBottom: '0.5rem' }}>Consent shall be obtained through a deliberate and unambiguous affirmative act, namely the ticking of an active checkbox. Donors retain the right to withdraw consent at any time without detriment or penalty.</p>

      <h4 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>ARTICLE 3 — CATEGORIES OF DATA COLLECTED</h4>
      <p style={{ marginBottom: '0.5rem' }}>RoktoKorobi collects: full legal name, date of birth and age, mobile telephone number and email address, physical address and district, blood group and Rh factor, medical history, donation history, TTI screening test results, emergency contact information, and device/usage data for security monitoring.</p>
      <p style={{ marginBottom: '0.5rem' }}><strong>Principle of Data Minimisation:</strong> RoktoKorobi does not collect National Identification (NID) numbers or passport numbers from Donors.</p>

      <h4 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>ARTICLE 5 — DATA SHARING AND DISCLOSURE</h4>
      <p style={{ marginBottom: '0.5rem' }}>RoktoKorobi shall not sell, rent, trade, or otherwise disclose personal data to any third party, except to healthcare providers, government health authorities, disaster relief agencies, accredited laboratories, or IT service providers with binding agreements.</p>
      <p style={{ marginBottom: '0.5rem' }}><strong>Anonymity of Donors:</strong> The identity of the Donor shall at all times remain anonymous in relation to the blood recipient.</p>

      <h4 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>ARTICLE 6 — RIGHTS OF DONORS</h4>
      <p style={{ marginBottom: '0.5rem' }}>Donors have the right to: Access their data, Rectify inaccurate data, Erase their data, Restrict processing, Withdraw consent, Object to automated decision-making, and Lodge complaints with the Bangladesh Data Protection Board.</p>

      <h4 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>ARTICLE 7 — DATA SECURITY MEASURES</h4>
      <p style={{ marginBottom: '0.5rem' }}>RoktoKorobi implements: End-to-end encryption, Multi-factor authentication, Role-based access controls, Coded donor identifiers, Regular security audits, Incident response procedures, Staff training, and Offline immutable backups.</p>

      <h4 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>ARTICLE 8 — DATA RETENTION AND DELETION</h4>
      <p style={{ marginBottom: '0.5rem' }}>Donor identity and contact data: Registration period plus 5 years</p>
      <p style={{ marginBottom: '0.5rem' }}>Donation and medical history records: Minimum 10 years</p>
      <p style={{ marginBottom: '0.5rem' }}>TTI screening test results: Minimum 10 years</p>
      <p style={{ marginBottom: '0.5rem' }}>Device and log data: 90 days</p>

      <h4 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>ARTICLE 10 — AGE ELIGIBILITY AND PROTECTION OF MINORS</h4>
      <p style={{ marginBottom: '0.5rem' }}>RoktoKorobi is intended solely for persons 18 years or older. Every prospective Donor must affirm through a mandatory active checkbox that they are 18 years or older.</p>
      <p style={{ marginBottom: '0.5rem' }}><strong>Donor Liability for Misrepresentation:</strong> Where a Donor knowingly provides a false age declaration, the full legal liability shall rest solely with the Donor. RoktoKorobi shall bear no legal responsibility for any consequence arising from misrepresentation.</p>

      <h4 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>ARTICLE 16 — CONTACT INFORMATION</h4>
      <p style={{ marginBottom: '0.5rem' }}>Data Protection Officer: dpo@roktokorobi.com.bd</p>
      <p style={{ marginBottom: '0.5rem' }}>Registered Office: Dhaka, Bangladesh</p>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#e53935' }}>
            Privacy Policy
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div onScroll={handleScroll} style={{ flex: 1, overflow: 'auto' }}>
          {policyContent}
        </div>

        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
            {hasScrolled 
              ? 'You have read the full policy. You may now consent.'
              : 'Please scroll to read the full policy.'}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Cancel
            </button>
            <button
              onClick={onAccept}
              disabled={!hasScrolled}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: hasScrolled ? '#e53935' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: hasScrolled ? 'pointer' : 'not-allowed',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
            >
              I Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
