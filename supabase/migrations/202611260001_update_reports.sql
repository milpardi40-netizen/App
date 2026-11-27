-- Additive update reporting. Requires existing app releases, profiles and admin setup.
-- No historical usage counts are invented. Events are authenticated client reports.
BEGIN;
CREATE TABLE IF NOT EXISTS public.app_update_reporting_config (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
 started_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.app_update_reporting_config(singleton) VALUES(true) ON CONFLICT DO NOTHING;
ALTER TABLE public.app_update_reporting_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_update_reporting_config FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.app_release_history (
 id bigserial PRIMARY KEY, release_id uuid NOT NULL, package_name text NOT NULL,
 version_code integer NOT NULL, snapshot jsonb NOT NULL, action text NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS app_release_history_version_idx ON public.app_release_history(package_name,version_code,id DESC);
ALTER TABLE public.app_release_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_release_history FROM PUBLIC, anon, authenticated;
INSERT INTO public.app_release_history(release_id,package_name,version_code,snapshot,action)
 SELECT r.id,r.package_name,r.version_code,to_jsonb(r),'baseline' FROM public.app_releases r
 WHERE NOT EXISTS(SELECT 1 FROM public.app_release_history h WHERE h.release_id=r.id);
CREATE OR REPLACE FUNCTION public.archive_app_release_report() RETURNS trigger
 LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
 DECLARE payload jsonb;
 BEGIN
 payload:=CASE WHEN TG_OP='DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
 INSERT INTO public.app_release_history(release_id,package_name,version_code,snapshot,action)
 VALUES((payload->>'id')::uuid,payload->>'package_name',(payload->>'version_code')::integer,payload,lower(TG_OP));
 RETURN NULL;
 END $$;
REVOKE ALL ON FUNCTION public.archive_app_release_report() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS archive_app_release_report ON public.app_releases;
CREATE TRIGGER archive_app_release_report AFTER INSERT OR UPDATE OR DELETE ON public.app_releases
 FOR EACH ROW EXECUTE FUNCTION public.archive_app_release_report();

CREATE TABLE IF NOT EXISTS public.app_update_events (
 event_id uuid NOT NULL, user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 package_name text NOT NULL, version_code integer NOT NULL CHECK(version_code>0),
 version_name text NOT NULL, event_kind text NOT NULL CHECK(event_kind IN('session','download_verified','installer_requested','upgrade_observed')),
 previous_code integer, occurred_at timestamptz NOT NULL, received_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,event_id)
);
CREATE INDEX IF NOT EXISTS app_update_events_version_idx ON public.app_update_events(package_name,version_code,user_id,received_at DESC);
CREATE INDEX IF NOT EXISTS app_update_events_user_idx ON public.app_update_events(user_id,package_name,received_at DESC);
ALTER TABLE public.app_update_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_update_events FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.report_app_update_event(
 p_owner_id uuid,p_event_id uuid,p_package_name text,p_version_code integer,p_version_name text,
 p_event_kind text,p_occurred_at timestamptz,p_previous_code integer DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.uid() IS NULL OR p_owner_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
 IF p_package_name IS NULL OR p_package_name NOT IN(
 'com.devicecontrol.milofive','com.devicecontrol.milomultilang','com.devicecontrol.miloenglish',
 'com.devicecontrol.companion','com.devicecontrol.milolang2','com.devicecontrol.miloadmin','com.devicecontrol.milorussian')
 OR p_version_code IS NULL OR p_version_code<=0 OR p_event_id IS NULL
 OR p_version_name IS NULL OR length(btrim(p_version_name)) NOT BETWEEN 1 AND 40
 OR p_event_kind IS NULL OR p_event_kind NOT IN('session','download_verified','installer_requested','upgrade_observed')
 OR p_occurred_at IS NULL OR p_occurred_at>now()+interval '5 minutes'
 OR p_occurred_at<now()-interval '90 days'
 OR (p_event_kind='upgrade_observed' AND (p_previous_code IS NULL OR p_previous_code<=0 OR p_previous_code>=p_version_code))
 OR (p_event_kind<>'upgrade_observed' AND p_previous_code IS NOT NULL)
 THEN RAISE EXCEPTION 'INVALID_UPDATE_EVENT'; END IF;
 -- Limit abuse by a single authenticated account; duplicates remain retry-safe.
 IF EXISTS(SELECT 1 FROM public.app_update_events WHERE user_id=auth.uid() AND event_id=p_event_id) THEN RETURN; END IF;
 PERFORM pg_advisory_xact_lock(hashtext(auth.uid()::text));
 IF (SELECT count(*) FROM public.app_update_events WHERE user_id=auth.uid() AND received_at>now()-interval '1 minute')>=120
 THEN RAISE EXCEPTION 'UPDATE_REPORT_RATE_LIMIT'; END IF;
 INSERT INTO public.app_update_events(event_id,user_id,package_name,version_code,version_name,event_kind,previous_code,occurred_at)
 VALUES(p_event_id,auth.uid(),p_package_name,p_version_code,btrim(p_version_name),p_event_kind,p_previous_code,p_occurred_at)
 ON CONFLICT DO NOTHING;
END $$;
REVOKE ALL ON FUNCTION public.report_app_update_event(uuid,uuid,text,integer,text,text,timestamptz,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.report_app_update_event(uuid,uuid,text,integer,text,text,timestamptz,integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_versions(p_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb;
BEGIN
 IF NOT coalesce(public.is_education_admin(),false) THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
 WITH archived AS (
 SELECT DISTINCT ON(package_name,version_code) package_name,version_code,snapshot,action,recorded_at
 FROM public.app_release_history ORDER BY package_name,version_code,id DESC
 ), versions AS (
 SELECT package_name,version_code FROM public.app_releases UNION
 SELECT package_name,version_code FROM archived UNION SELECT package_name,version_code FROM public.app_update_events
 ), stats AS (
 SELECT package_name,version_code,count(DISTINCT user_id) AS reporters,
 count(DISTINCT user_id) FILTER(WHERE event_kind='session') AS users,
 count(*) FILTER(WHERE event_kind='session') AS sessions,
 count(*) FILTER(WHERE event_kind='download_verified') AS downloads,
 count(*) FILTER(WHERE event_kind='installer_requested') AS installers,
 count(*) FILTER(WHERE event_kind='upgrade_observed') AS upgrades,
 min(received_at) AS first_report_at,max(received_at) AS last_report_at,max(version_name) AS observed_name
 FROM public.app_update_events GROUP BY package_name,version_code
 ), rows AS (
 SELECT v.package_name,v.version_code,coalesce(r.version_name,a.snapshot->>'version_name',s.observed_name) AS version_name,
 r.id AS release_id,coalesce(r.release_notes,a.snapshot->>'release_notes','') AS release_notes,
 r.published,CASE WHEN r.id IS NOT NULL THEN 'catalogue' WHEN a.package_name IS NOT NULL THEN 'archived' ELSE 'observed' END AS source,
 coalesce(r.created_at,(a.snapshot->>'created_at')::timestamptz) AS published_at,
 coalesce(s.users,0) AS users,coalesce(s.reporters,0) AS reporters,coalesce(s.sessions,0) AS sessions,
 coalesce(s.downloads,0) AS downloads,coalesce(s.installers,0) AS installers,coalesce(s.upgrades,0) AS upgrades,
 s.first_report_at,s.last_report_at
 FROM versions v LEFT JOIN public.app_releases r USING(package_name,version_code)
 LEFT JOIN archived a USING(package_name,version_code) LEFT JOIN stats s USING(package_name,version_code)
 ), page AS(SELECT * FROM rows ORDER BY version_code DESC,package_name LIMIT 50 OFFSET greatest(coalesce(p_offset,0),0))
 SELECT jsonb_build_object('rows',coalesce((SELECT jsonb_agg(to_jsonb(p) ORDER BY version_code DESC,package_name) FROM page p),'[]'::jsonb),
 'total',(SELECT count(*) FROM rows),'started_at',(SELECT started_at FROM public.app_update_reporting_config)) INTO result;
 RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.admin_update_version_users(p_package_name text,p_version_code integer,p_offset integer DEFAULT 0,p_search text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb;
BEGIN
 IF NOT coalesce(public.is_education_admin(),false) THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
 WITH grouped AS (
 SELECT e.user_id,count(*) FILTER(WHERE event_kind='session') AS sessions,
 count(*) FILTER(WHERE event_kind='download_verified') AS downloads,
 count(*) FILTER(WHERE event_kind='installer_requested') AS installers,
 count(*) FILTER(WHERE event_kind='upgrade_observed') AS upgrades,
 min(received_at) AS first_report_at,max(received_at) AS last_report_at
 FROM public.app_update_events e WHERE e.package_name=p_package_name AND e.version_code=p_version_code GROUP BY e.user_id
 ), latest AS (
 SELECT DISTINCT ON(user_id) user_id,version_code FROM public.app_update_events
 WHERE package_name=p_package_name AND event_kind='session' ORDER BY user_id,received_at DESC,event_id
 ), rows AS (
 SELECT g.*,p.full_name,p.email,p.account_kind,l.version_code AS latest_observed_code FROM grouped g
 LEFT JOIN public.app_user_profiles p USING(user_id) LEFT JOIN latest l USING(user_id)
 WHERE coalesce(p.full_name,'') ILIKE '%'||left(coalesce(p_search,''),100)||'%'
 OR coalesce(p.email,'') ILIKE '%'||left(coalesce(p_search,''),100)||'%'
 OR g.user_id::text ILIKE '%'||left(coalesce(p_search,''),100)||'%'
 ), page AS(SELECT * FROM rows ORDER BY last_report_at DESC,user_id LIMIT 50 OFFSET greatest(coalesce(p_offset,0),0))
 SELECT jsonb_build_object('rows',coalesce((SELECT jsonb_agg(to_jsonb(p) ORDER BY last_report_at DESC,user_id) FROM page p),'[]'::jsonb),'total',(SELECT count(*) FROM rows)) INTO result;
 RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.admin_update_legacy_users(p_offset integer DEFAULT 0,p_search text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb;
BEGIN
 IF NOT coalesce(public.is_education_admin(),false) THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
 WITH rows AS (
 SELECT user_id,full_name,email,app_version,platform,last_seen_at FROM public.app_user_profiles
 WHERE full_name ILIKE '%'||left(coalesce(p_search,''),100)||'%' OR email ILIKE '%'||left(coalesce(p_search,''),100)||'%'
 OR coalesce(app_version,'') ILIKE '%'||left(coalesce(p_search,''),100)||'%'
 ), page AS(SELECT * FROM rows ORDER BY last_seen_at DESC,user_id LIMIT 50 OFFSET greatest(coalesce(p_offset,0),0))
 SELECT jsonb_build_object('rows',coalesce((SELECT jsonb_agg(to_jsonb(p) ORDER BY last_seen_at DESC,user_id) FROM page p),'[]'::jsonb),'total',(SELECT count(*) FROM rows)) INTO result;
 RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.admin_update_user_events(p_package_name text,p_version_code integer,p_user_id uuid,p_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb;
BEGIN
 IF NOT coalesce(public.is_education_admin(),false) THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
 WITH rows AS(SELECT event_id,event_kind,previous_code,occurred_at,received_at FROM public.app_update_events
 WHERE package_name=p_package_name AND version_code=p_version_code AND user_id=p_user_id),
 page AS(SELECT * FROM rows ORDER BY received_at DESC,event_id LIMIT 50 OFFSET greatest(coalesce(p_offset,0),0))
 SELECT jsonb_build_object('rows',coalesce((SELECT jsonb_agg(to_jsonb(p) ORDER BY received_at DESC,event_id) FROM page p),'[]'::jsonb),'total',(SELECT count(*) FROM rows)) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.admin_update_versions(integer),public.admin_update_version_users(text,integer,integer,text),public.admin_update_legacy_users(integer,text),public.admin_update_user_events(text,integer,uuid,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_update_versions(integer),public.admin_update_version_users(text,integer,integer,text),public.admin_update_legacy_users(integer,text),public.admin_update_user_events(text,integer,uuid,integer) TO authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
