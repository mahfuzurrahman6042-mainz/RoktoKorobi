-- User Comments/Testimonials Schema

-- Create user_comments table
CREATE TABLE IF NOT EXISTS user_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  comment TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_comments
ALTER TABLE user_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved comments
CREATE POLICY "Anyone can read approved comments"
  ON user_comments
  FOR SELECT
  USING (is_approved = true);

-- Policy: Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON user_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Super admin can update comments (approve/reject)
CREATE POLICY "Super admin can update comments"
  ON user_comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Policy: Super admin can delete comments
CREATE POLICY "Super admin can delete comments"
  ON user_comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Create indexes for faster queries
CREATE INDEX idx_user_comments_created_at ON user_comments(created_at DESC);
CREATE INDEX idx_user_comments_approved ON user_comments(is_approved);
CREATE INDEX idx_user_comments_user ON user_comments(user_id);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_user_comments_updated_at
  BEFORE UPDATE ON user_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
