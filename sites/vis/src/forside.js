/* Forsiden: rollevalget («Jeg er») filtrerer alle seksjonene (Forstå, Prøv, Dokumenter, Presenter) og markerer gruppene i Prøv selv.
   Rommene og rollene ligger i assets/rom.js. Ingen inline-skript (CSP). */
(function(){
var R=ROM.R,C=ROM.C,G=ROM.G,cur=ROM.rolle();
var roles=document.getElementById('roles'),info=document.getElementById('intro');
function rom(u){return C.filter(function(c){return c.u===u})[0]}
R.forEach(function(r){var b=document.createElement('button');b.type='button';b.className='btn';b.textContent=r[1];b.dataset.r=r[0];b.onclick=function(){set(r[0])};roles.appendChild(b)});
function set(r){
  cur=r;ROM.lagre(r);
  [].forEach.call(roles.children,function(b){b.classList.toggle('dark',b.dataset.r===r);b.setAttribute('aria-pressed',b.dataset.r===r)});
  info.textContent=R.filter(function(x){return x[0]===r})[0][2];
  // enkeltrom (kort, ark og lenker): data-rom="reise" → rommet /reise/
  [].forEach.call(document.querySelectorAll('[data-rom]'),function(e){var c=rom('/'+e.dataset.rom+'/');e.hidden=!(c&&ROM.passer(c,r))});
  // grupper i Prøv selv: antall rom for rollen, og markering når en rolle er valgt
  [].forEach.call(document.querySelectorAll('[data-gruppe]'),function(e){
    var g=e.dataset.gruppe,alle=C.filter(function(c){return c.g===g}),n=alle.filter(function(c){return ROM.passer(c,r)}).length;
    e.hidden=n===0;e.classList.toggle('valgt',r!=='alle'&&n>0);
    e.querySelector('.go').textContent=n+(n===1?' rom':' rom')+(r!=='alle'&&n<alle.length?' (av '+alle.length+')':'')+' ›';
    e.href='/'+g+'/'+(r==='alle'?'':'?rolle='+r);
  });
  // seksjoner uten synlige kort skjules
  [].forEach.call(document.querySelectorAll('section.seksjon'),function(s){
    if(s.dataset.rom)return;
    var kort=s.querySelectorAll('.card'),synlig=[].some.call(kort,function(k){return !k.hidden});
    var lenker=s.querySelectorAll('.lenkerad a[data-rom]'),l=[].some.call(lenker,function(k){return !k.hidden});
    s.hidden=!(synlig||l);
  });
  var n=C.filter(function(c){return ROM.passer(c,r)}).length;
  document.getElementById('alle-rom').textContent='Alle '+(r==='alle'?C.length:n)+' rom ›';
  document.getElementById('alle-rom').href='/rom/'+(r==='alle'?'':'?rolle='+r);
}
set(cur);
// ≡-meny under 768 px
var kn=document.getElementById('menyknapp'),meny=document.getElementById('meny');
kn.onclick=function(){var apen=meny.classList.toggle('apen');kn.setAttribute('aria-expanded',apen)};
[].forEach.call(meny.querySelectorAll('a'),function(a){a.addEventListener('click',function(){meny.classList.remove('apen');kn.setAttribute('aria-expanded','false')})});
})();
