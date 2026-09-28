-- TODO EN UNO VIRAL AI — schema
CREATE TABLE IF NOT EXISTS public.video_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','researching','scripting','images','publishing','done','error')),
  progress INTEGER NOT NULL DEFAULT 0,
  research JSONB,
  script JSONB,
  images JSONB,
  publication JSONB,
  video_url TEXT,
  error TEXT
);

ALTER TABLE public.video_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for demo" ON public.video_jobs;
CREATE POLICY "Allow all for demo" ON public.video_jobs
  FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_video_jobs_updated ON public.video_jobs;
CREATE TRIGGER trg_video_jobs_updated
  BEFORE UPDATE ON public.video_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
