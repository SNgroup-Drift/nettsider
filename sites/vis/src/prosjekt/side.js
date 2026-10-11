(function(){
var $=function(i){return document.getElementById(i)};
var fmt=function(n){return Math.round(n).toLocaleString('nb-NO')};
var COLS=['01','02','03','04','05','06'];
var TYPE={'01':'C','02':'A','03':'B','04':'B','05':'A','06':'C'};
var TN={A:'2-roms',B:'3-roms',C:'4-roms'};
var OG={A:{navn:'Oppgang A',frist:'2. oktober',lev:'uke 48',fristUte:true},B:{navn:'Oppgang B',frist:'21. oktober',lev:'uke 3',dager:14}};
var ST={ikke:'Ikke åpnet',velger:'Velger',levert:'Levert valg',passert:'Frist passert',last:'Låst'};
var F={H:['Hvit matt',0],E:['Eik natur',18400],G:['Grønn',12900]};
var BP={L:['Laminat',0],K:['Kompakt',14200],S:['Stein',29800]};
var X={i:['Oppgradert induksjon',6900,'Hvitevarer'],k:['Integrert kjøl/frys',9500,'Hvitevarer'],s:['Skuffeinnredning',4200,'Ekstra'],l:['Belysning',5600,'Ekstra']};
var START={H0101:'EKs',H0102:'HL',H0103:'GKl',H0201:'ESikl',H0203:'HLi',H0301:'EKsl',H0302:'HL',H0303:'HKs',H0401:'ESik',H0402:'GL',H0403:'HLl',H0104:'GKi',H0106:'ESsl',H0205:'HL',H0406:'HKk'};
var VELGER=['H0105','H0204','H0304','H0305','H0405'],IKKE=['H0206','H0306','H0404'],PASSERT=['H0202'];
var DAHL='H0304';
var S;
function parse(s){var o={f:s[0],b:s[1],i:0,k:0,s:0,l:0};s.slice(2).split('').forEach(function(c){o[c]=1});return o}
function std(){return {f:'H',b:'L',i:0,k:0,s:0,l:0}}
function price(c){if(!c)return 0;var p=F[c.f][1]+BP[c.b][1];for(var k in X)if(c[k])p+=X[k][1];return p}
function og(id){return +id.slice(3)<=3?'A':'B'}
function typ(id){return TYPE[id.slice(3)]}
function init(){
 S={tab:'utb',sel:null,steps:{},units:{},dahl:std(),dahlSent:false,bestilt:{},fristB:false,pop:{},busy:false};
 for(var f=1;f<=4;f++)COLS.forEach(function(c){var id='H0'+f+c,u={id:id,st:'ikke',c:null};
  if(START[id]){u.st='levert';u.c=parse(START[id]);u.valgt=1}
  else if(VELGER.indexOf(id)>-1)u.st='velger';
  else if(PASSERT.indexOf(id)>-1){u.st='passert';u.c=std()}
  S.units[id]=u});
 $('log').innerHTML='';
 [].forEach.call($('guide').children,function(li){li.classList.remove('d')});
 log('Strandkanten, byggetrinn 2 hentet fra kontrakten med <b>Mjøsbygg AS</b>: 24 enheter, tre standardkjøkken.');
 log('Oppgang A: tilvalgsfristen gikk ut 2. oktober. <b>H0202</b> leverte ikke valg og får standardkjøkken type A.');
 render()}
function log(t){var d=document.createElement('div'),n=new Date();d.innerHTML='<em>'+('0'+n.getHours()).slice(-2)+':'+('0'+n.getMinutes()).slice(-2)+'</em>'+t;$('log').prepend(d)}
function step(k){S.steps[k]=1;[].forEach.call($('guide').children,function(li){li.classList.toggle('d',!!S.steps[li.dataset.k])})}
function all(){return Object.keys(S.units).map(function(k){return S.units[k]})}
function choiceText(c){var t=[F[c.f][0],'benkeplate '+BP[c.b][0].toLowerCase()];for(var k in X)if(c[k])t.push(X[k][0].toLowerCase());return t.join(', ')}
function cetChanges(c){var t=[];if(c.f!=='H')t.push('fronter '+F[c.f][0].toLowerCase());if(c.b!=='L')t.push('benkeplate '+BP[c.b][0].toLowerCase());if(c.k)t.push('skap for integrert kjøl/frys');if(c.s)t.push('skuffeinnredning');if(c.l)t.push('lysliste under overskap');return t}
function ogOpen(o){return o==='B'&&!S.fristB}
/* ---------- render ---------- */
function render(){
 var T=[['utb','Utbygger'],['kjop','Kjøper'],['best','Bestilling']];
 $('tabs').innerHTML=T.map(function(t){return '<button type="button" role="tab" aria-selected="'+(S.tab===t[0])+'" data-t="'+t[0]+'" class="'+(S.tab===t[0]?'on':'')+'">'+t[1]+'</button>'}).join('');
 $('tabs').querySelectorAll('button').forEach(function(b){b.onclick=function(){S.tab=b.dataset.t;render()}});
 var h=S.tab==='utb'?vUtb():S.tab==='kjop'?vKjop():vBest();
 var sc=$('pb')?$('pb').scrollTop:0;
 $('view').innerHTML=h;S.pop={};wire();
 if($('pb'))$('pb').scrollTop=sc}
function cell(u,extra){return '<button type="button" class="u '+u.st+(S.sel===u.id&&!extra?' sel':'')+(S.pop[u.id]?' pop':'')+'" data-u="'+u.id+'" aria-label="'+u.id+', type '+typ(u.id)+', '+ST[u.st]+'">'+u.id.slice(1)+'<small>'+(extra?ST[u.st]:'Type '+typ(u.id))+'</small></button>'}
function vUtb(){
 var U=all(),lev=U.filter(function(u){return u.st==='levert'||(u.st==='last'&&u.valgt)}).length;
 var sum=U.reduce(function(s,u){return s+(u.st==='levert'||u.st==='last'?price(u.c):0)},0);
 var mangler=U.filter(function(u){return ogOpen(og(u.id))&&(u.st==='ikke'||u.st==='velger')});
 var h='<div class="kpi">';
 h+='<div><span>Levert valg</span><b>'+lev+' av 24</b><em>'+Math.round(lev/24*100)+' % av kjøperne</em></div>';
 h+='<div><span>Sum tilvalg</span><b>'+fmt(sum)+' kr</b><em>Faktureres kjøperne direkte</em></div>';
 h+='<div><span>Dager til tilvalgsfrist</span><b>'+(S.fristB?'Ute':OG.B.dager+' dager')+'</b><em>Oppgang B, '+OG.B.frist+'</em></div>';
 h+='<div><span>Leveranse per oppgang</span><b style="font-size:1.45rem;line-height:1.2">A uke 48<br>B uke 3</b><em>Bekreftet med fabrikken</em></div></div>';
 h+='<section class="card box"><div class="bh"><h2>Strandkanten, byggetrinn 2</h2><button class="btn" type="button" id="remind"'+(mangler.length?'':' disabled')+'>Send påminnelse til de som ikke har valgt</button></div>';
 h+='<div class="legend">'+['ikke','velger','levert','passert','last'].map(function(k){return '<span><i class="u '+k+'" style="min-height:0;padding:0"></i>'+ST[k]+'</span>'}).join('')+'</div>';
 h+='<div class="bld" role="grid" aria-label="Leiligheter etter etasje og nummer"><span></span><div class="og" style="grid-column:2/span 3">Oppgang A</div><span></span><div class="og" style="grid-column:6/span 3">Oppgang B</div>';
 for(var f=4;f>=1;f--){h+='<div class="fl">'+f+'. et.</div>';COLS.forEach(function(c,i){if(i===3)h+='<span></span>';h+=cell(S.units['H0'+f+c])})}
 h+='</div>';
 h+=S.sel?detail(S.units[S.sel]):'<p class="note">Trykk på en leilighet for å se status og valg.</p>';
 h+='</section>';return h}
function detail(u){
 var h='<div class="det"><div class="bh"><h4>'+u.id+(u.id===DAHL?' · Familien Dahl':'')+'</h4><span class="pill '+({levert:'ok',velger:'info',passert:'warn',last:''}[u.st]||'')+'">'+ST[u.st]+'</span></div>';
 h+='<div class="muted">Type '+typ(u.id)+', '+TN[typ(u.id)]+' · '+OG[og(u.id)].navn+' · levering '+OG[og(u.id)].lev+'</div>';
 if(u.valgt)h+='<div>'+lines(u.c)+'</div>';
 else if(u.st==='passert'||u.st==='last')h+='<div>Ingen valg før fristen. Får standardkjøkken type '+typ(u.id)+'.</div>';
 else if(u.st==='velger')h+='<div>Har åpnet tilvalgene, men ikke sendt. Frist '+OG[og(u.id)].frist+'.</div>';
 else h+='<div>Kjøperen har ikke åpnet tilvalgene ennå.</div>';
 if(u.id===DAHL&&!S.dahlSent&&u.st==='velger')h+='<div><button class="btn primary" type="button" data-go="kjop">Åpne som kjøper</button></div>';
 return h+'</div>'}
function lines(c){var r=[['Fronter: '+F[c.f][0],F[c.f][1]],['Benkeplate: '+BP[c.b][0],BP[c.b][1]]];for(var k in X)if(c[k])r.push([X[k][0],X[k][1]]);
 return r.map(function(x){return '<div class="ln"><span>'+x[0]+'</span><span class="p">'+(x[1]?'+'+fmt(x[1])+' kr':'Inkludert')+'</span></div>'}).join('')+'<div class="ln"><b>Sum tilvalg</b><b class="p">'+fmt(price(c))+' kr</b></div>'}
/* ---------- kjøper ---------- */
function elev(c){
 var fc={H:'var(--card)',E:'var(--sand)',G:'var(--ok)'}[c.f],bc={L:'var(--line)',K:'var(--fg)',S:'var(--muted)'}[c.b];
 var s='<svg viewBox="0 0 300 150" role="img" aria-label="Skisse av kjøkkenet med valgte fronter og benkeplate">';
 s+='<rect x="0" y="0" width="300" height="150" rx="8" fill="var(--soft)"/>';
 for(var i=0;i<4;i++)s+='<rect x="'+(14+i*50)+'" y="14" width="46" height="44" rx="2" fill="'+fc+'" stroke="var(--fg)" stroke-opacity=".45"/>';
 if(c.l)s+='<rect x="14" y="60" width="196" height="4" rx="2" fill="var(--warn-soft)" stroke="var(--warn)" stroke-opacity=".5"/>';
 s+='<rect x="10" y="86" width="204" height="7" rx="1" fill="'+bc+'" stroke="var(--fg)" stroke-opacity=".45"/>';
 for(i=0;i<4;i++){var x=14+i*50;if(c.s&&i===1){for(var j=0;j<3;j++)s+='<rect x="'+x+'" y="'+(95+j*13)+'" width="46" height="12" rx="2" fill="'+fc+'" stroke="var(--fg)" stroke-opacity=".45"/>'}else s+='<rect x="'+x+'" y="95" width="46" height="38" rx="2" fill="'+fc+'" stroke="var(--fg)" stroke-opacity=".45"/>'}
 s+='<rect x="168" y="89" width="38" height="3" rx="1" fill="var(--fg)" opacity="'+(c.i?.9:.35)+'"/>';
 if(c.k)s+='<rect x="226" y="14" width="60" height="119" rx="2" fill="'+fc+'" stroke="var(--fg)" stroke-opacity=".45"/><rect x="226" y="62" width="60" height="1" fill="var(--fg)" opacity=".45"/>';
 else s+='<rect x="230" y="30" width="54" height="103" rx="6" fill="var(--line)" stroke="var(--fg)" stroke-opacity=".3"/><text x="257" y="86" text-anchor="middle" font-size="10" fill="var(--muted)" font-family="Inter,Arial,sans-serif">Kjøl</text>';
 return s+'</svg>'}
function opt(group,key,label,pr,on,chk,dis){return '<button type="button" class="opt'+(chk?' chk':'')+'" role="'+(chk?'checkbox':'radio')+'" aria-checked="'+on+'" data-g="'+group+'" data-k="'+key+'"'+(dis?' disabled':'')+'><span class="mk"></span><span>'+label+'</span><span class="pr">'+(pr?'+'+fmt(pr)+' kr':'Inkludert')+'</span></button>'}
function vKjop(){
 var u=S.units[DAHL],c=S.dahl,lock=S.dahlSent||u.st!=='velger';
 var h='<div class="phwrap"><div class="phone"><div class="scr"><div class="sb" aria-hidden="true"><span>09.41</span><span>••• ▮</span></div><div class="ph"><span class="lg">Kjøkkenstudio Hamar</span><span>Strandkanten · '+DAHL+'</span></div><div class="pb" id="pb">';
 if(!S.dahlSent&&u.st!=='velger'){
  h+='<h2>Fristen er ute</h2><div class="card c"><b>Dere får standardkjøkkenet</b><p>Tilvalgsfristen for oppgang B gikk ut før valgene ble sendt. Kjøkkenet leveres som avtalt med Mjøsbygg, uten tillegg.</p></div><div class="card c">'+elev(std())+'</div>';
  h+='</div><div class="pfoot"><div class="tot"><span>Tilvalg</span><b>0 kr</b></div></div></div></div>';
 }else if(S.dahlSent){
  h+='<h2>Takk, familien Dahl!</h2><div class="card c"><b>Kvittering for tilvalg</b><p>Mottatt i dag. Valgene er låst og sendt til prosjektselgeren.</p>'+lines(c)+'</div><div class="card c">'+elev(c)+'</div>';
  h+='<div class="card c"><b>Slik går det videre</b><p>Tilvalgene faktureres dere direkte fra Kjøkkenstudio Hamar. Standardkjøkkenet er dekket av kjøpekontrakten med Mjøsbygg. Levering '+OG.B.lev+'.</p></div>';
  h+='</div><div class="pfoot"><div class="tot"><span>Tilvalg totalt</span><b>'+fmt(price(c))+' kr</b></div><button class="btn primary big" type="button" disabled>Valgene er sendt</button></div></div></div>';
 }else{
  h+='<h2>Hei, familien Dahl</h2><div class="card c"><b>Standardkjøkken type B, 3-roms</b><p>Hvite matte fronter, laminat benkeplate og standard hvitevarepakke er med i kjøpesummen. Velg tillegg under.</p>'+elev(c)+'</div>';
  h+='<div class="card c"><b>Frist for tilvalg: '+OG.B.frist+'</b><p>'+OG.B.dager+' dager igjen. Etter fristen leveres standardkjøkkenet.</p></div>';
  h+='<div class="card c"><b>Fronter</b>'+Object.keys(F).map(function(k){return opt('f',k,F[k][0],F[k][1],c.f===k,0,lock)}).join('')+'</div>';
  h+='<div class="card c"><b>Benkeplate</b>'+Object.keys(BP).map(function(k){return opt('b',k,BP[k][0],BP[k][1],c.b===k,0,lock)}).join('')+'</div>';
  h+='<div class="card c"><b>Hvitevarer</b>'+opt('x','std','Standard hvitevarepakke',0,true,1,true)+opt('x','i',X.i[0],X.i[1],!!c.i,1,lock)+opt('x','k',X.k[0],X.k[1],!!c.k,1,lock)+'</div>';
  h+='<div class="card c"><b>Ekstra</b>'+opt('x','s',X.s[0],X.s[1],!!c.s,1,lock)+opt('x','l',X.l[0],X.l[1],!!c.l,1,lock)+'</div>';
  h+='</div><div class="pfoot"><div class="tot"><span>Tilvalg totalt</span><b>'+fmt(price(c))+' kr</b></div><button class="btn primary big" type="button" id="sendv">Send valgene</button></div></div></div>';
 }
 h+='<div class="explain"><section class="card box"><h2>Det kjøperen ser</h2><p class="note">Familien Dahl har kjøpt H0304 i oppgang B. De får en lenke fra prosjektselgeren og velger tilvalg på mobilen. Prisen oppdateres med en gang, og skissen viser valgene.</p><p class="note">Når de sender, låses valgene. Enheten blir Levert valg hos utbygger, og prosjektselgeren får beskjed om hvilken tegning som må endres i CET.</p>';
 h+='<div class="det"><div class="ln"><span>Status hos utbygger</span><span class="pill '+({levert:'ok',velger:'info',passert:'warn',last:''}[u.st]||'')+'">'+ST[u.st]+'</span></div><div class="ln"><span>'+(S.dahlSent?'Tilvalg sendt':'Tilvalg i utkast')+'</span><span class="p">'+fmt(price(c))+' kr</span></div></div>';
 h+='<div class="acts"><button class="btn" type="button" data-go="utb">Se utbyggeroversikten</button></div></section></div></div>';
 return h}
/* ---------- bestilling ---------- */
function counts(o){
 var U=all().filter(function(u){return og(u.id)===o}),r={f:{H:0,E:0,G:0},b:{L:0,K:0,S:0},x:{i:0,k:0,s:0,l:0},t:{A:0,B:0,C:0},mangler:0,cet:[]};
 U.forEach(function(u){var c=(u.st==='levert'||u.st==='last'||u.st==='passert')&&u.c?u.c:null;if(!c){r.mangler++;c=std()}
  r.f[c.f]++;r.b[c.b]++;for(var k in X)if(c[k])r.x[k]++;r.t[typ(u.id)]++;
  var ch=cetChanges(c);if(ch.length&&(u.st==='levert'||u.st==='last'))r.cet.push([u.id,ch])});
 return r}
function vBest(){
 var h='<section class="card box"><h2>Samlet bestilling per oppgang</h2><p class="note">Når tilvalgsfristen er ute, samles alle valg i oppgangen til én bestilling hos fabrikken. Leiligheter uten valg får standardkjøkkenet for sin type.</p></section>';
 ['A','B'].forEach(function(o){
  var r=counts(o),open=ogOpen(o),done=S.bestilt[o],U=all().filter(function(u){return og(u.id)===o});
  var sum=0;
  h+='<section class="card box"><div class="bh"><h2>'+OG[o].navn+' · 12 leiligheter</h2><span class="pill '+(done?'ok':open?'info':'warn')+'">'+(done?'Bestilt, levering '+OG[o].lev:open?'Frist '+OG[o].frist:'Frist ute '+OG[o].frist)+'</span></div>';
  h+='<div class="chipsrow">'+U.map(function(u){return cell(u,1)}).join('')+'</div>';
  if(open)h+='<p class="note">Foreløpige tall. '+r.mangler+' leiligheter har ikke sendt valg og er regnet som standard.</p>';
  h+='<div class="tbl"><table><thead><tr><th>Variant</th><th class="n">Antall</th><th class="n">Tilvalg</th></tr></thead><tbody>';
  h+='<tr class="cat"><td colspan="3">Standardkjøkken (fakturert utbygger)</td></tr>';
  ['A','B','C'].forEach(function(t){h+='<tr><td>Type '+t+', '+TN[t]+'</td><td class="n">'+r.t[t]+'</td><td class="n">–</td></tr>'});
  h+='<tr class="cat"><td colspan="3">Fronter</td></tr>';
  Object.keys(F).forEach(function(k){sum+=r.f[k]*F[k][1];h+='<tr><td>'+F[k][0]+'</td><td class="n">'+r.f[k]+'</td><td class="n">'+(F[k][1]?fmt(r.f[k]*F[k][1])+' kr':'Inkl.')+'</td></tr>'});
  h+='<tr class="cat"><td colspan="3">Benkeplate</td></tr>';
  Object.keys(BP).forEach(function(k){sum+=r.b[k]*BP[k][1];h+='<tr><td>'+BP[k][0]+'</td><td class="n">'+r.b[k]+'</td><td class="n">'+(BP[k][1]?fmt(r.b[k]*BP[k][1])+' kr':'Inkl.')+'</td></tr>'});
  h+='<tr class="cat"><td colspan="3">Hvitevarer og ekstra</td></tr><tr><td>Standard hvitevarepakke</td><td class="n">12</td><td class="n">Inkl.</td></tr>';
  Object.keys(X).forEach(function(k){sum+=r.x[k]*X[k][1];h+='<tr><td>'+X[k][0]+'</td><td class="n">'+r.x[k]+'</td><td class="n">'+fmt(r.x[k]*X[k][1])+' kr</td></tr>'});
  h+='<tr class="sum"><td>Tilvalg fakturert kjøperne</td><td></td><td class="n">'+fmt(sum)+' kr</td></tr></tbody></table></div>';
  h+='<div class="cet"><b>Tegninger som må endres i CET ('+r.cet.length+')</b>'+(r.cet.length?r.cet.map(function(x){return '<div><b>'+x[0]+'</b> <span>'+x[1].join(', ')+'</span></div>'}).join(''):'<p class="note">Ingen ennå.</p>')+'<p class="note">'+(12-r.cet.length)+' leiligheter bruker standardtegningen for sin type.</p></div>';
  h+='<div class="acts">';
  if(open)h+='<button class="btn" type="button" data-frist="'+o+'">Simuler at fristen er ute</button>';
  h+='<button class="btn primary" type="button" data-best="'+o+'"'+(open||done||S.busy?' disabled':'')+'>'+(done?'Samlet bestilling er laget':'Lag samlet bestilling')+'</button></div>';
  h+='</section>'});
 return h}
/* ---------- handlinger ---------- */
function wire(){var V=$('view'),q=function(s){return V.querySelector(s)};
 V.querySelectorAll('.bld .u').forEach(function(b){b.onclick=function(){S.sel=b.dataset.u;step('se');render()}});
 V.querySelectorAll('[data-go]').forEach(function(b){b.onclick=function(){S.tab=b.dataset.go;render();window.scrollTo({top:$('tabs').offsetTop-10,behavior:'smooth'})}});
 if(q('#remind'))q('#remind').onclick=function(){var m=all().filter(function(u){return ogOpen(og(u.id))&&(u.st==='ikke'||u.st==='velger')}),v=m.filter(function(u){return u.st==='velger'}).length;
  step('se');log('Påminnelse klar til <b>'+m.length+' kjøpere</b> i oppgang B: '+v+' som velger, '+(m.length-v)+' som ikke har åpnet. Frist '+OG.B.frist+'. Lagt i loggen, ingenting er sendt.')};
 V.querySelectorAll('.opt').forEach(function(b){b.onclick=function(){var g=b.dataset.g,k=b.dataset.k;
  if(g==='f'||g==='b')S.dahl[g]=k;else S.dahl[k]=S.dahl[k]?0:1;
  step('velg');render()}});
 if(q('#sendv'))q('#sendv').onclick=function(){var u=S.units[DAHL];S.dahlSent=true;u.st='levert';u.c=JSON.parse(JSON.stringify(S.dahl));u.valgt=1;S.pop[DAHL]=1;step('send');
  log('<b>Familien Dahl (H0304)</b> sendte valgene: '+choiceText(u.c)+'. Tilvalg '+fmt(price(u.c))+' kr. Enheten står som Levert valg.');
  var ch=cetChanges(u.c);if(ch.length)log('Oppgave til prosjektselgeren: endre tegning <b>H0304</b> i CET ('+ch.join(', ')+').');
  render();if($('pb'))$('pb').scrollTop=0};
 V.querySelectorAll('[data-frist]').forEach(function(b){b.onclick=function(){var n=0;S.fristB=true;all().forEach(function(u){if(og(u.id)==='B'&&(u.st==='ikke'||u.st==='velger')){u.st='passert';u.c=std();S.pop[u.id]=1;n++}});
  log('Tilvalgsfristen for oppgang B er ute. <b>'+n+' leiligheter</b> uten valg får standardkjøkken. Kjøperne får beskjed på Min side.');render()}});
 V.querySelectorAll('[data-best]').forEach(function(b){b.onclick=function(){var o=b.dataset.best,U=all().filter(function(u){return og(u.id)===o}),r=counts(o),i=0;S.busy=true;render();
  (function tick(){if(i<U.length){var u=U[i++];u.st='last';S.pop[u.id]=1;render();setTimeout(tick,110);return}
   S.busy=false;S.bestilt[o]=1;step('best');
   log('<b>Samlet bestilling for oppgang '+o+'</b> laget: 12 kjøkken til fabrikken, '+r.f.H+' hvit matt, '+r.f.E+' eik, '+r.f.G+' grønn. Levering '+OG[o].lev+'.');
   log('Ordre per enhet opprettet i CRM, tilvalg fakturert kjøper direkte, standard fakturert utbygger.');
   log('CET: <b>'+r.cet.length+' tegninger</b> merket for endring hos prosjektselgeren. Alle 12 enheter står som Låst.');
   render()})()}});
}
$('reset').onclick=init;
init();
})();
