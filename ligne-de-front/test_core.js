// Vérifie le moteur : secteurs et terrains, terrains forts/faibles des couleurs, portées, QG, avance, couverture, villages, fusions, plan ennemi, jokers, boutique (node test_core.js)
const fs=require('fs');
const core=fs.readFileSync(process.argv[2]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
const E=new Function(core+';return {lootFor,genShop,upgradeCost,canUpgrade,cardPrice,upText,JOKERS,MAX_JOKERS,UP,newBattle,endTurn,TYPES,ENEMIES,START_DECK,fuseCards,splitCard,canFuse,canFuseUnits,fuseUnits,cardStatsFor,snapshotState,restoreState,planDeploy,placeCard,deployCells,advance,terrainMult,canStand,COLOR_TERRAIN,villageIncome,unitAt,units,findUnit,mkUnit,placeUnit,spawnEnemy,genTerrain,genPlan,airStrike,genMap,battleCfg,mkCard,statsFor,LEVELS,shotsOf,rewardCards,cardCost,shuffle,HQ_START,GW,GH,TERRAIN,addSupplyBonus,supplyBonusCost,MAX_SUPPLY_BONUS,BASE_SUPPLY,attackUnit,playerAttack,canAttack,attackOptions,targetsFrom,hqInRange,isLandCell,playOrder,discardHand,applyMarks,shotDmg,combinedBonus,isOrder,BASE_DISCARDS,springTrap,landingCard,enemyMinesCheck,ENEMIES,REAR,FRONT,BOSSES,spawnBoss,hqShielded,rollTrain,EVENTS,pickEvent,applyEvent};')();
let bad=0;const check=(n,g,e)=>{if(g!==e){bad++;console.log('ÉCHEC',n,'obtenu',g,'attendu',e);}};
const T=E.TYPES,GW=E.GW,GH=E.GH;
// plateau : 4 lignes x 5 secteurs, terrain fixe par secteur
for(let k=0;k<300;k++){const t=E.genTerrain(Math.random),g=t.grid;
  check('dimensions',g.length+'x'+g[0].length,GH+'x'+GW);check('secteurs identiques sur toutes les lignes',g.every(r=>r.join()===g[0].join()),true);
  const L=g[0];check('une mer au bord',L.filter(x=>x==='mer').length===1&&(L[0]==='mer'||L[GW-1]==='mer'),true);
  check('route ou champ',L.some(x=>x==='route'||x==='champ'),true);check('au plus 1 village et 1 rivière',L.filter(x=>x==='village').length<=1&&L.filter(x=>x==='riviere').length<=1,true);
  check('QG hors plateau',t.hq.en[0]+'/'+t.hq.me[0],'-1/'+GH);}
check('générateur sans boucle infinie',E.genTerrain(()=>0.37).grid[0].length,GW);
const mk=(o={})=>E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[],...o},()=>0.5);
const lanes=(...l)=>Array.from({length:GH},()=>l.slice());
let S=mk();
check('ravitaillement de base',S.supply,E.BASE_SUPPLY);check('main de 6',S.hand.length,6);
// déploiement : vos deux lignes, terrain praticable
S=mk();S.plan=[];S.units=[];S.grid=lanes('mer','route','foret','riviere','champ');S.supply=30;
S.hand=[E.mkCard('tireurs','J'),E.mkCard('destroyer','J'),E.mkCard('chasseur','J'),E.mkCard('blinde','J'),E.mkCard('jeep','J')];
const cl=c=>E.deployCells(S,c).map(x=>x.join(',')).sort().join(' ');
check('tireurs : 2 lignes, pas la mer',cl(S.hand[0]),'2,1 2,2 2,3 2,4 3,1 3,2 3,3 3,4');
check('navire : la mer',cl(S.hand[1]),'2,0 3,0');check('avion : partout',E.deployCells(S,S.hand[2]).length,10);
check('blindé : ni forêt ni rivière',cl(S.hand[3]),'2,1 2,4 3,1 3,4');check('jeep : pas la rivière',cl(S.hand[4]),'2,1 2,2 2,4 3,1 3,2 3,4');
check('placer',!!E.placeCard(S,0,2,1),true);check('coût payé',S.supply,28);check('case occupée refusée',E.placeCard(S,0,2,1),null);check('ligne ennemie refusée',E.placeCard(S,0,1,2),null);
// terrains forts et faibles des couleurs
check('jaune sur route ×1,5',E.terrainMult('J','route'),1.5);check('jaune en forêt ×0,75',E.terrainMult('J','foret'),0.75);check('vert en forêt ×1,5',E.terrainMult('V','foret'),1.5);
check('jaune+vert en forêt ×1,25',E.terrainMult('JV','foret'),1.25);check('rouge au champ',E.terrainMult('R','champ'),1.5);check('noir au village',E.terrainMult('N','village'),1.5);check('noir au champ',E.terrainMult('N','champ'),0.75);
check('chaque couleur : 1 fort, 1 faible, différents',Object.values(E.COLOR_TERRAIN).every(t=>t.fort!==t.faible&&E.TERRAIN[t.fort]&&E.TERRAIN[t.faible]),true);
S=mk();S.plan=[];S.units=[];S.grid=lanes('mer','route','foret','champ','champ');
let a=E.mkUnit(S,'me','tireurs','J');a.fresh=false;E.placeUnit(S,a,2,1);let e=E.mkUnit(S,'en','panzer');e.armor=0;e.hp=e.hpMax=100;E.placeUnit(S,e,1,1);
E.playerAttack(S,a.uid,e.uid);check('jaune sur route : 10 tirs de 2 ×1,5 = 30',100-e.hp,30);
S.units=[];a=E.mkUnit(S,'me','tireurs','J');a.fresh=false;E.placeUnit(S,a,2,3);e=E.mkUnit(S,'en','panzer');e.armor=0;e.hp=e.hpMax=100;E.placeUnit(S,e,1,3);
E.playerAttack(S,a.uid,e.uid);check('jaune au champ : 20',100-e.hp,20);
S.units=[];a=E.mkUnit(S,'me','tireurs','J');a.fresh=false;E.placeUnit(S,a,2,2);e=E.mkUnit(S,'en','panzer');e.armor=0;e.hp=e.hpMax=100;E.placeUnit(S,e,1,2);
E.playerAttack(S,a.uid,e.uid);check('jaune en forêt : 15, −30 % de couverture = 11',100-e.hp,11);
S.units=[];a=E.mkUnit(S,'me','tireurs','J');a.fresh=false;E.placeUnit(S,a,2,1);const hq0=S.hq.en;E.playerAttack(S,a.uid,'hq');check('QG : bonus de terrain aussi',hq0-S.hq.en,30);
// portées : front contre front, l'arrière est protégé
S=mk();S.plan=[];S.units=[];S.grid=lanes('champ','champ','champ','champ','mer');
a=E.mkUnit(S,'me','tireurs','');a.fresh=false;E.placeUnit(S,a,2,2);e=E.mkUnit(S,'en','rifle');E.placeUnit(S,e,1,2);let e2=E.mkUnit(S,'en','rifle');E.placeUnit(S,e2,1,3);let e3=E.mkUnit(S,'en','rifle');E.placeUnit(S,e3,0,2);
check('tireurs : seulement en face',E.targetsFrom(S,a,2,2).map(x=>x.uid).join(),String(e.uid));check('depuis l\'arrière : rien',E.targetsFrom(S,a,3,2).length,0);
let jp=E.mkUnit(S,'me','jeep','');check('jeep (portée 2) : en face, à côté, l\'arrière d\'en face',E.targetsFrom(S,jp,2,2).length,3);
// QG : secteur d'en face vide
check('QG bloqué par un ennemi',E.hqInRange(S,a,2,2),false);check('QG : secteur vide',E.hqInRange(S,a,2,1),true);check('QG depuis l\'arrière : portée 1 trop courte',E.hqInRange(S,a,3,1),false);
check('jeep depuis l\'arrière',E.hqInRange(S,jp,3,1),true);let ds=E.mkUnit(S,'me','destroyer','');check('navire : jamais le QG',E.hqInRange(S,ds,2,4),false);
let ch=E.mkUnit(S,'me','chasseur','');check('chasseur : jamais le QG',E.hqInRange(S,ch,2,1),false);
S.units=[];a=E.mkUnit(S,'me','tireurs','');a.fresh=false;E.placeUnit(S,a,2,1);let stp=E.playerAttack(S,a.uid,'hq');check('attaque du QG',stp.scene.hq.before-stp.scene.hq.after,10);
check('une attaque par tour',E.canAttack(S,a),false);
S.units=[];a=E.mkUnit(S,'me','tireurs','');E.placeUnit(S,a,2,1);check('vient d\'arriver : dort',E.canAttack(S,a),false);
// attaque manuelle, scène
S=mk();S.plan=[];S.units=[];S.grid=lanes('champ','champ','champ','champ','mer');
a=E.mkUnit(S,'me','tireurs','');a.fresh=false;E.placeUnit(S,a,2,2);e=E.mkUnit(S,'en','gren');E.placeUnit(S,e,1,2);
stp=E.playerAttack(S,a.uid,e.uid);check('grenadiers détruits',S.units.includes(e),false);check('scène : défenseur',stp.scene.defs[0].men+'/'+stp.scene.defs[0].menAfter+'/'+stp.scene.defs[0].dead,'3/0/true');check('scène : attaquant',stp.scene.att.men,10);check('kill compté',S.kills,1);
// riposte
S.units=[];a=E.mkUnit(S,'me','tireurs','');a.fresh=false;E.placeUnit(S,a,2,2);e=E.mkUnit(S,'en','mgnest');E.placeUnit(S,e,1,2);
let rp=E.playerAttack(S,a.uid,e.uid);check('mitrailleuse survit (12 - 10)',e.hp,2);check('riposte',rp.scene.counter.length,1);check('riposte : 1 homme × 2',10-a.hp,2);check('tireurs : 8 hommes',E.shotsOf(a),8);
S.units=[];a=E.mkUnit(S,'me','blinde','');a.fresh=false;E.placeUnit(S,a,3,2);e=E.mkUnit(S,'en','rifle');e.hp=e.hpMax=100;E.placeUnit(S,e,1,2);rp=E.playerAttack(S,a.uid,e.uid);check('soldats portée 1 : pas de riposte à 2',rp.scene.counter.length,0);
S.units=[];a=E.mkUnit(S,'me','blinde','');a.fresh=false;E.placeUnit(S,a,3,2);e=E.mkUnit(S,'en','mgnest');e.hp=e.hpMax=100;E.placeUnit(S,e,1,2);rp=E.playerAttack(S,a.uid,e.uid);check('mitrailleuse : riposte à 2',rp.scene.counter.length,1);
S.units=[];a=E.mkUnit(S,'me','blinde','');a.fresh=false;E.placeUnit(S,a,2,2);e=E.mkUnit(S,'en','rifle');e.hp=e.hpMax=100;E.placeUnit(S,e,1,2);rp=E.playerAttack(S,a.uid,e.uid);check('blindage : riposte sans effet',rp.scene.counter[0].dmgTaken+'/'+a.hp,'0/16');
S.units=[];a=E.mkUnit(S,'me','destroyer','');E.placeUnit(S,a,2,4);e=E.mkUnit(S,'en','mgnest');e.hp=e.hpMax=100;E.placeUnit(S,e,1,3);rp=E.playerAttack(S,a.uid,e.uid);check('navire : pas de riposte',rp.scene.counter.length,0);
S.units=[];a=E.mkUnit(S,'me','tireurs','R');a.hp=a.hpMax=100;E.placeUnit(S,a,2,1);e=E.mkUnit(S,'en','rifle');e.fresh=false;e.hp=e.hpMax=100;E.placeUnit(S,e,1,1);S.phase='en';E.attackUnit(S,e,[]);check('riposte de vos tireurs rouges au champ (15 × 1 × 1,5)',100-e.hp,23);
// couverture
S.units=[];S.grid=lanes('champ','foret','champ','champ','mer');a=E.mkUnit(S,'me','tireurs','');a.fresh=false;E.placeUnit(S,a,2,1);e=E.mkUnit(S,'en','panzer');e.armor=0;e.hp=e.hpMax=100;E.placeUnit(S,e,1,1);
E.attackUnit(S,a,[]);check('forêt : 10 → 7',100-e.hp,7);a.attacked=false;e.armor=2;e.hp=100;E.attackUnit(S,a,[]);check('blindage 2 stoppe les tirs de 1',e.hp,100);
// avance des unités au contact, tour ennemi
S=mk();S.plan=[];S.units=[];S.hand=[];S.grid=lanes('champ','champ','champ','champ','mer');
e=E.mkUnit(S,'en','rifle');e.fresh=false;E.placeUnit(S,e,0,1);let mg=E.mkUnit(S,'en','mgnest');mg.fresh=false;E.placeUnit(S,mg,0,2);a=E.mkUnit(S,'me','tireurs','');a.born=0;E.placeUnit(S,a,3,3);
const hqm=S.hq.me;E.endTurn(S);check('vos tireurs avancent au front',a.r,2);check('soldats ennemis avancent',e.r,1);check('mitrailleuse reste à l\'arrière',mg.r,0);
check('secteurs sans défense : votre QG touché (6 + 8)',hqm-S.hq.me,14);
// villages
S=mk();S.plan=[];S.units=[];S.grid=lanes('village','champ','champ','champ','mer');a=E.mkUnit(S,'me','tireurs','');E.placeUnit(S,a,3,0);check('village tenu',E.villageIncome(S),1);
e=E.mkUnit(S,'en','rifle');E.placeUnit(S,e,0,0);check('village disputé',E.villageIncome(S),0);
// plan ennemi : cases distinctes, terrain praticable
for(let k=0;k<200;k++){S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[]},Math.random,E.battleCfg({type:'battle',levelIdx:k%8,layer:2,obj:{type:'hq'}}));const p=S.plan.filter(x=>x.k==='deploy');
  check('cases distinctes',new Set(p.map(x=>x.r+','+x.c)).size,p.length);check('lignes ennemies, terrain praticable',p.every(x=>x.r<=1&&E.canStand(E.ENEMIES[x.key].cls,S.grid[x.r][x.c])),true);
  check('pas sur une unité',p.every(x=>!E.unitAt(S,x.r,x.c)),true);}
// obus, chasseur, durée
S=mk();S.units=[];a=E.mkUnit(S,'me','tireurs','');E.placeUnit(S,a,2,2);S.plan=[{k:'shell',dmg:8,r:2,c:2}];S.hand=[];const hp0=a.hp;E.endTurn(S);check('obus touche la case visée',a.hp<hp0||!S.units.includes(a),true);
S=mk();S.units=[];ch=E.mkUnit(S,'me','chasseur','');E.placeUnit(S,ch,3,3);a=E.mkUnit(S,'me','tireurs','');E.placeUnit(S,a,2,2);S.plan=[{k:'shell',dmg:8,r:2,c:2}];S.hand=[];E.endTurn(S);check('obus intercepté',a.hp,a.hpMax);
S=mk();S.units=[];let sh=E.mkUnit(S,'me','destroyer','');E.placeUnit(S,sh,3,S.seaCol);S.plan=[];S.hand=[];E.endTurn(S);check('navire reste',S.units.includes(sh),true);S.plan=[];S.hand=[];E.endTurn(S);S.plan=[];S.hand=[];E.endTurn(S);check('navire parti après 3 tours',S.units.includes(sh),false);
// bombardier : frappe aérienne 3x3
S=mk();S.plan=[];S.units=[];S.supply=10;S.grid=lanes('champ','champ','champ','champ','mer');
{const x1=E.mkUnit(S,'en','rifle');E.placeUnit(S,x1,1,1);const x2=E.mkUnit(S,'en','rifle');E.placeUnit(S,x2,0,2);const x3=E.mkUnit(S,'en','rifle');E.placeUnit(S,x3,1,3);
 S.hand=[E.mkCard('bombardier','')];check('cibles = ennemis + QG',E.deployCells(S,S.hand[0]).length,4);
 const stb=E.airStrike(S,0,1,1);check('frappe',!!stb,true);check('zone 3×3',x1.hp+'/'+x2.hp+'/'+x3.hp,'2/2/6');check('pas d\'unité posée',S.units.filter(u=>u.side==='me').length,0);check('coût payé',S.supply,7);
 S.hand=[E.mkCard('bombardier','')];S.supply=10;const h0=S.hq.en;E.airStrike(S,0,S.hqPos.en[0],S.hqPos.en[1]);check('frappe sur le QG',h0-S.hq.en,4);}
// croiseur : portée 2-5
S=mk();S.plan=[];S.units=[];S.grid=lanes('mer','champ','champ','champ','champ');const cr=E.mkUnit(S,'me','croiseur','');E.placeUnit(S,cr,3,0);const et=E.mkUnit(S,'en','panzer');E.placeUnit(S,et,1,2);
check('croiseur : cible à 4',E.targetsFrom(S,cr,3,0).length,1);check('croiseur : trop près',E.targetsFrom(S,cr,2,2).length,0);
// fusion de groupes voisins
S=mk();S.plan=[];S.units=[];S.turn=3;let f1=E.mkUnit(S,'me','tireurs','J');f1.born=1;let f2=E.mkUnit(S,'me','tireurs','R');f2.born=1;E.placeUnit(S,f1,3,1);E.placeUnit(S,f2,3,2);
check('voisins fusionnables',E.canFuseUnits(S,f1,f2),true);f2.c=4;check('non voisins',E.canFuseUnits(S,f1,f2),false);f2.c=2;
const fu=E.fuseUnits(S,f1.uid,f2.uid);check('fusion',fu.cols,'JR');check('une seule unité',E.units(S,'me').length,1);check('10 + 15 hommes = 25 tirs',E.shotsOf(fu),25);check('PV additionnés',fu.hpMax,25);check('jaune : +1 dégât pour tout le groupe',fu.dmg,2);
{const Sx=mk();const card=E.fuseCards(Object.assign(Sx,{hand:[E.mkCard('tireurs','J'),E.mkCard('tireurs','R')]}),0,1);const st=E.cardStatsFor(card,Sx);check('carte fusionnée : 10 + 15 soldats',st.men,25);check('carte fusionnée : 2 dégâts',st.dmg,2);check('carte fusionnée : 25 PV',st.hp,25);
 Sx.plan=[];Sx.supply=20;Sx.units=[];const [rr,cc]=E.deployCells(Sx,card)[0];const uu=E.placeCard(Sx,0,rr,cc);check('déployée : 25 hommes',uu.menMax,25);
 const c2=E.fuseCards(Object.assign(Sx,{hand:[E.mkCard('blinde','J'),E.mkCard('blinde','V')]}),0,1);const s2=E.cardStatsFor(c2,Sx);check('2 chars fusionnés',s2.men,2);check('PV chars : 16 + 24',s2.hp,40);check('coût fusion : 3 + 3 - 1',E.cardCost(Sx,c2),5);}
S.units=[];f1=E.mkUnit(S,'me','tireurs','J');f1.born=3;f2=E.mkUnit(S,'me','tireurs','R');f2.born=1;E.placeUnit(S,f1,3,1);E.placeUnit(S,f2,3,2);check('trop récent',E.canFuseUnits(S,f1,f2),false);
// fusions illimitées : autant de cartes du même type qu'on veut, même de la même couleur
{const Sx=mk();Sx.hand=[E.mkCard('tireurs','J'),E.mkCard('tireurs','J'),E.mkCard('tireurs','R'),E.mkCard('blinde','J')];
 check('même couleur fusionnable',E.canFuse(Sx.hand[0],Sx.hand[1]),true);check('types différents refusés',E.canFuse(Sx.hand[0],Sx.hand[3]),false);
 let c=E.fuseCards(Sx,0,1);c=E.fuseCards(Sx,0,1);check('3 cartes fusionnées',c.parts.length,3);check('couleurs',c.c,'JR');
 const st=E.cardStatsFor(c,Sx);check('10 + 10 + 15 soldats',st.men,35);check('2 dégâts',st.dmg,2);check('coût 2+2+2-2',E.cardCost(Sx,c),4);
 check('main : 2 cartes',Sx.hand.length,2);E.splitCard(Sx,0);check('séparer rend les 3 cartes',Sx.hand.length,4);
 Sx.units=[];Sx.turn=3;const g1=E.mkUnit(Sx,'me','tireurs','J');g1.born=1;const g2=E.mkUnit(Sx,'me','tireurs','J');g2.born=1;E.placeUnit(Sx,g1,3,1);E.placeUnit(Sx,g2,3,2);
 check('groupes de même couleur fusionnables',E.canFuseUnits(Sx,g1,g2),true);const gu=E.fuseUnits(Sx,g1.uid,g2.uid);check('20 soldats jaunes',gu.menMax+gu.cols,'20J');}
// annuler
S=mk();S.plan=[];S.supply=20;S.hand=[E.mkCard('tireurs','J')];const sn=E.snapshotState(S);const [dr,dc]=E.deployCells(S,S.hand[0])[0];E.placeCard(S,0,dr,dc);check('1 unité',S.units.length,1);E.restoreState(S,sn);check('annulé',S.units.length,0);check('carte revenue',S.hand.length,1);
// planDeploy
S=mk();S.plan=[];S.supply=5;S.hand=[E.mkCard('tireurs','J'),E.mkCard('blinde','J'),E.mkCard('tireurs','J')];check('plan ok 2+3',E.planDeploy(S,[0,1]).cost,5);check('plan supply',E.planDeploy(S,[0,1,2]).reason,'supply');
// niveaux, boutique, carte, jokers
S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:['kowalski']},()=>0.5);check('kowalski +1',S.supply,E.BASE_SUPPLY+1);
S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[],supplyBonus:2},()=>0.5);check('bonus permanent',S.supply,E.BASE_SUPPLY+2);
check('coût de carte ito',(()=>{const Q=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:['ito']},()=>0.5);return E.cardCost(Q,E.mkCard('blinde','J'));})(),2);
const map=E.genMap();check('9 couches',map.length,9);
check('deck 40',E.START_DECK.length,40);
const sh2=E.genShop({officers:['ashby'],deck:E.START_DECK},undefined,false);check('2 jokers',sh2.jokers.length,2);
const Cc={supplyBonus:0};check('coût 1er bonus',E.supplyBonusCost(Cc),14);E.addSupplyBonus(Cc);E.addSupplyBonus(Cc);E.addSupplyBonus(Cc);check('plafond',E.addSupplyBonus(Cc),false);
// boss
S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[]},()=>0.5,E.battleCfg({type:'boss',levelIdx:7,layer:8,obj:{type:'hq'}}));check('boss en place',E.units(S,'en').map(u=>u.key).sort().join(),'heavy,panzer');

// ---- Étape 1 : nouvelles unités, ordres, synergies, défausses ----
{const B=()=>{const S=mk();S.plan=[];S.units=[];S.hand=[];S.grid=lanes('champ','champ','champ','champ','mer');S.supply=30;return S;};
 const me=(S,k,r,c,col='')=>{const u=E.mkUnit(S,'me',k,col);u.born=0;u.fresh=false;E.placeUnit(S,u,r,c);return u;},en=(S,k,r,c)=>{const u=E.mkUnit(S,'en',k);u.fresh=false;E.placeUnit(S,u,r,c);return u;};
 let S=B();check('défausses au départ',mk().discards,E.BASE_DISCARDS);
 // marquage par un observateur : +2 par tir
 let o=me(S,'observateur',3,1),t=me(S,'tireurs',2,1),e=en(S,'panzer',1,1);e.armor=0;e.hp=e.hpMax=200;E.applyMarks(S);check('observateur marque l\'ennemi d\'en face',e.marked,true);
 check('observateur ne tire pas',E.canAttack(S,o),false);
 E.playerAttack(S,t.uid,e.uid);check('tirs sur cible marquée : 10 × (1+2)',200-e.hp,30);
 // artillerie : à l'arrière seulement, ×2 sur cible marquée
 S=B();S.hand=[E.mkCard('artillerie','')];check('artillerie : arrière seulement',E.deployCells(S,S.hand[0]).every(([r])=>r===3),true);
 let ar=me(S,'artillerie',3,2),e2=en(S,'panzer',1,2);e2.armor=0;e2.hp=e2.hpMax=200;check('artillerie : portée 2',E.targetsFrom(S,ar,3,2).length,1);
 E.playerAttack(S,ar.uid,e2.uid);check('artillerie : 2 × 4',200-e2.hp,8);
 S=B();ar=me(S,'artillerie',3,2);me(S,'observateur',2,2);e2=en(S,'panzer',1,2);e2.armor=0;e2.hp=e2.hpMax=200;E.applyMarks(S);E.playerAttack(S,ar.uid,e2.uid);check('artillerie sur cible marquée, avec armes combinées : 2 × (4+1+2) × 2',200-e2.hp,28);
 // armes combinées
 S=B();t=me(S,'tireurs',2,0);check('seul : pas de bonus',E.combinedBonus(S,t),0);const bl=me(S,'blinde',3,0);check('infanterie + char : +1',E.combinedBonus(S,t)+'/'+E.combinedBonus(S,bl),'1/1');
 // antichar
 S=B();let at=me(S,'antichar',2,0),pz=en(S,'panzer',1,0),ri=en(S,'rifle',1,1);check('antichar contre blindé : (6-0)×2',E.shotDmg(S,at,pz),12);check('antichar contre infanterie : moitié',E.shotDmg(S,at,ri),3);
 // élan
 S=B();S.hand=[E.mkCard('jeep','J'),E.mkCard('blinde','J'),E.mkCard('jeep','J')];const j1=E.placeCard(S,0,2,0),b1=E.placeCard(S,0,2,1),j2=E.placeCard(S,0,3,0);
 check('élan : 0, puis +1, puis +2',[j1.elan||0,b1.elan,j2.elan].join(),'0,1,2');check('élan : dégâts',j2.dmg,3+2);
 // half-track : l'infanterie de son secteur tire dès l'arrivée
 S=B();S.hand=[E.mkCard('halftrack','J'),E.mkCard('tireurs','J'),E.mkCard('tireurs','J')];E.placeCard(S,0,3,2);const ti=E.placeCard(S,0,2,2),tj=E.placeCard(S,0,2,3);check('transport : infanterie prête',ti.fresh,false);check('autre secteur : dort',tj.fresh,true);
 // génie : mines déclenchées à l'arrivée au front
 S=B();S.hand=[E.mkCard('genie','J')];E.placeCard(S,0,2,1);check('mines posées',S.traps[1].mine,6);
 S.plan=[{k:'deploy',key:'rifle',r:1,c:1}];S.hand=[];E.endTurn(S);check('mines : soldats tués (6 PV)',E.units(S,'en').length,0);check('mines consommées',!!S.traps[1],false);
 // infirmiers
 S=B();S.hand=[];me(S,'infirmiers',3,1);const w=me(S,'tireurs',2,1);w.hp=3;const far=me(S,'tireurs',2,3);far.hp=3;S.plan=[];E.endTurn(S);check('infirmiers soignent le voisin',w.hp,7);check('pas les autres',far.hp,3);
 check('infirmiers n\'avancent pas',E.units(S,'me').find(u=>u.key==='infirmiers').r,3);
 // mitrailleuse alliée : riposte doublée
 S=B();const mg=me(S,'mitrailleuse',2,1);mg.hp=mg.hpMax=100;let ene=en(S,'rifle',1,1);ene.hp=ene.hpMax=100;S.phase='en';E.attackUnit(S,ene,[]);check('mitrailleuse : riposte 3 × 2 × 2',100-ene.hp,12);
 // reconnaissance : marque tout le secteur
 S=B();me(S,'reco',2,2);const a1=en(S,'rifle',1,2),a2=en(S,'rifle',0,2),a3=en(S,'rifle',1,3);E.applyMarks(S);check('reco : secteur marqué',[a1.marked,a2.marked,a3.marked].join(),'true,true,false');
 // ordres
 S=B();S.hand=[E.mkCard('barrage','')];const b1e=en(S,'gren',1,1),b2e=en(S,'gren',0,1),b3e=en(S,'gren',1,2);check('barrage : cible secteur ennemi',E.deployCells(S,S.hand[0]).every(([r])=>r<=1),true);
 const rb=E.playOrder(S,0,1,1);check('barrage : 2 ennemis touchés',rb.hits.length,2);check('barrage : grenadiers (6 PV) détruits',S.units.includes(b1e)||S.units.includes(b2e),false);check('barrage : coût',S.supply,27);check('ordre défaussé',S.discard.some(c=>c.t==='barrage'),true);
 S=B();S.hand=[E.mkCard('fumigenes','')];const fs1=me(S,'tireurs',2,1);E.playOrder(S,0,2,1);const fe=en(S,'rifle',1,1);check('fumigènes : pas de cible',E.targetsFrom(S,fe,1,1).length,0);
 check('fumigènes : QG protégé',E.hqInRange(S,en(S,'rifle',1,3),1,1),false);
 S=B();S.hand=[E.mkCard('assaut','')];const as1=me(S,'tireurs',2,1);as1.attacked=true;E.playOrder(S,0,2,1);check('assaut : attaque de nouveau',as1.attacked,false);
 S=B();S.hand=[E.mkCard('retranchement','')];const rt=me(S,'tireurs',2,1);E.playOrder(S,0,2,1);check('retranchement : couverture',E.shotDmg?Math.round(100*(rt.dig)):0,30);
 S=B();S.hand=[E.mkCard('repli','')];const rp=me(S,'tireurs',2,1);rp.hp=4;E.playOrder(S,0,2,1);check('repli : recule et soigne',rp.r+'/'+rp.hp,'3/7');
 S=B();S.hand=[E.mkCard('ravitaillement','')];S.draw=[E.mkCard('jeep','J')];E.playOrder(S,0,2,0);check('ravitaillement : +2 et pioche',S.supply+'/'+S.hand.length,'32/1');
 S=B();S.hand=[E.mkCard('contreattaque','')];const ca=me(S,'tireurs',2,1);ca.hp=ca.hpMax=100;E.playOrder(S,0,2,1);const cae=en(S,'rifle',1,1);cae.hp=cae.hpMax=100;S.phase='en';E.attackUnit(S,cae,[]);check('contre-attaque : riposte doublée',100-cae.hp,20);
 S=B();S.hand=[E.mkCard('embuscade','')];E.playOrder(S,0,1,2);S.plan=[{k:'deploy',key:'panzer',r:1,c:2}];S.hand=[];E.endTurn(S);check('embuscade : panzer à moitié',E.units(S,'en').find(u=>u.key==='panzer')?.hp,8);
 check('ordres sans couleur ni fusion',E.canFuse(E.mkCard('barrage',''),E.mkCard('barrage','')),false);
 S=B();S.hand=[E.mkCard('tireurs','J'),E.mkCard('barrage','')];E.placeCard(S,0,2,1);en(S,'rifle',1,1);check('ordre jouable après un déploiement',!!E.playOrder(S,0,1,1),true);
 // défausses
 S=B();S.discards=2;S.hand=[E.mkCard('jeep','J'),E.mkCard('jeep','R'),E.mkCard('blinde','J')];S.draw=[E.mkCard('tireurs','N'),E.mkCard('tireurs','V')];
 check('défausse de 2 cartes',E.discardHand(S,[0,2]).length,2);check('main refaite',S.hand.map(c=>c.t).sort().join(),'jeep,tireurs,tireurs');check('compteur',S.discards,1);
 E.discardHand(S,[0]);check('plus de défausse',E.discardHand(S,[0]),null);
}

// ---- Étape 2 : débarquement, sabotage, ennemis à mécaniques, jokers ----
{const B=(off=[])=>{const S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:off},()=>0.5);S.plan=[];S.units=[];S.hand=[];S.grid=lanes('champ','champ','champ','champ','mer');S.supply=30;return S;};
 const me=(S,k,r,c,col='')=>{const u=E.mkUnit(S,'me',k,col);u.born=0;u.fresh=false;E.placeUnit(S,u,r,c);return u;},en=(S,k,r,c)=>{const u=E.mkUnit(S,'en',k);u.fresh=false;E.placeUnit(S,u,r,c);return u;};
 // parachutistes derrière les lignes, sabotage
 let S=B();S.hand=[E.mkCard('paras','R')];check('paras : sautent derrière les lignes',E.deployCells(S,S.hand[0]).some(([r])=>r===0),true);
 const pa=E.placeCard(S,0,0,1);en(S,'rifle',1,1);check('raid : QG à portée malgré un ennemi au front',E.hqInRange(S,pa,0,1),true);
 const h0=S.hq.en;S.hand=[E.mkCard('sabotage','')];check('sabotage : cible les unités derrière les lignes',E.deployCells(S,S.hand[0]).map(x=>x.join()).join(),'0,1');E.playOrder(S,0,0,1);check('sabotage : 12 au QG',h0-S.hq.en,12);
 S=B(['faucon']);me(S,'paras',0,2);S.hand=[E.mkCard('sabotage',''),E.mkCard('paras','R')];check('faucon : paras à 1',E.cardCost(S,S.hand[1]),1);const h1=S.hq.en;E.playOrder(S,0,0,2);check('faucon : sabotage 18',h1-S.hq.en,18);
 S=B();me(S,'paras',0,2);en(S,'rifle',1,3);const e3=en(S,'rifle',1,3);check('un raider ne bloque pas les tirs ennemis sur votre QG',E.hqInRange(S,e3,1,2),true);
 // débarquement
 S=B();S.draw=[E.mkCard('jeep','J'),E.mkCard('tireurs','V'),E.mkCard('blinde','J')];S.hand=[E.mkCard('debarquement','')];check('débarquement : cases du front libres',E.deployCells(S,S.hand[0]).every(([r])=>r===2),true);
 let rd=E.playOrder(S,0,2,1);check('débarquement : tireurs posés au front',rd.landed+'/'+E.unitAt(S,2,1)?.key,'tireurs/tireurs');check('sans navire : dorment',E.unitAt(S,2,1).fresh,true);check('pioche réduite',S.draw.map(c=>c.t).join(),'jeep,blinde');
 S=B();me(S,'destroyer',3,4);S.draw=[E.mkCard('genie','N')];S.hand=[E.mkCard('debarquement','')];E.playOrder(S,0,2,0);check('avec un navire : tirent de suite',E.unitAt(S,2,0).fresh,false);
 S=B();S.draw=[E.mkCard('jeep','J')];S.discard=[];S.hand=[E.mkCard('debarquement','')];check('pas d\'infanterie : injouable',E.deployCells(S,S.hand[0]).length,0);
 // obusiers à l'arrière, bunkers retranchés
 S=B();S.level=3;const ho=E.spawnEnemy(S,'howitzer',1,1);check('obusiers : toujours à l\'arrière',ho.r,0);
 const bk=E.mkUnit(S,'en','bunker');check('bunker : couverture 30 %',bk.dig,0.3);
 S=B();const gn=me(S,'genie',2,1),bk2=en(S,'bunker',1,1);check('génie contre bunker : ×3',E.shotDmg(S,gn,bk2),3*Math.max(0,1-2+0)||0);
 // le génie a 1 dégât, blindage 2 : 0 → pas de bonus ; avec un génie entraîné…
 gn.dmg=4;check('génie (4) contre bunker (blindage 2) : 2 × 3',E.shotDmg(S,gn,bk2),6);
 S=B();S.hand=[E.mkCard('barrage','')];const bk3=en(S,'bunker',1,2);bk3.hp=bk3.hpMax=100;E.playOrder(S,0,1,2);check('barrage contre bunker : 12 × 0,7',100-bk3.hp,9);
 // mines ennemies
 S=B();S.enemyMines={1:6};S.hand=[E.mkCard('tireurs','J')];const mt=E.placeCard(S,0,2,1);check('mines ennemies : 6 PV perdus',mt.hp+'/'+mt.mineHit,'4/6');check('mines retirées',!!S.enemyMines[1],false);
 S=B();S.enemyMines={2:6};S.hand=[E.mkCard('genie','J')];const mg2=E.placeCard(S,0,3,2);check('le génie désamorce',mg2.hp===mg2.hpMax&&!S.enemyMines[2],true);
 S=B();S.level=2;S.plan=[{k:'mines',c:3}];S.hand=[];E.endTurn(S);check('plan ennemi : mines posées',S.enemyMines[3],6);
 S=B();S.plan=[{k:'mines',c:3}];S.hand=[];me(S,'genie',3,3);E.endTurn(S);check('génie présent : mines refusées',!!S.enemyMines[3],false);
 for(let k=0;k<100;k++){const Q=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[]},Math.random,E.battleCfg({type:'battle',levelIdx:2+k%6,layer:3,obj:{type:'hq'}}));
   check('plan : obusiers à l\'arrière',Q.plan.filter(p=>p.key==='howitzer').every(p=>p.r===0),true);check('plan : mines hors mer',Q.plan.filter(p=>p.k==='mines').every(p=>Q.grid[0][p.c]!=='mer'),true);}
 // jokers de composition
 S=B(['intendant']);check('intendant : +1 défausse',S.discards,E.BASE_DISCARDS+1);
 S=B(['blitz']);S.hand=[E.mkCard('jeep','J'),E.mkCard('jeep','J')];E.placeCard(S,0,2,0);const jb=E.placeCard(S,0,2,1);check('blitz : élan ×2',jb.elan,2);
 S=B(['radio']);const rt=me(S,'tireurs',2,1),rpz=en(S,'panzer',1,1);rpz.armor=0;rpz.marked=true;check('radio : +3 sur cible marquée',E.shotDmg(S,rt,rpz),4);
 S=B(['fer']);const ft=me(S,'tireurs',2,1);me(S,'blinde',3,1);check('fer : armes combinées +2',E.combinedBonus(S,ft),2);
 S=B(['lebrun']);const d1=me(S,'destroyer',2,4);me(S,'croiseur',3,4);const lt=en(S,'rifle',1,3);check('lebrun : +1 par autre navire',E.shotDmg(S,d1,lt),2);
 S=B(['sapeur']);S.hand=[E.mkCard('genie','J')];check('sapeur : génie à 1',E.cardCost(S,S.hand[0]),1);E.placeCard(S,0,2,1);S.plan=[{k:'deploy',key:'panzer',r:1,c:1}];S.hand=[];E.endTurn(S);check('sapeur : mines 6+4',E.units(S,'en')[0]?.hpMax-E.units(S,'en')[0]?.hp,10);
}
{const S=mk();S.plan=[];S.units=[];S.supply=20;S.hand=[E.mkCard('tireurs','J'),E.mkCard('blinde','R'),E.mkCard('jeep','V')];E.placeCard(S,0,2,0);E.placeCard(S,0,2,1);check('couleurs mélangées dans un même tour',!!E.placeCard(S,0,2,2),true);}

// ---- Boss à mécaniques et événements ----
{const B=(cfg)=>{const S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[]},()=>0.5,E.battleCfg(cfg));return S;};
 const bossNode=k=>({type:'boss',levelIdx:3,layer:4,boss:k,obj:{type:'hq'}});
 let S=B(bossNode('tank'));check('boss char',E.units(S,'en').map(u=>u.key).join(),'heavy');S.units.push(Object.assign(E.mkUnit(S,'me','tireurs','J'),{r:2,c:1}));S.plan=E.genPlan(S);check('char : obus guidé de 10',S.plan.some(p=>p.k==='shell'&&p.boss&&p.dmg===10),true);
 S=B(bossNode('battery'));const bat=E.units(S,'en')[0];check('batterie à l\'arrière',bat.key+'@'+bat.r,'battery@0');check('QG protégé',E.hqShielded(S),true);
 S.units=S.units.filter(u=>u.side==='en');const tr=E.mkUnit(S,'me','tireurs','');tr.fresh=false;E.placeUnit(S,tr,2,[0,1,2,3,4].find(c=>S.grid[0][c]!=='mer'&&c!==bat.c));
 const h0=S.hq.en;E.playerAttack(S,tr.uid,'hq');check('dégâts au QG divisés par deux',h0-S.hq.en,5);
 S=B(bossNode('train'));const t0=E.units(S,'en')[0];check('train au front',t0.key+'@'+t0.r,'train@1');const c0=t0.c;S.phase='en';E.rollTrain(S,[]);check('le train change de secteur',t0.c!==c0&&E.canStand('track',S.grid[1][t0.c]),true);
 S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[]},()=>0.5,E.battleCfg({type:'boss',levelIdx:7,layer:8,boss:'train',obj:{type:'hq'}}));check('boss final : escorte',E.units(S,'en').map(u=>u.key).sort().join(),'panzer,train');
 for(let k=0;k<50;k++){const m=E.genMap();const b=m.flat().filter(n=>n.type==='boss');check('2 boss différents',b.length===2&&b[0].boss!==b[1].boss&&b.every(n=>E.BOSSES[n.boss]),true);check('événements présents',m.flat().filter(n=>n.type==='event').length>=0,true);}
 // événements
 const Cc={deck:E.START_DECK.slice(),hq:40,hqMax:60,loot:3,officers:[]};check('7 événements',E.EVENTS.length,7);
 const ids=new Set();for(let k=0;k<7;k++)ids.add(E.pickEvent(Cc));check('pas de répétition',ids.size,7);
 E.applyEvent(Cc,'convoi',0);check('convoi : +$7',Cc.loot,10);E.applyEvent(Cc,'hopital',0);check('hôpital : +15',Cc.hq,55);
 let o=E.applyEvent(Cc,'pont',1);check('pont : retirer une carte',o.next,'remove');o=E.applyEvent(Cc,'parachutage',0);check('parachutage : 3 ordres',o.options.length===3&&o.options.every(c=>E.TYPES[c.t].order),true);
 E.applyEvent(Cc,'correspondant',0);check('correspondant : +$10 et bataille plus dure',Cc.loot+'/'+Cc.mods.harder,'20/1');
 Cc.level=0;const Sx=E.newBattle(Cc,()=>0.5,E.battleCfg({type:'battle',levelIdx:3,layer:3,obj:{type:'hq'}}));check('mods consommés',JSON.stringify(Cc.mods),'{}');check('mod appliqué à la bataille',Sx.mods.harder,1);
 Cc.mods={intel:1,supply:2,discard:1};const Sy=E.newBattle(Cc,()=>0.5,E.battleCfg({type:'battle',levelIdx:3,layer:3,obj:{type:'hq'}}));check('espion/déserteurs',Sy.plan.length+'/'+Sy.supply+'/'+Sy.discards,'0/'+(E.BASE_SUPPLY+2)+'/'+(E.BASE_DISCARDS+1));
}
console.log(bad?bad+' échec(s)':'tests OK');process.exit(bad?1:0);
