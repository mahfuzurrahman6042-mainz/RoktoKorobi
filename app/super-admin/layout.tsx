'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { createFirebaseAdminSource } from '@/lib/admin/firebase-source';
import { isSuperAdmin, onAuthStateChange } from '@/lib/firebase';
import type { AdminDataSource } from '@/lib/admin/types';
import '@/components/admin/admin.css';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [source, setSource] = useState<AdminDataSource | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => onAuthStateChange(async user => {
    if (!user) { router.replace('/login'); return; }
    if (!user.emailVerified) { router.replace('/verify-email'); return; }
    try {
      if (!user.email || !(await isSuperAdmin(user.email))) throw new Error('Access denied');
      setSource(createFirebaseAdminSource(user));
    } catch { router.replace('/dashboard'); }
    finally { setChecking(false); }
  }), [router]);

  if (checking || !source) return <main className="rr-root rr-admin-loading"><p>Checking RoktoKorobi admin access…</p></main>;
  return <AdminLayout source={source}>{children}</AdminLayout>;
}
