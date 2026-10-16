// Simulation d'une campagne : un bot pose ses cartes secteur par secteur (meilleur bilan prévu), fusionne et achète en boutique (node sim.js [parties] [moteur])
const fs=require('fs');
let core=fs.readFileSync(process.argv[3]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
// réglages d'équilibrage à tester sans toucher au jeu : HQM=… EHP=… EATK=…
for(const [k,e] of [['HQ_MULT','HQM'],['ENEMY_HP','EHP'],['ENEMY_ATK','EATK'],['HQ_TAKE','HQT'],['HQ_GROW','HQG'],['ENEMY_GROWTH','EG']])if(process.env[e])core=core.replace(new RegExp(k+' = [0-9.]+'),k+' = '+process.env[e]);
const E=new Function(core+';return {newBattle,endTurn,TYPES,START_DECK,fuseCards,canFuse,canFuseUnits,fuseUnits,snapshotState,restoreState,placeCard,deployTargets,canDeployNow,cardCost,airStrike,playOrder,discardHand,isOrder,toggleKeep,MAX_KEEP,sectorForecast,queue,landCols,hqShielded,hqTake,units,pickDoctrines,doctrineCards,rewardCards,DOCTRINES,addSupplyBonus,supplyBonusCost,MAX_SUPPLY_BONUS,battleCfg,lootFor,genShop,upgradeCost,canUpgrade,MAX_JOKERS,HQ_START,GW};')();
const rnd=Math.random;
function fuseAllHand(S){let again=true;while(again){again=false;outer:for(let i=0;i<S.hand.length;i++)for(let j=i+1;j<S.hand.length;j++)if(E.canFuse(S.hand[i],S.hand[j])&&E.fuseCards(S,i,j)){again=true;break outer;}}}
// Valeur d'une position : dégâts prévus de part et d'autre, le QG compte double (c'est lui qui décide de la partie)
const qhp=(S,side,c)=>E.queue(S,side,c).reduce((t,u)=>t+Math.max(0,u.hp),0);
function evalPos(S){
  if(S.over)return S.over==='win'?1e6:-1e6;
  let v=0;
  for(const c of E.landCols(S)){
    const f=E.sectorForecast(S,c),he=qhp(S,'en',c),hm=qhp(S,'me',c);
    const oe=E.hqTake(S,'en',f.toEn-he),om=E.hqTake(S,'me',f.toMe-hm);
    // en fraction de QG : 1 point = 1 % du QG ; les unités tuées comptent un peu (elles ne frapperont plus)
    v+=100*oe/Math.max(1,S.hq.en)+8*Math.min(f.toEn,he)/(he+1)-(100*om/Math.max(1,S.hq.me)+4*Math.min(f.toMe,hm)/(hm+1))*(process.env.CARELESS?0.3:1);
  }
  const shells=(S.plan||[]).filter(p=>p.k==='shell').length;
  return v-shells*0;
}
// Le bot essaie chaque carte jouable sur chaque cible et garde le meilleur coup, tant qu'il en reste un utile
function bestMove(S){
  const base=evalPos(S);let best=null;
  for(let hi=0;hi<S.hand.length;hi++){
    const card=S.hand[hi],d=E.TYPES[card.t];if(!E.canDeployNow(S,card).ok)continue;
    if(card.t==='ravitaillement')return {hi,tg:{c:E.landCols(S)[0]},v:99};
    for(const tg of E.deployTargets(S,card)){
      const snap=E.snapshotState(S),plan=S.plan;
      let ok;
      if(card.t==='bombardier')ok=E.airStrike(S,hi,tg.c);else if(d.order)ok=E.playOrder(S,hi,tg);else ok=E.placeCard(S,hi,tg.c);
      const v=ok?evalPos(S)-base+(d.order||card.t==='bombardier'?0:0.3*E.cardCost(S,card)+(d.land?0.5:0)):-1e9;
      E.restoreState(S,snap);S.plan=plan;
      if(v>0&&(!best||v>best.v))best={hi,tg,v};
    }
  }
  return best;
}
function botTurn(S){
  // défausse des cartes injouables (une fois par tour)
  if(S.discards>0){const bad=S.hand.map((c,i)=>i).filter(i=>{const c=S.hand[i];return E.TYPES[c.t].cost>S.supply+1||!E.deployTargets(S,c).length;});if(bad.length>=2)E.discardHand(S,bad.slice(0,5));}
  if(!process.env.NOFUSE)fuseAllHand(S);
  // fusion d'unités du même type dans un secteur (libère une place)
  let again=true;while(again){again=false;const us=E.units(S,'me');outer2:for(const a of us)for(const b of us)if(E.canFuseUnits(S,a,b)){E.fuseUnits(S,a.uid,b.uid);again=true;break outer2;}}
  for(let g=0;g<20&&!S.over;g++){
    const m=bestMove(S);if(!m)break;
    const card=S.hand[m.hi],d=E.TYPES[card.t];
    if(card.t==='bombardier')E.airStrike(S,m.hi,m.tg.c);else if(d.order)E.playOrder(S,m.hi,m.tg);else E.placeCard(S,m.hi,m.tg.c);
  }
  if(!process.env.NOKEEP)S.hand.map((c,i)=>i).sort((a,b)=>E.TYPES[S.hand[b].t].cost-E.TYPES[S.hand[a].t].cost).slice(0,E.MAX_KEEP).forEach(i=>E.toggleKeep(S,i));
}
const RES=0;
function fight(C,node){const S=E.newBattle(C,rnd,E.battleCfg(node));for(let k=0;k<40&&!S.over;k++){botTurn(S);E.endTurn(S);if(S.over)break;}return{S,win:S.over==='win'};}
const PATH=[['battle',0],['battle',1],['elite',1],['battle',2],['boss',3],['battle',4],['elite',4],['battle',5],['battle',6],['boss',7]];
// ONE=n : trace une seule bataille du niveau n-1 (TYPE=boss|elite pour le type de nœud)
if(process.env.ONE){const C={deck:E.START_DECK.map(c=>({...c})),hq:60,hqMax:60,officers:[],loot:0};const S=E.newBattle(C,rnd,E.battleCfg({type:process.env.TYPE||'battle',levelIdx:+process.env.ONE-1,layer:1,obj:{type:'hq'},boss:process.env.TYPE==='boss'?(process.env.BOSS||'tank'):undefined}));
  for(let k=0;k<15&&!S.over;k++){botTurn(S);console.log('T'+S.turn,'QG',JSON.stringify(S.hq),'| vous',E.units(S,'me').map(u=>u.key+'@'+u.c+'('+u.hp+')').join(' '),'| en',E.units(S,'en').map(u=>u.key+'@'+u.c+'('+u.hp+')').join(' '));
    console.log('   ',E.landCols(S).map(c=>{const f=E.sectorForecast(S,c);return 'c'+c+' '+f.atk+'/'+f.def+' v '+f.enAtk+'/'+f.enDef;}).join(' | '));E.endTurn(S);}
  console.log('fin',JSON.stringify(S.hq),S.over);process.exit(0);}
const N=+process.argv[2]||200;const reach=PATH.map(()=>({n:0,w:0,t:0,hq:0}));let done=0;const stats={jok:0,lv:0};
for(let r=0;r<N;r++){
  const doc=process.env.DOC||E.pickDoctrines(rnd)[0];const C={deck:[...E.START_DECK.map(c=>({...c})),...E.doctrineCards(doc)],hq:E.HQ_START,hqMax:E.HQ_START,officers:[],loot:2};let ok=true;
  for(let i=0;i<PATH.length;i++){
    const [type,lv]=PATH[i];reach[i].n++;reach[i].hq+=C.hq;
    const f=fight(C,{type,levelIdx:lv,layer:Math.max(1,i),obj:{type:'hq'},boss:type==='boss'?(process.env.BOSS||['tank','train','battery'][Math.floor(rnd()*3)]):undefined});reach[i].t+=f.S.turn;if(!f.win){ok=false;break;}reach[i].w++;
    C.hq=Math.min(C.hqMax,f.S.hq.me+12);C.loot+=E.lootFor(f.S,C,type).total;
    if(type==='boss'&&i<PATH.length-1)E.addSupplyBonus(C);
    // carte de récompense : de préférence un type que le paquet n'a pas encore, sinon une unité
    {const opts=E.rewardCards(rnd,type==='battle'?1:2,C.deck);const own=new Set(C.deck.map(c=>c.t));const pick=opts.find(c=>!own.has(c.t)&&!E.isOrder(c))||opts.find(c=>!E.isOrder(c))||opts[0];if(pick&&!process.env.NOREWARD)C.deck.push({...pick});}
    let shop=E.genShop(C,rnd,type!=='battle');
    while(C.hq<C.hqMax*0.6&&C.loot>=4&&!process.env.NOHEAL){C.loot-=4;C.hq=Math.min(C.hqMax,C.hq+12);}
    for(let tries=0;tries<6;tries++){
      const cheapJ=shop.jokers.filter(j=>j.price<=C.loot).sort((a,b)=>b.price-a.price)[0];
      if(cheapJ&&C.officers.length<E.MAX_JOKERS){C.loot-=cheapJ.price;C.officers.push(cheapJ.id);if(cheapJ.id==='brandt'){C.hqMax+=20;C.hq+=20;}shop.jokers=shop.jokers.filter(j=>j!==cheapJ);continue;}
      if((C.supplyBonus||0)<E.MAX_SUPPLY_BONUS&&C.loot>=E.supplyBonusCost(C)){C.loot-=E.supplyBonusCost(C);E.addSupplyBonus(C);continue;}
      const up=C.deck.filter(E.canUpgrade).sort((a,b)=>(a.lv||1)-(b.lv||1));
      if(up.length&&E.upgradeCost(up[0])<=C.loot&&C.loot>=6){const t=up.find(c=>c.t==='tireurs'||c.t==='blinde'||c.t==='croiseur')||up[0];C.loot-=E.upgradeCost(t);t.lv=(t.lv||1)+1;continue;}
      const cc=shop.cards.filter(c=>c.price<=C.loot)[0];if(cc){C.loot-=cc.price;C.deck.push({...cc.card});shop.cards=shop.cards.filter(c=>c!==cc);continue;}
      break;}
  }
  if(ok)done++;stats.jok+=C.officers.length;stats.lv+=C.deck.reduce((s,c)=>s+(c.lv||1)-1,0);
}
console.log('campagne terminée par le bot :',(done*100/N).toFixed(1)+'%','| jokers moyens',(stats.jok/N).toFixed(1),'| niveaux achetés',(stats.lv/N).toFixed(1));
reach.forEach((x,i)=>console.log(`étape ${i+1} ${PATH[i][0].padEnd(6)} niveau ${PATH[i][1]} : atteinte ${x.n}  victoires ${x.n?Math.round(x.w*100/x.n):0}%  tours moy ${x.n?(x.t/x.n).toFixed(1):0}  QG à l'entrée ${x.n?Math.round(x.hq/x.n):0}`));
