// Vérifie le moteur : secteurs et terrains, terrains forts/faibles des couleurs, portées, QG, avance, couverture, villages, fusions, règle des couleurs, plan ennemi, jokers, boutique (node test_core.js)
const fs=require('fs');
const core=fs.readFileSync(process.argv[2]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
const E=new Function(core+';return {lootFor,genShop,upgradeCost,canUpgrade,cardPrice,upText,JOKERS,MAX_JOKERS,UP,newBattle,endTurn,TYPES,ENEMIES,START_DECK,fuseCards,splitCard,canFuse,canFuseUnits,fuseUnits,cardStatsFor,snapshotState,restoreState,planDeploy,placeCard,deployCells,advance,terrainMult,canStand,COLOR_TERRAIN,villageIncome,unitAt,units,findUnit,mkUnit,placeUnit,spawnEnemy,genTerrain,genPlan,colorsReachable,selectionValid,airStrike,genMap,battleCfg,mkCard,statsFor,LEVELS,shotsOf,rewardCards,cardCost,shuffle,HQ_START,GW,GH,TERRAIN,addSupplyBonus,supplyBonusCost,MAX_SUPPLY_BONUS,BASE_SUPPLY,attackUnit,playerAttack,canAttack,attackOptions,targetsFrom,hqInRange,isLandCell,playOrder,discardHand,applyMarks,shotDmg,combinedBonus,isOrder,BASE_DISCARDS,springTrap};')();
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
 const or={t:'tireurs',c:'JR',parts:[1,2]},vn={t:'jeep',c:'VN',parts:[1,2]};
 check('deux fusions + jaune + vert',E.selectionValid([or,vn,{t:'blinde',c:'J'},{t:'blinde',c:'V'}]),true);check('noir hors fusion orange',E.selectionValid([or,{t:'blinde',c:'N'}]),false);
 Sx.units=[];Sx.turn=3;const g1=E.mkUnit(Sx,'me','tireurs','J');g1.born=1;const g2=E.mkUnit(Sx,'me','tireurs','J');g2.born=1;E.placeUnit(Sx,g1,3,1);E.placeUnit(Sx,g2,3,2);
 check('groupes de même couleur fusionnables',E.canFuseUnits(Sx,g1,g2),true);const gu=E.fuseUnits(Sx,g1.uid,g2.uid);check('20 soldats jaunes',gu.menMax+gu.cols,'20J');}
// annuler
S=mk();S.plan=[];S.supply=20;S.hand=[E.mkCard('tireurs','J')];const sn=E.snapshotState(S);const [dr,dc]=E.deployCells(S,S.hand[0])[0];E.placeCard(S,0,dr,dc);check('1 unité',S.units.length,1);E.restoreState(S,sn);check('annulé',S.units.length,0);check('carte revenue',S.hand.length,1);
// règle des couleurs
const mkc=(t,c)=>({t,c}),orange=t=>({t,c:'JR',parts:[1,2]});
check('jaune seul',E.selectionValid([mkc('tireurs','J'),mkc('blinde','J')]),true);check('jaune+rouge refusé',E.selectionValid([mkc('tireurs','J'),mkc('blinde','R')]),false);
check('orange+jaune+rouge',E.selectionValid([orange('tireurs'),mkc('blinde','J'),mkc('jeep','R')]),true);check('orange+vert refusé',E.selectionValid([orange('tireurs'),mkc('blinde','V')]),false);
check('atteignable par fusion',E.colorsReachable([mkc('tireurs','J'),mkc('tireurs','R')]),true);
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
 S=B();S.hand=[E.mkCard('tireurs','J'),E.mkCard('barrage','')];E.placeCard(S,0,2,1);en(S,'rifle',1,1);check('ordre jouable malgré la règle des couleurs',!!E.playOrder(S,0,1,1),true);
 // défausses
 S=B();S.discards=2;S.hand=[E.mkCard('jeep','J'),E.mkCard('jeep','R'),E.mkCard('blinde','J')];S.draw=[E.mkCard('tireurs','N'),E.mkCard('tireurs','V')];
 check('défausse de 2 cartes',E.discardHand(S,[0,2]).length,2);check('main refaite',S.hand.map(c=>c.t).sort().join(),'jeep,tireurs,tireurs');check('compteur',S.discards,1);
 E.discardHand(S,[0]);check('plus de défausse',E.discardHand(S,[0]),null);
}
console.log(bad?bad+' échec(s)':'tests OK');process.exit(bad?1:0);
