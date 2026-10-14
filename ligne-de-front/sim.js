// Simulation d'équilibrage avec un bot simple : node sim.js [nombre de parties]
const fs=require('fs');
const core=fs.readFileSync(process.argv[3]||__dirname+'/index.html','utf8').split('// ==CORE==')[1].split('// ==/CORE==')[0];
const E=new Function(core+';return {newBattle,playCard,endTurn,targetsFor,isPlayable,units,supports,TYPES,START_DECK,fuseCards,canFuse,battleCfg,rewardCards,cardCost,shuffle,LEVELS,mkCard,genMap};')();
function botTurn(S,fuse=true){
  if(fuse){ // fusionne toutes les paires possibles
    let again=true;while(again){again=false;
      outer:for(let i=0;i<S.hand.length;i++)for(let j=i+1;j<S.hand.length;j++)if(E.canFuse(S.hand[i],S.hand[j])){E.fuseCards(S,i,j);again=true;break outer;}}
  }
  for(let g=0;g<20&&!S.over;g++){
    let best=null;
    for(let hi=0;hi<S.hand.length;hi++){
      if(!E.isPlayable(S,hi))continue;const c=S.hand[hi],def=E.TYPES[c.t];
      for(const t of E.targetsFor(S,c)){
        const L=S.lanes[t.lane];const threat=L.en.filter(Boolean).reduce((s,u)=>s+u.dmg*u.menMax,0);const foes=L.en.filter(Boolean).length;
        let sc=(def.cost+ (c.c.length>1?2:0))*1.0+threat*0.15+foes*0.8+(L.me[0]?0:0.5)-E.cardCost(S,c)*0.3;
        if(!def.land&&foes===0)sc-=1.5;
        if(!best||sc>best.sc)best={sc,hi,t};
      }
    }
    if(!best)break;E.playCard(S,best.hi,best.t);
  }
}
const N=+process.argv[2]||300;
function fight(C,cfg,fuse){const S=E.newBattle(C,Math.random,cfg);for(let k=0;k<40&&!S.over;k++){botTurn(S,fuse);if(S.over)break;E.endTurn(S);}return{win:S.over==='win',hq:S.hq.me,turns:S.turn};}
function rate(levelIdx,obj,elite,boss,extra,fuse=true){let w=0,hq=0,t=0;for(let i=0;i<N;i++){
  const deck=E.START_DECK.slice();for(let k=0;k<extra;k++)deck.push(E.rewardCards()[Math.floor(Math.random()*3)]);
  const C={level:0,deck,hq:60,hqMax:60,officers:levelIdx>=2?['ashby']:[]};
  const f=fight(C,E.battleCfg({type:boss?'boss':elite?'elite':'battle',levelIdx,layer:1,obj}),fuse);if(f.win){w++;hq+=f.hq;}t+=f.turns;}
  return `${Math.round(w*100/N)}% (QG ${(hq/Math.max(1,w)).toFixed(0)}, ${(t/N).toFixed(1)}t)`;}
console.log('--- paquet de départ (11 cartes), avec fusions ---');
for(const lv of [0,1,2,3])console.log('niveau',lv,'| QG',rate(lv,{type:'hq'},false,lv===3,lv),'| sans fusion',rate(lv,{type:'hq'},false,lv===3,lv,false));
console.log('--- plus loin (cartes de récompense en plus) ---');
for(const lv of [4,5,6,7])console.log('niveau',lv,'| QG',rate(lv,{type:'hq'},false,lv===7,lv),'| tenir',rate(lv,{type:'hold',n:5+(lv>=4?1:0)+(lv>=6?1:0)},false,false,lv),'| élite',rate(lv,{type:'hq'},true,false,lv));
