-- Location Sharing Consent Schema
-- Add location sharing consent field to profiles table

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS location_sharing_consent BOOLEAN DEFAULT false;

-- Add comment to explain the field
COMMENT ON COLUMN profiles.location_sharing_consent IS 'Whether the donor has consented to share their live location with blood request recipients';

-- Add index for faster queries on consent status
CREATE INDEX IF NOT EXISTS idx_profiles_location_consent ON profiles(location_sharing_consent) WHERE is_donor = true;
