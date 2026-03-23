-- ============================================================================
-- Locom — RLS security hardening (run in Supabase SQL Editor after other schemas)
-- ============================================================================
-- Fixes:
-- 1) Prevent users from self-granting admin / editing Stripe & plan fields on profiles
-- 2) Post visibility: hidden + moderation status; block fake "approved" on insert
-- 3) Comments only visible if parent post is visible
-- 4) Remove client INSERT on notifications (triggers + service role still work)
-- 5) Read-only neighborhoods for authenticated users
-- 6) Subscriptions: no client writes (service role / webhooks only)
--
-- Idempotent: uses DROP IF EXISTS / CREATE OR REPLACE where possible.
--
-- Prerequisites: schema.sql, moderation-schema.sql, reports-schema.sql,
-- notifications-schema.sql, pro-subscription-schema.sql (or equivalent tables).
-- ============================================================================

ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;

-- ---------------------------------------------------------------------------
-- Helper: current JWT user is admin (SECURITY DEFINER, fixed search_path)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT p.is_admin FROM public.profiles p WHERE p.user_id = auth.uid() LIMIT 1),
    false
  );
$$;

-- NOTE: Do not use a helper that SELECTs from `posts` inside the posts table policy —
-- that causes infinite RLS recursion. Use column-only checks on the current row instead.

-- ---------------------------------------------------------------------------
-- profiles: lock privileged columns for non-admins
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF COALESCE(NEW.is_admin, false) THEN
      NEW.is_admin := false;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF public.current_user_is_admin() THEN
      RETURN NEW;
    END IF;

    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Cannot change profile user_id';
    END IF;

    NEW.is_admin := OLD.is_admin;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
    NEW.plan := OLD.plan;
    NEW.is_pro := OLD.is_pro;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_protect_privileged ON public.profiles;
CREATE TRIGGER trg_profiles_protect_privileged
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_columns();

-- ---------------------------------------------------------------------------
-- posts: lock moderation fields + owner-only status rules for non-admins
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_post_moderation_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;

  IF public.current_user_is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Cannot change post owner';
  END IF;

  NEW.moderation_notes := OLD.moderation_notes;
  NEW.moderated_by := OLD.moderated_by;
  NEW.moderated_at := OLD.moderated_at;

  -- Only admins may hide/unhide via DB
  NEW.hidden := OLD.hidden;

  -- Non-admin: may only change status to "sold" on marketplace listings
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'sold'
       AND OLD.post_type = 'marketplace'
       AND (OLD.status IS NULL OR OLD.status IN ('approved', 'pending', 'sold')) THEN
      -- allowed
      NULL;
    ELSE
      NEW.status := OLD.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_post_insert_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.current_user_is_admin() THEN
    RETURN NEW;
  END IF;
  NEW.hidden := COALESCE(NEW.hidden, false);
  IF NEW.hidden THEN
    NEW.hidden := false;
  END IF;
  NEW.moderation_notes := NULL;
  NEW.moderated_by := NULL;
  NEW.moderated_at := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_posts_protect_moderation ON public.posts;
CREATE TRIGGER trg_posts_protect_moderation
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_post_moderation_columns();

DROP TRIGGER IF EXISTS trg_posts_protect_insert ON public.posts;
CREATE TRIGGER trg_posts_protect_insert
  BEFORE INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_post_insert_columns();

-- ---------------------------------------------------------------------------
-- Drop old policies (names from schema.sql + moderation + reports)
-- ---------------------------------------------------------------------------

-- profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- posts
DROP POLICY IF EXISTS "Users can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view approved posts or own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

-- comments
DROP POLICY IF EXISTS "Users can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

-- notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;

-- neighborhoods (may not exist yet)
DROP POLICY IF EXISTS "Authenticated users can read neighborhoods" ON public.neighborhoods;

-- subscriptions (replace if we add write policies later)
DROP POLICY IF EXISTS "Users can view their subscriptions" ON public.subscriptions;

-- New policy names (re-runnable migration)
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

DROP POLICY IF EXISTS "posts_select_visible" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_own_realistic_status" ON public.posts;
DROP POLICY IF EXISTS "posts_update_owner_or_admin" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_owner_or_admin" ON public.posts;

DROP POLICY IF EXISTS "comments_select_if_post_visible" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_own_on_visible_post" ON public.comments;
DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
DROP POLICY IF EXISTS "comments_delete_own_or_admin" ON public.comments;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;

DROP POLICY IF EXISTS "neighborhoods_select_authenticated" ON public.neighborhoods;

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;

-- ---------------------------------------------------------------------------
-- profiles — RLS
-- ---------------------------------------------------------------------------
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- posts — RLS
-- ---------------------------------------------------------------------------
CREATE POLICY "posts_select_visible"
  ON public.posts FOR SELECT
  TO authenticated
  USING (
    public.current_user_is_admin()
    OR posts.user_id = auth.uid()
    OR (
      NOT COALESCE(posts.hidden, false)
      AND (posts.status IS NULL OR posts.status IN ('approved', 'sold'))
    )
  );

CREATE POLICY "posts_insert_own_realistic_status"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      status IS NULL
      OR status = 'pending'
      OR (status = 'approved' AND public.current_user_is_admin())
    )
  );

CREATE POLICY "posts_update_owner_or_admin"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.current_user_is_admin())
  WITH CHECK (auth.uid() = user_id OR public.current_user_is_admin());

CREATE POLICY "posts_delete_owner_or_admin"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.current_user_is_admin());

-- ---------------------------------------------------------------------------
-- comments — RLS (inherit post visibility)
-- ---------------------------------------------------------------------------
CREATE POLICY "comments_select_if_post_visible"
  ON public.comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = comments.post_id
        AND (
          public.current_user_is_admin()
          OR p.user_id = auth.uid()
          OR (
            NOT COALESCE(p.hidden, false)
            AND (p.status IS NULL OR p.status IN ('approved', 'sold'))
          )
        )
    )
    AND (
      NOT COALESCE(comments.hidden, false)
      OR comments.user_id = auth.uid()
      OR public.current_user_is_admin()
    )
  );

CREATE POLICY "comments_insert_own_on_visible_post"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = comments.post_id
        AND (
          public.current_user_is_admin()
          OR p.user_id = auth.uid()
          OR (
            NOT COALESCE(p.hidden, false)
            AND (p.status IS NULL OR p.status IN ('approved', 'sold'))
          )
        )
    )
  );

CREATE POLICY "comments_update_own"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete_own_or_admin"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.current_user_is_admin());

-- ---------------------------------------------------------------------------
-- notifications — read/update own; no client INSERT (triggers use definer)
-- ---------------------------------------------------------------------------
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- neighborhoods — read-only for app users
-- ---------------------------------------------------------------------------
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "neighborhoods_select_authenticated"
  ON public.neighborhoods FOR SELECT
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- subscriptions — own row read only; writes via service role (webhooks)
-- ---------------------------------------------------------------------------
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for authenticated → denied (use service role).

-- ============================================================================
-- Done. Re-run your app and test: post create, comment, marketplace sold, admin.
-- ============================================================================
