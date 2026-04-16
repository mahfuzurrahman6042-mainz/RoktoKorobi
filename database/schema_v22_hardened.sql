-- database/schema_v22_hardened.sql
-- Replace the check_donor_eligibility function

CREATE OR REPLACE FUNCTION check_donor_eligibility(p_donor_id UUID)
RETURNS TABLE (
  is_eligible          BOOLEAN,
  days_since_donation  INTEGER,  -- FIX NEW-007: -1 = never donated (was NULL)
  days_until_eligible  INTEGER,
  next_eligible_date   DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(EXTRACT(DAY FROM NOW()-last_d)::INT >= 90, true),
    -- FIX NEW-007: Return -1 sentinel instead of NULL::INT (which was a no-op)
    COALESCE(EXTRACT(DAY FROM NOW()-last_d)::INT, -1),
    GREATEST(0, 90 - COALESCE(
      EXTRACT(DAY FROM NOW()-last_d)::INT, 0
    )),
    (last_d + INTERVAL '90 days')::DATE
  FROM (
    SELECT MAX(created_at) AS last_d
    FROM donations
    WHERE donor_id = p_donor_id AND status = 'completed'
  ) sub;
END;
$$ LANGUAGE plpgsql;

-- IMPORTANT: Also update useEligibility.ts to handle the -1 sentinel:
--
-- if (data.days_since_donation === -1) {
--   // Never donated — treat as fully eligible
--   setStatus({ isEligible: true, daysSince: null, ... });
-- }
