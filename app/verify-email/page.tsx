'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { reload, type User } from 'firebase/auth';
import { onAuthStateChange, sendVerificationEmail, logoutUser, syncPublicDonorListing } from '@/lib/firebase';

function destinationAfterVerification() {
  return new URLSearchParams(window.location.search).get('next') === '/partner-request' ? '/partner-request' : '/dashboard';
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const finishVerification = async (verifiedUser: User) => {
    try {
      await verifiedUser.getIdToken(true);
      await syncPublicDonorListing(verifiedUser.uid);
    } catch (error) {
      // Map publication must not prevent a verified user from using their account.
      console.error('Could not sync donor map listing after verification', error);
    }
    router.replace(destinationAfterVerification());
  };

  useEffect(() => onAuthStateChange(currentUser => {
    setUser(currentUser);
    setLoading(false);
    if (currentUser?.emailVerified) void finishVerification(currentUser);
  }), [router]);

  const checkVerification = async () => {
    if (!user) return;
    setBusy(true);
    setNotice('');
    try {
      await reload(user);
      await user.getIdToken(true);
      if (user.emailVerified) await finishVerification(user);
      else setNotice('Your email is not verified yet. Open the link in your inbox, then check again.');
    } catch {
      setNotice('We could not check your email status. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await sendVerificationEmail(user);
      setNotice('A new verification email was sent. Please check your inbox and spam folder.');
    } catch {
      setNotice('We could not send another email yet. Please wait a few minutes and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5EDD8] px-5 py-12 text-[#1A0F0A]">
      <section className="w-full max-w-lg rounded-3xl border border-[#C0152A]/10 bg-[#FDFAF4] p-8 shadow-xl sm:p-10">
        <Link href="/" className="text-sm font-semibold text-[#C0152A]">← RoktoKorobi</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#C0152A]">One more step</p>
        <h1 className="mt-3 font-serif text-4xl font-bold">Verify your email</h1>
        <p className="mt-4 leading-7 text-[#5C463B]">
          {loading ? 'Checking your account…' : user
            ? <>We sent a verification link to <strong>{user.email}</strong>. Open that link, then return here.</>
            : 'Please log in to check or resend your verification email.'}
        </p>
        {notice && <p role="status" className="mt-5 rounded-xl bg-[#F5EDD8] p-4 text-sm text-[#5C463B]">{notice}</p>}
        {user ? <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button disabled={busy} onClick={checkVerification} className="rounded-xl bg-[#C0152A] px-5 py-3 font-semibold text-white disabled:opacity-60">I've verified my email</button>
          <button disabled={busy} onClick={resend} className="rounded-xl border border-[#C0152A]/20 px-5 py-3 font-semibold text-[#C0152A] disabled:opacity-60">Resend email</button>
        </div> : <Link href="/login" className="mt-8 inline-block rounded-xl bg-[#C0152A] px-5 py-3 font-semibold text-white">Go to login</Link>}
        {user && <button onClick={async () => { await logoutUser(); router.replace('/login'); }} className="mt-6 block text-sm text-[#6B5B4F] underline">Use a different email</button>}
      </section>
    </main>
  );
}
