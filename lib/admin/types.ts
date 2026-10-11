export type LoadState = 'loading' | 'ready' | 'unconfigured' | 'error' | 'forbidden';
export type MetricKey = 'users' | 'verifiedUsers' | 'donors' | 'partners' | 'pendingPartners' | 'requests' | 'fulfilledRequests' | 'delegates' | 'students';
export type RecordStatus = 'active' | 'pending' | 'suspended' | 'verified' | 'unverified' | 'open' | 'fulfilled' | 'rejected' | 'completed';
export interface Partner { id: string; name: string; district: string; status: RecordStatus; students: number | null; activatedAt: string | null; referralUrl?: string }
export interface UserRecord { id: string; displayName: string; district: string; status: RecordStatus; joinedAt: string | null }
export interface RequestRecord { id: string; reference: string; district: string; bloodGroup: string; status: RecordStatus; createdAt: string | null }
export interface Activity { id: string; type: string; description: string; relatedLabel: string; occurredAt: string; status: RecordStatus }
export interface Health { connection: string | null; database: string | null; emailVerification: string | null; rules: string | null; lastSync: string | null; version: string | null }
export interface AdminSnapshot {
  metrics: Record<MetricKey, number | null>;
  partners: Partner[];
  users: UserRecord[];
  requests: RequestRecord[];
  activities: Activity[];
  partnerStatus: { active: number | null; pending: number | null; suspended: number | null };
  requestStatus: { open: number | null; fulfilled: number | null; pending: number | null };
  health: Health;
  profile: { displayName: string; emailVerified: boolean } | null;
}
export type LoadResult = { state: 'ready' | 'unconfigured'; snapshot: AdminSnapshot };
/** Adapt existing authorized Firebase helpers here; never infer collection names. */
export interface AdminDataSource {
  load: (signal: AbortSignal) => Promise<LoadResult>;
  refreshPartnerStatistics?: () => Promise<void>;
  signOut?: () => Promise<void>;
}
