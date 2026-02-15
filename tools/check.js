// Lightweight sanity checks for this repo (no dependencies)
// Run: node tools/check.js

const fs = require('fs');

function read(path){
  return fs.readFileSync(path, 'utf8');
}

function assert(cond, msg){
  if(!cond){
    console.error('CHECK_FAILED:', msg);
    process.exitCode = 1;
  }
}

// 1) Ensure APP_VERSION exists and SW registration uses it
const html = read('index.html');
assert(/\bvar\s+APP_VERSION\s*=\s*"[^"]+"\s*;/.test(html), 'index.html missing APP_VERSION var');
assert(/serviceWorker\.register\('\.\/sw\.js\?v='\s*\+\s*encodeURIComponent\(APP_VERSION\)\)/.test(html), 'index.html SW register does not use APP_VERSION');

// 2) Ensure manifest.webmanifest is referenced
assert(/<link\s+rel="manifest"\s+href="manifest\.webmanifest"\s*>/i.test(html), 'index.html should reference manifest.webmanifest');

// 3) Ensure both manifest files (if present) are consistent-ish
const hasJson = fs.existsSync('manifest.json');
const hasWeb = fs.existsSync('manifest.webmanifest');
assert(hasWeb, 'manifest.webmanifest missing');
if(hasJson){
  const a = JSON.parse(read('manifest.json'));
  const b = JSON.parse(read('manifest.webmanifest'));
  // Only compare a few keys
  for(const k of ['start_url','display']){
    if(a[k] && b[k]) assert(a[k] === b[k], `manifest mismatch on ${k}: manifest.json=${a[k]} webmanifest=${b[k]}`);
  }
}

// 4) Ensure sw.js contains cache name with VERSION token
const sw = read('sw.js');
assert(/family-reward-cache-\$\{VERSION\}/.test(sw), 'sw.js CACHE_NAME should include VERSION');

if(process.exitCode){
  process.exit(process.exitCode);
}
console.log('OK');
