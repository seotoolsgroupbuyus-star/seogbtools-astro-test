import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const contentDir = path.join(root, 'content');
const findings = { scannedFiles: 0, localImageReferences: 0, missingLocalImages: [], externalWordPressImages: [], tinyImageFiles: [] };
const imageRe = /(?:src|srcset|image|thumbnail|featuredImage)[\\s\\":=]+(?:\\"|')?(https?:\\/\\/[^\\s\\"'<>]+|\\/[^\\s\\"'<>]+\\.(?:png|jpe?g|webp|gif|svg))/gi;
function walk(dir, visit) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes:true })) {
    const full=path.join(dir,ent.name);
    if (ent.isDirectory()) walk(full,visit); else if(ent.isFile()) visit(full);
  }
}
function scanText(file) {
  if (!/\\.(?:json|html|mjs|astro)$/i.test(file)) return;
  findings.scannedFiles++;
  const text = fs.readFileSync(file,'utf8');
  for (const match of text.matchAll(imageRe)) {
    const src=match[1].replace(/\\\\\\//g,'/').replace(/&amp;/g,'&');
    if (/^https?:\\/\\//i.test(src)) {
      if (/seogbtools\\.com\\/wp-content\\/uploads/i.test(src)) findings.externalWordPressImages.push({file:path.relative(root,file),url:src});
    } else if(src.startsWith('/')) {
      const pathname=decodeURIComponent(src.split('?')[0]);
      if(!pathname.startsWith('/assets/')&&!pathname.startsWith('/wp-content/'))continue;
      findings.localImageReferences++;
      const candidate=path.resolve(publicDir,'.'+pathname);
      if(!candidate.startsWith(publicDir+path.sep)||!fs.existsSync(candidate)) findings.missingLocalImages.push({file:path.relative(root,file),src:pathname});
    }
  }
}
walk(contentDir,scanText);
walk(path.join(root,'.generated'),scanText);
walk(path.join(publicDir,'assets','images'),file=>{
 if(!/\\.(?:png|jpe?g|webp|gif|svg)$/i.test(file)) return;
 if(fs.statSync(file).size<300) findings.tinyImageFiles.push({file:path.relative(root,file),bytes:fs.statSync(file).size});
});
for(const k of ['externalWordPressImages','missingLocalImages']) findings[k]=[...new Map(findings[k].map(v=>[v.file+'|'+(v.src||v.url),v])).values()];
const reportDir=path.join(root,'audit');fs.mkdirSync(reportDir,{recursive:true});
fs.writeFileSync(path.join(reportDir,'image-audit.json'),JSON.stringify(findings,null,2));
console.log('Image audit:',findings.localImageReferences,'local refs,',findings.missingLocalImages.length,'missing local refs,',findings.externalWordPressImages.length,'external WP refs,',findings.tinyImageFiles.length,'tiny image candidates');
console.log('Report: audit/image-audit.json');
if(findings.missingLocalImages.length) console.warn('Sample missing:',findings.missingLocalImages.slice(0,10));
