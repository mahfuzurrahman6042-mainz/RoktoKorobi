-- Update blog_posts table to add status and uploaded_by fields
ALTER TABLE blog_posts
ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN uploaded_by UUID REFERENCES profiles(id);

-- Update RLS policies for blog_posts
DROP POLICY IF EXISTS "Public can view blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Anyone can read published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Org advocates and admins can create posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON blog_posts;

-- New RLS policies for blog_posts with approval workflow
CREATE POLICY "Public can view approved blog posts" ON blog_posts
FOR SELECT USING (status = 'approved');

CREATE POLICY "Super admin can upload blog posts" ON blog_posts
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Admin with permission can upload blog posts" ON blog_posts
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.can_upload_blogs = true
  )
);

CREATE POLICY "Super admin can update any blog post" ON blog_posts
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Admin can update their own pending blog posts" ON blog_posts
FOR UPDATE USING (
  uploaded_by = auth.uid()
  AND status = 'pending'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Super admin can delete any blog post" ON blog_posts
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Admin can delete their own rejected blog posts" ON blog_posts
FOR DELETE USING (
  uploaded_by = auth.uid()
  AND status = 'rejected'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Add permission flags to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS can_upload_illustrations BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_upload_blogs BOOLEAN DEFAULT FALSE;

-- Create trigger to auto-approve super admin uploads
CREATE OR REPLACE FUNCTION auto_approve_super_admin_blog()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = NEW.uploaded_by
    AND profiles.role = 'super_admin'
  ) THEN
    NEW.status := 'approved';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_approve_blog_trigger
  BEFORE INSERT ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_super_admin_blog();
