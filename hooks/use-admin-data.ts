'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { emptySnapshot, unconnectedSource } from '@/lib/admin/data-source';
import type { AdminDataSource, AdminSnapshot, LoadState } from '@/lib/admin/types';

export function useAdminData(source: AdminDataSource) {
  const [state, setState] = useState<LoadState>(source === unconnectedSource ? 'unconfigured' : 'loading');
  const [snapshot, setSnapshot] = useState<AdminSnapshot>(emptySnapshot);
  const controller = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setState('loading');
    try {
      const result = await source.load(next.signal);
      if (!next.signal.aborted) { setSnapshot(result.snapshot); setState(result.state); }
    } catch (error: unknown) {
      if (next.signal.aborted) return;
      // Clear sensitive cached data on every error, including role revocation.
      setSnapshot(emptySnapshot());
      const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : '';
      setState(code === 'permission-denied' || code === 'PERMISSION_DENIED' ? 'forbidden' : 'error');
    }
  }, [source]);
  useEffect(() => { void load(); return () => controller.current?.abort(); }, [load]);
  return { state, snapshot, reload: load };
}
