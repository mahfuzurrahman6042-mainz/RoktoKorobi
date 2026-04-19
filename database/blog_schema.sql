-- Blog/News feature schema for organizations and clubs

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_bn TEXT, -- Bengali title
  content TEXT NOT NULL,
  content_bn TEXT, -- Bengali content
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  organization TEXT, -- Organization/club name
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published posts
CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts
  FOR SELECT
  USING (is_published = true);

-- Policy: Org advocates and admins can create posts
CREATE POLICY "Org advocates and admins can create posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'org_advocate' OR profiles.role = 'admin' OR profiles.role = 'super_admin')
    )
  );

-- Policy: Authors can update their own posts
CREATE POLICY "Authors can update their own posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'org_advocate' OR profiles.role = 'admin' OR profiles.role = 'super_admin')
    )
  );

-- Policy: Authors can delete their own posts
CREATE POLICY "Authors can delete their own posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Create index for faster queries
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
