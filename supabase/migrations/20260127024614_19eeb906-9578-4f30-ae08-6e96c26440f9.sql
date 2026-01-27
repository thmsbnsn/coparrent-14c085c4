-- Fix: Update accept_coparent_invitation to properly link co-parents to family_members table
-- This ensures both parents share the same family_id and inherit entitlements correctly

CREATE OR REPLACE FUNCTION public.accept_coparent_invitation(_token uuid, _acceptor_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_invitation record;
  v_acceptor_profile record;
  v_inviter_profile record;
  v_acceptor_email text;
  v_family_id uuid;
BEGIN
  -- Get acceptor's email from auth.users
  SELECT email INTO v_acceptor_email
  FROM auth.users
  WHERE id = _acceptor_user_id;
  
  IF v_acceptor_email IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Get invitation
  SELECT * INTO v_invitation
  FROM invitations
  WHERE token = _token
  AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or already used invitation');
  END IF;
  
  -- Check if expired
  IF v_invitation.expires_at < now() THEN
    RETURN json_build_object('success', false, 'error', 'Invitation has expired');
  END IF;
  
  -- CRITICAL: Verify email matches the invitation
  IF LOWER(v_invitation.invitee_email) != LOWER(v_acceptor_email) THEN
    RETURN json_build_object('success', false, 'error', 'This invitation was sent to a different email address');
  END IF;
  
  -- Get acceptor profile
  SELECT * INTO v_acceptor_profile
  FROM profiles
  WHERE user_id = _acceptor_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Profile not found');
  END IF;
  
  -- Get inviter profile
  SELECT * INTO v_inviter_profile
  FROM profiles
  WHERE id = v_invitation.inviter_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Inviter profile not found');
  END IF;
  
  -- Update acceptor's profile to link to inviter
  UPDATE profiles
  SET co_parent_id = v_invitation.inviter_id
  WHERE id = v_acceptor_profile.id;
  
  -- Update inviter's profile to link to acceptor
  UPDATE profiles
  SET co_parent_id = v_acceptor_profile.id
  WHERE id = v_invitation.inviter_id;
  
  -- CRITICAL FIX: Get or create family_id from inviter's family_members record
  SELECT family_id INTO v_family_id
  FROM family_members
  WHERE profile_id = v_invitation.inviter_id
  AND status = 'active'
  AND role IN ('parent', 'guardian')
  LIMIT 1;
  
  -- If inviter has no family, create one
  IF v_family_id IS NULL THEN
    INSERT INTO families (name, created_by_user_id)
    VALUES (
      COALESCE(v_inviter_profile.full_name, 'Family') || ' Family',
      v_inviter_profile.user_id
    )
    RETURNING id INTO v_family_id;
    
    -- Add inviter to family_members
    INSERT INTO family_members (user_id, profile_id, family_id, primary_parent_id, role, status)
    VALUES (
      v_inviter_profile.user_id,
      v_invitation.inviter_id,
      v_family_id,
      v_invitation.inviter_id,
      'parent',
      'active'
    )
    ON CONFLICT (user_id, family_id) DO NOTHING;
  END IF;
  
  -- CRITICAL: Add acceptor to the SAME family
  INSERT INTO family_members (user_id, profile_id, family_id, primary_parent_id, role, status, invited_by, accepted_at)
  VALUES (
    _acceptor_user_id,
    v_acceptor_profile.id,
    v_family_id,
    v_invitation.inviter_id,
    'parent',
    'active',
    v_invitation.inviter_id,
    now()
  )
  ON CONFLICT (user_id, family_id) 
  DO UPDATE SET 
    status = 'active',
    role = 'parent',
    accepted_at = now();
  
  -- Mark invitation as accepted
  UPDATE invitations
  SET status = 'accepted', updated_at = now()
  WHERE token = _token;
  
  RETURN json_build_object(
    'success', true,
    'family_id', v_family_id
  );
END;
$function$;