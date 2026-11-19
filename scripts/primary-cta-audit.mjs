import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync('reports/live-reference.json','utf8'));
const rows=d.products.map(p=>({slug:p.slug,status:p.status,previous:p.local,first:(p.buyButtons||[]).slice(0,2),total:(p.buyButtons||[]).length}));const mismatch=rows.filter(r=>r.first[0]&&r.first[0].href!==r.previous);
const summary={total:rows.length,match:rows.length-mismatch.length,mismatchCount:mismatch.length,mismatch,first20:rows.slice(0,20)};
fs.writeFileSync('reports/primary-cta-audit.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({total:summary.total,mismatchCount:summary.mismatchCount,samples:mismatch.slice(0,15)},null,2).slice(0,10000));
