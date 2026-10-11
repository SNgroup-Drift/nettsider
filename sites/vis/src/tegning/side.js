(function(){
/* Tegningen: skjermbildene fra Hengsel Ute (laser på telefon, bildeverktøy på iPad) og CRM_v4 (mål og skisser på PC). */
var $=function(i){return document.getElementById(i)};
var V=Skjermbilder.alle(),velger=Skjermbilder.velger($('enhet'));
function log(who,txt,t){var d=document.createElement('div');d.innerHTML='<time>'+t+'</time><span><b>'+who+'</b> '+txt+'</span>';$('log').prepend(d)}
Skjermbilder.guide({guide:$('guide'),reset:$('reset'),velger:velger,forste:'tlf',logg:log,
  start:function(){$('log').innerHTML='';
    log('CRM','Tegningen fra CET (rev. 2) er koblet til jobben LI-10087. Skapnumrene følger ordrelinjene.','07:30');
    log('Hengsel','Piotr startet montering. H1, H2 og B1 til B4 meldt ferdig.','08:55');
    log('Hengsel','Avvik på <em>O2</em>: skade, riper i fronten. Bilde lagt ved.','09:05');
    log('CRM','Sak opprettet på LI-10087. Ingrid ser den i Min dag.','09:05')},
  steg:{
    sel:{enhet:'tlf',vis:[V.tlf,0]},
    done:{enhet:'tlf',vis:[V.tlf,0],logg:[['Hengsel','Piotr meldte <em>B5</em> ferdig montert. 7 av 12.','09:41']]},
    av:{enhet:'ipad',vis:[V.ipad,0],logg:[['Hengsel','Avvik på <em>O3</em>: Skade, med bilde. Plassert i tegningen.','09:48'],['CRM','Sak opprettet på LI-10087 med skapnummer O3. Ingrid ser den i Min dag.','09:48'],['CRM','Reklamasjon klargjort til fabrikken med varelinjene til O3.','09:49']]},
    view:{enhet:'pc',vis:[V.pc,0]},
    send:{enhet:'tlf',vis:[V.tlf,0],logg:[['Hengsel','Piotr sendte tegningen med status til selger: 7 ferdig, 2 avvik.','10:05'],['CRM','Ingrid fikk varsel. Avvik ligger på ordren med skapnummer: <em>O2</em>, <em>O3</em>.','10:05'],['CRM','Kunden ser fremdriften på Min side.','10:06']]}
  }});
})();
