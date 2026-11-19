import fs from 'node:fs';
const ROOT='https://seogbtools.com';
const products=fs.readdirSync('content/products').filter(x=>x.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync('content/products/'+f)));
const pages=['/','/shop/','/blog/','/ahrefs-group-buy/','/semrush-group-buy/','/contact-us/'];
const entities=s=>s.replace(/&amp;/g,'&').replace(/&#038;/g,'&');
function attrs(tag){const result={};for(const m of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g))result[m[1].toLowerCase()]=entities(m[2]??m[3]);return result}
function anchors(html){return [...html.matchAll(/<a\b[^>]*>/gi)].map(m=>attrs(m[0])).filter(a=>a.href)}
function icons(html){return [...html.matchAll(/<link\b[^>]*>/gi)].map(m=>attrs(m[0])).filter(a=>/icon|manifest/i.test(a.rel||''))}
async function fetchHtml(path){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{const r=await fetch(ROOT+path,{headers:{'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36','Cache-Control':'no-cache'},signal:controller.signal});return {status:r.status,url:r.url,html:await r.text()}}finally{clearTimeout(timer)}
}
const reports=[];
let next=0,items=products.map(p=>({path:'/'+p.slug+'/',slug:p.slug,local:p.externalUrl||'',type:'product'}));
items=[...pages.map(path=>({path,type:'page'})),...items];
async function worker(){while(next<items.length){const item=items[next++],r={...item};try{const {status,url,html}=await fetchHtml(item.path);r.status=status;r.finalUrl=url;r.bytes=html.length;r.title=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'';const a=anchors(html);r.links=a.filter(x=>/(buy|join|sign.?up|login|log.?in|contact|chat|whatsapp|facebook|messenger|get started)/i.test(x['aria-label']+' '+x.href+' '+x.class)||/(buy|join|sign.?up|login|log.?in|get started)/i.test(html.slice(html.indexOf(x.href)-150,html.indexOf(x.href)+220))).map(x=>({href:x.href,label:x['aria-label']||'',class:x.class||''}));r.checkout=[...new Set(a.map(x=>x.href).filter(u=>/https?:\/\/(?:www\.)?(?:seogroupsbuy\.com|members\.seotoolsgroupbuy\.us)\/(?:users\/)?(?:cart\/|signup|login)/i.test(u)))];r.social=[...new Set(a.map(x=>x.href).filter(u=>/wa\.me|whatsapp\.com|m\.me|facebook\.com|t\.me/i.test(u)))];r.icons=icons(html);r.meta=[...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>attrs(m[0])).filter(a=>/^(og:|twitter:|robots$|google-site-verification$)/i.test(a.property||a.name||''));const link=[...html.matchAll(/<link\b[^>]*>/gi)].map(m=>attrs(m[0]));r.canonical=link.find(l=>l.rel==='canonical')?.href||'';r.buyButtons=[...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(m=>({href:attrs('<a '+m[1]+'>').href||'',text:m[2].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,80)})).filter(x=>/buy now|get access|purchase|subscribe/i.test(x.text));if(r.status!==200)r.warning='non-200';}catch(e){r.error=String(e.message||e)}reports.push(r);if(reports.length%30===0)console.log('Audited',reports.length,'/',items.length)}}
await Promise.all(Array.from({length:4},()=>worker()));
reports.sort((a,b)=>items.findIndex(x=>x.path===a.path)-items.findIndex(x=>x.path===b.path));
const summary={date:new Date().toISOString(),origin:ROOT,pages:reports.filter(x=>x.type==='page'),products:reports.filter(x=>x.type==='product'),count:reports.length};
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/live-reference.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({date:summary.date,homepage:reports[0],productCount:products.length,productExamples:reports.filter(x=>x.type==='product').slice(0,4)},null,2).slice(0,12000));
