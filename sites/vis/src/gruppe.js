/* Gruppesidene (/butikken/, /montoren/, /kunden/, /leverandoren/): lister rommene i gruppen, filtrert på valgt rolle. */
(function(){
var out=document.getElementById('out'),g=out.dataset.gruppe,G=ROM.G[g],r=ROM.rolle();
document.getElementById('tittel').textContent=G.t+' · '+G.n;
document.getElementById('lede').textContent=G.lede;
var liste=ROM.C.filter(function(c){return c.g===g&&ROM.passer(c,r)});
out.innerHTML=liste.length?liste.map(ROM.card).join(''):'<p class="empty">Ingen rom for denne rollen.</p>';
var kn=document.getElementById('menyknapp'),meny=document.getElementById('meny');
kn.onclick=function(){var apen=meny.classList.toggle('apen');kn.setAttribute('aria-expanded',apen)};
})();
