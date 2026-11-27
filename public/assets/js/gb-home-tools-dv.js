/* DigitaVision shelves: source-matched clip-path wipe, staggered tool entrance,
 * scroll-selected sticky stage, click-to-scroll. All cards are full-width links.
 */
(()=>{
 const root=document.getElementById('gb3-collection'),blob=document.getElementById('gb3-data');
 if(!root||!blob)return;
 let data;try{data=JSON.parse(blob.textContent)}catch{return}
 if(!Array.isArray(data)||!data.length)return;
 const list=root.querySelector('#gb3-list'),panel=root.querySelector('#gb3-panel'),rows=[...list.querySelectorAll('[data-gb3-shelf]')];
 if(!list||!panel||!rows.length)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const small=()=>window.matchMedia('(max-width:980px)').matches;
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let active=-1,swapTimer=0,finishTimer=0,ignoreUntil=0,raf=0,unfreezeTimer=0,transitionNumber=0;
 function toolRow(t){
   return '<li class="gb3-tool-row"><a class="gb3-tool-card" href="'+safe(t.url)+'" aria-label="'+safe(t.name+' — '+(t.price||'View tool'))+'"><span class="gb3-tool-logo">'+(t.image?'<img alt="" loading="lazy" decoding="async" src="'+safe(t.image)+'">':safe(t.name.slice(0,2).toUpperCase()))+'</span><span class="gb3-tool-name">'+safe(t.name)+'</span><span class="gb3-tool-link">'+safe(t.price||'View tool')+' <span aria-hidden="true">→</span></span></a></li>';
 }
 function setView(i){
   const x=data[i];if(!x)return;
   root.querySelector('#gb3-num').textContent=String(i+1).padStart(2,'0');
   root.querySelector('#gb3-title').textContent=x.title;
   root.querySelector('#gb3-desc').textContent=x.desc;
   root.querySelector('#gb3-path').textContent='~/tools/'+x.title.toLowerCase().replace(/[^a-z0-9]+/g,'-');
   root.querySelector('#gb3-tool-count').textContent=x.items.length+' tools';
   root.querySelector('#gb3-dots').innerHTML=data.map((_,n)=>'<i class="'+(n===i?'on':'')+'"></i>').join('');
   root.querySelector('#gb3-tools').innerHTML=x.items.map(toolRow).join('');
   rows.forEach((r,n)=>r.querySelector('button').setAttribute('aria-pressed',String(i===n)));
 }
 function resetAnimation(){
   panel.classList.remove('is-changing','is-revealing','gb3-wipe-a','gb3-wipe-b');
 }
 function activate(i,animate=true){
   if(!Number.isInteger(i)||!data[i]||active===i)return;
   active=i;
   clearTimeout(swapTimer);clearTimeout(finishTimer);
   const run=++transitionNumber;
   rows.forEach((r,n)=>r.querySelector('button').setAttribute('aria-pressed',String(i===n)));
   if(!animate||reduced.matches){resetAnimation();setView(i);return;}
   // Original DigitaVision uses alternating dvWipeA/B + dvRowA/B;
   // use the same clip reveal and row stagger, with matching alternating names.
   resetAnimation();panel.classList.add('is-changing');
   swapTimer=setTimeout(()=>{
     if(run!==transitionNumber)return;
     setView(i);
     resetAnimation();
     void panel.offsetWidth;
     panel.classList.add('is-revealing',run%2?'gb3-wipe-a':'gb3-wipe-b');
     finishTimer=setTimeout(()=>{if(run===transitionNumber)resetAnimation()},620);
   },125);
 }
 function probeScroll(){
   raf=0;
   if(small()||performance.now()<ignoreUntil)return;
   const rects=rows.map(r=>r.getBoundingClientRect());
   if(!rects.length||rects[rects.length-1].bottom<0||rects[0].top>innerHeight)return;
   const at=innerHeight*.42;
   let nearest=0;
   for(let i=0;i<rects.length;i++)if(rects[i].top<=at)nearest=i;
   activate(nearest);
   rows.forEach((r,i)=>{
     const f=Math.min(1,Math.max(0,(at-rects[i].top)/Math.max(1,rects[i].height)));
     r.querySelector('.gb3-shelf-progress').style.transform='scaleX('+(i===nearest?f:0)+')';
   });
 }
 function queue(){if(!raf)raf=requestAnimationFrame(probeScroll)}
 list.addEventListener('click',e=>{
   const btn=e.target.closest('.gb3-shelf-button');if(!btn)return;
   const row=btn.closest('[data-gb3-shelf]');const i=Number(row?.dataset.gb3Shelf);
   if(!Number.isInteger(i)||!rows[i])return;
   ignoreUntil=performance.now()+1800;
   activate(i);
   if(!small()){
     const top=scrollY+rows[i].getBoundingClientRect().top-innerHeight*.42+24;
     scrollTo({top:Math.max(0,top),behavior:reduced.matches?'instant':'smooth'});
     clearTimeout(unfreezeTimer);
     unfreezeTimer=setTimeout(()=>{ignoreUntil=0;queue()},1800);
   }
 });
 window.addEventListener('scroll',queue,{passive:true});
 window.addEventListener('resize',queue,{passive:true});
 activate(0,false);queue();
})();
