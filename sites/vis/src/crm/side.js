(function(){
/* Prøv CRM: skjermbildene fra CRM_v4 i Studio Display, iPad og telefon. «Prøv dette» viser skjermen for steget. */
var V=Skjermbilder.alle(),velger=Skjermbilder.velger(document.getElementById('enhet'));
Skjermbilder.guide({guide:document.getElementById('guide'),velger:velger,forste:'pc',steg:{
  avvik:{enhet:'pc',vis:[V.pc,0]},
  faktura:{enhet:'pc',vis:[V.pc,1]},
  cet:{enhet:'pc',vis:[V.pc,3]},
  plan:{enhet:'pc',vis:[V.pc,4]}
}});
})();
