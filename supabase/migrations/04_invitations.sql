-- ==========================================
-- 04_invitations.sql
-- ELIMU RDC - Account Invitations & Roles
-- ==========================================

-- 1. Create table account_invitations
CREATE TABLE IF NOT EXISTS public.account_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(8) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'teacher', 'secretariat', 'parent', 'tresorerie', 'proviseur'
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  intended_name VARCHAR(255) NOT NULL,
  intended_email VARCHAR(255),
  intended_phone VARCHAR(50),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE, -- Only for parents
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- 2. RLS Policies for account_invitations
ALTER TABLE public.account_invitations ENABLE ROW LEVEL SECURITY;

-- Allow 'direction' or 'secretariat' to insert for their own school
CREATE POLICY "Staff can insert invitations for their school"
ON public.account_invitations
FOR INSERT
WITH CHECK (
  school_id = get_user_school_id() 
  AND (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'direction' OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'secretariat'
  )
);

-- Allow 'direction' or 'secretariat' to read invitations for their own school
CREATE POLICY "Staff can read invitations for their school"
ON public.account_invitations
FOR SELECT
USING (
  school_id = get_user_school_id()
  AND (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'direction' OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'secretariat'
  )
);



-- 3. RPC to redeem an invitation (called after auth.signUp)
CREATE OR REPLACE FUNCTION redeem_invitation(p_code VARCHAR)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_invitation RECORD;
  v_existing_user RECORD;
  v_children JSONB;
BEGIN
  -- 1. Get current authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Find and validate invitation
  SELECT * INTO v_invitation FROM public.account_invitations WHERE code = p_code FOR UPDATE;
  
  IF v_invitation IS NULL THEN
    RAISE EXCEPTION 'Code d''invitation invalide';
  END IF;

  IF v_invitation.used THEN
    RAISE EXCEPTION 'Ce code d''invitation a déjà été utilisé';
  END IF;

  -- 3. Check if user already has a role
  SELECT * INTO v_existing_user FROM public.users WHERE id = v_user_id;

  IF FOUND THEN
    RAISE EXCEPTION 'L''utilisateur appartient déjà à une école';
  END IF;

  -- 4. Create the user record
  IF v_invitation.role = 'parent' THEN
    -- Parents have children_ids
    v_children := jsonb_build_array(v_invitation.student_id);
    
    INSERT INTO public.users (
      id, school_id, name, email, phone, role, children_ids
    ) VALUES (
      v_user_id, v_invitation.school_id, v_invitation.intended_name, v_invitation.intended_email, v_invitation.intended_phone, 'parent', v_children
    );
  ELSE
    -- Other roles
    INSERT INTO public.users (
      id, school_id, name, email, phone, role
    ) VALUES (
      v_user_id, v_invitation.school_id, v_invitation.intended_name, v_invitation.intended_email, v_invitation.intended_phone, v_invitation.role
    );
  END IF;

  -- 5. Mark invitation as used
  UPDATE public.account_invitations 
  SET used = true, used_at = NOW() 
  WHERE id = v_invitation.id;

  -- 6. Return context for frontend
  RETURN jsonb_build_object(
    'role', v_invitation.role,
    'school_id', v_invitation.school_id
  );
END;
$$;


-- 4. RPC to securely invite or link a parent (called by Staff)
CREATE OR REPLACE FUNCTION invite_or_link_parent(
  p_school_id UUID,
  p_student_id UUID,
  p_parent_name VARCHAR,
  p_parent_phone VARCHAR,
  p_parent_email VARCHAR,
  p_code VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_parent RECORD;
  v_new_children JSONB;
BEGIN
  -- 1. Check if the user calling this is staff of the school
  IF p_school_id != get_user_school_id() THEN
    RAISE EXCEPTION 'Non autorisé pour cette école';
  END IF;

  -- 2. Find if a parent with this email already exists in this school
  SELECT * INTO v_existing_parent 
  FROM public.users 
  WHERE email = p_parent_email AND school_id = p_school_id AND role = 'parent';

  IF FOUND THEN
    -- 3a. Update existing parent by appending the new student_id
    -- Ensure children_ids is not null
    IF v_existing_parent.children_ids IS NULL THEN
      v_new_children := jsonb_build_array(p_student_id);
    ELSE
      -- Add student_id only if it's not already in the array
      IF NOT (v_existing_parent.children_ids @> to_jsonb(p_student_id)) THEN
        v_new_children := v_existing_parent.children_ids || jsonb_build_array(p_student_id);
      ELSE
        v_new_children := v_existing_parent.children_ids;
      END IF;
    END IF;

    UPDATE public.users 
    SET children_ids = v_new_children 
    WHERE id = v_existing_parent.id;

    RETURN jsonb_build_object(
      'action', 'linked',
      'message', 'Le compte parent existant a été mis à jour avec le nouvel élève.'
    );
  ELSE
    -- 3b. Insert a new invitation
    INSERT INTO public.account_invitations (
      code, role, school_id, intended_name, intended_email, intended_phone, student_id
    ) VALUES (
      p_code, 'parent', p_school_id, p_parent_name, p_parent_email, p_parent_phone, p_student_id
    );

    RETURN jsonb_build_object(
      'action', 'invited',
      'code', p_code,
      'message', 'Nouvelle invitation générée.'
    );
  END IF;
END;
$$;
