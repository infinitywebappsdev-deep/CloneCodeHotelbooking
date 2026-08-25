CREATE TABLE public.notification_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  reference text NOT NULL DEFAULT '',
  recipient text NOT NULL DEFAULT '',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 4,
  last_error text NOT NULL DEFAULT '',
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notification_jobs_status_idx ON public.notification_jobs (status, next_attempt_at);
CREATE UNIQUE INDEX notification_jobs_dedupe_idx ON public.notification_jobs (kind, reference) WHERE reference <> '';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_jobs TO authenticated;
GRANT ALL ON public.notification_jobs TO service_role;

ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff manage notification jobs" ON public.notification_jobs
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER notification_jobs_touch BEFORE UPDATE ON public.notification_jobs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();