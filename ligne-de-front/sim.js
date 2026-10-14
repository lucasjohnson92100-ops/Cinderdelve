// Simulation d'une campagne avec un bot qui fusionne et achète en boutique : node sim.js [nombre de parties]
const fs=require('fs');
const core=fs.readFileSync(process.argv[3]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
const E=new Function(core+';return {newBattle,playCard,endTurn,targetsFor,isPlayable,TYPES,START_DECK,fuseCards,canFuse,canFuseUnits,fuseUnits,moveToFront,battleCfg,rewardCards,cardCost,shuffle,LEVELS,mkCard,lootFor,genShop,upgradeCost,canUpgrade,JOKERS,MAX_JOKERS,HQ_START,genMap};')();
function botTurn(S){
  let again=true;while(again){again=false;outer:for(let i=0;i<S.hand.length;i++)for(let j=i+1;j<S.hand.length;j++)if(E.canFuse(S.hand[i],S.hand[j])){E.fuseCards(S,i,j);again=true;break outer;}}
  // fusion de groupes déjà déployés
  again=true;while(again){again=false;const r=S.front.me;outer2:for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length;j++)if(E.canFuseUnits(S,r[i],r[j])){E.fuseUnits(S,r[i].uid,r[j].uid);again=true;break outer2;}}
  for(let g=0;g<20&&!S.over;g++){let best=null;
    for(let hi=0;hi<S.hand.length;hi++){if(!E.isPlayable(S,hi))continue;const c=S.hand[hi],def=E.TYPES[c.t];
      for(const t of E.targetsFor(S,c)){
        const foes=S.front.en.length, threat=S.front.en.reduce((s,u)=>s+u.dmg*u.menMax,0);
        let sc=(def.cost+(c.c.length>1?2:0))+threat*0.1+foes*0.8-E.cardCost(S,c)*0.3;
        if(!def.land&&foes===0)sc-=1.5;
        if(def.land&&t.pos==='front'&&(def.armor||def.hpm>=3))sc+=0.3; if(def.land&&t.pos==='front'&&!(def.armor||def.hpm>=3))sc-=0.3;
        if(!best||sc>best.sc)best={sc,hi,t};}}
    if(!best)break;E.playCard(S,best.hi,best.t);}
}
function fight(C,node){const S=E.newBattle(C,Math.random,E.battleCfg(node));for(let k=0;k<40&&!S.over;k++){botTurn(S);if(S.over)break;E.endTurn(S);}return{S,win:S.over==='win'};}
const PATH=[['battle',0],['battle',1],['elite',1],['battle',2],['boss',3],['battle',4],['elite',4],['battle',5],['battle',6],['boss',7]];
const N=+process.argv[2]||200;const reach=PATH.map(()=>({n:0,w:0}));let done=0;const stats={jok:0,lv:0};
for(let r=0;r<N;r++){
  const C={deck:E.START_DECK.map(c=>({...c})),hq:E.HQ_START,hqMax:E.HQ_START,officers:[],loot:2};let ok=true;
  for(let i=0;i<PATH.length;i++){
    const [type,lv]=PATH[i];reach[i].n++;
    const f=fight(C,{type,levelIdx:lv,layer:Math.max(1,i),obj:{type:'hq'}});if(!f.win){ok=false;break;}reach[i].w++;
    C.hq=Math.min(C.hqMax,f.S.hq.me+12);C.loot+=E.lootFor(f.S,C,type).total;
    let shop=E.genShop(C,Math.random,type!=='battle');
    for(let tries=0;tries<6;tries++){
      const cheapJ=shop.jokers.filter(j=>j.price<=C.loot).sort((a,b)=>b.price-a.price)[0];
      if(cheapJ&&C.officers.length<E.MAX_JOKERS){C.loot-=cheapJ.price;C.officers.push(cheapJ.id);if(cheapJ.id==='brandt'){C.hqMax+=20;C.hq+=20;}shop.jokers=shop.jokers.filter(j=>j!==cheapJ);continue;}
      const up=C.deck.filter(E.canUpgrade).sort((a,b)=>(a.lv||1)-(b.lv||1));
      if(up.length&&E.upgradeCost(up[0])<=C.loot&&C.loot>=6){const t=up.find(c=>c.t==='tireurs'||c.t==='blinde'||c.t==='croiseur')||up[0];C.loot-=E.upgradeCost(t);t.lv=(t.lv||1)+1;continue;}
      const cc=shop.cards.filter(c=>c.price<=C.loot)[0];if(cc){C.loot-=cc.price;C.deck.push({...cc.card});shop.cards=shop.cards.filter(c=>c!==cc);continue;}
      break;}
  }
  if(ok)done++;stats.jok+=C.officers.length;stats.lv+=C.deck.reduce((s,c)=>s+(c.lv||1)-1,0);
}
console.log('campagne terminée par le bot :',(done*100/N).toFixed(1)+'%','| jokers moyens',(stats.jok/N).toFixed(1),'| niveaux achetés',(stats.lv/N).toFixed(1));
reach.forEach((x,i)=>console.log(`étape ${i+1} ${PATH[i][0].padEnd(6)} niveau ${PATH[i][1]} : atteinte ${x.n}  victoires ${x.n?Math.round(x.w*100/x.n):0}%`));
