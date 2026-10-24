'use client';

import { useEffect, useState } from 'react';
import { database, get, getUserData, ref, remove, set } from '@/lib/firebase';
import { countryForRecord, enrollmentOpen } from '@/lib/countries';

type Referral = { instituteId: string; name: string; joinedAt: string; active: boolean };

export default function PartnerRosterConsent({ uid, verified }: { uid: string; verified: boolean }) {
  const [referral, setReferral] = useState<Referral | null>(null);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!verified || !database) return;
    let cancelled = false;
    const load = async () => {
      try {
        const profile = await getUserData(uid);
        if (!profile?.instituteId || !profile?.referralCode || !profile?.name) return;
        const country = countryForRecord(profile.country);
        if (!country || !enrollmentOpen(country)) return;
        const invite = (await get(ref(database!, `partnerInvites/${profile.referralCode}`))).val();
        if (invite?.instituteId !== profile.instituteId || countryForRecord(invite.country) !== country) return;
        const member = (await get(ref(database!, `partnerMembers/${profile.instituteId}/${uid}`))).val();
        if (!cancelled) {
          setReferral({ instituteId: profile.instituteId, name: profile.name, joinedAt: profile.createdAt || new Date().toISOString(), active: invite.active === true });
          setVisible(member?.consent === true);
        }
      } catch {
        if (!cancelled) setNotice('Partner visibility settings are unavailable right now.');
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [uid, verified]);

  if (!referral || !database) return null;

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    setNotice('');
    try {
      const memberRef = ref(database!, `partnerMembers/${referral.instituteId}/${uid}`);
      if (visible) await remove(memberRef);
      else if (!referral.active) throw new Error('Partner invitation inactive');
      else await set(memberRef, { uid, name: referral.name, joinedAt: referral.joinedAt, consent: true });
      setVisible(!visible);
      setNotice(visible ? 'You have been removed from the partner roster.' : 'Your name is now visible to your partner leader.');
    } catch {
      setNotice('Could not update partner visibility. Please try again.');
    } finally { setBusy(false); }
  };

  return <section className="profile-card" aria-label="Partner visibility" style={{ marginTop: 20 }}>
    <h3>Partner visibility</h3>
    <p style={{ margin: '12px 0', lineHeight: 1.5 }}>Allow your referral partner’s leader to see your name and join date. Your phone, email and medical details are never shown in their roster.</p>
    <button className="btn btn-primary" type="button" disabled={busy || (!visible && !referral.active)} onClick={() => void toggle()}>{busy ? 'Updating…' : visible ? 'Remove me from partner roster' : referral.active ? 'Show me in partner roster' : 'Partner invitation inactive'}</button>
    {notice && <p role="status" style={{ marginTop: 12 }}>{notice}</p>}
  </section>;
}
