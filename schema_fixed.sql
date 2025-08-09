-- Supabase schema for v3 cloud sync (fixed policies)
CREATE TABLE IF NOT EXISTS public.families_state (
  family_id  text PRIMARY KEY,
  state_json jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.families_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rw for auth" ON public.families_state;
CREATE POLICY "select_for_auth" ON public.families_state
  FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "insert_for_auth" ON public.families_state
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "update_for_auth" ON public.families_state
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "delete_for_auth" ON public.families_state
  FOR DELETE
  USING (auth.role() = 'authenticated');
