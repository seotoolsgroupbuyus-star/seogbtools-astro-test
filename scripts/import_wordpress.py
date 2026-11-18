#!/usr/bin/env python3
"""Import a WordPress WXR XML into Pages CMS JSON files.
Usage: python scripts/import_wordpress.py /path/to/export.xml
XML contains media URL references, not media bytes. Does not publish drafts/trash.
"""
from __future__ import annotations
import sys, json, re, shutil, collections, xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1]
CONTENT=ROOT/'content'
W='{http://wordpress.org/export/1.2/}'
CO='{http://purl.org/rss/1.0/modules/content/}'
EX='{http://wordpress.org/export/1.2/excerpt/}'
def get(it,key,default=''): return it.findtext(key, default) or default
def save(p,obj): p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def slug_clean(s):return re.sub(r'[^a-z0-9-]+','-',s.lower()).strip('-') or 'untitled'
def mget(el):return {get(m,W+'meta_key'):get(m,W+'meta_value') for m in el.findall(W+'postmeta')}
def primary_image(it,meta,attachments):
    aid=meta.get('_thumbnail_id','');
    if aid in attachments:return attachments[aid]
    return ''
def main(xml):
    tree=ET.parse(xml); root=tree.getroot(); records=root.findall('./channel/item')
    counts=collections.Counter((get(x,W+'post_type'),get(x,W+'status')) for x in records)
    attachments={get(x,W+'post_id'):get(x,W+'attachment_url') for x in records if get(x,W+'post_type')=='attachment'}
    published=[x for x in records if get(x,W+'status')=='publish']
    for folder in ('products','posts','pages'):
        d=CONTENT/folder
        for f in d.glob('*.json'):f.unlink()
    collisions=[]; used=set(); missing_images=[]; summary={}
    for typ,folder in (('product','products'),('post','posts'),('page','pages')):
        number=0
        for x in published:
            if get(x,W+'post_type')!=typ:continue
            slug=slug_clean(get(x,W+'post_name') or get(x,'title'))
            # preserve originals; report duplicate paths instead of silently replacing
            if slug in used:
                collisions.append({'type':typ,'slug':slug,'title':get(x,'title')});continue
            used.add(slug)
            m=mget(x);body=get(x,CO+'encoded');excerpt=get(x,EX+'encoded')
            image=primary_image(x,m,attachments)
            if not image:missing_images.append({'type':typ,'slug':slug})
            common={'seoTitle':m.get('_yoast_wpseo_title',''),'seoDescription':m.get('_yoast_wpseo_metadesc',''), 'image':image}
            if typ=='product':
                categories=[(c.text or '').strip() for c in x.findall('category') if c.attrib.get('domain')=='product_cat']
                p={
                   'name':get(x,'title'),'slug':slug,'category':categories[0] if categories else '',
                   'categories':categories,'price':m.get('_price',''),'regularPrice':m.get('_regular_price',''),
                   'salePrice':m.get('_sale_price',''),'onSale':bool(m.get('_sale_price','')),
                   'shortDescription':excerpt,'description':body,
                   'externalUrl':m.get('_sgb_buy_url') or m.get('_product_url') or '',
                   'seoTitle':common['seoTitle'],'seoDescription':common['seoDescription'],
                   'image':image or m.get('_sgb_logo_url',''),
                   'wpId':get(x,W+'post_id'), 'lastModified':get(x,W+'post_modified'),
                   'seoH1':m.get('_sgb_seo_h1',''), 'focusKeyword':m.get('_yoast_wpseo_focuskw','')}
            else:
                p={'title':get(x,'title'),'slug':slug,'content':body,'excerpt':excerpt,
                   **common,'wpId':get(x,W+'post_id'),'lastModified':get(x,W+'post_modified'),
                   'seoH1':m.get('_sgb_seo_h1',''),'focusKeyword':m.get('_yoast_wpseo_focuskw','')}
            save(CONTENT/folder/(slug+'.json'),p);number+=1
        summary[folder]=number
    plans=[]
    for x in published:
        if get(x,W+'post_type')!='pricing_plan':continue
        m=mget(x)
        try: tools=json.loads(m.get('_sgb_tools') or '[]')
        except json.JSONDecodeError:tools=[]
        plans.append({'name':get(x,'title'),'price':m.get('_sgb_price',''),'description':m.get('_sgb_description',''),'popular':m.get('_sgb_popular')=='1','tools':tools,'buyUrl':m.get('_sgb_buy_url',''),'slug':get(x,W+'post_name')})
    if plans: save(CONTENT/'plans.json',plans)
    faqs=[{'question':get(x,'title'),'answer':get(x,CO+'encoded')} for x in published if get(x,W+'post_type')=='sgb_faq']
    if faqs:save(CONTENT/'faqs.json',faqs)
    # URL list records attachments, allowing subsequent offline download from WP uploads archive.
    media=[{'id':get(x,W+'post_id'),'url':get(x,W+'attachment_url'),'title':get(x,'title')} for x in records if get(x,W+'post_type')=='attachment']
    mig=ROOT/'migration';mig.mkdir(exist_ok=True)
    save(mig/'media-manifest.json',media)
    save(mig/'import-report.json',{
      'source':Path(xml).name,'countsByTypeStatus':{f'{a}/{b}':v for (a,b),v in counts.items()},
      'publishedImported':summary,'plans':len(plans),'faqs':len(faqs),
      'mediaReferences':len(media),'filesDownloaded':0,
      'withoutFeaturedImage':missing_images,'slugCollisionsSkipped':collisions,
      'notes':['WordPress XML stores media references only, not image binary files.',
         'HTML from WordPress is preserved (including WP shortcodes that may need replacement).',
         'WordPress backend/payment/reviews/forms are not automatically migrated.',
         'Do not change DNS until Cloudflare build and visual/SEO checks pass.']})
    print(json.dumps({'imported':summary,'plans':len(plans),'faqs':len(faqs),'mediaReferences':len(media),'collisions':collisions},indent=2))
if __name__=='__main__':
    if len(sys.argv)!=2:sys.exit('Usage: python scripts/import_wordpress.py export.xml')
    main(sys.argv[1])
