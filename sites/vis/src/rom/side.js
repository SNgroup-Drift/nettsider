/* /rom/: alle rommene, filtrert på rolle og gruppert etter type. Rommene og rollene ligger i assets/rom.js. */
(function(){
var R=ROM.R,C=ROM.C,cur=ROM.rolle();
var roles=document.getElementById('roles'),out=document.getElementById('out');
R.forEach(function(r){var b=document.createElement('button');b.type='button';b.className='btn';b.textContent=r[1];b.dataset.r=r[0];b.onclick=function(){set(r[0])};roles.appendChild(b)});
function set(r){cur=r;ROM.lagre(r);
 [].forEach.call(roles.children,function(b){b.classList.toggle('valgt',b.dataset.r===r);b.setAttribute('aria-pressed',b.dataset.r===r)});
 var info=R.filter(function(x){return x[0]===r})[0];document.getElementById('intro').textContent=info[2];
 var list=C.filter(function(c){return ROM.passer(c,r)}),h='';
 var groups=[['Se hvordan det henger sammen',['Simulering']],['Prøv selv',['Prøv selv']],['Presentasjoner og oversikter',['Presentasjon','Oversikt','Dokumenter']],['Opplæring',['Opplæring']]];
 groups.forEach(function(g){var l=list.filter(function(c){return g[1].indexOf(c.type)>-1});if(l.length)h+='<section><h3>'+g[0]+'</h3><div class="grid">'+l.map(ROM.card).join('')+'</div></section>'});
 out.innerHTML=h||'<p class="empty">Ingenting her ennå.</p>';
 document.getElementById('note').textContent=r==='alle'?'Alle '+C.length+' rom. Velg en rolle for å se bare det som gjelder deg.':list.length+' rom for '+info[1].toLowerCase()+'.'}
set(cur);
var kn=document.getElementById('menyknapp'),meny=document.getElementById('meny');
kn.onclick=function(){var apen=meny.classList.toggle('apen');kn.setAttribute('aria-expanded',apen)};
})();
