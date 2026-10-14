// Vérifie le moteur de combat, les couleurs, la fusion et la carte : node test_core.js
const fs=require('fs');
const core=fs.readFileSync(process.argv[2]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
const E=new Function(core+';return {newBattle,playCard,endTurn,targetsFor,isPlayable,units,supports,TYPES,START_DECK,deploy,fuseCards,splitCard,canFuse,genMap,battleCfg,mkCard,statsFor,TYPES,LEVELS,shotsOf,rewardCards,cardCost,shuffle,HQ_START,OFFICERS};')();
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
console.log(bad?bad+' échec(s)':'tests OK');process.exit(bad?1:0);
