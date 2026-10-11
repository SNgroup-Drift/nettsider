(function(){
var $=function(i){return document.getElementById(i)};
var WEEKS=[46,47,48,49],CAP=2;
var TEAMS=[{id:'piotr',firm:'Mjøs Montasje',name:'Piotr',stone:true},{id:'arne',firm:'Mjøs Montasje',name:'Arne',stone:true},{id:'lars',firm:'Hedmark Kjøkkenmontering',name:'Lars',stone:false}];
var TM={};TEAMS.forEach(function(t){TM[t.id]=t});
function seed(){return [
 {id:'0791',k:'Berg',s:'Hamar',sig:46,o:[['Benkeplate',48]],t:'piotr',w:47,st:'ny'},
 {id:'0803',k:'Nilsen',s:'Lillehammer',sig:46,o:[['Steinbenkeplate',47]],stone:1,t:'lars',w:48,st:'ny'},
 {id:'0812',k:'Lund',s:'Hamar',sig:47,o:[],t:'piotr',w:47,st:'sendt'},
 {id:'0776',k:'Holm',s:'Gjøvik',sig:45,o:[],t:'arne',w:47,st:'akseptert'},
 {id:'0784',k:'Dahl',s:'Gjøvik',sig:46,o:[['Hvitevarer BSH',46]],t:'arne',w:47,st:'sendt'},
 {id:'0798',k:'Strand',s:'Hamar',sig:46,o:[],t:'arne',w:47,st:'sendt'},
 {id:'0769',k:'Bakke',s:'Lillehammer',sig:45,o:[['Benkeplate',46]],t:'lars',w:48,st:'akseptert'},
 {id:'0821',k:'Haugen',s:'Hamar',sig:48,o:[['Benkeplate',49]],t:null,w:null,st:'ny'},
 {id:'0817',k:'Sætre',s:'Lillehammer',sig:47,o:[['Armatur',48]],t:null,w:null,st:'ny'},
 {id:'0826',k:'Moen',s:'Gjøvik',sig:48,o:[],t:null,w:null,st:'ny'}]}
var O,FERIE,SEL,STEPS,REPLAN;
function byId(id){return O.filter(function(o){return o.id===id})[0]}
function latest(o){return o.o.reduce(function(m,x){return Math.max(m,x[1])},o.sig)}
function latestName(o){var m=latest(o),n=o.o.filter(function(x){return x[1]===m});return n.length?n[0][0].toLowerCase():'kjøkkenet fra fabrikken'}
function inCell(t,w){return O.filter(function(o){return o.t===t&&o.w===w})}
function isFerie(t,w){return FERIE[t+'|'+w]}
/* Regler: feil stopper forespørselen, advarsel gjør ikke */
function issues(o){var r=[];if(!o.t)return r;var tm=TM[o.t],L=latest(o);
 if(isFerie(o.t,o.w))r.push(['f',tm.name+' har ferie uke '+o.w,'Feil: ferie']);
 if(o.w<L)r.push(['f','Montering før '+latestName(o)+' kommer (uke '+L+')','Feil: før levering']);
 else if(o.w===L)r.push(['a','Stramt: levering og montering samme uke','Stramt: samme uke']);
 if(o.stone&&!tm.stone)r.push(['f',tm.name+' mangler sertifisering for stein','Feil: steinsertifikat']);
 var n=inCell(o.t,o.w).length;if(n>CAP)r.push(['a','Over kapasitet: '+n+' av '+CAP+' jobber','Over kapasitet']);
 return r}
function hasErr(o){return issues(o).some(function(x){return x[0]==='f'})}
function now(){var n=new Date();return ('0'+n.getHours()).slice(-2)+':'+('0'+n.getMinutes()).slice(-2)}
function log(t){var d=document.createElement('div');d.innerHTML='<em>'+now()+'</em>'+t;$('log').prepend(d)}
function where(t,w){return TM[t].name+' uke '+w}
function step(k){STEPS[k]=1;[].forEach.call($('guide').children,function(li){li.classList.toggle('d',!!STEPS[li.dataset.k])})}
function pillOf(o){
 if(o.st==='avvist')return '<span class="pill warn">'+o.why+'</span>';
 if(!o.t)return '<span class="pill">Ny</span>';
 if(o.st==='akseptert')return '<span class="pill ok">Akseptert</span>';
 if(o.st==='sendt')return '<span class="pill info">Sendt</span>';
 return '<span class="pill">Ikke sendt</span>'}
function cardHtml(o){var is=issues(o),f=is.some(function(x){return x[0]==='f'}),a=is.length>0;
 var cls=f?'feil':a?'adv':o.st==='akseptert'?'ok':'';
 var lv='Fabrikken u'+o.sig+o.o.map(function(x){return ' · '+x[0]+' u'+x[1]}).join('');
 return '<div role="button" tabindex="0" class="job '+cls+'" draggable="true" data-id="'+o.id+'" aria-pressed="'+(SEL===o.id)+'"><span class="grip" aria-hidden="true"></span>'+
  '<span class="n"><b>'+o.k+'</b><span>'+o.s+' · '+o.id+'</span></span><span class="lv">'+lv+'</span>'+pillOf(o)+
  is.map(function(x){return '<span class="iss '+x[0]+'" title="'+x[1].replace(/"/g,'&quot;')+'">'+(x[2]||((x[0]==='f'?'Feil: ':'')+x[1]))+'</span>'}).join('')+'</div>'}
function hereBtn(key,label){var o=SEL&&byId(SEL);if(!o)return '';var cur=o.t?o.t+'|'+o.w:'none';if(cur===key)return '';
 return '<button type="button" class="here" data-to="'+key+'" aria-label="Flytt '+o.k+' hit: '+label+'">Flytt hit</button>'}
function render(){
 var ae=document.activeElement,fk=ae&&(ae.dataset&&(ae.dataset.id?'[data-id="'+ae.dataset.id+'"]':ae.dataset.to?'[data-to="'+ae.dataset.to+'"]':null));
 var h='<div class="grid"><div class="hd">Ikke planlagt <b>'+O.filter(function(o){return !o.t}).length+'</b></div>'+WEEKS.map(function(w){return '<div class="hd w">Uke <b>'+w+'</b></div>'}).join('');
 h+='<div class="drop un" data-drop="none">'+O.filter(function(o){return !o.t}).map(cardHtml).join('')+hereBtn('none','Ikke planlagt')+'</div>';
 TEAMS.forEach(function(t,ri){
  h+='<div class="tl" style="grid-row:'+(2+ri*2)+'"><span><b>'+t.firm+': '+t.name+'</b><em>'+(t.stone?'Sertifisert for stein':'Ikke sertifisert for stein')+'</em></span></div>';
  WEEKS.forEach(function(w,ci){var list=inCell(t.id,w),fe=isFerie(t.id,w);
   h+='<div class="drop'+(list.length>CAP?' full':'')+(fe?' ferie':'')+'" data-drop="'+t.id+'|'+w+'" style="grid-row:'+(3+ri*2)+';grid-column:'+(2+ci)+'" aria-label="'+t.name+', uke '+w+'">'+
    '<div class="ch"><span>'+(fe?'Ferie':'')+'</span><span class="cap'+(list.length>CAP?' x':'')+'">'+list.length+' / '+CAP+'</span></div>'+
    list.map(cardHtml).join('')+hereBtn(t.id+'|'+w,t.name+' uke '+w)+'</div>'})});
 h+='</div>';$('board').innerHTML=h;
 kpi();conflicts();
 var o=SEL&&byId(SEL);document.body.classList.toggle('sel',!!o);$('seltxt').textContent=o?'Valgt: '+o.k+'. Trykk «Flytt hit» der jobben skal.':'';
 if(fk){var el=$('board').querySelector(fk)||document.querySelector(fk);if(el)el.focus({preventScroll:true})}
 STEPS.berg||(function(){var b=byId('0791');if(b.t&&!hasErr(b))step('berg')})();
 STEPS.nilsen||(function(){var b=byId('0803');if(b.t&&!hasErr(b))step('nilsen')})();
 if(!STEPS.kap&&!TEAMS.some(function(t){return WEEKS.some(function(w){return inCell(t.id,w).length>CAP})}))step('kap');
}
function kpi(){var plan=O.filter(function(o){return o.t}).length,un=O.length-plan,f=0,a=0;
 O.forEach(function(o){issues(o).forEach(function(x){x[0]==='f'?f++:a++})});
 var occ=WEEKS.map(function(w){var cap=TEAMS.filter(function(t){return !isFerie(t.id,w)}).length*CAP;var n=O.filter(function(o){return o.w===w}).length;return {w:w,n:n,cap:cap,p:cap?Math.round(n/cap*100):(n?999:0)}});
 var top=Math.max(125,Math.max.apply(null,occ.map(function(x){return Math.min(x.p,200)})));
 $('kpi').innerHTML='<div class="card"><span>Planlagt</span><b>'+plan+'</b><em>jobber på tavla</em></div><div class="card"><span>Uten plan</span><b>'+un+'</b><em>i «Ikke planlagt»</em></div><div class="card"><span>Konflikter</span><b>'+(f+a)+'</b><em>'+f+' feil · '+a+' advarsler</em></div>'+
  '<div class="card wide"><span>Belegg per uke</span><div class="occ">'+occ.map(function(x){var hgt=Math.min(x.p,200)/top*100;return '<div title="Uke '+x.w+': '+x.n+' av '+x.cap+' jobber"><strong>'+x.p+' %</strong><span class="bar"><i class="'+(x.p>100?'over':'')+'" style="height:'+hgt+'%"></i><u style="top:'+(100-100/top*100)+'%"></u></span>Uke '+x.w+'</div>'}).join('')+'</div></div>';
}
function conflicts(){var L=[];
 O.forEach(function(o){if(!o.t)return;issues(o).forEach(function(x){if(x[1].indexOf('Over kapasitet')===0)return;L.push([x[0],o,x[1]])})});
 TEAMS.forEach(function(t){WEEKS.forEach(function(w){var l=inCell(t.id,w);if(l.length>CAP)L.push(['a',l[l.length-1],t.name+' uke '+w+' har '+l.length+' jobber, kapasitet '+CAP,1])})});
 L.sort(function(a,b){return a[0]===b[0]?0:a[0]==='f'?-1:1});
 $('cf').innerHTML=L.length?L.map(function(x){return '<li class="'+x[0]+'"><b>'+(x[3]?'Over kapasitet':x[1].k+' · '+where(x[1].t,x[1].w))+'</b><span>'+(x[0]==='f'?'Feil: ':'Advarsel: ')+x[2]+'</span><button class="btn" type="button" data-show="'+x[1].id+'">Vis</button></li>'}).join(''):'<li class="none">Ingen konflikter. Planen kan sendes.</li>';
 $('cf').querySelectorAll('[data-show]').forEach(function(b){b.onclick=function(){SEL=b.dataset.show;render();var c=$('board').querySelector('[data-id="'+SEL+'"]');if(c){c.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});c.focus({preventScroll:true})}}})}
function move(id,key){var o=byId(id);if(!o)return;var cur=o.t?o.t+'|'+o.w:'none';SEL=null;if(cur===key){render();return}
 var wasSent=o.st==='sendt'||o.st==='akseptert',from=o.t?where(o.t,o.w):null,wasUn=!o.t,wasAvv=o.st==='avvist';
 if(key==='none'){o.t=null;o.w=null;o.st='ny';log('<b>'+o.k+'</b> tatt ut av planen.'+(wasSent?' Forespørselen til '+from+' er trukket tilbake.':''));render();return}
 var p=key.split('|');o.t=p[0];o.w=+p[1];
 var is=issues(o),err=is.filter(function(x){return x[0]==='f'});
 if(err.length){o.st='ny';log('<b>'+o.k+'</b> satt på '+where(o.t,o.w)+', men ikke sendt: '+err[0][1].toLowerCase()+'.'+(wasSent?' Forrige forespørsel er trukket tilbake.':''))}
 else{o.st='sendt';delete o.why;var warn=is.filter(function(x){return x[0]==='a'});
  log('<b>'+o.k+'</b> satt på '+where(o.t,o.w)+'. Forespørsel sendt til montasjefirmaet i Hengsel, svarfrist 48 timer.'+(warn.length?' Merk: '+warn[0][1].toLowerCase()+'.':''));
  if(wasUn)step('plan');if(wasAvv)step('svar')}
 render()}
/* Simuler svar fra montasjefirmaene */
$('sim').onclick=function(){var sent=O.filter(function(o){return o.st==='sendt'&&o.t});
 if(!sent.length){log('Ingen forespørsler venter på svar. Sett en jobb på tavla først.');return}
 var rej=null;if(sent.length>1){var c48=sent.filter(function(o){return o.w===48});var pool=c48.length?c48:sent;rej=pool[Math.floor(Math.random()*pool.length)]}
 var rest=sent.filter(function(o){return o!==rej}),acc=rest.filter(function(){return Math.random()<.7});if(!acc.length&&rest.length)acc=[rest[0]];
 acc.forEach(function(o){o.st='akseptert';log(TM[o.t].firm+' <b>aksepterte</b> '+o.k+' ('+where(o.t,o.w)+'). Montasjeuka vises på kundens Min side.')});
 if(rej){var w=rej.w,t=rej.t;FERIE[t+'|'+w]=1;log(TM[t].firm+' <b>avviste</b> '+rej.k+': ferie uke '+w+' for '+TM[t].name+'. Jobben er tilbake i Ikke planlagt.');rej.t=null;rej.w=null;rej.st='avvist';rej.why='Avvist: ferie uke '+w}
 var left=rest.length-acc.length;if(left)log(left+(left>1?' forespørsler venter':' forespørsel venter')+' fortsatt på svar.');
 SEL=null;render()};
/* Trykk og flytt */
$('board').addEventListener('click',function(e){if(supp){e.preventDefault();return}
 var to=e.target.closest('[data-to]');if(to){var id=SEL;move(id,to.dataset.to);var mc=$('board').querySelector('[data-id="'+id+'"]');if(mc)mc.focus({preventScroll:true});return}
 var c=e.target.closest('.job');if(c){SEL=SEL===c.dataset.id?null:c.dataset.id;render()}});
$('selx').onclick=function(){var id=SEL;SEL=null;render();var c=$('board').querySelector('[data-id="'+id+'"]');if(c)c.focus()};
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&SEL){$('selx').onclick()}});
$('board').addEventListener('keydown',function(e){var c=e.target.classList&&e.target.classList.contains('job')&&e.target;if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();SEL=SEL===c.dataset.id?null:c.dataset.id;render()}});
/* HTML5 drag (mus) */
var dragId=null;
$('board').addEventListener('dragstart',function(e){var c=e.target.closest&&e.target.closest('.job');if(!c)return;dragId=c.dataset.id;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',dragId)}catch(_){}setTimeout(function(){c.classList.add('dragging')},0)});
$('board').addEventListener('dragend',function(){dragId=null;clearOver();var d=$('board').querySelector('.dragging');if(d)d.classList.remove('dragging')});
$('board').addEventListener('dragover',function(e){var d=e.target.closest('[data-drop]');if(!d||!dragId)return;e.preventDefault();e.dataTransfer.dropEffect='move';setOver(d)});
$('board').addEventListener('drop',function(e){var d=e.target.closest('[data-drop]');if(!d||!dragId)return;e.preventDefault();var id=dragId;dragId=null;clearOver();move(id,d.dataset.drop)});
function clearOver(){$('board').querySelectorAll('.drop.over').forEach(function(x){x.classList.remove('over')})}
function setOver(d){$('board').querySelectorAll('.drop.over').forEach(function(x){if(x!==d)x.classList.remove('over')});if(d)d.classList.add('over')}
/* Pekerbasert drag via håndtaket (berøring, penn) */
var P=null,supp=false;
$('board').addEventListener('pointerdown',function(e){var g=e.target.closest('.grip');if(!g||e.pointerType==='mouse')return;var c=g.closest('.job');
 P={id:c.dataset.id,x:e.clientX,y:e.clientY,el:c,on:false,pid:e.pointerId};try{g.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()});
$('board').addEventListener('pointermove',function(e){if(!P||e.pointerId!==P.pid)return;
 if(!P.on){if(Math.abs(e.clientX-P.x)+Math.abs(e.clientY-P.y)<6)return;P.on=true;P.g=P.el.cloneNode(true);P.g.classList.add('drag');P.g.removeAttribute('data-id');document.body.appendChild(P.g);P.el.classList.add('dragging')}
 e.preventDefault();P.g.style.left=(e.clientX-80)+'px';P.g.style.top=(e.clientY-24)+'px';
 var el=document.elementFromPoint(e.clientX,e.clientY),d=el&&el.closest&&el.closest('[data-drop]');setOver(d||null);P.over=d;
 var br=$('board').getBoundingClientRect();if(e.clientX>br.right-40)$('board').scrollLeft+=12;else if(e.clientX<br.left+40)$('board').scrollLeft-=12});
function endP(e,cancel){if(!P||e.pointerId!==P.pid)return;var p=P;P=null;if(p.g)p.g.remove();clearOver();
 if(p.on){supp=true;setTimeout(function(){supp=false},60);p.el.classList.remove('dragging');if(!cancel&&p.over)move(p.id,p.over.dataset.drop)}
 else if(!cancel){SEL=SEL===p.id?null:p.id;supp=true;setTimeout(function(){supp=false},60);render()}}
$('board').addEventListener('pointerup',function(e){endP(e,false)});
$('board').addEventListener('pointercancel',function(e){endP(e,true)});
function init(){O=seed();FERIE={};SEL=null;STEPS={};$('log').innerHTML='';[].forEach.call($('guide').children,function(li){li.classList.remove('d')});
 log('Ordrebekreftelser fra fabrikken og leverandører er lest inn. Leveringsukene står på kortene.');
 log('<b>Berg</b> og <b>Nilsen</b> er ikke sendt til montasjefirmaet: planen har feil.');
 render()}
$('reset').onclick=init;
var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(kpi,150)});
init();
})();
