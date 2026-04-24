-- Privacy Policy Consent Schema for RoktoKorobi
-- This migration adds privacy policy consent tracking to the profiles table

-- Add privacy policy consent timestamp column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS privacy_policy_consent_at TIMESTAMP WITH TIME ZONE;

-- Add privacy policy version column to track which version was accepted
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS privacy_policy_version VARCHAR(20) DEFAULT '1.1';

-- Create index for querying users who have consented
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_consent
ON profiles(privacy_policy_consent_at) WHERE privacy_policy_consent_at IS NOT NULL;

-- Function to update privacy consent timestamp
CREATE OR REPLACE FUNCTION update_privacy_consent(p_user_id UUID, p_version VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET 
    privacy_policy_consent_at = NOW(),
    privacy_policy_version = p_version
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has consented to privacy policy
CREATE OR REPLACE FUNCTION has_privacy_consent(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM profiles
    WHERE id = p_user_id
    AND privacy_policy_consent_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
