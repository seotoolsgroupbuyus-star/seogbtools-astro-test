import fs from 'node:fs';
import assert from 'node:assert/strict';
const mode=process.argv[2];
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,obj)=>fs.writeFileSync(p,JSON.stringify(obj,null,2)+'\n');
if(mode==='prepare'){
  const settings=read('content/settings.json');
  assert.ok(settings.navigation.length>=3&&settings.heroLogos.length>=8);
  settings.navigation[0].text='CMS Edited Main Menu';
  settings.chat.heading='CMS Edited Chat Heading';
  settings.heroLabels.stat2='CMS Edited Stat Caption';
  settings.heroLogos[0]='/assets/images/site/cms-logo.png';
  settings.footerLinks=[{text:'CMS Edited Footer Link',url:'/contact-us/'}];
  write('content/settings.json',settings);
  const home=read('content/homepage.json');
  home.hero.title='CMS Edited Hero Heading';
  home.hero.secondaryUrl='/contact-us/';
  write('content/homepage.json',home);
  const labels=read('content/ui-labels.json');
  labels.product.sale='CMS Sale Label';
  labels.product.related='CMS Related Tools Heading';
  labels.blog.eyebrow='CMS Blog Archive Label';
  labels.category.viewAll='CMS View Category Tools';
  labels.spotlight.featuredTitle='CMS Featured Tools Heading';
  labels.account.message='CMS Portal Intro';
  write('content/ui-labels.json',labels);
  console.log('Prepared safe CMS test edits in disposable CI checkout');
}else if(mode==='check'){
  const html=fs.readFileSync('dist/index.html','utf8');
  for(const v of ['CMS Edited Main Menu','CMS Edited Chat Heading','CMS Edited Stat Caption','cms-logo.png','CMS Edited Footer Link','CMS Edited Hero Heading'])
    assert.ok(html.includes(v),'Missing CMS field in homepage HTML: '+v);
  const productFile=fs.readdirSync('dist').filter(p=>p!=='index.html'&&p!=='_astro').find(p=>fs.existsSync('dist/'+p+'/index.html')&&fs.readFileSync('dist/'+p+'/index.html','utf8').includes('CMS Related Tools Heading'));
  assert.ok(productFile,'Product page missing changed Related Tools heading');
  for(const [file,needle] of [['dist/index.html','CMS Featured Tools Heading'],['dist/blog/index.html','CMS Blog Archive Label'],['dist/cart/index.html','CMS Portal Intro']]){
    assert.ok(fs.readFileSync(file,'utf8').includes(needle),file+' missing '+needle);
  }
  console.log('PASS: Homepage, product, blog, account, menu, logos and site labels are CMS-editable');
}else throw Error('Usage: node scripts/verify-cms-site.mjs prepare|check');
