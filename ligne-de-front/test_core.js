// Vérifie le moteur : combat, couleurs, fusion, niveaux, jokers, butin, boutique et carte (node test_core.js)
const fs=require('fs');
const core=fs.readFileSync(process.argv[2]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
const E=new Function(core+';return {lootFor,genShop,upgradeCost,canUpgrade,cardPrice,upText,JOKERS,MAX_JOKERS,UP,newBattle,playCard,endTurn,targetsFor,isPlayable,units,supports,TYPES,START_DECK,deploy,fuseCards,splitCard,canFuse,genMap,battleCfg,mkCard,statsFor,TYPES,LEVELS,shotsOf,rewardCards,cardCost,shuffle,HQ_START,OFFICERS};')();
let bad=0;const check=(n,g,e)=>{if(g!==e){bad++;console.log('ÉCHEC',n,'obtenu',g,'attendu',e);}};
const mk=(o={})=>E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:[],...o},()=>0.5);
// stats de base et couleurs
const T=E.TYPES;
let st=E.statsFor(T.tireurs,'J');check('tireurs jaunes: dégâts 2',st.dmg,2);check('tireurs jaunes: 10 hommes',st.men,10);
st=E.statsFor(T.tireurs,'JR');check('orange: 15 hommes',st.men,15);check('orange: dégâts 2',st.dmg,2);check('orange: 15 PV',st.hp,15);
st=E.statsFor(T.blinde,'R');check('blindé rouge = 2 chars',st.men,2);check('PV 32',st.hp,32);
st=E.statsFor(T.spiders,'V');check('spiders verts PV 14',st.hp,14);
st=E.statsFor(T.destroyer,'V');check('destroyer vert reste 4 tours',st.ttl,4);
st=E.statsFor(T.tireurs,'N');check('noir perce 1',st.pierce,1);check('noir agit dès l’arrivée',st.raid,true);
// fusion
let S=mk();S.hand=[E.mkCard('tireurs','J'),E.mkCard('blinde','J'),E.mkCard('tireurs','R')];
check('fusion possible',E.canFuse(S.hand[0],S.hand[2]),true);check('types différents',E.canFuse(S.hand[0],S.hand[1]),false);
const f=E.fuseCards(S,0,2);check('carte orange',f.c,'JR');check('main: 2 cartes',S.hand.length,2);check('fusion de fusion interdite',E.canFuse(f,E.mkCard('tireurs','V')),false);
E.splitCard(S,S.hand.indexOf(f));check('séparation',S.hand.length,3);
// jeu : la fusion coûte une seule carte et les deux retournent à la défausse
S=mk();S.hand=[E.mkCard('tireurs','J'),E.mkCard('tireurs','R')];S.discard=[];S.plan=[];E.fuseCards(S,0,1);
check('coût de la fusion = coût du type',E.cardCost(S,S.hand[0]),2);E.playCard(S,0,{lane:0});
check('4 de ravitaillement - 2',S.supply,2);check('2 cartes en défausse',S.discard.length,2);
const u=E.units(S,'me')[0];check('15 tireurs orange',u.menMax,15);check('en attente',u.fresh,true);
// combat : 10 tireurs de dégât 1 contre un soldat ennemi de 6 PV
S=mk();S.plan=[];S.hand=[];const t1=E.deploy(S,'me',0,'tireurs','');t1.fresh=false;const en=E.deploy(S,'en',0,'rifle');en.fresh=true;
E.endTurn(S);check('soldats ennemis détruits (6 PV)',E.units(S,'en').filter(x=>x.key==='rifle').length,0);
// blindage 2 : les tireurs normaux (dégât 1) ne font rien, les jaunes (2) non plus, les olive (2 + perce 1) oui
S=mk();S.plan=[];S.hand=[];const pz=E.deploy(S,'en',1,'panzer');pz.fresh=true;
for(const c of ['','J','JN']){const a=E.deploy(S,'me',1,'tireurs',c);a.fresh=false;S.lanes[1].me=[a,null];const hp0=pz.hp;
  const sp={...S};E.endTurn(S);check('panzer contre tireurs '+(c||'bleus'),pz.hp<hp0,c==='JN');S.lanes[1].me=[null,null];pz.hp=pz.hpMax;pz.fresh=true;S.plan=[];}
// marine : ttl et disparition
S=mk();S.plan=[];S.hand=[E.mkCard('croiseur','N')];S.supply=9;E.playCard(S,0,{lane:2});
check('croiseur en soutien',!!S.lanes[2].sup,true);const cr=S.lanes[2].sup;
for(let i=0;i<3;i++){S.plan=[];E.endTurn(S);}
check('croiseur parti après 3 tours',S.lanes[2].sup,null);
check('croiseur frappe le QG (7×3)',S.hq.en,E.LEVELS[0].hq-21);
// chasseur annule un obus
S=mk();S.hand=[E.mkCard('chasseur','J')];S.supply=9;E.playCard(S,0,{lane:1});S.plan=[{k:'shell',lane:1,dmg:6}];const h0=S.hq.me;E.endTurn(S);
check('obus intercepté',S.hq.me,h0);
// bombardier : dégâts à chaque ennemi de la ligne
S=mk();S.plan=[];S.hand=[E.mkCard('bombardier','R')];S.supply=9;const a1=E.deploy(S,'en',0,'rifle'),a2=E.deploy(S,'en',0,'gren');a1.fresh=a2.fresh=true;
E.playCard(S,0,{lane:0});E.endTurn(S);check('bombardier rouge : 8 dégâts tuent tout',E.units(S,'en').length,0);
// objectifs et carte
for(let k=0;k<400;k++){const L=E.genMap();L.forEach((layer,l)=>layer.forEach((n,j)=>{if(l<L.length-1&&!n.next.length)check('suite '+n.id,1,0);if(l>0&&!L[l-1].some(p=>p.next.includes(j)))check('accès '+n.id,1,0);}));}
const rc=E.rewardCards();check('3 récompenses',rc.length,3);
// niveaux (entraînement)
st=E.statsFor(T.tireurs,'',null,'me',1);check('tireurs niv1',st.men,10);
st=E.statsFor(T.tireurs,'',null,'me',3);check('tireurs niv3 = 16 hommes',st.men,16);
st=E.statsFor(T.blinde,'',null,'me',3);check('blindé niv3: dégâts 7',st.dmg,7);check('blindé niv3: PV 20',st.hp,20);
check('texte entraînement',E.upText('tireurs',2),'+3 hommes');
check('coût niv1->2',E.upgradeCost({t:'tireurs',c:'J'}),6);check('coût niv2->3',E.upgradeCost({t:'tireurs',c:'J',lv:2}),10);check('niv3 non améliorable',E.canUpgrade({t:'tireurs',c:'J',lv:3}),false);
let f2=E.fuseCards((S=mk(),S.hand=[{t:'tireurs',c:'J',lv:2},E.mkCard('tireurs','R')],S),0,1);check('fusion garde le meilleur niveau',f2.lv,2);
// jokers
const jb=(ids,t,c,lv,side='me')=>E.statsFor(E.TYPES[t],c,{officers:ids},side,lv);
check('soleil: jaune +2 dégâts',jb(['soleil'],'tireurs','J').dmg,3);
check('braise: rouge +7 hommes (50 % + 25 %)',jb(['braise'],'tireurs','R').men,17);
check('mousse: vert PV ×1,5×1,25',jb(['mousse'],'spiders','V').hp,Math.ceil(Math.ceil(9*1.5)*1.25));
check('ombre: noir perce 2',jb(['ombre'],'tireurs','N').pierce,2);
check('peintre: fusion +1 dégât',jb(['peintre'],'tireurs','JR').dmg,3);
check('amiral: destroyer reste 4 tours',jb(['amiral'],'destroyer','').ttl,4);
check('sans joker: ennemis non affectés',E.statsFor({men:6,dmg:1,hpm:1,id:'x'},'',{officers:['dubois','soleil']},'en',1).dmg,1);
S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:['fort','kowalski']},()=>0.5);check('fort + kowalski: 4+1+2',S.supply,7);
// butin
S=mk();S.turn=3;S.hq.me=60;let lo=E.lootFor(S,{loot:10},'battle');check('butin: 4 + 2 + 1 + 1 = 8',lo.total,8);
S.turn=9;S.hq.me=10;lo=E.lootFor(S,{loot:0},'boss');check('butin boss lent: 9',lo.total,9);
S=E.newBattle({level:0,deck:E.START_DECK.slice(),hq:60,hqMax:60,officers:['quartier']},()=>0.5);S.turn=9;S.hq.me=10;lo=E.lootFor(S,{loot:0},'battle');check('quartier-maître: 4 +50 % = 6',lo.total,6);
// boutique
const sh=E.genShop({officers:['ashby'],deck:E.START_DECK},undefined,false);check('2 jokers',sh.jokers.length,2);check('2 cartes',sh.cards.length,2);
check('pas de joker déjà possédé',sh.jokers.some(j=>j.id==='ashby'),false);
console.log(bad?bad+' échec(s)':'tests OK');process.exit(bad?1:0);
