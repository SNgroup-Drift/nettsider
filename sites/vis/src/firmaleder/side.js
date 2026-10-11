(function(){
/* Firmaleder: skjermbildene fra CRM_v4 (leder-oversikt, innstillinger, moduler; iPad og telefon). Stegene viser skjerm og skriver loggen. */
var $=function(i){return document.getElementById(i)};
var V=Skjermbilder.alle(),velger=Skjermbilder.velger($('enhet'));
function log(w,t){var d=document.createElement('div');d.innerHTML='<b>'+w+'</b> '+t;$('log').prepend(d)}
Skjermbilder.guide({guide:$('guide'),reset:$('reset'),velger:velger,forste:'pc',logg:log,
  start:function(){$('log').innerHTML='';log('Montasjeleder','sendte jobben LI-10087 til Demo Montasje. Svarfrist 48 timer.')},
  steg:{
    se:{enhet:'pc',vis:[V.pc,0]},
    svar:{enhet:'pc',vis:[V.pc,3],logg:[['Hengsel','Demo Montasje <b>aksepterte</b> jobben LI-10087.'],['CRM','Montasjeplanen viser jobben som akseptert. Montør mangler fortsatt.']]},
    mont:{enhet:'pc',vis:[V.pc,2],logg:[['Hengsel','Tomas K. er satt på jobben og har fått varsel.'],['CRM','Ordre 10087 er nå <b>Klar for montør</b>. Selgeren ser hvem som kommer.']]},
    uke:{enhet:'pc',vis:[V.pc,2]}
  }});
})();
