-- IP Filter Schema for RoktoKorobi
-- This table stores IP whitelist/blacklist entries for access control

CREATE TABLE IF NOT EXISTS ip_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(45) NOT NULL,
  filter_type VARCHAR(10) NOT NULL CHECK (filter_type IN ('whitelist', 'blacklist')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_ip_filters_ip_address ON ip_filters(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_filters_filter_type ON ip_filters(filter_type);
CREATE INDEX IF NOT EXISTS idx_ip_filters_is_active ON ip_filters(is_active);

-- Function to check if an IP is whitelisted
CREATE OR REPLACE FUNCTION is_ip_whitelisted(p_ip_address VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  is_whitelisted BOOLEAN;
  whitelist_count INTEGER;
BEGIN
  -- Check if any whitelist entries exist
  SELECT COUNT(*) INTO whitelist_count
  FROM ip_filters
  WHERE filter_type = 'whitelist' AND is_active = true;
  
  -- If no whitelist configured, allow all
  IF whitelist_count = 0 THEN
    RETURN true;
  END IF;
  
  -- Check if IP is in whitelist
  SELECT EXISTS(
    SELECT 1 FROM ip_filters
    WHERE ip_address = p_ip_address
    AND filter_type = 'whitelist'
    AND is_active = true
  ) INTO is_whitelisted;
  
  RETURN is_whitelisted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if an IP is blacklisted
CREATE OR REPLACE FUNCTION is_ip_blacklisted(p_ip_address VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM ip_filters
    WHERE ip_address = p_ip_address
    AND filter_type = 'blacklist'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add IP to filter
CREATE OR REPLACE FUNCTION add_ip_filter(
  p_ip_address VARCHAR,
  p_filter_type VARCHAR,
  p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO ip_filters (ip_address, filter_type, created_by)
  VALUES (p_ip_address, p_filter_type, p_created_by)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove IP from filter
CREATE OR REPLACE FUNCTION remove_ip_filter(p_ip_address VARCHAR, p_filter_type VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE ip_filters
  SET is_active = false
  WHERE ip_address = p_ip_address
  AND filter_type = p_filter_type;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all active IP filters
CREATE OR REPLACE FUNCTION get_active_ip_filters()
RETURNS TABLE (
  id UUID,
  ip_address VARCHAR,
  filter_type VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, ip_address, filter_type, created_at, created_by, is_active
  FROM ip_filters
  WHERE is_active = true
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
