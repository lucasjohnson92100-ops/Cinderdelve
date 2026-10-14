// Vérifie le moteur : front unique, mer et air, couleurs, fusions (en main et sur le terrain), niveaux, jokers, butin, boutique, carte (node test_core.js)
const fs=require('fs');
const core=fs.readFileSync(process.argv[2]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
const E=new Function(core+';return {lootFor,genShop,upgradeCost,canUpgrade,cardPrice,upText,JOKERS,MAX_JOKERS,UP,newBattle,playCard,endTurn,targetsFor,isPlayable,units,supports,TYPES,START_DECK,deploy,fuseCards,splitCard,canFuse,canFuseUnits,fuseUnits,moveToFront,snapshotState,restoreState,genMap,battleCfg,mkCard,statsFor,LEVELS,shotsOf,rewardCards,cardCost,shuffle,HQ_START,FRONT_CAP,ZONE_CAP,findUnit};')();
let bad=0;const check=(n,g,e)=>{if(g!==e){bad++;console.log('ÉCHEC',n,'obtenu',g,'attendu',e);}};
const mk=(o={})=>E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[],...o},()=>0.5);
const T=E.TYPES;
// --- caractéristiques
let st=E.statsFor(T.tireurs,'J');check('tireurs jaunes: dégâts 2',st.dmg,2);check('10 hommes',st.men,10);
st=E.statsFor(T.tireurs,'JR');check('orange: 15 hommes',st.men,15);check('orange: 15 PV',st.hp,15);
st=E.statsFor(T.blinde,'R');check('blindé rouge = 2 chars',st.men,2);
st=E.statsFor(T.spiders,'V');check('spiders verts PV 14',st.hp,14);
st=E.statsFor(T.destroyer,'V');check('destroyer vert 4 tours',st.ttl,4);
st=E.statsFor(T.tireurs,'N');check('noir perce 1',st.pierce,1);check('noir: raid',st.raid,true);
// --- fusion de cartes en main
let S=mk();S.hand=[E.mkCard('tireurs','J'),E.mkCard('blinde','J'),E.mkCard('tireurs','R')];
check('fusion possible',E.canFuse(S.hand[0],S.hand[2]),true);check('types différents',E.canFuse(S.hand[0],S.hand[1]),false);
const f=E.fuseCards(S,0,2);check('carte orange',f.c,'JR');check('fusion de fusion interdite',E.canFuse(f,E.mkCard('tireurs','V')),false);
E.splitCard(S,S.hand.indexOf(f));check('séparation',S.hand.length,3);
// --- un seul front : déploiement devant / derrière
S=mk();S.plan=[];S.hand=[E.mkCard('tireurs','J'),E.mkCard('blinde','V'),E.mkCard('spiders','N')];S.supply=9;
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
// spiders contournent : visent le dernier ennemi de la ligne
S=mk();S.plan=[];S.hand=[];const sp=E.deploy(S,'me','spiders','');sp.fresh=false;const e1=E.deploy(S,'en','rifle'),e2=E.deploy(S,'en','gren');e1.fresh=e2.fresh=true;
E.endTurn(S);check('les spiders ont frappé le dernier (grenadiers)',E.units(S,'en').some(x=>x.key==='gren'),false);check('le surplus de tirs va au suivant',e1.hp,3);
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
S=mk();S.plan=[];S.hand=[E.mkCard('tireurs','J'),E.mkCard('spiders','N')];S.supply=9;
E.playCard(S,0,{pos:'back'});E.playCard(S,0,{pos:'back'});check('ordre',S.front.me[0].key,'tireurs');
check('mise en première ligne',E.moveToFront(S,S.front.me[1].uid),true);check('spiders devant',S.front.me[0].key,'spiders');
const sn=E.snapshotState(S);S.hand=[E.mkCard('blinde','J')];S.supply=9;E.playCard(S,0,{pos:'back'});check('3 unités',S.front.me.length,3);
E.restoreState(S,sn);check('annulation : retour à 2 unités',S.front.me.length,2);
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
