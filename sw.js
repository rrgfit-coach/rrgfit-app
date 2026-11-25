const C='rrgfit-v4';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const k=await caches.keys();await Promise.all(k.map(x=>caches.delete(x)));
  await self.clients.claim();
  const cs=await self.clients.matchAll({type:'window'});
  cs.forEach(c=>{try{c.navigate(c.url)}catch(_){}});
})()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(new Request(e.request,{cache:'no-store'})).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
});
