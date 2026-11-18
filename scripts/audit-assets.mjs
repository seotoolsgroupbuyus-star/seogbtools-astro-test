import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicRoot = path.resolve('public');
const report = { scannedFiles: 0, localReferences: 0, missingLocalImages: [], externalWordPressImages: [], tinyImageCandidates: [] };
function walk(folder, visit) {
  if (!fs.existsSync(folder)) return;
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) walk(file, visit);
    else if (entry.isFile()) visit(file);
  }
}
const seen = new Set();
function checkSource(source, relativeFile) {
  for (const url of source.match(/https?:\/\/[^\s"'<>\\]+|\/assets\/images\/[^\s"'<>\\]+/gi) || []) {
    const normalized = url.replace(/\\u002F/gi, '/').replace(/&amp;/g, '&').replace(/\\\//g, '/');
    if (/^https?:\/\//i.test(normalized)) {
      if (/^https?:\/\/(?:www\.)?seogbtools\.com\/wp-content\/uploads\//i.test(normalized)) {
        const key = relativeFile + '|' + normalized;
        if (!seen.has(key)) { seen.add(key); report.externalWordPressImages.push({ file: relativeFile, url: normalized }); }
      }
      continue;
    }
    const pathname = normalized.split(/[?#]/)[0];
    if (!pathname.startsWith('/assets/images/')) continue;
    report.localReferences++;
    const target = path.resolve(publicRoot, '.' + pathname);
    if (target.startsWith(publicRoot + path.sep) && !fs.existsSync(target)) {
      const key = relativeFile + '|' + pathname;
      if (!seen.has(key)) { seen.add(key); report.missingLocalImages.push({file: relativeFile, path: pathname}); }
    }
  }
}
for (const folder of ['content', '.generated']) {
  walk(path.join(root, folder), file => {
    if (!/\.(json|html)$/i.test(file)) return;
    report.scannedFiles++;
    checkSource(fs.readFileSync(file, 'utf8'), path.relative(root, file));
  });
}
walk(path.join(publicRoot, 'assets/images'), file => {
  if (/\.(png|jpe?g|webp|gif|svg)$/i.test(file)) {
    const bytes = fs.statSync(file).size;
    if (bytes < 300) report.tinyImageCandidates.push({ file: path.relative(root, file), bytes });
  }
});
fs.mkdirSync(path.join(root, 'audit'), { recursive: true });
fs.writeFileSync(path.join(root, 'audit/image-audit.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  scannedFiles:report.scannedFiles,localReferences:report.localReferences,
  missingLocalImages:report.missingLocalImages.length,
  externalWordPressImages:report.externalWordPressImages.length,
  tinyImageCandidates:report.tinyImageCandidates.length
},null,2));
console.log('Details saved to audit/image-audit.json');
