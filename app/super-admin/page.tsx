'use client';

import { SuperAdminDashboard } from '@/components/admin/super-admin-dashboard';

/**
 * The Super Admin route is intentionally a thin page shell. Authentication,
 * authorization, Firebase data loading, and the shared admin layout live in
 * app/super-admin/layout.tsx so every Super Admin child route uses the same
 * protected boundary and visual system.
 */
export default function SuperAdminPage() { return <SuperAdminDashboard />; }
