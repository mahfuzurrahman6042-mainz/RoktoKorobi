-- Add privacy features to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_phone_publicly BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anonymous_donor BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_export_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_export_url TEXT;

-- Add privacy settings to blood_requests table
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS anonymous_request BOOLEAN DEFAULT false;
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS phone_visible_to_donor BOOLEAN DEFAULT false;

-- Comments for documentation
COMMENT ON COLUMN profiles.show_phone_publicly IS 'Whether to show phone number publicly (without accepting request)';
COMMENT ON COLUMN profiles.anonymous_donor IS 'Whether the donor wants to remain anonymous';
COMMENT ON COLUMN profiles.data_export_requested_at IS 'Timestamp when user requested data export';
COMMENT ON COLUMN profiles.data_export_url IS 'URL to download exported data';
COMMENT ON COLUMN blood_requests.anonymous_request IS 'Whether the requester wants to remain anonymous';
COMMENT ON COLUMN blood_requests.phone_visible_to_donor IS 'Whether phone is visible to accepted donor';
