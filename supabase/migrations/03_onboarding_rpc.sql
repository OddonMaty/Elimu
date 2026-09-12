-- ==========================================
-- 03_onboarding_rpc.sql
-- ELIMU RDC - Onboarding RPC (Security Definer)
-- ==========================================

-- Function to create a school and link the admin user in one transaction
-- SECURITY DEFINER bypasses RLS policies to solve the bootstrap problem
CREATE OR REPLACE FUNCTION create_school_with_admin(
  p_school_name VARCHAR,
  p_city VARCHAR,
  p_province VARCHAR,
  p_address TEXT,
  p_phone VARCHAR,
  p_email VARCHAR,
  p_type VARCHAR,
  p_subscription_plan_id VARCHAR,
  p_admin_name VARCHAR,
  p_admin_phone VARCHAR,
  p_admin_title VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_school_id UUID;
  v_user_exists BOOLEAN;
BEGIN
  -- 1. Get the current authenticated user's ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Check if the user already exists in the public.users table
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = v_user_id) INTO v_user_exists;
  IF v_user_exists THEN
    RAISE EXCEPTION 'User already belongs to a school';
  END IF;

  -- 3. Insert the new school
  INSERT INTO public.schools (
    name, city, province, address, phone, email, type, subscription_plan_id
  ) VALUES (
    p_school_name, p_city, p_province, p_address, p_phone, p_email, p_type, p_subscription_plan_id
  ) RETURNING id INTO v_school_id;

  -- 4. Insert the user as the admin of the new school
  INSERT INTO public.users (
    id, school_id, name, email, role, phone, admin_title
  ) VALUES (
    v_user_id, v_school_id, p_admin_name, p_email, 'direction', p_admin_phone, p_admin_title
  );

  -- 5. Return the newly created school's ID
  RETURN v_school_id;
END;
$$;
