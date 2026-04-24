-- Migration: Add consent fields and date of birth to profiles table
-- This migration adds fields required for privacy policy compliance and age validation

-- Add date_of_birth column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add district column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS district TEXT;

-- Add privacy_consent column (boolean, defaults to false for existing users)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS privacy_consent BOOLEAN DEFAULT FALSE;

-- Add age_declaration column (boolean, defaults to false for existing users)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS age_declaration BOOLEAN DEFAULT FALSE;

-- Add comments to document the purpose of these columns
COMMENT ON COLUMN profiles.date_of_birth IS 'User''s date of birth for age calculation and eligibility verification';
COMMENT ON COLUMN profiles.district IS 'User''s district of residence for geographical filtering';
COMMENT ON COLUMN profiles.privacy_consent IS 'Flag indicating user has agreed to the privacy policy';
COMMENT ON COLUMN profiles.age_declaration IS 'Flag indicating user has declared they are 18+ years old';

-- Create index on district for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_district ON profiles(district);

-- Create index on date_of_birth for age-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON profiles(date_of_birth);
