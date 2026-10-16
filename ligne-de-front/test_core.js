// Vérifie le moteur en secteurs : terrains, pose, file par ancienneté, Attaque/Défense, combinaisons, résolution, QG, ordres, appuis, fusions, plan ennemi, boss, jokers, boutique (node test_core.js)
const fs=require('fs');
const coreReal=fs.readFileSync(process.argv[2]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
// les tests de mécanique tournent avec des valeurs ennemies non multipliées ; les vraies constantes sont vérifiées à part
const core=coreReal.replace(/ENEMY_GROWTH = [\d.]+, ENEMY_HP = [\d.]+, HQ_MULT = [\d.]+, HQ_GROW = [\d.]+, ENEMY_ATK = [\d.]+,/,'ENEMY_GROWTH = 0, ENEMY_HP = 1, HQ_MULT = 1, HQ_GROW = 1, ENEMY_ATK = 1,');
const NAMES='genTerrain,newBattle,endTurn,TYPES,ENEMIES,START_DECK,fuseCards,splitCard,canFuse,canFuseUnits,fuseUnits,cardStatsFor,snapshotState,restoreState,placeCard,deployTargets,canDeployNow,terrainMult,COLOR_TERRAIN,units,findUnit,mkUnit,placeUnit,spawnEnemy,genPlan,airStrike,genMap,battleCfg,mkCard,LEVELS,shotsOf,rewardCards,cardCost,HQ_START,GW,TERRAIN,addSupplyBonus,supplyBonusCost,BASE_SUPPLY,playOrder,discardHand,isOrder,BASE_DISCARDS,DISCARD_SUPPLY,toggleKeep,MAX_KEEP,MAX_CARRY,queue,supportAt,sectorForecast,sectorCombos,COMBOS,unitAtk,unitDef,hitSector,hqTake,HQ_TAKE,MIN_THROUGH,MAX_LAND,landCols,genShop,upgradeCost,JOKERS,DOCTRINES,doctrineCards,pickDoctrines,BOSSES,hqShielded,rollTrain,EVENTS,pickEvent,applyEvent,BOSS_DOWN,applyDamage,ENEMY_HP,HQ_MULT,HQ_GROW,ENEMY_GROWTH,ENEMY_ATK';
const E=new Function(core+';return {'+NAMES+'};')();
let bad=0,n=0;const check=(m,g,e)=>{n++;if(g!==e){bad++;console.log('ÉCHEC',m,'obtenu',g,'attendu',e);}};
const T=E.TYPES,GW=E.GW;
// plateau : 5 secteurs, une mer au bord
for(let k=0;k<300;k++){const t=E.genTerrain(Math.random),L=t.lanes;
  check('5 secteurs',L.length,GW);check('une mer au bord',L.filter(x=>x==='mer').length===1&&(L[0]==='mer'||L[GW-1]==='mer'),true);
  check('mer repérée',t.seaCol,L.indexOf('mer'));check('au plus 1 village et 1 rivière',L.filter(x=>x==='village').length<=1&&L.filter(x=>x==='riviere').length<=1,true);}
const mk=(o={})=>{const S=E.newBattle({level:0,deck:E.START_DECK.map(c=>({...c})),hq:60,hqMax:60,officers:[],...o},()=>0.5);return S;};
// plateau vierge, terrains choisis
const blank=(lanes)=>{const S=mk();S.plan=[];S.units=[];S.lanes=lanes;S.grid=[lanes.slice()];S.seaCol=lanes.indexOf('mer');S.supply=40;S.hand=[];return S;};
let S=mk();
check('ravitaillement de base',S.supply,E.BASE_SUPPLY);check('main de 6',S.hand.length,6);
check('l\'ennemi tient chaque secteur dès le début',E.landCols(S).every(c=>E.queue(S,'en',c).length>0),true);
// pose : terrain praticable, 3 unités terrestres par secteur, un appui par secteur
S=blank(['mer','route','foret','riviere','champ']);
S.hand=[E.mkCard('tireurs','J'),E.mkCard('destroyer','J'),E.mkCard('chasseur','J'),E.mkCard('blinde','J'),E.mkCard('jeep','J')];
const tg=c=>E.deployTargets(S,c).map(x=>x.c).join(',');
check('tireurs : partout sauf la mer',tg(S.hand[0]),'1,2,3,4');check('blindé : ni forêt ni rivière',tg(S.hand[3]),'1,4');check('jeep : pas la rivière',tg(S.hand[4]),'1,2,4');
check('chasseur : tous les secteurs terrestres',tg(S.hand[2]),'1,2,3,4');check('navire : près de la côte',tg(S.hand[1]),'1,2');
let u1=E.placeCard(S,0,1);check('pose',!!u1&&u1.c===1,true);check('coût payé',S.supply,38);check('pas dans la mer',E.placeCard(S,0,0),null);
S.hand=[E.mkCard('tireurs','R'),E.mkCard('tireurs','V'),E.mkCard('tireurs','N')];E.placeCard(S,0,1);E.placeCard(S,0,1);
check('3 unités au plus par secteur',E.placeCard(S,0,1),null);check('secteur plein exclu des cibles',tg(S.hand[0]).includes('1'),false);
check('file : ordre d\'arrivée',E.queue(S,'me',1).map(u=>u.cols).join(''),'JRV');
S.hand=[E.mkCard('chasseur','J'),E.mkCard('chasseur','R')];const sup=E.placeCard(S,0,2);check('appui posé',E.supportAt(S,2)===sup,true);check('appui hors file',E.queue(S,'me',2).length,0);
check('un seul appui par secteur',tg(S.hand[0]).includes('2'),false);
// terrains forts et faibles des couleurs
check('jaune sur route ×1,5',E.terrainMult('J','route'),1.5);check('jaune en forêt ×0,75',E.terrainMult('J','foret'),0.75);check('vert en forêt ×1,5',E.terrainMult('V','foret'),1.5);
check('jaune+vert en forêt ×1,25',E.terrainMult('JV','foret'),1.25);check('rouge au champ',E.terrainMult('R','champ'),1.5);check('noir au village',E.terrainMult('N','village'),1.5);
check('chaque couleur : 1 fort, 1 faible, différents',Object.values(E.COLOR_TERRAIN).every(t=>t.fort!==t.faible&&E.TERRAIN[t.fort]&&E.TERRAIN[t.faible]),true);
// Attaque et Défense d'une unité
S=blank(['mer','route','champ','foret','champ']);
let a=E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),1);check('tireurs jaunes sur route : 10 × 2 × 1,5 = 30',E.unitAtk(S,a),30);
let b=E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),2);check('au champ : 20',E.unitAtk(S,b),20);
check('défense pleine',E.unitDef(S,b),3);b.hp=5;check('entamée : défense réduite de moitié',E.unitDef(S,b),1.5);b.hp=b.hpMax;
let f=E.placeUnit(S,E.mkUnit(S,'me','tireurs','V'),3);check('forêt : couvert +30 % de Défense, vert +25 %',E.unitDef(S,f),Math.round(Math.ceil(3*1.25)*1.3*10)/10);
let blk=E.mkUnit(S,'me','antichar','');if(blk.kw.includes('antitank')){E.placeUnit(S,blk,2);const base=E.unitAtk(S,blk);E.placeUnit(S,E.mkUnit(S,'en','panzer'),2);check('anti-char ×2 face à un blindé',E.unitAtk(S,blk),base*2);}
// combinaisons de secteur
S=blank(['mer','champ','champ','champ','champ']);
E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),1);let cb=E.sectorCombos(S,1);check('seul : aucune combinaison',cb.list.atk.length+cb.list.def.length,0);
E.placeUnit(S,E.mkUnit(S,'me','jeep','J'),1);cb=E.sectorCombos(S,1);
check('binôme + armes combinées + même couleur',cb.list.atk.map(k=>k.id).sort().join(),'armes,binome,couleur');check('Mult : (1 + 0,5 + 1) × 1,5',cb.mult.atk,3.75);
E.placeUnit(S,E.mkUnit(S,'me','mitrailleuse','R'),1);cb=E.sectorCombos(S,1);check('trio remplace binôme',cb.list.atk.some(k=>k.id==='trio')&&!cb.list.atk.some(k=>k.id==='binome'),true);
check('nid défensif + ligne tenue',cb.list.def.map(k=>k.id).sort().join(),'ligne,nid');check('plus de même couleur',cb.list.atk.some(k=>k.id==='couleur'),false);
const ch=E.placeUnit(S,E.mkUnit(S,'me','chasseur','J'),1);ch.land=false;cb=E.sectorCombos(S,1);check('appui + couverture aérienne',cb.list.atk.some(k=>k.id==='appui')&&cb.list.def.some(k=>k.id==='couvert'),true);
S.comboLv={trio:2};cb=E.sectorCombos(S,1);check('manuel : trio niveau 2',cb.list.atk.find(k=>k.id==='trio').add,1.5);
// bilan d'un secteur : Attaque − Défense d'en face, au moins un quart passe
S=blank(['mer','champ','champ','champ','champ']);
a=E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),2);let e=E.placeUnit(S,E.mkUnit(S,'en','rifle'),2);
let fc=E.sectorForecast(S,2);check('Attaque 20',fc.atk,20);check('Défense ennemie 3',fc.enDef,3);check('vous infligez 17',fc.toEn,17);check('Attaque ennemie 6',fc.enAtk,6);check('vous subissez 6 − 3 = 3',fc.toMe,3);
e.def=100;fc=E.sectorForecast(S,2);check('Défense énorme : un quart passe quand même',fc.toEn,Math.ceil(20*E.MIN_THROUGH));e.def=3;
S.smoke=[2];fc=E.sectorForecast(S,2);check('fumigènes : Attaque ennemie ÷2',fc.enAtk,3);S.smoke=[];
S.flags.assault=[2];fc=E.sectorForecast(S,2);check('assaut : Attaque ×1,5',fc.atk,30);S.flags.assault=[];
S.counterCols=[2];fc=E.sectorForecast(S,2);check('contre-attaque : Défense ×1,5',fc.def,5);S.counterCols=[];
const pr=E.placeUnit(S,E.mkUnit(S,'me','paras',''),2);fc=E.sectorForecast(S,2);check('parachutistes : Défense ennemie comptée moitié',fc.enDefEff,Math.round(fc.enDef/2));S.units=S.units.filter(u=>u!==pr);
// dégâts : la plus ancienne d'abord, puis le QG
S=blank(['mer','champ','champ','champ','champ']);
const q1=E.placeUnit(S,E.mkUnit(S,'en','rifle'),1),q2=E.placeUnit(S,E.mkUnit(S,'en','rifle'),1);const hq0=S.hq.en;
let r=E.hitSector(S,'en',1,q1.hp+2);check('la plus ancienne tombe',S.units.includes(q1),false);check('le reste passe à la suivante',q2.hp,q2.hpMax-2);check('QG intact',S.hq.en,hq0);
r=E.hitSector(S,'en',1,q2.hp+10);check('file vide : le QG prend le reste',hq0-S.hq.en,10);check('kills',S.kills,2);
r=E.hitSector(S,'me',1,10);check('votre QG fortifié',60-S.hq.me,Math.ceil(10*E.HQ_TAKE));
r=E.hitSector(S,'en',1,10,{unitsOnly:true});check('barrage : jamais le QG',hq0-S.hq.en,10);
// repli : fin de file et soins
S=blank(['mer','champ','champ','champ','champ']);
const r1=E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),1),r2=E.placeUnit(S,E.mkUnit(S,'me','tireurs','R'),1);r1.hp=2;
S.hand=[E.mkCard('repli','')];E.playOrder(S,0,{uid:r1.uid});check('repli : passe en fin de file',E.queue(S,'me',1)[1]===r1,true);check('repli : soigné de moitié',r1.hp,2+Math.ceil(8/2));
S.hand=[E.mkCard('retranchement','')];E.playOrder(S,0,{uid:r2.uid});check('retranchement',r2.dig,0.5);
// ordres de secteur
S=blank(['mer','champ','champ','champ','champ']);const z=E.placeUnit(S,E.mkUnit(S,'en','rifle'),3);z.hp=z.hpMax=40;
S.hand=[E.mkCard('barrage','')];E.playOrder(S,0,{c:3});check('barrage : 14',40-z.hp,14);
S.hand=[E.mkCard('fumigenes','')];E.playOrder(S,0,{c:2});check('fumigènes',S.smoke.includes(2),true);
S.hand=[E.mkCard('assaut','')];E.playOrder(S,0,{c:2});check('assaut',S.flags.assault.includes(2),true);
S.hand=[E.mkCard('contreattaque','')];E.playOrder(S,0,{c:4});check('contre-attaque',S.counterCols.includes(4),true);
{const p=E.placeUnit(S,E.mkUnit(S,'me','paras',''),1);S.hand=[E.mkCard('sabotage','')];const h=S.hq.en;E.playOrder(S,0,{uid:p.uid});check('sabotage : 8 % du QG de départ',h-S.hq.en,Math.ceil(S.lvl.hq*0.08));}
// frappe aérienne : secteur visé, moitié aux voisins
S=blank(['mer','champ','champ','champ','champ']);const t2=E.placeUnit(S,E.mkUnit(S,'en','rifle'),2),t3=E.placeUnit(S,E.mkUnit(S,'en','rifle'),3);t2.hp=t2.hpMax=t3.hp=t3.hpMax=200;
S.hand=[E.mkCard('bombardier','')];const st=E.airStrike(S,0,2);check('bombardier : frappe',!!st,true);check('moitié au voisin',Math.round((200-t3.hp)*2/(200-t2.hp)*10)/10<=1.1&&200-t3.hp>0,true);
// résolution de fin de tour
S=blank(['mer','champ','champ','champ','champ']);S.hq.en=500;
E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),1);const steps=E.endTurn(S);const res=steps.filter(s=>s.ph==='res');
check('secteur résolu',res.some(s=>s.c===1),true);check('secteur vide : dégâts au QG ennemi',500-S.hq.en,20);check('instantané pour l\'animation',!!res[0].snap,true);check('tour suivant',S.turn,2);
// appuis : durée limitée
S=blank(['mer','champ','champ','champ','champ']);S.hand=[E.mkCard('chasseur','J')];const cs=E.placeCard(S,0,2);const ttl=cs.ttl;E.endTurn(S);check('appui : un tour de moins',E.findUnit(S,cs.uid)?E.findUnit(S,cs.uid).ttl:0,ttl-1);
// fusions
S=blank(['mer','champ','champ','champ','champ']);S.turn=3;let f1=E.mkUnit(S,'me','tireurs','J');f1.born=1;let f2=E.mkUnit(S,'me','tireurs','R');f2.born=1;E.placeUnit(S,f1,1);E.placeUnit(S,f2,1);
check('même secteur : fusionnables',E.canFuseUnits(S,f1,f2),true);
const fu=E.fuseUnits(S,f1.uid,f2.uid);check('fusion',fu.cols,'JR');check('une place libérée',E.queue(S,'me',1).length,1);check('10 + 15 hommes',E.shotsOf(fu),25);
{const Sx=mk();Sx.hand=[E.mkCard('tireurs','J'),E.mkCard('tireurs','J'),E.mkCard('tireurs','R'),E.mkCard('blinde','J')];
 check('même couleur fusionnable',E.canFuse(Sx.hand[0],Sx.hand[1]),true);check('types différents refusés',E.canFuse(Sx.hand[0],Sx.hand[3]),false);
 let c=E.fuseCards(Sx,0,1);c=E.fuseCards(Sx,0,1);check('3 cartes fusionnées',c.parts.length,3);check('couleurs',c.c,'JR');
 const s=E.cardStatsFor(c,Sx);check('10 + 10 + 15 soldats',s.men,35);check('coût 2+2+2-2',E.cardCost(Sx,c),4);
 check('main : 2 cartes',Sx.hand.length,2);E.splitCard(Sx,0);check('séparer rend les 3 cartes',Sx.hand.length,4);}
// annuler
S=blank(['mer','champ','champ','champ','champ']);S.hand=[E.mkCard('tireurs','J')];const sn=E.snapshotState(S);E.placeCard(S,0,1);check('1 unité',S.units.length,1);E.restoreState(S,sn);check('annulé',S.units.length,0);check('carte revenue',S.hand.length,1);
// plan ennemi : renforts dans des secteurs praticables, trous comblés en priorité
for(let k=0;k<100;k++){const Q=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[]},Math.random,E.battleCfg({type:'battle',levelIdx:4,layer:5,obj:{type:'hq'}}));
  check('renforts : secteurs terrestres',Q.plan.filter(p=>p.k==='deploy').every(p=>Q.lanes[p.c]!=='mer'),true);}
// réserve
{const Q=E.newBattle({level:0,deck:E.START_DECK.map(c=>({...c})),hq:60,hqMax:60,officers:[]},Math.random,E.battleCfg({type:'battle',levelIdx:0,layer:1,obj:{type:'hq'}}));
 Q.units=Q.units.filter(u=>u.side==='me');const k0=Q.hand[0],k1=Q.hand[1];check('épingle 1',E.toggleKeep(Q,0),true);E.toggleKeep(Q,1);check('épingle 3 refusée',E.toggleKeep(Q,2),false);
 Q.supply=5;Q.plan=[];E.endTurn(Q);
 if(!Q.over){check('cartes gardées en main',Q.hand.includes(k0)&&Q.hand.includes(k1),true);check('ravitaillement reporté',Q.supply>=E.BASE_SUPPLY+E.MAX_CARRY,true);check('main = 6 + 2 gardées',Q.hand.length,8);}}
// défausse, jokers, boutique, carte
S=mk();const s0=S.supply;E.discardHand(S,[0]);check('défausse : +1 ravitaillement',S.supply-s0,E.DISCARD_SUPPLY);
S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:['kowalski']},()=>0.5);check('kowalski +1',S.supply,E.BASE_SUPPLY+1);
check('ito : ordres −1',(()=>{const Q=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:['ito']},()=>0.5);return E.cardCost(Q,E.mkCard('barrage',''));})(),2);
check('9 couches',E.genMap().length,9);check('paquet de départ 15',E.START_DECK.length,15);
check('2 jokers en boutique',E.genShop({officers:['ashby'],deck:E.START_DECK},undefined,false).jokers.length,2);
{const Cc={supplyBonus:0};E.addSupplyBonus(Cc);E.addSupplyBonus(Cc);E.addSupplyBonus(Cc);check('bonus de ravitaillement plafonné',E.addSupplyBonus(Cc),false);}
check('5 doctrines de 3 cartes',Object.values(E.DOCTRINES).every(d=>d.cards.length===3&&d.cards.every(([t])=>E.TYPES[t]))+'/'+Object.keys(E.DOCTRINES).length,'true/5');
// boss
{const B=k=>E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[]},()=>0.5,E.battleCfg({type:'boss',levelIdx:3,layer:4,boss:k,obj:{type:'hq'}}));
 let Q=B('tank');check('boss char',E.units(Q,'en').some(u=>u.key==='heavy'),true);
 Q=B('battery');check('batterie : QG protégé',E.hqShielded(Q),true);check('dégâts au QG divisés par deux',E.hqTake(Q,'en',10),5);
 Q=B('train');const t0=E.units(Q,'en').find(u=>u.key==='train');const c0=t0.c;E.rollTrain(Q,[]);check('le train change de secteur',t0.c!==c0,true);
 Q=B('tank');const boss=E.units(Q,'en').find(u=>u.key==='heavy'),h0=Q.hq.en,h=E.applyDamage(Q,boss,9999);check('boss abattu : QG ébranlé',h0-Q.hq.en,Math.ceil(Q.lvl.hq*E.BOSS_DOWN));check('signalé',!!h.bossDown,true);}
// événements
{const Cc={deck:E.START_DECK.slice(),hq:40,hqMax:60,loot:3,officers:[]};check('7 événements',E.EVENTS.length,7);
 E.applyEvent(Cc,'convoi',0);check('convoi : +7',Cc.loot,10);E.applyEvent(Cc,'hopital',0);check('hôpital : +15',Cc.hq,55);}
// vraies constantes : progression ennemie exponentielle, votre QG fortifié
{const R=new Function(coreReal+';return {battleCfg,LEVELS,HQ_MULT,HQ_GROW,ENEMY_HP,HQ_TAKE,newBattle,mkUnit,ENEMIES,START_DECK}')();
 const h=i=>R.battleCfg({type:'battle',levelIdx:i,layer:i+1,obj:{type:'hq'}}).hq;check('QG ennemi : base × multiplicateur',h(0),Math.round(R.LEVELS[0].hq*R.HQ_MULT));
 check('QG ennemi : croissance exponentielle',h(4)>h(1)*1.5,true);check('votre QG fortifié',R.HQ_TAKE<1,true);
 const Q=R.newBattle({level:0,deck:R.START_DECK.slice(),hq:60,hqMax:60,officers:[]},()=>0.5,R.battleCfg({type:'battle',levelIdx:0,layer:1,obj:{type:'hq'}}));
 check('PV ennemis multipliés',R.mkUnit(Q,'en','rifle').hpMax,R.ENEMIES.rifle.men*R.ENEMIES.rifle.hpm*R.ENEMY_HP);}
console.log(bad?`${bad} échec(s) sur ${n}`:`tous les tests passent (${n})`);process.exit(bad?1:0);
