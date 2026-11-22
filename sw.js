const CACHE='tiatay-v17';
const ROOT=new URL(self.registration.scope);
const FILES=['./','./index.html','./style.css?v=17','./App.js?v=17','./install.js?v=17',
 './firebase-config.js','./manifest.json?v=17','./logo.jpg','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
const ASSETS=new Set(FILES.map(path=>new URL(path,ROOT).href));

self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys()
  .then(keys=>Promise.all(keys.filter(key=>/^tiatay-v\d+$/.test(key)&&key!==CACHE).map(key=>caches.delete(key))))
  .then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||!request.url.startsWith(ROOT.href))return;
 const navigation=request.mode==='navigate';
 if(!navigation&&!ASSETS.has(request.url))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(request);
   if(response.ok&&ASSETS.has(request.url))await cache.put(request,response.clone()).catch(()=>{});
   return response;
  }catch(error){
   return await cache.match(request)
    || (navigation?await cache.match(new URL('./index.html',ROOT)):null)
    || Response.error();
  }
 })());
});
