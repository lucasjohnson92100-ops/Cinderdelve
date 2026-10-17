// Vérifie le moteur « blinde » : terrains, pose, endurance, Attaque/Défense, combos, frappe commune, riposte, effets du QG, ordres, fusions, campagne (node test_core.js)
const fs=require('fs');
const coreReal=fs.readFileSync(process.argv[2]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
// les tests de mécanique tournent avec des valeurs ennemies simples ; les vraies constantes sont vérifiées à part
const core=coreReal.replace(/ENEMY_GROWTH = [\d.]+, HQ_MULT = [\d.]+, HQ_GROW = [\d.]+, ENEMY_ATK = [\d.]+, ATK_RAMP = [\d.]+,/,'ENEMY_GROWTH = 0, HQ_MULT = 1, HQ_GROW = 1, ENEMY_ATK = 1, ATK_RAMP = 0,');
const NAMES='genTerrain,newBattle,endTurn,TYPES,START_DECK,playGroup,groupSectors,canPlayGroup,previewGroup,groupCost,supportsAt,upgPrice,applyUpgrade,sectorCap,PACKS,packOptions,applyPackPick,genPacks,cardStatsFor,snapshotState,restoreState,placeCard,deployTargets,canDeployNow,terrainMult,COLOR_TERRAIN,units,findUnit,mkUnit,placeUnit,genPlan,airStrike,genMap,ensureMap,anteOf,battleCfg,mkCard,LEVELS,rewardCards,cardCost,HQ_START,GW,TERRAIN,addSupplyBonus,BASE_SUPPLY,playOrder,discardHand,isOrder,BASE_DISCARDS,DISCARD_SUPPLY,MAX_CARRY,queue,supportAt,sectorForecast,sectorCombos,frontForecast,enemyAtk,unitAtk,unitDef,hqTake,MIN_THROUGH,MAX_LAND,landCols,genShop,JOKERS,DOCTRINES,pickDoctrines,BOSSES,HQFX,pickFx,hasFx,mammothWall,EVENTS,applyEvent,BARRAGE_ATK,statsFor';
const E=new Function(core+';return {'+NAMES+'};')();
let bad=0,n=0;const check=(m,g,e)=>{n++;if(g!==e){bad++;console.log('ÉCHEC',m,'obtenu',g,'attendu',e);}};
const GW=E.GW;
// plateau : 5 secteurs, une mer au bord
for(let k=0;k<200;k++){const t=E.genTerrain(Math.random),L=t.lanes;check('5 secteurs',L.length,GW);check('une mer au bord',L.filter(x=>x==='mer').length===1&&(L[0]==='mer'||L[GW-1]==='mer'),true);}
const mk=(o={},cfg)=>E.newBattle({level:0,deck:E.START_DECK.map(c=>({...c})),hq:60,hqMax:60,officers:[],...o},()=>0.5,cfg);
const blank=(lanes,o)=>{const S=mk(o);S.units=[];S.lanes=lanes;S.grid=[lanes.slice()];S.seaCol=lanes.indexOf('mer');S.supply=40;S.hand=[];S.fx=[];S.plan={};delete S.mineCol;return S;};
let S=mk();
check('ravitaillement de base',S.supply,E.BASE_SUPPLY);check('main de 6',S.hand.length,6);check('pas d\'unités ennemies',S.units.length,0);
check('QG ennemi = blinde du niveau',S.hq.en,E.LEVELS[0].hq);
// pose : terrain praticable, 3 unités terrestres et 1 appui par secteur
S=blank(['mer','route','foret','riviere','champ']);
S.hand=[E.mkCard('tireurs','J'),E.mkCard('destroyer','J'),E.mkCard('chasseur','J'),E.mkCard('blinde','J'),E.mkCard('jeep','J')];
const tg=c=>E.deployTargets(S,c).map(x=>x.c).join(',');
check('tireurs : partout sauf la mer',tg(S.hand[0]),'1,2,3,4');check('blindé : ni forêt ni rivière',tg(S.hand[3]),'1,4');check('jeep : pas la rivière',tg(S.hand[4]),'1,2,4');
check('navire : près de la côte',tg(S.hand[1]),'1,2');check('chasseur : partout',tg(S.hand[2]),'1,2,3,4');
let u1=E.placeCard(S,0,1);check('pose',!!u1&&u1.c===1,true);check('coût payé',S.supply,38);check('carte gardée sur l\'unité (repli)',u1.card.t,'tireurs');
S.hand=[E.mkCard('tireurs','R'),E.mkCard('tireurs','V'),E.mkCard('tireurs','N')];E.placeCard(S,0,1);E.placeCard(S,0,1);
check('3 places par secteur',E.placeCard(S,0,1),null);S.capLv={[S.lanes[1]]:1};check('Fortification : 4e place',!!E.placeCard(S,0,1)&&E.queue(S,'me',1).length,4);
S.hand=[E.mkCard('chasseur','J'),E.mkCard('chasseur','R')];const sup=E.placeCard(S,0,2);check('appui posé',E.supportAt(S,2)===sup,true);check('plusieurs appuis par secteur',tg(S.hand[0]).includes('2'),true);
// endurance
check('infanterie : 2 tours',E.statsFor(E.TYPES.tireurs,'J',S,'me').stam,2);check('blindé : 3 tours',E.statsFor(E.TYPES.blinde,'R',S,'me').stam,3);
check('vert : +1 tour',E.statsFor(E.TYPES.tireurs,'V',S,'me').stam,3);check('chasseur : 2 tours',E.statsFor(E.TYPES.chasseur,'J',S,'me').stam,2);
check('Moreau : infanterie +1',E.statsFor(E.TYPES.tireurs,'J',{officers:['moreau']},'me').stam,3);
// terrains forts et faibles des couleurs
check('jaune sur route ×1,5',E.terrainMult('J','route'),1.5);check('jaune en forêt ×0,75',E.terrainMult('J','foret'),0.75);check('jaune+vert en forêt ×1,25',E.terrainMult('JV','foret'),1.25);
// Attaque et Défense
S=blank(['mer','route','champ','foret','champ']);
let a=E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),1);check('tireurs jaunes sur route : 10 × 2 × 1,5 = 30',E.unitAtk(S,a),30);
let b=E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),2);check('au champ : 20',E.unitAtk(S,b),20);check('Défense 3',E.unitDef(S,b),3);
let f=E.placeUnit(S,E.mkUnit(S,'me','tireurs','V'),3);check('forêt : couvert +30 %, vert +25 %',E.unitDef(S,f),Math.round(Math.ceil(3*1.25)*1.3*10)/10);
// combinaisons de secteur
S=blank(['mer','champ','champ','champ','champ']);
E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),1);let cb=E.sectorCombos(S,1);check('seul : aucune combinaison',cb.list.atk.length+cb.list.def.length,0);
E.placeUnit(S,E.mkUnit(S,'me','jeep','J'),1);cb=E.sectorCombos(S,1);
check('binôme + armes combinées + même couleur',cb.list.atk.map(k=>k.id).sort().join(),'armes,binome,couleur');check('Mult : (1 + 0,5 + 1) × 1,5',cb.mult.atk,3.75);
E.placeUnit(S,E.mkUnit(S,'me','mitrailleuse','R'),1);cb=E.sectorCombos(S,1);check('nid défensif + ligne tenue',cb.list.def.map(k=>k.id).sort().join(),'ligne,nid');
// frappe commune : les secteurs s'additionnent
S=blank(['mer','champ','champ','champ','champ']);S.hq.en=500;
E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),1);E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),3);
let F=E.frontForecast(S);check('frappe = somme des secteurs',F.strike,40);check('Défense totale',F.def,6);
check('riposte ennemie annoncée',F.enAtk,E.LEVELS[0].atk);check('au moins un quart passe',F.toMe,Math.max(Math.ceil(F.enAtk*E.MIN_THROUGH),F.enAtk-6));
let st=E.endTurn(S);check('QG ennemi frappé',500-S.hq.en,40);check('votre QG prend la riposte',60-S.hq.me,F.toMe);
check('étapes : secteurs, frappe, riposte, usure',['sec','strike','enemy','wear'].every(p=>st.some(x=>x.ph===p)),true);
check('usure : −1 endurance',E.units(S,'me').every(u=>u.stam===1),true);
E.endTurn(S);check('usées après 2 tours : elles quittent le front',E.units(S,'me').length,0);
// riposte : la Défense réduit, la fumée divise par deux
S=blank(['mer','champ','champ','champ','champ']);E.placeUnit(S,E.mkUnit(S,'me','blinde','V'),1);
F=E.frontForecast(S);check('Défense du blindé vert',F.def,Math.ceil(9*1.25));S.smoke=true;check('fumigènes : riposte ÷2',E.frontForecast(S).enAtk,Math.round(E.enemyAtk(S)/2));
// effets du QG ennemi
S=blank(['mer','champ','champ','champ','champ']);E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),1);
S.fx=['bunker'];check('Bunker : frappe ×0,7',E.sectorForecast(S,1).strike,14);
E.placeUnit(S,E.mkUnit(S,'me','genie','J'),1);check('génie : ignore le Bunker et ×2',E.sectorForecast(S,1).strike,E.sectorForecast(S,1).atk);
S=blank(['mer','champ','champ','champ','champ']);E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),1);S.fx=['mammouth'];check('Mammouth : seuil retiré',E.sectorForecast(S,1).strike,Math.max(0,20-E.mammothWall(S)));
S.fx=['nids'];check('nids : infanterie −25 %',E.unitAtk(S,E.queue(S,'me',1)[0]),15);
S.fx=['panzer'];check('Division blindée : riposte +30 %',E.enemyAtk(S),Math.round(E.LEVELS[0].atk*1.3));
S=blank(['mer','champ','champ','champ','champ']);S.fx=['train'];S.plan={train:2};S.hand=[E.mkCard('tireurs','J')];check('train : secteur coupé',E.deployTargets(S,S.hand[0]).some(t=>t.c===2),false);
S=blank(['mer','champ','champ','champ','champ']);S.fx=['batterie'];S.hq.en=S.lvl.hq;check('batterie : dégâts ÷2 au-dessus de la moitié',E.hqTake(S,'en',10),5);S.hq.en=1;check('batterie : plus sous la moitié',E.hqTake(S,'en',10),10);
S=blank(['mer','champ','champ','champ','champ']);S.mineCol=2;S.hand=[E.mkCard('tireurs','J'),E.mkCard('genie','J')];let mu=E.placeCard(S,0,2);check('mines : −1 endurance',mu.stam,1);check('mines déclenchées',S.mineCol,undefined);
S.mineCol=3;const gu=E.placeCard(S,0,3);check('génie : déminé sans perte',gu.stam+'/'+S.mineCol,gu.stamMax+'/undefined');
S=blank(['mer','champ','champ','champ','champ']);S.fx=['artillerie'];E.placeUnit(S,E.mkUnit(S,'me','blinde','R'),1);S.plan={shell:1};E.endTurn(S);check('obus : −1 endurance de plus',E.units(S,'me')[0].stam,1);
S=blank(['mer','champ','champ','champ','champ']);S.fx=['artillerie'];E.placeUnit(S,E.mkUnit(S,'me','blinde','R'),1);S.plan={shell:1};S.smoke=true;E.endTurn(S);check('obus intercepté par la fumée',E.units(S,'me')[0].stam,2);
// tirage des effets
check('tutoriel : aucun effet',E.pickFx({levelIdx:0,tutorial:true}).length,0);check('bataille : 1 effet',E.pickFx({levelIdx:3}).length,1);check('élite : 2 effets',E.pickFx({levelIdx:3,elite:true}).length,2);
check('boss : son effet + 1',E.pickFx({levelIdx:3,boss:'train'}).join().startsWith('train')&&E.pickFx({levelIdx:3,boss:'train'}).length===2,true);check('boss final : 3 effets',E.pickFx({levelIdx:7,boss:'tank',final:true}).length,3);
// ordres
S=blank(['mer','champ','champ','champ','champ']);E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),1);
S.hand=[E.mkCard('barrage','')];E.playOrder(S,0,{c:1});check('barrage : +20 Attaque de base',E.sectorForecast(S,1).atk,20+E.BARRAGE_ATK);
S.hand=[E.mkCard('assaut','')];E.playOrder(S,0,{c:1});check('assaut ×1,5',E.sectorForecast(S,1).atk,60);
S.hand=[E.mkCard('fumigenes','')];E.playOrder(S,0,{c:1});check('fumigènes',S.smoke,true);
S.hand=[E.mkCard('embuscade','')];E.playOrder(S,0,{c:1});check('relève : +1 endurance',E.queue(S,'me',1)[0].stam,3);
const ru=E.queue(S,'me',1)[0];S.hand=[E.mkCard('retranchement','')];E.playOrder(S,0,{uid:ru.uid});check('retranchement : +1 tour et Défense',ru.stam+'/'+ru.dig,'4/0.5');
S=blank(['mer','champ','champ','champ','champ']);S.hand=[E.mkCard('tireurs','J'),E.mkCard('repli','')];const rp=E.placeCard(S,0,2);
E.playOrder(S,0,{uid:rp.uid});check('repli : la carte revient en main',S.hand.length===1&&S.hand[0].t==='tireurs',true);check('repli : l\'unité quitte le front',E.units(S,'me').length,0);check('repli : retirée de la défausse',S.discard.filter(c=>c.t==='tireurs').length,0);
S=blank(['mer','champ','champ','champ','champ']);S.hq.en=1000;const p=E.placeUnit(S,E.mkUnit(S,'me','paras',''),1);S.hand=[E.mkCard('sabotage','')];E.playOrder(S,0,{uid:p.uid});check('sabotage : 8 %',1000-S.hq.en,Math.ceil(S.lvl.hq*0.08));
S=blank(['mer','champ','champ','champ','champ']);S.hq.en=1000;S.hand=[E.mkCard('bombardier','J')];const br=E.airStrike(S,0,1);check('bombardier : frappe directe',1000-S.hq.en,br.raw);
// infirmiers
S=blank(['mer','champ','champ','champ','champ']);S.hand=[E.mkCard('tireurs','J'),E.mkCard('infirmiers','J')];const t0=E.placeCard(S,0,1);E.placeCard(S,0,1);check('infirmiers : +1 tour aux voisins',t0.stam,3);
// mains : plusieurs cartes posées ensemble dans un secteur
{const Sx=blank(['mer','champ','route','champ','champ']);Sx.supply=20;Sx.capLv={route:4};Sx.hand=[E.mkCard('tireurs','J'),E.mkCard('jeep','J'),E.mkCard('chasseur','J'),E.mkCard('assaut',''),E.mkCard('retranchement','')];
 const g=[Sx.hand[0],Sx.hand[1],Sx.hand[2],Sx.hand[3]];check('coût de la main',E.groupCost(Sx,g),2+2+2+2);check('secteurs possibles (jeep : pas la forêt…)',E.groupSectors(Sx,g).join(),'1,2,3,4');
 check('ordre sur unité : seul',E.canPlayGroup(Sx,[Sx.hand[0],Sx.hand[4]]).reason,'solo');
 const pv=E.previewGroup(Sx,g,2);check('aperçu sans rien toucher',Sx.units.length+'/'+Sx.hand.length+'/'+Sx.supply,'0/5/20');
 const r=E.playGroup(Sx,g,2);check('main posée',r.length,4);check('3 unités dans le secteur',E.queue(Sx,'me',2).length+E.supportsAt(Sx,2).length,3);check('ravitaillement payé',Sx.supply,12);
 const f=E.sectorForecast(Sx,2);check('aperçu = résultat',pv.strike,f.strike);check('combos de la main : trio, armes, appui, couleur, assaut',f.combos.atk.map(k=>k.id).sort().join(),'appui,armes,assaut,couleur,trio');
 Sx.hand.push(E.mkCard('tireurs','J'),E.mkCard('tireurs','J'));E.playGroup(Sx,[Sx.hand[1],Sx.hand[2]],2);check('bataillon dès 5 unités',E.sectorCombos(Sx,2).list.atk.some(k=>k.id==='bataillon'),true);
 const Sy=blank(['mer','champ','route','champ','champ']);Sy.supply=20;Sy.hand=['tireurs','tireurs','tireurs','tireurs'].map(t=>E.mkCard(t,'J'));check('main trop grosse pour 3 places',E.canPlayGroup(Sy,Sy.hand.slice()).reason,'full');check('3 cartes : ok',E.canPlayGroup(Sy,Sy.hand.slice(0,3)).ok,true);
 const u=E.placeCard(Sy,0,1),a0=E.unitAtk(Sy,u),d0=E.unitDef(Sy,u);Sy.catLv={foot:2};check('niveau Infanterie +40 % Attaque',Math.round(E.unitAtk(Sy,u)*10),Math.round(a0*14));check('… et Défense',E.unitDef(Sy,u)>d0,true);
 const Cc={capLv:{},catLv:{}};check('prix amélioration',E.upgPrice(Cc,'t','foret'),5);E.applyUpgrade(Cc,'t','foret');check('Fortification niv. 1',Cc.capLv.foret,1);check('prix qui monte',E.upgPrice(Cc,'t','foret'),7);for(let i=0;i<9;i++)E.applyUpgrade(Cc,'t','foret');check('7 places au plus',Cc.capLv.foret,4);}
// packs façon Balatro
const lcg=(x=7)=>()=>(x=(x*16807)%2147483647)/2147483647;
{const Cp={deck:E.START_DECK.map(c=>({...c})),officers:[],hq:60,hqMax:60,loot:20,capLv:{},catLv:{},comboLv:{}};
 for(const k of Object.keys(E.PACKS)){const o=E.packOptions(Cp,k,lcg());check('pack '+k+' : '+E.PACKS[k].n+' choix',o.length,E.PACKS[k].n);}
 check('pack recrues : que des unités',E.packOptions(Cp,'recrues').every(o=>o.k==='card'&&!E.isOrder(o.card)),true);check('pack ordres : que des ordres',E.packOptions(Cp,'ordres').every(o=>E.isOrder(o.card)),true);
 const n0=Cp.deck.length;E.applyPackPick(Cp,{k:'card',card:E.mkCard('blinde','R')});check('carte ajoutée',Cp.deck.length,n0+1);E.applyPackPick(Cp,{k:'joker',id:'moreau'});check('joker ajouté',Cp.officers.join(),'moreau');
 E.applyPackPick(Cp,{k:'up',kind:'c',id:'foot'});check('niveau infanterie',Cp.catLv.foot,1);E.applyPackPick(Cp,{k:'manual',id:'trio'});check('manuel trio niv.2',Cp.comboLv.trio,2);
 check('pack staff sans doublon',E.packOptions(Cp,'staff').every(o=>o.id!=='moreau'),true);
 const gp=E.genPacks(Cp);check('4 packs',gp.length,4);Cp.officers=['moreau','dubois','ashby','kowalski','meyer'];check('joker plein : pas de pack état-major',E.genPacks(Cp).some(p=>p.kind==='staff'),false);}
// annuler, réserve, défausse
S=blank(['mer','champ','champ','champ','champ']);S.hand=[E.mkCard('tireurs','J')];const sn=E.snapshotState(S);E.placeCard(S,0,1);E.restoreState(S,sn);check('annulé',S.units.length+'/'+S.hand.length,'0/1');
S=mk();S.hand=[E.mkCard('tireurs','J'),E.mkCard('jeep','R')];S.supply=5;E.endTurn(S);check('fin de tour : toute la main est défaussée (plus de réserve)',S.hand.length>=0&&S.discard.length>=2,true);
S=mk();const s0=S.supply;E.discardHand(S,[0]);check('défausse : +1 ravitaillement',S.supply-s0,E.DISCARD_SUPPLY);
// objectifs
S=mk({},E.battleCfg({type:'battle',levelIdx:2,layer:3,obj:{type:'kills',n:4}}));check('éliminer → frappe décisive',S.obj.type,'burst');
S.units=[];S.lanes=['mer','champ','champ','champ','champ'];S.fx=[];S.plan={};S.obj.n=10;E.placeUnit(S,E.mkUnit(S,'me','tireurs','J'),1);E.endTurn(S);check('frappe décisive gagnée',S.over,'win');
S=mk({},E.battleCfg({type:'battle',levelIdx:2,layer:3,obj:{type:'hold',n:2}}));S.fx=[];S.plan={};S.hq.me=999;E.endTurn(S);E.endTurn(S);check('tenir 2 tours',S.over,'win');
// campagne
{const M=E.genMap(),B=M.map(l=>l[0]);check('20 blindes',M.length,20);check('boss toutes les 4',B.filter(n=>n.type==='boss').map(n=>n.layer).join(),'3,7,11,15,19');check('boss final',B.filter(n=>n.final).map(n=>n.layer).join(),'19');
 check('petite/moyenne/grosse/boss',B.slice(0,4).map(n=>n.type).join(),'battle,battle,elite,boss');check('boss sans passe',B.filter(n=>n.type==='boss'&&n.bonus).length,0);check('tutoriel sans passe',B.slice(0,2).filter(n=>n.bonus).length,0);check('passe avec bonus',B.filter(n=>n.type!=='boss'&&n.layer>=2).every(n=>n.bonus&&n.bonus.tag),true);
 const R0=new Function(coreReal+';return {battleCfg,ensureMap,genMap}')();const hq=R0.genMap().map(l=>R0.battleCfg(l[0]).hq);check('chaque blinde plus forte',hq.every((h,i)=>!i||h>hq[i-1]),true);const atk=B.map(n=>{const c=E.battleCfg(n);return c.atk/(c.obj.type==='hold'?1.25:1)});check('attaque croissante',atk.every((a,i)=>!i||a>=atk[i-1]*0.99),true);
 E.ensureMap(M,45);check('mode infini',M.length,46);const M2=R0.ensureMap(R0.genMap(),45),hq2=M2.map(l=>R0.battleCfg(l[0]).hq);check('infini toujours plus fort',hq2.slice(19).every((h,i,a)=>!i||h>a[i-1]),true);check('un seul boss final',M.filter(l=>l[0].final).length,1);check('ante',E.anteOf(0)+','+E.anteOf(3)+','+E.anteOf(4)+','+E.anteOf(19),'1,1,2,5');}
check('paquet de départ 15',E.START_DECK.length,15);check('5 doctrines',Object.keys(E.DOCTRINES).length,5);
check('boss : effets de boss',Object.values(E.BOSSES).every(b=>b.desc.length>10),true);
{const Cc={deck:E.START_DECK.slice(),hq:40,hqMax:60,loot:3,officers:[]};E.applyEvent(Cc,'convoi',0);check('convoi : +7',Cc.loot,10);}
// vraies constantes : progression exponentielle
{const R=new Function(coreReal+';return {battleCfg,LEVELS,HQ_MULT,newBattle,START_DECK,enemyAtk}')();
 const h=i=>R.battleCfg({type:'battle',levelIdx:i,layer:i+1,obj:{type:'hq'}}).hq;check('QG ennemi : base × multiplicateur',h(0),Math.round(R.LEVELS[0].hq*R.HQ_MULT));check('QG ennemi : croissance',h(6)>h(1)*2,true);
 const Q=R.newBattle({level:0,deck:R.START_DECK.slice(),hq:60,hqMax:60,officers:[]},()=>0.5,R.battleCfg({type:'battle',levelIdx:4,layer:5,obj:{type:'hq'}}));check('riposte qui grimpe',R.enemyAtk(Q,5)>R.enemyAtk(Q,1),true);}
console.log(bad?`${bad} échec(s) sur ${n}`:`tous les tests passent (${n})`);process.exit(bad?1:0);
