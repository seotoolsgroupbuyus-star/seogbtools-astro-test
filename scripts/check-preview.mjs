import fs from 'node:fs';
const root='https://seogbtools-astro-test.bilalfadi11221333.workers.dev';
const tests=['/','/ahrefs-group-buy/','/semrush-group-buy/','/shop/','/blog/','/contact-us/','/favicon.svg'];
const results=[];
for(const path of tests){
 try{const c=new AbortController(),t=setTimeout(()=>c.abort(),20000);let res;try{res=await fetch(root+path,{signal:c.signal,headers:{'Cache-Control':'no-cache','User-Agent':'Mozilla/5.0'}})}finally{clearTimeout(t)}const html=await res.text();results.push({path,status:res.status,type:res.headers.get('content-type'),bytes:html.length,title:(html.match(/<title[^>]*>([^<]*)<\/title>/i)||[])[1]||'',hasFavicon:html.includes('href="/favicon.svg"'),noindex:html.includes('noindex,nofollow'),liveSignup:html.includes('https://seogroupsbuy.com/users/signup'),legacySignup:html.includes('https://members.seotoolsgroupbuy.us/signup'),ahrefsCheckout:html.includes('https://seogroupsbuy.com/users/cart/index/product/id/13/c/'),faviconValid:path==='/favicon.svg'?html.includes('viewBox="0 0 64 64"'):undefined});}catch(e){results.push({path,error:String(e)})}}
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/preview-check.json',JSON.stringify({at:new Date().toISOString(),root,results},null,2)+'\n');
console.log(JSON.stringify(results,null,2));
