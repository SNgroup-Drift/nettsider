/* Rommene i Visningsrommet: data til forsiden, /rom/ og gruppesidene (/butikken/, /montoren/, /kunden/, /leverandoren/).
   R = rollene (rollevalget), C = rommene. u = adresse, g = gruppe (forsta, butikken, montoren, kunden, leverandoren, presenter, dokumenter),
   b = ferdig sammensatt bilde av enhet + skjermbilde (src/img, scripts/rammer-vis.mjs og scripts/skjermbilder-vis.mjs), r = roller. */
(function(){
var R=[
 ['alle','Alt',''],
 ['selger','Selger og butikk','Slik ser hverdagen ut i CRM: fra tegning og tilbud til ferdig kjøkken, og hva kunden opplever.'],
 ['montor','Montør og montasjefirma','Slik får dere jobbene, svarer på forespørsler og melder ferdig i Hengsel.'],
 ['leverandor','Leverandør','Hva vi ønsker fra dere, hvordan det kommer inn hos oss, og hva dere får tilbake.'],
 ['nobia','Fabrikken og Nobia','Hvordan butikkene jobber med fabrikkordrene, og hva som må til for at alt går av seg selv.']
];
// b: ferdig sammensatt bilde av enhetsramme + skjermbilde (src/img/rom-*.webp). Rom med skjermbilde fra designfilene: scripts/rammer-vis.mjs.
// Rom uten: rommet selv i Studio Display (scripts/skjermbilder-vis.mjs). Dokumentene er A4-ark uten ramme.
var C=[
 {u:'/reise/',g:'forsta',b:'/img/rom-reise.webp',t:'Ordrens reise',type:'Simulering',p:'Én kjøkkenordre fra tegning i CET til montert kjøkken og faktura, i åtte scener med fem leverandører.',r:['selger','montor','leverandor','nobia'],go:'Spill av'},
 {u:'/crm/',g:'butikken',b:'/img/rom-crm.webp',t:'Prøv CRM selv',type:'Prøv selv',p:'En dag som selger: Min dag, avvik fra leverandører, tilbud fra CET, ordre og montasjeplan.',r:['selger','nobia'],go:'Prøv CRM'},
 {u:'/kunde/',g:'forsta',b:'/img/rom-kunde.webp',t:'Kundens reise',type:'Simulering',p:'Det kunden opplever i Min side og på SMS, fra tilbud og BankID til FDV og reklamasjon.',r:['selger'],go:'Spill av'},
 {u:'/opplaering/',g:'presenter',b:'/img/rom-opplaering.webp',t:'Opplæring for selgere',type:'Opplæring',p:'Ti korte deler fra kunde og tilbud til bestilling, frister og montasje.',r:['selger'],go:'Start'},
 {u:'/montor/',g:'montoren',b:'/img/rom-montor.webp',t:'Montørappen Hengsel Ute',type:'Prøv selv',p:'En monteringsdag: neste jobb, KS, avvik med bilde og ferdigmelding med signatur.',r:['montor','selger'],go:'Prøv appen'},
 {u:'/levprov/',g:'leverandoren',b:'/img/rom-levprov.webp',t:'Prøv som leverandør',type:'Prøv selv',p:'Send en ordrebekreftelse til bestilling@ og se hvordan den leses, kobles og besvares på sekunder.',r:['leverandor','nobia'],go:'Prøv nå'},
 {u:'/minside/',g:'kunden',b:'/img/rom-minside.webp',t:'Kundens Min side',type:'Prøv selv',p:'Vær kunden på mobil eller PC: velg tilvalg, godkjenn og signer, bekreft leveringen og meld en feil. Se hva CRM-et gjør samtidig.',r:['selger','nobia'],go:'Prøv Min side'},
 {u:'/kontroll/',g:'butikken',b:'/img/rom-kontroll.webp',t:'Ordre- og fakturakontroll',type:'Prøv selv',p:'Tegning mot bekreftelse, og bekreftelse mot faktura. Bare avvikene vises, og du bestemmer hva som skjer.',r:['selger','leverandor','nobia'],go:'Kjør kontrollen'},
 {u:'/montasjeplan/',g:'butikken',b:'/img/rom-montasjeplan.webp',t:'Montasjeplan',type:'Prøv selv',p:'Sett montører på ordrene og se med en gang om leveringsuker, kapasitet og sertifisering går opp.',r:['selger','montor'],go:'Planlegg montasje'},
 {u:'/prosjekt/',g:'butikken',b:'/img/rom-prosjekt.webp',t:'Prosjektsalg med tilvalg',type:'Prøv selv',p:'Følg et boligprosjekt fra standardkjøkken til tilvalg og én samlet bestilling per oppgang.',r:['selger','nobia'],go:'Prøv prosjektsalg'},
 {u:'/hvitevarer/',g:'leverandoren',b:'/img/rom-hvitevarer.webp',t:'Hvitevarer via Tradeplace',type:'Prøv selv',p:'Bestill hvitevarer fra flere merker rett fra ordren, med pris og lager live og sjekk mot tegning og montasjeuke.',r:['selger','leverandor'],go:'Prøv bestillingen'},
 {u:'/tegning/',g:'montoren',b:'/img/rom-tegning.webp',t:'Tegningen i Hengsel',type:'Prøv selv',p:'Montøren jobber rett i romtegningen: trykker på et skap, ser mål og varer, og melder ferdig eller avvik.',r:['montor','selger'],go:'Prøv tegningen'},
 {u:'/gevinst/',g:'presenter',b:'/img/rom-gevinst.webp',t:'Gevinstkalkulator',type:'Prøv selv',p:'Legg inn butikkens egne tall og se hvor mye tid og penger løsningen sparer i året.',r:['nobia','selger'],go:'Regn på det'},
 {u:'/firmaleder/',g:'montoren',b:'/img/rom-firmaleder.webp',t:'Firmaleder i Hengsel',type:'Prøv selv',p:'Ny forespørsel med 48 timers svarfrist, aksepter eller avvis, velg montør og se teamets uke.',r:['montor'],go:'Prøv appen'},
 {u:'/leverandor/',g:'presenter',b:'/img/rom-leverandor.webp',t:'Leverandørløsningen',type:'Presentasjon',p:'De tolv strømmene, tre nivåer, krav, frister og plan. Med kravene til fabrikken (S-55).',r:['leverandor','nobia'],go:'Se presentasjonen'},
 {u:'/leder/',g:'presenter',b:'/img/rom-leder.webp',t:'Daglig leder',type:'Oversikt',p:'Ordrereserve per uke, tilbud ute, treffprosent, margin og det som står i fare, per butikk og selger.',r:['selger','nobia'],go:'Åpne oversikten'},
 {u:'/dokumenter/',g:'dokumenter',b:'/img/rom-dokumenter.webp',t:'Dokumentene',type:'Dokumenter',p:'Tilbud, kjøpsavtale, monteringsrapport og FDV-pakke som A4-sider, slik kunden får dem.',r:['selger','leverandor','nobia'],go:'Se dokumentene'},
 {u:'/veikart/',g:'presenter',b:'/img/rom-veikart.webp',t:'Veikart og status',type:'Oversikt',p:'Hva som er i drift i dag, hva som kommer kvartal for kvartal, og hva vi venter på fra andre.',r:['selger','leverandor','nobia'],go:'Se veikartet'},
 {u:'/sv/',g:'presenter',b:'/img/rom-sv.webp',t:'For Nobia (svenska / English)',type:'Presentasjon',p:'Kort innføring i løsningen på svensk og engelsk, med systemkartet oversatt.',r:['nobia'],go:'Öppna / Open'},
 {u:'/system/',g:'forsta',b:'/img/rom-system.webp',t:'Systemkartet',type:'Oversikt',p:'Hele løsningen på ett kart: hva som går inn og ut av CRM, og hvor langt hver kobling har kommet.',r:['selger','leverandor','nobia'],go:'Åpne kartet'}
];
var G={
 butikken:{t:'Butikken',n:'Hengsel CRM',p:'Min dag, tilbud, bestilling, montasjeplan og kontroll.',lede:'Rommene for selgeren og butikken: fra tilbud og ordre til kontroll og montasje i Hengsel CRM.'},
 montoren:{t:'Montøren',n:'Hengsel Ute',p:'Dagen, tegningen, laser, KS og ferdigmelding. Også for firmaleder.',lede:'Rommene for montøren og montasjefirmaet i Hengsel Ute: dagen, tegningen, KS og ferdigmelding.'},
 kunden:{t:'Kunden',n:'Min side',p:'Tilvalg, signering, levering, montering og reklamasjon. Uten app.',lede:'Det kunden ser og gjør i Min side, på mobil og PC.'},
 leverandoren:{t:'Leverandøren',n:'Koblingene',p:'Ordrebekreftelse på e-post, hvitevarer via Tradeplace, CET.',lede:'Hvordan ordrebekreftelser og bestillinger kommer inn, kobles til ordren og besvares.'}
};
window.ROM={R:R,C:C,G:G,
 /* kort for ett rom (brukes på /rom/ og gruppesidene) */
 card:function(c){return '<a class="card rom" href="'+c.u+'"><div class="bilde enhet-bilde"><img src="'+c.b+'" alt="" loading="lazy"></div><span class="pill info nodot">'+c.type+'</span><span class="ktittel">'+c.t+'</span><p>'+c.p+'</p><span class="go">'+c.go+' ›</span></a>'},
 /* valgt rolle: ?rolle= først, så lagret valg */
 rolle:function(){var cur='alle';try{var q=new URLSearchParams(location.search).get('rolle');var ok=function(k){return R.some(function(x){return x[0]===k})};
   if(q==='sigdal')q='nobia';if(q&&ok(q))cur=q;else{var s=localStorage.getItem('vis-rolle');if(s&&ok(s))cur=s}}catch(e){}return cur},
 lagre:function(r){try{localStorage.setItem('vis-rolle',r)}catch(e){}try{history.replaceState(null,'',r==='alle'?location.pathname:'?rolle='+r)}catch(e){}},
 passer:function(c,r){return r==='alle'||c.r.indexOf(r)>-1}
};
})();
