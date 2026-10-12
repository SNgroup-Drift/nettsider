(function(){
var M=[
{t:'Kom i gang',i:'Min dag er startsiden din. Der står alt du skal følge opp i dag.',b:
'<ol class="st"><li>Logg inn med jobbkontoen (Microsoft), eller e-post og passordet fra invitasjonen. Appen husker deg til du logger ut.</li><li>Menyen til venstre: Oversikt, Salg, Leveranse, Økonomi, Rapporter og Administrasjon. Det meste du gjør ligger under <b>Salg</b>.</li><li><b>Min dag</b> viser oppfølging, tilbud og ordre per fase, og kalenderen med frister, leveringer og monteringer. Åpne saker står øverst.</li><li><b>Søk</b> øverst til høyre, eller <kbd>Cmd+K</kbd> / <kbd>Ctrl+K</kbd>: kunder, tilbud og ordre på navn, telefon, tegningsnummer og ordrenummer.</li></ol>'+
'<div class="tip"><b>På telefonen</b>Samme innlogging i nettleseren. Legg CRM-et på hjemskjermen.</div>',
q:['Hvor står feilmeldinger fra fabrikken og avvik i bekreftelsen?',['Øverst i Min dag','Bare i e-posten','Under Rapporter'],0]},
{t:'Kunder',i:'Alt starter med kunden. Søk først, så du ikke lager en kunde som finnes.',b:
'<ul class="pt"><li>Appen varsler hvis navn, telefon eller e-post ligner på en kunde som finnes.</li><li><b>Kundetype</b> styrer vilkårene: Privat får forbrukervilkår. Trade og Entreprenør får proffvilkår og kan ha prosjekter.</li><li><b>Eier</b> er selgeren. Butikken følger kunden, og selskapet (Hamar, Lillehammer eller Gjøvik Innredning AS) følger ordren.</li><li>Kundekortet har fanene Oversikt, Tilbud, Ordre, Anbud, Montering, Fakturaer og Filer.</li></ul>',
q:['En entreprenør skal ha tilbud. Hvilke vilkår følger med?',['Forbrukervilkår','Proffvilkår','Ingen vilkår'],1]},
{t:'Tilbud fra CET',i:'Tegningen blir et tilbud uten at du taster linjene.',b:
'<ol class="st"><li>Lagre tegningen i CET under riktig kunde og prosjekt, med prosjektnummer utfylt.</li><li>Eksporter <b>Hovedleverandør-XML</b>, ikke den generelle ordreeksporten. Den mangler varelinjene.</li><li>I appen: <span class="ui">Tilbud → Importer</span> og velg fila. Appen finner kunden eller foreslår en ny.</li><li>Sjekk kategorien, og koble monteringskalkylen hvis det er montering.</li><li>Sjekk at summen stemmer med CET. Linjer uten pris samles i «Ikke spesifisert i XML», så totalen fra CET er fasit.</li></ol>'+
'<div class="tip"><b>Når tegningen endres</b>Bruk <span class="ui">Handlinger → Oppdater fra CET (XML)</span>. Da beholder du historikk, kommunikasjon og filer.</div>',
q:['Hvilken eksport fra CET skal du bruke?',['Den generelle ordreeksporten','Hovedleverandør-XML','PDF av tegningen'],1]},
{t:'Tilpass og send',i:'Gjør tilbudet ferdig, lag dokumentet og send det selv.',b:
'<ul class="pt"><li><span class="ui">Rediger</span> åpner montering, innbæring, frakt, tillegg, avrunding og linjene.</li><li>Hver linje er <b>I tilbudet</b>, <b>Opsjon</b> eller <b>Utelatt</b>. En opsjon kan komme «i stedet for» en annen linje, og da ser kunden merprisen.</li><li>Ved større revisjon: <span class="ui">Handlinger → Lag ny versjon</span>.</li><li><span class="ui">Tilbudsdokument</span> går gjennom forutsetninger, design, produkter og vedlegg. Riktige vilkår legges ved automatisk.</li></ul>'+
'<div class="warnbox"><b>Appen sender ikke e-post til kunden</b>Send dokumentet selv, og trykk <span class="ui">Marker som sendt</span>. Da kommer tilbudet med i oppfølgingen.</div>',
q:['Du har sendt tilbudet på e-post. Hva gjør du i appen?',['Ingenting','Trykker Marker som sendt','Trykker Vunnet'],1]},
{t:'Fra vunnet til bestilt',i:'Når kunden sier ja, blir tilbudet en ordre.',b:
'<ol class="st"><li>Trykk <span class="ui">Vunnet</span>. Ordren får status Klar til bestilling.</li><li>Når kontrakten er signert: <span class="ui">Kontroller kontrakt</span> og velg PDF-en. Appen sjekker prosjektnummer, sum, leveringsdato, kunde og forskudd.</li><li>Har kunden innkjøpsordre eller P.nr., fyll det inn på ordren.</li><li>Legg ordren inn i CET og send den til fabrikken.</li><li>Trykk <span class="ui">Bestilt</span> og fyll inn fabrikkens ordrenummer. Ordren går til Venter OB.</li></ol>'+
'<div class="tip"><b>Trykket feil?</b><span class="ui">Handlinger → Angre bestilling</span>.</div>',
q:['Hva sjekker «Kontroller kontrakt»?',['Bare signaturen','Prosjektnummer, sum, leveringsdato, kunde og forskudd','Om kunden har betalt'],1]},
{t:'Feilmeldinger fra fabrikken',i:'1–2 minutter etter innsending kommer det e-post fra fabrikken hvis noe er feil. Da er ordren ikke lagt hos fabrikken.',b:
'<div class="tbl"><table><tr><th>Feilmelding</th><th>Gjør dette</th></tr>'+
'<tr><td>Rev. X er allerede godkjent</td><td>Ingenting, hvis du ikke skulle endre. Skulle du endre: ny revisjon.</td></tr>'+
'<tr><td>Pågående rev. X er ikke ferdig</td><td>Åpne revisjon X, huk av Feilretting, rett og send.</td></tr>'+
'<tr><td>Mål utenfor tillatte mål</td><td>Rett målet i CET og send med Feilretting.</td></tr>'+
'<tr><td>Ingen ledig produksjonskapasitet</td><td>Velg ny leveringsdato og send på nytt.</td></tr>'+
'<tr><td>Lengre leveringstid enn bekreftet</td><td>Endre «Lovet levert dato» og send på nytt.</td></tr>'+
'<tr><td>Manuelt stoppet ordrerad</td><td>Kontakt Kundeservice.</td></tr></table></div>'+
'<div class="warnbox"><b>Tre regler som sparer mest tid</b>1. Er ordren godkjent: aldri Feilretting eller Gjenopprett status. Endringer er alltid ny revisjon.<br>2. Har en revisjon feilet: rett den før du lager en ny.<br>3. Sendt Feilretting på en godkjent revisjon: flytt _rev til revision_backups, kopier tegningen tilbake og lag ny revisjon.</div>',
q:['Ordren er godkjent, og kunden vil endre en front. Hva gjør du?',['Feilretting på den godkjente revisjonen','Lager en ny revisjon','Gjenoppretter status'],1]},
{t:'Bekreftelse og levering',i:'Bekreftelsen setter datoene og fristene på ordren.',b:
'<ul class="pt"><li><b>Fabrikken:</b> <span class="ui">Last inn ordrebekreftelse</span>. Appen leser ordrenummer, leveringsdato, endringsfrist (laveste ENDFØR) og innpris.</li><li><b>Ny dato:</b> appen varsler, og du får en sak om å sjekke montering og gi kunden beskjed.</li><li><b>Andre leverandører:</b> åpne bestillingen under Bestillinger og trykk <span class="ui">Last opp ordrebekreftelse</span>. Du ser alt før det lagres.</li><li><b>Før levering:</b> instruksen for innbæring ligger øverst på ordren. Del den med kunden i god tid.</li><li><b>Ved levering:</b> <span class="ui">Handlinger → Lag FDV-dokumentasjon</span>.</li></ul>',
q:['Hvilken endringsfrist bruker appen fra fabrikkens bekreftelse?',['Den høyeste ENDFØR','Den laveste ENDFØR','Leveringsdatoen'],1]},
{t:'Saker og ordrekontroll',i:'Saker er alt som må følges opp. Ordrekontrollen sjekker bekreftelsen mot tegningen.',b:
'<ul class="pt"><li>En sak har frist og «Gjør dette». Du finner sakene på ordren, i oppfølgingen og under <span class="ui">Leveranse → Saker</span>.</li></ul>'+
'<ol class="st"><li>Eksporter Hovedleverandør-XML fra tegningen du sendte, helst samme dag.</li><li>Åpne fabrikkbestillingen og trykk <span class="ui">Kontroller bekreftelsen</span>.</li><li>Velg XML-fila og bekreftelsen (PDF), og trykk <span class="ui">Kontroller</span>.</li><li>Se avvikene. <span class="ui">Lagre og lag sak</span> gir frist én virkedag før laveste ENDFØR.</li></ol>'+
'<div class="tip"><b>Står det «Sjekk tegningsnummer»?</b>Da er XML-en trolig fra en annen kopi av tegningen enn den som ble sendt.</div>',
q:['Hva er fristen på en sak fra ordrekontrollen?',['Leveringsdagen','Én virkedag før laveste ENDFØR','Én uke etter bestilling'],1]},
{t:'Frister og montasjeplan',i:'Din frist er én virkedag før leverandørens, så du rekker å få svar fra kunden.',b:
'<ul class="pt"><li>Alle frister samles under <b>Frister</b>, i <b>Min dag</b> og i kalenderen.</li><li>Morgenvarselet gir én e-post hver virkedag med det som må følges opp.</li><li><span class="ui">Leveranse → Montasjeplan</span> viser ordrene uke for uke. Står alt på plass, er ordren <b>Klar for montør</b>.</li><li>Montøren jobber i Hengsel: KS, bilder, avvik og ferdigmelding med kundens signatur. Du får beskjed når jobben er ferdig.</li></ul>'+
'<div class="tip"><b>Se det i praksis</b><a href="/montor/">Prøv montørappen</a> eller <a href="/reise/">se Ordrens reise</a>.</div>',
q:['Leverandørens siste rettedato er fredag. Når er din frist?',['Fredag','Torsdag','Mandagen etter'],1]},
{t:'Gode vaner',i:'Små vaner som gjør at kollegaen din ser det samme som deg.',b:
'<ul class="pt"><li>Logg samtaler, SMS og møter på tilbudet, og dra inn e-post fra Outlook (.msg).</li><li>Bruk samme referanse i alle bestillinger: kundens navn og prosjektnummer.</li><li>Hold oppfølgingen ren: lukk det som er gjort, og sett ny dato på det som ikke er det.</li><li>Står noe fast, spør butikkleder eller daglig leder. Finner du en feil, send et skjermbilde.</li></ul>',
q:['Hvorfor bruke samme referanse i alle bestillinger?',['Det ser ryddig ut','Bekreftelsene finner veien tilbake til riktig ordre','Leverandøren krever det'],1]}
];
var K='vis-opplaering-v1',done={},cur=0;
try{done=JSON.parse(localStorage.getItem(K)||'{}')||{}}catch(e){done={}}
function save(){try{localStorage.setItem(K,JSON.stringify(done))}catch(e){}}
var nav=document.getElementById('nav'),main=document.getElementById('main');
function navR(){nav.innerHTML='';M.forEach(function(m,i){var b=document.createElement('button');b.type='button';b.className=(i===cur?'on ':'')+(done[i]?'d':'');b.innerHTML='<span class="c">'+(done[i]?'✓':i+1)+'</span><span>'+m.t+'</span>';if(i===cur)b.setAttribute('aria-current','step');b.onclick=function(){show(i)};nav.appendChild(b)});
  var n=Object.keys(done).filter(function(k){return done[k]}).length;document.getElementById('meter').style.width=(n/M.length*100)+'%';document.getElementById('ptxt').textContent=n+' av '+M.length+' fullført'}
function show(i){cur=i;var m=M[i];
  main.innerHTML='<article class="mod"><span class="eyebrow">Del '+(i+1)+' av '+M.length+'</span><h2>'+m.t+'</h2><p class="intro">'+m.i+'</p>'+m.b+
  '<div class="quiz"><span class="q">'+m.q[0]+'</span>'+m.q[1].map(function(a,j){return '<button type="button" class="btn" data-j="'+j+'">'+a+'</button>'}).join('')+'<span class="fb" aria-live="polite"></span></div>'+
  '<div class="foot"><button type="button" class="btn" id="pv"'+(i===0?' disabled':'')+'>‹ Forrige</button><span class="sp"></span><button type="button" class="btn '+(done[i]?'':'primary')+'" id="ok">'+(done[i]?'Fullført ✓':'Jeg kan dette')+'</button><button type="button" class="btn" id="nx"'+(i===M.length-1?' disabled':'')+'>Neste ›</button></div></article>';
  var fb=main.querySelector('.fb');
  [].forEach.call(main.querySelectorAll('.quiz button'),function(b){b.onclick=function(){var j=+b.dataset.j,r=j===m.q[2];
    [].forEach.call(main.querySelectorAll('.quiz button'),function(x){x.classList.remove('r','f')});b.classList.add(r?'r':'f');
    fb.textContent=r?'Riktig.':'Ikke helt. Les gjennom delen igjen og prøv på nytt.'}});
  document.getElementById('pv').onclick=function(){show(i-1)};document.getElementById('nx').onclick=function(){show(i+1)};
  document.getElementById('ok').onclick=function(){done[i]=!done[i];save();if(done[i]&&i<M.length-1)show(i+1);else show(i)};
  navR();try{history.replaceState(null,'','#'+(i+1))}catch(e){}
  if(window.innerWidth<860)main.scrollIntoView({behavior:'smooth',block:'start'})}
var h=parseInt((location.hash||'').slice(1),10);show(h>0&&h<=M.length?h-1:0);
addEventListener('hashchange',function(){var k=parseInt(location.hash.slice(1),10);if(k>0&&k<=M.length&&k-1!==cur)show(k-1)});
window.scrollTo(0,0);
})();
