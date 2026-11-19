import fs from 'node:fs';
const base='https://seogbtools.com';
const urls=['/favicon.ico','/apple-touch-icon.png','/wp-content/uploads/favicon.ico','/wp-json/wp/v2/settings','/wp-json/'];
const results=[];
for(const path of urls){try{const r=await fetch(base+path,{headers:{'User-Agent':'Mozilla/5.0'},redirect:'follow'});const bytes=new Uint8Array(await r.arrayBuffer());results.push({path,status:r.status,type:r.headers.get('content-type'),size:bytes.length,signature:[...bytes.slice(0,16)].map(v=>v.toString(16).padStart(2,'0')).join(''),finalUrl:r.url});if(path==='/favicon.ico'&&r.ok&&bytes.length<500000&&((bytes[0]===0&&bytes[1]===0&&bytes[2]===1&&bytes[3]===0)||(bytes[0]===137&&bytes[1]===80))){fs.writeFileSync('public/favicon.ico',bytes);results[results.length-1].copiedTo='public/favicon.ico'}}
 catch(e){results.push({path,error:String(e)})}}
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/live-icon-probe.json',JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
