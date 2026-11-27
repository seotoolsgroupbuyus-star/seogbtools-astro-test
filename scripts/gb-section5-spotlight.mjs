/** Section 5. Exact approved dv-pa structure; copy and cards from Pages CMS. */
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fullFeature=f=>{const s=String(f??'');const i=s.indexOf(': ');return i>=0?[s.slice(0,i),s.slice(i+2)]:[s,s]};
export function renderGbSpotlight({home,spotlight,ui}){
 const h=home?.spotlight||{}; const labels=ui?.spotlight||{};
 const items=Array.isArray(spotlight)?spotlight.filter(t=>t?.name):[];
 if(!items.length)return '';
 const ids=['ahrefs','semrush','moz','ubersuggest'];
 const heading=esc(h.title||'').replace(/(Included)$/,'<span class="dv-em-c">$1</span>');
 const radios=items.map((t,i)=>{const id=ids[i]||'tool-'+i;const label=String(t.name).replace(/ Group Buy$/i,'');return `<input class="dv-pa-in" id="dv-pa-r-${id}" name="dv-pa-role" type="radio" value="${id}" aria-controls="dv-pa-res-${id}" ${i===0?'checked':''}><label class="dv-pa-role" for="dv-pa-r-${id}"><span aria-hidden="true" class="dv-pa-stack"><span class="dv-pa-tile">${esc(label.slice(0,1))}</span></span><span>${esc(label)}</span></label>`}).join('');
 const panels=items.map((t,i)=>{
  const id=ids[i]||'tool-'+i;const feats=Array.isArray(t.features)?t.features:[];
  const rows=feats.map(f=>{const [name,desc]=fullFeature(f);return `<li class="dv-pa-job"><span class="dv-pa-job-t">${esc(name)}<span class="dv-pa-job-c">Featured capability</span></span><div class="dv-pa-chips"><span class="dv-pa-chip"><span class="dv-pa-chip-n">${esc(desc)}</span></span></div></li>`}).join('');
  return `<div class="dv-pa-res${i===0?' is-default':''}" id="dv-pa-res-${id}" data-tool="${id}" aria-labelledby="dv-pa-r-${id}"${i!==0?' hidden':''}>
  <div class="dv-pa-main"><p class="dv-pa-who">${esc(labels.featuredTitle||'Featured SEO tool')}</p><h3 class="dv-pa-name">${esc(t.name)}</h3><p class="dv-pa-sum">${esc(t.description)}</p>
  <h4 class="dv-pa-jobs-h">What you can do with it</h4><ul class="dv-pa-jobs">${rows}</ul>
  <div class="dv-pa-alt"><h4 class="dv-pa-alt-h">${esc(labels.moreTitle||'More tools available')}</h4><p class="dv-pa-note">${esc(labels.moreText||'')}</p></div></div>
  <aside class="dv-pa-label"><h4 class="dv-pa-label-h">Tool facts</h4><p class="dv-pa-label-n"><b>${esc(t.name)}</b></p>
  <dl class="dv-pa-facts"><div class="dv-pa-fact"><dt>Tool</dt><dd>${esc(t.name)}</dd></div><div class="dv-pa-fact"><dt>Main use</dt><dd>${esc(fullFeature(feats[0]||'')[0])}</dd></div><div class="dv-pa-fact"><dt>Featured capabilities</dt><dd>${feats.length}</dd></div><div class="dv-pa-fact is-cut is-text"><dt>Learn more</dt><dd>Explore the product and plan details</dd></div></dl>
  <p class="dv-pa-fine">${esc(labels.featuredText||'')} Check the relevant plan for included access.</p><a class="dv-pa-buy" href="/group/">Explore available plans</a><a class="dv-pa-label-l" href="/group/">See available tools</a></aside></div>`;
 }).join('');
 return `<link rel="stylesheet" href="/assets/css/gb-home-spotlight-dv.css"><section class="dv-pa" id="spotlight" data-gb5><div class="dv-pa-wrap"><div class="dv-pa-head"><div><p class="dv-pa-eyebrow">${esc(h.eyebrow||'')}</p><h2 class="dv-pa-h2">${heading}</h2></div><p class="dv-pa-lead">${esc(h.lead||'')}</p></div><fieldset class="dv-pa-ask"><legend class="dv-pa-q">Explore a featured tool</legend><div class="dv-pa-roles">${radios}</div></fieldset>${panels}</div></section><script defer src="/assets/js/gb-home-spotlight-dv.js"></script>`;
}