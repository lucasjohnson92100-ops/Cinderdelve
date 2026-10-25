// Simulation d'une campagne : un bot pose ses cartes secteur par secteur (meilleur bilan prévu), et achète en boutique (node sim.js [parties] [moteur])
const fs=require('fs');
let core=fs.readFileSync(process.argv[3]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
// réglages d'équilibrage à tester sans toucher au jeu : HQM=… EHP=… EATK=…
for(const [k,e] of [['HQ_MULT','HQM'],['ENEMY_ATK','EATK'],['ATK_RAMP','RAMP'],['HQ_GROW','HQG'],['ENEMY_GROWTH','EG'],['MIN_THROUGH','MT']])if(process.env[e])core=core.replace(new RegExp(k+' = [0-9.]+'),k+' = '+process.env[e]);
const E=new Function(core+';return {newBattle,endTurn,TYPES,START_DECK,snapshotState,restoreState,placeCard,deployTargets,canDeployNow,cardCost,airStrike,playOrder,discardHand,isOrder,frontForecast,units,pickDoctrines,doctrineCards,rewardCards,DOCTRINES,addSupplyBonus,supplyBonusCost,MAX_SUPPLY_BONUS,battleCfg,genMap,lootFor,applyUpgrade,packOptions,applyPackPick,genShop,upgradeCost,canUpgrade,MAX_JOKERS,HQ_START,GW,landCols};')();
const rnd=Math.random;
// Valeur d'une position : fraction du QG ennemi frappée ce tour, moins la fraction de votre QG perdue ; les unités qui restent comptent un peu
function evalPos(S){
  if(S.over)return S.over==='win'?1e6:-1e6;
  const F=E.frontForecast(S);
  const persist=E.units(S,'me').reduce((t,u)=>t+Math.max(0,u.stam-1)*0.15,0);
  return 100*F.toEn/Math.max(1,S.hq.en)-100*F.toMe/Math.max(1,S.hq.me)*(process.env.CARELESS?0.3:1)+persist;
}
// Le bot essaie chaque carte jouable sur chaque cible et garde le meilleur coup, tant qu'il en reste un utile
function bestMove(S){
  const base=evalPos(S);let best=null;
  for(let hi=0;hi<S.hand.length;hi++){
    const card=S.hand[hi],d=E.TYPES[card.t];if(!E.canDeployNow(S,card).ok)continue;
    if(card.t==='ravitaillement')return {hi,tg:{c:E.landCols(S)[0]},v:99};
    if(card.t==='repli')continue;
    for(const tg of E.deployTargets(S,card)){
      const snap=E.snapshotState(S);
      let ok;
      if(card.t==='bombardier')ok=E.airStrike(S,hi,tg.c);else if(d.order)ok=E.playOrder(S,hi,tg);else ok=E.placeCard(S,hi,tg.c);
      const v=ok?evalPos(S)-base+(d.order||card.t==='bombardier'?0:0.05*E.cardCost(S,card)):-1e9;
      E.restoreState(S,snap);
      if(v>0&&(!best||v>best.v))best={hi,tg,v};
    }
  }
  return best;
}
function botTurn(S){
  // défausse des cartes injouables (une fois par tour)
  if(S.discards>0){const bad=S.hand.map((c,i)=>i).filter(i=>{const c=S.hand[i];return E.TYPES[c.t].cost>S.supply+1||!E.deployTargets(S,c).length;});if(bad.length>=2)E.discardHand(S,bad.slice(0,5));}
  for(let g=0;g<20&&!S.over;g++){
    const m=bestMove(S);if(!m)break;
    const card=S.hand[m.hi],d=E.TYPES[card.t];
    if(card.t==='bombardier')E.airStrike(S,m.hi,m.tg.c);else if(d.order)E.playOrder(S,m.hi,m.tg);else E.placeCard(S,m.hi,m.tg.c);
  }
}
const RES=0;
function fight(C,node){const S=E.newBattle(C,rnd,E.battleCfg(node));for(let k=0;k<40&&!S.over;k++){botTurn(S);E.endTurn(S);if(S.over)break;}return{S,win:S.over==='win'};}
const PATH=Array.from({length:+process.env.BLINDS||20},(_,i)=>[['battle','battle','elite','boss'][i%4],i]);
// ONE=n : trace une seule bataille du niveau n-1 (TYPE=boss|elite pour le type de nœud)
if(process.env.ONE){const C={deck:E.START_DECK.map(c=>({...c})),hq:60,hqMax:60,officers:[],loot:0};const S=E.newBattle(C,rnd,E.battleCfg(E.genMap(rnd)[+process.env.ONE-1][0]));
  for(let k=0;k<15&&!S.over;k++){botTurn(S);const F=E.frontForecast(S);console.log('T'+S.turn,'QG',JSON.stringify(S.hq),'frappe',F.toEn,'déf',F.def,'riposte',F.enAtk,'→',F.toMe,'| fx',S.fx.join(','),'| vous',E.units(S,'me').map(u=>u.key+'@'+u.c+'('+u.stam+')').join(' '));E.endTurn(S);}
  console.log('fin',JSON.stringify(S.hq),S.over);process.exit(0);}
const N=+process.argv[2]||200;const reach=PATH.map(()=>({n:0,w:0,t:0,hq:0}));let done=0;const stats={jok:0,lv:0};
for(let r=0;r<N;r++){
  const doc=process.env.DOC||E.pickDoctrines(rnd)[0];const C={deck:[...E.START_DECK.map(c=>({...c})),...E.doctrineCards(doc)],hq:E.HQ_START,hqMax:E.HQ_START,officers:process.env.JOKER?process.env.JOKER.split(','):[],loot:2};let ok=true;
  const MAP=E.genMap(rnd);
  for(let i=0;i<PATH.length;i++){
    const node=MAP[i][0],type=node.type;reach[i].n++;reach[i].hq+=C.hq;
    if(process.env.SKIP&&type!=='boss'&&i>=2&&node.slot===0){C.loot+=node.bonus.tag==='loot'?node.bonus.n:5;reach[i].w++;continue;}
    const f=fight(C,node);reach[i].t+=f.S.turn;if(!f.win){ok=false;break;}reach[i].w++;
    C.hq=Math.min(C.hqMax,f.S.hq.me+12);C.loot+=E.lootFor(f.S,C,type).total;
    if(type==='boss'&&i<PATH.length-1)E.addSupplyBonus(C);
    // carte de récompense : de préférence un type que le paquet n'a pas encore, sinon une unité
    {const opts=E.rewardCards(rnd,type==='battle'?1:2,C.deck);const own=new Set(C.deck.map(c=>c.t));const pick=opts.find(c=>!own.has(c.t)&&!E.isOrder(c))||opts.find(c=>!E.isOrder(c))||opts[0];if(pick&&!process.env.NOREWARD)C.deck.push({...pick});}
    let shop=E.genShop(C,rnd,type!=='battle');
    while(C.hq<C.hqMax*0.6&&C.loot>=4&&!process.env.NOHEAL){C.loot-=4;C.hq=Math.min(C.hqMax,C.hq+12);}
    // packs : le bot achète par ordre de priorité et garde la meilleure carte
    const prio={staff:0,amelio:1,mega:2,recrues:3,ordres:4},score=o=>o.k==='joker'?9:o.k==='up'?(o.kind==='c'?7:6):o.k==='manual'?5:E.isOrder(o.card)?(['assaut','barrage','contreattaque'].includes(o.card.t)?3:1):(C.deck.some(c=>c.t===o.card.t)?2:4)+(E.TYPES[o.card.t].rar||0);
    for(const pk of shop.packs.slice().sort((x,y)=>prio[x.kind]-prio[y.kind])){
      if(pk.price>C.loot)continue;if(pk.kind==='ordres'&&C.loot<10)continue;
      const opts=E.packOptions(C,pk.kind,rnd,type!=='battle');if(!opts.length)continue;C.loot-=pk.price;
      for(let k=0;k<(pk.kind==='mega'?2:1);k++){const live=opts.filter(Boolean).sort((x,y)=>score(y)-score(x));if(!live.length)break;const o=live[0];opts[opts.indexOf(o)]=null;E.applyPackPick(C,o);}
    }
    for(let tries=0;tries<4;tries++){
      if((C.supplyBonus||0)<E.MAX_SUPPLY_BONUS&&C.loot>=E.supplyBonusCost(C)){C.loot-=E.supplyBonusCost(C);E.addSupplyBonus(C);continue;}
      const up=C.deck.filter(E.canUpgrade).sort((a,b)=>(a.lv||1)-(b.lv||1));
      if(up.length&&E.upgradeCost(up[0])<=C.loot&&C.loot>=6){const t=up.find(c=>c.t==='tireurs'||c.t==='blinde'||c.t==='croiseur')||up[0];C.loot-=E.upgradeCost(t);t.lv=(t.lv||1)+1;continue;}
      break;}
  }
  if(ok)done++;stats.jok+=C.officers.length;stats.lv+=C.deck.reduce((s,c)=>s+(c.lv||1)-1,0);
}
console.log('campagne terminée par le bot :',(done*100/N).toFixed(1)+'%','| jokers moyens',(stats.jok/N).toFixed(1),'| niveaux achetés',(stats.lv/N).toFixed(1));
reach.forEach((x,i)=>console.log(`étape ${i+1} ${PATH[i][0].padEnd(6)} niveau ${PATH[i][1]} : atteinte ${x.n}  victoires ${x.n?Math.round(x.w*100/x.n):0}%  tours moy ${x.n?(x.t/x.n).toFixed(1):0}  QG à l'entrée ${x.n?Math.round(x.hq/x.n):0}`));
