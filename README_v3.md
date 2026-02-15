# 家庭激励系统 · PWA v3（云同步版）

这个包是可直接部署的 v3 完整版本：含“云同步”标签（Supabase）、PWA（离线缓存）、积分/奖励/时间券/周报等核心功能。

## 一、部署
- 方式 A：GitHub Pages（将整个文件夹上传到仓库根目录 → Settings → Pages → main/root）
- 方式 B：Vercel/Netlify（拖拽上传或连 Git 自动部署）
首次打开后，请 **强制刷新** 一次（确保 SW 安装）

## 二、Supabase 初始化
1. 在 Supabase 新建项目，复制 **Project URL** 与 **anon public key**
2. 打开网页 → 切到“云同步”页，在页面上填：URL 与 Anon Key → 保存配置（存到本地）
3. 注册/登录（邮箱+密码）
4. 设置一个家庭ID（如 `yuan-home`）
5. 点击 **推送本地到云**（首行建立）
6. 在另一台设备同样登录并填写相同家庭ID → **从云端拉取**
7. 勾选 **自动同步（30 秒）**

## 三、数据库结构（schema_fixed.sql）
见本包 `schema_fixed.sql`，已按 SELECT/INSERT/UPDATE/DELETE 分别创建策略（避免 42601 错误）。

### （推荐）增加 rev 字段：避免多设备互相覆盖
当前前端已支持“乐观锁”推送：优先使用 `rev`（若数据库有该字段），否则退化为用 `updated_at` 做冲突检测。

建议你在 Supabase SQL Editor 执行（只需一次）：

```sql
alter table public.families_state
add column if not exists rev bigint not null default 0;

-- 若表里已有数据，初始化 rev
update public.families_state set rev = 1 where rev = 0;
```

## 四、常见问题
- 没看到“云同步”标签：强制刷新（Cmd+Shift+R）或 DevTools → Application → Unregister SW；确认 `index.html` 已包含 supabase-js
- 推送/拉取失败：确认已执行 `schema_fixed.sql`，且已登录；检查 URL/Key 是否正确
- 缓存更新不生效：修改 `sw.js` 的 `CACHE_NAME` 后重新部署，再强刷一次页面

——
