'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Building2, Check, Clock3, Copy, Download, Heart, Link2, Mail, MessageCircle, QrCode, Share2, Users } from 'lucide-react';
import { usePartnerWorkspace } from './partner-workspace';

function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="partner-heading"><div><p className="lab">{eyebrow}</p><h1>{title}</h1><p className="m">{description}</p></div></header>;
}

export function PartnerOverview() {
  const { partner } = usePartnerWorkspace();
  const route = (path: string) => partner.isPreview ? `${path}?preview=1` : path;
  return <>
    <div className="partner-overview-heading"><PageHeader eyebrow="Partner overview" title="Make every connection count." description="A clear home for your organization’s donor outreach." />{partner.isPreview && <span className="dem">Demo preview · sharing disabled</span>}</div>
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
    <section aria-labelledby="partner-actions-title">
      <h2 id="partner-actions-title" className="partner-quick-title">Quick actions</h2>
      <div className="partner-quick-grid">
        <Link className="c partner-quick-card" href={route('/dashboard/partner/students')}><span className="ico"><Users size={21} aria-hidden="true" /></span><span><strong>Students</strong><small>Find people who joined with your code.</small></span><ArrowUpRight size={18} aria-hidden="true" /></Link>
        <Link className="c partner-quick-card" href={route('/dashboard/partner/referral')}><span className="ico"><Link2 size={21} aria-hidden="true" /></span><span><strong>Referral link</strong><small>Copy your organization’s signup link.</small></span><ArrowUpRight size={18} aria-hidden="true" /></Link>
        <Link className="c partner-quick-card" href={route('/dashboard/partner/outreach')}><span className="ico"><Share2 size={21} aria-hidden="true" /></span><span><strong>Outreach tools</strong><small>Share a QR code, poster or message.</small></span><ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>
  </>;
}

export function PartnerStudents() {
  const { members, membersError } = usePartnerWorkspace();
  const [memberSearch, setMemberSearch] = useState('');
  const visibleMembers = members.filter(member => member.name.toLocaleLowerCase().includes(memberSearch.trim().toLocaleLowerCase()));
  return <>
    <PageHeader eyebrow="Your community" title="Referred students" description="People who joined with your referral code and agreed to appear here." />
    <section className="c" aria-labelledby="students-title">
      <div className="partner-section-head"><div><p className="lab">Your community</p><h2 id="students-title">Referred students</h2></div><span className="ico"><Users size={21} aria-hidden="true" /></span></div>
      <p className="m">People who joined with your referral code and agreed to appear here. Only their name and join date are shown.</p>
      {membersError && <p className="partner-alert" role="alert">{membersError}</p>}
      <label className="partner-search-label" htmlFor="partner-member-search">Search by name</label>
      <input className="fld partner-member-search" id="partner-member-search" type="search" value={memberSearch} onChange={event => setMemberSearch(event.target.value)} placeholder="Find a student" />
      {visibleMembers.length > 0 ? <ul className="partner-member-list">{visibleMembers.map(member => <li key={member.uid}><span className="partner-member-avatar" aria-hidden="true">{member.name.trim().charAt(0).toLocaleUpperCase()}</span><span><strong>{member.name}</strong><small>Joined {new Date(member.joinedAt).toLocaleDateString()}</small></span></li>)}</ul> : <p className="m partner-empty">{memberSearch ? 'No matching students.' : 'No students have opted into this list yet. Share your link to invite them.'}</p>}
      <p className="m partner-roster-note">Referral totals may be higher than this list because earlier signups are not shown without their consent.</p>
    </section>
  </>;
}

export function PartnerReferral() {
  const { partner, code, shareable, link, copy } = usePartnerWorkspace();
  return <>
    <PageHeader eyebrow="Grow your network" title="Your referral link" description="Give donors a direct way to register with your organization." />
    <section className="c" aria-labelledby="referral-title">
      <div className="partner-section-head"><div><p className="lab">Grow your network</p><h2 id="referral-title">Your referral link</h2></div><span className="ico"><Link2 size={21} aria-hidden="true" /></span></div>
      <p className="m">Share this link so donors can register with your organization’s code already filled in.</p>
      <div className="row partner-link-row"><input className="fld" aria-label="Referral link" readOnly value={link || 'A real link appears after your organization is approved.'} onFocus={event => event.currentTarget.select()} /><button className="btn p" type="button" disabled={!link} onClick={() => void copy(link, 'Link')}><Copy size={17} aria-hidden="true" />Copy link</button>{link && <a className="btn" href={link} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={17} aria-hidden="true" />Open</a>}</div>
      <div className="partner-code-row"><span className="lab">Referral code</span><span className="code">{partner.isPreview ? 'Demo only' : code || 'Not assigned'}</span>{shareable && <button className="partner-text-button" type="button" onClick={() => void copy(code, 'Code')}><Copy size={15} aria-hidden="true" />Copy code</button>}</div>
    </section>
  </>;
}

export function PartnerOutreach() {
  const { link, whatsapp, email, message, canShare, assetBusy, copy, download, nativeShare } = usePartnerWorkspace();
  return <>
    <PageHeader eyebrow="Outreach tools" title="Ready to share" description="Everything you need to invite donors to your organization." />
    <section className="c" aria-labelledby="resources-title">
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
  </>;
}
