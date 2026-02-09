-- Access pass codes for complimentary "Power" tier grants
-- Use cases: friends, family, promoters, partners

CREATE TABLE IF NOT EXISTS public.access_pass_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash TEXT NOT NULL UNIQUE,
  code_preview TEXT NOT NULL,
  label TEXT NOT NULL,
  audience_tag TEXT NOT NULL DEFAULT 'custom'
    CHECK (audience_tag IN ('friend', 'family', 'promoter', 'partner', 'custom')),
  access_reason TEXT NOT NULL,
  grant_tier TEXT NOT NULL DEFAULT 'power'
    CHECK (grant_tier IN ('power')),
  max_redemptions INTEGER NOT NULL DEFAULT 1 CHECK (max_redemptions > 0),
  redeemed_count INTEGER NOT NULL DEFAULT 0 CHECK (redeemed_count >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_access_pass_codes_active ON public.access_pass_codes(active);
CREATE INDEX IF NOT EXISTS idx_access_pass_codes_expires_at ON public.access_pass_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_access_pass_codes_audience ON public.access_pass_codes(audience_tag);

CREATE TABLE IF NOT EXISTS public.access_pass_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_pass_code_id UUID NOT NULL REFERENCES public.access_pass_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (access_pass_code_id, user_id),
  UNIQUE (access_pass_code_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_access_pass_redemptions_user ON public.access_pass_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_access_pass_redemptions_code ON public.access_pass_redemptions(access_pass_code_id);

ALTER TABLE public.access_pass_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_pass_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view access pass codes" ON public.access_pass_codes;
CREATE POLICY "Admins can view access pass codes"
ON public.access_pass_codes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view access pass redemptions" ON public.access_pass_redemptions;
CREATE POLICY "Admins can view access pass redemptions"
ON public.access_pass_redemptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view own access pass redemptions" ON public.access_pass_redemptions;
CREATE POLICY "Users can view own access pass redemptions"
ON public.access_pass_redemptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS update_access_pass_codes_updated_at ON public.access_pass_codes;
CREATE TRIGGER update_access_pass_codes_updated_at
BEFORE UPDATE ON public.access_pass_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.rpc_redeem_access_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile_id UUID;
  v_code_hash TEXT;
  v_code public.access_pass_codes%ROWTYPE;
  v_existing_redemption UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'AUTH_REQUIRED',
      'message', 'Please sign in to redeem an access code.'
    );
  END IF;

  IF p_code IS NULL OR btrim(p_code) = '' THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'INVALID_CODE',
      'message', 'Please enter a valid access code.'
    );
  END IF;

  SELECT id
  INTO v_profile_id
  FROM public.profiles
  WHERE user_id = v_user_id
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'PROFILE_NOT_FOUND',
      'message', 'Profile not found for this account.'
    );
  END IF;

  v_code_hash := encode(digest(upper(btrim(p_code)), 'sha256'), 'hex');

  SELECT *
  INTO v_code
  FROM public.access_pass_codes
  WHERE code_hash = v_code_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'INVALID_CODE',
      'message', 'That access code is not valid.'
    );
  END IF;

  IF v_code.active IS NOT TRUE THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'INACTIVE_CODE',
      'message', 'That access code is no longer active.'
    );
  END IF;

  IF v_code.expires_at IS NOT NULL AND v_code.expires_at <= now() THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'EXPIRED_CODE',
      'message', 'That access code has expired.'
    );
  END IF;

  SELECT id
  INTO v_existing_redemption
  FROM public.access_pass_redemptions
  WHERE access_pass_code_id = v_code.id
    AND user_id = v_user_id
  LIMIT 1;

  IF v_existing_redemption IS NOT NULL THEN
    RETURN jsonb_build_object(
      'ok', true,
      'code', 'ALREADY_REDEEMED',
      'message', 'This code has already been redeemed on your account.',
      'data', jsonb_build_object(
        'tier', v_code.grant_tier,
        'access_reason', v_code.access_reason
      )
    );
  END IF;

  IF v_code.redeemed_count >= v_code.max_redemptions THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'CODE_EXHAUSTED',
      'message', 'That access code has reached its redemption limit.'
    );
  END IF;

  INSERT INTO public.access_pass_redemptions (
    access_pass_code_id,
    user_id,
    profile_id
  )
  VALUES (
    v_code.id,
    v_user_id,
    v_profile_id
  );

  UPDATE public.access_pass_codes
  SET redeemed_count = redeemed_count + 1
  WHERE id = v_code.id;

  UPDATE public.profiles
  SET
    free_premium_access = true,
    access_reason = v_code.access_reason,
    subscription_status = 'active',
    subscription_tier = 'power'
  WHERE id = v_profile_id;

  RETURN jsonb_build_object(
    'ok', true,
    'code', 'REDEEMED',
    'message', 'Power access is now active on your account.',
    'data', jsonb_build_object(
      'tier', v_code.grant_tier,
      'access_reason', v_code.access_reason,
      'label', v_code.label
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_redeem_access_code(TEXT) TO authenticated;
