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
  write('content/homepage.json',home);
  console.log('Prepared safe CMS test edits in disposable CI checkout');
}else if(mode==='check'){
  const html=fs.readFileSync('dist/index.html','utf8');
  for(const v of ['CMS Edited Main Menu','CMS Edited Chat Heading','CMS Edited Stat Caption','cms-logo.png','CMS Edited Footer Link','CMS Edited Hero Heading'])
    assert.ok(html.includes(v),'Missing CMS field in homepage HTML: '+v);
  console.log('PASS: Menu, footer, chat, logo, hero and labels edited through CMS and rendered');
}else throw Error('Usage: node scripts/verify-cms-site.mjs prepare|check');
