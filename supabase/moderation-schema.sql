-- Content Moderation Schema
-- Run this SQL in Supabase SQL Editor to add moderation features

-- Add status column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add moderation notes column
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS moderation_notes TEXT;

-- Add moderated_by column (admin user_id)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id);

-- Add moderated_at timestamp
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- Update RLS policies to only show approved posts (except to admins and post owners)
DROP POLICY IF EXISTS "Users can view all posts" ON posts;
CREATE POLICY "Users can view approved posts or own posts" ON posts
  FOR SELECT USING (
    status = 'approved' 
    OR auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Allow admins to view all posts
CREATE POLICY "Admins can view all posts" ON posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Add is_admin column to profiles (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for admin check
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = is_admin.user_id 
    AND profiles.is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

