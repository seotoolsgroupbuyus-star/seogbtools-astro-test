/** Homepage Section 3. Every displayed title, price, URL and category comes from CMS data. */
const strip=s=>String(s??'').replace(/<[^>]*>/g,' ').trim();
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function shelfOf(tool){
  // Optional value 1–4 is editable in Pages CMS → Homepage Tools → Homepage Shelf.
  const override=Number(tool.homepageShelf);
  if(Number.isInteger(override) && override>=1 && override<=4)return override-1;
  const c=String(tool.category||'').toLowerCase();
  if(/seo|backlink|keyword|audit|rank tracking|competitor/.test(c))return 0;
  if(/writing|content|ai tool|ai writing|text|copywriting/.test(c))return 1;
  if(/design|creative|video edit|video tool|graphic|photo/.test(c))return 2;
  return 3;
}
export function renderGbSection3({home,tools,setting,asset,link,ui}){
  const h=home.tools;
  const categories=Array.isArray(h.categories)?h.categories:[];
  if(!categories.length)return '';
  const grouped=categories.map((c,i)=>({title:String(c.title||''),desc:String(c.description||''),items:[]}));
  for(const tool of tools){
    if(!tool?.slug||!tool?.name)continue;
    const id=Math.min(grouped.length-1,shelfOf(tool));
    const item={name:String(tool.name),price:String(tool.price||''),slug:String(tool.slug),url:link(tool.slug),image:asset(tool.image||'')};
    grouped[id].items.push(item);
  }
  // Merchandising order only: never change CMS prices, names or URLs.
  // Ahrefs and SEMrush must lead the SEO shelf in that order.
  if(grouped[0]) grouped[0].items.sort((a,b)=>{
    const priority=t=>/\bahrefs\b/i.test(t.name)?0:/\bsemrush\b/i.test(t.name)?1:2;
    return priority(a)-priority(b);
  });
  const data=JSON.stringify(grouped).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  const heading=escapeHtml(h.title||'');
  const lead=escapeHtml(h.lead||'');
  const initial=grouped[0];
  const firstRows=initial.items.map(t=>`<li class="gb3-tool-row"><a class="gb3-tool-card" href="${escapeHtml(t.url)}" aria-label="${escapeHtml(t.name)} — ${escapeHtml(t.price||'View tool')}"><span class="gb3-tool-logo">${t.image?`<img src="${escapeHtml(t.image)}" alt="" loading="lazy" decoding="async">`:escapeHtml(t.name.slice(0,2).toUpperCase())}</span><span class="gb3-tool-name">${escapeHtml(t.name)}</span><span class="gb3-tool-link">${escapeHtml(t.price||'View tool')} <span aria-hidden="true">→</span></span></a></li>`).join('');
  const tabs=grouped.map((c,i)=>`<li class="gb3-shelf" data-gb3-shelf="${i}"><button type="button" class="gb3-shelf-button" aria-controls="gb3-console" aria-pressed="${i===0}"><span class="gb3-shelf-meta"><span>${String(i+1).padStart(2,'0')} / ${String(grouped.length).padStart(2,'0')}</span><span>${c.items.length} tools</span></span><span class="gb3-shelf-name"><span class="gb3-shelf-normal">${escapeHtml(c.title)}</span><span class="gb3-shelf-selected" aria-hidden="true">${escapeHtml(c.title)}</span></span><span class="gb3-shelf-chips">${c.items.slice(0,3).map(t=>`<span>${escapeHtml(t.name)}</span>`).join('')}</span></button><span class="gb3-shelf-progress" aria-hidden="true"></span></li>`).join('');
  const fallback=tools.filter(t=>t?.slug&&t?.name).map(t=>`<li><a href="${escapeHtml(link(t.slug))}">${escapeHtml(t.name)} — ${escapeHtml(t.price||'')}</a></li>`).join('');
  return `<link rel="stylesheet" href="/assets/css/gb-home-tools-dv.css"><section id="gb3-collection" class="sgb-tools gb3" aria-labelledby="gb3-heading" aria-label="${escapeHtml(ui?.misc?.toolsSectionAriaLabel||'Premium Marketing Tools Collection')}">
  <div class="gb3-container"><div class="gb3-heading-row"><div><p class="gb3-eyebrow">${escapeHtml(h.eyebrow||'')}</p><h2 id="gb3-heading">${heading}</h2></div><div class="gb3-intro"><p>${lead}</p><div class="gb3-instruction"><span aria-hidden="true">↓</span> Scroll, or pick a shelf</div></div></div>
  <div class="gb3-grid"><ol class="gb3-shelf-list" id="gb3-list">${tabs}</ol>
  <div class="gb3-console" id="gb3-console" aria-live="polite" aria-atomic="false"><div class="gb3-console-top"><span id="gb3-path">~/tools/${escapeHtml(initial.title.toLowerCase().replace(/[^a-z0-9]+/g,'-'))}</span><span id="gb3-dots" class="gb3-dots">${grouped.map((_,i)=>`<i class="${i===0?'on':''}"></i>`).join('')}</span></div>
  <div class="gb3-console-panel" id="gb3-panel"><div class="gb3-console-title"><span class="gb3-counter" id="gb3-num">01</span><h3 id="gb3-title">${escapeHtml(initial.title)}</h3></div><p class="gb3-console-desc" id="gb3-desc">${escapeHtml(initial.desc)}</p><div class="gb3-console-stats"><strong id="gb3-tool-count">${initial.items.length} tools</strong><span>${escapeHtml(setting.brand||'SEOGBTools')} collection</span></div><p class="gb3-rows-label">AVAILABLE TOOLS IN THIS CATEGORY</p><ul class="gb3-tool-list" id="gb3-tools">${firstRows}</ul></div>
  <a class="gb3-console-footer" href="/group/">Explore all available tools <span aria-hidden="true">→</span></a></div></div></div>
  <script type="application/json" id="gb3-data">${data}</script><script defer src="/assets/js/gb-home-tools-dv.js"></script>
  <noscript><div class="gb3-noscript"><ul>${fallback}</ul></div></noscript></section>`;
}