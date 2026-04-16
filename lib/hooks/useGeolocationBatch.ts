import { useState, useRef, useEffect, useCallback } from 'react';

const DEBOUNCE_MS = 500;
const MAX_WAIT_MS = 5000;

interface Location {
  lat: number;
  lng: number;
  timestamp: number;
}

// FIX NEW-002: ASCII | in type annotations
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const firstUpdateRef = useRef<number | null>(null);

export function useGeolocationBatch(onBatch?: (locations: Location[]) => void) {
  const [pending, setPending] = useState<Location[]>([]);

  const processBatch = useCallback(() => {
    if (pending.length > 0) {
      onBatch?.(pending);
      setPending([]);
      firstUpdateRef.current = null;
    }
  }, [pending, onBatch]);

  // FIX NEW-006: Use a stable ref to avoid stale closure on processBatch
  const processBatchRef = useRef(processBatch);
  useEffect(() => {
    processBatchRef.current = processBatch;
  }, [processBatch]);

  useEffect(() => {
    if (!pending.length) return;
    if (!firstUpdateRef.current) {
      firstUpdateRef.current = Date.now();
    }
    const elapsed = Date.now() - firstUpdateRef.current;
    const delay = Math.max(0,
      Math.min(DEBOUNCE_MS, MAX_WAIT_MS - elapsed)
    );
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Use ref — always calls the latest version of processBatch
    timeoutRef.current = setTimeout(
      () => processBatchRef.current(), delay
    );
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pending]); // pending only — processBatch accessed safely via ref

  const addLocation = (lat: number, lng: number) => {
    setPending((prev) => [
      ...prev,
      { lat, lng, timestamp: Date.now() },
    ]);
  };

  return {
    pending,
    addLocation,
    processBatch,
  };
}
