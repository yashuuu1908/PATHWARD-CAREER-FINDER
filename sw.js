/* Pathward service worker: offline app shell + runtime cache */
const V='pathward-v3',SHELL=['./','index.html','manifest.webmanifest'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL).catch(()=>{})).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
const SKIP=/firebaseio\.com|googleapis\.com\/(v1beta|identitytoolkit)|identitytoolkit|securetoken|\/api\/|vercel\.app|anthropic\.com|openrouter|openai/i;
self.addEventListener('fetch',e=>{ const r=e.request; if(r.method!=='GET'||SKIP.test(r.url)) return; const u=new URL(r.url);
  if(r.mode==='navigate'){ e.respondWith(fetch(r).then(x=>{ const cp=x.clone(); caches.open(V).then(c=>c.put('index.html',cp)); return x; }).catch(()=>caches.match('index.html').then(m=>m||caches.match('./')))); return; }
  const cdn=/cdnjs\.cloudflare\.com|gstatic\.com|fonts\.googleapis\.com|jsdelivr|unpkg/.test(u.host);
  if(u.origin===location.origin||cdn){ e.respondWith(caches.match(r).then(m=>{ const net=fetch(r).then(x=>{ if(x&&(x.ok||x.type==='opaque')){ const cp=x.clone(); caches.open(V).then(c=>c.put(r,cp)); } return x; }).catch(()=>m); return m||net; })); } });
