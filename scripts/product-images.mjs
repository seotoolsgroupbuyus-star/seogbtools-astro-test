import fs from 'node:fs';
import path from 'node:path';

// Build-only image migration. Original CMS image URLs remain untouched.
// Every public product receives a self-hosted, working cover image.
const root=process.cwd();
const publicDir=path.join(root,'public');
const generatedDir=path.join(publicDir,'assets/images/product-covers');
const validImage=/\.(png|jpe?g|webp|gif|svg|avif)$/i;
const norm=s=>String(s||'').toLowerCase().replace(/&(?:amp|#38);/g,'and').replace(/[^a-z0-9]+/g,'');
const slugToken=s=>String(s||'').toLowerCase().replace(/&(?:amp|#38);/g,'and').replace(/[^a-z0-9]+/g,' ').split(/\s+/).filter(Boolean);
const ignore=new Set(['group','buy','tools','tool','premium','shared','private','account','accounts','access','subscription','subscriptions','for','and','the','with','get','online','advanced','affordable','unlimited','seo','best','platform','software','leading','of','to','in','an','ai','a','professional']);
const xml=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const truncate=(s,n)=>[...String(s||'')].slice(0,n).join('');
function collect(directory){
 if(!fs.existsSync(directory))return [];
 return fs.readdirSync(directory,{withFileTypes:true}).flatMap(e=>e.isDirectory()?collect(path.join(directory,e.name)):validImage.test(e.name)?[path.join(directory,e.name)]:[]);
}
const available=[...collect(path.join(publicDir,'assets/images/site')),...collect(path.join(publicDir,'assets/images/tools'))];
const entries=available.map(file=>{
 const web='/'+path.relative(publicDir,file).split(path.sep).join('/');
 const filename=path.basename(file);
 return {web,filename,normal:norm(filename.replace(/\.[^.]+$/,'')),kind:web.includes('/tools/')?'tools':'site'};
}).filter(e=>!/placeholder|woocommerce|banner-bg|icon-(?:ssl|trusted)|^seo-tools\.svg$/i.test(e.filename));

function imageCandidate(product){
 const original=String(product.image||'');
 const originalPath=original.replace(/^https?:\/\/[^/]+/i,'').split(/[?#]/)[0];
 if(!/^https?:/i.test(original) && originalPath.startsWith('/') && fs.existsSync(path.join(publicDir,originalPath.replace(/^\/+/,''))))return {web:originalPath,source:'existing-local'};
 const originalFile=norm(path.basename(originalPath).replace(/\.[^.]+$/,''));
 // Exact existing filename match (including the WordPress extractor's numbered duplicate names).
 if(originalFile.length>=6){
  const exact=entries.filter(e=>e.normal===originalFile||e.normal.endsWith(originalFile));
  if(exact.length){exact.sort((a,b)=>a.filename.length-b.filename.length);return {web:exact[0].web,source:'original-filename'};}
 }
 const tokens=slugToken(product.slug||product.name).filter(t=>t.length>2&&!ignore.has(t));
 if(!tokens.length)return null;
 const primary=tokens[0];
 let candidates=entries.filter(e=>e.normal.includes(primary) && tokens.every(t=>e.normal.includes(t)));
 if(!candidates.length && tokens.length>1){
  // A named single-token logo is safer than a visually unrelated illustration.
  candidates=entries.filter(e=>e.kind==='tools'&&e.normal.includes(primary)&&e.normal.includes('logo'));
 }
 if(!candidates.length && tokens.length===1)candidates=entries.filter(e=>e.normal.includes(primary));
 if(!candidates.length)return null;
 candidates.sort((a,b)=>{
  const weight=e=>(e.kind==='site'?12:3)+(e.normal.includes('groupbuy')?6:0)+(e.normal.startsWith(primary)?7:0)-(e.filename.startsWith('01_')?3:0)-(e.normal.includes('logo')?4:0);
  return weight(b)-weight(a)||a.filename.length-b.filename.length;
 });
 return {web:candidates[0].web,source:'matched-local'};
}

const themes=[
 ['#111C36','#164E91','#60A5FA'],
 ['#172554','#4C1D95','#A78BFA'],
 ['#07333F','#155E75','#67E8F9'],
 ['#0C263A','#116149','#86EFAC'],
 ['#3C182B','#8B2455','#FDA4AF'],
 ['#3B2313','#9A3412','#FDBA74']
];
function cover(product){
 const title=String(product.name||product.slug||'Premium Tool').replace(/&(?:amp|#38);/gi,'&').replace(/&#(?:8211|8212);/g,'–').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
 const stripped=title.replace(/(?:\s+[–-]\s+.*)$/,'').replace(/\s+Group Buy\b.*$/i,'').trim()||title;
 const words=[...stripped].length>28?truncate(stripped,26)+'…':stripped;
 const hash=[...product.slug].reduce((v,c)=>(v*31+c.charCodeAt(0))>>>0,11);
 const [a,b,c]=themes[hash%themes.length];
 const initials=stripped.split(/[\s._-]+/).filter(Boolean).slice(0,2).map(x=>x[0].toUpperCase()).join('');
 const label=xml(words);
 const size=words.length>22?38:words.length>13?48:62;
 return '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420" role="img" aria-label="'+xml(title)+' product cover">'
 +'<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient></defs>'
 +'<rect width="640" height="420" fill="url(#g)"/>'
 +'<circle cx="560" cy="36" r="180" fill="'+c+'" opacity=".10"/><circle cx="40" cy="390" r="190" fill="'+c+'" opacity=".07"/>'
 +'<rect x="238" y="55" width="164" height="164" rx="38" fill="#fff" fill-opacity=".1" stroke="#fff" stroke-opacity=".18"/>'
 +'<text x="320" y="164" fill="#fff" font-family="Arial,sans-serif" font-size="76" font-weight="700" text-anchor="middle">'+xml(initials)+'</text>'
 +'<text x="320" y="302" fill="#fff" font-family="Arial,sans-serif" font-size="'+size+'" font-weight="700" text-anchor="middle">'+label+'</text>'
 +'<text x="320" y="344" fill="'+c+'" font-family="Arial,sans-serif" font-size="19" text-anchor="middle" letter-spacing="4">PREMIUM TOOL</text>'
 +'</svg>';
}
export function prepareProductImages(products){
 fs.mkdirSync(generatedDir,{recursive:true});
 let matched=0,generated=0;
 const map={};
 for(const p of products){
  const candidate=imageCandidate(p);
  if(candidate){map[p.slug]={...candidate};matched++;continue;}
  const dest=path.join(generatedDir,p.slug+'.svg');
  fs.writeFileSync(dest,cover(p),'utf8');
  map[p.slug]={web:'/assets/images/product-covers/'+encodeURIComponent(p.slug)+'.svg',source:'generated-labeled-cover'};
  generated++;
 }
 const invalid=Object.values(map).filter(e=>!fs.existsSync(path.join(publicDir,decodeURIComponent(e.web).replace(/^\/+/,''))));
 if(invalid.length)throw Error('Some product image files are missing after generation: '+invalid.length);
 console.log('PRODUCT_IMAGE_MIGRATION',JSON.stringify({total:products.length,matchedLocal:matched,generatedCovers:generated,brokenLocal:invalid.length}));
 return map;
}
