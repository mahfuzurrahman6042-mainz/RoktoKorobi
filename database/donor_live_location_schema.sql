-- Donor Live Location Table
-- Separate table for real-time GPS tracking (auto-cleanup)

CREATE TABLE IF NOT EXISTS donor_live_location (
    donor_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE donor_live_location IS 'Real-time GPS tracking for donors (auto-deleted after 10 minutes of inactivity)';
COMMENT ON COLUMN donor_live_location.donor_id IS 'Donor profile ID (unique - one location per donor)';
COMMENT ON COLUMN donor_live_location.lat IS 'Current GPS latitude';
COMMENT ON COLUMN donor_live_location.lng IS 'Current GPS longitude';
COMMENT ON COLUMN donor_live_location.updated_at IS 'Last location update timestamp';

-- Create index for updated_at (for cleanup queries)
CREATE INDEX IF NOT EXISTS idx_donor_live_location_updated_at ON donor_live_location(updated_at);

-- Function to auto-delete stale locations (older than 10 minutes)
CREATE OR REPLACE FUNCTION cleanup_stale_donor_locations()
RETURNS void AS $$
BEGIN
    DELETE FROM donor_live_location
    WHERE updated_at < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql;

-- Comment on function
COMMENT ON FUNCTION cleanup_stale_donor_locations IS 'Auto-delete donor locations older than 10 minutes';
