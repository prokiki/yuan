
/* == v3 Cloud Sync Add-on (Supabase) ==
 * 用法：在 index.html 里、Chart.js 之后插入：
 * <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 * <script src="cloud_sync_addon.js"></script>
 * 然后发布站点，打开“云同步”标签按步骤操作。
 */

(function(){
  if (!window.supabase) {
    console.error('[v3 addon] supabase-js not loaded.');
    return;
  }
  // 依赖：全局存在 state / saveState(s) / init() / tabDefs 数组
  if (typeof window.state === 'undefined' || typeof window.saveState !== 'function' || typeof window.init !== 'function') {
    console.error('[v3 addon] base app not detected. Ensure v2 app exposes state/saveState/init');
  }

  // 追加“云同步”Tab
  window.tabDefs = [{id:"cloud", name:"云同步"}].concat(window.tabDefs || []);

  // 在DOM ready后插入云同步section
  document.addEventListener('DOMContentLoaded', function(){
    var main = document.querySelector('main');
    if(!main) return;
    var sec = document.createElement('section');
    sec.id = 'tab-cloud';
    sec.innerHTML = [
      '<div class="grid cols-2">',
      ' <div class="card">',
      '  <h2>登录 / 注册</h2>',
      '  <div class="grid">',
      '    <label>邮箱：<input id="sb_email" type="text" placeholder="you@example.com"/></label>',
      '    <label>密码：<input id="sb_password" type="password" placeholder="至少 6 位"/></label>',
      '    <div class="row">',
      '      <button class="btn" id="sb_signin">登录</button>',
      '      <button class="btn secondary" id="sb_signup">注册</button>',
      '      <button class="btn secondary" id="sb_signout">退出登录</button>',
      '    </div>',
      '    <div class="muted" id="sb_status">未登录</div>',
      '  </div>',
      ' </div>',
      ' <div class="card">',
      '  <h2>家庭空间</h2>',
      '  <div class="grid">',
      '    <label>Supabase URL（一次设置）：<input id="sb_url" placeholder="https://xxx.supabase.co"/></label>',
      '    <label>Anon Key（一次设置）：<input id="sb_anon" placeholder="ey..."/></label>',
      '    <label>家庭ID（英文/数字/中横线）：<input id="family_id" type="text" placeholder="如 yuan-home"/></label>',
      '    <div class="row">',
      '      <button class="btn" id="btn_save_cfg">保存配置</button>',
      '      <button class="btn" id="btn_pull">从云端拉取</button>',
      '      <button class="btn" id="btn_push">推送本地到云</button>',
      '      <label class="row"><input id="auto_sync" type="checkbox"/> 自动同步（30 秒）</label>',
      '    </div>',
      '    <div class="muted" id="cloud_info">云端：未连接</div>',
      '  </div>',
      ' </div>',
      '</div>',
      '<div class="card mt16">',
      ' <h2>冲突处理</h2>',
      ' <p class="muted">默认 “Last-Write-Wins（谁更新晚谁覆盖）”。也可手动“拉取/推送”。</p>',
      ' <div class="row"><button class="btn secondary" id="btn_backup">下载本地备份 JSON</button></div>',
      '</div>'
    ].join('');
    main.insertBefore(sec, main.firstChild);

    // 重新渲染 Tabs（使用宿主应用的 renderTabs）
    if (typeof window.renderTabs === 'function') { window.renderTabs(); }
    else {
      // 简单刷新：让用户切换到“云同步”页
      var tabs = document.getElementById('tabs');
      if (tabs) {
        var b = document.createElement('button');
        b.className = 'tab'; b.textContent = '云同步';
        b.onclick = function(){
          document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          document.querySelectorAll('main section').forEach(sec=>sec.classList.remove('active'));
          document.getElementById('tab-cloud').classList.add('active');
        };
        tabs.insertBefore(b, tabs.firstChild);
      }
    }

    // 初始化配置读取
    var $email = document.getElementById('sb_email');
    var $pass = document.getElementById('sb_password');
    var $status = document.getElementById('sb_status');
    var $url = document.getElementById('sb_url');
    var $anon = document.getElementById('sb_anon');
    var $family = document.getElementById('family_id');
    var $cloudInfo = document.getElementById('cloud_info');
    var $auto = document.getElementById('auto_sync');

    $url.value = localStorage.getItem('sb_url') || '';
    $anon.value = localStorage.getItem('sb_anon') || '';
    $family.value = localStorage.getItem('family_id') || '';
    $email.value = localStorage.getItem('sb_email') || '';
    $auto.checked = (localStorage.getItem('auto_sync') === '1');

    document.getElementById('btn_save_cfg').onclick = function(){
      localStorage.setItem('sb_url', $url.value.trim());
      localStorage.setItem('sb_anon', $anon.value.trim());
      localStorage.setItem('family_id', $family.value.trim());
      localStorage.setItem('sb_email', $email.value.trim());
      localStorage.setItem('auto_sync', $auto.checked ? '1' : '0');
      alert('配置已保存');
      location.reload();
    };

    // 创建 Supabase 客户端
    var SUPABASE_URL = localStorage.getItem('sb_url') || 'https://YOUR-PROJECT.supabase.co';
    var SUPABASE_ANON_KEY = localStorage.getItem('sb_anon') || 'YOUR-ANON-KEY';
    var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    document.getElementById('sb_signin').onclick = async function(){
      try{
        const { data, error } = await sb.auth.signInWithPassword({ email:$email.value.trim(), password:$pass.value });
        if(error) throw error;
        $status.textContent = '已登录：' + (data.user.email||'');
        localStorage.setItem('sb_email', $email.value.trim());
      }catch(e){ alert('登录失败：'+e.message); }
    };
    document.getElementById('sb_signup').onclick = async function(){
      try{
        const { data, error } = await sb.auth.signUp({ email:$email.value.trim(), password:$pass.value });
        if(error) throw error;
        $status.textContent = '注册成功，请登录';
      }catch(e){ alert('注册失败：'+e.message); }
    };
    document.getElementById('sb_signout').onclick = async function(){
      await sb.auth.signOut(); $status.textContent = '未登录';
    };

    // 同步函数
    async function pullFromCloud(){
      const fid = $family.value.trim();
      if(!fid) { alert('请先设置家庭ID'); return; }
      const { data, error } = await sb.from('families_state').select('*').eq('family_id', fid).maybeSingle();
      if(error){ alert('拉取失败：'+error.message); return; }
      if(!data){ $cloudInfo.textContent = '云端：无记录（首次使用：请推送）'; return; }
      const serverUpdated = new Date(data.updated_at).getTime();
      const localMeta = JSON.parse(localStorage.getItem('cloud_meta')||'{}');
      const localUpdated = Number(localMeta.updated_at||0);
      if(serverUpdated <= localUpdated){
        $cloudInfo.textContent = '云端较旧/相同，无需覆盖';
        return;
      }
      if (window.state) {
        window.state = Object.assign({}, window.state, data.state_json);
        window.saveState(window.state);
        localStorage.setItem('cloud_meta', JSON.stringify({family_id:fid, updated_at:serverUpdated}));
        if (typeof window.init === 'function') window.init();
      }
      $cloudInfo.textContent = '已拉取（'+ data.updated_at +'）并覆盖本地';
    }
    async function pushToCloud(){
      const fid = $family.value.trim();
      if(!fid) { alert('请先设置家庭ID'); return; }
      const payload = { family_id: fid, state_json: window.state, updated_at: new Date().toISOString() };
      const { data, error } = await sb.from('families_state').upsert(payload).select().maybeSingle();
      if(error){ alert('推送失败：'+error.message); return; }
      const ts = new Date(data.updated_at).getTime();
      localStorage.setItem('cloud_meta', JSON.stringify({family_id:fid, updated_at:ts}));
      $cloudInfo.textContent = '已推送到云端（'+ data.updated_at +'）';
    }

    document.getElementById('btn_pull').onclick = pullFromCloud;
    document.getElementById('btn_push').onclick = pushToCloud;
    document.getElementById('btn_backup').onclick = function(){
      const blob = new Blob([JSON.stringify(window.state,null,2)], {type:"application/json"});
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = 'family_reward_backup_v3.json'; a.click(); URL.revokeObjectURL(url);
    };

    // 自动同步：先拉后推
    setInterval(async function(){
      if(!$auto.checked) return;
      try{ await pullFromCloud(); await pushToCloud(); }catch(e){ /* ignore */ }
    }, 30000);

    // 初始化用户状态
    sb.auth.getUser().then(({data})=>{ if(data && data.user){ $status.textContent = '已登录：' + (data.user.email||''); } });
  });
})();
