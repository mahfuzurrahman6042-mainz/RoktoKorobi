import type { AdminDataSource, AdminSnapshot } from './types';

export function emptySnapshot(): AdminSnapshot {
  return {
    metrics: { users: null, verifiedUsers: null, donors: null, partners: null, pendingPartners: null, requests: null, pendingRequests: null, criticalRequests: null, fulfilledRequests: null, hospitals: null, blogs: null, testimonials: null, verifiedTestimonials: null, delegates: null, students: null },
    partners: [], users: [], requests: [], activities: [],
    partnerStatus: { active: null, pending: null, suspended: null },
    requestStatus: { open: null, fulfilled: null, pending: null },
    health: { connection: null, database: null, emailVerification: null, rules: null, lastSync: null, version: null },
    profile: null,
    donorCounts: {},
  };
}

/** No credentials, invented records, database paths, or network calls. */
export const unconnectedSource: AdminDataSource = {
  async load() { return { state: 'unconfigured', snapshot: emptySnapshot() }; },
};
