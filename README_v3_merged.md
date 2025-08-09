# v3 合并版（完整功能 + 云同步 + 北京时间 + 版本化SW）
- 修改 `index.html` 中 `const APP_VERSION = 'v3-2025-08-09'` 即可强制更新缓存。
- 所有时间通过 `fmtCN(ts)` 以北京时间渲染。
- 首次使用：在 Supabase 执行 `schema_fixed.sql`，然后在“云同步”页填写 URL 与 Anon Key，注册/登录并设置家庭ID。
