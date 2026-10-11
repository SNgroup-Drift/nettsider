(function(){
var $=function(i){return document.getElementById(i)};
var fmt=function(n){return n.toLocaleString('nb-NO')+' kr'};
var MONT=47,ONSKET=46;
var P=[
 {id:'b1',m:'BSH',lev:'BSH',kat:'Platetopp',navn:'Induksjonstopp',mod:'IND-80 Flex',need:80,net:9450,veil:14990,lager:'lager'},
 {id:'s1',m:'BSH',lev:'BSH',kat:'Platetopp',navn:'Induksjonstopp med avtrekk',mod:'IQ IND-80 Air',need:80,net:18900,veil:27990,lager:'2u'},
 {id:'a1',m:'AEG',lev:'Electrolux',kat:'Stekeovn',navn:'Stekeovn med damp',mod:'OVN-60 Steam',need:60,net:11200,veil:16990,lager:'lager'},
 {id:'mi1',m:'Miele',lev:'Miele',kat:'Stekeovn',navn:'Stekeovn med pyrolyse',mod:'H-60 Pure',need:60,net:15800,veil:22990,lager:'rest'},
 {id:'b2',m:'BSH',lev:'BSH',kat:'Oppvaskmaskin',navn:'Oppvaskmaskin, integrert',mod:'SMV-60 Silence',need:60,net:7900,veil:11490,lager:'lager'},
 {id:'mi2',m:'Miele',lev:'Miele',kat:'Oppvaskmaskin',navn:'Oppvaskmaskin, integrert',mod:'G-60 Vi',need:60,net:12400,veil:17990,lager:'2u'},
 {id:'a2',m:'AEG',lev:'Electrolux',kat:'Kjøl/frys',navn:'Kjøl/frys, integrert',mod:'KF-178 Int',need:178,net:10900,veil:15990,lager:'lager'},
 {id:'s2',m:'BSH',lev:'BSH',kat:'Kjøl/frys',navn:'Kjøl/frys, integrert XL',mod:'KF-194 Int',need:194,net:13600,veil:19990,lager:'lager'},
 {id:'sm1',m:'Smeg',lev:'Smeg',kat:'Ventilator',navn:'Veggventilator',mod:'VENT-90 Line',need:90,net:8700,veil:12990,lager:'2u'},
 {id:'a3',m:'AEG',lev:'Electrolux',kat:'Ventilator',navn:'Integrert ventilator',mod:'VENT-80 Slim',need:80,net:4900,veil:7490,lager:'lager'}
];
var SLOT={'Platetopp':[80,'Utsparing i benkeplata','cm bredde'],'Stekeovn':[60,'Ovnsnisje i høyskap','cm bredde'],'Oppvaskmaskin':[60,'Nisje under benk','cm bredde'],'Kjøl/frys':[178,'Nisjehøyde i høyskap','cm'],'Ventilator':[90,'Plass over platetopp','cm bredde']};
var LAGER={lager:['På lager','ok',42],'2u':['2 uker','info',43],rest:['Restordre uke 49','warn',49]};
var BRANDS=['Alle','BSH','AEG','Miele','Smeg'],KATS=['Alle','Platetopp','Stekeovn','Oppvaskmaskin','Kjøl/frys','Ventilator'];
var ONR={BSH:'BSH 4501 2287',Electrolux:'EL 778 140',Miele:'MI 31 0092',Smeg:'SM 24 5518'};
var S,timers=[];
var byId=function(id){return P.filter(function(p){return p.id===id})[0]};
function clock(){var n=new Date();return ('0'+n.getHours()).slice(-2)+':'+('0'+n.getMinutes()).slice(-2)}
function log(t){var d=document.createElement('div');d.innerHTML='<em>'+clock()+'</em>'+t;$('log').prepend(d)}
function step(k){S.steps[k]=1;[].forEach.call($('guide').children,function(li){li.classList.toggle('d',!!S.steps[li.dataset.k])})}
function later(f,ms){timers.push(setTimeout(f,ms))}
function clear(){timers.forEach(clearTimeout);timers=[]}
function init(){clear();S={tab:1,q:'',brand:'Alle',kat:'Alle',sel:{},keep:{},loading:true,fetched:null,sent:false,sup:{},etter:0,steps:{}};
 $('log').innerHTML='';[].forEach.call($('guide').children,function(li){li.classList.remove('d')});
 log('Ordre 24-0791 åpnet. Tegningen er lest inn: nisjemål og montasje <b>uke 47</b> ligger klare for sjekk.');
 fetchLive(1100,true);render()}
function fetchLive(ms,first){S.loading=true;later(function(){S.loading=false;S.fetched=clock();if(first)log('Pris og lager hentet live fra <b>4 leverandører</b> via Tradeplace.');if(S.tab===1)renderList()},ms)}
function chosen(){return KATS.slice(1).map(function(k){return S.sel[k]}).filter(Boolean).map(byId)}
function check(p){var s=SLOT[p.kat],l=LAGER[p.lager];return {fit:p.need<=s[0],lev:l[2]<MONT,s:s,l:l}}
function issues(){var a=0,b=0;chosen().forEach(function(p){var c=check(p);if(!c.fit)a++;if(!c.lev&&!S.keep[p.id])b++});return {fit:a,lev:b}}
function canTab(n){if(n===1)return true;if(n===2)return chosen().length>0;if(n===3){var i=issues();return chosen().length>0&&!i.fit&&!i.lev}return S.done}
function go(n){if(!canTab(n))return;S.tab=n;render();if(window.innerWidth<980)$('tabs').scrollIntoView({block:'start',behavior:'smooth'})}
function render(){renderTabs();if(S.tab===1)tab1();if(S.tab===2)tab2();if(S.tab===3)tab3();if(S.tab===4)tab4()}
function renderTabs(){
 var T=[['Velg produkter','Pris og lager live'],['Sjekk mot ordren','Mål og leveringsuke'],['Bestill','Én knapp, alle merker'],['Etterpå','Varsel og faktura']];
 $('tabs').innerHTML=T.map(function(t,i){var n=i+1;return '<button type="button" data-n="'+n+'" class="'+(S.tab===n?'on':'')+'"'+(S.tab===n?' aria-current="step"':'')+(canTab(n)?'':' disabled')+'>'+n+'. '+t[0]+'<small>'+t[1]+'</small></button>'}).join('');
 $('tabs').querySelectorAll('button').forEach(function(b){b.onclick=function(){go(+b.dataset.n)}})}
function totals(){var n=0,v=0;chosen().forEach(function(p){n+=p.net;v+=p.veil});return '<span class="sum">'+chosen().length+' valgt · Netto <b>'+fmt(n)+'</b> · Veil. <b>'+fmt(v)+'</b></span>'}
/* 1. Velg */
function tab1(){
 var h='<h2>Velg produkter</h2><p class="muted">Søk i katalogen fra BSH, Electrolux, Miele og Smeg. Ett produkt per type på ordren.</p>';
 h+='<div class="row"><input class="search" id="q" type="search" placeholder="Søk på merke, modell eller type" aria-label="Søk i katalogen" value="'+S.q.replace(/"/g,'&quot;')+'"><button class="btn" type="button" id="fill">Fyll inn Bergs ønsker</button></div>';
 h+='<div class="chips" id="cb" aria-label="Merke">'+BRANDS.map(function(b){return '<button type="button" class="btn'+(S.brand===b?' dark':'')+'" aria-pressed="'+(S.brand===b)+'">'+b+'</button>'}).join('')+'</div>';
 h+='<div class="chips" id="ck" aria-label="Type">'+KATS.map(function(b){return '<button type="button" class="btn'+(S.kat===b?' dark':'')+'" aria-pressed="'+(S.kat===b)+'">'+(b==='Alle'?'Alle typer':b)+'</button>'}).join('')+'</div>';
 h+=''+(S.sent?'<p class="muted">Bestillingen er sendt. Endringer gjøres nå som endringsordre.</p>':'')+'<div class="live" id="live" aria-live="polite"></div><div class="list" id="list"></div>';
 h+='<div class="afoot"><span id="tot">'+totals()+'</span><button class="btn primary" type="button" id="next"'+(chosen().length?'':' disabled')+'>Sjekk mot ordren</button></div>';
 $('body').innerHTML=h;
 var qt;$('q').oninput=function(){S.q=this.value;clearTimeout(qt);qt=setTimeout(function(){fetchLive(500);renderList()},250)};
 $('cb').querySelectorAll('button').forEach(function(b){b.onclick=function(){S.brand=b.textContent;fetchLive(500);tab1()}});
 $('ck').querySelectorAll('button').forEach(function(b){b.onclick=function(){S.kat=b.textContent==='Alle typer'?'Alle':b.textContent;fetchLive(500);tab1()}});
 $('fill').onclick=function(){S.sel={'Platetopp':'b1','Stekeovn':'mi1','Oppvaskmaskin':'b2','Kjøl/frys':'s2','Ventilator':'sm1'};S.keep={};step('velg');log('Bergs ønsker lagt på ordren: <b>5 hvitevarer</b> fra BSH, Miele og Smeg.');render()};
 if(S.sent){$('fill').disabled=true}
 $('next').onclick=function(){go(2)};
 renderList()}
function renderList(){if(!$('list'))return;
 var q=S.q.trim().toLowerCase();
 var L=P.filter(function(p){return (S.brand==='Alle'||p.m===S.brand)&&(S.kat==='Alle'||p.kat===S.kat)&&(!q||(p.m+' '+p.lev+' '+p.mod+' '+p.navn+' '+p.kat).toLowerCase().indexOf(q)>-1)});
 $('live').innerHTML=S.loading?'<span class="spin" aria-hidden="true"></span>Henter pris og lager fra Tradeplace …':'<span class="pill ok">Live</span>Pris og lager oppdatert kl. '+S.fetched+' · '+L.length+' treff';
 $('list').innerHTML=L.length?L.map(function(p){var on=S.sel[p.kat]===p.id,l=LAGER[p.lager];
  return '<div class="prow'+(on?' sel':'')+'"><div class="pn"><b>'+p.m+' '+p.mod+'</b><span>'+p.navn+' · '+p.lev+'</span></div>'+
  '<div class="pp">'+(S.loading?'<span class="sk"></span><span class="sk" style="width:64px"></span>':'<span>Netto <b>'+fmt(p.net)+'</b></span><span>Veil. '+fmt(p.veil)+'</span>')+'</div>'+
  '<div class="pl">'+(S.loading?'<span class="sk" style="width:90px"></span>':'<span class="pill '+l[1]+'">'+l[0]+'</span>')+'</div>'+
  '<div class="pb"><button type="button" class="btn'+(on?' dark':'')+'" data-id="'+p.id+'" aria-pressed="'+on+'"'+(S.sent?' disabled':'')+'>'+(on?'Valgt':'Velg')+'</button></div></div>'}).join(''):'<p class="muted" style="padding:12px 0">Ingen treff. Prøv et annet søk.</p>';
 $('list').querySelectorAll('[data-id]').forEach(function(b){b.onclick=function(){var p=byId(b.dataset.id);
  if(S.sel[p.kat]===p.id){delete S.sel[p.kat];log('Fjernet '+p.m+' '+p.mod+' fra ordren.')}
  else{var old=S.sel[p.kat];S.sel[p.kat]=p.id;delete S.keep[p.id];log((old?'Byttet '+p.kat.toLowerCase()+' til ':'La til ')+'<b>'+p.m+' '+p.mod+'</b> på ordren. Netto '+fmt(p.net)+'.')}
  if(chosen().length>=3)step('velg');renderList();$('tot').innerHTML=totals();$('next').disabled=!chosen().length;renderTabsOnly()}})}
function renderTabsOnly(){renderTabs()}
/* 2. Sjekk */
function tab2(){
 var C=chosen(),i=issues();
 var h='<h2>Sjekk mot ordren</h2><p class="muted">Hver vare sjekkes mot tegningen og mot montasje uke 47. Varene må være på lager i Hamar senest uke '+ONSKET+'.</p><div class="chk">';
 C.forEach(function(p){var c=check(p),bad=!c.fit||(!c.lev&&!S.keep[p.id]);
  var alt=P.filter(function(x){return x.kat===p.kat&&x.id!==p.id&&check(x).fit&&check(x).lev})[0];
  h+='<div class="ci'+(bad?' bad':'')+'"><div class="h"><b>'+p.m+' '+p.mod+'</b><span>'+p.kat+' · '+p.lev+'</span></div><div class="tests">';
  h+='<div class="test"><i class="'+(c.fit?'y':'n')+'">'+(c.fit?'✓':'!')+'</i><div>'+(c.fit?'Passer i tegningen':'Passer ikke i tegningen')+'<span>'+c.s[1]+' '+c.s[0]+' '+c.s[2]+'. Varen krever '+p.need+' '+c.s[2]+'.</span></div></div>';
  h+='<div class="test"><i class="'+(c.lev?'y':'n')+'">'+(c.lev?'✓':'!')+'</i><div>'+(c.lev?'Kommer før montasje':'Kommer etter montasje')+'<span>'+c.l[0]+(c.lev?', levert til lager innen uke '+ONSKET+'.':'. Montasjen er uke 47.')+(S.keep[p.id]?' Beholdt, kunden varsles.':'')+'</span></div></div></div>';
  if(bad){h+='<div class="fix">'+(alt?'<button class="btn primary" type="button" data-sw="'+p.id+'" data-to="'+alt.id+'">Bytt til '+alt.m+' '+alt.mod+'</button>':'')+(c.fit&&!c.lev?'<button class="btn" type="button" data-keep="'+p.id+'">Behold, ettermonter uke 49</button>':'')+'</div>'}
  h+='</div>'});
 h+='</div><div class="afoot"><span class="sum">'+(i.fit||i.lev?'<b class="wn">'+(i.fit+i.lev)+' avvik</b> må løses før bestilling':'<b class="ok">Alt stemmer med ordren</b>')+'</span><button class="btn primary" type="button" id="next"'+(canTab(3)?'':' disabled')+'>Til bestilling</button></div>';
 $('body').innerHTML=h;
 var key=C.map(function(p){return p.id}).join();if(S.logged2!==key){S.logged2=key;var msg=[];C.forEach(function(p){var c=check(p);if(!c.fit)msg.push('<b>'+p.m+' '+p.mod+'</b> krever '+p.need+' cm, tegningen har '+c.s[0]+' cm');if(!c.lev)msg.push('<b>'+p.m+' '+p.mod+'</b> er restordre til uke 49');});
  log(msg.length?'Sjekk mot ordren fant avvik: '+msg.join('. ')+'.':'Sjekk mot ordren: alle varer passer og kommer i tide.')}
 $('body').querySelectorAll('[data-sw]').forEach(function(b){b.onclick=function(){var f=byId(b.dataset.sw),t=byId(b.dataset.to);S.sel[t.kat]=t.id;log('Byttet <b>'+f.m+' '+f.mod+'</b> til <b>'+t.m+' '+t.mod+'</b>. Tegningen og elementlisten er oppdatert.');afterFix()}});
 $('body').querySelectorAll('[data-keep]').forEach(function(b){b.onclick=function(){var p=byId(b.dataset.keep);S.keep[p.id]=1;log('Beholdt <b>'+p.m+' '+p.mod+'</b> som restordre. Ettermontering uke 49 lagt inn hos Piotr, og kunden får beskjed på Min side.');afterFix()}});
 if($('next'))$('next').onclick=function(){go(3)}}
function afterFix(){var i=issues();if(!i.fit&&!i.lev)step('sjekk');render()}
/* 3. Bestill */
function groups(){var g={};chosen().forEach(function(p){(g[p.lev]=g[p.lev]||[]).push(p)});return g}
function lateSup(g){var k=Object.keys(g).filter(function(s){return !g[s].every(function(p){return S.keep[p.id]})});return k.indexOf('Smeg')>-1?'Smeg':k.indexOf('Electrolux')>-1?'Electrolux':k[k.length-1]}
function tab3(){
 var g=groups(),k=Object.keys(g);
 var h='<h2>Bestill</h2><p class="muted">Én bestilling, sendt til hver leverandør i deres eget format. Ønsket levering til lager Hamar: uke '+ONSKET+'. Bestillinger går fra bestilling@kjokkenstudio-hamar.no.</p><div class="sups">';
 k.forEach(function(s){var st=S.sup[s]||{};
  h+='<div class="sup'+(st.st==='ok'?(st.late?' late':' done'):'')+'"><div class="h"><b>'+s+'</b>'+(st.st==='ok'?'<span class="pill '+(st.late?'warn':'ok')+'">Bekreftet</span>':st.st==='sendt'?'<span class="pill info">Sendt</span>':'<span class="pill">Klar</span>')+'</div>';
  h+='<ul>'+g[s].map(function(p){return '<li>'+p.m+' '+p.mod+(S.keep[p.id]?' · restordre':'')+'</li>'}).join('')+'</ul>';
  h+='<div class="st">'+(st.st==='sendt'?'<span class="spin" aria-hidden="true"></span>Venter på bekreftelse …':st.st==='ok'?'<span>Ordrenr. <b class="on">'+ONR[s]+'</b><br>Levering uke '+st.uke+(st.late?' <span class="wn">(ønsket '+ONSKET+')</span>':st.rest?' <span class="wn">(restordre, avtalt)</span>':'')+'</span>':'<span class="muted">Ikke sendt</span>')+'</div></div>'});
 h+='</div>';
 if(S.caseTxt)h+='<div class="case"><b>'+S.caseTxt[0]+'</b><span>'+S.caseTxt[1]+'</span></div>';
 h+='<div class="afoot">'+totals()+(S.done?'<button class="btn primary" type="button" id="next">Se hva som skjer etterpå</button>':'<button class="btn primary" type="button" id="send"'+(S.sent?' disabled':'')+'>'+(S.sent?'Sender …':'Bestill fra '+k.length+' leverandører')+'</button>')+'</div>';
 $('body').innerHTML=h;
 if($('next'))$('next').onclick=function(){go(4)};
 if($('send'))$('send').onclick=send}
function send(){var g=groups(),k=Object.keys(g),ls=lateSup(g);S.sent=true;
 k.forEach(function(s){S.sup[s]={st:'sendt'}});log('Bestilling sendt til <b>'+k.join(', ')+'</b> via Tradeplace. Ett trykk, '+chosen().length+' varer.');if(S.tab===3)tab3();
 var t=900;k.forEach(function(s,i){var rest=g[s].every(function(p){return S.keep[p.id]}),late=!rest&&s===ls&&k.length>1,d=t+i*650+(late?1400:0),wk=rest?49:late?47:ONSKET;
  later(function(){S.sup[s]={st:'ok',uke:wk,late:late,rest:rest};
   log('<b>'+s+'</b> bekreftet: ordrenr. '+ONR[s]+', levering uke '+wk+'.');
   if(late){S.caseTxt=['Sak S-318: '+s+' leverer uke 47, ikke uke '+ONSKET,'Varen kommer i montasjeuka. Saken ligger hos Ingrid med frist i morgen: be om tidligere levering eller avtal med Piotr.'];log('<b>Sak S-318</b> opprettet: '+s+' leverer i montasjeuka. Frist i morgen.')}
   g[s].forEach(function(p){if(S.keep[p.id])log('<b>'+p.m+' '+p.mod+'</b> bekreftet som restordre uke 49. Ettermontering står i planen.')});
   if(k.every(function(x){return S.sup[x].st==='ok'})){S.done=true;step('bestill');log('Alle bekreftelser ligger på ordre 24-0791. Ingen ble tastet inn for hånd.')}
   if(S.tab===3)tab3();render()},d)})}
/* 4. Etterpå */
function events(){var g=groups(),k=Object.keys(g),kept=chosen().filter(function(p){return S.keep[p.id]});
 var uke=function(s){return (S.sup[s]||{}).uke||ONSKET};
 var tot=chosen().reduce(function(a,p){return a+p.net},0);
 return [['Ordrebekreftelser lagt på ordren','I dag',k.length+' bekreftelser fra '+k.join(', ')+'. Leveringsukene står på ordren og på kundens Min side.'],
 ['Leveringsvarsler','Uke 45','Sendingsnummer, kolli og leveringsdag kobles til ordren: '+k.map(function(s){return s+' uke '+uke(s)}).join(', ')+'. Lageret i Hamar ser hva som kommer.'],
 ['Varene tatt imot på lager','Uke 46–47','Skannet mot ordre 24-0791. Piotr ser hva som er på plass før montasjen.'+(kept.length?' '+kept.map(function(p){return p.m+' '+p.mod}).join(', ')+' kommer uke 49.':'')],
 ['Fakturaer matchet mot bestillingen','Ved levering',k.length+' fakturaer, netto '+fmt(tot)+' til sammen. Beløpene stemmer, og de ligger klare til attestering på ordren.'],
 ['Klar for montasje','Uke 47','Hvitevarene er bestilt, bekreftet og fakturert uten at noe er tastet inn for hånd.'+(kept.length?' Ettermontering uke 49 står i Piotrs plan.':'')]]}
function tab4(){var E=events();
 var h='<h2>Etterpå</h2><p class="muted">Leveringsvarsel og faktura kommer som data fra leverandøren, ikke som PDF i innboksen. Hengsel CRM kobler dem til ordren selv.</p><div class="tl">';
 E.forEach(function(e,i){var d=i<=S.etter;h+='<div class="'+(d?'d':i===S.etter+1?'n':'w')+'"><div><b>'+e[0]+'</b> <em>· '+e[1]+'</em><span>'+e[2]+'</span></div></div>'});
 h+='</div><div class="afoot"><span class="sum">'+(S.etter>=E.length-1?'<b class="ok">Alt koblet til ordre 24-0791</b>':(S.etter)+' av '+(E.length-1)+' hendelser')+'</span><button class="btn primary" type="button" id="ff"'+(S.etter>=E.length-1||S.ffing?' disabled':'')+'>'+(S.ffing?'Spoler …':'Spol fram')+'</button></div>';
 $('body').innerHTML=h;
 if($('ff'))$('ff').onclick=function(){S.ffing=true;tab4();var n=E.length-1-S.etter;for(var j=1;j<=n;j++)(function(j){later(function(){S.etter++;var e=E[S.etter];log('<b>'+e[0]+'</b>: '+e[2]);if(S.etter>=E.length-1){S.ffing=false;step('etter')}if(S.tab===4)tab4()},j*800)})(j)}}
$('reset').onclick=init;
init();
})();
