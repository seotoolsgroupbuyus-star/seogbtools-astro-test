import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const productsDir=path.join(root,'content/products');
const files=fs.readdirSync(productsDir).filter(n=>n.endsWith('.json')).sort();
const walk=dir=>fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]):[];
const assets=walk(path.join(root,'public')).filter(p=>/\.(png|webp|jpg|jpeg|gif|svg|avif)$/i.test(p));
const norm=s=>String(s||'').toLowerCase().replace(/\.[^.]+$/,'').replace(/^(?:0\d?_)+/,'').replace(/[^a-z0-9]/g,'');
const assetIndex=new Map();
for(const p of assets){const key=norm(path.basename(p));if(!assetIndex.has(key))assetIndex.set(key,[]);assetIndex.get(key).push('/'+path.relative(path.join(root,'public'),p).replaceAll(path.sep,'/'));}
const records=files.map(file=>{
 const j=JSON.parse(fs.readFileSync(path.join(productsDir,file),'utf8'));const u=String(j.image||'').trim();
 const pathname=u.replace(/^https?:\/\/[^/]+/i,'').split(/[?#]/)[0];
 const localPath=path.join(root,'public',pathname.replace(/^\/+/,''));
 const localExists=Boolean(u&&!/^https?:/i.test(u)&&fs.existsSync(localPath));
 const basename=decodeURIComponent(path.basename(pathname));
 const candidates=assetIndex.get(norm(basename))||[];
 const slugCandidates=assets.filter(p=>norm(path.basename(p)).includes(norm(j.slug))&&norm(j.slug).length>8).slice(0,3).map(p=>'/'+path.relative(path.join(root,'public'),p).replaceAll(path.sep,'/'));
 const kind=!u?'empty':u.includes('google.com/s2/favicons')?'google-favicon':/\/wp-content\/uploads\//i.test(u)?'wordpress-upload':/^https?:/i.test(u)?'external': 'local';
 return {slug:j.slug,name:j.name,image:u,kind,localExists,candidates:[...new Set([...candidates,...slugCandidates])].slice(0,5),http:null,contentType:null};
});
let cursor=0;
const concurrency=10;
await Promise.all(Array.from({length:concurrency},async()=>{
 while(cursor<records.length){
  const record=records[cursor++];
  if(!/^https?:/i.test(record.image))continue;
  const ctl=new AbortController();
  const timeout=setTimeout(()=>ctl.abort(),8500);
  try{
   let r=await fetch(record.image,{method:'HEAD',redirect:'follow',signal:ctl.signal,headers:{'User-Agent':'SEOGBTools-image-audit/1.0'}});
   if(r.status===405)r=await fetch(record.image,{method:'GET',redirect:'follow',signal:ctl.signal,headers:{Range:'bytes=0-0','User-Agent':'SEOGBTools-image-audit/1.0'}});
   record.http=r.status;
   record.contentType=r.headers.get('content-type')||'';
   if(!r.bodyUsed&&r.body){await r.body.cancel().catch(()=>{});}
  }catch(e){record.http=e.name==='AbortError'?'timeout':'network-error';}
  finally{clearTimeout(timeout);}
 }
}));
const count=(items,key)=>Object.fromEntries([...new Set(items.map(x=>x[key]))].map(k=>[String(k),items.filter(x=>x[key]===k).length]));
const stats={total:records.length,sourceTypes:count(records,'kind'),httpStatus:count(records.filter(x=>x.kind!=='local'&&x.kind!=='empty'),'http'),exactLocal:records.filter(x=>x.localExists).length,localCandidates:records.filter(x=>x.candidates.length).length,wordpressWithoutExactLocal:records.filter(x=>x.kind==='wordpress-upload'&&!x.localExists).length};
const out=path.join(root,'product-image-audit.json');
fs.writeFileSync(out,JSON.stringify({date:new Date().toISOString(),stats,records},null,2)+'\n');
console.log('PRODUCT_IMAGE_AUDIT_SUMMARY',JSON.stringify(stats));
for(const x of records)console.log('PRODUCT_IMAGE_AUDIT_RECORD',JSON.stringify({slug:x.slug,kind:x.kind,http:x.http,contentType:x.contentType,local:x.localExists,candidates:x.candidates,image:x.image}));
console.log('JSON REPORT:',out);
if(records.length!==203)process.exitCode=1;
