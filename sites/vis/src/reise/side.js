(function(){
  var $=function(id){return document.getElementById(id)};
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rowsEl=$('rows'),flow=$('flow'),svg=$('lines'),crm=$('crm');
  var cur=1,playing=false,timers=[],anims=[],nodes=[],autoT=null;
  /* Skjermbilde per scene (CRM_v4, alle på PC): tegning → tilbudslista, tilbud/signering → tilbud og kunde, bestilling/bekreftelse/endring →
     ordre og kontrollmål, levering og montasje → Mer › Montasje › Kontrollmål, faktura → etterkalkyle for én ordre */
  var V=Skjermbilder.alle(),BILDE=[['pc',0],['pc',1],['pc',1],['pc',2],['pc',2],['pc',2],['pc',3],['pc',4]];
  function bilde(n){var b=BILDE[n-1];[].forEach.call(document.querySelectorAll('.pane [data-enhet]'),function(w){w.hidden=w.dataset.enhet!==b[0]});V[b[0]].vis(b[1])}

  var HEAD_LI={t:'Ordre 10087',s:'Hanne Liksomlien · Lillehammer · montasje uke 46'};
  var FIVE=[
    {id:'sig',name:'Fabrikken',what:'Kjøkken, 54 linjer',ref:'LI-10087-1',out:'CET-ordresetting',back:'OB som XML'},
    {id:'bsh',name:'BSH',what:'Hvitevarer, 4 linjer',ref:'LI-10087-2',out:'Tradeplace',back:'Tradeplace-melding'},
    {id:'cor',name:'Corinor',what:'Benkeplate, 2 linjer',ref:'LI-10087-3',out:'E-post · PDF',back:'PDF lest med AI'},
    {id:'tap',name:'Armaturleverandør',what:'Kjøkkenarmatur, 1 linje',ref:'LI-10087-4',out:'EDI (Pagero)',back:'EDI-bekreftelse',warn:true},
    {id:'ror',name:'Røros Metall',what:'Ventilator, 1 linje',ref:'LI-10087-5',out:'E-post · PDF',back:'PDF lest med AI'}
  ];
  function fiveRows(st,txt){return FIVE.map(function(s){return{id:s.id,who:s.name,what:s.what,ref:s.ref,st:st,txt:txt}})}

  var SCENES=[
  {t:'Tegningen',where:'CET › Tilbud',flow:'Tegning inn',
   lead:'Selgeren tegner kjøkkenet i CET og lagrer. Tilbudet fyller seg selv i CRM, linje for linje.',
   head:{t:'Tilbud 10087',s:'Hanne Liksomlien · Lillehammer · utkast'},
   rows:[
    {id:'u',who:'Underskap',what:'18 linjer · fra CET',hidden:1},
    {id:'o',who:'Overskap og høyskap',what:'12 linjer · fra CET',hidden:1},
    {id:'f',who:'Fronter og håndtak',what:'16 linjer · fra CET',hidden:1},
    {id:'s',who:'Sokkel, lister og tilpasning',what:'8 linjer · fra CET',hidden:1},
    {id:'d',who:'Tegninger',what:'Plan, oppriss og 3D · PDF',hidden:1}],
   nodes:[{id:'cet',name:'CET',chan:'Selgerens tegning'},{id:'pl',name:'Fabrikkens prisliste',chan:'Gjeldende priser'}],
   card:{kind:'note',lbl:'Tilbudet er klart',t:'54 linjer fra CET',p:'Ingen import og ingen skriving. Selgeren har bare tegnet.'},
   script:function(){
    at(300,function(){cap('Kunden er opprettet i CRM. Navn og prosjektnummer 10087 går til CET, så ingen skriver det to ganger.');pk('cet','out','Kunde 10087',1500)});
    at(2600,function(){cap('Selgeren lagrer tegningen. CET sender ordrefilen og to PDF-er automatisk.');pk('cet','in','Nobia-XML',1500)});
    at(3300,function(){pk('cet','in','Tegninger · PDF',1500)});
    at(4000,function(){pk('cet','in','Elementliste · PDF',1500)});
    ['u','o','f','s','d'].forEach(function(r,i){at(4300+i*500,function(){show(r);st(r,'ok','Lest')})});
    at(7000,function(){cap('Prisene kontrolleres mot gjeldende prisliste, med gyldighet.');pk('pl','in','Priser',1500)});
    at(8600,function(){nd('pl','ok');nd('cet','ok');card();cap('Tilbudet er i CRM uten import. Prosjektnummeret kobler tegning, kunde og ordre.')});
    at(10600,done);
   }},
  {t:'Tilbudet',where:'Tilbud 10087 › Katalog',flow:'Pris og lager inn',
   lead:'Selgeren legger til hvitevarer, armatur, ventilator og benkeplate fra katalogen. Pris, lager og leveringstid kommer fra leverandøren.',
   head:{t:'Tilbud 10087',s:'Hanne Liksomlien · Lillehammer · til kunden'},
   rows:[
    {id:'sig',who:'Fabrikken',what:'Kjøkken, 54 linjer · fra CET',st:'ok',txt:'Fra CET'},
    {id:'bsh',who:'BSH',what:'Induksjon, stekeovn, oppvask, kjøl/frys',hidden:1},
    {id:'tap',who:'Armaturleverandør',what:'Kjøkkenarmatur',hidden:1},
    {id:'ror',who:'Røros Metall',what:'Ventilator',hidden:1},
    {id:'cor',who:'Corinor',what:'Benkeplate, mål fra tegningen',hidden:1}],
   nodes:[{id:'tp',name:'Tradeplace',chan:'BSH: pris og lager i sanntid'},{id:'tf',name:'Armaturleverandør',chan:'Produktfil'},{id:'rf',name:'Røros Metall',chan:'Produktfil'},{id:'cf',name:'Corinor',chan:'Prisliste'},{id:'min',name:'Kunden · Min side',chan:'Tilbud til kunden'}],
   card:{kind:'note',lbl:'Sendt til kunden',t:'Hanne ser tilbudet i Min side',p:'Fem leverandører i ett tilbud, med leveringstid per vare.'},
   script:function(){
    at(300,function(){cap('Ingen gamle regneark: prisene kommer fra leverandørens egne filer, med gyldighet.')});
    at(1400,function(){cap('BSH via Tradeplace: pris og lagerstatus i sanntid.');pk('tp','in','Pris + lager',1500)});
    at(2900,function(){show('bsh');st('bsh','ok','På lager · 2 uker');nd('tp','ok')});
    at(3300,function(){cap('Armaturleverandøren og Røros Metall: produktfil med pris og gyldighet.');pk('tf','in','Produktfil',1500)});
    at(4800,function(){show('tap');st('tap','ok','3 uker');nd('tf','ok')});
    at(4900,function(){pk('rf','in','Produktfil',1500)});
    at(6400,function(){show('ror');st('ror','ok','2 uker');nd('rf','ok')});
    at(6600,function(){cap('Corinor: prisliste. Benkeplaten prises ut fra målene i tegningen.');pk('cf','in','Prisliste',1500)});
    at(8100,function(){show('cor');st('cor','ok','2 uker');nd('cf','ok')});
    at(8700,function(){cap('Tilbudet går til kunden i Min side, med alt på ett sted.');pk('min','out','Tilbud',1500)});
    at(10200,function(){nd('min','ok');card()});
    at(12000,done);
   }},
  {t:'Signering',where:'Ordre 10087 › Leveringsplan',flow:'Signert og planlagt',
   lead:'Kunden signerer med BankID. Montasjen settes til uke 46, og leveringsukene regnes bakover med ledetiden til hver leverandør.',
   head:{t:'Ordre 10087',s:'Hanne Liksomlien · Lillehammer · signeres'},
   rows:[
    {id:'sig',who:'Fabrikken',what:'Ledetid 4 uker',ref:'LI-10087-1',txt:'Venter'},
    {id:'bsh',who:'BSH',what:'Ledetid 2 uker',ref:'LI-10087-2',txt:'Venter'},
    {id:'cor',who:'Corinor',what:'Ledetid 2 uker',ref:'LI-10087-3',txt:'Venter'},
    {id:'tap',who:'Armaturleverandør',what:'Ledetid 3 uker',ref:'LI-10087-4',txt:'Venter'},
    {id:'ror',who:'Røros Metall',what:'Ledetid 2 uker',ref:'LI-10087-5',txt:'Venter'}],
   nodes:[{id:'bank',name:'BankID',chan:'Kunden signerer'},{id:'hen',name:'Hengsel · montørplan',chan:'Montasjejobb'},{id:'led',name:'Leverandørdata',chan:'Ledetider'}],
   card:{kind:'note',lbl:'Klar til bestilling',t:'Alt er på plass uke 45',p:'Én uke før montøren kommer. Bestillingene kan gå ut.'},
   script:function(){
    at(300,function(){cap('Kunden signerer kontrakten med BankID på mobilen.');pk('bank','in','Signert',1500)});
    at(1800,function(){nd('bank','ok');$('ohS').textContent='Hanne Liksomlien · Lillehammer · montasje uke 46';cap('Signert. Ordren er låst, og montasjen er satt til uke 46.')});
    at(3000,function(){cap('Montøren får jobben i Hengsel med en gang.');pk('hen','out','Uke 46',1500)});
    at(4500,function(){nd('hen','ok')});
    at(4900,function(){cap('Leveringsukene regnes bakover fra montasjen, med ledetiden til hver leverandør.');pk('led','in','Ledetider',1500)});
    at(6400,function(){nd('led','ok')});
    FIVE.forEach(function(s,i){at(6600+i*450,function(){st(s.id,'ok','Levering uke 45','Ønsket leveringsuke 45 følger med bestillingen')})});
    at(9200,function(){card();cap('Alt skal være på plass uke 45, én uke før montøren kommer.')});
    at(11000,done);
   }},
  {t:'Bestillingene',where:'Ordre › Bestillinger',flow:'Bestilling ut',
   lead:'Kunden har signert. Fem bestillinger går ut samtidig, hver i den kanalen leverandøren kan ta imot, men med den samme referansen.',
   head:HEAD_LI,rows:fiveRows('', 'Klar'),
   nodes:FIVE.map(function(s){return{id:s.id,name:s.name,chan:s.out}}),
   script:function(){
    at(400,function(){cap('Én referanse per bestilling: LI-10087-1 til -5. Den følger varen helt til fakturaen.')});
    FIVE.forEach(function(s,i){
      at(1600+i*900,function(){pk(s.id,'out',s.ref,1600);cap(s.name+': '+s.out+'.')});
      at(3200+i*900,function(){st(s.id,'sent','Sendt')});
    });
    at(7600,function(){cap('Tre måter å sende på, men samme referanse og riktig kundenummer per selskap. Selgeren trykket ingenting.')});
    at(9800,done);
   }},
  {t:'Bekreftelsene',where:'Ordre › Bestillinger',flow:'Bekreftelse inn',
   lead:'Bekreftelsene kommer tilbake på fem forskjellige måter. CRM sjekker alle linje for linje. Selgeren ser bare det som avviker.',
   head:HEAD_LI,rows:fiveRows('sent','Sendt'),
   nodes:FIVE.map(function(s){return{id:s.id,name:s.name,chan:s.back}}),
   card:{kind:'task',lbl:'Min dag · ny oppgave',t:'Avvik på bekreftelse fra armaturleverandøren (LI-10087-4)',p:'Bekreftet 2 stk kjøkkenarmatur, bestilt 1. Kontroller og svar leverandøren.'},
   script:function(){
    at(400,function(){cap('Bekreftelsene kommer inn i den formen leverandøren kan sende.')});
    FIVE.forEach(function(s,i){
      at(1500+i*1100,function(){pk(s.id,'in',s.back,1500,s.warn);cap(s.name+': '+s.back+'.')});
      at(3000+i*1100,function(){
        if(s.warn){nd(s.id,'warn');st(s.id,'warn','Avvik','Antall: bekreftet 2, bestilt 1')}
        else{nd(s.id,'ok');st(s.id,'ok','Bekreftet','Alle linjer stemmer: artikkel, antall, pris og uke')}
      });
    });
    at(8800,function(){card();cap('Fire bekreftelser stemmer, og selgeren ser ingenting av dem. Armaturleverandøren avviker, så selgeren får én oppgave i Min dag.')});
    at(11500,done);
   }},
  {t:'Endring og rest',where:'Ordre › Fabrikken',flow:'Endring ut, OB inn',
   lead:'Kunden bytter en front før siste endringsdag. Endringen og resten kommer merket, så CRM vet hva som er nytt.',
   head:{t:'Fabrikken · LI-10087-1',s:'Siste endringsdag (ENDFØR) fredag uke 42'},
   rows:[
    {id:'frt',who:'Front, høyskap',what:'Glassfront byttes til tett front',ref:'LI-10087-1',txt:'Bestilt'},
    {id:'ob',who:'Endrings-OB',what:'1 linje ny, 1 linje utgår',ref:'LI-10087-1',hidden:1},
    {id:'rest',who:'Rest: sokkel, 2 stk',what:'Merket med opprinnelig ordre',ref:'LI-10087-1',hidden:1}],
   nodes:[{id:'kunde',name:'Kunden · Min side',chan:'Endringsønske'},{id:'sig',name:'Fabrikken',chan:'CET-ordresetting'},{id:'hen',name:'Hengsel · montør',chan:'Arbeidsordre'}],
   card:{kind:'note',lbl:'Ingen oppgave til selgeren',t:'Montøren ser at sokkelen kommer uke 47',p:'Endringen er bekreftet og kontrollert. Resten er planlagt inn i montasjen.'},
   script:function(){
    at(300,function(){cap('Kunden vil bytte en glassfront til tett front. Det er før siste endringsdag.');pk('kunde','in','Ny front',1500)});
    at(1800,function(){nd('kunde','ok');st('frt','sent','Endres')});
    at(2400,function(){cap('Selgeren endrer i CET. Endringsordren går med samme referanse, LI-10087-1.');pk('sig','out','Endringsordre',1500)});
    at(4300,function(){cap('Endrings-OB kommer merket som endring. CRM ser hva som er nytt og hva som utgår, og sjekker prisen.');pk('sig','in','Endrings-OB',1500)});
    at(5800,function(){show('ob');st('ob','ok','Kontrollert','Ny pris stemmer med tilbudet');st('frt','ok','Bekreftet');nd('sig','ok')});
    at(7400,function(){cap('Senere kommer én linje som rest, merket med opprinnelig ordre.');pk('sig','in','Rest-OB',1500,true)});
    at(8900,function(){show('rest');st('rest','warn','Rest uke 47');nd('sig','warn')});
    at(9600,function(){cap('Resten går rett til montøren i Hengsel. Selgeren trenger ikke gjøre noe.');pk('hen','out','Rest uke 47',1500)});
    at(11100,function(){nd('hen','ok');card()});
    at(13000,done);
   }},
  {t:'Levering og montasje',where:'Ordre › Levering',flow:'Varsel, sporing og avvik',
   lead:'Kunden får beskjed om dag og tidsvindu. Montøren ser hva som er levert, og melder avvik med bilde rett fra appen.',
   head:{t:'Ordre 10087',s:'Levering uke 45 · montasje uke 46'},
   rows:fiveRows('', 'Bestilt').concat([{id:'avv',who:'Avvik: skadet sidepanel',what:'Meldt av montør, med bilde',ref:'LI-10087-1',hidden:1}]),
   nodes:[{id:'tr',name:'Transportør',chan:'Sporing (API)'},{id:'kunde',name:'Kunden',chan:'SMS via Unifon'},{id:'hen',name:'Hengsel · montør',chan:'Montørappen'},{id:'sig',name:'Fabrikken',chan:'Reklamasjon'}],
   card:{kind:'note',lbl:'Ingen telefon',t:'Erstatningen kommer uke 47',p:'Selgeren ser avviket og svaret, men trenger ikke ringe noen.'},
   script:function(){
    at(300,function(){cap('To virkedager før kommer leveringsvarselet med dag og tidsvindu.');pk('tr','in','Leveringsvarsel',1500)});
    at(1800,function(){FIVE.forEach(function(s){st(s.id,'sent','Varslet')})});
    at(2200,function(){cap('Kunden får SMS med dag, tidsvindu og sporingslenke.');pk('kunde','out','SMS',1500)});
    at(3700,function(){nd('kunde','ok')});
    at(4100,function(){cap('Varene er levert. Leveringsbeviset kommer digitalt.');pk('tr','in','Levert',1500)});
    FIVE.forEach(function(s,i){at(5600+i*350,function(){st(s.id,'ok','Levert','Digitalt leveringsbevis')})});
    at(5600,function(){nd('tr','ok')});
    at(7600,function(){cap('Uke 46: montøren åpner jobben i Hengsel og ser hva som er levert og hva som kommer.');pk('hen','out','Arbeidsordre',1500)});
    at(9300,function(){cap('Montøren finner et skadet sidepanel og melder avvik med bilde.');pk('hen','in','Avvik + bilde',1500,true)});
    at(10800,function(){nd('hen','warn');show('avv');st('avv','warn','Reklamert')});
    at(11300,function(){cap('Reklamasjonen går rett til fabrikken med referanse og bilde.');pk('sig','out','Reklamasjon',1500)});
    at(13000,function(){cap('Fabrikken svarer med erstatning uke 47.');pk('sig','in','Erstatning uke 47',1500)});
    at(14500,function(){nd('sig','ok');nd('hen','ok');st('avv','ok','Erstatning uke 47');card()});
    at(16300,done);
   }},
  {t:'Faktura',where:'Ordre › Økonomi',flow:'EHF inn, avstemming',
   lead:'Fakturaene kommer som EHF og avstemmes mot ordrebekreftelsene. Kunden får faktura og FDV-pakke.',
   head:{t:'Ordre 10087',s:'Fakturaer mot ordrebekreftelser'},
   rows:fiveRows('', 'Venter'),
   nodes:[{id:'lev',name:'Leverandørene',chan:'EHF-faktura'},{id:'po',name:'PowerOffice',chan:'Regnskap'},{id:'kunde',name:'Kunden',chan:'Faktura og FDV'}],
   card:{kind:'task',lbl:'Min dag · ny oppgave',t:'Fakturaavvik Corinor (LI-10087-3)',p:'Frakt 1 450 kr står ikke i ordrebekreftelsen. Godkjenn eller avvis.'},
   script:function(){
    at(300,function(){cap('Fakturaene kommer som EHF, med ordrenummer og vår referanse i faste felt.')});
    FIVE.forEach(function(s,i){
      at(1200+i*700,function(){pk('lev','in','EHF '+s.ref.slice(-1),1400,s.id==='cor')});
      at(2600+i*700,function(){
        if(s.id==='cor'){st(s.id,'warn','Avvik','Frakt 1 450 kr, står ikke i OB')}
        else{st(s.id,'ok','Avstemt','Stemmer med OB: antall, pris og frakt')}
      });
    });
    at(6200,function(){nd('lev','warn');card();cap('Fire fakturaer går rett igjennom. Corinor har frakt som ikke står i OB, så selgeren får én oppgave.')});
    at(8000,function(){cap('Godkjente fakturaer bokføres i PowerOffice.');pk('po','out','4 godkjent',1500)});
    at(9500,function(){nd('po','ok')});
    at(9900,function(){cap('Kundefakturaen sendes i samme mva-periode, og kunden får FDV-pakken for hele kjøkkenet.');pk('kunde','out','Faktura + FDV',1500)});
    at(11400,function(){nd('kunde','ok')});
    at(12600,function(){$('finale').classList.add('show')});
    at(13000,done);
   }}
  ];

  // Tidslinje
  var tl=$('timeline');
  SCENES.forEach(function(sc,i){
    var n=i+1,b=document.createElement('button');b.type='button';b.className='tl';b.id='tl-'+n;
    b.innerHTML='<i></i><span>'+n+' · '+sc.t+'</span>';
    b.setAttribute('aria-label','Scene '+n+': '+sc.t);
    b.addEventListener('click',function(){go(n)});
    tl.appendChild(b);
  });

  function build(sc){
    rowsEl.innerHTML='';
    sc.rows.forEach(function(r){
      var e=document.createElement('div');e.className='row'+(r.hidden?' hide':'');e.id='r-'+r.id;
      e.innerHTML='<span class="who">'+r.who+'</span><span class="pill st'+(r.st?' '+r.st:'')+'" id="st-'+r.id+'">'+(r.txt||'')+'</span><span class="what">'+r.what+(r.ref?' · <span class="ref">'+r.ref+'</span>':'')+'</span><span class="check" id="ck-'+r.id+'"></span>';
      if(!r.txt&&!r.st)e.querySelector('.st').style.visibility='hidden';
      rowsEl.appendChild(e);
    });
    flow.querySelectorAll('.node.sup').forEach(function(n){n.remove()});
    nodes=sc.nodes;
    nodes.forEach(function(s){
      var n=document.createElement('div');n.className='node sup';n.id='n-'+s.id;
      n.innerHTML='<b>'+s.name+'</b><span class="chan">'+s.chan+'</span>';
      flow.appendChild(n);
    });
    flow.style.minHeight=Math.max(340,nodes.length*76)+'px';
    var c=sc.card,el=$('card');
    el.className='tile msg'+(c&&c.kind==='note'?' note':'');el.style.display=c?'':'none';
    if(c){$('cLbl').textContent=c.lbl;$('cT').textContent=c.t;$('cP').textContent=c.p}
    layout();
  }
  function layout(){
    var H=flow.clientHeight,W=flow.clientWidth,gap=H/Math.max(1,nodes.length);
    svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.innerHTML='';
    var c=center(crm);
    nodes.forEach(function(s,i){
      var n=$('n-'+s.id);if(!n)return;n.style.top=(gap*i+gap/2-n.offsetHeight/2)+'px';
      var p=center(n);
      var l=document.createElementNS('http://www.w3.org/2000/svg','line');
      l.setAttribute('x1',c.x2);l.setAttribute('y1',c.y);l.setAttribute('x2',p.x1);l.setAttribute('y2',p.y);l.id='ln-'+s.id;
      if(n.dataset.on)l.classList.add('on');
      svg.appendChild(l);
    });
  }
  function center(el){var r=el.getBoundingClientRect(),f=flow.getBoundingClientRect();return{x1:r.left-f.left,x2:r.right-f.left,y:r.top-f.top+r.height/2}}

  function pk(id,dir,label,dur,warn){
    var n=$('n-'+id),l=$('ln-'+id);if(n)n.dataset.on=1;if(l)l.classList.add('on');
    if(reduce)return;
    var back=dir==='in',el=document.createElement('div');
    el.className='packet'+(back?' back':'')+(back&&warn?' w':'');el.textContent=label;
    flow.appendChild(el);
    var c=center(crm),p=center(n),A={x:c.x2,y:c.y},B={x:p.x1,y:p.y},from=back?B:A,to=back?A:B,w=el.offsetWidth,h=el.offsetHeight;
    var k=[{transform:'translate('+(from.x-w/2)+'px,'+(from.y-h/2)+'px)',opacity:0},{opacity:1,offset:.12},{opacity:1,offset:.88},{transform:'translate('+(to.x-w/2)+'px,'+(to.y-h/2)+'px)',opacity:0}];
    var a=el.animate(k,{duration:dur||1500,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
    anims.push(a);a.onfinish=function(){el.remove()};
  }
  function at(ms,fn){timers.push({fn:fn,left:reduce?0:ms,start:0})}
  function runTimers(){timers.forEach(function(t){if(t.id||t.done)return;t.start=performance.now();t.id=setTimeout(function(){t.done=true;t.fn()},t.left)})}
  function pauseTimers(){timers.forEach(function(t){if(t.id&&!t.done){clearTimeout(t.id);t.id=null;t.left=Math.max(0,t.left-(performance.now()-t.start))}});anims.forEach(function(a){if(a.playState==='running')a.pause()})}
  function resumeAnims(){anims.forEach(function(a){if(a.playState==='paused')a.play()})}
  function clearAll(){clearTimeout(autoT);timers.forEach(function(t){clearTimeout(t.id)});timers=[];anims.forEach(function(a){try{a.cancel()}catch(e){}});anims=[];flow.querySelectorAll('.packet').forEach(function(p){p.remove()})}
  function cap(t){$('caption').textContent=t}
  function show(id){var r=$('r-'+id);r.classList.remove('hide');if(!reduce)r.classList.add('enter')}
  function st(id,cls,txt,check){
    var e=$('st-'+id),r=$('r-'+id);e.style.visibility='';e.className='pill st'+(cls?' '+cls:'');e.textContent=txt;
    r.classList.toggle('flag',cls==='warn');
    if(check){$('ck-'+id).textContent=check;r.classList.add('done')}
  }
  function nd(id,cls){var n=$('n-'+id);n.classList.remove('ok','warn');if(cls)n.classList.add(cls)}
  function card(){$('card').classList.add('show')}
  function done(){
    playing=false;$('play').textContent='Spill av igjen';$('play').dataset.state='done';
    if($('auto').getAttribute('aria-checked')==='true'&&cur<SCENES.length){autoT=setTimeout(function(){go(cur+1);play()},reduce?400:1600)}
  }

  function go(n){
    if(n<1||n>SCENES.length)return;
    clearAll();cur=n;playing=false;
    var sc=SCENES[n-1];
    $('sceneNo').textContent=n;$('title').textContent=sc.t;$('lead').textContent=sc.lead;$('flowLbl').textContent=sc.flow;$('where').textContent=sc.where;
    $('dokLenke').hidden=!(n===2||n===3);
    $('ohT').textContent=sc.head.t;$('ohS').textContent=sc.head.s;
    bilde(n);
    $('finale').classList.remove('show');
    SCENES.forEach(function(s,i){var b=$('tl-'+(i+1));b.classList.toggle('cur',i+1===n);b.classList.toggle('past',i+1<n);if(i+1===n)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
    var cb=$('tl-'+n);tl.scrollLeft=cb.offsetLeft-(tl.clientWidth-cb.offsetWidth)/2;
    $('prev').disabled=n===1;$('next').disabled=n===SCENES.length;
    $('play').textContent='Spill av';$('play').dataset.state='';
    build(sc);cap('Trykk Spill av.');
  }
  function play(){
    var b=$('play');
    if(b.dataset.state==='done'){go(cur)}
    if(playing){pauseTimers();playing=false;b.textContent='Fortsett';return}
    if(!timers.length){SCENES[cur-1].script()}
    playing=true;b.textContent='Pause';resumeAnims();runTimers();
  }
  $('play').addEventListener('click',play);
  $('prev').addEventListener('click',function(){go(cur-1)});
  $('next').addEventListener('click',function(){go(cur+1)});
  $('restart').addEventListener('click',function(){go(cur)});
  $('auto').addEventListener('click',function(){var a=$('auto');a.setAttribute('aria-checked',a.getAttribute('aria-checked')==='true'?'false':'true')});
  $('again').addEventListener('click',function(){go(1);play()});
  // Fullskjerm på hele siden. Skjules der nettleseren ikke tillater det (f.eks. Safari på iPad).
  if(!document.fullscreenEnabled)$('fs').style.display='none';
  $('fs').addEventListener('click',function(){
    var p=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
    if(p&&p.catch)p.catch(function(){});
  });
  document.addEventListener('keydown',function(e){
    if(e.target&&(e.target.tagName==='INPUT'||e.target.id==='auto'))return;
    if(e.key==='ArrowRight'){go(cur+1)}
    else if(e.key==='ArrowLeft'){go(cur-1)}
    else if(e.key===' '){e.preventDefault();play()}
  });
  new ResizeObserver(function(){layout()}).observe(flow);
  go(1);
})();
