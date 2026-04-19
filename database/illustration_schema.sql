-- Create illustrations table
CREATE TABLE IF NOT EXISTS illustrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  section_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  language TEXT NOT NULL CHECK (language IN ('en', 'bn'))
);

-- Create illustration_sections table for the 35 educational sections
CREATE TABLE IF NOT EXISTS illustration_sections (
  id INTEGER PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

-- Insert the 35 educational sections
INSERT INTO illustration_sections (id, name_en, name_bn, order_index) VALUES
(1, 'Eligibility Requirements', 'যোগ্যতার প্রয়োজনীয়তা', 1),
(2, 'Before Donation', 'রক্তদানের আগে', 2),
(3, 'The Donation Process', 'রক্তদান প্রক্রিয়া', 3),
(4, 'After Donation', 'রক্তদানের পরে', 4),
(5, 'Benefits of Blood Donation', 'রক্তদানের সুবিধা', 5),
(6, 'Common Myths & Facts', 'সাধারণ মিথ ও তথ্য', 6),
(7, 'FAQ', 'সাধারণ প্রশ্নাবলী', 7),
(8, 'Blood Types Explained', 'রক্তের গ্রুপ ব্যাখ্যা', 8),
(9, 'Emergency Blood Donation', 'জরুরি রক্তদান', 9),
(10, 'Finding Donation Centers', 'রক্তদান কেন্দ্র খুঁজুন', 10),
(11, 'Blood Donation Drives', 'রক্তদান ক্যাম্প', 11),
(12, 'Rare Blood Types', 'বিরল রক্তের গ্রুপ', 12),
(13, 'First-Time Donor Guide', 'প্রথমবার দাতা গাইড', 13),
(14, 'Blood Components Explained', 'রক্তের উপাদান ব্যাখ্যা', 14),
(15, 'Donor Stories/Testimonials', 'দাতাদের গল্প', 15),
(16, 'Quick Reference Cards', 'দ্রুত রেফারেন্স কার্ড', 16),
(17, 'Interactive Elements', 'ইন্টারঅ্যাক্টিভ উপাদান', 17),
(18, 'Downloadable Resources', 'ডাউনলোডযোগ্য সম্পদ', 18),
(19, 'Gamification', 'গেমিফিকেশন', 19),
(20, 'Social Features', 'সামাজিক বৈশিষ্ট্য', 20),
(21, 'For Organizations', 'সংস্থার জন্য', 21),
(22, 'Technical Information', 'প্রযুক্তিগত তথ্য', 22),
(23, 'Special Populations', 'বিশেষ জনগোষ্ঠী', 23),
(24, 'The Science Behind Blood Donation', 'রক্তদানের বিজ্ঞান', 24),
(25, 'Pre-Donation Deep Preparation', 'রক্তদানের আগে গভীর প্রস্তুতি', 25),
(26, 'During Donation', 'রক্তদানের সময়', 26),
(27, 'Immediate Post-Donation Care', 'রক্তদানের পর তাৎক্ষণিক যত্ন', 27),
(28, 'First 24 Hours After Donation', 'রক্তদানের পর প্রথম ২৪ ঘন্টা', 28),
(29, 'Common Side Effects & Solutions', 'সাধারণ পার্শ্ব প্রতিক্রিয়া ও সমাধান', 29),
(30, 'Long-Term Health Impact', 'দীর্ঘমেয়াদী স্বাস্থ্য প্রভাব', 30),
(31, 'Medications That Affect Donation', 'ওষুধ যা রক্তদানকে প্রভাবিত করে', 31),
(32, 'Special Situations', 'বিশেষ পরিস্থিতি', 32),
(33, 'Bangladesh-Specific Information', 'বাংলাদেশ-নির্দিষ্ট তথ্য', 33),
(34, 'Myths vs Scientific Facts', 'মিথ বনাম বৈজ্ঞানিক তথ্য', 34),
(35, 'Emergency Response', 'জরুরি প্রতিক্রিয়া', 35);

-- Create user_favorites table for illustrations
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  illustration_id UUID NOT NULL REFERENCES illustrations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, illustration_id)
);

-- Create blog_favorites table for blog posts
CREATE TABLE IF NOT EXISTS blog_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blog_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, blog_id)
);

-- Enable RLS on all tables
ALTER TABLE illustrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE illustration_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for illustrations
CREATE POLICY "Public can view approved illustrations" ON illustrations
FOR SELECT USING (status = 'approved');

CREATE POLICY "Super admin can upload illustrations" ON illustrations
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Admin with permission can upload illustrations" ON illustrations
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
    AND profiles.can_upload_illustrations = true
  )
);

CREATE POLICY "Super admin can update any illustration" ON illustrations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Admin can update their own pending illustrations" ON illustrations
FOR UPDATE USING (
  uploaded_by = auth.uid()
  AND status = 'pending'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Super admin can delete any illustration" ON illustrations
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Admin can delete their own rejected illustrations" ON illustrations
FOR DELETE USING (
  uploaded_by = auth.uid()
  AND status = 'rejected'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- RLS Policies for illustration_sections (public read only)
CREATE POLICY "Public can view illustration sections" ON illustration_sections
FOR SELECT USING (true);

-- RLS Policies for user_favorites
CREATE POLICY "Users can manage their own favorites" ON user_favorites
FOR ALL USING (user_id = auth.uid());

-- RLS Policies for blog_favorites
CREATE POLICY "Users can manage their own blog favorites" ON blog_favorites
FOR ALL USING (user_id = auth.uid());

-- Create trigger to auto-approve super admin illustration uploads
CREATE OR REPLACE FUNCTION auto_approve_super_admin_illustration()
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

CREATE TRIGGER auto_approve_illustration_trigger
BEFORE INSERT ON illustrations
FOR EACH ROW
EXECUTE FUNCTION auto_approve_super_admin_illustration();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_illustrations_updated_at
BEFORE UPDATE ON illustrations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_illustrations_status ON illustrations(status);
CREATE INDEX IF NOT EXISTS idx_illustrations_section ON illustrations(section_id);
CREATE INDEX IF NOT EXISTS idx_illustrations_uploaded_by ON illustrations(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_favorites_user ON blog_favorites(user_id);
