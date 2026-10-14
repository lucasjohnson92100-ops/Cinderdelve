// Simulation d'une campagne : un bot déploie, déplace, fusionne et achète en boutique. node sim.js [parties] [fichier] [ravitaillement gardé pour les déplacements]
// Simulation d'une campagne : un bot déploie, déplace, fusionne et achète en boutique (node sim.js [parties] [moteur])
const fs=require('fs');
const core=fs.readFileSync(process.argv[3]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
const E=new Function(core+';return {playerAttack,canAttack,attackOptions,addSupplyBonus,supplyBonusCost,MAX_SUPPLY_BONUS,newBattle,endTurn,TYPES,START_DECK,fuseCards,canFuse,canFuseUnits,fuseUnits,snapshotState,restoreState,planDeploy,placeCard,deployCells,reachable,moveUnit,unitAt,units,bestMove,targetsFrom,distMap,terrainCost,mkUnit,genMap,battleCfg,lootFor,genShop,upgradeCost,canUpgrade,MAX_JOKERS,HQ_START,GW,GH,TERRAIN,dist,isLandCell};')();
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
  const foes=E.units(S,'en').filter(u=>u.land);
  const tmp=E.mkUnit(S,'me',card.t,card.c,card.lv);
  let best=null;
  const goals=foes.length?foes.map(t=>[t.r,t.c]):[...Array(E.GW).keys()].map(c=>[0,c]);
  const dm=def.cls==='air'||def.cls==='ship'?null:E.distMap(S,def.cls,goals);
  for(const [r,c] of cells){
    let sc=0;const ts=E.targetsFrom(S,tmp,r,c);
    if(def.cls==='ship'||def.cls==='air'){
      sc=ts.length*10+(tmp.kw.includes('bomb')&&r===0?5:0)-E.dist(r,c,foes.length?foes[0].r:0,foes.length?foes[0].c:c)*0.3;
      if(def.cls==='ship'&&!ts.length)sc-=(r)*0.5; // monter vers le nord
    }else{ const k=r+','+c;sc=-(dm.has(k)?dm.get(k):99)*3+(E.TERRAIN[S.grid[r][c]].cover||0)*6+(S.grid[r][c]==='village'?3:0)+(def.cls!=='foot'&&S.grid[r][c]==='route'?1:0); }
    if(!best||sc>best.sc)best={sc,r,c};
  }
  return best;
}
function botTurn(S,reserve){
  // fusion de groupes voisins
  let again=true;while(again){again=false;const us=E.units(S,'me');outer2:for(const a of us)for(const b of us)if(E.canFuseUnits(S,a,b)){E.fuseUnits(S,a.uid,b.uid);again=true;break outer2;}}
  const snap=E.snapshotState(S);
  const budget=Math.max(0,S.supply-reserve);
  fuseAllHand(S);const A=evalGroups(S,budget);E.restoreState(S,snap);
  const B=evalGroups(S,budget);
  let sel;
  if(A.value>B.value){fuseAllHand(S);sel=evalGroups(S,budget);}else sel=B;
  if(sel.idxs.length){
    const cards=sel.idxs.map(i=>S.hand[i]).sort((a,b)=>E.TYPES[b.t].cost-E.TYPES[a.t].cost);
    for(const card of cards){const hi=S.hand.indexOf(card);if(hi<0)continue;const cell=chooseCell(S,card);if(!cell)continue;E.placeCard(S,hi,cell.r,cell.c);}
  }
  // déplacements, unités les plus avancées d'abord
  const mine=E.units(S,'me').sort((a,b)=>a.r-b.r);
  for(const u of mine){
    if(S.supply<=0)break;if(u.mvLeft<=0)continue;
    if(u.ttl&&u.kw.includes('bomb'))continue;
    const m=E.bestMove(S,u,Math.min(u.mvLeft,S.supply));
    if(m&&(m.r!==u.r||m.c!==u.c)&&m.cost>0)E.moveUnit(S,u.uid,m.r,m.c);
  }
  // attaques : le bot vise la meilleure cible (le plus de dégâts utiles) ou le QG
  for(const u of E.units(S,'me').sort((a,b)=>a.r-b.r)){
    if(S.over)break;if(!E.canAttack(S,u))continue;
    const o=E.attackOptions(S,u);
    if(o.units.length){const t=o.units.slice().sort((a,b)=>(a.hp-b.hp))[0];const pick=u.kw.includes('hunt')||u.kw.includes('weak')?t:o.units.slice().sort((a,b)=>E.dist(u.r,u.c,a.r,a.c)-E.dist(u.r,u.c,b.r,b.c)||a.hp-b.hp)[0];E.playerAttack(S,u.uid,pick.uid);}
    else if(o.hq)E.playerAttack(S,u.uid,'hq');
  }
}
const RES=+process.argv[4]||3;
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
