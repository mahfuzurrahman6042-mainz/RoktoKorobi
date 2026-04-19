-- Account lockout mechanism
-- Track failed login attempts and lock accounts after too many failures

CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS account_lockouts (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  lockout_until TIMESTAMP WITH TIME ZONE NOT NULL,
  failed_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION check_account_lockout(p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM account_lockouts
    WHERE email = p_email
    AND lockout_until > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to record login attempt
CREATE OR REPLACE FUNCTION record_login_attempt(p_email TEXT, p_ip_address TEXT, p_success BOOLEAN)
RETURNS VOID AS $$
BEGIN
  INSERT INTO login_attempts (email, ip_address, success)
  VALUES (p_email, p_ip_address, p_success);
  
  IF NOT p_success THEN
    -- Update failed attempts count
    INSERT INTO account_lockouts (email, lockout_until, failed_attempts)
    VALUES (p_email, NOW() + INTERVAL '15 minutes', 1)
    ON CONFLICT (email) DO UPDATE SET
      failed_attempts = account_lockouts.failed_attempts + 1,
      lockout_until = CASE
        WHEN account_lockouts.failed_attempts >= 4 THEN NOW() + INTERVAL '1 hour'
        WHEN account_lockouts.failed_attempts >= 3 THEN NOW() + INTERVAL '30 minutes'
        WHEN account_lockouts.failed_attempts >= 2 THEN NOW() + INTERVAL '15 minutes'
        ELSE NOW() + INTERVAL '15 minutes'
      END;
  ELSE
    -- Reset failed attempts on successful login
    DELETE FROM account_lockouts WHERE email = p_email;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get remaining lockout time
CREATE OR REPLACE FUNCTION get_lockout_remaining(p_email TEXT)
RETURNS INTEGER AS $$
DECLARE
  remaining_seconds INTEGER;
BEGIN
  SELECT EXTRACT(EPOCH FROM (lockout_until - NOW()))::INTEGER
  INTO remaining_seconds
  FROM account_lockouts
  WHERE email = p_email
  AND lockout_until > NOW();
  
  RETURN COALESCE(remaining_seconds, 0);
END;
$$ LANGUAGE plpgsql;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempt_time);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_email ON account_lockouts(email);
