import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface EligibilityStatus {
  isEligible: boolean;
  daysSince: number | null;
  daysUntilEligible: number;
  nextEligibleDate: string | null;
}

export function useEligibility(donorId: string | undefined) {
  const [status, setStatus] = useState<EligibilityStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!donorId) return;

    const checkEligibility = async () => {
      setLoading(true);
      try {
        const { data, error: rpcError } = await supabase.rpc(
          'check_donor_eligibility',
          { p_donor_id: donorId }
        );

        if (rpcError) throw rpcError;

        // FIX NEW-007: Handle -1 sentinel for "never donated"
        if (data && data.length > 0) {
          const record = data[0];
          const daysSince = record.days_since_donation === -1 
            ? null 
            : record.days_since_donation;

          setStatus({
            isEligible: record.is_eligible,
            daysSince,
            daysUntilEligible: record.days_until_eligible,
            nextEligibleDate: record.next_eligible_date,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, [donorId]);

  return { status, loading, error };
}
