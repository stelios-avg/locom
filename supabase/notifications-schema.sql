-- Notifications Schema
-- Run this SQL in Supabase SQL Editor to add notifications

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_post', 'new_comment', 'post_approved', 'post_rejected', 'mention')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to create notification for nearby users when post is created
CREATE OR REPLACE FUNCTION notify_nearby_users()
RETURNS TRIGGER AS $$
DECLARE
  nearby_user RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Only notify for approved posts
  IF NEW.status = 'approved' AND NEW.post_type = 'feed' THEN
    notification_title := 'Νέα Δημοσίευση στην Περιοχή σας';
    notification_message := 'Ένας γείτονας μόλις δημοσίευσε κάτι κοντά σας!';
    
    -- Find users within 5km radius (you can adjust this)
    FOR nearby_user IN
      SELECT DISTINCT p.user_id
      FROM profiles p
      WHERE p.user_id != NEW.user_id
        AND p.latitude IS NOT NULL
        AND p.longitude IS NOT NULL
        AND NEW.latitude IS NOT NULL
        AND NEW.longitude IS NOT NULL
        AND (
          -- Calculate distance (simplified - using bounding box for performance)
          ABS(p.latitude - NEW.latitude) < 0.05 -- ~5km
          AND ABS(p.longitude - NEW.longitude) < 0.05
        )
    LOOP
      -- Insert notification
      INSERT INTO notifications (user_id, type, title, message, post_id)
      VALUES (
        nearby_user.user_id,
        'new_post',
        notification_title,
        notification_message,
        NEW.id
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notifications when post is created/approved
DROP TRIGGER IF EXISTS on_post_created_notify ON posts;
CREATE TRIGGER on_post_created_notify
  AFTER INSERT OR UPDATE OF status ON posts
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION notify_nearby_users();

-- Function to create notification when comment is added
CREATE OR REPLACE FUNCTION notify_post_owner_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify post owner (except if they commented on their own post)
  IF EXISTS (
    SELECT 1 FROM posts 
    WHERE id = NEW.post_id 
    AND user_id != NEW.user_id
  ) THEN
    INSERT INTO notifications (user_id, type, title, message, post_id, comment_id)
    SELECT 
      p.user_id,
      'new_comment',
      'Νέο Σχόλιο',
      'Κάποιος σχολίασε τη δημοσίευση σας',
      NEW.post_id,
      NEW.id
    FROM posts p
    WHERE p.id = NEW.post_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for comment notifications
DROP TRIGGER IF EXISTS on_comment_created_notify ON comments;
CREATE TRIGGER on_comment_created_notify
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_owner_on_comment();

