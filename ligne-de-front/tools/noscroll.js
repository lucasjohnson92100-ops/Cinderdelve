// Audit « aucun défilement » (node tools/noscroll.js [844x390,568x320,...] [shot]) : nécessite Playwright
// Audit « aucun défilement » : chaque écran et chaque fenêtre doit tenir dans l'écran sans scroller
const { chromium } = require('playwright');
const SIZES=(process.argv[2]||'844x390,667x375,932x430,1280x720').split(',').map(s=>s.split('x').map(Number));
const SHOT=process.argv[3]==='shot';
(async()=>{const b=await chromium.launch();let bad=0;
for(const [W,H] of SIZES){
 const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+require('path').resolve(__dirname,'../index.html'));await p.evaluate(()=>localStorage.setItem('front-best',JSON.stringify({tuto:{off:1}})));await p.reload();await p.waitForTimeout(300);
 const check=async name=>{await p.waitForTimeout(450);
  const r=await p.evaluate(()=>{const out=[];const de=document.documentElement;if(de.scrollHeight>innerHeight+1)out.push('page '+de.scrollHeight+'>'+innerHeight);if(de.scrollWidth>innerWidth+1)out.push('largeur '+de.scrollWidth+'>'+innerWidth);
   for(const e of document.querySelectorAll('body *')){const cs=getComputedStyle(e);if((cs.overflowY==='auto'||cs.overflowY==='scroll')&&e.scrollHeight>e.clientHeight+2&&e.clientHeight>0)out.push('zone défilante .'+String(e.className).split(' ')[0]+' '+e.scrollHeight+'>'+e.clientHeight);
    if((cs.overflowX==='auto'||cs.overflowX==='scroll')&&e.scrollWidth>e.clientWidth+2&&e.clientWidth>0)out.push('défilement horizontal .'+String(e.className).split(' ')[0]+' '+e.scrollWidth+'>'+e.clientWidth);}
   const box=document.querySelector('.modal .box');if(box&&box.scrollHeight>box.clientHeight+2)out.push('fenêtre rognée '+box.scrollHeight+'>'+box.clientHeight);const ap=document.getElementById('app');if(ap&&ap.scrollHeight>ap.clientHeight+3&&getComputedStyle(ap).overflow!=='visible')out.push('app rognée '+ap.scrollHeight+'>'+ap.clientHeight);for(const e of document.querySelectorAll('.stack,.btl,.shop2,.mapscreen,.home')){if(e.scrollHeight>e.clientHeight+3&&getComputedStyle(e).overflowY!=='visible')out.push('rognage .'+String(e.className).split(' ')[0]+' '+e.scrollHeight+'>'+e.clientHeight);}if(box){const r=box.getBoundingClientRect();if(r.bottom>innerHeight+1||r.top<-1)out.push('fenêtre hors écran '+Math.round(r.top)+'→'+Math.round(r.bottom));}
   return out;});
  if(SHOT)await p.screenshot({path:`/tmp/ns_${W}_${name}.png`});
  if(r.length){bad++;console.log(`KO ${W}×${H} ${name} : ${r.join(' | ')}`);}};
 const close=async()=>{await p.evaluate(()=>{closeModal();document.querySelectorAll('.coach,.treport').forEach(x=>x.remove());});};
 await check('titre');
 await p.evaluate(()=>{localStorage.setItem('front-run',JSON.stringify({v:1,screen:'map',C:{deck:new Array(18).fill({t:'tireurs',c:'J'}),hq:48,hqMax:60,loot:14,officers:['ito','kowalski'],map:[[1]],pos:{layer:3,i:0}},S:null,at:1}));showTitle();});await check('titre-reprise');
 await p.evaluate(()=>{localStorage.removeItem('front-run');showTitle();});await p.evaluate(()=>helpModal(false));await check('aide');await close();
 await p.click('[data-act=new]');await check('doctrine');await p.click('[data-doctrine]');await p.waitForTimeout(400);
 await check('carte-depart');
 await p.evaluate(()=>{C.pos={layer:4,i:0};C.trail={0:0,1:0,2:0,3:0,4:0};C.officers=['ito','kowalski','ashby','fer','radio'];C.loot=14;toMap();});await check('carte-milieu');
 await p.evaluate(()=>{const n=C.map[5][0];nodeModal(n);});await check('fiche-etape');await close();
 await p.evaluate(()=>{const n=C.map[4][0];C.map[4][0].type='boss';C.map[4][0].boss='train';nodeModal(C.map[4][0]);});await check('fiche-boss');await close();
 await p.evaluate(()=>deckModal(false));await check('paquet');await close();
 await p.evaluate(()=>{C.deck=[...C.deck,...Array.from({length:30},(_,i)=>mkCard(['tireurs','jeep','blinde','mitrailleuse','artillerie','barrage'][i%6],'JRVN'[i%4]))];deckModal(false);});await check('paquet-gros');await close();
 await p.evaluate(()=>deckModal('remove'));await check('paquet-retirer');await close();
 await p.evaluate(()=>deckModal('upgrade'));await check('paquet-entrainer');await close();
 await p.evaluate(()=>{const n={id:'x',layer:3,i:0,type:'battle',levelIdx:3,name:'Village',obj:{type:'hq'},next:[]};C.node=n;C.pos={layer:3,i:0};startBattle(n);});await p.waitForTimeout(400);await close();
 await p.evaluate(()=>{S.supply=30;S.hand=[mkCard('tireurs','J'),mkCard('jeep','R'),mkCard('blinde','V'),mkCard('chasseur','N'),mkCard('barrage',''),mkCard('destroyer','J'),mkCard('artillerie','R'),mkCard('observateur','J')];renderBattle();});await check('bataille-main-pleine');
 await p.evaluate(()=>{const i=S.hand.findIndex(c=>!isOrder(c)&&canDeployNow(S,c).ok);const t=bestSectorFor(S.hand[i]);placeCard(S,i,t.c);placeCard(S,0,bestSectorFor(S.hand[0]).c);renderBattle();});await check('bataille-unites');
 await p.evaluate(()=>{picked=[S.hand[0]];renderBattle();});await check('bataille-carte-choisie');picked=[];
 await p.evaluate(()=>{discardSel=[];renderBattle();});await check('bataille-defausse');await p.evaluate(()=>{discardSel=null;renderBattle();});
 await p.evaluate(()=>guideModal());await check('guide');await close();
 await p.evaluate(()=>helpModal(false));await check('aide-bataille');await close();
 await p.evaluate(()=>unitSheet(S.units[0].uid));await check('fiche-unite');await close();
 await p.evaluate(()=>sectorSheet(S.units[0].c));await check('fiche-secteur');await close();
 await p.evaluate(()=>fxModal(S.fx[0]||'bunker'));await check('fiche-effet');await close();
 await p.evaluate(()=>deckModal(false));await check('paquet-bataille');await close();
 await p.evaluate(()=>{const i=S.hand.findIndex(c=>1);cardModal(CARD_REG.indexOf(S.hand[i]));});await check('fiche-carte');await close();
 await p.evaluate(()=>{S.over='win';toReward();});await check('butin');
 await p.evaluate(()=>{C.spoils=rewardCards(Math.random,1,C.deck);spoilsStep();});await check('renforts');
 await p.evaluate(()=>cardStep(false));await check('depot');
 await p.evaluate(()=>jokerStep());await check('joker');
 await p.evaluate(()=>{const n={type:'event',layer:2,i:0,name:'x',next:[]};C.node=n;eventStep();});await check('evenement');
 await p.evaluate(()=>toCamp());await check('camp');
 await p.evaluate(()=>{C.loot=40;toShop();});await check('intendance');
 await p.evaluate(()=>shopDetail('c',0));await check('intendance-detail-carte');await close();
 await p.evaluate(()=>shopDetail('j',0));await check('intendance-detail-joker');await close();
 await p.evaluate(()=>{C.shop.crates=C.shop.crates||[];if(C.shop.crates[0])openCrateModal(0);});await check('caisse');await close();
 await p.evaluate(()=>{S.over='lose';finishBattle();});await p.waitForTimeout(1500);await check('defaite');
 await p.evaluate(()=>victory());await p.waitForTimeout(900);await check('victoire');
 if(errs.length)console.log('erreurs JS',W,errs);await p.close();}
console.log(bad?`${bad} écran(s) avec défilement`:'aucun défilement nulle part');await b.close();})();
