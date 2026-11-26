import fs from 'node:fs';
import path from 'node:path';

// Original uploaded archive is the authoritative image source. CMS JSON remains unchanged.
const root=process.cwd(),pub=path.join(root,'public');
const originalRoot=path.join(pub,'assets/images/original');
const output=path.join(pub,'assets/images/product-covers');
const valid=/\.(?:png|jpe?g|webp|gif|svg|avif)$/i;
const isVariant=s=>/-\d{2,4}x\d{2,4}(?=\.[^.]+$)/i.test(s);
const stem=s=>path.basename(s).replace(/\.[^.]+$/,'').toLowerCase();
const normalize=s=>String(s||'').toLowerCase().replace(/&(?:amp|#38);/gi,'and').replace(/[^a-z0-9]+/g,'');
const ignored=new Set(['group','buy','seo','tools','tool','premium','with','access','account','accounts','for','and','the','share','shared','private','affordable','advanced','software','complete','professional','platform','get','to','in','a','ai','of','subscription','service']);
const tokens=s=>String(s||'').toLowerCase().replace(/&(?:amp|#38);/gi,'and').split(/[^a-z0-9]+/).filter(t=>t.length>=3&&!ignored.has(t));
function walk(dir){
 if(!fs.existsSync(dir))return [];
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):valid.test(e.name)?[path.join(dir,e.name)]:[]);
}
const originals=walk(originalRoot).map(p=>({
 web:'/'+path.relative(pub,p).split(path.sep).join('/'),
 basename:path.basename(p),
 stem:stem(p),
 norm:normalize(stem(p)),
 variant:isVariant(p),
 directory:p.includes('/11/')?'11':'10'
}));
const older=walk(path.join(pub,'assets/images/site')).concat(walk(path.join(pub,'assets/images/tools'))).map(p=>({
 web:'/'+path.relative(pub,p).split(path.sep).join('/'),
 basename:path.basename(p),
 stem:stem(p),
 norm:normalize(stem(p)),
 variant:isVariant(p),
 directory:'legacy'
}));
const byBasename=new Map();
for(const e of [...originals,...older]){
 const k=e.basename.toLowerCase();
 if(!byBasename.has(k))byBasename.set(k,[]);
 byBasename.get(k).push(e);
}
function prefer(list){
 return [...list].sort((a,b)=>{
  const score=e=>(e.web.includes('/original/')?100:0)+(e.directory==='10'?10:0)-(e.variant?25:0)-(e.basename.includes('01_')?5:0);
  return score(b)-score(a)||a.basename.length-b.basename.length;
 })[0];
}
export function resolveOriginalUrl(value){
 const input=String(value||'');
 // Only image assets. Do not rewrite text links or links to content pages.
 const pathname=input.replace(/^https?:\/\/[^/]+/i,'').split(/[?#]/)[0];
 let base;
 try{base=decodeURIComponent(path.posix.basename(pathname));}catch{return null;}
 if(!valid.test(base))return null;
 const matches=byBasename.get(base.toLowerCase());
 if(matches?.length)return prefer(matches).web;
 // Some archived originals have a normalized extension/case, but keep exact stem.
 const k=normalize(stem(base));
 const normalized=originals.filter(x=>x.norm===k&&!x.variant);
 if(normalized.length)return prefer(normalized).web;
 return null;
}
const priorities=[
 {match:/-product-cover(?:$|-)/,rank:160},
 {match:/-group-buy-cover(?:$|-)/,rank:150},
 {match:/-cover(?:$|-)/,rank:125},
 {match:/-featured(?:$|-)/,rank:110},
 {match:/-feature-0$/,rank:105},
 {match:/-logo$/,rank:70},
 {match:/-inline-/,rank:-120},
 {match:/-guide-/,rank:-75},
 {match:/-content-/,rank:-65},
 {match:/-screenshot/,rank:-40}
];
function scoreProduct(e,p){
 if(e.variant)return -99999;
 const slug=String(p.slug||'');
 const n=normalize(slug),es=e.norm;
 const ts=tokens(slug);
 if(!ts.length)return -99999;
 const primary=ts[0],primaryNorm=normalize(primary);
 if(!primaryNorm||!es.includes(primaryNorm))return -99999;
 // Favor exact slug rather than similarly-named but unrelated tools.
 let score=(es.includes(n)?450:0)+ (es.startsWith(n)?120:0);
 const tokenHits=ts.filter(t=>es.includes(normalize(t))).length;
 score+=tokenHits*50;
 if(ts.length>1 && tokenHits===1)score-=100;
 if(es.startsWith(primaryNorm))score+=30;
 for(const ptn of priorities)if(ptn.match.test(e.stem))score+=ptn.rank;
 if(e.stem.includes('square-')||e.stem.startsWith('semstyle-')||e.stem.startsWith('offer-'))score-=20;
 if(e.directory==='10')score+=5;
 return score;
}
function imageCandidate(product){
 const originalUrl=resolveOriginalUrl(product.image);
 if(originalUrl)return {web:originalUrl,source:'original-filename'};
 const cur=String(product.image||'');
 if(cur.startsWith('/')&&fs.existsSync(path.join(pub,cur.replace(/^\/+/,''))))return {web:cur,source:'existing-local'};
 const candidates=originals.filter(x=>!x.variant).map(e=>({e,score:scoreProduct(e,product)})).filter(x=>x.score>=115);
 candidates.sort((a,b)=>b.score-a.score||a.e.basename.length-b.e.basename.length);
 if(candidates.length)return {web:candidates[0].e.web,source:'original-product-match',score:candidates[0].score};
 return null;
}
function safeXml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function cover(p){
 const name=String(p.name||p.slug).replace(/&amp;/g,'&').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
 const display=name.slice(0,34);
 return '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><rect width="640" height="420" fill="#172554"/><text x="320" y="192" font-family="Arial,sans-serif" font-size="42" fill="white" font-weight="700" text-anchor="middle">'+safeXml(display)+'</text><text x="320" y="257" font-family="Arial,sans-serif" font-size="24" fill="#93c5fd" text-anchor="middle">Premium SEO Tool</text></svg>';
}
export function prepareProductImages(products){
 fs.mkdirSync(output,{recursive:true});
 const map={};const sources={};
 for(const p of products){
  let entry=imageCandidate(p);
  if(!entry){
   const dest=path.join(output,p.slug+'.svg');
   fs.writeFileSync(dest,cover(p),'utf8');
   entry={web:'/assets/images/product-covers/'+encodeURIComponent(p.slug)+'.svg',source:'generated-labeled-cover'};
  }
  const local=path.join(pub,decodeURIComponent(entry.web).replace(/^\/+/,''));
  if(!fs.existsSync(local))throw Error('Missing product image for '+p.slug+': '+entry.web);
  map[p.slug]=entry;sources[entry.source]=(sources[entry.source]||0)+1;
 }
 console.log('PRODUCT_IMAGE_MIGRATION',JSON.stringify({total:products.length,sources,originalAssetsAvailable:originals.length,unresolved:Object.values(map).filter(e=>e.source==='generated-labeled-cover').length,brokenLocal:0}));
 console.log('ORIGINAL_IMAGE_UNMATCHED_SLUGS',JSON.stringify(Object.entries(map).filter(([,v])=>v.source==='generated-labeled-cover').map(([slug])=>slug)));
 return map;
}
