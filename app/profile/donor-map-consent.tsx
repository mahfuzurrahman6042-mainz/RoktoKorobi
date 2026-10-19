'use client';

import { useEffect, useState } from 'react';
import { database, get, getUserData, ref, syncPublicDonorListing, update } from '@/lib/firebase';

export default function DonorMapConsent({ uid, verified }: { uid: string; verified: boolean }) {
  const [district, setDistrict] = useState('');
  const [isDonor, setIsDonor] = useState(false);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!verified || !database) return;
    let cancelled = false;
    const load = async () => {
      try {
        const profile = await getUserData(uid);
        if (!profile?.isDonor) return;
        const listing = (await get(ref(database!, `donors/${uid}`))).val();
        if (!cancelled) {
          setIsDonor(true);
          setDistrict(profile.district || 'your district');
          setVisible(listing?.publicMapConsent === true);
        }
      } catch {
        if (!cancelled) setNotice('Map visibility settings could not be loaded.');
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [uid, verified]);

  if (!isDonor || !database) return null;

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    setNotice('');
    try {
      const profileRef = ref(database!, `users/${uid}`);
      if (visible) {
        await update(ref(database!), {
          [`donors/${uid}`]: null,
          [`users/${uid}/publicMapConsent`]: false,
        });
        setVisible(false);
        setNotice('You are no longer shown on the public donor map.');
      } else {
        await update(profileRef, { publicMapConsent: true });
        try {
          await syncPublicDonorListing(uid);
        } catch (error) {
          await update(profileRef, { publicMapConsent: false });
          throw error;
        }
        setVisible(true);
        setNotice('Your blood group and district are now visible on the public donor map.');
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not update map visibility. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <section className="profile-card" aria-label="Public donor map visibility" style={{ marginTop: 20 }}>
    <h3>Public donor map</h3>
    <p style={{ margin: '12px 0', lineHeight: 1.5 }}>
      {visible ? 'Your blood group and district are visible.' : 'You are not currently shown on the public map.'}
      {' '}If you opt in, the marker represents {district} district, not your home address. Your name, phone, precise location and medical information are never published.
    </p>
    <button className="btn btn-primary" type="button" disabled={busy || !verified} onClick={() => void toggle()}>
      {busy ? 'Updating…' : visible ? 'Remove me from map' : 'Show my district on map'}
    </button>
    {notice && <p role="status" style={{ marginTop: 12 }}>{notice}</p>}
  </section>;
}
