(function(){
var $=function(i){return document.getElementById(i)};
var nf=function(n,d){return Number(n).toLocaleString('nb-NO',{minimumFractionDigits:d||0,maximumFractionDigits:d||0})};
var kr=function(n){return nf(Math.round(n/100)*100)+' kr'};
var UKER=46,AARSVERK=1650;
// [id, label, standard, min, max, steg, enhet, hint, desimaler]
var INN=[
 ['ordre','Kjøkkenordre per år',220,20,1200,10,'stk'],
 ['best','Leverandørbestillinger per ordre',5,1,15,1,'stk','Kjøkken, benkeplate, hvitevarer, armatur og lignende'],
 ['time','Timekost inkl. sosiale kostnader',650,300,1500,10,'kr'],
 ['selg','Antall selgere',6,1,40,1,'stk'],
 ['avv','Ordre med avvik i ordrebekreftelsen i dag',12,0,50,1,'%'],
 ['avvKr','Snittkostnad per avvik som ikke fanges',4500,0,30000,100,'kr','Ny del, ekstra montørbesøk, frakt, rabatt til kunden'],
 ['tlf','Kundetelefoner om status per ordre',4,0,15,1,'stk'],
 ['innk','Innkjøp per ordre',110000,20000,500000,5000,'kr','Sum leverandørfakturaer for en vanlig ordre']
];
var ANT=[
 ['Tilbud fra CET',[['aTilb','Spart per ordre',35,0,120,1,'min']]],
 ['Ordrebekreftelser',[['aOb','Spart per bestilling på lesing og kontroll',8,0,30,1,'min']]],
 ['Ordrekontroll',[['aFang','Andel av avvikene som fanges før produksjon',70,0,100,5,'%']]],
 ['Statusspørsmål',[['aTlfR','Færre samtaler med Min side og SMS',60,0,100,5,'%'],['aTlfM','Minutter per samtale',6,1,20,1,'min']]],
 ['Montasjeplanlegging',[['aMont','Spart per ordre på plan og beskjed til montør',25,0,90,1,'min']]],
 ['Fakturakontroll',[['aFakt','Spart per faktura',5,0,20,1,'min'],['aFeil','Andel av innkjøpet som er feilfakturert og fanges',0.2,0,3,0.1,'%','',1]]]
];
var DEF={},V={},EL={};
function field(d,host){
 var id=d[0],dec=d[8]||0;DEF[id]=d[2];V[id]=d[2];
 var w=document.createElement('div');w.className='f';
 w.innerHTML='<div class="top"><label for="n_'+id+'">'+d[1]+'</label><span class="felt"><input id="n_'+id+'" type="text" inputmode="'+(dec?'decimal':'numeric')+'" autocomplete="off"><span>'+d[6]+'</span></span></div>'+
  '<input type="range" id="r_'+id+'" min="'+d[3]+'" max="'+d[4]+'" step="'+d[5]+'" aria-label="'+d[1]+'">'+(d[7]?'<p class="hint">'+d[7]+'</p>':'');
 host.appendChild(w);
 var n=w.querySelector('#n_'+id),r=w.querySelector('#r_'+id);EL[id]={n:n,r:r,d:d,dec:dec};
 r.addEventListener('input',function(){V[id]=+r.value;n.value=nf(V[id],dec);calc()});
 n.addEventListener('input',function(){var x=parse(n.value);if(!isNaN(x)){V[id]=clamp(x,d);r.value=V[id];calc()}});
 n.addEventListener('change',function(){n.value=nf(V[id],dec)});
 n.addEventListener('blur',function(){n.value=nf(V[id],dec)});
 n.addEventListener('keydown',function(e){if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();var s=+d[5]*(e.key==='ArrowUp'?1:-1);V[id]=clamp(Math.round((V[id]+s)*10)/10,d);r.value=V[id];n.value=nf(V[id],dec);calc()}});
}
function parse(s){s=String(s).replace(/[\s  ]/g,'').replace(',','.');return s===''?NaN:parseFloat(s)}
function clamp(x,d){var hi=d[0]==='aFang'||d[0]==='aTlfR'||d[0]==='avv'?100:1e9;return Math.max(0,Math.min(x,hi))}
INN.forEach(function(d){field(d,$('inputs'))});
ANT.forEach(function(g){var b=document.createElement('div');b.className='grp';b.innerHTML='<h4>'+g[0]+'</h4>';$('assume').appendChild(b);g[1].forEach(function(d){field(d,b)})});
function sync(){Object.keys(EL).forEach(function(id){var e=EL[id];e.n.value=nf(V[id],e.dec);e.r.value=V[id]})}

$('accBtn').addEventListener('click',function(){var o=this.getAttribute('aria-expanded')==='true';this.setAttribute('aria-expanded',!o);$('accIn').hidden=o});
$('reset').addEventListener('click',function(){Object.keys(DEF).forEach(function(k){V[k]=DEF[k]});sync();calc()});

function calc(){
 var O=V.ordre,B=V.best,T=V.time,best=O*B;
 var P=[];
 var hTilb=O*V.aTilb/60;
 P.push({n:'Tilbud fra CET',h:hTilb,x:0,ex:'Tegningen fra CET blir tilbud og ordre i CRM uten at selgeren taster varelinjer på nytt.',
  f:'Ordre × minutter spart ÷ 60',v:'('+nf(O)+' × '+nf(V.aTilb)+' min ÷ 60 = '+nf(hTilb)+' t)'});
 var hOb=best*V.aOb/60;
 P.push({n:'Ordrebekreftelser',h:hOb,x:0,ex:'Bekreftelsene kommer inn digitalt og sammenlignes linje for linje med bestillingen. Selgeren leser bare avvikene.',
  f:'Ordre × bestillinger per ordre × minutter spart ÷ 60',v:'('+nf(O)+' × '+nf(B)+' × '+nf(V.aOb)+' min ÷ 60 = '+nf(hOb)+' t)'});
 var nAvv=O*V.avv/100*V.aFang/100,kAvv=nAvv*V.avvKr;
 P.push({n:'Avvik fanget i ordrekontrollen',h:0,x:kAvv,ex:'Feil mål, farge eller leveringsuke oppdages før produksjon i stedet for på byggeplassen.',
  f:'Ordre × andel med avvik × andel fanget × kostnad per avvik',v:'('+nf(O)+' × '+nf(V.avv)+' % × '+nf(V.aFang)+' % × '+nf(V.avvKr)+' kr = '+kr(kAvv)+')'});
 var nTlf=O*V.tlf*V.aTlfR/100,hTlf=nTlf*V.aTlfM/60;
 P.push({n:'Færre statusspørsmål',h:hTlf,x:0,ex:'Kunden ser status, leveringsuke og montasjedato på Min side og får SMS når noe endrer seg.',
  f:'Ordre × samtaler per ordre × andel som bortfaller × minutter per samtale ÷ 60',v:'('+nf(O)+' × '+nf(V.tlf)+' × '+nf(V.aTlfR)+' % × '+nf(V.aTlfM)+' min ÷ 60 = '+nf(hTlf)+' t)'});
 var hMont=O*V.aMont/60;
 P.push({n:'Montasjeplanlegging',h:hMont,x:0,ex:'Montøren får jobben, tegninger og leveringer i Hengsel. Ingen egne e-poster, lister eller oppringninger for å sette opp uken.',
  f:'Ordre × minutter spart ÷ 60',v:'('+nf(O)+' × '+nf(V.aMont)+' min ÷ 60 = '+nf(hMont)+' t)'});
 var hFakt=best*V.aFakt/60,kFeil=O*V.innk*V.aFeil/100;
 P.push({n:'Fakturakontroll',h:hFakt,x:kFeil,ex:'Leverandørfakturaen kontrolleres mot ordrebekreftelsen. Pris, frakt og antall som ikke stemmer flagges før betaling.',
  f:'Tid: ordre × bestillinger × minutter spart ÷ 60. Feil fanget: ordre × innkjøp per ordre × andel feilfakturert',
  v:'('+nf(O)+' × '+nf(B)+' × '+nf(V.aFakt)+' min ÷ 60 = '+nf(hFakt)+' t, og '+nf(O)+' × '+nf(V.innk)+' kr × '+nf(V.aFeil,1)+' % = '+kr(kFeil)+')'});
 P.forEach(function(p){p.k=p.h*T+p.x});
 var H=P.reduce(function(s,p){return s+p.h},0),K=P.reduce(function(s,p){return s+p.k},0);
 $('kKr').textContent=kr(K);$('mKr').textContent=kr(K);
 $('kT').textContent=nf(H);
 var pu=H/Math.max(V.selg,1)/UKER;$('kU').textContent=nf(pu,1)+' t';
 $('kUe').textContent=nf(V.selg)+' selgere, 46 arbeidsuker';
 $('kA').textContent=nf(H/AARSVERK,2)+' årsverk';
 var S=P.slice().sort(function(a,b){return b.k-a.k}),mx=Math.max(S[0].k,1);
 var on=document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.n:null;
 $('bars').innerHTML=S.map(function(p){
  var sub=p.h?nf(p.h)+' t':'direkte besparelse';if(p.h&&p.x)sub=nf(p.h)+' t + '+kr(p.x);
  return '<div class="bar" tabindex="0" data-n="'+p.n+'" aria-label="'+p.n+': '+kr(p.k)+' per år. '+p.ex+'"><div class="nm"><span>'+p.n+'</span><em>'+sub+'</em></div><div class="row"><div class="tr"><div class="fl" style="width:'+(p.k/mx*100).toFixed(1)+'%"></div></div><span class="v">'+kr(p.k)+'</span></div><p class="ex">'+p.ex+'</p></div>'}).join('');
 if(on){var e=$('bars').querySelector('[data-n="'+on+'"]');if(e)e.focus()}
 $('how').innerHTML=P.map(function(p){return '<li><b>'+p.n+'</b><span>'+p.f+'.</span><code>'+p.v+'</code></li>'}).join('')+
  '<li><b>Sum</b><span>Timer × timekost + avvik fanget + feilfakturering fanget. Timer per selger per uke = timer ÷ selgere ÷ 46 uker. Årsverk = timer ÷ 1 650.</span><code>('+nf(H)+' t × '+nf(T)+' kr = '+kr(H*T)+', totalt '+kr(K)+')</code></li>';
}
sync();calc();
})();
