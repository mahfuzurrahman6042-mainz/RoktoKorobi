-- Add email verification fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP WITH TIME ZONE;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email_verification_token 
ON profiles(email_verification_token) 
WHERE email_verification_token IS NOT NULL;

-- Function to generate verification token
CREATE OR REPLACE FUNCTION generate_email_verification_token(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Generate random token (32 characters)
  token := encode(gen_random_bytes(16), 'hex');
  
  -- Set expiration to 24 hours from now
  expires_at := NOW() + INTERVAL '24 hours';
  
  -- Update user record
  UPDATE profiles 
  SET 
    email_verification_token = token,
    email_verification_expires_at = expires_at,
    email_verified = FALSE
  WHERE id = user_id;
  
  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify email
CREATE OR REPLACE FUNCTION verify_email(token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles 
  SET 
    email_verified = TRUE,
    email_verification_token = NULL,
    email_verification_expires_at = NULL
  WHERE 
    email_verification_token = token 
    AND email_verification_expires_at > NOW();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if email is verified
CREATE OR REPLACE FUNCTION is_email_verified(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT email_verified FROM profiles WHERE id = user_id),
    FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
