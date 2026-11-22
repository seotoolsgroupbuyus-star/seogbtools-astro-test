import { sitePaths } from './site-paths.mjs';
import { chromium } from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
const origin='https://seogbtools.com',preview='https://seogbtools-astro-test.bilalfadi11221333.workers.dev';
const paths=await sitePaths(origin);
if(!paths.length)throw new Error('No URLs found in original sitemaps');
const browser=await chromium.launch({headless:true});
mkdirSync('parity-audit',{recursive:true});
const viewports=[{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}];
const screenshots=new Set(['/','/shop/','/blog/','/ahrefs-group-buy/','/semrush-group-buy/','/all-tools','/pricing']);
const report={checkedAt:new Date().toISOString(),origin,preview,sitemapUrlCount:paths.length,pages:[]};
function normLinks(links,base){const host=new URL(base).hostname;return [...new Set(links.map(x=>{try{const u=new URL(x);return u.hostname===host?u.pathname+u.search+u.hash:u.origin+u.pathname+u.search+u.hash}catch{return x}}))].sort()}
for(const path of paths){
 const item={path,origin:{},preview:{}};
 for(const [name,base] of [['origin',origin],['preview',preview]]){
  for(const vp of viewports){
   const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1,isMobile:vp.name==='mobile',hasTouch:vp.name==='mobile});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   try{
    const response=await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForTimeout(500);
    const data=await page.evaluate(()=>({
     title:document.title,
     description:document.querySelector('meta[name="description"]')?.content||'',
     robots:document.querySelector('meta[name="robots"]')?.content||'',
     canonical:document.querySelector('link[rel="canonical"]')?.href||'',
     h1:[...document.querySelectorAll('h1')].map(x=>x.innerText.trim()),
     headings:[...document.querySelectorAll('h1,h2,h3')].map(x=>x.tagName+':'+x.innerText.trim().replace(/\\s+/g,' ')),
     text:document.body.innerText.replace(/\\s+/g,' ').trim(),
     links:[...document.querySelectorAll('a[href]')].map(a=>a.href),
     images:[...document.images].map(i=>({src:i.currentSrc||i.src,alt:i.alt,loaded:i.complete&&i.naturalWidth>0})),
     icons:[...document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"],link[rel="manifest"]')].map(x=>({rel:x.rel,href:x.href,type:x.type||''})),
     viewportMeta:document.querySelector('meta[name="viewport"]')?.content||'',
     overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,
     widths:{document:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth},
     buttons:[...document.querySelectorAll('button,[role="button"]')].map(x=>(x.innerText||x.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,80),
     forms:[...document.forms].map(f=>({action:f.action,method:f.method,fields:f.querySelectorAll('input,textarea,select').length})),
     schemas:[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>{try{JSON.parse(s.textContent);return true}catch{return false}})
    }));
    item[name][vp.name]={status:response?.status()||0,...data,jsErrors:errors};
    if(vp.name==='desktop'&&screenshots.has(path))await page.screenshot({path:'parity-audit/'+(path.replaceAll('/','_')||'home')+'-'+name+'.png',fullPage:true});
    if(vp.name==='mobile'&&screenshots.has(path))await page.screenshot({path:'parity-audit/'+(path.replaceAll('/','_')||'home')+'-'+name+'.png',fullPage:true});
   }catch(e){item[name][vp.name]={error:String(e.message||e),jsErrors:errors}}
   await page.close();
  }
 }
 const a=item.origin.desktop||{},b=item.preview.desktop||{};
 const al=normLinks(a.links||[],origin),bl=normLinks(b.links||[],preview);
 item.compare={
  desktopStatusMatch:a.status===b.status,
  mobileStatusMatch:item.origin.mobile?.status===item.preview.mobile?.status,
  titleMatch:a.title===b.title,
  descriptionMatch:a.description===b.description,
  canonicalPathMatch:(a.canonical?new URL(a.canonical).pathname:'')===(b.canonical?new URL(b.canonical).pathname:''),
  h1Match:JSON.stringify(a.h1)===JSON.stringify(b.h1),
  headingsMatch:JSON.stringify(a.headings)===JSON.stringify(b.headings),
  desktopTextSimilarity:a.text?.length&&b.text?.length?Math.round(Math.min(a.text.length,b.text.length)/Math.max(a.text.length,b.text.length)*100):0,
  missingInternalLinks:al.filter(x=>!bl.includes(x)).slice(0,100),
  extraInternalLinks:bl.filter(x=>!al.includes(x)).slice(0,100),
  brokenPreviewImages:(b.images||[]).filter(x=>!x.loaded).map(x=>x.src),
  imageCounts:{origin:a.images?.length||0,preview:b.images?.length||0},
  favicon:{origin:a.icons||[],preview:b.icons||[]},
  mobileOverflow:{origin:item.origin.mobile?.overflow??null,preview:item.preview.mobile?.overflow??null},
  jsErrors:{origin:[...(a.jsErrors||[]),...(item.origin.mobile?.jsErrors||[])],preview:[...(b.jsErrors||[]),...(item.preview.mobile?.jsErrors||[])]},
  invalidPreviewSchemas:(b.schemas||[]).filter(x=>!x).length
 };
 report.pages.push(item);
 console.log(path,JSON.stringify(item.compare));
}
await browser.close();
const failures=report.pages.filter(p=>['origin','preview'].some(n=>['desktop','mobile'].some(v=>!p[n][v]||p[n][v].error||p[n][v].status!==200||p[n][v].overflow||(p[n][v].jsErrors||[]).length))||!p.compare.titleMatch||!p.compare.descriptionMatch||!p.compare.canonicalPathMatch||!p.compare.h1Match||!p.compare.headingsMatch||p.compare.desktopTextSimilarity<98||p.compare.missingInternalLinks.length||p.compare.brokenPreviewImages.length||p.compare.mobileOverflow.preview||p.compare.invalidPreviewSchemas);
report.failedPages=failures.length;report.passedPages=report.pages.length-failures.length;report.failures=failures.map(p=>({path:p.path,compare:p.compare}));
writeFileSync('parity-audit/report.json',JSON.stringify(report,null,2));
if(failures.length)process.exitCode=1;
