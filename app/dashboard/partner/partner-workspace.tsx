'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { ArrowUpRight, BarChart3, Home, Link2, Menu, Share2, ShieldCheck, Users, X } from 'lucide-react';
import { database, get, getPartnerInstituteById, getPartnerStats, getUserData, onAuthStateChange, ref } from '@/lib/firebase';
import { buildPartnerLink, downloadImage, makePartnerArtwork, qrForLink } from './partner-assets';
import './partner-dashboard.css';

export type Partner = {
  name: string;
  type: string;
  status: string;
  referralCode: string;
  totalStudents: number | null;
  totalDonors: number | null;
  totalDonations: number | null;
  totalBloodRequests: number | null;
  updatedAt?: string;
  isPreview: boolean;
};

export type PartnerMember = { uid: string; name: string; joinedAt: string; consent: true };

type PartnerWorkspaceState = {
  partner: Partner;
  members: PartnerMember[];
  membersError: string;
  code: string;
  shareable: boolean;
  link: string;
  message: string;
  whatsapp: string;
  email: string;
  canShare: boolean;
  assetBusy: string;
  copy: (value: string, label: string) => Promise<void>;
  download: (format: 'qr' | 'poster' | 'flyer') => Promise<void>;
  nativeShare: () => Promise<void>;
};

const PartnerContext = createContext<PartnerWorkspaceState | null>(null);

export function usePartnerWorkspace() {
  const value = useContext(PartnerContext);
  if (!value) throw new Error('Partner workspace is unavailable outside its layout.');
  return value;
}

const sections = [
  { href: '/dashboard/partner', label: 'Overview', icon: Home },
  { href: '/dashboard/partner/students', label: 'Students', icon: Users },
  { href: '/dashboard/partner/impact', label: 'Impact', icon: BarChart3 },
  { href: '/dashboard/partner/referral', label: 'Referral link', icon: Link2 },
  { href: '/dashboard/partner/outreach', label: 'Outreach tools', icon: Share2 },
];

const previewPartner: Partner = {
  name: 'Partner workspace preview', type: 'Student-led organization', status: 'preview',
  referralCode: 'YOUR-CODE', totalStudents: 0, totalDonors: 0, totalDonations: 0, totalBloodRequests: 0, isPreview: true,
};

export default function PartnerWorkspace({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [partner, setPartner] = useState<Partner>(previewPartner);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [canShare, setCanShare] = useState(false);
  const [assetBusy, setAssetBusy] = useState('');
  const [inviteValid, setInviteValid] = useState(false);
  const [members, setMembers] = useState<PartnerMember[]>([]);
  const [membersError, setMembersError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator.share === 'function');
    if (process.env.NODE_ENV === 'development' && new URLSearchParams(window.location.search).has('preview')) {
      setLoading(false);
      return;
    }
    return onAuthStateChange(async user => {
      if (!user) { router.replace('/login'); return; }
      if (!user.emailVerified) { router.replace('/verify-email'); return; }
      try {
        const profile = await getUserData(user.uid);
        if (profile?.role !== 'partner_admin' || !profile?.instituteId) {
          router.replace('/dashboard');
          return;
        }
        const institute = await getPartnerInstituteById(profile.instituteId);
        if (!institute) throw new Error('Your partner organization could not be found.');
        if (institute.status === 'approved' && database) {
          try {
            const snapshot = await get(ref(database, `partnerMembers/${profile.instituteId}`));
            const roster = snapshot.val() as Record<string, PartnerMember> | null;
            setMembers(Object.entries(roster || {})
              .filter(([uid, member]) => member?.uid === uid && member?.consent === true && typeof member?.name === 'string')
              .map(([, member]) => member)
              .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)));
          } catch {
            setMembersError('The referral roster could not be loaded. Please refresh or ask a super admin to check database access.');
          }
        }
        const candidate = String(institute.referralCode || '').trim().toUpperCase();
        if (institute.status === 'approved' && /^[A-Z0-9-]{4,32}$/.test(candidate) && database) {
          try {
            const invite = (await get(ref(database, `partnerInvites/${candidate}`))).val();
            const valid = invite?.active === true && invite?.instituteId === profile.instituteId;
            setInviteValid(valid);
            if (!valid) setError('Your referral code is not active. Ask a super admin to check it before sharing.');
          } catch {
            setInviteValid(false);
            setError('We could not verify your referral code. Sharing is disabled until it can be checked.');
          }
        } else setInviteValid(false);
        let stats: Awaited<ReturnType<typeof getPartnerStats>> = null;
        try { stats = await getPartnerStats(profile.instituteId); }
        catch { setError(previous => `${previous ? `${previous} ` : ''}Partner counts are unavailable right now.`); }
        setPartner({
          name: String(institute.name || 'Partner organization'),
          type: String(institute.type || 'Organization'),
          status: String(institute.status || 'pending'),
          referralCode: String(institute.referralCode || ''),
          totalStudents: stats?.totalStudents ?? null,
          totalDonors: stats?.totalDonors ?? null,
          totalDonations: stats?.totalDonations ?? null,
          totalBloodRequests: stats?.totalBloodRequests ?? null,
          updatedAt: stats?.updatedAt,
          isPreview: false,
        });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'The partner workspace could not be loaded.');
      } finally { setLoading(false); }
    });
  }, [router]);

  useEffect(() => {
    setMenuOpen(false);
    if (pathname === '/dashboard/partner' && window.location.hash === '#resources') {
      const preview = process.env.NODE_ENV === 'development' && new URLSearchParams(window.location.search).has('preview') ? '?preview=1' : '';
      router.replace(`/dashboard/partner/referral${preview}`);
    }
  }, [pathname, router]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const code = partner.referralCode.trim().toUpperCase();
  const shareable = !partner.isPreview && partner.status === 'approved' && inviteValid && code !== 'YOUR-CODE' && /^[A-Z0-9-]{4,32}$/.test(code);
  const link = shareable ? buildPartnerLink(code) : '';
  const message = `Join ${partner.name}'s blood donor community on RoktoKorobi. Register here: ${link}`;
  const whatsapp = link ? `https://wa.me/?text=${encodeURIComponent(message)}` : '';
  const email = link ? `mailto:?subject=${encodeURIComponent(`Join ${partner.name} on RoktoKorobi`)}&body=${encodeURIComponent(message)}` : '';

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied to clipboard.`);
    } catch {
      window.prompt(`Copy ${label.toLowerCase()} manually:`, value);
      setNotice('Select the text in the dialog to copy it.');
    }
  };

  const download = async (format: 'qr' | 'poster' | 'flyer') => {
    if (!link || assetBusy) return;
    setAssetBusy(format);
    setNotice('');
    try {
      const dataUrl = format === 'qr'
        ? await qrForLink(link)
        : await makePartnerArtwork({ name: partner.name, code, link, format });
      downloadImage(dataUrl, `roktokorobi-${format}-${code}.png`);
      setNotice(`${format === 'qr' ? 'QR code' : format === 'poster' ? 'Poster' : 'Flyer'} download started.`);
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'The image could not be created. Please try again.');
    } finally { setAssetBusy(''); }
  };

  const nativeShare = async () => {
    if (!link || !navigator.share) return;
    try { await navigator.share({ title: partner.name, text: `Join ${partner.name}'s blood donor community on RoktoKorobi.`, url: link }); }
    catch (cause) { if ((cause as Error).name !== 'AbortError') setNotice('Sharing failed. You can copy the link instead.'); }
  };

  if (loading) return <main className="partner-app partner-loading" role="status">Loading partner workspace…</main>;

  const navigation = <>
    {sections.map(({ href, label, icon: Icon }) => <Link key={href} href={partner.isPreview ? `${href}?preview=1` : href} onClick={() => setMenuOpen(false)} className={pathname === href ? 'on' : undefined} aria-current={pathname === href ? 'page' : undefined}><Icon size={18} aria-hidden="true" />{label}</Link>)}
    <Link href="/" onClick={() => setMenuOpen(false)}><ArrowUpRight size={18} aria-hidden="true" />Main site</Link>
  </>;

  return <PartnerContext.Provider value={{ partner, members, membersError, code, shareable, link, message, whatsapp, email, canShare, assetBusy, copy, download, nativeShare }}>
    <div className="partner-app app">
      <header className="partner-mobile-topbar">
        <Link className="partner-brand" href={partner.isPreview ? '/dashboard/partner?preview=1' : '/dashboard/partner'} aria-label="RoktoKorobi partner workspace"><BrandLogo size={38} subtitle="Partner workspace" /></Link>
        <button className="partner-menu-button" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="partner-sidebar" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </header>
      {menuOpen && <button className="partner-menu-backdrop" type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
      <aside className={`side${menuOpen ? ' partner-side-open' : ''}`} id="partner-sidebar" aria-label="Partner navigation">
        <Link className="partner-brand" href={partner.isPreview ? '/dashboard/partner?preview=1' : '/dashboard/partner'} onClick={() => setMenuOpen(false)} aria-label="RoktoKorobi partner workspace"><BrandLogo size={38} subtitle="Partner workspace" /></Link>
        <button className="partner-drawer-close" type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={21} aria-hidden="true" /></button>
        <div className="partner-side-label lab">Workspace</div>
        <nav className="nav">{navigation}</nav>
        <div className="partner-side-footer"><ShieldCheck size={17} aria-hidden="true" />Your organization’s information only</div>
      </aside>
      <main className="main">
        {error && <div className="partner-alert" role="alert">{error}</div>}
        {notice && <p className="partner-notice" role="status" aria-live="polite">{notice}</p>}
        {children}
      </main>
    </div>
  </PartnerContext.Provider>;
}
