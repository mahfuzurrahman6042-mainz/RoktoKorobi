'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import type { User } from 'firebase/auth';
import { ArrowLeft, Building2, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { database, getCurrentUser, ref, registerUser, sendVerificationEmail, update, updateProfile } from '@/lib/firebase';
import CountryField from '@/components/CountryField';
import { partnerEnrollmentOpen, validPhoneForCountry, type CountryCode } from '@/lib/countries';
import { policyConsentVersion, policyReviewHref } from '@/lib/policy-links';
import CountryPolicyConsent from '@/components/country-policy-consent';

type AccountForm = { name: string; email: string; phone: string; city: string; password: string; confirmPassword: string };

export default function PartnerAccountPage() {
  const [form, setForm] = useState<AccountForm>({ name: '', email: '', phone: '', city: '', password: '', confirmPassword: '' });
  const [country, setCountry] = useState<CountryCode>('BD');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [createdUid, setCreatedUid] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [verificationWarning, setVerificationWarning] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const finishProfile = async (user: User) => {
    const uid = user.uid;
    const email = form.email.trim().toLowerCase();
    if (!user || user.uid !== uid || user.email?.toLowerCase() !== email) {
      throw new Error('Your session changed. Sign in with your new account, then contact the RoktoKorobi team if activation is unavailable.');
    }
    if (!database) throw new Error('The database is unavailable. Please try again later.');
    const now = new Date().toISOString();
    await update(ref(database, `users/${uid}`), {
      uid, email, name: form.name.trim(), phone: form.phone.trim(), city: form.city.trim(), country,
      isDonor: false, donations: 0, acceptedTerms: true, acceptedPrivacy: true,
      consentVersion: policyConsentVersion(country), consentedAt: now, createdAt: now, updatedAt: now,
    });
    try { await sendVerificationEmail(user); }
    catch { setVerificationWarning(true); }
    setComplete(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!partnerEnrollmentOpen(country)) return setError('Partner enrollment is not open in this country yet.');
    if (form.city.trim().length < 2) return setError('Enter your city or town.');
    if (!validPhoneForCountry(form.phone, country)) return setError(country === 'PK'
      ? 'Enter a Pakistani mobile number such as 0300 1234567 or +92 300 1234567.'
      : 'Enter a valid phone number for the selected country.');
    if (form.password.length < 8) return setError('Use a password of at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('The passwords do not match.');
    if (!termsAccepted || !privacyAccepted) return setError('Accept the terms and privacy policy to continue.');
    setBusy(true);
    try {
      const email = form.email.trim().toLowerCase();
      const user = createdUid ? getCurrentUser() : (await registerUser(email, form.password)).user;
      if (!user || (createdUid && user.uid !== createdUid)) throw new Error('Your session changed. Please sign in again.');
      const uid = user.uid;
      setCreatedUid(uid);
      await updateProfile(user, { displayName: form.name.trim() });
      await finishProfile(user);
    } catch (cause) {
      const code = (cause as { code?: string }).code;
      setError(code === 'auth/email-already-in-use'
        ? 'This email already has an account. Sign in instead, or use another email.'
        : cause instanceof Error ? cause.message : 'Account creation did not finish. Please try again.');
    } finally { setBusy(false); }
  };

  const field = 'mt-2 w-full rounded-xl border border-[#C0152A]/20 bg-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-[#A5102F]';
  const reviewTerms = policyReviewHref(country, 'terms');
  const reviewPrivacy = policyReviewHref(country, 'privacy');
  return <main className="min-h-screen bg-[#F5EDD8] px-5 py-8 text-[#1A0F0A] sm:py-12">
    <div className="mx-auto max-w-2xl">
      <Link href="/partner-register" className="inline-flex items-center gap-2 text-sm font-semibold text-[#A5102F] hover:underline"><ArrowLeft size={16} aria-hidden="true" />Back to partner information</Link>
      <div className="mt-7 rounded-3xl border border-[#C0152A]/10 bg-[#FDFAF4] p-6 shadow-[0_18px_55px_rgba(68,25,27,.08)] sm:p-9">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#C0152A]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#A5102F]"><Building2 size={15} aria-hidden="true" />Partner leader account</span>
        <h1 className="mt-5 font-serif text-3xl font-bold tracking-tight sm:text-4xl">Start with your own account</h1>
        <p className="mt-3 leading-7 text-[#5C463B]">Create a personal account for the organization leader. You do not need to register as a blood donor. A super admin will separately review and activate your organization.</p>
        {complete ? <div role="status" className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
          <CheckCircle2 size={28} aria-hidden="true" /><h2 className="mt-3 text-xl font-bold">Your account was created</h2>
          <p className="mt-2 leading-7">{verificationWarning ? 'We could not send the verification email. Open the verification page to resend it.' : 'Check your inbox and verify your email address.'} After verifying, submit your organization request for super-admin review.</p>
          <Link href="/verify-email?next=%2Fpartner-request" className="mt-5 inline-flex rounded-xl bg-[#A5102F] px-5 py-3 font-semibold text-white">Open email verification</Link>
          <Link href="/partner-request" className="ml-3 mt-5 inline-flex rounded-xl border border-[#A5102F]/20 px-5 py-3 font-semibold text-[#A5102F]">Request partnership</Link>
        </div> : <form onSubmit={submit} className="mt-8 space-y-5">
          <CountryField value={country} onChange={next => { setCountry(next); setTermsAccepted(false); setPrivacyAccepted(false); }} className={field} purpose="partner" />
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold">Full name<input required autoComplete="name" maxLength={100} value={form.name} onChange={event => setForm(previous => ({ ...previous, name: event.target.value }))} className={field} /></label>
            <label className="block text-sm font-semibold">Phone<input required type="tel" autoComplete="tel" maxLength={30} value={form.phone} onChange={event => setForm(previous => ({ ...previous, phone: event.target.value }))} className={field} placeholder={country === 'PK' ? '0300 1234567 or +92 300 1234567' : undefined} />{country === 'PK' && <span className="mt-1 block text-xs font-normal text-[#5C463B]">Use a Pakistan mobile number, with or without +92.</span>}</label>
          </div>
          <label className="block text-sm font-semibold">City or town<input required autoComplete="address-level2" minLength={2} maxLength={80} value={form.city} onChange={event => setForm(previous => ({ ...previous, city: event.target.value }))} className={field} placeholder="Where you are based" /></label>
          <label className="block text-sm font-semibold">Email address<input required type="email" autoComplete="email" maxLength={254} value={form.email} onChange={event => setForm(previous => ({ ...previous, email: event.target.value }))} className={field} /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="partner-password" className="block text-sm font-semibold">Password</label>
              <div className="relative mt-2">
                <input id="partner-password" required type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} value={form.password} onChange={event => setForm(previous => ({ ...previous, password: event.target.value }))} className={`${field} !mt-0 h-12 pr-12`} />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)} className="absolute right-2 top-1/2 flex !h-9 !min-h-0 w-9 -translate-y-1/2 items-center justify-center rounded-lg !p-0 text-[#5C463B] hover:bg-[#F5EDD8] focus-visible:outline-2 focus-visible:outline-[#A5102F]">{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>
              </div>
              <span className="mt-1 block text-xs text-[#5C463B]">At least 8 characters.</span>
            </div>
            <div>
              <label htmlFor="partner-confirm-password" className="block text-sm font-semibold">Confirm password</label>
              <div className="relative mt-2">
                <input id="partner-confirm-password" required type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" minLength={8} value={form.confirmPassword} onChange={event => setForm(previous => ({ ...previous, confirmPassword: event.target.value }))} className={`${field} !mt-0 h-12 pr-12`} />
                <button type="button" aria-label={showConfirmation ? 'Hide confirmation password' : 'Show confirmation password'} aria-pressed={showConfirmation} onClick={() => setShowConfirmation(value => !value)} className="absolute right-2 top-1/2 flex !h-9 !min-h-0 w-9 -translate-y-1/2 items-center justify-center rounded-lg !p-0 text-[#5C463B] hover:bg-[#F5EDD8] focus-visible:outline-2 focus-visible:outline-[#A5102F]">{showConfirmation ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>
              </div>
            </div>
          </div>
          <div className="space-y-3 border-t border-[#C0152A]/10 pt-5 text-sm">
            <CountryPolicyConsent country={country} terms={termsAccepted} privacy={privacyAccepted} onTerms={setTermsAccepted} onPrivacy={setPrivacyAccepted} />
            {country === 'BD' ? <>
              <label className="flex items-start gap-3"><input required type="checkbox" checked={termsAccepted} onChange={event => setTermsAccepted(event.target.checked)} className="mt-1 accent-[#A5102F]" /><span>I accept the <Link href="/terms-of-service" target="_blank" className="font-semibold text-[#A5102F] underline">Terms of Service</Link>.</span></label>
              <label className="flex items-start gap-3"><input required type="checkbox" checked={privacyAccepted} onChange={event => setPrivacyAccepted(event.target.checked)} className="mt-1 accent-[#A5102F]" /><span>I accept the <Link href="/privacy-policy" target="_blank" className="font-semibold text-[#A5102F] underline">Privacy Policy</Link>.</span></label>
            </> : !partnerEnrollmentOpen(country) && <p role="status" className="rounded-xl border border-[#C0152A]/20 bg-white p-4 leading-6">{country === 'IN' ? 'India' : 'Pakistan'} enrollment is not open yet.{reviewTerms && reviewPrivacy ? <span className="mt-2 flex gap-4"><Link href={reviewTerms} target="_blank" className="font-semibold text-[#A5102F] underline">Terms</Link><Link href={reviewPrivacy} target="_blank" className="font-semibold text-[#A5102F] underline">Privacy Policy</Link></span> : null}</p>}
          </div>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
          <button disabled={busy} type="submit" className="w-full rounded-xl bg-[#A5102F] px-5 py-3.5 font-semibold text-white hover:bg-[#870D25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A5102F] disabled:opacity-60">{busy ? 'Creating account…' : createdUid ? 'Finish account setup' : 'Create leader account'}</button>
          <p className="text-center text-sm text-[#5C463B]">Already registered? <Link href="/login" className="font-semibold text-[#A5102F] underline">Sign in</Link></p>
        </form>}
      </div>
      <p className="mt-5 flex items-start gap-2 text-sm text-[#5C463B]"><ShieldCheck size={17} className="mt-0.5 shrink-0" aria-hidden="true" />This form creates only a personal account. It cannot grant partner or admin access.</p>
    </div>
  </main>;
}
