import fs from 'node:fs'; import path from 'node:path';
const base=path.resolve('.generated');
const routes=fs.readdirSync(base,{withFileTypes:true}).filter(x=>x.isDirectory());
const homepage=fs.readFileSync(path.join(base,'index.html'),'utf8');
if(!homepage.includes('sgb-hero')&&!homepage.includes('sgb-page'))throw new Error('Homepage content wrapper missing');
for(const route of routes){if(!fs.existsSync(path.join(base,route.name,'index.html')))throw new Error('Missing '+route.name)}
if(!fs.existsSync('public/assets/css/main.css'))throw new Error('Missing CSS');
if(!fs.existsSync('public/assets/js/main.js'))throw new Error('Missing JS');
console.log('PASS:',routes.length+1,'generated HTML routes; original CSS and JS present');
