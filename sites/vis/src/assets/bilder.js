/* Skjermbilder fra designfilene i Apples enhetsrammer (README «Regel for skjermbilder», assets/enhet.css).
   Et element med data-bilder="navn,navn,…" får bildene fra /skjermbilder/<navn>.webp lagt i sin .skjerm,
   én om gangen, med ‹ › og teller under rammen når det er flere. data-alt gir alt-teksten, data-ingen-nav dropper ‹ ›.
   Bildene har ingen statuslinje (iPhone-rammen har island), så ingen tegnes.
   Skjermbilder.velger(tabs) bytter mellom [data-enhet]-rammer (PC · iPad · Telefon), og Skjermbilder.guide(…)
   kobler «Prøv dette»-stegene til bilder og til loggen «Samtidig i Hengsel». Ingen inline-skript (CSP). */
window.Skjermbilder=(function(){
  /* Bare lys utgave. 1× og 2× som srcset. Lages av scripts/fiktive-skjermer.mjs. */
  var SKJERMMAL=/*SKJERMMAL*/{}/*SKJERMMAL-slutt*/;
  function sett(img,navn){
    var m=SKJERMMAL[navn];if(m){img.width=m[0];img.height=m[1]}
    var b='/skjermbilder/'+navn;
    img.srcset=b+'@1x.webp 1x, '+b+'.webp 2x';img.src=b+'.webp';
  }
  function lag(frame){
    var liste=frame.dataset.bilder.split(',').map(function(s){return s.trim()}).filter(Boolean);
    var skjerm=frame.querySelector('.skjerm'),i=0,nav=null;
    var img=document.createElement('img');img.className='sk';img.decoding='async';skjerm.appendChild(img);
    if(liste.length>1&&frame.dataset.ingenNav===undefined){
      nav=document.createElement('div');nav.className='sk-nav';
      nav.innerHTML='<button type="button" class="btn" data-d="-1" aria-label="Forrige skjermbilde">‹</button><span class="sk-tall" aria-live="polite"></span><button type="button" class="btn" data-d="1" aria-label="Neste skjermbilde">›</button>';
      frame.insertAdjacentElement('afterend',nav);
      [].forEach.call(nav.querySelectorAll('button'),function(b){b.onclick=function(){vis(i+ +b.dataset.d)}});
    }
    var v={liste:liste,frame:frame,endret:null,vis:vis};
    function vis(n){
      n=Math.max(0,Math.min(liste.length-1,n));i=n;v.i=n;
      sett(img,liste[n]);
      img.alt=(frame.dataset.alt||'Skjermbilde')+(liste.length>1?' · '+(n+1)+' av '+liste.length:'');
      if(nav){nav.querySelector('.sk-tall').textContent=(n+1)+' / '+liste.length;
        nav.querySelector('[data-d="-1"]').disabled=n===0;nav.querySelector('[data-d="1"]').disabled=n===liste.length-1}
      skjerm.scrollTop=0;
      if(typeof v.endret==='function')v.endret(n);
    }
    vis(0);return v;
  }
  function alle(root){var m={};[].forEach.call((root||document).querySelectorAll('[data-bilder]'),function(f,k){m[f.id||('f'+k)]=lag(f)});return m}
  /* Enhetsvelger: knapper med data-e, rammer (eller omslag) med data-enhet */
  function velger(tabs){
    var knapper=[].slice.call(tabs.querySelectorAll('[data-e]'));
    function velg(e){
      knapper.forEach(function(b){var on=b.dataset.e===e;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
      [].forEach.call(document.querySelectorAll('[data-enhet]'),function(w){w.hidden=w.dataset.enhet!==e});
    }
    knapper.forEach(function(b){b.onclick=function(){velg(b.dataset.e)}});
    var start=knapper.filter(function(b){return b.classList.contains('on')})[0]||knapper[0];
    if(start)velg(start.dataset.e);
    return {velg:velg};
  }
  /* «Prøv dette»: o.guide (ol med li[data-k]), o.steg = {k:{vis:[viser, indeks], enhet:'pc', logg:[[hvem, tekst, tid], …]}},
     o.logg(hvem, tekst, tid) skriver en logglinje, o.start() skriver startlinjene, o.velger fra velger() */
  function guide(o){
    var gjort={},skrevet={};
    var lis=[].slice.call(o.guide.querySelectorAll('li[data-k]'));
    function marker(){lis.forEach(function(li){li.classList.toggle('d',!!gjort[li.dataset.k])})}
    function trykk(k){
      var s=o.steg[k];if(!s)return;
      gjort[k]=1;marker();
      if(s.enhet&&o.velger)o.velger.velg(s.enhet);
      if(s.vis)s.vis[0].vis(s.vis[1]);
      if(s.logg&&!skrevet[k]&&o.logg){skrevet[k]=1;s.logg.forEach(function(l){o.logg(l[0],l[1],l[2])})}
    }
    lis.forEach(function(li){li.setAttribute('role','button');li.tabIndex=0;
      li.addEventListener('click',function(){trykk(li.dataset.k)});
      li.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();trykk(li.dataset.k)}})});
    function nullstill(){gjort={};skrevet={};marker();if(o.start)o.start();
      var sett=[];Object.keys(o.steg).forEach(function(k){var s=o.steg[k];if(s.vis&&sett.indexOf(s.vis[0])<0){sett.push(s.vis[0]);s.vis[0].vis(0)}});
      if(o.velger&&o.forste)o.velger.velg(o.forste)}
    if(o.reset)o.reset.onclick=nullstill;
    nullstill();
    return {trykk:trykk,nullstill:nullstill};
  }
  return {lag:lag,alle:alle,velger:velger,guide:guide};
})();
