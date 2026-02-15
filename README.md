# 家庭激励系统（PWA v3 · 云同步版）

一个可直接部署的「家庭激励/奖励」PWA：支持离线缓存、积分与兑换、时间券、周报图表，并可通过 Supabase 实现多设备云同步。

- 在线地址（GitHub Pages）：https://prokiki.github.io/yuan/
- 仓库：https://github.com/prokiki/yuan

---

## 功能概览

- 今日任务清单：勾选完成，自动统计当日得分
- 审批模式：孩子打卡 → 家长审批通过后计分
- 积分与兑换：支持周兑换次数上限
- 时间券：库存管理 + 使用记录（支持每日使用上限）
- 周报图表：周总分曲线、任务完成次数
- PWA：离线缓存、可添加到手机桌面
- 云同步：Supabase 登录 + 家庭 ID，拉取/推送状态

---

## 部署方式

### A. GitHub Pages（推荐）

1. 把代码放在仓库根目录（本仓库已是根目录）
2. 打开 GitHub 仓库 → `Settings` → `Pages`
3. `Build and deployment`：选择 `Deploy from a branch`
4. `Branch`：选择 `main`，目录选择 `/ (root)`
5. 等待部署完成后访问：`https://prokiki.github.io/yuan/`

### B. Vercel / Netlify

- 直接导入仓库或拖拽整个目录部署即可

---

## PWA（离线/更新）说明

- 首次打开后建议 **强制刷新** 一次（确保 Service Worker 安装）
- 如果更新不生效：
  - 浏览器强刷（Chrome/Edge：`Ctrl+Shift+R` / macOS：`Cmd+Shift+R`）
  - 或 DevTools → Application → Service Workers → Unregister

> 本项目使用 `APP_VERSION` 控制 SW 缓存版本。每次发布新版本建议修改 `index.html` 里的 `APP_VERSION`。

---

## 云同步（Supabase，可选/当前已停用）

目前你的 Supabase 项目已停用，因此本项目当前以 **本地离线版** 方式运行（数据保存在浏览器本地存储）。

如果你未来恢复 Supabase，可按下述步骤重新启用云同步。

### 1) 初始化 Supabase

1. 在 Supabase 新建项目
2. 复制 **Project URL** 与 **anon public key**
3. 打开网页 → 进入「云同步」页 → 填写 URL 与 Key → 保存
4. 注册/登录（邮箱 + 密码）
5. 设置一个 `家庭ID`（例如 `yuan-home`）

### 2) 建表与策略

在 Supabase → SQL Editor 执行仓库内的：

- `schema_fixed.sql`

### 3) 推荐：增加 rev 字段（更稳的多设备冲突保护）

在 Supabase → SQL Editor 执行一次：

```sql
alter table public.families_state
add column if not exists rev bigint not null default 0;

update public.families_state set rev = 1 where rev = 0;
```

### 4) 同步行为说明（稳定优先）

- 自动同步（30 秒）：仅自动「从云端拉取」
- 推送本地到云：手动点击，且带冲突检测
  - 若提示冲突：先拉取，再决定是否覆盖

---

## 常见问题

### Q1：为什么有时更新不生效？
PWA 的离线缓存可能还在使用旧资源。按上面的“强刷/Unregister SW”处理即可。

### Q2：为什么推送提示冲突？
说明云端已被其它设备更新。先在当前设备点击「从云端拉取」，确认数据后再决定是否覆盖。

### Q3：数据会不会因为记录太多而写不下？
当前版本使用 `localStorage` 存储整份状态，数据量特别大时可能触发浏览器容量限制。若你后续需要长期积累大量日志，建议迁移到 IndexedDB（可作为 v4 计划）。

---

## 开发与维护（可选）

- CI：GitHub Actions 会运行 `node tools/check.js` 做基础一致性检查

---

## License

MIT License
