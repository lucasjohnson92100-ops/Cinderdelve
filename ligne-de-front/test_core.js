// Vérifie le moteur : grille et terrains, déplacements payés en ravitaillement, portées, couverture, villages, fusions, règle des couleurs, plan ennemi, jokers, boutique (node test_core.js)
const fs=require('fs');
const core=fs.readFileSync(process.argv[2]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
const E=new Function(core+';return {lootFor,genShop,upgradeCost,canUpgrade,cardPrice,upText,JOKERS,MAX_JOKERS,UP,newBattle,endTurn,TYPES,ENEMIES,START_DECK,fuseCards,splitCard,canFuse,canFuseUnits,fuseUnits,snapshotState,restoreState,planDeploy,placeCard,deployCells,reachable,moveUnit,unitAt,units,findUnit,mkUnit,placeUnit,spawnEnemy,genTerrain,genPlan,colorsReachable,selectionValid,genMap,battleCfg,mkCard,statsFor,LEVELS,shotsOf,rewardCards,cardCost,shuffle,HQ_START,GW,GH,TERRAIN,terrainCost,addSupplyBonus,supplyBonusCost,MAX_SUPPLY_BONUS,BASE_SUPPLY,attackUnit,playerAttack,canAttack,attackOptions,targetsFrom,hqInRange,bestMove,isLandCell};')();
let bad=0;const check=(n,g,e)=>{if(g!==e){bad++;console.log('ÉCHEC',n,'obtenu',g,'attendu',e);}};
const T=E.TYPES,GW=E.GW,GH=E.GH;
// terrain : propriétés
for(let k=0;k<200;k++){const t=E.genTerrain(Math.random),g=t.grid;
  check('dimensions',g.length+'x'+g[0].length,GH+'x'+GW);
  const flat=g.flat();check('une rivière',flat.includes('riviere')||flat.includes('pont'),true);check('un pont',flat.includes('pont'),true);
  check('villages',flat.filter(x=>x==='village').length>=2,true);
  const sea=g.flat().filter(x=>x==='mer').length;check('mer',sea>=4,true);
  check('ligne 0 sans mer',g[0].every(x=>x!=='mer'),true);check('dernière ligne : au moins 3 cases de terre',g[GH-1].filter(x=>x!=='mer').length>=3,true);
  // connectivité des véhicules : de la dernière ligne à la ligne 0
  const S0={grid:g,units:[]};const u={cls:'track',r:GH-1,c:g[GH-1].findIndex(x=>x==='route'),side:'me'};
  if(u.c>=0){const r=E.reachable(S0,u,99);check('blindé peut traverser',[...r.values()].some(x=>x.r===0),true);}
}
const mk=(o={})=>E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[],...o},()=>0.5);
let S=mk();
check('ravitaillement de base',S.supply,E.BASE_SUPPLY+E.units(S,'me').length*0+Object.values(S.owner).filter(x=>x==='me').length);
check('main de 6',S.hand.length,6);
// déploiement
S=mk();S.plan=[];S.hand=[E.mkCard('tireurs','J'),E.mkCard('destroyer','J'),E.mkCard('chasseur','J'),E.mkCard('paras','J')];S.supply=20;
let cells=E.deployCells(S,S.hand[0]);check('terre : cases de départ',cells.every(([r,c])=>r>=GH-2&&S.grid[r][c]!=='mer'),true);check('terre : au moins 4 cases',cells.length>=4,true);
cells=E.deployCells(S,S.hand[1]);check('navire en mer',cells.length>0&&cells.every(([r,c])=>S.grid[r][c]==='mer'&&r>=GH-3),true);
check('avion partout',E.deployCells(S,S.hand[2]).length,GW*GH);
check('paras loin du QG',E.deployCells(S,S.hand[3]).every(([r])=>r>=2),true);
const [r0,c0]=E.deployCells(S,S.hand[0])[0];
check('placer un groupe',!!E.placeCard(S,0,r0,c0),true);check('coût payé',S.supply,18);check('main -1',S.hand.length,3);
check('case occupée refusée',E.placeCard(S,0,r0,c0),null);
check('hors zone refusé',E.placeCard(S,0,0,0),null);
// déplacement coûte du ravitaillement
S=mk();S.plan=[];S.supply=10;S.units=[];
S.grid=Array.from({length:GH},()=>Array(GW).fill('route'));S.grid[4][2]='foret';S.grid[3][3]='riviere';
let a=E.mkUnit(S,'me','tireurs','J');a.born=0;E.placeUnit(S,a,5,2);
check('foot : (3,2) hors de portée à 2',E.reachable(S,a,2).has('3,2'),false);
check('forêt : (4,2) coûte 2',E.reachable(S,a,2).get('4,2').cost,2);check('(3,2) coûte 3',E.reachable(S,a,3).get('3,2').cost,3);
check('moveUnit coût',E.moveUnit(S,a.uid,4,1),2);check('ravitaillement -2',S.supply,8);check('mvLeft 0',a.mvLeft,0);check('plus de mouvement',E.moveUnit(S,a.uid,3,1),null);
let jp=E.mkUnit(S,'me','jeep','J');E.placeUnit(S,jp,6,0);check('jeep ne passe pas la rivière',E.reachable(S,jp,9).has('3,3'),false);check('infanterie gué',E.reachable(S,a,3).has('3,3'),false);
S.units=[];a=E.mkUnit(S,'me','tireurs','J');E.placeUnit(S,a,4,3);a.mvLeft=3;check('infanterie traverse la rivière (coût 3)',E.reachable(S,a,3).has('3,3'),true);
// sans ravitaillement
S.supply=1;S.units=[];a=E.mkUnit(S,'me','tireurs','J');E.placeUnit(S,a,5,2);check('1 de ravitaillement : 1 pas',E.reachable(S,a,Math.min(a.mvLeft,S.supply)).size,4);
// blocage par un ennemi
S.units=[];S.supply=9;a=E.mkUnit(S,'me','jeep','J');E.placeUnit(S,a,5,2);let e=E.mkUnit(S,'en','rifle');E.placeUnit(S,e,4,2);
check('ennemi bloque',E.reachable(S,a,4).has('3,2'),true);// contournement possible par les côtés
S.grid[4][1]='riviere';S.grid[4][3]='riviere';check('ennemi + rivières bloquent',E.reachable(S,a,4).has('3,2'),false);
// mer : navire
S=mk();S.units=[];let sh=E.mkUnit(S,'me','destroyer','J');const seaR=[...Array(GH).keys()].find(r=>S.grid[r][S.seaCol]==='mer'&&r>=GH-2);E.placeUnit(S,sh,GH-1,S.seaCol);
check('navire : uniquement la mer',[...E.reachable(S,sh,9).values()].every(x=>S.grid[x.r][x.c]==='mer'),true);
// portée et attaque
S=mk();S.plan=[];S.grid=Array.from({length:GH},()=>Array(GW).fill('champ'));S.units=[];
a=E.mkUnit(S,'me','tireurs','');a.fresh=false;E.placeUnit(S,a,3,2);e=E.mkUnit(S,'en','rifle');e.fresh=false;E.placeUnit(S,e,2,2);
check('à portée 1',E.targetsFrom(S,a,3,2).length,1);e.r=1;check('hors portée (2)',E.targetsFrom(S,a,3,2).length,0);
let st=[];S.phase='me';e.r=2;E.attackUnit(S,a,st);check('10 tirs de 1 tuent 6 soldats',E.units(S,'en').length,0);check('kill compté',S.kills,1);
// surplus de tirs : pas au QG si pas à portée
check('QG intact',S.hq.en,S.lvl.hq);
// attaque du QG
S=mk();S.plan=[];S.grid=Array.from({length:GH},()=>Array(GW).fill('champ'));S.units=[];a=E.mkUnit(S,'me','tireurs','');a.fresh=false;E.placeUnit(S,a,0,2);
const hq0=S.hq.en;st=[];S.phase='me';E.attackUnit(S,a,st);check('QG touché (10)',hq0-S.hq.en,10);
a.r=1;check('à 2 du QG : pas de portée',E.hqInRange(a,1),false);
// attaque manuelle : le joueur choisit la cible
S=mk();S.plan=[];S.grid=Array.from({length:GH},()=>Array(GW).fill('champ'));S.units=[];
a=E.mkUnit(S,'me','tireurs','');a.fresh=false;E.placeUnit(S,a,3,2);e=E.mkUnit(S,'en','rifle');E.placeUnit(S,e,2,2);let e2b=E.mkUnit(S,'en','gren');E.placeUnit(S,e2b,3,3);
check('2 cibles à portée',E.attackOptions(S,a).units.length,2);check('peut attaquer',E.canAttack(S,a),true);
let stp=E.playerAttack(S,a.uid,e2b.uid);check('attaque réussie',!!stp,true);check('grenadiers détruits',E.units(S,'en').some(x=>x.key==='gren'),false);check('soldats intacts',e.hp,6);
check('scène : défenseur',stp.scene.defs[0].menBefore===undefined&&stp.scene.defs[0].men===3&&stp.scene.defs[0].menAfter===0&&stp.scene.defs[0].dead,true);check('scène : attaquant',stp.scene.att.men,10);
check('une attaque par tour',E.canAttack(S,a),false);check('plus de déplacement après attaque',E.moveUnit(S,a.uid,4,2),null);
check('cible hors portée refusée',E.playerAttack(S,a.uid,e.uid),null);
S.units=[];a=E.mkUnit(S,'me','tireurs','');E.placeUnit(S,a,3,2);e=E.mkUnit(S,'en','rifle');E.placeUnit(S,e,2,2);check('unité qui vient d\'arriver ne peut pas attaquer',E.canAttack(S,a),false);
S.units=[];a=E.mkUnit(S,'me','tireurs','');a.fresh=false;E.placeUnit(S,a,0,2);const hq1=S.hq.en;stp=E.playerAttack(S,a.uid,'hq');check('attaque du QG',hq1-S.hq.en,10);check('scène QG',stp.scene.hq.before-stp.scene.hq.after,10);
S.units=[];a=E.mkUnit(S,'me','tireurs','');a.fresh=false;E.placeUnit(S,a,4,2);check('QG hors de portée',E.playerAttack(S,a.uid,'hq'),null);
S=mk();S.plan=[];S.units=[];a=E.mkUnit(S,'me','tireurs','');a.fresh=false;E.placeUnit(S,a,0,2);S.hand=[];E.endTurn(S);check('fin de tour : plus d\'attaque automatique du joueur',S.hq.en,S.lvl.hq);
S.units=[];S.turn=2;a=E.mkUnit(S,'me','tireurs','');a.fresh=false;a.attacked=true;E.placeUnit(S,a,3,2);S.hand=[];S.plan=[];E.endTurn(S);check('attaque réarmée au tour suivant',a.attacked,false);
// couverture forêt
S=mk();S.plan=[];S.grid=Array.from({length:GH},()=>Array(GW).fill('champ'));S.units=[];
a=E.mkUnit(S,'me','tireurs','');a.fresh=false;E.placeUnit(S,a,3,2);e=E.mkUnit(S,'en','gren');E.placeUnit(S,e,2,2);S.grid[2][2]='foret';
st=[];S.phase='me';E.attackUnit(S,a,st);check('forêt : 10 dégâts -30% = 7 (grenadiers 6 PV : morts)',E.units(S,'en').length,0);
S.units=[];a=E.mkUnit(S,'me','tireurs','');a.fresh=false;E.placeUnit(S,a,3,2);e=E.mkUnit(S,'en','panzer');e.armor=0;e.hp=100;e.hpMax=100;E.placeUnit(S,e,2,2);S.grid[2][2]='foret';
st=[];E.attackUnit(S,a,st);check('forêt : 10 dégâts → 7 PV perdus',100-e.hp,7);
// blindage
S.grid[2][2]='champ';e.hp=100;a.fresh=false;e.armor=2;st=[];E.attackUnit(S,a,st);check('blindage 2 stoppe les tirs de 1',e.hp,100);
// ravitaillement par villages
S=mk();S.units=[];const vk=Object.keys(S.owner).find(k=>S.owner[k]==='');if(vk){const [vr,vc]=vk.split(',').map(Number);a=E.mkUnit(S,'me','tireurs','J');a.born=0;E.placeUnit(S,a,vr,vc);check('village capturé',S.owner[vk],'me');}
S=mk();const own=Object.values(S.owner).filter(x=>x==='me').length;check('revenu des villages',S.supply,E.BASE_SUPPLY+own);
// fusion de groupes voisins
S=mk();S.plan=[];S.units=[];S.turn=3;let f1=E.mkUnit(S,'me','tireurs','J');f1.born=1;let f2=E.mkUnit(S,'me','tireurs','R');f2.born=1;E.placeUnit(S,f1,5,2);E.placeUnit(S,f2,5,3);
check('voisins fusionnables',E.canFuseUnits(S,f1,f2),true);f2.c=5;check('non voisins',E.canFuseUnits(S,f1,f2),false);f2.c=3;
const fu=E.fuseUnits(S,f1.uid,f2.uid);check('fusion',fu.cols,'JR');check('une seule unité',E.units(S,'me').length,1);check('10+5 hommes ×… 15 tirs',E.shotsOf(fu),15);
S.units=[];f1=E.mkUnit(S,'me','tireurs','J');f1.born=3;f2=E.mkUnit(S,'me','tireurs','R');f2.born=1;E.placeUnit(S,f1,5,2);E.placeUnit(S,f2,5,3);check('trop récent',E.canFuseUnits(S,f1,f2),false);
// annuler
S=mk();S.plan=[];S.supply=20;S.hand=[E.mkCard('tireurs','J')];const sn=E.snapshotState(S);const [dr,dc]=E.deployCells(S,S.hand[0])[0];E.placeCard(S,0,dr,dc);check('1 unité',S.units.length,1);E.restoreState(S,sn);check('annulé',S.units.length,0);check('carte revenue',S.hand.length,1);
// règle des couleurs
const mkc=(t,c)=>({t,c}),orange=t=>({t,c:'JR',parts:[1,2]});
check('jaune seul',E.selectionValid([mkc('tireurs','J'),mkc('blinde','J')]),true);check('jaune+rouge refusé',E.selectionValid([mkc('tireurs','J'),mkc('blinde','R')]),false);
check('orange+jaune+rouge',E.selectionValid([orange('tireurs'),mkc('blinde','J'),mkc('jeep','R')]),true);check('orange+vert refusé',E.selectionValid([orange('tireurs'),mkc('blinde','V')]),false);
check('atteignable par fusion',E.colorsReachable([mkc('tireurs','J'),mkc('tireurs','R')]),true);
// planDeploy
S=mk();S.plan=[];S.supply=5;S.hand=[E.mkCard('tireurs','J'),E.mkCard('blinde','J'),E.mkCard('tireurs','J')];check('plan ok 2+3',E.planDeploy(S,[0,1]).cost,5);check('plan supply',E.planDeploy(S,[0,1,2]).reason,'supply');
// tour complet : l'ennemi arrive en haut, avance et tire
S=mk();S.plan=[{k:'deploy',key:'rifle',r:0,c:1}];S.supply=0;S.hand=[];
E.endTurn(S);check('renfort arrivé',E.units(S,'en').length>=1,true);const en=E.units(S,'en')[0];check('arrive sur la ligne 0 ou 1',en.r<=1,true);
const r1=en.r;
for(let k=0;k<2;k++){S.plan=[];S.hand=[];S.supply=0;E.endTurn(S);}
check('l\'ennemi avance',E.units(S,'en').length===0||E.units(S,'en')[0].r>r1,true);
// plan : chaque renfort a une case libre sur la ligne 0
for(let k=0;k<200;k++){S=mk();const p=S.plan.filter(x=>x.k==='deploy');check('cases distinctes',new Set(p.map(x=>x.c)).size,p.length);check('hors mer',p.every(x=>S.grid[0][x.c]!=='mer'),true);}
// obus ciblé sur une case
S=mk();S.plan=[];S.units=[];a=E.mkUnit(S,'me','tireurs','');E.placeUnit(S,a,4,2);S.plan=[{k:'shell',dmg:8,r:4,c:2}];S.hand=[];const hp0=a.hp;E.endTurn(S);check('obus touche la case visée',a.hp<hp0||!S.units.includes(a),true);
S=mk();S.units=[];a=E.mkUnit(S,'me','tireurs','');E.placeUnit(S,a,4,2);S.plan=[{k:'shell',dmg:8,r:4,c:2}];S.hand=[];a.r=5;E.endTurn(S);check('obus esquivé en bougeant',a.hp,a.hpMax);
// chasseur intercepte
S=mk();S.units=[];let ch=E.mkUnit(S,'me','chasseur','');E.placeUnit(S,ch,3,3);a=E.mkUnit(S,'me','tireurs','');E.placeUnit(S,a,5,2);S.plan=[{k:'shell',dmg:8,r:5,c:2}];S.hand=[];E.endTurn(S);check('obus intercepté',a.hp,a.hpMax);
// durée des navires et avions
S=mk();S.units=[];sh=E.mkUnit(S,'me','destroyer','');E.placeUnit(S,sh,GH-1,S.seaCol);S.plan=[];S.hand=[];E.endTurn(S);check('navire reste (ttl 3 -> 2)',S.units.some(u=>u.key==='destroyer'),true);S.plan=[];S.hand=[];E.endTurn(S);S.plan=[];S.hand=[];E.endTurn(S);check('navire parti après 3 tours',S.units.some(u=>u.key==='destroyer'),false);
// bombardier : zone 3x3
S=mk();S.plan=[];S.grid=Array.from({length:GH},()=>Array(GW).fill('champ'));S.units=[];const bb=E.mkUnit(S,'me','bombardier','');bb.fresh=false;E.placeUnit(S,bb,3,3);
const e1=E.mkUnit(S,'en','rifle');E.placeUnit(S,e1,2,2);const e2=E.mkUnit(S,'en','rifle');E.placeUnit(S,e2,4,4);const e3=E.mkUnit(S,'en','rifle');E.placeUnit(S,e3,1,3);
st=[];S.phase='me';E.attackUnit(S,bb,st);check('bombe sur la diagonale',e1.hp,2);check('bombe 2e voisin',e2.hp,2);check('hors zone intact',e3.hp,6);
// croiseur : portée 2-5
S=mk();S.plan=[];S.grid=Array.from({length:GH},()=>Array(GW).fill('champ'));S.units=[];const cr=E.mkUnit(S,'me','croiseur','');E.placeUnit(S,cr,5,0);const et=E.mkUnit(S,'en','panzer');E.placeUnit(S,et,2,1);
check('croiseur : cible à 4',E.targetsFrom(S,cr,5,0).length,1);et.r=5;et.c=1;check('croiseur : trop près',E.targetsFrom(S,cr,5,0).length,0);
// niveaux, boutique, carte, jokers
S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:['kowalski']},()=>0.5);check('kowalski +1',S.supply,E.BASE_SUPPLY+1+Object.values(S.owner).filter(x=>x==='me').length);
S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[],supplyBonus:2},()=>0.5);check('bonus permanent',S.supply,E.BASE_SUPPLY+2+Object.values(S.owner).filter(x=>x==='me').length);
check('coût de carte ito',(()=>{const Q=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:['ito']},()=>0.5);return E.cardCost(Q,E.mkCard('blinde','J'));})(),2);
const map=E.genMap();check('9 couches',map.length,9);
check('deck 40',E.START_DECK.length,40);
const sh2=E.genShop({officers:['ashby'],deck:E.START_DECK},undefined,false);check('2 jokers',sh2.jokers.length,2);
const Cc={supplyBonus:0};check('coût 1er bonus',E.supplyBonusCost(Cc),14);E.addSupplyBonus(Cc);E.addSupplyBonus(Cc);E.addSupplyBonus(Cc);check('plafond',E.addSupplyBonus(Cc),false);
// boss
S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[]},()=>0.5,E.battleCfg({type:'boss',levelIdx:7,layer:8,obj:{type:'hq'}}));check('boss en place',E.units(S,'en').map(u=>u.key).sort().join(),'heavy,panzer');
console.log(bad?bad+' échec(s)':'tests OK');process.exit(bad?1:0);
