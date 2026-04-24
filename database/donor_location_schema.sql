-- Donor Location Tracking Schema
-- Add location tracking fields to profiles table

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS area_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS area_lat FLOAT,
ADD COLUMN IF NOT EXISTS area_lon FLOAT,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_donated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_donations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_lat FLOAT,
ADD COLUMN IF NOT EXISTS current_lon FLOAT,
ADD COLUMN IF NOT EXISTS is_gps_active BOOLEAN DEFAULT false;

-- Add comments to explain the fields
COMMENT ON COLUMN profiles.area_name IS 'Donor registered area name (e.g., Baunia, Uttara)';
COMMENT ON COLUMN profiles.area_lat IS 'Latitude of donor registered area';
COMMENT ON COLUMN profiles.area_lon IS 'Longitude of donor registered area';
COMMENT ON COLUMN profiles.is_available IS 'Whether donor is available for donation (false for 90 days after donation)';
COMMENT ON COLUMN profiles.last_donated_at IS 'Timestamp of last donation';
COMMENT ON COLUMN profiles.total_donations IS 'Total number of donations completed';
COMMENT ON COLUMN profiles.current_lat IS 'Current live GPS latitude (for tracking)';
COMMENT ON COLUMN profiles.current_lon IS 'Current live GPS longitude (for tracking)';
COMMENT ON COLUMN profiles.is_gps_active IS 'Whether donor is currently sharing live GPS';

-- Add index for faster queries on available donors
CREATE INDEX IF NOT EXISTS idx_profiles_available ON profiles(is_available) WHERE is_donor = true;
