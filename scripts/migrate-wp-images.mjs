/**
 * Downloads images referenced in WordPress-exported content without touching
 * the original site. Node 22+. Re-running is safe.
 *
 * Usage: node scripts/migrate-wp-images.mjs
 *        node scripts/migrate-wp-images.mjs --dry-run
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = path.join(root, 'content');
const uploadsRoot = path.join(root, 'public', 'assets', 'wp-uploads');
const reportFile = path.join(root, 'audit', 'wp-image-migration.json');
const dryRun = process.argv.includes('--dry-run');
const hostname = 'seogbtools.com';
const imageExtension = /\.(?:png|jpe?g|webp|gif|svg|avif)$/i;
const urlPattern = /https:\/\/(?:www\.)?seogbtools\.com\/wp-content\/uploads\/[^\s"'<>\\)]+/gi;
const files = [];
const references = new Map();

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(file);
    else if (ent.isFile() && ent.name.endsWith('.json')) files.push(file);
  }
}
function extract(text) {
  return [...text.matchAll(urlPattern)].map(m => m[0].replace(/&amp;/g, '&')).filter(str => {
    try { return imageExtension.test(new URL(str).pathname); } catch { return false; }
  });
}
function localPath(remote) {
  const u = new URL(remote);
  if (u.hostname !== hostname && u.hostname !== 'www.' + hostname) throw Error('External host');
  const marker = '/wp-content/uploads/';
  if (!u.pathname.startsWith(marker)) throw Error('Invalid source path');
  const raw = decodeURIComponent(u.pathname.slice(marker.length));
  const parts = raw.split('/');
  if (!parts.length || parts.some(p => !p || p === '.' || p === '..' || p.includes('\\'))) throw Error('Unsafe file path');
  if (!imageExtension.test(parts.at(-1))) throw Error('Unsupported extension');
  const disk = path.resolve(uploadsRoot, ...parts);
  if (!disk.startsWith(uploadsRoot + path.sep)) throw Error('Invalid destination');
  return { disk, publicUrl: '/assets/wp-uploads/' + parts.map(encodeURIComponent).join('/') };
}
function validImage(bytes, extension) {
  if (bytes.length < 12 || bytes.length > 100_000_000) return false;
  if (extension === '.png') return bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (extension === '.jpg' || extension === '.jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (extension === '.webp') return bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP';
  if (extension === '.gif') return ['GIF87a','GIF89a'].includes(bytes.toString('ascii',0,6));
  if (extension === '.avif') return bytes.toString('ascii',4,12).includes('ftypavif') || bytes.toString('ascii',4,16).includes('ftypavis');
  if (extension === '.svg') return /<svg[\s>]/i.test(bytes.toString('utf8',0,Math.min(4096,bytes.length)));
  return false;
}
function ext(file) { return path.extname(file).toLowerCase(); }
async function download(url, dest) {
  if (fs.existsSync(dest)) {
    const bytes = fs.readFileSync(dest);
    if (validImage(bytes,ext(dest))) return 'existing';
  }
  for (let attempt=0; attempt<3; attempt++) {
    try {
      const response = await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(30000),headers:{'User-Agent':'SEOGBTools-Content-Migration/1.0','Accept':'image/avif,image/webp,image/png,image/jpeg,image/gif,image/svg+xml,*/*'}});
      if (!response.ok) throw Error('HTTP ' + response.status);
      const size = Number(response.headers.get('content-length') || 0);
      if (size>100_000_000) throw Error('Over 100 MB');
      const bytes=Buffer.from(await response.arrayBuffer());
      if (!validImage(bytes,ext(dest))) throw Error('Response was not a valid image: ' + bytes.length + ' bytes');
      fs.mkdirSync(path.dirname(dest),{recursive:true});
      const temporary=dest+'.part';
      fs.writeFileSync(temporary,bytes);
      fs.renameSync(temporary,dest);
      return 'downloaded';
    } catch(error) {
      if(attempt===2) throw error;
      await new Promise(resolve=>setTimeout(resolve,600*(attempt+1)));
    }
  }
}
walk(contentRoot);
for (const file of files) {
  let data;
  try { data=JSON.parse(fs.readFileSync(file,'utf8')); } catch { console.warn('Skipping invalid JSON:',file); continue; }
  function visit(value) {
    if (typeof value === 'string') {
      for (const remote of extract(value)) {
        const item=references.get(remote) || { files:new Set() };
        item.files.add(path.relative(root,file));
        references.set(remote,item);
      }
    } else if(Array.isArray(value)) value.forEach(visit);
    else if(value && typeof value === 'object') Object.values(value).forEach(visit);
  }
  visit(data);
}
const urls=[...references.keys()];
const results=new Map(), failures=[];
let counter=0, downloaded=0, existing=0;
console.log('Found',urls.length,'unique WordPress image URLs in',files.length,'content files');
if(dryRun) {
  for(const u of urls) console.log(u);
  process.exit(0);
}
let index=0;
const workers=Array.from({length:5},async()=>{
  while (index<urls.length) {
    const url=urls[index++];
    try {
      const dest=localPath(url);
      const action=await download(url,dest.disk);
      if(action==='existing') existing++; else downloaded++;
      results.set(url,dest.publicUrl);
    } catch(error) {
      failures.push({url,error:String(error.message || error),files:[...references.get(url).files]});
    }
    counter++;
    if(counter%50===0 || counter===urls.length) console.log('Processed',counter+'/'+urls.length,'images; failed:',failures.length);
  }
});
await Promise.all(workers);
// Only replace original URLs after a real, validated image file is saved.
let changedFiles=0, changedReferences=0;
for(const file of files) {
  const original=fs.readFileSync(file,'utf8');
  let data;
  try { data=JSON.parse(original); } catch { continue; }
  function replace(value) {
    if(typeof value==='string') {
      return value.replace(urlPattern,m=>{
        const cleaned=m.replace(/&amp;/g,'&');
        if(!imageExtension.test(new URL(cleaned).pathname)) return m;
        const replacement=results.get(cleaned);
        if(replacement) {changedReferences++;return replacement;}
        return m;
      });
    }
    if(Array.isArray(value)) return value.map(replace);
    if(value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([key,val])=>[key,replace(val)]));
    return value;
  }
  data=replace(data);
  const output=JSON.stringify(data,null,2)+'\n';
  if(output!==original){fs.writeFileSync(file,output);changedFiles++;}
}
const report={source:hostname,uniqueRemoteUrls:urls.length,downloaded,alreadyPresent:existing,failed:failures.length,changedContentFiles:changedFiles,replacedReferences:changedReferences,failures};
fs.mkdirSync(path.dirname(reportFile),{recursive:true});
fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');
console.log('RESULT:',JSON.stringify({unique:urls.length,downloaded,existing,failed:failures.length,changedFiles,changedReferences}));
console.log('Report:',reportFile);
if (failures.length) console.warn('Some images could not be migrated. Original URLs are retained for those images.');
