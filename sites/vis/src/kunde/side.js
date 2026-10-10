(function(){
/* Skjermbilde per steg (kundeportalen): 1–4 kundeportal-k03 → k04 → k06 → k08 (v3), 5 levering, 6 montering, 7–8 FDV og «Meld en feil» (portal-tlf-*, til v4) */
var BILDE=[0,1,2,3,4,5,6,6],TLF=Skjermbilder.lag(document.getElementById('tlf'));
var S=[
{t:'Tilbudet',w:'Tilbud',clk:'09:12',n:['E-post','Tilbudet ditt fra Kjøkkenstudio Hamar er klart'],h:'Tilbudet kommer i Min side',p:'Hanne får tilbudet med tegninger, design og pris. Hun kan se opsjonene, sammenligne og stille spørsmål der.',bak:['Tilbudet er laget fra CET uten taste-arbeid','Pris og leveringstid kommer fra leverandørene']},
{t:'Signering',w:'Kontrakt',clk:'19:40',n:['Min side','Kontrakten er klar til signering'],h:'Signerer med BankID via Penneo',p:'Hanne leser kontrakten og signerer på mobilen. Hun får bekreftelse med en gang.',bak:['Kontrakten kontrolleres mot ordren','Montasjen settes til uke 46','Leveringsukene regnes bakover']},
{t:'Bekreftet',w:'Status',clk:'10:05',n:['SMS','Alt er bekreftet av leverandørene. Montasje uke 46.'],h:'Alt er bekreftet',p:'Når leverandørene har bekreftet, ser Hanne leveringsuke og montasje i Min side. Et avvik hos én leverandør løser selgeren uten at hun merker det.',bak:['Fem bestillinger gikk ut samtidig','Fire bekreftelser stemte','Ett avvik ble rettet av selgeren']},
{t:'Endring',w:'Endring',clk:'21:15',n:['Min side','Endringen din er bekreftet'],h:'Bytter en front',p:'Hanne vil ha tett front i stedet for glass. Hun sender ønsket fra Min side før siste endringsdag og ser ny pris før hun godkjenner.',bak:['Endringsordren går med samme referanse','Endrings-OB kontrolleres automatisk']},
{t:'Levering',w:'Levering',clk:'15:30',n:['SMS','Levering tirsdag 08–12. Følg sendingen her.'],h:'Vet når varene kommer',p:'To dager før levering kommer SMS med dag, tidsvindu og sporing. Hanne kan legge til beskjed om innkjøring eller nøkkel.',bak:['Leveringsvarsel fra transportøren','SMS sendes via Unifon','Digitalt leveringsbevis til ordren']},
{t:'Montasje',w:'Montasje',clk:'15:20',n:['SMS','Montøren er ferdig. Godkjenn jobben i Min side.'],h:'Ferdig montert',p:'Montøren sier fra når han kommer, og Hanne signerer på iPaden når kjøkkenet er ferdig. Et skadet sidepanel er allerede meldt til leverandøren.',bak:['KS Kjøkken med bilder i Hengsel','Avvik sendt rett til Sigdal med bilde','Erstatning uke 47']},
{t:'FDV',w:'Ditt kjøkken',clk:'09:00',n:['E-post','Ditt nye kjøkken: alt om stell og garanti'],h:'Alt om kjøkkenet på ett sted',p:'Hanne får FDV-pakken med produkter, stell, garanti og sluttfaktura. Den ligger i Min side for alltid.',bak:['FDV laget fra produktdataene','Sluttfaktura fra PowerOffice']},
{t:'Reklamasjon',w:'Hjelp',clk:'11:42',n:['Min side','Vi har mottatt saken din'],h:'Hvis noe skjer',p:'En skuff har slått seg. Hanne melder det med bilde i Min side og ser status hele veien, uten å lete etter telefonnummer.',bak:['Saken kobles til riktig ordre og artikkel','Leverandøren får den med bilde']}
];
var cur=0,T=null,$=function(i){return document.getElementById(i)},stp=$('steps');
S.forEach(function(s,i){var b=document.createElement('button');b.type='button';b.innerHTML='<i></i><span>'+(i+1)+' · '+s.t+'</span>';b.onclick=function(){stop();go(i)};stp.appendChild(b)});
function go(i){cur=i;var s=S[i];TLF.vis(BILDE[i]);$('k').textContent='Steg '+(i+1)+' av '+S.length;$('h').textContent=s.h;$('p').textContent=s.p;$('bk').innerHTML=s.bak.map(function(x){return '<li>'+x+'</li>'}).join('');
 var n=$('nt');n.classList.remove('show');$('ntk').textContent=s.n[0];$('ntt').textContent=s.n[1];setTimeout(function(){n.classList.add('show')},250);setTimeout(function(){n.classList.remove('show')},3400);
 [].forEach.call(stp.children,function(b,j){b.classList.toggle('on',j===i);b.classList.toggle('p',j<i)});var cb=stp.children[i];stp.scrollLeft=cb.offsetLeft-(stp.clientWidth-cb.offsetWidth)/2;$('pv').disabled=i===0;$('nx').disabled=i===S.length-1}
function stop(){clearInterval(T);T=null;$('pl').textContent='Spill av'}
$('pv').onclick=function(){stop();go(cur-1)};$('nx').onclick=function(){stop();go(cur+1)};
$('pl').onclick=function(){if(T){stop();return}$('pl').textContent='Pause';if(cur===S.length-1)go(0);T=setInterval(function(){if(cur>=S.length-1){stop();return}go(cur+1)},5200)};
document.addEventListener('keydown',function(e){if(e.key==='ArrowRight'&&cur<S.length-1){stop();go(cur+1)}if(e.key==='ArrowLeft'&&cur>0){stop();go(cur-1)}});
go(0);
})();
