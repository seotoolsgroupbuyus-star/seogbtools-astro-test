// Discover WordPress sitemap-index and ordinary urlset paths without needing a local browser.
const removeEntities = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
export async function sitePaths(origin) {
  const host = new URL(origin).hostname;
  const pending = [origin+'/sitemap_index.xml',origin+'/sitemap.xml',origin+'/wp-sitemap.xml'];
  const visited = new Set(), paths = new Set(['/']);
  let succeeded = false;
  while (pending.length && visited.size < 150) {
    const url=pending.shift();
    if(visited.has(url))continue;
    visited.add(url);
    try {
      const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; SiteParityAudit/1.0)'},signal:AbortSignal.timeout(30000)});
      if(!r.ok)continue;
      const xml=await r.text();
      if(!/<(?:sitemapindex|urlset)\b/i.test(xml))continue;
      succeeded=true;
      const locs=[...xml.matchAll(/<loc[^>]*>([\s\S]*?)<\/loc>/gi)].map(m=>removeEntities(m[1].trim()));
      if(/<sitemapindex\b/i.test(xml)) {
        for(const loc of locs){try{let u=new URL(loc,url);if(u.hostname===host)pending.push(u.href)}catch{}}
      } else {
        for(const loc of locs){try{let u=new URL(loc,url);if(u.hostname===host)paths.add(u.pathname+u.search)}catch{}}
      }
    } catch(e){console.warn('sitemap fetch failed',url,String(e))}
  }
  if(!succeeded)throw new Error('Could not retrieve sitemap from '+origin);
  return [...paths].sort();
}
