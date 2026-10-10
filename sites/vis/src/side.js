(function(){
var R=[
 ['alle','Alt',''],
 ['selger','Selger og butikk','Slik ser hverdagen ut i CRM: fra tegning og tilbud til ferdig kjøkken, og hva kunden opplever.'],
 ['montor','Montør og montasjefirma','Slik får dere jobbene, svarer på forespørsler og melder ferdig i Hengsel.'],
 ['leverandor','Leverandør','Hva vi ønsker fra dere, hvordan det kommer inn hos oss, og hva dere får tilbake.'],
 ['sigdal','Sigdal og Nobia','Hvordan butikkene jobber med Sigdal-ordrene, og hva som må til for at alt går av seg selv.']
];
// b: ferdig sammensatt bilde av enhetsramme + skjermbilde (src/img/rom-*.webp). Rom med skjermbilde fra designfilene: scripts/rammer-vis.mjs.
// Rom uten: rommet selv i Studio Display (scripts/skjermbilder-vis.mjs). Dokumentene er A4-ark uten ramme.
var C=[
 {u:'/reise/',b:'/img/rom-reise.webp',t:'Ordrens reise',type:'Simulering',p:'Én kjøkkenordre fra tegning i CET til montert kjøkken og faktura, i åtte scener med fem leverandører.',r:['selger','montor','leverandor','sigdal'],go:'Spill av'},
 {u:'/crm/',b:'/img/rom-crm.webp',t:'Prøv CRM selv',type:'Prøv selv',p:'En dag som selger: Min dag, avvik fra leverandører, tilbud fra CET, ordre og montasjeplan.',r:['selger','sigdal'],go:'Prøv CRM'},
 {u:'/kunde/',b:'/img/rom-kunde.webp',t:'Kundens reise',type:'Simulering',p:'Det kunden opplever i Min side og på SMS, fra tilbud og BankID til FDV og reklamasjon.',r:['selger'],go:'Spill av'},
 {u:'/opplaering/',b:'/img/rom-opplaering.webp',t:'Opplæring for selgere',type:'Opplæring',p:'Ti korte deler fra kunde og tilbud til bestilling, frister og montasje.',r:['selger'],go:'Start'},
 {u:'/montor/',b:'/img/rom-montor.webp',t:'Montørappen Hengsel',type:'Prøv selv',p:'En monteringsdag: neste jobb, KS, avvik med bilde og ferdigmelding med signatur.',r:['montor','selger'],go:'Prøv appen'},
 {u:'/levprov/',b:'/img/rom-levprov.webp',t:'Prøv som leverandør',type:'Prøv selv',p:'Send en ordrebekreftelse til bestilling@ og se hvordan den leses, kobles og besvares på sekunder.',r:['leverandor','sigdal'],go:'Prøv nå'},
 {u:'/minside/',b:'/img/rom-minside.webp',t:'Kundens Min side',type:'Prøv selv',p:'Vær kunden på mobil eller PC: velg tilvalg, godkjenn og signer, bekreft leveringen og meld en feil. Se hva CRM-et gjør samtidig.',r:['selger','sigdal'],go:'Prøv Min side'},
 {u:'/kontroll/',b:'/img/rom-kontroll.webp',t:'Ordre- og fakturakontroll',type:'Prøv selv',p:'Tegning mot bekreftelse, og bekreftelse mot faktura. Bare avvikene vises, og du bestemmer hva som skjer.',r:['selger','leverandor','sigdal'],go:'Kjør kontrollen'},
 {u:'/montasjeplan/',b:'/img/rom-montasjeplan.webp',t:'Montasjeplan',type:'Prøv selv',p:'Sett montører på ordrene og se med en gang om leveringsuker, kapasitet og sertifisering går opp.',r:['selger','montor'],go:'Planlegg montasje'},
 {u:'/prosjekt/',b:'/img/rom-prosjekt.webp',t:'Prosjektsalg med tilvalg',type:'Prøv selv',p:'Følg et boligprosjekt fra standardkjøkken til tilvalg og én samlet bestilling per oppgang.',r:['selger','sigdal'],go:'Prøv prosjektsalg'},
 {u:'/hvitevarer/',b:'/img/rom-hvitevarer.webp',t:'Hvitevarer via Tradeplace',type:'Prøv selv',p:'Bestill hvitevarer fra flere merker rett fra ordren, med pris og lager live og sjekk mot tegning og montasjeuke.',r:['selger','leverandor'],go:'Prøv bestillingen'},
 {u:'/tegning/',b:'/img/rom-tegning.webp',t:'Tegningen i Hengsel',type:'Prøv selv',p:'Montøren jobber rett i romtegningen: trykker på et skap, ser mål og varer, og melder ferdig eller avvik.',r:['montor','selger'],go:'Prøv tegningen'},
 {u:'/gevinst/',b:'/img/rom-gevinst.webp',t:'Gevinstkalkulator',type:'Prøv selv',p:'Legg inn butikkens egne tall og se hvor mye tid og penger løsningen sparer i året.',r:['sigdal','selger'],go:'Regn på det'},
 {u:'/firmaleder/',b:'/img/rom-firmaleder.webp',t:'Firmaleder i Hengsel',type:'Prøv selv',p:'Ny forespørsel med 48 timers svarfrist, aksepter eller avvis, velg montør og se teamets uke.',r:['montor'],go:'Prøv appen'},
 {u:'/leverandor/',b:'/img/rom-leverandor.webp',t:'Leverandørløsningen',type:'Presentasjon',p:'De tolv strømmene, tre nivåer, krav, frister og plan. Med kravene til Sigdal (S-55).',r:['leverandor','sigdal'],go:'Se presentasjonen'},
 {u:'/leder/',b:'/img/rom-leder.webp',t:'Daglig leder',type:'Oversikt',p:'Ordrereserve per uke, tilbud ute, treffprosent, margin og det som står i fare, per butikk og selger.',r:['selger','sigdal'],go:'Åpne oversikten'},
 {u:'/dokumenter/',b:'/img/rom-dokumenter.webp',t:'Dokumentene',type:'Dokumenter',p:'Tilbud, kjøpsavtale, monteringsrapport og FDV-pakke som A4-sider, slik kunden får dem.',r:['selger','leverandor','sigdal'],go:'Se dokumentene'},
 {u:'/veikart/',b:'/img/rom-veikart.webp',t:'Veikart og status',type:'Oversikt',p:'Hva som er i drift i dag, hva som kommer kvartal for kvartal, og hva vi venter på fra andre.',r:['selger','leverandor','sigdal'],go:'Se veikartet'},
 {u:'/sv/',b:'/img/rom-sv.webp',t:'For Nobia (svenska / English)',type:'Presentasjon',p:'Kort innføring i løsningen på svensk og engelsk, med systemkartet oversatt.',r:['sigdal'],go:'Öppna / Open'},
 {u:'/system/',b:'/img/rom-system.webp',t:'Systemkartet',type:'Oversikt',p:'Hele løsningen på ett kart: hva som går inn og ut av CRM, og hvor langt hver kobling har kommet.',r:['selger','leverandor','sigdal'],go:'Åpne kartet'}
];
var cur='alle';
function finnes(k){return R.some(function(x){return x[0]===k})}
try{var q=new URLSearchParams(location.search).get('rolle');if(q&&finnes(q))cur=q;else{var s=localStorage.getItem('vis.rolle');if(s&&finnes(s))cur=s}}catch(e){}
var roles=document.getElementById('roles'),out=document.getElementById('out');
R.forEach(function(r){var b=document.createElement('button');b.type='button';b.className='btn';b.textContent=r[1];b.dataset.r=r[0];b.onclick=function(){set(r[0])};roles.appendChild(b)});
function card(c){return '<a class="card rom" href="'+c.u+'"><div class="bilde enhet-bilde"><img src="'+c.b+'" alt="" loading="lazy"></div><span class="pill info nodot">'+c.type+'</span><span class="ktittel">'+c.t+'</span><p>'+c.p+'</p><span class="go">'+c.go+' ›</span></a>'}
function set(r){cur=r;try{localStorage.setItem('vis-rolle',r)}catch(e){}
 try{history.replaceState(null,'',r==='alle'?location.pathname:'?rolle='+r)}catch(e){}
 [].forEach.call(roles.children,function(b){b.classList.toggle('dark',b.dataset.r===r);b.setAttribute('aria-pressed',b.dataset.r===r)});
 var info=R.filter(function(x){return x[0]===r})[0];document.getElementById('intro').textContent=info[2];
 var list=C.filter(function(c){return r==='alle'||c.r.indexOf(r)>-1}),h='';
 var groups=[['Se hvordan det henger sammen',['Simulering']],['Prøv selv',['Prøv selv']],['Presentasjoner og oversikter',['Presentasjon','Oversikt','Dokumenter']],['Opplæring',['Opplæring']]];
 groups.forEach(function(g){var l=list.filter(function(c){return g[1].indexOf(c.type)>-1});if(l.length)h+='<section class="gruppe"><h3>'+g[0]+'</h3><div class="grid">'+l.map(card).join('')+'</div></section>'});
 out.innerHTML=h||'<p class="empty">Ingenting her ennå.</p>';
 document.getElementById('note').textContent=r==='alle'?'Alle '+C.length+' rom. Velg en rolle øverst for å se bare det som gjelder deg.':list.length+' rom for '+info[1].toLowerCase()+'.'}
// Start her: tre rom som viser helheten (fasit VisForside v2)
document.getElementById('start').innerHTML=['/reise/','/crm/','/montor/'].map(function(u){return card(C.filter(function(c){return c.u===u})[0])}).join('');
set(cur);
})();
