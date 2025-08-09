(function(){
  if (!window.supabase) { console.error('supabase-js not loaded'); return; }
  if (typeof window.state === 'undefined') { console.error('base app not detected'); return; }
  window.tabDefs = [{id:"cloud", name:"云同步"}].concat(window.tabDefs || []);
  document.addEventListener('DOMContentLoaded', function(){
    var sec = document.createElement('section');
    sec.id = 'tab-cloud';
    sec.innerHTML = '<h2>云同步</h2><p>这里是云同步设置页面。</p>';
    document.querySelector('main').appendChild(sec);
    if (typeof window.renderTabs === 'function') window.renderTabs();
  });
})();