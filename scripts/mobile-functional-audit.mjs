import { sitePaths } from './site-paths.mjs';
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const sites={origin:'https://seogbtools.com',preview:'https://seogbtools-astro-test.bilalfadi11221333.workers.dev'};
const paths=await sitePaths(sites.origin);
const browser=await chromium.launch({headless:true});
mkdirSync('mobile-functional-audit',{recursive:true});
const keyPages=new Set(['/','/all-tools/','/pricing/','/faq/','/blog/','/ahrefs-group-buy/','/semrush-group-buy/']);
const report={checked:new Date().toISOString(),sites, sitemapCount:paths.length, pages:[],siteAssets:{}};
const viewports=[{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}];

for(const [siteName,base] of Object.entries(sites)){
 for(const endpoint of ['/robots.txt','/sitemap.xml','/favicon.ico']){
  try{const r=await fetch(base+endpoint,{redirect:'follow'});report.siteAssets[siteName]??={};report.siteAssets[siteName][endpoint]={status:r.status,contentType:r.headers.get('content-type'),bytes:(await r.arrayBuffer()).byteLength}}catch(e){report.siteAssets[siteName]??={};report.siteAssets[siteName][endpoint]={error:String(e)}}
 }
}

for(const path of paths){
 const row={path,sites:{}};
 for(const [siteName,base] of Object.entries(sites)){
  row.sites[siteName]={};
  for(const vp of viewports){
   const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1,isMobile:vp.name==='mobile',hasTouch:vp.name==='mobile'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   try{
    const response=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForTimeout(700);
    const data=await page.evaluate(()=>{
     const visible=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
     const buttons=[...document.querySelectorAll('button,[role="button"]')].filter(visible).map(e=>({text:(e.innerText||e.getAttribute('aria-label')||e.title||'').trim().replace(/\\s+/g,' ').slice(0,100),type:e.getAttribute('type'),disabled:!!e.disabled,ariaExpanded:e.getAttribute('aria-expanded'),ariaControls:e.getAttribute('aria-controls'),href:e.getAttribute('href')}));
     const forms=[...document.forms].map(f=>({action:f.getAttribute('action')||'',method:(f.method||'get').toLowerCase(),fields:[...f.querySelectorAll('input,select,textarea,button')].map(e=>({tag:e.tagName,type:e.type||'',name:e.name||'',required:!!e.required,placeholder:e.placeholder||''}))}));
     const links=[...document.querySelectorAll('a[href]')].map(a=>({text:(a.innerText||a.getAttribute('aria-label')||'').trim().replace(/\\s+/g,' ').slice(0,90),href:a.href,target:a.target||''}));
     const icons=[...document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"],link[rel="manifest"]')].map(x=>({rel:x.rel,href:x.href,type:x.type||''}));
     const schemas=[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>{try{return {valid:true,type:JSON.parse(s.textContent)?.['@type']||null}}catch(e){return {valid:false,error:String(e)}}});
     return {title:document.title,canonical:document.querySelector('link[rel="canonical"]')?.href||'',viewportMeta:document.querySelector('meta[name="viewport"]')?.content||'',scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,scrollHeight:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,buttons,forms,links,icons,schemas,chatWidgets:[...document.querySelectorAll('iframe,[id*="chat" i],[class*="chat" i],[id*="whatsapp" i],[class*="whatsapp" i]')].filter(visible).map(e=>({tag:e.tagName,id:e.id,cls:typeof e.className==='string'?e.className.slice(0,100):'',src:e.src||''})).slice(0,20)};
    });
    row.sites[siteName][vp.name]={status:response?.status()||0,...data,jsErrors:errors};
    if(vp.name==='mobile'&&keyPages.has(path))await page.screenshot({path:'mobile-functional-audit/'+(path.replaceAll('/','_')||'home')+'-'+siteName+'-mobile.png',fullPage:true});
   }catch(e){row.sites[siteName][vp.name]={error:String(e.message||e),jsErrors:errors}}
   await page.close();
  }
 }
 const o=row.sites.origin||{},p=row.sites.preview||{};
 row.compare={
  mobileOverflow:{origin:o.mobile?.overflow??null,preview:p.mobile?.overflow??null},
  desktopOverflow:{origin:o.desktop?.overflow??null,preview:p.desktop?.overflow??null},
  mobileViewportMetaMatch:o.mobile?.viewportMeta===p.mobile?.viewportMeta,
  mobileButtonCount:{origin:o.mobile?.buttons?.length??null,preview:p.mobile?.buttons?.length??null},
  mobileFormCount:{origin:o.mobile?.forms?.length??null,preview:p.mobile?.forms?.length??null},
  mobileIconLinks:{origin:o.mobile?.icons??[],preview:p.mobile?.icons??[]},
  schemaValidity:{origin:(o.mobile?.schemas||[]).every(x=>x.valid),preview:(p.mobile?.schemas||[]).every(x=>x.valid)},
  jsErrors:{origin:o.mobile?.jsErrors||[],preview:p.mobile?.jsErrors||[]}
 };
 report.pages.push(row);
 console.log(path,JSON.stringify(row.compare));
}
await browser.close();
const issues=[];
for(const row of report.pages){
 for(const siteName of Object.keys(sites))for(const vp of viewports){
  const d=row.sites[siteName]?.[vp.name];
  if(!d||d.error||d.status!==200)issues.push({path:row.path,site:siteName,viewport:vp.name,issue:d?.error||'HTTP '+d?.status});
  if(siteName==='preview'&&d?.overflow)issues.push({path:row.path,site:siteName,viewport:vp.name,issue:'horizontal overflow on migrated preview'});
  if(d?.jsErrors?.length)issues.push({path:row.path,site:siteName,viewport:vp.name,issue:'browser JS errors',details:d.jsErrors});
  if((d?.schemas||[]).some(s=>!s.valid))issues.push({path:row.path,site:siteName,viewport:vp.name,issue:'invalid JSON-LD'});
 }
}
report.issueCount=issues.length;report.issues=issues;
writeFileSync('mobile-functional-audit/report.json',JSON.stringify(report,null,2));
if(issues.length)process.exitCode=1;
