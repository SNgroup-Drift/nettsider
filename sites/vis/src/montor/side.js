(function(){
/* Montørappen: skjermbildene fra Hengsel Ute (telefon og iPad). Stegene viser skjermen og skriver loggen. */
var $=function(i){return document.getElementById(i)};
var V=Skjermbilder.alle(),velger=Skjermbilder.velger($('enhet'));
function log(who,txt,t){var d=document.createElement('div');d.innerHTML='<time>'+t+'</time><span><b>'+who+'</b> '+txt+'</span>';$('log').prepend(d)}
Skjermbilder.guide({guide:$('guide'),reset:$('reset'),velger:velger,forste:'tlf',logg:log,
  start:function(){$('log').innerHTML='';log('Montasjeleder','satte <em>Demo Montasje</em> på jobben LI-10087. Montøren ble varslet i Hengsel.','07:00')},
  steg:{
    open:{enhet:'tlf',vis:[V.tlf,1],logg:[['Hengsel','Montøren åpnet jobben. Status: <em>Pågår</em>.','07:45']]},
    ks:{enhet:'tlf',vis:[V.tlf,2],logg:[['Hengsel','KS Kjøkken lagret: 6 av 6 OK.','09:10']]},
    avvik:{enhet:'tlf',vis:[V.tlf,4],logg:[['Hengsel','Avvik meldt: <em>Skade</em> på Høyskap H3, med bilde.','10:25'],['CRM','Sak opprettet på ordren. Selgeren ser den i Min dag, uten å måtte gjøre noe.','10:25'],['CRM','Reklamasjon sendt Sigdal med referanse LI-10087-1 og bilde.','10:26']]},
    ferdig:{enhet:'tlf',vis:[V.tlf,7],logg:[['Hengsel','Ferdig montert. 7,5 timer, 2 bilder, signert av kunden.','15:20'],['CRM','Selgeren fikk beskjed. Leveringspakken «Ditt nye kjøkken» med FDV er klar til sending.','15:20'],['CRM','Montørfaktura kan kontrolleres mot avtalt sum 18 400 kr.','15:21']]}
  }});
})();
