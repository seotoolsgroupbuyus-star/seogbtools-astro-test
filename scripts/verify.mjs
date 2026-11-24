import fs from 'node:fs';
import path from 'node:path';

const base = path.resolve('.generated');
const expected = { products: 203, posts: 4, pages: 14 };
const failures = [];
const warnings = [];
const excluded = new Set(['/cart/', '/checkout/', '/my-account/']);
const domain = 'https://seogbtools.com';

function readJson(file) { return JSON.parse(fs.readFileSync(file,'utf8')); }
function htmlFor(route) {
  return fs.readFileSync(path.join(base, route.split('/').filter(Boolean).join('/'), 'index.html'), 'utf8');
}
function routeExists(route) {
  return fs.existsSync(path.join(base, route.split('/').filter(Boolean).join('/'), 'index.html'));
}
const all = [];
for (const [group, minimum] of Object.entries(expected)) {
  const folder=path.join('content',group);
  const files=fs.readdirSync(folder).filter(x=>x.endsWith('.json'));
  if(files.length<minimum) failures.push(group+' has '+files.length+' records, expected at least '+minimum);
  for (const file of files) {
    const item=readJson(path.join(folder,file));
    const slug=item.slug || '';
    if (!slug || !file.startsWith(slug+'.')) failures.push(group+'/'+file+': bad slug');
    if (group==='products' && !item.name) failures.push(group+'/'+file+': missing name');
    if (group!=='products' && !item.title) failures.push(group+'/'+file+': missing title');
    all.push({group,slug,item});
  }
}
if(!routeExists('/'))failures.push('Missing homepage');
for (const {group,slug} of all) {
  if(slug==='home') continue;
  // The renderer has explicit top-level archive and utility routes.
  const route='/'+slug+'/';
  if(!routeExists(route))failures.push(group+'/'+slug+': missing generated route');
}
const sitemapPath=path.join(base,'sitemap.xml'), robotsPath=path.join(base,'robots.txt');
if(!fs.existsSync(sitemapPath))failures.push('No sitemap.xml');
if(!fs.existsSync(robotsPath))failures.push('No robots.txt');
const sitemap=fs.existsSync(sitemapPath)?fs.readFileSync(sitemapPath,'utf8'):'';
const robots=fs.existsSync(robotsPath)?fs.readFileSync(robotsPath,'utf8'):'';
if(!robots.includes('Sitemap: '+domain+'/sitemap.xml'))failures.push('Bad robots sitemap location');
for (const route of ['/','/group/','/blog/','/ahrefs-group-buy/','/semrush-group-buy/']) {
  if(!routeExists(route)){failures.push('Missing required route '+route);continue;}
  const html=htmlFor(route);
  const canon=domain+route;
  if(!html.includes('rel="canonical" href="'+canon+'"'))failures.push('Canonical mismatch: '+route);
  if(!html.includes('name="robots" content="index,follow"'))failures.push('Public indexing disabled: '+route);
  if(!sitemap.includes('<loc>'+canon+'</loc>'))failures.push('Sitemap omission: '+route);
}
for (const [slug, target] of Object.entries({
  'lynda-group-buy':'/linkedin-learning-group-buy/',
  'copy-ai-group-buy-unlock-creative-copywriting-solutions-at-lower-prices':'/copy-ai/',
  'moz-group-buy-premium-seo-tools':'/moz-group-buy/'
})) {
  const html=htmlFor('/'+slug+'/');
  if (!html.includes('rel="canonical" href="'+domain+target+'"')) failures.push('Yoast canonical override mismatch: '+slug);
}
if(!htmlFor('/').includes('application/ld+json')) failures.push('Homepage structured data missing');
for(const {group,slug,item} of all){
 if(group!=='products')continue;
 const html=htmlFor('/'+slug+'/');
 const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>{try{return JSON.parse(m[1])}catch{return null}});
 const product=schemas.find(x=>x?.['@type']==='Product');
 if(!product){failures.push('Missing or invalid Product JSON-LD: '+slug);continue;}
 if(product.name!==item.name)failures.push('Product schema name mismatch: '+slug);
 if(product.url!==domain+'/'+encodeURIComponent(slug)+'/')failures.push('Product schema URL mismatch: '+slug);
 const price=String(item.salePrice||item.price||'').trim();
 if(/^\d+(?:\.\d{1,2})?$/.test(price)&&(!product.offers||product.offers.price!==price||product.offers.priceCurrency!=='USD'))failures.push('Product schema price mismatch: '+slug);
}
for(const slug of ['seo-tools','ai-tools','marketing-tools','keyword-tools']){
 const route='/product-category/'+slug+'/';
 if(!routeExists(route))failures.push('Missing product category archive: '+route);
 if(!sitemap.includes('<loc>'+domain+route+'</loc>'))failures.push('Missing category sitemap URL: '+route);
}

for(const {group,slug,item} of all){
  if(!item.seoH1 || !['products','posts'].includes(group))continue;
  const expectedH1=String(item.seoH1).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  if(!htmlFor('/'+slug+'/').includes('<h1>'+expectedH1+'</h1>'))failures.push('Custom H1 mismatch: '+slug);
}
for (const route of excluded) {
  if(!routeExists(route))continue;
  if(!htmlFor(route).includes('name="robots" content="noindex,follow"'))failures.push('Utility route should be noindex: '+route);
  if(sitemap.includes('<loc>'+domain+route+'</loc>'))failures.push('Utility route included in sitemap: '+route);
}
for (const f of ['public/assets/css/main.css','public/assets/js/main.js']) if(!fs.existsSync(f))failures.push('Missing '+f);
// Validate every editorial assignment against a rendered, crawlable category archive.
const assignments=readJson('content/category-assignments.json').products;
const allProducts=new Set(all.filter(x=>x.group==='products').map(x=>x.slug));
const archiveHTML=new Map();
for(const [slug,categories] of Object.entries(assignments)){
 if(!allProducts.has(slug)){failures.push('Category mapping references unknown product: '+slug);continue;}
 if(!Array.isArray(categories)||!categories.length){failures.push('Category mapping missing categories: '+slug);continue;}
 for(const category of categories){
  const route='/product-category/'+category+'/';
  if(!routeExists(route)){failures.push('Missing category for assigned product: '+route);continue;}
  if(!archiveHTML.has(category))archiveHTML.set(category,htmlFor(route));
  if(!archiveHTML.get(category).includes('href="/'+encodeURIComponent(slug)+'/\"'))failures.push('Assigned product absent from category: '+slug+' -> '+category);
  if(!sitemap.includes('<loc>'+domain+route+'</loc>'))failures.push('Assigned category excluded from sitemap: '+category);
  if(!archiveHTML.get(category).includes('name="robots" content="index,follow"'))failures.push('Assigned category not indexable: '+category);
 }
}
// Archive quality report: existing routes alone do not prove that taxonomy migrated.
const archiveDir=path.join(base,'product-category');
const archiveNames=fs.existsSync(archiveDir)?fs.readdirSync(archiveDir).filter(name=>routeExists('/product-category/'+name+'/')):[];
const emptyCategories=archiveNames.filter(name=>!htmlFor('/product-category/'+name+'/').includes('class="sgb-product-card"'));
const tagArchiveCount=['tag','product-tag'].reduce((sum,segment)=>sum+(fs.existsSync(path.join(base,segment))?fs.readdirSync(path.join(base,segment)).filter(name=>routeExists('/'+segment+'/'+name+'/')).length:0),0);
const taxonomyReport={categoryArchives:archiveNames.length,emptyCategories,tagArchives:tagArchiveCount};
if(emptyCategories.length)warnings.push(emptyCategories.length+' category archive(s) have no matched products: '+emptyCategories.join(', '));
if(!tagArchiveCount)warnings.push('No tag archive pages generated; taxonomy migration remains unverified.');
const duplicates=new Map();
for(const x of all){const prior=duplicates.get(x.slug);if(prior&&prior!==x.group)warnings.push('Duplicate slug across '+prior+' and '+x.group+': '+x.slug);duplicates.set(x.slug,x.group)}
console.log(JSON.stringify({counts:Object.fromEntries(Object.keys(expected).map(x=>[x,all.filter(v=>v.group===x).length])),routes:all.length,sitemapUrls:(sitemap.match(/<loc>/g)||[]).length,taxonomyReport,warnings,failures},null,2));
if(failures.length)process.exitCode=1;
