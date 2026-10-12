(function(){
var $=function(i){return document.getElementById(i)};
var ST={ok:['ok','I drift'],del:['info','Delvis'],opp:['warn','Under oppsett'],plan:['','Planlagt']};
var LANES=[['na','I drift nå','Brukes hver dag'],['q4','Q4 2026','okt. til des.'],['q1','Q1 2027','jan. til mars'],['q2','Q2 2027','april til juni'],['sen','Senere','Ikke tidfestet']];
var L=[
 {id:'crm',l:'na',st:'ok',t:'Hengsel CRM',g:'Tilbud fra Hovedleverandør-XML, ordre, saker og Min dag på ett sted.',w:'',dep:[],
  hva:'Tilbudet lages rett fra Hovedleverandør-XML uten tasting. Ordre, bestillinger og saker henger sammen, og selgeren ser bare det som avviker i Min dag.',neste:'Flyttes til Cloudflare i drift (prod) i Q4.'},
 {id:'m365',l:'na',st:'ok',t:'Microsoft 365: bestilling@ og varsel@',g:'Én fast inngang for leverandørene og felles varsler ut.',w:'',dep:[],
  hva:'Ordrebekreftelser, fraktvarsler og fakturaer kommer til bestilling@kjokkenstudio-hamar.no. Varsler går ut fra varsel@. Alle logger inn med jobbkontoen.',neste:'Flere leverandører over på bestilling@ med leverandørbrevet.'},
 {id:'min',l:'na',st:'ok',t:'Min side for kunder',g:'Kunden ser tilbud, kontrakt, leveringsuke og FDV selv.',w:'',dep:[],
  hva:'Kunden har alt på ett sted og slipper å ringe for status. Godkjenninger og endringsønsker kommer rett inn i CRM.',neste:'Signering i portalen med Penneo.'},
 {id:'hen',l:'na',st:'ok',t:'Hengsel montørapp',g:'Montøren har jobb, tegning og varer i lomma.',w:'',dep:[],
  hva:'Montasjefirmaet svarer innen 48 timer. KS, bilder, avvik, timer og signatur kommer tilbake til ordren.',neste:'Tegningen som arbeidsflate når DXF er på plass.'},
 {id:'ob',l:'na',st:'ok',t:'Lesing av OB fra fabrikken (PDF)',g:'Ordrebekreftelsen leses automatisk og kobles til ordren.',w:'',dep:['Fabrikken'],
  hva:'PDF-en fra fabrikken leses av CRM, og linjene legges på riktig ordre. Selgeren slipper å lete i innboksen.',neste:'OB som XML fra fabrikken (S-55) gjør lesingen sikrere.'},
 {id:'sign',l:'na',st:'ok',t:'Signering (Penneo)',g:'Kunden signerer kontrakten med BankID via Penneo.',w:'',dep:[],
  hva:'Kontrakten signeres med BankID rett fra CRM, og kontrolleres mot ordren når den er signert.',neste:'Ta i bruk i alle butikker.'},
 {id:'po',l:'na',st:'ok',t:'PowerOffice Go',g:'Kunder, prosjekter og faktura fra CRM.',w:'',dep:[],
  hva:'Prosjekt per kategori og år, med selger og avdeling riktig fra start.',neste:'Flere felt og automatikk er under utvikling.'},
 {id:'lev',l:'na',st:'ok',t:'Andre leverandører (e-post)',g:'Armaturleverandøren, Røros, Corinor, KA og Intra.',w:'',dep:['Leverandører'],
  hva:'Bestilling og OB via e-post er i drift.',neste:'EDI og filformater er under utvikling.'},

 {id:'cf',l:'q4',st:'opp',t:'CRM til Cloudflare i drift',g:'Raskere og sikrere drift med egen produksjon.',w:'Mål: november 2026',dep:[],
  hva:'CRM kjører i et eget produksjonsmiljø med sikker innlogging og backup. Testmiljøet står igjen for nye funksjoner.',neste:'Siste test av innlogging og data, så bytte av adresse.'},
 {id:'lb',l:'q4',st:'del',t:'Leverandørbrev og nivå 1 for alle',g:'Alle leverandører bruker fast referanse og bestilling@.',w:'Mål: desember 2026',dep:['Leverandører'],
  hva:'Med fast referanse på hver OB og faktura kobler CRM dokumentet til riktig ordre uten manuelt arbeid.',neste:'Brevet sendes til leverandørene som gjenstår, og svarene følges opp.'},
 {id:'tpa',l:'q4',st:'opp',t:'Tradeplace-tilgang (hvitevarer)',g:'Pris og lager fra BSH, Electrolux, Miele og Smeg.',w:'Mål: desember 2026',dep:['Tradeplace'],
  hva:'Én kobling gir pris, lager og ordrebekreftelse fra de store hvitevaremerkene.',neste:'Entitet er bestilt. Venter på at Tradeplace åpner tilgangen.'},
 {id:'ok',l:'q4',st:'del',t:'Ordrekontroll: tegning mot OB',g:'Avvik mellom tegning og bekreftelse fanges før produksjon.',w:'Mål: desember 2026',dep:['Fabrikken'],
  hva:'CRM sammenligner elementlista fra tegningen med OB og lager sak på hvert avvik før endringsfristen går ut.',neste:'Utvide kontrollen til tilvalg og benkeplater.'},

 {id:'fk',l:'q1',st:'plan',t:'Fakturakontroll mot OB',g:'Leverandørfakturaen sjekkes mot bekreftet pris og frakt.',w:'Mål: februar 2027',dep:['PowerOffice Go'],
  hva:'Avvik i pris eller frakt som ikke er avtalt, blir sak før fakturaen godkjennes i PowerOffice Go.',neste:'Koble EHF-fakturaer fra PowerOffice Go til ordren i CRM.'},
 {id:'tap',l:'q1',st:'plan',t:'Armaturleverandør: EDI via Pagero',g:'OB og faktura fra armaturleverandøren kommer strukturert.',w:'Mål: februar 2027',dep:['Armaturleverandør','Pagero'],
  hva:'Ingen PDF-lesing for armaturleverandøren. Linjene kommer ferdig strukturert og treffer ordren direkte.',neste:'Avtale oppsett med armaturleverandøren og Pagero.'},
 {id:'ror',l:'q1',st:'plan',t:'Røros Excel-mal (nivå 2)',g:'Bestilling og OB i fast Excel-format.',w:'Mål: mars 2027',dep:['Røros'],
  hva:'Med en fast mal kan CRM fylle ut bestillingen og lese bekreftelsen uten feil.',neste:'Sende malen til Røros for godkjenning.'},
 {id:'sms',l:'q1',st:'opp',t:'SMS-leveringsvarsel',g:'Kunden får dag og tidsvindu for levering på SMS.',w:'Mål: januar 2027',dep:['Unifon'],
  hva:'Kunden får beskjed og påminnelser uten at selgeren ringer.',neste:'Avklare avsender og avtale med Unifon.'},
 {id:'tpb',l:'q1',st:'plan',t:'Tradeplace bestilling',g:'Hvitevarer bestilles elektronisk fra ordren.',w:'Mål: mars 2027',dep:['Tradeplace'],
  hva:'Bestillingen går rett fra CRM, og OB og leveringsvarsel kommer tilbake automatisk.',neste:'Starter når tilgangen fra Q4 er på plass.'},

 {id:'cet',l:'q2',st:'plan',t:'Automatisk eksport fra CET',g:'Tilbudet oppdateres når selgeren lagrer tegningen.',w:'Mål: april 2027',dep:['Configura','Fabrikken'],
  hva:'Selgeren slipper å eksportere Hovedleverandør-XML selv. Kunde og prosjektnummer følger med fra CRM.',neste:'Venter på svar fra Configura og fabrikken (S-55).'},
 {id:'xml',l:'q2',st:'plan',t:'OB som XML og EHF til alle butikker',g:'Sikker lesing av OB og faktura i alle tre butikker.',w:'Mål: juni 2027',dep:['Fabrikken'],
  hva:'OB kommer som XML i stedet for PDF, og alle butikkene får EHF-faktura. Hamar slipper skannet PDF.',neste:'Kravlista S-55 er sendt til fabrikken. Venter på svar.'},
 {id:'dxf',l:'q2',st:'plan',t:'Tegningen som arbeidsflate i Hengsel',g:'Montøren markerer avvik rett på tegningen.',w:'Mål: juni 2027',dep:['Fabrikken','Configura'],
  hva:'Avvik og bilder festes til riktig skap på tegningen, så alle ser hvor problemet er.',neste:'Venter på DXF-eksport av tegningen.'},

 {id:'and',l:'sen',st:'plan',t:'Tilbud til andre butikker',g:'Løsningen kan tas i bruk av flere butikker.',w:'Ikke avklart',dep:['Fabrikken'],
  hva:'Andre butikker kan få samme CRM og koblinger.',neste:'Ikke avklart. Tas opp når driften er stabil.'}
];
var DEP=[
 ['Fabrikken / Hovedleverandør',[
   ['OB som XML','I dag kommer bekreftelsen som PDF. XML gjør lesingen sikker.',['xml','ob']],
   ['EHF til alle butikker','Lillehammer har EHF. Hamar får skannet PDF.',['xml','fk']],
   ['Feilmeldinger til fast adresse','Feilmeldinger ved ordresetting bør gå til bestilling@.',['ok']],
   ['DXF av tegningen','Trengs for tegningen som arbeidsflate i Hengsel.',['dxf']],
   ['Svar på kravlista S-55','Samler punktene over i én henvendelse.',['xml','cet']]]],
 ['Configura',[
   ['Eksport ved lagring','CET lagrer Hovedleverandør-XML automatisk når tegningen lagres.',['cet']],
   ['Kunde og prosjektnummer i fila','Så tilbudet treffer riktig kunde i CRM.',['cet']]]],
 ['Tradeplace',[
   ['Åpne tilgang for entiteten','Bestilt 06.10. Trengs før pris, lager og bestilling.',['tpa','tpb']],
   ['Tilgang per merke','BSH, Electrolux, Miele og Smeg må hver godkjenne butikken.',['tpa']]]],
 ['Leverandører',[
   ['Svar på leverandørbrevet','Fast referanse og bekreftelse til bestilling@.',['lb']],
   ['Armaturleverandøren og Pagero','Oppsett av EDI for OB og faktura.',['tap']],
   ['Røros','Godkjenne Excel-malen for bestilling og OB.',['ror']]]],
 ['Andre',[
   ['Unifon','Avsender og avtale for SMS.',['sms']]]]
];
var cur='alle',q='',open=null;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function cnt(s){return L.filter(function(x){return x.st===s}).length}
$('kpi').innerHTML=['ok','del','opp','plan'].map(function(s){return '<button type="button" data-k="'+s+'"><b>'+cnt(s)+'</b><span class="pill '+ST[s][0]+'">'+ST[s][1]+'</span></button>'}).join('');
[].forEach.call($('kpi').children,function(b){b.onclick=function(){setF(cur===b.dataset.k?'alle':b.dataset.k)}});
$('filt').innerHTML=[['alle','Alle']].concat(['ok','del','opp','plan'].map(function(s){return[s,ST[s][1]]})).map(function(x){return '<button type="button" class="btn" data-k="'+x[0]+'">'+x[1]+'</button>'}).join('');
[].forEach.call($('filt').children,function(b){b.onclick=function(){setF(b.dataset.k)}});
$('q').addEventListener('input',function(){q=this.value.trim().toLowerCase();render()});
function setF(k){cur=k;
 [].forEach.call($('filt').children,function(b){var on=b.dataset.k===k;b.classList.toggle('valgt',on);b.setAttribute('aria-pressed',on)});
 [].forEach.call($('kpi').children,function(b){var on=b.dataset.k===k;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
 render()}
function match(x){if(cur!=='alle'&&x.st!==cur)return false;if(!q)return true;
 return [x.t,x.g,x.hva,x.neste,x.dep.join(' '),ST[x.st][1],x.w].join(' ').toLowerCase().indexOf(q)>-1}
function card(x){var o=open===x.id;
 return '<article class="card'+(o?' open':'')+'" id="c-'+x.id+'"><button type="button" aria-expanded="'+o+'" aria-controls="d-'+x.id+'" data-id="'+x.id+'">'+
 '<span class="top"><b>'+esc(x.t)+'</b><span class="chev" aria-hidden="true">›</span></span>'+
 '<span class="gir">'+esc(x.g)+'</span>'+
 '<span class="meta"><span class="pill '+ST[x.st][0]+'">'+ST[x.st][1]+'</span>'+(x.w?'<span class="when">'+esc(x.w)+'</span>':'')+'</span>'+
 (x.dep.length?'<span class="dep">Avhenger av: <i>'+x.dep.map(esc).join(', ')+'</i></span>':'')+
 '</button><div class="det" id="d-'+x.id+'"><h3 class="eyebrow">Hva det gir</h3><p>'+esc(x.hva)+'</p><h3 class="eyebrow">Neste steg</h3><p>'+esc(x.neste)+'</p><h3 class="eyebrow">Avhenger av</h3><p>'+(x.dep.length?esc(x.dep.join(', ')):'Bare oss selv.')+'</p></div></article>'}
function render(){
 $('tl').innerHTML=LANES.map(function(l){var it=L.filter(function(x){return x.l===l[0]&&match(x)});
  return '<section class="lane'+(l[0]==='na'?' now':'')+'" aria-label="'+l[1]+'"><header><h2>'+l[1]+'</h2><span>'+l[2]+'</span></header>'+
  (it.length?it.map(card).join(''):'<p class="empty">Ingen leveranser her med dette filteret.</p>')+'</section>'}).join('');
 [].forEach.call($('tl').querySelectorAll('.card>button'),function(b){b.onclick=function(){toggle(b.dataset.id)}})}
function toggle(id){open=open===id?null:id;
 [].forEach.call($('tl').querySelectorAll('.card'),function(c){var on=c.id==='c-'+open;c.classList.toggle('open',on);c.firstChild.setAttribute('aria-expanded',on)})}
$('parts').innerHTML=DEP.map(function(p){return '<div class="part tile"><h3>'+p[0]+'</h3><ul>'+p[1].map(function(d){
  return '<li><b>'+esc(d[0])+'</b><span>'+esc(d[1])+'</span><a href="#c-'+d[2][0]+'" data-go="'+d[2][0]+'">Se '+esc(L.filter(function(x){return x.id===d[2][0]})[0].t)+'</a></li>'}).join('')+'</ul></div>'}).join('');
[].forEach.call($('parts').querySelectorAll('a[data-go]'),function(a){a.onclick=function(e){e.preventDefault();var id=a.dataset.go;
 q='';$('q').value='';setF('alle');open=null;toggle(id);var el=$('c-'+id);el.scrollIntoView({behavior:'smooth',block:'center'});el.firstChild.focus({preventScroll:true})}});
setF('alle');
})();
