-- Create user_sessions table to track active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

-- Function to check if user has exceeded concurrent session limit
CREATE OR REPLACE FUNCTION check_concurrent_sessions(
  p_user_id UUID,
  p_max_sessions INTEGER DEFAULT 3
)
RETURNS BOOLEAN AS $$
DECLARE
  active_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_count
  FROM user_sessions
  WHERE user_id = p_user_id
    AND is_active = true
    AND expires_at > NOW();
  
  RETURN active_count < p_max_sessions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new session
CREATE OR REPLACE FUNCTION create_user_session(
  p_user_id UUID,
  p_token_hash TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE
)
RETURNS UUID AS $$
DECLARE
  new_session_id UUID;
BEGIN
  INSERT INTO user_sessions (
    user_id,
    session_token_hash,
    ip_address,
    user_agent,
    expires_at
  ) VALUES (
    p_user_id,
    p_token_hash,
    p_ip_address,
    p_user_agent,
    p_expires_at
  ) RETURNING id INTO new_session_id;
  
  RETURN new_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invalidate old sessions (keep only most recent)
CREATE OR REPLACE FUNCTION invalidate_old_sessions(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_sessions
  SET is_active = false
  WHERE user_id = p_user_id
    AND id NOT IN (
      SELECT id FROM user_sessions
      WHERE user_id = p_user_id
      ORDER BY created_at DESC
      LIMIT 3
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invalidate all sessions for a user
CREATE OR REPLACE FUNCTION invalidate_all_user_sessions(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_sessions
  SET is_active = false
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE user_sessions
  SET is_active = false
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
