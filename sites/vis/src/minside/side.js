(function(){
/* Kundens Min side: kundeportalens skjermbilder fra CRM_v4 på mobil (telefon) og PC (Studio Display). Stegene viser skjerm n i begge. */
var $=function(i){return document.getElementById(i)};
var V=Skjermbilder.alle(),velger=Skjermbilder.velger($('view'));
var busy=0,PC=[0,1,0,0,0,0,0],TLF=[0,1]; /* telefonbilde → PC-bilde og tilbake (telefonen har flere bilder enn PC) */
V.tlf.endret=function(n){if(busy)return;busy=1;V.pc.vis(PC[n]);busy=0};V.pc.endret=function(n){if(busy)return;busy=1;V.tlf.vis(TLF[n]);busy=0};
function log(_,t){var d=document.createElement('div'),n=new Date();d.innerHTML='<em>'+('0'+n.getHours()).slice(-2)+':'+('0'+n.getMinutes()).slice(-2)+'</em><span>'+t+'</span>';$('log').prepend(d)}
Skjermbilder.guide({guide:$('guide'),reset:$('reset'),logg:log,
  start:function(){$('log').innerHTML='';log('','Tilbud T-1204 sendt til Min side.')},
  steg:{
    tilvalg:{vis:[V.tlf,2],logg:[['','Kunden la til <b>Belysning under overskap</b>. Tilbudet er oppdatert: 256 700 kr.']]},
    godkjenn:{vis:[V.tlf,3],logg:[['','<b>Tilbud godkjent</b> av kunden. Kontrakt laget med riktige vilkår.'],['','<b>Kontrakt signert.</b> Ordren er Vunnet og står som Klar til bestilling hos Ingrid.'],['','Ingrid bestilte, og Sigdal bekreftet levering <b>uke 47</b>. Leveringsuka er lagt ut på Min side.']]},
    lev:{vis:[V.tlf,4],logg:[['','Kunden bekreftet levering: <b>Noen er hjemme</b>. Instruksen er lagt på ordren til sjåfør og montør.']]},
    feil:{vis:[V.tlf,6],logg:[['','<b>Reklamasjon R-0412</b> fra kunden: Skade på front, med bilde. Sak til Ingrid med frist i morgen.']]}
  }});
if(matchMedia('(min-width:1100px)').matches&&/[?&]pc/.test(location.search))velger.velg('pc');
})();
