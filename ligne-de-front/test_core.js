// Vérifie le moteur : front unique, mer et air, couleurs, règle des couleurs au déploiement (couleur d'une fusion incluse), fusions, niveaux, jokers, butin, boutique, carte (node test_core.js)
const fs=require('fs');
const core=fs.readFileSync(process.argv[2]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
const E=new Function(core+';return {lootFor,genShop,upgradeCost,canUpgrade,cardPrice,upText,JOKERS,MAX_JOKERS,UP,newBattle,playCard,endTurn,targetsFor,isPlayable,units,supports,TYPES,START_DECK,deploy,fuseCards,splitCard,canFuse,canFuseUnits,fuseUnits,moveToFront,snapshotState,restoreState,planDeploy,deployAll,colorsReachable,selectionValid,genMap,battleCfg,mkCard,statsFor,LEVELS,shotsOf,rewardCards,cardCost,shuffle,HQ_START,FRONT_CAP,ZONE_CAP,findUnit};')();
let bad=0;const check=(n,g,e)=>{if(g!==e){bad++;console.log('ÉCHEC',n,'obtenu',g,'attendu',e);}};
const mk=(o={})=>E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[],...o},()=>0.5);
const T=E.TYPES;
// --- caractéristiques
let st=E.statsFor(T.tireurs,'J');check('tireurs jaunes: dégâts 2',st.dmg,2);check('10 hommes',st.men,10);
st=E.statsFor(T.tireurs,'JR');check('orange: 15 hommes',st.men,15);check('orange: 15 PV',st.hp,15);
st=E.statsFor(T.blinde,'R');check('blindé rouge = 2 chars',st.men,2);
st=E.statsFor(T.jeep,'V');check('jeeps verts PV 24',st.hp,24);
st=E.statsFor(T.destroyer,'V');check('destroyer vert 4 tours',st.ttl,4);
st=E.statsFor(T.tireurs,'N');check('noir perce 1',st.pierce,1);check('noir: raid',st.raid,true);
// --- fusion de cartes en main
let S=mk();S.hand=[E.mkCard('tireurs','J'),E.mkCard('blinde','J'),E.mkCard('tireurs','R')];
check('fusion possible',E.canFuse(S.hand[0],S.hand[2]),true);check('types différents',E.canFuse(S.hand[0],S.hand[1]),false);
const f=E.fuseCards(S,0,2);check('carte orange',f.c,'JR');check('fusion de fusion interdite',E.canFuse(f,E.mkCard('tireurs','V')),false);
E.splitCard(S,S.hand.indexOf(f));check('séparation',S.hand.length,3);
// --- un seul front : déploiement devant / derrière
S=mk();S.plan=[];S.hand=[E.mkCard('tireurs','J'),E.mkCard('blinde','V'),E.mkCard('jeep','N')];S.supply=9;
check('1re unité : un seul choix',E.targetsFor(S,S.hand[0]).length,1);
E.playCard(S,0,{pos:'back'});check('unité posée',S.front.me.length,1);
check('2e unité : choix devant/derrière',E.targetsFor(S,S.hand[0]).length,2);
E.playCard(S,0,{pos:'front'});check('le blindé passe devant',S.front.me[0].key,'blinde');
E.playCard(S,0,{pos:'back'});check('3 unités',S.front.me.length,3);
const u4=E.deploy(S,'me','tireurs','R');E.deploy(S,'me','tireurs','V');check('4 unités au maximum',S.front.me.length,4);
S.hand=[E.mkCard('tireurs','J')];check('front plein : carte injouable',E.isPlayable(S,0),false);
// --- marine et air : 2 emplacements par zone
S=mk();S.plan=[];S.hand=[E.mkCard('destroyer','V'),E.mkCard('destroyer','R'),E.mkCard('croiseur','N'),E.mkCard('chasseur','J')];S.supply=20;
E.playCard(S,0,{zone:'mer'});E.playCard(S,0,{zone:'mer'});check('mer pleine après 2 navires',E.isPlayable(S,0),false);
check('l’air reste libre',E.isPlayable(S,1),true);
// --- combat
S=mk();S.plan=[];S.hand=[];const t1=E.deploy(S,'me','tireurs','');t1.fresh=false;const en=E.deploy(S,'en','rifle');en.fresh=true;
E.endTurn(S);check('soldats ennemis détruits (6 PV)',E.units(S,'en').filter(x=>x.key==='rifle').length,0);
// jeep contournent : visent le dernier ennemi de la ligne
S=mk();S.plan=[];S.hand=[];E.TYPES.jeep.kw=['flank'];const sp=E.deploy(S,'me','jeep','');sp.fresh=false;const e1=E.deploy(S,'en','rifle'),e2=E.deploy(S,'en','gren');e1.fresh=e2.fresh=true;
E.endTurn(S);check('les jeep ont frappé le dernier (grenadiers)',E.units(S,'en').some(x=>x.key==='gren'),false);check('le surplus de tirs va au suivant',e1.hp,4);delete E.TYPES.jeep.kw;
// blindage 2
S=mk();S.plan=[];S.hand=[];const pz=E.deploy(S,'en','panzer');pz.fresh=true;
for(const c of ['','J','JN']){S.front.me=[];const a=E.deploy(S,'me','tireurs',c);a.fresh=false;const hp0=pz.hp;E.endTurn(S);check('panzer contre tireurs '+(c||'bleus'),pz.hp<hp0,c==='JN');pz.hp=pz.hpMax;pz.fresh=true;S.plan=[];}
// marine : durée et QG
S=mk();S.plan=[];S.hand=[E.mkCard('croiseur','N')];S.supply=9;E.playCard(S,0,{zone:'mer'});
for(let i=0;i<3;i++){S.plan=[];E.endTurn(S);}
check('croiseur parti après 3 tours',S.sea.length,0);check('croiseur frappe le QG (7×3)',S.hq.en,E.LEVELS[0].hq-21);
// chasseur annule un obus
S=mk();S.hand=[E.mkCard('chasseur','J')];S.supply=9;E.playCard(S,0,{zone:'air'});S.plan=[{k:'shell',dmg:8}];const h0=S.hq.me;E.endTurn(S);check('obus intercepté',S.hq.me,h0);
S=mk();S.plan=[{k:'shell',dmg:8}];S.hand=[];const h1=S.hq.me;E.endTurn(S);check('obus sans couverture sur le QG',S.hq.me,h1-8);
// bombardier
S=mk();S.plan=[];S.hand=[E.mkCard('bombardier','R')];S.supply=9;const a1=E.deploy(S,'en','rifle'),a2=E.deploy(S,'en','gren');a1.fresh=a2.fresh=true;
E.playCard(S,0,{zone:'air'});E.endTurn(S);check('bombardier rouge : 8 dégâts tuent tout',E.units(S,'en').length,0);
// --- fusion de groupes déployés : le tour suivant seulement
S=mk();S.plan=[];S.hand=[E.mkCard('tireurs','J'),E.mkCard('tireurs','R')];S.supply=9;
E.playCard(S,0,{pos:'back'});E.playCard(S,0,{pos:'back'});
let [ua,ub]=S.front.me;check('même tour : fusion interdite',E.canFuseUnits(S,ua,ub),false);
S.plan=[];E.endTurn(S);[ua,ub]=S.front.me;check('tour suivant : fusion possible',E.canFuseUnits(S,ua,ub),true);
ua.hp=6;const fu=E.fuseUnits(S,ua.uid,ub.uid);check('groupe orange',fu.cols,'JR');check('une seule unité sur le front',S.front.me.length,1);
check('15 hommes max',fu.menMax,15);check('PV additionnés (6 + 15 → plafonné à 15)',fu.hp,15);
check('même couleur : fusion interdite',E.canFuseUnits(S,fu,fu),false);
// ordre et annulation
S=mk();S.plan=[];S.hand=[E.mkCard('tireurs','J'),E.mkCard('jeep','N')];S.supply=9;
E.playCard(S,0,{pos:'back'});E.playCard(S,0,{pos:'back'});check('ordre',S.front.me[0].key,'tireurs');
check('mise en première ligne',E.moveToFront(S,S.front.me[1].uid),true);check('jeep devant',S.front.me[0].key,'jeep');
const sn=E.snapshotState(S);S.hand=[E.mkCard('blinde','J')];S.supply=9;E.playCard(S,0,{pos:'back'});check('3 unités',S.front.me.length,3);
E.restoreState(S,sn);check('annulation : retour à 2 unités',S.front.me.length,2);
// --- déploiement groupé selon le ravitaillement
S=mk();S.plan=[];S.supply=4;S.hand=[E.mkCard('tireurs','J'),E.mkCard('jeep','J'),E.mkCard('blinde','J'),E.mkCard('destroyer','J'),E.mkCard('chasseur','J')];
check('2 + 2 = 4 : possible',E.planDeploy(S,[0,1]).ok,true);check('coût 4',E.planDeploy(S,[0,1]).cost,4);
check('2 + 2 + 2 : pas assez de ravitaillement',E.planDeploy(S,[0,1,3]).reason,'supply');
check('blindé + tireurs = 5 : trop cher',E.planDeploy(S,[2,0]).ok,false);
const hh=E.deployAll(S,[0,1],'back');check('2 groupes posés d’un coup',S.front.me.length,2);check('ordre de sélection',S.front.me[0].key,'tireurs');check('2 cartes en défausse',S.discard.length,2);check('ravitaillement épuisé',S.supply,0);check('main restante',S.hand.length,3);
check('hits de déploiement',hh.length,2);
S=mk();S.plan=[];S.supply=9;S.front.me=[];E.deploy(S,'me','blinde','J');S.hand=[E.mkCard('tireurs','J'),E.mkCard('jeep','J'),E.mkCard('destroyer','J')];
E.deployAll(S,[0,1,2],'front');check('devant : ordre de sélection conservé',S.front.me.map(u=>u.key).join(','),'tireurs,jeep,blinde');check('navire posé en mer',S.sea.length,1);
S=mk();S.supply=9;E.deploy(S,'me','tireurs','');E.deploy(S,'me','tireurs','R');E.deploy(S,'me','tireurs','V');S.hand=[E.mkCard('jeep','J'),E.mkCard('jeep','J')];
check('front plein avec 2 nouveaux groupes',E.planDeploy(S,[0,1]).reason,'front');check('un seul passe',E.planDeploy(S,[0]).ok,true);
S=mk();S.supply=9;S.hand=[E.mkCard('destroyer','V'),E.mkCard('destroyer','V'),E.mkCard('croiseur','V')];check('3 navires : zone pleine',E.planDeploy(S,[0,1,2]).reason,'sea');
S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:['ito','silva']},()=>0.5);S.hand=[E.mkCard('destroyer','J'),E.mkCard('tireurs','J')];check('ito + silva : destroyer 2-1-1 = 0, tireurs 2',E.planDeploy(S,[0,1]).cost,2);
// --- règle des couleurs
S=mk();S.plan=[];S.supply=9;S.hand=[E.mkCard('tireurs','J'),E.mkCard('blinde','J'),E.mkCard('tireurs','R'),E.mkCard('jeep','R'),E.mkCard('destroyer','J')];
check('même couleur : possible',E.planDeploy(S,[0,1,4]).ok,true);
check('couleurs différentes de types différents : refusé',E.planDeploy(S,[0,3]).reason,'colors');
check('même type, couleurs différentes, non fusionnées : refusé',E.planDeploy(S,[0,2]).reason,'colors');
check('atteignable : jaune + rouge du même type',E.colorsReachable([S.hand[0],S.hand[2]]),true);
check('inatteignable : jaune + rouge de types différents',E.colorsReachable([S.hand[0],S.hand[3]]),false);
check('atteignable : fusion jaune+rouge + une carte jaune en plus',E.colorsReachable([S.hand[0],S.hand[2],S.hand[1]]),true);
const fz=E.fuseCards(S,0,2);check('fusionnées : déploiement possible',E.planDeploy(S,[S.hand.indexOf(fz)]).ok,true);
check('fusion orange + carte jaune : autorisé',E.planDeploy(S,[S.hand.indexOf(fz),S.hand.findIndex(c=>c.t==='blinde')]).ok,true);
let S2=mk();S2.supply=9;S2.hand=[E.mkCard('tireurs','J'),E.mkCard('tireurs','R'),E.mkCard('jeep','J'),E.mkCard('jeep','R')];E.fuseCards(S2,0,1);E.fuseCards(S2,1,2);
check('deux fusions de même couleur ensemble : possible',E.planDeploy(S2,[0,1]).ok,true);
// --- couleurs appartenant à une fusion
const mkc=(t,c)=>E.mkCard(t,c);const orange=(t)=>({t,c:'JR',lv:1,parts:[mkc(t,'J'),mkc(t,'R')]});
check('orange + jaune : valide',E.selectionValid([orange('tireurs'),mkc('blinde','J')]),true);
check('orange + rouge : valide',E.selectionValid([orange('tireurs'),mkc('croiseur','R')]),true);
check('orange + jaune + rouge : valide',E.selectionValid([orange('tireurs'),mkc('blinde','J'),mkc('destroyer','R')]),true);
check('orange + vert : refusé',E.selectionValid([orange('tireurs'),mkc('blinde','V')]),false);
check('orange + noir : refusé',E.selectionValid([orange('tireurs'),mkc('blinde','N')]),false);
check('orange + orange : valide',E.selectionValid([orange('tireurs'),orange('jeep')]),true);
check('orange + sapin : refusé',E.selectionValid([orange('tireurs'),{t:'blinde',c:'VN',lv:1,parts:[1,2]}]),false);
check('jaune + rouge sans fusion : refusé',E.selectionValid([mkc('tireurs','J'),mkc('blinde','R')]),false);
check('orange + jaune + rouge du même type non fusionnés : valide',E.selectionValid([orange('jeep'),mkc('tireurs','J'),mkc('tireurs','R')]),true);
check('atteignable : jaune + rouge (même type) + jaune',E.colorsReachable([mkc('tireurs','J'),mkc('tireurs','R'),mkc('blinde','J')]),true);
check('atteignable : fusion possible puis vert non couvert',E.colorsReachable([mkc('tireurs','J'),mkc('tireurs','R'),mkc('blinde','V')]),false);
S=mk();S.plan=[];S.supply=20;S.hand=[mkc('tireurs','J'),mkc('tireurs','R'),mkc('blinde','J'),mkc('destroyer','R'),mkc('jeep','V')];E.fuseCards(S,0,1);
check('déploiement : orange + jaune + rouge',E.planDeploy(S,[0,1,2]).ok,true);check('déploiement : orange + vert refusé',E.planDeploy(S,[0,3]).reason,'colors');
// --- niveaux, jokers, butin, boutique, carte
st=E.statsFor(T.tireurs,'',null,'me',3);check('tireurs niv3 = 16 hommes',st.men,16);
const jb=(ids,t,c,lv,side='me')=>E.statsFor(E.TYPES[t],c,{officers:ids},side,lv);
check('soleil: jaune +2 dégâts',jb(['soleil'],'tireurs','J').dmg,3);check('ombre: noir perce 2',jb(['ombre'],'tireurs','N').pierce,2);
check('peintre: fusion +1 dégât',jb(['peintre'],'tireurs','JR').dmg,3);check('amiral: destroyer 4 tours',jb(['amiral'],'destroyer','').ttl,4);
S=mk();S.turn=3;S.hq.me=60;let lo=E.lootFor(S,{loot:10},'battle');check('butin: 4 + 2 + 1 + 1 = 8',lo.total,8);
const sh=E.genShop({officers:['ashby'],deck:E.START_DECK},undefined,false);check('2 jokers',sh.jokers.length,2);check('2 cartes',sh.cards.length,2);
for(let k=0;k<400;k++){const L=E.genMap();L.forEach((layer,l)=>layer.forEach((n,j)=>{if(l<L.length-1&&!n.next.length)check('suite '+n.id,1,0);if(l>0&&!L[l-1].some(p=>p.next.includes(j)))check('accès '+n.id,1,0);}));}
// objectifs
S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[]},()=>0.5,E.battleCfg({type:'battle',levelIdx:0,layer:1,obj:{type:'hold',n:3}}));
for(let i=0;i<3;i++){S.plan=[];E.endTurn(S);}check('tenir 3 tours = victoire',S.over,'win');
S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[]},()=>0.5,E.battleCfg({type:'battle',levelIdx:0,layer:1,obj:{type:'kills',n:2}}));
S.plan=[];S.hand=[];const k1=E.deploy(S,'en','rifle'),k2=E.deploy(S,'en','rifle');k1.fresh=k2.fresh=true;const kk=E.deploy(S,'me','blinde','R');kk.fresh=false;E.endTurn(S);check('2 unités éliminées = victoire',S.over,'win');
console.log(bad?bad+' échec(s)':'tests OK');process.exit(bad?1:0);
