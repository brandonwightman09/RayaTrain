const CACHE='rayalift-v1';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  // never cache API calls
  if(url.hostname.endsWith('supabase.co')){return;}
  e.respondWith(
    fetch(e.request).then(r=>{
      const c=r.clone();
      if(e.request.method==='GET'&&r.status===200)caches.open(CACHE).then(ch=>ch.put(e.request,c));
      return r;
    }).catch(()=>caches.match(e.request).then(m=>m||caches.match('index.html')))
  );
});
