'use client';

import type { User } from 'firebase/auth';
import { database, get, isSuperAdmin, logoutUser, onAuthStateChange, ref } from '@/lib/firebase';
import type { AdminDataSource, AdminSnapshot, Activity, Partner, RequestRecord, UserRecord } from './types';
import { emptySnapshot } from './data-source';

const asRecord = (value: unknown): Record<string, any> => value && typeof value === 'object' ? value as Record<string, any> : {};
const iso = (value: unknown): string | null => typeof value === 'string' ? value : typeof value === 'number' ? new Date(value).toISOString() : null;

export function createFirebaseAdminSource(user: User): AdminDataSource {
  return {
    async load(signal) {
      if (!database || !user.email || !(await isSuperAdmin(user.email))) return { state: 'unconfigured', snapshot: emptySnapshot() };
      const [usersSnap, requestsSnap, partnersSnap, activitySnap, hospitalsSnap, blogsSnap, testimonialsSnap] = await Promise.all([
        get(ref(database, 'users')), get(ref(database, 'bloodRequests')), get(ref(database, 'partnerInstitutes')), get(ref(database, 'activityLogs')), get(ref(database, 'hospitals')), get(ref(database, 'blogs')), get(ref(database, 'testimonials')),
      ]);
      if (signal.aborted) throw new DOMException('Request aborted', 'AbortError');

      const users = Object.entries(asRecord(usersSnap.val())).map(([id, raw]): UserRecord => {
        const value = asRecord(raw);
        return { id, displayName: value.name || value.displayName || 'Unnamed user', district: value.district || value.location || 'Not provided', status: value.emailVerified === true ? 'verified' : 'unverified', joinedAt: iso(value.createdAt), isDonor: value.isDonor === true && value.availability !== false };
      });
      const requests = Object.entries(asRecord(requestsSnap.val())).map(([id, raw]): RequestRecord => {
        const value = asRecord(raw);
        const fulfilled = value.fulfilled === true || value.status === 'fulfilled' || value.status === 'completed';
        return { id, reference: value.reference || value.requestId || id.slice(0, 8), district: value.district || value.location || 'Not provided', bloodGroup: value.bloodGroup || value.bloodType || 'Unknown', status: fulfilled ? 'fulfilled' : value.status === 'pending' ? 'pending' : 'open', createdAt: iso(value.createdAt || value.timestamp) };
      });
      const partners = Object.entries(asRecord(partnersSnap.val())).map(([id, raw]): Partner => {
        const value = asRecord(raw);
        const status = value.status === 'approved' ? 'active' : value.status === 'suspended' ? 'suspended' : value.status === 'rejected' ? 'rejected' : 'pending';
        return { id, name: value.name || 'Unnamed partner', district: value.district || 'Not provided', status, students: value.totalDonors == null ? null : Number(value.totalDonors), activatedAt: iso(value.updatedAt || value.createdAt), referralUrl: value.referralCode && typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${encodeURIComponent(value.referralCode)}` : undefined };
      });
      const activities = Object.entries(asRecord(activitySnap.val())).map(([id, raw]): Activity => {
        const value = asRecord(raw);
        return { id, type: value.action || value.entity || 'Platform activity', description: value.details || 'Administrative activity recorded', relatedLabel: value.entityId || value.performedByEmail || 'RoktoKorobi', occurredAt: iso(value.timestamp) || new Date(0).toISOString(), status: 'completed' };
      }).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 30);

      const approved = partners.filter(item => item.status === 'active').length;
      const pending = partners.filter(item => item.status === 'pending').length;
      const suspended = partners.filter(item => item.status === 'suspended').length;
      const fulfilled = requests.filter(item => item.status === 'fulfilled').length;
      const donorCounts: Record<string, number> = {};
      users.forEach(userRecord => {
        const raw = asRecord(asRecord(usersSnap.val())[userRecord.id]);
        const group = typeof raw.bloodGroup === 'string' ? raw.bloodGroup.toUpperCase() : '';
        if (userRecord.isDonor && group) donorCounts[group] = (donorCounts[group] ?? 0) + 1;
      });
      const requestValues = Object.values(asRecord(requestsSnap.val())).map(raw => asRecord(raw));
      const criticalRequests = requestValues.filter(value => String(value.urgency || value.priority || '').toLowerCase() === 'critical').length;
      const count = (value: unknown) => Object.keys(asRecord(value)).length;
      const testimonialValues = Object.values(asRecord(testimonialsSnap.val())).map(raw => asRecord(raw));
      const snapshot: AdminSnapshot = {
        metrics: { users: users.length, verifiedUsers: users.filter(item => item.status === 'verified').length, donors: users.filter(item => asRecord(asRecord(usersSnap.val())[item.id]).isDonor === true && asRecord(asRecord(usersSnap.val())[item.id]).availability !== false).length, partners: approved, pendingPartners: pending, requests: requests.length, pendingRequests: requests.filter(item => item.status === 'pending').length, criticalRequests, fulfilledRequests: fulfilled, hospitals: count(hospitalsSnap.val()), blogs: count(blogsSnap.val()), testimonials: testimonialValues.length, verifiedTestimonials: testimonialValues.filter(value => value.status === 'approved' || value.verified === true).length, delegates: Object.values(asRecord(usersSnap.val())).filter(raw => ['delegate', 'country_delegate'].includes(asRecord(raw).role)).length, students: partners.reduce((sum, item) => sum + (item.students || 0), 0) },
        partners, users: users.slice(0, 100), requests: requests.slice(0, 100), activities,
        partnerStatus: { active: approved, pending, suspended }, requestStatus: { open: requests.filter(item => item.status === 'open').length, fulfilled, pending: requests.filter(item => item.status === 'pending').length },
        health: { connection: 'Connected', database: 'Available', emailVerification: user.emailVerified ? 'Verified' : 'Required', rules: 'Protected', lastSync: new Date().toISOString(), version: process.env.NEXT_PUBLIC_APP_VERSION || '22.0.4' },
        profile: { displayName: user.displayName || user.email, emailVerified: user.emailVerified },
        donorCounts,
      };
      return { state: 'ready', snapshot };
    },
    async signOut() { await logoutUser(); window.location.assign('/login'); },
  };
}

export { onAuthStateChange };
