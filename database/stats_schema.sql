-- Stats tracking table for RoktoKorobi
-- This table stores the live statistics displayed on the landing page

CREATE TABLE IF NOT EXISTS stats (
  id SERIAL PRIMARY KEY,
  verified_donors INTEGER DEFAULT 0,
  lives_saved INTEGER DEFAULT 0,
  districts_covered INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial stats (all zeros)
INSERT INTO stats (verified_donors, lives_saved, districts_covered)
VALUES (0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Create a function to increment verified donor count
CREATE OR REPLACE FUNCTION increment_verified_donor()
RETURNS INTEGER AS $$
BEGIN
  UPDATE stats
  SET verified_donors = verified_donors + 1,
      updated_at = NOW()
  WHERE id = 1;
  RETURN (SELECT verified_donors FROM stats WHERE id = 1);
END;
$$ LANGUAGE plpgsql;

-- Create a function to increment lives saved
CREATE OR REPLACE FUNCTION increment_lives_saved()
RETURNS INTEGER AS $$
BEGIN
  UPDATE stats
  SET lives_saved = lives_saved + 1,
      updated_at = NOW()
  WHERE id = 1;
  RETURN (SELECT lives_saved FROM stats WHERE id = 1);
END;
$$ LANGUAGE plpgsql;

-- Create a function to increment districts covered (only if district not already counted)
CREATE OR REPLACE FUNCTION increment_district_covered(district_name TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_districts TEXT[];
  new_districts TEXT[];
BEGIN
  -- Get current unique districts from donors table
  SELECT ARRAY(DISTINCT district) INTO current_districts FROM donors WHERE district IS NOT NULL;
  
  -- Update stats with count of unique districts
  UPDATE stats
  SET districts_covered = ARRAY_LENGTH(current_districts, 1),
      updated_at = NOW()
  WHERE id = 1;
  
  RETURN (SELECT districts_covered FROM stats WHERE id = 1);
END;
$$ LANGUAGE plpgsql;

-- Create a function to get current stats
CREATE OR REPLACE FUNCTION get_current_stats()
RETURNS TABLE(
  verified_donors INTEGER,
  lives_saved INTEGER,
  districts_covered INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT verified_donors, lives_saved, districts_covered
  FROM stats
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql;
