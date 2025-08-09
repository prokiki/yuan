-- 1) 确保表存在并开启 RLS
CREATE TABLE IF NOT EXISTS public.families_state (
  family_id  text PRIMARY KEY,
  state_json jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.families_state ENABLE ROW LEVEL SECURITY;

-- 2) 先删除之前那条错误策略（如果建过）
DROP POLICY IF EXISTS "rw for auth" ON public.families_state;

-- 3) 分别为各操作创建策略
-- SELECT：只能写 USING（查询权限判断）
CREATE POLICY "select_for_auth" ON public.families_state
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT：只能写 WITH CHECK（被插入行必须满足）
CREATE POLICY "insert_for_auth" ON public.families_state
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- UPDATE：两边都写（谁能更新 + 更新后的行必须满足）
CREATE POLICY "update_for_auth" ON public.families_state
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- DELETE：只能写 USING（谁能删除）
CREATE POLICY "delete_for_auth" ON public.families_state
  FOR DELETE
  USING (auth.role() = 'authenticated');
