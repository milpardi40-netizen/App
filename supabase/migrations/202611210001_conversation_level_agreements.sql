-- Two-sided level negotiation for real-person conversation rooms.
BEGIN;

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS active_level_id integer,
  ADD COLUMN IF NOT EXISTS pending_level_id integer,
  ADD COLUMN IF NOT EXISTS pending_level_requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pending_level_created_at timestamptz;

CREATE OR REPLACE FUNCTION public.request_conversation_level(p_conversation_id uuid, p_level_id integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL OR p_level_id IS NULL OR p_level_id < 0 OR p_level_id > 5 THEN RAISE EXCEPTION 'INVALID_LEVEL'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = p_conversation_id AND user_id = auth.uid()) THEN RAISE EXCEPTION 'NOT_CONVERSATION_MEMBER'; END IF;
  UPDATE public.conversations
  SET pending_level_id = p_level_id, pending_level_requested_by = auth.uid(), pending_level_created_at = pg_catalog.now()
  WHERE id = p_conversation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_conversation_level(p_conversation_id uuid, p_accept boolean)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE requested_level integer; requester uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = p_conversation_id AND user_id = auth.uid()) THEN RAISE EXCEPTION 'NOT_CONVERSATION_MEMBER'; END IF;
  SELECT pending_level_id, pending_level_requested_by INTO requested_level, requester FROM public.conversations WHERE id = p_conversation_id;
  IF requested_level IS NULL OR requester IS NULL OR requester = auth.uid() THEN RAISE EXCEPTION 'NO_PENDING_LEVEL_REQUEST'; END IF;
  IF p_accept THEN
    UPDATE public.conversations SET active_level_id = requested_level, pending_level_id = NULL, pending_level_requested_by = NULL, pending_level_created_at = NULL WHERE id = p_conversation_id;
    RETURN requested_level;
  END IF;
  UPDATE public.conversations SET pending_level_id = NULL, pending_level_requested_by = NULL, pending_level_created_at = NULL WHERE id = p_conversation_id;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_conversation_level_requests()
RETURNS TABLE(conversation_id uuid, level_id integer, requested_by uuid, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT c.id, c.pending_level_id, c.pending_level_requested_by, c.pending_level_created_at
  FROM public.conversations c
  JOIN public.conversation_members m ON m.conversation_id = c.id
  WHERE m.user_id = auth.uid() AND c.pending_level_id IS NOT NULL AND c.pending_level_requested_by IS DISTINCT FROM auth.uid();
$$;

REVOKE ALL ON FUNCTION public.request_conversation_level(uuid, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.respond_conversation_level(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_conversation_level_requests() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_conversation_level(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_conversation_level(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_conversation_level_requests() TO authenticated;

COMMIT;
