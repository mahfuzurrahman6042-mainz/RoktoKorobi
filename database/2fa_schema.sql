-- Add 2FA fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS totp_secret TEXT,
ADD COLUMN IF NOT EXISTS is_2fa_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS backup_codes TEXT[];

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_2fa_enabled 
ON profiles(is_2fa_enabled) 
WHERE is_2fa_enabled = true;

-- Function to generate backup codes
CREATE OR REPLACE FUNCTION generate_backup_codes(user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  backup_codes TEXT[];
  i INTEGER;
  code TEXT;
BEGIN
  backup_codes := ARRAY[]::TEXT[];
  
  FOR i IN 1..10 LOOP
    code := encode(gen_random_bytes(4), 'hex');
    backup_codes := array_append(backup_codes, code);
  END LOOP;
  
  UPDATE profiles
  SET backup_codes = backup_codes
  WHERE id = user_id;
  
  RETURN backup_codes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to consume a backup code
CREATE OR REPLACE FUNCTION consume_backup_code(user_id UUID, code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  code_index INTEGER;
BEGIN
  -- Find the index of the backup code
  SELECT array_position(backup_codes, code) INTO code_index
  FROM profiles
  WHERE id = user_id;
  
  IF code_index IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Remove the used backup code
  UPDATE profiles
  SET backup_codes = array_remove(backup_codes, code)
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
