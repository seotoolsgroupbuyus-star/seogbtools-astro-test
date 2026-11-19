import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('reports/live-reference.json','utf8'));
const homepage=data.pages.find(p=>p.path==='/');
const results=[];
for(const p of data.products){
 const live=[...new Set((p.buyButtons||[]).filter(b=>/buy now|purchase|get access/i.test(b.text)).map(b=>b.href).filter(Boolean).filter(u=>/^https?:\/\//.test(u)))];
 const preferred=live.filter(u=>/\/(?:users\/)?cart\/index\/product\/id\//i.test(u));
 const source=preferred.length?preferred:live;
 const unique=[...new Set(source)];
 const current=p.local||'';
 const status=p.status!==200?'HTTP_'+p.status:p.error?'FETCH_ERROR':unique.length===0?'NO_BUY_LINK':unique.length>1?'MULTIPLE_BUY_LINKS':unique[0]===current?'MATCH':'MISMATCH';
 results.push({slug:p.slug,status,current,live:unique.length===1?unique[0]:'',candidateCount:unique.length});
}
const summary={checked:data.date,home:{icons:homepage.icons,canonical:homepage.canonical,meta:homepage.meta,checkout:homepage.checkout,signup:homepage.checkout?.filter(u=>u.includes('signup')),social:homepage.social,buyButtons:homepage.buyButtons},pageSummaries:data.pages.map(p=>({path:p.path,status:p.status,icons:p.icons,checkout:p.checkout,buyButtons:p.buyButtons})),totals:Object.fromEntries([...new Set(results.map(x=>x.status))].map(x=>[x,results.filter(r=>r.status===x).length])),mismatches:results.filter(x=>x.status!=='MATCH'),total:results.length};
fs.writeFileSync('reports/live-summary.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({totals:summary.totals,home:summary.home,mismatches:summary.mismatches.slice(0,12)},null,2).slice(0,13000));
