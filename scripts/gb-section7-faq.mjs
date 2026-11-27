/** Section 7 FAQ: approved DigitaVision layout, original editable SEOGBTools content. */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const plus='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const whats='<svg viewBox="0 0 256 256" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"><path d="M45 177a96 96 0 1 1 34 34L45 220a8 8 0 0 1-10-10z"/><path d="M152 184a80 80 0 0 1-80-80 28 28 0 0 1 28-28l18 28-9 16a48 48 0 0 0 23 24l16-9 28 18a28 28 0 0 1-24 31z"/></svg>';
const messenger='<svg viewBox="0 0 256 256" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"><path d="M45 177a96 96 0 1 1 34 34L45 220a8 8 0 0 1-10-10z"/><circle cx="80" cy="128" r="10" fill="currentColor" stroke="none"/><circle cx="128" cy="128" r="10" fill="currentColor" stroke="none"/><circle cx="176" cy="128" r="10" fill="currentColor" stroke="none"/></svg>';
export function renderGbFaq({home,faqs,setting}){
 const h=home.faq||{},questions=Array.isArray(faqs)?faqs:[];
 const title=esc(h.title||'');
 const em=title.replace(/(Usually Ask)$/,'<span class="dv-em">$1</span>');
 const topics=(Array.isArray(h.topics)?h.topics:[]).map(t=>'<li>'+esc(t)+'</li>').join('');
 const contacts=[
 {label:'WhatsApp',href:setting.whatsappUrl,svg:whats},
 {label:'Messenger',href:setting.messengerUrl,svg:messenger}
 ].filter(x=>x.href).map(x=>'<li><a class="dv-contact" href="'+esc(x.href)+'" target="_blank" rel="noopener noreferrer" aria-label="'+x.label+' support"><span class="dv-contact-ic">'+x.svg+'</span><small>'+x.label+'</small></a></li>').join('');
 const list=questions.map((f,i)=>{
  const id='dv-faq-'+i;
  return '<div class="dv-faq-item"><h3><button type="button" class="dv-faq-btn" data-dv-faq="'+id+'" aria-controls="'+id+'" aria-expanded="'+(i===0?'true':'false')+'"><span class="dv-faq-num">Q.'+String(i+1).padStart(2,'0')+'</span><span class="dv-faq-question">'+esc(f.question)+'</span><span class="dv-faq-icon" aria-hidden="true">'+plus+'</span></button></h3><div class="dv-faq-answer" id="'+id+'"'+(i?' hidden':'')+'>'+String(f.answer||'')+'</div></div>';
 }).join('');
 return '<link rel="stylesheet" href="/assets/css/gb-home-faq-dv.css"><section id="faq" class="dv dv-faq-source" aria-labelledby="dv-faq-h"><div class="dv-faq-wrap"><div class="dv-sticky-l"><p class="dv-faq-kicker">'+esc(h.eyebrow)+'</p><h2 id="dv-faq-h">'+em+'</h2><p class="dv-faq-intro">'+esc(h.intro)+'</p><ul class="dv-contacts" aria-label="Ways to reach us">'+contacts+'</ul>'+(topics?'<details class="dv-faq-topics"><summary>Topics covered</summary><ul>'+topics+'</ul></details>':'')+'</div><div class="dv-faq-list" data-dv-faqs>'+list+'</div></div></section><script defer src="/assets/js/gb-home-faq-dv.js"></script>';
}