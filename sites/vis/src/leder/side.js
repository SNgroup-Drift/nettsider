(function(){
var $=function(i){return document.getElementById(i)};
var fmt=function(n){return Math.round(n).toLocaleString('nb-NO')};
var mill=function(n){return (n/1e6).toLocaleString('nb-NO',{minimumFractionDigits:1,maximumFractionDigits:1})+' mill.'};
var B={hamar:'Hamar',lillehammer:'Lillehammer',gjovik:'Gjøvik'};
var W=[43,44,45,46,47,48,49,50,51,52];
var R={hamar:[1.10,1.35,0.92,1.48,1.21,0.86,1.02,0.74,0.40,0.12],lillehammer:[0.82,0.95,1.12,0.88,0.70,0.91,0.65,0.52,0.30,0.08],gjovik:[0.55,0.62,0.48,0.71,0.66,0.40,0.52,0.35,0.18,0.05]};
var CAP={hamar:1.3,lillehammer:1.0,gjovik:0.7};
var SEL=[['Ingrid','hamar',2.9,4.1,38,31.2,3],['Martin','hamar',1.8,2.6,33,29.4,5],['Siri','lillehammer',2.2,3.3,41,32.0,1],['Jonas','lillehammer',1.4,1.9,29,28.1,2],['Kaja','gjovik',1.6,2.2,36,30.5,2],['Henrik','gjovik',0.9,1.1,27,27.6,4]];
var RISK=[['hamar','Ordre 24-0791 · Berg','Avvik i bekreftelsen, endringsfrist i morgen.'],['hamar','Uke 46 over kapasitet','1,48 mill. mot normalt 1,3 mill. To montasjer bør flyttes eller leies inn.'],['lillehammer','Ordre 24-0803 · Nilsen','Benkeplate bekreftet uke 48, montering satt til uke 47.'],['gjovik','Faktura 77412 · Nordstein','400 kr over bekreftet pris og frakt som ikke er avtalt.'],['lillehammer','Tilbud T-1188 · Sætre','Stort tilbud (412 000 kr) uten oppfølging på 12 dager.']];
var cur='alle';
[['alle','Alle butikker']].concat(Object.keys(B).map(function(k){return[k,B[k]]})).forEach(function(x){var b=document.createElement('button');b.type='button';b.className='btn';b.textContent=x[1];b.dataset.k=x[0];b.onclick=function(){set(x[0])};$('filt').appendChild(b)});
function keys(){return cur==='alle'?Object.keys(B):[cur]}
function set(k){cur=k;[].forEach.call($('filt').children,function(b){var on=b.dataset.k===k;b.classList.toggle('valgt',on);b.setAttribute('aria-pressed',on)});
 var ks=keys(),res=W.map(function(_,i){return ks.reduce(function(s,b){return s+R[b][i]},0)*1e6}),cap=ks.reduce(function(s,b){return s+CAP[b]},0)*1e6;
 var sel=SEL.filter(function(s){return ks.indexOf(s[1])>-1});
 var tilbud=sel.reduce(function(s,x){return s+x[2]},0)*1e6,vunnet=sel.reduce(function(s,x){return s+x[3]},0)*1e6;
 var db=sel.reduce(function(s,x){return s+x[5]*x[3]},0)/sel.reduce(function(s,x){return s+x[3]},0);
 var tr=sel.reduce(function(s,x){return s+x[4]*x[3]},0)/sel.reduce(function(s,x){return s+x[3]},0);
 var saker=sel.reduce(function(s,x){return s+x[6]},0),tot=res.reduce(function(a,b){return a+b},0);
 $('kpi').innerHTML=[['Ordrereserve',mill(tot),'neste 10 uker'],['Tilbud ute',mill(tilbud),'åpne tilbud'],['Treffprosent',Math.round(tr)+' %','siste 90 dager'],['Dekningsbidrag',db.toLocaleString('nb-NO',{maximumFractionDigits:1})+' %','vunne ordre'],['Åpne saker',saker,'på tvers av ordre']].map(function(k){return '<div class="card"><span>'+k[0]+'</span><b>'+k[1]+'</b><em>'+k[2]+'</em></div>'}).join('');
 $('sel').innerHTML=sel.map(function(s){return '<tr><td>'+s[0]+'</td><td>'+B[s[1]]+'</td><td class="n">'+mill(s[2]*1e6)+'</td><td class="n">'+mill(s[3]*1e6)+'</td><td class="n">'+s[4]+' %</td><td class="n">'+s[5].toLocaleString('nb-NO')+' %</td><td class="n">'+s[6]+'</td></tr>'}).join('');
 $('risk').innerHTML=RISK.filter(function(r){return ks.indexOf(r[0])>-1}).map(function(r){return '<div class="tile warn"><b>'+r[1]+'</b><span>'+B[r[0]]+'</span>'+r[2]+'</div>'}).join('');
 chart(res,cap)}
function chart(v,cap){var bars=$('bars'),tip=$('tip'),box=$('chart'),top=Math.max.apply(null,v.concat([cap]))*1.1;
 var h='<span class="capl" style="top:'+(100-cap/top*100).toFixed(2)+'%">Kapasitet '+mill(cap)+'</span>';
 v.forEach(function(x,i){h+='<div class="col" data-i="'+i+'"><div class="b'+(x>cap?' cap':'')+'" style="height:'+Math.max(x/top*100,.5).toFixed(2)+'%"></div></div>'});
 bars.innerHTML=h;$('weeks').innerHTML=W.map(function(w){return '<span>'+w+'</span>'}).join('');
 [].forEach.call(bars.querySelectorAll('.col'),function(c){var i=+c.dataset.i;
  c.addEventListener('pointerenter',function(){bars.classList.add('dim');[].forEach.call(bars.querySelectorAll('.col'),function(o){o.classList.toggle('hl',o===c)});
   tip.innerHTML='<b>Uke '+W[i]+'</b><br>'+fmt(v[i])+' kr'+(v[i]>cap?'<br><span style="color:var(--status-advarsel-fg)">Over kapasitet ('+mill(cap)+')</span>':'');tip.style.display='block';
   var px=c.offsetLeft+c.offsetWidth/2;tip.style.left=Math.min(Math.max(px-70,0),box.clientWidth-160)+'px';tip.style.top='0px'});
  c.addEventListener('pointerleave',function(){tip.style.display='none';bars.classList.remove('dim');c.classList.remove('hl')})})}
var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){set(cur)},150)});
set('alle');
})();
