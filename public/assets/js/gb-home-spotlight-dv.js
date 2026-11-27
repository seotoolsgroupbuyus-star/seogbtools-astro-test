/* DigitaVision-style spotlight selector. Only one result visible at a time. */
(()=>{for(const root of document.querySelectorAll('.dv-pa[data-gb5]')){
 const radios=[...root.querySelectorAll('input[name="dv-pa-role"]')];
 const panels=[...root.querySelectorAll('.dv-pa-res')];
 function show(){const selected=radios.find(r=>r.checked)?.value;
  for(const panel of panels){const active=panel.dataset.tool===selected;panel.hidden=!active;panel.classList.toggle('is-default',active)}
  root.dataset.role=selected||'';
 }
 radios.forEach(r=>r.addEventListener('change',show));show();
}})();