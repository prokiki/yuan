# v3 完整包（版本化 SW + 北京时间 fmtCN + 云同步）
- 版本化 SW：`index.html` 中 `APP_VERSION = 'v3-2025-08-09'`，每次发版改这个值。
- 北京时间：统一用 `fmtCN(ts)` 渲染所有时间。
- 云同步：简化 Supabase 流程，配合 `schema_fixed.sql`。