(function(){
var $=function(i){return document.getElementById(i)};
var fmt=function(n){return n.toLocaleString('nb-NO')};
var K={
 sig:{t:'Fabrikkordre: tegning mot bekreftelse',ctx:'Ordre 24-0791 · Familien Berg · Hamar',docs:[['Tegning','Hovedleverandør-XML fra CET'],['Bekreftelse','OB fra fabrikken (PDF)']],
  cols:['Element','Tegning','Bekreftelse'],
  rows:[
   ['Benkeskap 60, 2 skuffer','Front Eik natur','Front Eik natur'],
   ['Overskap 80, glassdør','Høyde 92','Høyde 92'],
   ['Høyskap kjøl/frys','Hengsling høyre','Hengsling venstre','Hengsling er snudd. Kjøleskapet åpner mot veggen på tegningen.',0],
   ['Sokkel','Eik natur, 4 stk','Eik natur, 4 stk'],
   ['Skuffeinnredning','2 sett','1 sett','Ett sett mangler i bekreftelsen.',1450],
   ['Dekkside høyskap','Eik natur','Eik natur'],
   ['Benkeskap 40, hjørne','Karusell','Karusell'],
   ['Håndtak','Sort, 18 stk','Sort, 18 stk']],
  acts:[['Lag sak','Sak til selger med frist én virkedag før laveste ENDFØR.'],['Godkjenn','Avviket er riktig. Lagres med navn og tid.']]},
 lev:{t:'Leverandørfaktura: bekreftelse mot faktura',ctx:'Faktura 77412 fra Nordstein Benkeplater · ordre 24-0815',docs:[['Bekreftelse','godtatt 14.10'],['Faktura','EHF, mottatt 18.11']],
  cols:['Linje','Bekreftelse','Faktura'],
  rows:[
   ['Benkeplate kompakt 12 mm ×2','8 450','8 450'],
   ['Utsparing platetopp','950','950'],
   ['Utsparing kum, underlimt','1 250','1 650','Fakturert 400 kr over bekreftet pris.',400],
   ['Frakt til lager Hamar','0','1 490','Frakt er ikke avtalt. Bestillingen sa fritt lager.',1490],
   ['Miljøgebyr','45','45']],
  acts:[['Krev kreditnota','Lager et e-postutkast til leverandøren. Du sender selv.'],['Godkjenn','Fakturaen kan betales som den er.']]}
};
var cur='sig',T=[],res={},run=false;
Object.keys(K).forEach(function(k){var b=document.createElement('button');b.type='button';b.className='btn';b.textContent=K[k].t;b.dataset.k=k;b.onclick=function(){load(k)};$('tabs').appendChild(b)});
function at(ms,f){T.push(setTimeout(f,ms))}
function load(k){T.forEach(clearTimeout);T=[];cur=k;res={};run=false;var d=K[k];
 [].forEach.call($('tabs').children,function(b){b.classList.toggle('dark',b.dataset.k===k);b.setAttribute('aria-pressed',b.dataset.k===k)});
 $('ctx').textContent=d.ctx;$('docs').innerHTML=d.docs.map(function(x,i){return (i?'<span class="muted">mot</span>':'')+'<span class="doc"><b>'+x[0]+'</b> · '+x[1]+'</span>'}).join('');
 var num=k==='lev',nc=num?' class="n"':'';
 $('th').innerHTML='<tr><th>'+d.cols[0]+'</th><th'+nc+'>'+d.cols[1]+'</th><th'+nc+'>'+d.cols[2]+'</th><th class="st"></th></tr>';
 $('tb').innerHTML=d.rows.map(function(r,i){return '<tr id="r'+i+'"><td>'+r[0]+'</td><td'+(num?' class="n"':'')+'>'+r[1]+'</td><td class="diff'+(num?' n':'')+'">'+r[2]+'</td><td class="st"></td></tr>'}).join('');
 $('flags').innerHTML='<p class="empty">Kjør kontrollen for å se avvikene.</p>';$('sum').hidden=true;$('run').disabled=false}
$('run').onclick=function(){if(run)return;run=true;$('run').disabled=true;var d=K[cur];$('flags').innerHTML='';
 d.rows.forEach(function(r,i){at(i*380,function(){var tr=$('r'+i);[].forEach.call($('tb').children,function(x){x.classList.remove('scan')});
  if(r[3]){tr.classList.add('bad');tr.lastChild.innerHTML='<span class="pill warn">Avvik</span>';flag(i)}else{tr.classList.add('scan');tr.lastChild.innerHTML='<span class="pill ok">Stemmer</span>'}})});
 at(d.rows.length*380+200,function(){[].forEach.call($('tb').children,function(x){x.classList.remove('scan')});summary()})};
function flag(i){var d=K[cur],r=d.rows[i],el=document.createElement('div');el.className='tile warn flag';el.id='f'+i;
 el.innerHTML='<b>'+r[0]+'</b><p>'+r[3]+'</p>'+(r[4]?'<span style="font-size:14px">Beløp: <b>'+fmt(r[4])+' kr</b></span>':'')+'<div class="acts">'+d.acts.map(function(a,j){return '<button class="btn'+(j?'':' primary')+'" type="button" data-j="'+j+'">'+a[0]+'</button>'}).join('')+'</div>';
 el.querySelectorAll('button').forEach(function(b){b.onclick=function(){var j=+b.dataset.j;res[i]=j;el.classList.remove('warn');el.classList.add('ok');el.querySelector('.acts').innerHTML='<span class="pill '+(j?'ok':'info')+'">'+d.acts[j][0]+'</span><span class="muted" style="font-size:14px">'+d.acts[j][1]+'</span>';summary()}});
 $('flags').appendChild(el)}
function summary(){var d=K[cur],bad=d.rows.filter(function(r){return r[3]}),done=Object.keys(res).length,sikret=0;
 d.rows.forEach(function(r,i){if(r[3]&&res[i]===0)sikret+=r[4]||0});
 $('sum').hidden=false;
 $('sum').innerHTML='<div><span>Linjer som stemmer</span><b>'+(d.rows.length-bad.length)+' av '+d.rows.length+'</b></div><div><span>Avvik behandlet</span><b>'+done+' av '+bad.length+'</b></div><div><span>'+(cur==='lev'?'Krevd kreditert':'Rettet før produksjon')+'</span><b>'+fmt(sikret)+' kr</b></div>'}
$('reset').onclick=function(){load(cur)};
load('sig');
})();
