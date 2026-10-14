// Simulation d'une campagne avec un bot simple qui achète en boutique : node sim.js [nombre de parties]
const fs=require('fs');
const core=fs.readFileSync(process.argv[3]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
const E=new Function(core+';return {newBattle,playCard,endTurn,targetsFor,isPlayable,units,TYPES,START_DECK,fuseCards,canFuse,battleCfg,rewardCards,cardCost,shuffle,LEVELS,mkCard,lootFor,genShop,upgradeCost,canUpgrade,JOKERS,MAX_JOKERS,HQ_START,cardKey,REFORM_COST};')();
function botTurn(S){
  let again=true;while(again){again=false;outer:for(let i=0;i<S.hand.length;i++)for(let j=i+1;j<S.hand.length;j++)if(E.canFuse(S.hand[i],S.hand[j])){E.fuseCards(S,i,j);again=true;break outer;}}
  for(let g=0;g<20&&!S.over;g++){let best=null;
    for(let hi=0;hi<S.hand.length;hi++){if(!E.isPlayable(S,hi))continue;const c=S.hand[hi],def=E.TYPES[c.t];
      for(const t of E.targetsFor(S,c)){const L=S.lanes[t.lane];const threat=L.en.filter(Boolean).reduce((s,u)=>s+u.dmg*u.menMax,0);const foes=L.en.filter(Boolean).length;
        let sc=(def.cost+(c.c.length>1?2:0))+threat*0.15+foes*0.8+(L.me[0]?0:0.5)-E.cardCost(S,c)*0.3;if(!def.land&&foes===0)sc-=1.5;
        if(!best||sc>best.sc)best={sc,hi,t};}}
    if(!best)break;E.playCard(S,best.hi,best.t);}
}
function fight(C,node){const S=E.newBattle(C,Math.random,E.battleCfg(node));for(let k=0;k<40&&!S.over;k++){botTurn(S);if(S.over)break;E.endTurn(S);}return{S,win:S.over==='win'};}
// campagne : une bataille par étage, le bot achète en boutique
const PATH=[['battle',0],['battle',1],['elite',1],['battle',2],['boss',3],['battle',4],['elite',4],['battle',5],['battle',6],['boss',7]];
const N=+process.argv[2]||200;const reach=PATH.map(()=>({n:0,w:0}));let done=0;const stats={jok:0,lv:0};
for(let r=0;r<N;r++){
  const C={deck:E.START_DECK.map(c=>({...c})),hq:E.HQ_START,hqMax:E.HQ_START,officers:[],loot:2};
  let ok=true;
  for(let i=0;i<PATH.length;i++){
    const [type,lv]=PATH[i];reach[i].n++;
    const node={type,levelIdx:lv,layer:Math.max(1,i),obj:{type:'hq'}};
    const f=fight(C,node);if(!f.win){ok=false;break;}reach[i].w++;
    C.hq=Math.min(C.hqMax,f.S.hq.me+12);if(C.officers.includes('brandt')&&false){}
    const lo=E.lootFor(f.S,C,type);C.loot+=lo.total;
    // intendance
    let shop=E.genShop(C,Math.random,type!=='battle');
    for(let tries=0;tries<6;tries++){
      const cheapJ=shop.jokers.filter(j=>j.price<=C.loot).sort((a,b)=>b.price-a.price)[0];
      if(cheapJ&&C.officers.length<E.MAX_JOKERS){C.loot-=cheapJ.price;C.officers.push(cheapJ.id);if(cheapJ.id==='brandt'){C.hqMax+=20;C.hq+=20;}shop.jokers=shop.jokers.filter(j=>j!==cheapJ);continue;}
      const up=C.deck.filter(E.canUpgrade).sort((a,b)=>(a.lv||1)-(b.lv||1));
      if(up.length&&E.upgradeCost(up[0])<=C.loot&&C.loot>=6){const t=up.find(c=>c.t==='tireurs'||c.t==='blinde'||c.t==='croiseur')||up[0];C.loot-=E.upgradeCost(t);t.lv=(t.lv||1)+1;continue;}
      const cc=shop.cards.filter(c=>c.price<=C.loot)[0];
      if(cc){C.loot-=cc.price;C.deck.push({...cc.card});shop.cards=shop.cards.filter(c=>c!==cc);continue;}
      break;
    }
  }
  if(ok)done++;stats.jok+=C.officers.length;stats.lv+=C.deck.reduce((s,c)=>s+(c.lv||1)-1,0);
}
console.log('campagne terminée par le bot :',(done*100/N).toFixed(1)+'%','| jokers moyens en fin de partie',(stats.jok/N).toFixed(1),'| niveaux achetés',(stats.lv/N).toFixed(1));
reach.forEach((x,i)=>console.log(`étape ${i+1} ${PATH[i][0].padEnd(6)} niveau ${PATH[i][1]} : atteinte ${x.n}  victoires ${x.n?Math.round(x.w*100/x.n):0}%`));
