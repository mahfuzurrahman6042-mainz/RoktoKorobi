import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface QueueItem {
  id: string;
  type: 'request' | 'donor_update' | 'registration' | 'notification' | 'donation_record';
  data: Record<string, any>;
  timestamp: number;
  retries: number;
}

// FIX NEW-002: ASCII | in type annotations throughout
const [lastSync, setLastSync] = useState<Date | null>(null);
const abortRef = useRef<AbortController | null>(null);

type AddItem = Omit<QueueItem, 'id' | 'timestamp' | 'retries'>; // FIX NEW-002

// FIX NEW-005: processItem was missing entirely — define it here
async function processItem(
  item: QueueItem,
  signal: AbortSignal
): Promise<boolean> {
  const tableMap: Record<QueueItem['type'], string> = {
    request:         'blood_requests',
    donor_update:    'profiles',
    registration:    'profiles',
    notification:    'notifications',
    donation_record: 'donations',
  };
  const table = tableMap[item.type];
  if (!table) return false;
  try {
    const { error } = await supabase
      .from(table)
      .upsert(item.data)
      .abortSignal(signal);
    return !error;
  } catch {
    return false;
  }
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const addItem = (item: AddItem) => {
    const newItem: QueueItem = {
      ...item,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      retries: 0,
    };
    setQueue((prev) => [...prev, newItem]);
  };

  const processQueue = async () => {
    if (isSyncing || queue.length === 0) return;
    
    setIsSyncing(true);
    const controller = new AbortController();
    
    for (const item of queue) {
      try {
        const success = await processItem(item, controller.signal);
        if (success) {
          setQueue((prev) => prev.filter((q) => q.id !== item.id));
          setLastSync(new Date());
        } else if (item.retries < 3) {
          item.retries++;
        }
      } catch (error) {
        console.error('Queue processing error:', error);
      }
    }
    
    setIsSyncing(false);
  };

  useEffect(() => {
    const interval = setInterval(processQueue, 30000);
    return () => clearInterval(interval);
  }, [queue, isSyncing]);

  return {
    queue,
    addItem,
    processQueue,
    isSyncing,
    lastSync,
  };
}
