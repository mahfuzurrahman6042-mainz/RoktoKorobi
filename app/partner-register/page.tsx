"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PartnerRegister() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('en');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    district: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
  }, []);

  const t = (key: string) => {
    const translations: Record<string, any> = {
      title: { en: 'Partner Institute Registration', bn: 'পার্টনার ইনস্টিটিউট নিবন্ধন' },
      subtitle: { en: 'Join our partner program and help save lives together', bn: 'আমাদের পার্টনার প্রোগ্রামে যোগ দিন এবং একসাথে জীবন বাঁচান' },
      name: { en: 'Institution Name', bn: 'প্রতিষ্ঠানের নাম' },
      type: { en: 'Institution Type', bn: 'প্রতিষ্ঠানের ধরন' },
      contactPerson: { en: 'Contact Person', bn: 'যোগাযোগ ব্যক্তি' },
      email: { en: 'Email Address', bn: 'ইমেল ঠিকানা' },
      phone: { en: 'Phone Number', bn: 'ফোন নম্বর' },
      address: { en: 'Address', bn: 'ঠিকানা' },
      district: { en: 'District', bn: 'জেলা' },
      submit: { en: 'Submit Registration', bn: 'নিবন্ধন জমা দিন' },
      back: { en: 'Back to Home', bn: 'হোমে ফিরে যান' },
      success: { en: 'Registration submitted successfully! Your application is pending approval. We will contact you within 24-48 hours.', bn: 'নিবন্ধন সফলভাবে জমা দেওয়া হয়েছে! আপনার আবেদন অনুমোদনের অপেক্ষায় আছে। আমরা ২৪-৪৮ ঘন্টার মধ্যে আপনার সাথে যোগাযোগ করব।' },
      submitting: { en: 'Submitting...', bn: 'জমা দিচ্ছে...' },
      school: { en: 'School', bn: 'স্কুল' },
      college: { en: 'College', bn: 'কলেজ' },
      university: { en: 'University', bn: 'বিশ্ববিদ্যালয়' },
      ngo: { en: 'NGO', bn: 'এনজিও' },
      corporate: { en: 'Corporate', bn: 'কর্পোরেট' },
      select: { en: 'Select', bn: 'নির্বাচন করুন' },
      required: { en: 'Please fill in all required fields', bn: 'সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন' },
      error: { en: 'Registration failed. Please try again.', bn: 'নিবন্ধন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' }
    };
    return translations[key]?.[language] || key;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.type || !formData.contactPerson || !formData.email || !formData.phone || !formData.district) {
      alert(t('required'));
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert(language === 'bn' ? 'সঠিক ইমেল ঠিকানা দিন' : 'Please enter a valid email address');
      return;
    }

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

      if (response.ok) {
        setSubmitted(true);
        setSubmitting(false);

        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setSubmitting(false);
      alert(t('error'));
    }
  };

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          nav {
            padding: 16px 20px !important;
          }
          
          nav span:first-child {
            font-size: 24px !important;
          }
          
          nav .font-serif {
            font-size: 18px !important;
          }
          
          h1[style*="fontSize: '48px'"] {
            font-size: 28px !important;
          }
          
          form[style*="padding: '48px'"] {
            padding: 24px 20px !important;
          }
          
          div[style*="gridTemplateColumns: '1fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
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
        <Link href="/" style={{ background: '#C0152A', color: '#fff', padding: '10px 26px', borderRadius: '100px', fontWeight: 600, fontSize: '13px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(192,21,42,0.3)' }}>
          {t('back')}
        </Link>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#F5EDD8' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1A0F0A', marginBottom: '16px' }}>
              {t('title')}
            </h1>
            <p style={{ fontSize: '18px', color: '#3D2314', lineHeight: 1.6 }}>
              {t('subtitle')}
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
                {t('success')}
              </h2>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              background: '#FDFAF4', borderRadius: '24px', padding: '48px',
              boxShadow: '0 4px 60px rgba(26,15,10,0.06)', border: '1px solid rgba(192,21,42,0.08)'
            }}>
              <div style={{ display: 'grid', gap: '24px' }}>
                
                {/* Institution Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    {t('name')} *
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

                {/* Institution Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    {t('type')} *
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
                    <option value="">{t('select')}</option>
                    <option value="school">{t('school')}</option>
                    <option value="college">{t('college')}</option>
                    <option value="university">{t('university')}</option>
                    <option value="ngo">{t('ngo')}</option>
                    <option value="corporate">{t('corporate')}</option>
                  </select>
                </div>

                {/* Contact Person */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    {t('contactPerson')} *
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

                {/* Email and Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                      {t('email')} *
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
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                      {t('phone')} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    />
                  </div>
                </div>

                {/* District */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    {t('district')} *
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                      borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                      outline: 'none', transition: 'all 0.3s'
                    }}
                  >
                    <option value="">{language === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select District'}</option>
                    <option value="Dhaka">{language === 'bn' ? 'ঢাকা' : 'Dhaka'}</option>
                    <option value="Chattogram">{language === 'bn' ? 'চট্টগ্রাম' : 'Chattogram'}</option>
                    <option value="Khulna">{language === 'bn' ? 'খুলনা' : 'Khulna'}</option>
                    <option value="Rajshahi">{language === 'bn' ? 'রাজশাহী' : 'Rajshahi'}</option>
                    <option value="Sylhet">{language === 'bn' ? 'সিলেট' : 'Sylhet'}</option>
                    <option value="Barishal">{language === 'bn' ? 'বরিশাল' : 'Barishal'}</option>
                    <option value="Rangpur">{language === 'bn' ? 'রংপুর' : 'Rangpur'}</option>
                    <option value="Mymensingh">{language === 'bn' ? 'ময়মনসিংহ' : 'Mymensingh'}</option>
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                    {t('address')}
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    style={{
                      width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                      borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                      outline: 'none', transition: 'all 0.3s', resize: 'vertical'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '16px', background: '#C0152A',
                    color: '#fff', border: 'none', borderRadius: '14px',
                    fontSize: '16px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s', boxShadow: '0 8px 24px rgba(192,21,42,0.3)',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? t('submitting') : t('submit')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
