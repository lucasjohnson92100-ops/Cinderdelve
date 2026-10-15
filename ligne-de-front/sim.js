// Simulation d'une campagne : un bot déploie, fusionne, attaque et achète en boutique (node sim.js [parties] [moteur])
const fs=require('fs');
const core=fs.readFileSync(process.argv[3]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
const E=new Function(core+';return {playOrder,discardHand,isOrder,deployCells,GW,airStrike,playerAttack,canAttack,attackOptions,addSupplyBonus,supplyBonusCost,MAX_SUPPLY_BONUS,newBattle,endTurn,TYPES,START_DECK,fuseCards,canFuse,canFuseUnits,fuseUnits,snapshotState,restoreState,planDeploy,placeCard,deployCells,unitAt,units,targetsFrom,hqInRange,terrainMult,FRONT,mkUnit,genMap,battleCfg,lootFor,genShop,upgradeCost,canUpgrade,MAX_JOKERS,HQ_START,GW,GH,TERRAIN,dist,isLandCell};')();
const rnd=Math.random;
function fuseAllHand(S){let again=true;while(again){again=false;outer:for(let i=0;i<S.hand.length;i++)for(let j=i+1;j<S.hand.length;j++)if(E.canFuse(S.hand[i],S.hand[j])){E.fuseCards(S,i,j);again=true;break outer;}}}
function evalGroups(S,budget){
  const real=S.supply;S.supply=budget;
  const groups=new Map();S.hand.forEach(c=>{if(!groups.has(c.c))groups.set(c.c,[]);});
  for(const k of groups.keys())S.hand.forEach((c,i)=>{if(c.c===k||(k.length>1&&c.c.length===1&&k.includes(c.c)))groups.get(k).push(i);});
  let best={value:-1,idxs:[]};
  for(const idxs of groups.values()){const n=idxs.length;for(let m=1;m<(1<<n);m++){const sel=idxs.filter((_,b)=>m>>b&1);if(!E.planDeploy(S,sel).ok)continue;
    let v=0;for(const i of sel){const c=S.hand[i],d=E.TYPES[c.t];v+=d.cost+(c.c.length>1?2:0)+((c.lv||1)-1)*0.5;}
    if(v>best.value)best={value:v,idxs:sel};}}
  S.supply=real;return best;
}
function chooseCell(S,card){
  const cells=E.deployCells(S,card),def=E.TYPES[card.t];if(!cells.length)return null;
  const tmp=E.mkUnit(S,'me',card.t,card.c,card.lv);
  let best=null;
  for(const [r,c] of cells){
    let sc=0;
    if(card.t==='bombardier'){sc=r<0?3:E.units(S,'en').filter(t=>Math.abs(t.r-r)<=1&&Math.abs(t.c-c)<=1).length*4;}
    else{
      tmp.r=r;tmp.c=c;const ts=E.targetsFrom(S,tmp,r,c),foesHere=E.units(S,'en').some(t=>t.land&&t.c===c),mineHere=E.units(S,'me').some(t=>t.land&&t.c===c);
      sc=ts.length*4+(!foesHere&&E.hqInRange(S,tmp,r,c)?3:0);
      if(def.land){sc+=(E.terrainMult(card.c,S.grid[r][c])-1)*8+(E.TERRAIN[S.grid[r][c]].cover||0)*4+(foesHere&&!mineHere?5:0)+(S.grid[r][c]==='village'&&!mineHere?2:0);
        if(def.rng[1]>1&&r===3)sc+=1;if(def.rng[1]<=1&&r===2)sc+=1;}
    }
    if(!best||sc>best.sc)best={sc,r,c};
  }
  return best;
}
const ORD=(S,t)=>S.hand.findIndex(c=>c.t===t);
const enemiesIn=(S,c)=>E.units(S,'en').filter(u=>u.c===c);
function playOrders(S,phase){
  const play=(t,r,c)=>{const i=ORD(S,t);if(i>=0&&E.TYPES[t].cost<=S.supply)return E.playOrder(S,i,r,c);return null;};
  if(phase==='pre'){
    while(ORD(S,'ravitaillement')>=0&&play('ravitaillement',2,0));
    // barrage sur le secteur ennemi le plus chargé
    let best=-1,bc=-1;for(let c=0;c<E.GW;c++){const v=enemiesIn(S,c).reduce((t,u)=>t+Math.min(u.hp,6),0);if(v>best){best=v;bc=c;}}
    if(best>=6)play('barrage',1,bc);
    // embuscade là où un renfort arrive au front
    const pd=S.plan.find(p=>p.k==='deploy'&&p.r===1);if(pd)play('embuscade',1,pd.c);
    // repli des unités très abîmées au front
    E.units(S,'me').filter(u=>u.land&&u.r===2&&u.hp<u.hpMax*0.4).forEach(u=>play('repli',u.r,u.c));
  }else{
    // assaut : secteur où au moins 2 unités ont déjà attaqué
    for(let c=0;c<E.GW;c++){if(E.units(S,'me').filter(u=>u.c===c&&u.attacked&&!u.fresh&&u.dmg>0).length>=2&&play('assaut',2,c))return true;}
    // protections pour le tour ennemi
    for(let c=0;c<E.GW;c++){const foes=enemiesIn(S,c).length,mine=E.units(S,'me').filter(u=>u.c===c&&u.land);if(!foes)continue;
      if(!mine.length||mine.some(u=>u.hp<u.hpMax*0.5)){if(play('fumigenes',2,c))continue;}
      if(mine.length&&play('contreattaque',2,c))continue;
      const u=mine.find(x=>x.r===2&&!x.dig);if(u)play('retranchement',u.r,u.c);}
  }
  return false;
}
function attackAll(S){
  for(const u of E.units(S,'me').sort((a,b)=>a.r-b.r)){
    if(S.over)break;if(!E.canAttack(S,u))continue;
    const o=E.attackOptions(S,u);
    if(o.units.length){const t=o.units.slice().sort((a,b)=>(b.marked-a.marked)||(a.hp-b.hp))[0];const pick=u.kw.includes('hunt')||u.kw.includes('weak')||u.kw.includes('arty')?t:o.units.slice().sort((a,b)=>E.dist(u.r,u.c,a.r,a.c)-E.dist(u.r,u.c,b.r,b.c)||a.hp-b.hp)[0];E.playerAttack(S,u.uid,pick.uid);}
    else if(o.hq)E.playerAttack(S,u.uid,'hq');
  }
}
function botTurn(S,reserve){
  // défausse des cartes injouables (une fois par tour)
  if(S.discards>0){const bad=S.hand.map((c,i)=>i).filter(i=>{const c=S.hand[i];return E.TYPES[c.t].cost>S.supply+1||!E.deployCells(S,c).length;});if(bad.length>=2)E.discardHand(S,bad.slice(0,5));}
  playOrders(S,'pre');
  // fusion de groupes voisins
  let again=true;while(again){again=false;const us=E.units(S,'me');outer2:for(const a of us)for(const b of us)if(E.canFuseUnits(S,a,b)){E.fuseUnits(S,a.uid,b.uid);again=true;break outer2;}}
  const keep=S.hand.filter(c=>E.isOrder(c));S.hand=S.hand.filter(c=>!E.isOrder(c));
  const snap=E.snapshotState(S);
  const budget=Math.max(0,S.supply-reserve);
  fuseAllHand(S);const A=evalGroups(S,budget);E.restoreState(S,snap);
  const B=evalGroups(S,budget);
  let sel;
  if(A.value>B.value){fuseAllHand(S);sel=evalGroups(S,budget);}else sel=B;
  if(sel.idxs.length){
    const cards=sel.idxs.map(i=>S.hand[i]).sort((a,b)=>E.TYPES[b.t].cost-E.TYPES[a.t].cost);
    for(const card of cards){const hi=S.hand.indexOf(card);if(hi<0)continue;const cell=chooseCell(S,card);if(!cell)continue;if(card.t==='bombardier')E.airStrike(S,hi,cell.r,cell.c);else E.placeCard(S,hi,cell.r,cell.c);}
  }
  S.hand.push(...keep);
  attackAll(S);
  if(playOrders(S,'post'))attackAll(S);
  playOrders(S,'post');
}
const RES=0;
function fight(C,node){const S=E.newBattle(C,rnd,E.battleCfg(node));for(let k=0;k<40&&!S.over;k++){botTurn(S,RES);E.endTurn(S);if(S.over)break;}return{S,win:S.over==='win'};}
const PATH=[['battle',0],['battle',1],['elite',1],['battle',2],['boss',3],['battle',4],['elite',4],['battle',5],['battle',6],['boss',7]];
const N=+process.argv[2]||200;const reach=PATH.map(()=>({n:0,w:0,t:0}));let done=0;const stats={jok:0,lv:0};
for(let r=0;r<N;r++){
  const C={deck:E.START_DECK.map(c=>({...c})),hq:E.HQ_START,hqMax:E.HQ_START,officers:[],loot:2};let ok=true;
  for(let i=0;i<PATH.length;i++){
    const [type,lv]=PATH[i];reach[i].n++;
    const f=fight(C,{type,levelIdx:lv,layer:Math.max(1,i),obj:{type:'hq'}});reach[i].t+=f.S.turn;if(!f.win){ok=false;break;}reach[i].w++;
    C.hq=Math.min(C.hqMax,f.S.hq.me+12);C.loot+=E.lootFor(f.S,C,type).total;
    if(type==='boss'&&i<PATH.length-1)E.addSupplyBonus(C);
    let shop=E.genShop(C,rnd,type!=='battle');
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
reach.forEach((x,i)=>console.log(`étape ${i+1} ${PATH[i][0].padEnd(6)} niveau ${PATH[i][1]} : atteinte ${x.n}  victoires ${x.n?Math.round(x.w*100/x.n):0}%  tours moy ${x.n?(x.t/x.n).toFixed(1):0}`));
