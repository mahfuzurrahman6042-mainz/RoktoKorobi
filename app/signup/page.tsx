"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import CountryField from '@/components/CountryField';
import { enrollmentOpen, validPhoneForCountry, type CountryCode } from '@/lib/countries';
import { policyConsentVersion, policyReviewHref } from '@/lib/policy-links';
import CountryPolicyConsent from '@/components/country-policy-consent';
import { database, getCurrentUser, ref, registerUser, sendVerificationEmail, update, updateProfile } from '@/lib/firebase';

export default function Signup() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState('en');
  const [country, setCountry] = useState<CountryCode>('BD');
  const [createdUid, setCreatedUid] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'recipient'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
  }, []);

  const t = (key: string) => {
    const translations: Record<string, any> = {
      title: { en: 'Create Your Account', bn: 'আপনার অ্যাকাউন্ট তৈরি করুন' },
      subtitle: { en: 'Join our community and start saving lives', bn: 'আমাদের সম্প্রদায়ে যোগ দিন এবং জীবন বাঁচানো শুরু করুন' },
      name: { en: 'Full Name', bn: 'পূর্ণ নাম' },
      email: { en: 'Email Address', bn: 'ইমেল ঠিকানা' },
      phone: { en: 'Phone Number', bn: 'ফোন নম্বর' },
      password: { en: 'Password', bn: 'পাসওয়ার্ড' },
      confirmPassword: { en: 'Confirm Password', bn: 'পাসওয়ার্ড নিশ্চিত করুন' },
      userType: { en: 'Account Type', bn: 'অ্যাকাউন্টের ধরন' },
      donor: { en: 'Blood Donor', bn: 'রক্তদাতা' },
      recipient: { en: 'Blood Recipient', bn: 'রক্তগ্রহীতা' },
      hospital: { en: 'Hospital Staff', bn: 'হাসপাতাল কর্মী' },
      signup: { en: 'Create Account', bn: 'অ্যাকাউন্ট তৈরি করুন' },
      back: { en: 'Back to Home', bn: 'হোমে ফিরে যান' },
      login: { en: 'Already have an account? Login', bn: 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন' },
      success: { en: 'Account created. Please verify your email to continue.', bn: 'অ্যাকাউন্ট তৈরি হয়েছে। চালিয়ে যেতে ইমেইল যাচাই করুন।' },
      signing: { en: 'Creating account...', bn: 'অ্যাকাউন্ট তৈরি হচ্ছে...' },
      passwordMismatch: { en: 'Passwords do not match', bn: 'পাসওয়ার্ড মেলে না' },
      weakPassword: { en: 'Password must be at least 6 characters', bn: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' },
      acceptTerms: { en: 'I accept the Terms of Service', bn: 'আমি শর্তাবলী গ্রহণ করি' },
      acceptPrivacy: { en: 'I accept the Privacy Policy', bn: 'আমি গোপনীয়তা নীতি গ্রহণ করি' },
      viewTerms: { en: 'View Terms', bn: 'শর্তাবলী দেখুন' },
      viewPrivacy: { en: 'View Privacy Policy', bn: 'গোপনীয়তা নীতি দেখুন' },
      termsRequired: { en: 'You must accept the Terms of Service to register', bn: 'নিবন্ধন করতে আপনাকে শর্তাবলী গ্রহণ করতে হবে' },
      privacyRequired: { en: 'You must accept the Privacy Policy to register', bn: 'নিবন্ধন করতে আপনাকে গোপনীয়তা নীতি গ্রহণ করতে হবে' }
    };
    return translations[key]?.[language] || key;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch'));
      return false;
    }
    if (formData.password.length < 6) {
      setError(t('weakPassword'));
      return false;
    }
    if (!acceptTerms) {
      setError(t('termsRequired'));
      return false;
    }
    if (!acceptPrivacy) {
      setError(t('privacyRequired'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!enrollmentOpen(country)) return setError('Account enrollment is not open in this country yet.');
    if (!validateForm()) return;
    if (!validPhoneForCountry(formData.phone, country)) return setError('Enter a valid phone number for the selected country.');

    setSubmitting(true);
    setError('');

    try {
      const email = formData.email.trim().toLowerCase();
      const user = createdUid ? getCurrentUser() : (await registerUser(email, formData.password)).user;
      if (!user || user.email?.toLowerCase() !== email || (createdUid && user.uid !== createdUid)) {
        throw new Error('Your session changed. Sign in again to finish account setup.');
      }
      setCreatedUid(user.uid);
      if (!database) throw new Error('The database is unavailable. Please try again.');
      await updateProfile(user, { displayName: formData.name.trim() });
      const now = new Date().toISOString();
      await update(ref(database, `users/${user.uid}`), {
        uid: user.uid, email, name: formData.name.trim(), phone: formData.phone.trim(), country,
        isDonor: false, donations: 0, acceptedTerms: true, acceptedPrivacy: true,
        consentVersion: policyConsentVersion(country), consentedAt: now, createdAt: now, updatedAt: now,
      });
      try { await sendVerificationEmail(user); }
      catch (cause) { console.error('Could not send verification email', cause); }

      setSubmitted(true);
      setSubmitting(false);

      setTimeout(() => {
        router.push('/verify-email?next=%2Fdashboard');
      }, 2000);
    } catch (cause) {
      setSubmitting(false);
      setError(cause instanceof Error ? cause.message : 'Account creation failed. Please try again.');
    }
  };

  if (!mounted) return null;

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
        <Link href="/" style={{ background: '#dc2626', color: '#fff', padding: '10px 26px', borderRadius: '100px', fontWeight: 600, fontSize: '13px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(220,38,38,0.3)' }}>
          {t('back')}
        </Link>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#F5EDD8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '500px', width: '100%', padding: '20px' }}>
          
          {/* Signup Card */}
          <div style={{
            background: '#FDFAF4', borderRadius: '24px', padding: '48px',
            boxShadow: '0 4px 60px rgba(26,15,10,0.06)', border: '1px solid rgba(192,21,42,0.08)'
          }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1A0F0A', marginBottom: '12px' }}>
                {t('title')}
              </h1>
              <p style={{ fontSize: '16px', color: '#3D2314', lineHeight: 1.6 }}>
                Create a general account first. Donor and partner registration have separate review steps.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm font-semibold text-[#A5102F]">
                <Link href="/register" className="underline">Register as a donor</Link>
                <Link href="/partner-account" className="underline">Join as a partner leader</Link>
              </div>
            </div>

            {/* Success Message */}
            {submitted ? (
              <div style={{
                background: '#E8F5E8', border: '2px solid #22C55E', borderRadius: '16px',
                padding: '32px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <h2 style={{ fontSize: '20px', color: '#166534', marginBottom: '8px' }}>
                  {t('success')}
                </h2>
              </div>
            ) : (
              <>
                {/* Error Message */}
                {error && (
                  <div style={{
                    background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '12px',
                    padding: '12px 16px', marginBottom: '24px', color: '#DC2626', fontSize: '14px'
                  }}>
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <CountryField value={country} onChange={next => { setCountry(next); setAcceptTerms(false); setAcceptPrivacy(false); }} className="mt-2 w-full rounded-xl border border-[#C0152A]/20 bg-[#F5EDD8] px-4 py-3 text-base" />
                  
                  {/* Name and Email */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                        placeholder={language === 'bn' ? 'আপনার নাম' : 'Your name'}
                        style={{
                          width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                          borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                          outline: 'none', transition: 'all 0.3s'
                        }}
                      />
                    </div>
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
                        placeholder={language === 'bn' ? 'আপনার ইমেল' : 'Your email'}
                        style={{
                          width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                          borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                          outline: 'none', transition: 'all 0.3s'
                        }}
                      />
                    </div>
                  </div>

                  {/* Phone and User Type */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                        placeholder={language === 'bn' ? 'আপনার ফোন' : 'Your phone'}
                        style={{
                          width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                          borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                          outline: 'none', transition: 'all 0.3s'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                        Joining as
                      </label>
                      <select
                        name="userType"
                        value={formData.userType}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                          borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                          outline: 'none', transition: 'all 0.3s'
                        }}
                      >
                        <option value="recipient">General account</option>
                      </select>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                      {t('password')} *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder={language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                      style={{
                        width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '8px' }}>
                      {t('confirmPassword')} *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      placeholder={language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm password'}
                      style={{
                        width: '100%', padding: '14px 18px', border: '1.5px solid rgba(26,15,10,0.1)',
                        borderRadius: '12px', fontSize: '16px', background: '#F5EDD8',
                        outline: 'none', transition: 'all 0.3s'
                      }}
                    />
                  </div>

                  {/* Terms and Privacy Checkboxes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                    <CountryPolicyConsent country={country} terms={acceptTerms} privacy={acceptPrivacy} onTerms={setAcceptTerms} onPrivacy={setAcceptPrivacy} />
                    {country === 'BD' ? <>
                    {/* Terms of Service */}
                    <div style={{
                      background: '#F5EDD8',
                      border: '1.5px solid rgba(192,21,42,0.12)',
                      borderRadius: '12px',
                      padding: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          required
                          style={{ width: '20px', height: '20px', marginTop: '2px', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '4px', display: 'block' }}>
                            {t('acceptTerms')} *
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowTerms(!showTerms)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc2626',
                              fontSize: '13px',
                              cursor: 'pointer',
                              padding: 0,
                              textDecoration: 'underline',
                              fontWeight: 500
                            }}
                          >
                            {showTerms ? '▼ ' : '▶ '}{t('viewTerms')}
                          </button>
                          {showTerms && (
                            <div style={{
                              marginTop: '12px',
                              padding: '12px',
                              background: 'white',
                              borderRadius: '8px',
                              fontSize: '13px',
                              lineHeight: '1.6',
                              color: '#3D2314',
                              maxHeight: '200px',
                              overflowY: 'auto',
                              borderLeft: '3px solid #dc2626'
                            }}>
                              <p style={{ margin: '0 0 8px 0' }}>
                                <strong>{language === 'bn' ? '১. শর্তাবলী গ্রহণ' : '1. Acceptance of Terms'}</strong>: {language === 'bn' ? 'আপনি এই শর্তাবলী মেনে চলতে সম্মত হন। রক্তদাতা হতে হলে অন্তত ১৮ বছর বয়সী হতে হবে।' : 'You agree to these terms. Blood donors must be at least 18 years old.'}
                              </p>
                              <p style={{ margin: '0 0 8px 0' }}>
                                <strong>{language === 'bn' ? '২. ব্যবহারকারীর আচরণ' : '2. User Conduct'}</strong>: {language === 'bn' ? 'আপনি শুধুমাত্র আইনি উদ্দেশ্যে পরিষেবাটি ব্যবহার করবেন।' : 'Use the service only for lawful purposes.'}
                              </p>
                              <p style={{ margin: '0 0 8px 0' }}>
                                <strong>{language === 'bn' ? '৩. দায়বদ্ধতার সীমাবদ্ধতা' : '3. Limitation of Liability'}</strong>: {language === 'bn' ? 'আমরা পরোক্ষ বা ফলস্বরূপ ক্ষতির জন্য দায়ী থাকব না।' : 'We are not liable for indirect or consequential damages.'}
                              </p>
                              <Link href="/terms-of-service" target="_blank" style={{ color: '#C0152A', textDecoration: 'underline', fontSize: '12px' }}>
                                {language === 'bn' ? 'সম্পূর্ণ শর্তাবলী পড়ুন' : 'Read full Terms of Service'}
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Privacy Policy */}
                    <div style={{
                      background: '#F5EDD8',
                      border: '1.5px solid rgba(192,21,42,0.12)',
                      borderRadius: '12px',
                      padding: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={acceptPrivacy}
                          onChange={(e) => setAcceptPrivacy(e.target.checked)}
                          required
                          style={{ width: '20px', height: '20px', marginTop: '2px', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '14px', fontWeight: 600, color: '#3D2314', marginBottom: '4px', display: 'block' }}>
                            {t('acceptPrivacy')} *
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowPrivacy(!showPrivacy)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc2626',
                              fontSize: '13px',
                              cursor: 'pointer',
                              padding: 0,
                              textDecoration: 'underline',
                              fontWeight: 500
                            }}
                          >
                            {showPrivacy ? '▼ ' : '▶ '}{t('viewPrivacy')}
                          </button>
                          {showPrivacy && (
                            <div style={{
                              marginTop: '12px',
                              padding: '12px',
                              background: 'white',
                              borderRadius: '8px',
                              fontSize: '13px',
                              lineHeight: '1.6',
                              color: '#3D2314',
                              maxHeight: '200px',
                              overflowY: 'auto',
                              borderLeft: '3px solid #dc2626'
                            }}>
                              <p style={{ margin: '0 0 8px 0' }}>
                                <strong>{language === 'bn' ? '১. তথ্য সংগ্রহ' : '1. Information Collection'}</strong>: {language === 'bn' ? 'আমরা আপনার নাম, যোগাযোগ, রক্তের গ্রুপ সংগ্রহ করি।' : 'We collect your name, contact, blood group.'}
                              </p>
                              <p style={{ margin: '0 0 8px 0' }}>
                                <strong>{language === 'bn' ? '২. তথ্য ব্যবহার' : '2. Information Usage'}</strong>: {language === 'bn' ? 'আমরা রক্তদান মিলানের জন্য তথ্য ব্যবহার করি।' : 'We use information for blood donation matching.'}
                              </p>
                              <p style={{ margin: '0 0 8px 0' }}>
                                <strong>{language === 'bn' ? '৩. তথ্য নিরাপত্তা' : '3. Data Security'}</strong>: {language === 'bn' ? 'আমরা শিল্প-মানের নিরাপত্তা ব্যবস্থা ব্যবহার করি।' : 'We use industry-standard security measures.'}
                              </p>
                              <Link href="/privacy-policy" target="_blank" style={{ color: '#C0152A', textDecoration: 'underline', fontSize: '12px' }}>
                                {language === 'bn' ? 'সম্পূর্ণ গোপনীয়তা নীতি পড়ুন' : 'Read full Privacy Policy'}
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    </> : !enrollmentOpen(country) && <div role="status" style={{ padding: 16, border: '1.5px solid rgba(192,21,42,0.2)', borderRadius: 12, background: '#F5EDD8' }}>
                      <p>{country === 'IN' ? 'India' : 'Pakistan'} enrollment is not open yet.</p>
                      {policyReviewHref(country, 'terms') && <Link href={policyReviewHref(country, 'terms')!} target="_blank" style={{ color: '#C0152A', marginRight: 16 }}>Terms</Link>}
                      {policyReviewHref(country, 'privacy') && <Link href={policyReviewHref(country, 'privacy')!} target="_blank" style={{ color: '#C0152A' }}>Privacy Policy</Link>}
                    </div>}
                  </div>

                  {/* Signup Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%', padding: '16px', background: '#dc2626',
                      color: '#fff', border: 'none', borderRadius: '14px',
                      fontSize: '16px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s', boxShadow: '0 8px 24px rgba(220,38,38,0.3)',
                      opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? t('signing') : t('signup')}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Login Link */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/login" style={{ color: '#dc2626', textDecoration: 'none', fontSize: '16px' }}>
              {t('login')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
