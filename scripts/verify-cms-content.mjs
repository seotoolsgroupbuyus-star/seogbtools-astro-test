import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const errors=[];
const groups=[['products','name'],['posts','title'],['pages','title'],['tools','name']];
let total=0;
for(const [group,primary] of groups){
  const dir=path.join(root,'content',group);
  const entries=fs.readdirSync(dir).filter(f=>f.endsWith('.json'));
  const slugs=new Map();
  for(const entry of entries) {
    const relative='content/'+group+'/'+entry;
    let item;
    try {item=read(relative);}catch(e){errors.push(relative+': invalid JSON ('+e.message+')');continue;}
    if(!item || typeof item!=='object' || Array.isArray(item)) {errors.push(relative+': expected an object');continue;}
    if(typeof item[primary]!=='string'||!item[primary].trim()) errors.push(relative+': missing '+primary);
    if(typeof item.slug!=='string'||!item.slug.trim()) errors.push(relative+': missing slug');
    else {
      const slug=item.slug.trim();
      if(slugs.has(slug)) errors.push('Duplicate '+group+' slug '+slug+' in '+relative+' and '+slugs.get(slug));
      slugs.set(slug,relative);
      if(group!=='tools' && entry!==slug+'.json') errors.push(relative+': filename does not match slug '+slug);
    }
  }
  total+=entries.length;
  console.log(group+': '+entries.length+' entries');
}
for(const file of ['content/homepage.json','content/settings.json','content/plans.json','content/faqs.json','content/spotlight.json','content/steps.json']) {
  try {read(file);}catch(e){errors.push(file+': '+e.message);}
}
if(!fs.existsSync(path.join(root,'.pages.yml')))errors.push('Missing Pages CMS configuration');
if(errors.length) {for(const error of errors)console.error('FAIL:',error);process.exitCode=1;}
else console.log('PASS: '+total+' collection entries parse, unique slugs, required CMS files present.');
