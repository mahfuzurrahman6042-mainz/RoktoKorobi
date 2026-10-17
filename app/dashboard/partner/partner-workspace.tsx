'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, Building2, Check, Clock3, Copy, Download, Heart, Home, Link2, Mail, MessageCircle, QrCode, Share2, ShieldCheck, Users } from 'lucide-react';
import { database, get, getPartnerInstituteById, getPartnerStats, getUserData, onAuthStateChange, ref } from '@/lib/firebase';
import { buildPartnerLink, downloadImage, makePartnerArtwork, qrForLink } from './partner-assets';
import './partner-dashboard.css';

type Partner = {
  name: string;
  type: string;
  status: string;
  referralCode: string;
  totalStudents: number | null;
  totalDonations: number | null;
  updatedAt?: string;
  isPreview: boolean;
};

const previewPartner: Partner = {
  name: 'Partner workspace preview', type: 'Student-led organization', status: 'preview',
  referralCode: 'YOUR-CODE', totalStudents: 0, totalDonations: 0, isPreview: true,
};

export default function PartnerWorkspace() {
  const router = useRouter();
  const [partner, setPartner] = useState<Partner>(previewPartner);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [canShare, setCanShare] = useState(false);
  const [assetBusy, setAssetBusy] = useState('');
  const [inviteValid, setInviteValid] = useState(false);

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
          totalDonations: stats?.totalDonations ?? null,
          updatedAt: stats?.updatedAt,
          isPreview: false,
        });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'The partner workspace could not be loaded.');
      } finally { setLoading(false); }
    });
  }, [router]);

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

  const nav = <>
    <a className="on" href="#overview" aria-current="page"><Home size={18} aria-hidden="true" />Overview</a>
    <a href="#resources"><Link2 size={18} aria-hidden="true" />Resources</a>
    <Link href="/"><ArrowUpRight size={18} aria-hidden="true" />Main site</Link>
  </>;

  return <div className="partner-app app">
    <aside className="side" aria-label="Partner navigation">
      <Link className="partner-brand" href="/"><span className="partner-brand-mark" aria-hidden="true">✚</span><span>RoktoKorobi<small>Partner workspace</small></span></Link>
      <div className="partner-side-label lab">Workspace</div>
      <nav className="nav">{nav}</nav>
      <div className="partner-side-footer"><ShieldCheck size={17} aria-hidden="true" />Your organization’s information only</div>
    </aside>

    <main className="main" id="overview">
      <header className="partner-heading">
        <div><p className="lab">Partner overview</p><h1>Make every connection count.</h1><p className="m">A clear home for your organization’s donor outreach.</p></div>
        {partner.isPreview && <span className="dem">Demo preview · sharing disabled</span>}
      </header>

      {error && <div className="partner-alert" role="alert">{error}</div>}
      {notice && <p className="partner-notice" role="status" aria-live="polite">{notice}</p>}

      <section className="c partner-identity" aria-label="Organization">
        <span className="ico"><Building2 size={23} aria-hidden="true" /></span>
        <div className="f"><p className="lab">Your organization</p><h2>{partner.name}</h2><p className="m">{partner.type}</p></div>
        <span className={`chip ${partner.status === 'approved' ? '' : partner.isPreview ? 'g' : 'r'}`}>{partner.isPreview ? 'Preview' : partner.status}</span>
      </section>

      <section aria-label="Partner metrics" className="partner-metrics">
        <div className="c partner-stat"><span className="ico"><Users size={21} aria-hidden="true" /></span><div><p className="lab">Referral signups</p><strong>{partner.totalStudents ?? '—'}</strong><p className="m">People who joined with your code</p></div></div>
        <div className="c partner-stat"><span className="ico"><Heart size={21} aria-hidden="true" /></span><div><p className="lab">Donations recorded</p><strong>{partner.totalDonations ?? '—'}</strong><p className="m">Reported donation count</p></div></div>
        <div className="c partner-stat"><span className="ico"><Clock3 size={21} aria-hidden="true" /></span><div><p className="lab">Data freshness</p><strong className="partner-freshness">{partner.isPreview ? 'Preview data' : partner.updatedAt ? new Date(partner.updatedAt).toLocaleDateString() : 'Awaiting sync'}</strong><p className="m">Counts are refreshed by a super admin</p></div></div>
      </section>

      <section className="c" aria-labelledby="referral-title">
        <div className="partner-section-head"><div><p className="lab">Grow your network</p><h2 id="referral-title">Your referral link</h2></div><span className="ico"><Link2 size={21} aria-hidden="true" /></span></div>
        <p className="m">Share this link so donors can register with your organization’s code already filled in.</p>
        <div className="row partner-link-row"><input className="fld" aria-label="Referral link" readOnly value={link || 'A real link appears after your organization is approved.'} onFocus={event => event.currentTarget.select()} /><button className="btn p" type="button" disabled={!link} onClick={() => void copy(link, 'Link')}><Copy size={17} aria-hidden="true" />Copy link</button>{link && <a className="btn" href={link} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={17} aria-hidden="true" />Open</a>}</div>
        <div className="partner-code-row"><span className="lab">Referral code</span><span className="code">{partner.isPreview ? 'Demo only' : code || 'Not assigned'}</span>{shareable && <button className="partner-text-button" type="button" onClick={() => void copy(code, 'Code')}><Copy size={15} aria-hidden="true" />Copy code</button>}</div>
      </section>

      <section className="c" id="resources" aria-labelledby="resources-title">
        <div className="partner-section-head"><div><p className="lab">Outreach tools</p><h2 id="resources-title">Ready to share</h2></div></div>
        <p className="m">Every image and message uses the approved partner link. Nothing here shares private donor information.</p>
        <div className="partner-resource-actions">
          <button className="btn" type="button" disabled={!link || Boolean(assetBusy)} onClick={() => void download('qr')}><QrCode size={18} aria-hidden="true" />{assetBusy === 'qr' ? 'Creating QR…' : 'Download QR code'}</button>
          <button className="btn" type="button" disabled={!link || Boolean(assetBusy)} onClick={() => void download('poster')}><Download size={18} aria-hidden="true" />{assetBusy === 'poster' ? 'Creating poster…' : 'Download poster'}</button>
          <button className="btn" type="button" disabled={!link || Boolean(assetBusy)} onClick={() => void download('flyer')}><Download size={18} aria-hidden="true" />{assetBusy === 'flyer' ? 'Creating flyer…' : 'Download flyer'}</button>
          <button className="btn" type="button" disabled={!link} onClick={() => void copy(message, 'Message')}><Copy size={18} aria-hidden="true" />Copy message</button>
          {link && <a className="btn" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" />Share on WhatsApp</a>}
          {link && <a className="btn" href={email}><Mail size={18} aria-hidden="true" />Draft email</a>}
          {link && canShare && <button className="btn" type="button" onClick={() => void nativeShare()}><Share2 size={18} aria-hidden="true" />Share link</button>}
        </div>
      </section>

      <section className="c partner-next" aria-label="Next steps"><span className="ico"><Check size={21} aria-hidden="true" /></span><div><h2>What happens next?</h2><p className="m">Share your link with potential donors. Registration does not confirm medical eligibility; qualified staff must assess that before donation.</p></div></section>
    </main>

    <nav className="tabbar" aria-label="Mobile partner navigation">{nav}</nav>
  </div>;
}
