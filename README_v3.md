# v3 云同步加装包（Supabase）

这是在 v2 基础上添加“云同步（Supabase）”的 **前端插件**，不改你现有的业务逻辑。

## 快速集成
1. 在 `index.html` 的 `<head>` 或 Chart.js 后添加：
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="cloud_sync_addon.js"></script>
   ```
2. 将本目录中的 `cloud_sync_addon.js`、`schema.sql` 上传到你站点根目录（或任意可访问位置）。
3. 在 Supabase 控制台中执行 `schema.sql` 创建表与 RLS 策略。

## 使用方法
- 打开站点，顶部会出现 **“云同步”** 标签。
- 第一次进入“云同步”页：
  - 填写 `Supabase URL`（如 `https://xxx.supabase.co`）与 `Anon Key`（public），点击“保存配置”。
  - “登录/注册”一个账号（邮箱+密码）。
  - 设置一个 **家庭ID**（如 `yuan-home`）。
  - 点击“推送本地到云”，随后可以在手机端**同样登录**并输入相同 `家庭ID`，点击“从云端拉取”。
  - 勾选“自动同步（30秒）”可自动保持一致。

## 冲突策略
- 默认：**Last-Write-Wins**。每次写入更新 `updated_at`，较新者覆盖。
- 你也可以手动点“拉取/推送”指定方向。
- 需要更细的“字段级合并”，可在插件中自定义（例如按日期合并 `records`）。

## 安全说明
- 本插件使用 **Anon Key（公开）** + 用户登录（邮箱/密码）来控制操作权限。
- 现有 `schema.sql` 策略允许任何**已登录用户**读写 `families_state`。若要限制到“家庭成员”，可额外建 `families` / `members` 关联表，并将 RLS 收紧。

## 故障排查
- **登录失败**：检查 Supabase 项目的 URL/Key 是否正确、网络是否可访问。
- **拉取/推送失败**：确认已执行 `schema.sql`；检查 RLS/Policy 配置；确认已登录。
- **自动同步不工作**：确保在“云同步”页勾选了开关，且浏览器页签保持活动（或使用 Service Worker + 定时策略做前台同步）。

——
