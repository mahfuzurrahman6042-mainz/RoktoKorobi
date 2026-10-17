'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, Ban, Check, RefreshCw, Search, ShieldCheck, Users } from 'lucide-react';
import { database, get, getAllRoles, getCurrentUser, isSuperAdmin, ref, update } from '@/lib/firebase';
import { formatDate } from '@/lib/admin/helpers';

type Person = {
  uid: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  isBanned: boolean;
  reviewStatus: string;
  createdAt: string | null;
};
type RoleOption = { id: string; name: string };

function asObject(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? value as Record<string, unknown> : {};
}

export function UserControlPage() {
  // Preview deployments share Firebase data; keep mutations off until database rules are deployed and verified.
  const controlsEnabled = process.env.NEXT_PUBLIC_ACCOUNT_CONTROLS_ENABLED === 'true';
  const banEnforcementReady = false;
  const [people, setPeople] = useState<Person[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roleDraft, setRoleDraft] = useState('');
  const [banReason, setBanReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const detailsRef = useRef<HTMLDivElement>(null);
  const actor = getCurrentUser();
  const selected = people.find(person => person.uid === selectedId);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      if (!database || !actor?.email || !actor.emailVerified || !(await isSuperAdmin(actor.email))) {
        setAuthorized(false);
        throw new Error('Only the verified super admin can manage accounts.');
      }
      setAuthorized(true);
      const [usersSnapshot, roleList] = await Promise.all([get(ref(database, 'users')), getAllRoles()]);
      const records = asObject(usersSnapshot.val());
      setPeople(Object.entries(records).map(([uid, raw]) => {
        const value = asObject(raw);
        return {
          uid,
          name: String(value.name || value.displayName || 'Unnamed user'),
          email: String(value.email || ''),
          role: String(value.role || ''),
          emailVerified: value.emailVerified === true,
          isBanned: value.isBanned === true,
          reviewStatus: String(value.reviewStatus || 'not reviewed'),
          createdAt: typeof value.createdAt === 'string' ? value.createdAt : null,
        };
      }).sort((a, b) => a.name.localeCompare(b.name)));
      setRoles((roleList as RoleOption[]).filter(role => role.id !== 'super_admin'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const choose = (person: Person) => {
    setSelectedId(person.uid);
    setRoleDraft(person.role);
    setBanReason('');
    setMessage('');
    setError('');
    requestAnimationFrame(() => detailsRef.current?.focus());
  };

  const save = async (action: 'role' | 'approve' | 'ban' | 'restore') => {
    if (!controlsEnabled || ((action === 'ban' || action === 'restore') && !banEnforcementReady) || !database || !actor || !selected) return;
    if (actor.uid === selected.uid || selected.role === 'super_admin') {
      setError('You cannot change your own account or another super-admin account here.');
      return;
    }
    if (action === 'role' && roleDraft && !roles.some(role => role.id === roleDraft)) {
      setError('Choose a role from the available roles.');
      return;
    }
    if (action === 'ban' && !banReason.trim()) {
      setError('Enter a reason before banning this account.');
      return;
    }
    const verb = action === 'role' ? 'save the role for' : action === 'approve' ? 'mark as reviewed' : action === 'ban' ? 'ban' : 'restore';
    if (!window.confirm(`Are you sure you want to ${verb} ${selected.name}?`)) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (!actor.email || !(await isSuperAdmin(actor.email))) throw new Error('Super-admin access could not be confirmed.');
      const now = new Date().toISOString();
      const userPath = `users/${selected.uid}`;
      const changes: Record<string, string | boolean | null> = { [`${userPath}/updatedAt`]: now };
      if (action === 'role') {
        changes[`${userPath}/role`] = roleDraft || null;
        changes[`${userPath}/roleAssignedAt`] = now;
        changes[`${userPath}/roleAssignedBy`] = actor.uid;
      } else if (action === 'approve') {
        changes[`${userPath}/reviewStatus`] = 'approved';
        changes[`${userPath}/reviewedAt`] = now;
        changes[`${userPath}/reviewedBy`] = actor.uid;
      } else {
        changes[`${userPath}/isBanned`] = action === 'ban';
        changes[`${userPath}/banReason`] = action === 'ban' ? banReason.trim() : null;
        changes[`${userPath}/bannedAt`] = action === 'ban' ? now : null;
        changes[`${userPath}/bannedBy`] = action === 'ban' ? actor.uid : null;
      }
      const logId = crypto.randomUUID();
      changes[`activityLogs/${logId}/action`] = action === 'role' ? 'role_assigned' : action === 'approve' ? 'user_reviewed' : action === 'ban' ? 'user_banned' : 'user_restored';
      changes[`activityLogs/${logId}/entity`] = 'user';
      changes[`activityLogs/${logId}/entityId`] = selected.uid;
      changes[`activityLogs/${logId}/performedBy`] = actor.uid;
      changes[`activityLogs/${logId}/performedByEmail`] = actor.email;
      changes[`activityLogs/${logId}/details`] = action === 'role' ? `Role: ${selected.role || 'unassigned'} → ${roleDraft || 'unassigned'}` : action === 'ban' ? `Account banned. Reason: ${banReason.trim()}` : action === 'approve' ? 'Account reviewed by super admin' : 'Account restored by super admin';
      changes[`activityLogs/${logId}/timestamp`] = now;
      await update(ref(database), changes);
      setPeople(previous => previous.map(person => person.uid !== selected.uid ? person : {
        ...person,
        role: action === 'role' ? roleDraft : person.role,
        reviewStatus: action === 'approve' ? 'approved' : person.reviewStatus,
        isBanned: action === 'ban' ? true : action === 'restore' ? false : person.isBanned,
      }));
      setMessage(`${selected.name}: ${action === 'role' ? 'role saved' : action === 'approve' ? 'review approved' : action === 'ban' ? 'platform ban recorded' : 'access restored'}.`);
      setBanReason('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The change could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const matches = people.filter(person => `${person.name} ${person.email} ${person.role}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <div className="cc-page">
    <section className="cc-hero"><div><p className="cc-eyebrow">People & access</p><h1>Account control</h1><p>Review accounts, assign roles, and restrict platform access. Each saved change is recorded in the activity log.</p></div><button type="button" className="cc-button" onClick={() => void load()} disabled={loading || busy}><RefreshCw size={16} aria-hidden="true" />Refresh</button></section>
    <div className="cc-section cc-note"><AlertTriangle size={18} aria-hidden="true" /><p><strong>{controlsEnabled ? 'What approval means' : 'Controls are in draft mode'}</strong>{controlsEnabled ? '“Reviewed” is an admin trust marker. It does not verify an email or block someone from seeking blood. A platform ban is not the same as disabling their Firebase Authentication identity.' : 'You can inspect the controls, but changes are disabled until database security rules and ban enforcement are reviewed and deployed. No account can be changed from this preview.'}</p></div>
    {error && <p className="cc-data-message is-error" role="alert">{error}</p>}
    {message && <p className="cc-data-message" role="status"><Check size={17} aria-hidden="true" />{message}</p>}
    {loading ? <p className="cc-data-message" role="status">Loading accounts…</p> : authorized && <div className="cc-control-grid cc-section">
      <section className="cc-panel" aria-label="Accounts"><div className="cc-panel-heading"><h2>People</h2><small>{matches.length} shown</small></div><label className="cc-search cc-control-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search people</span><input type="search" placeholder="Search name, email or role" value={search} onChange={event => setSearch(event.target.value)} /></label><div className="cc-control-list">{matches.length ? matches.map(person => <button className={'cc-control-person' + (selectedId === person.uid ? ' is-selected' : '')} key={person.uid} type="button" onClick={() => choose(person)}><span className="cc-account-avatar" aria-hidden="true">{person.name.charAt(0).toUpperCase()}</span><span><strong>{person.name}</strong><small>{person.email}</small><small>{person.role || 'No role'} · {person.isBanned ? 'Banned' : person.reviewStatus === 'approved' ? 'Reviewed' : 'Not reviewed'}</small></span></button>) : <div className="cc-empty"><Users size={22} aria-hidden="true" /><strong>No matching people</strong></div>}</div></section>
      <section className="cc-panel cc-control-detail" aria-label="Selected account"><div ref={detailsRef} tabIndex={-1} className="cc-panel-heading"><h2>{selected ? selected.name : 'Select an account'}</h2>{selected && <small>{selected.email}</small>}</div>{selected ? <div className="cc-control-form">
        <div className="cc-status-grid"><div className="cc-status-item"><span>Email verification</span><strong>{selected.emailVerified ? 'Verified by user' : 'Not verified'}</strong></div><div className="cc-status-item"><span>Admin review</span><strong>{selected.reviewStatus === 'approved' ? 'Reviewed' : 'Not reviewed'}</strong></div><div className="cc-status-item"><span>Platform status</span><strong>{selected.isBanned ? 'Banned' : 'Active'}</strong></div><div className="cc-status-item"><span>Joined</span><strong>{formatDate(selected.createdAt)}</strong></div></div>
        {actor?.uid === selected.uid || selected.role === 'super_admin' ? <p className="cc-data-message">This account is protected from changes here.</p> : <>
          <div className="cc-control-field"><label htmlFor="cc-role">Assigned role</label><select id="cc-role" className="cc-filter" value={roleDraft} onChange={event => setRoleDraft(event.target.value)} disabled={busy || !controlsEnabled}><option value="">No role</option>{roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</select><button className="cc-button" type="button" onClick={() => void save('role')} disabled={!controlsEnabled || busy || roleDraft === selected.role}><ShieldCheck size={16} aria-hidden="true" />Save role</button></div>
          <div className="cc-control-field"><strong>Review</strong><p>Mark this person as reviewed. This does not replace their email verification.</p><button className="cc-button" type="button" onClick={() => void save('approve')} disabled={!controlsEnabled || busy || selected.reviewStatus === 'approved'}><Check size={16} aria-hidden="true" />Approve review</button></div>
          <div className="cc-control-field cc-control-danger"><strong>Platform access</strong><p>{selected.isBanned ? 'Restore access for this person after ban enforcement is configured.' : 'A real ban must block protected data and disable Firebase sign-in. That enforcement is not configured yet.'}</p>{!selected.isBanned && <><label htmlFor="cc-ban-reason">Reason for ban</label><textarea id="cc-ban-reason" value={banReason} onChange={event => setBanReason(event.target.value)} rows={3} disabled={busy || !controlsEnabled || !banEnforcementReady} /></>}<button className="cc-button" type="button" onClick={() => void save(selected.isBanned ? 'restore' : 'ban')} disabled={!controlsEnabled || !banEnforcementReady || busy}><Ban size={16} aria-hidden="true" />{selected.isBanned ? 'Restore access' : 'Ban account'}</button></div>
        </>}
      </div> : <div className="cc-empty"><ArrowLeft size={22} aria-hidden="true" /><strong>Choose a person</strong><p>Their account controls will appear here.</p></div>}</section>
    </div>}
  </div>;
}
