-- Row Level Security (RLS) policies for blood_requests table
-- This ensures users can only access their own data or data they're authorized to see

-- Enable RLS on blood_requests table
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view pending blood requests (for donors to see requests they can accept)
CREATE POLICY "Anyone can view pending blood requests"
ON blood_requests FOR SELECT
USING (status = 'pending');

-- Policy: Users can view their own blood requests
CREATE POLICY "Users can view their own blood requests"
ON blood_requests FOR SELECT
USING (
  contact IN (
    SELECT phone FROM profiles WHERE id = auth.uid()
  )
);

-- Policy: Donors can view requests they have accepted
CREATE POLICY "Donors can view their accepted requests"
ON blood_requests FOR SELECT
USING (
  donor_id = auth.uid()
);

-- Policy: Users can insert their own blood requests
CREATE POLICY "Users can insert their own blood requests"
ON blood_requests FOR INSERT
WITH CHECK (
  contact IN (
    SELECT phone FROM profiles WHERE id = auth.uid()
  )
);

-- Policy: Only donors can update blood requests (accepting requests)
CREATE POLICY "Donors can update blood requests"
ON blood_requests FOR UPDATE
USING (
  donor_id = auth.uid() OR
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_donor = true
  )
);

-- Policy: Users can delete their own pending blood requests
CREATE POLICY "Users can delete their own pending requests"
ON blood_requests FOR DELETE
USING (
  status = 'pending' AND
  contact IN (
    SELECT phone FROM profiles WHERE id = auth.uid()
  )
);

-- Policy: Admins can view all blood requests
CREATE POLICY "Admins can view all blood requests"
ON blood_requests FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin' OR role = 'super_admin'
  )
);

-- Policy: Admins can update all blood requests
CREATE POLICY "Admins can update all blood requests"
ON blood_requests FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin' OR role = 'super_admin'
  )
);

-- Policy: Admins can delete any blood requests
CREATE POLICY "Admins can delete any blood requests"
ON blood_requests FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin' OR role = 'super_admin'
  )
);

-- Add comments for documentation
COMMENT ON POLICY "Anyone can view pending blood requests" ON blood_requests IS 'Allows public access to pending requests for donor matching';
COMMENT ON POLICY "Users can view their own blood requests" ON blood_requests IS 'Users can see requests they submitted';
COMMENT ON POLICY "Donors can view their accepted requests" ON blood_requests IS 'Donors can track their accepted requests';
COMMENT ON POLICY "Users can insert their own blood requests" ON blood_requests IS 'Users can submit blood requests';
COMMENT ON POLICY "Donors can update blood requests" ON blood_requests IS 'Donors can accept requests';
COMMENT ON POLICY "Users can delete their own pending requests" ON blood_requests IS 'Users can cancel their pending requests';
COMMENT ON POLICY "Admins can view all blood requests" ON blood_requests IS 'Admins have full read access';
COMMENT ON POLICY "Admins can update all blood requests" ON blood_requests IS 'Admins can modify any request';
COMMENT ON POLICY "Admins can delete any blood requests" ON blood_requests IS 'Admins can delete any request';
