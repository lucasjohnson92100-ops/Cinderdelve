const fs=require('fs');
const src=fs.readFileSync(process.argv[2]||__dirname+'/index.html','utf8');
const core=src.split('// ==CORE==')[1].split('// ==/CORE==')[0];
const api=new Function(core+';return {makeDeck,shuffle,evaluate,scorePlay,HAND_TYPES,blindTarget,RELICS,passive};')();
const T=(s,v,eng=null)=>({suit:s,v,eng});
const ev=a=>api.evaluate(a).type;
const cases=[
 [[T('B',3),T('B',4),T('B',5),T('B',6),T('B',7)],'suiteCouleur'],
 [[T('B',3),T('C',3),T('K',3),T('D',1)],'haute'],
 [[T('B',3),T('B',3),T('B',3),T('B',3)],'carre'],
 [[T('B',3),T('B',3),T('B',3),T('C',4)],'brelan'],
 [[T('B',3),T('B',4),T('B',5),T('C',9),T('C',9)],'sequencePaire'],
 [[T('B',3),T('B',4),T('B',5),T('B',9),T('B',9)],'mahjong'],
 [[T('B',3),T('B',3),T('B',3),T('C',9),T('C',9)],'full'],
 [[T('B',3),T('B',5),T('B',6),T('B',8),T('B',9)],'couleur'],
 [[T('B',3),T('C',4),T('K',5),T('B',6),T('C',7)],'suite'],
 [[T('B',3),T('B',4),T('B',5)],'sequence'],
 [[T('B',3),T('B',3),T('C',5),T('C',5)],'doublePaire'],
 [[T('D',1),T('D',1)],'paire'],
 [[T('D',1),T('D',2),T('D',3)],'haute'],
 [[T('B',3),T('C',4),T('K',5)],'haute'],
];
let bad=0;cases.forEach(([t,exp],i)=>{const g=ev(t);if(g!==exp){bad++;console.log('FAIL',i,g,'expected',exp);}});
console.log(bad?'tests KO':'evaluate OK ('+cases.length+' cas)');
// score check: paire de 5 -> (10+5+5)*2=40
const r=api.scorePlay([T('B',5),T('B',5)],{levels:{},relics:[]});console.log('paire de 5:',r.total,'(attendu 40)');
const r2=api.scorePlay([T('B',5),T('B',5)],{levels:{},relics:['lantern','twins']});console.log('+lanterne+jumelles:',r2.total,'(attendu 20*(2+4+10)=320)');
// bot sans relique
function subsets(h){const out=[];const n=h.length;for(let m=1;m<(1<<n);m++){let c=0;for(let i=0;i<n;i++)if(m>>i&1)c++;if(c<=5){out.push(h.filter((_,i)=>m>>i&1));}}return out;}
function runRound(target,hands,discs,levels,relics){
  let draw=api.shuffle(api.makeDeck()),hand=[],score=0;
  const fill=()=>{while(hand.length<8&&draw.length)hand.push(draw.pop());};
  fill();
  for(let h=hands;h>0;h--){
    const all=subsets(hand);
    let best=null,bs=-1;
    for(const s of all){const sc=api.scorePlay(s,{levels,relics,isFirst:h===hands,isLast:h===1}).total;if(sc>bs){bs=sc;best=s;}}
    const need=(target-score)/h;
    if(bs<need*0.9&&discs>0){discs--;h++;
      // defausse: garde le meilleur sous-ensemble, jette le reste (max 5)
      const keep=new Set(best);const toss=hand.filter(t=>!keep.has(t)).slice(0,5);
      hand=hand.filter(t=>!toss.includes(t));fill();continue;}
    score+=bs;hand=hand.filter(t=>!best.includes(t));fill();
    if(score>=target)return true;
  }
  return false;
}
const N=150;
for(const [label,levels,relics] of [['sans relique',{}, []],['2 reliques simples',{},['lantern','brush']],['4 reliques',{},['lantern','brush','twins','seal']]]){
  const out=[];
  for(let a=1;a<=3;a++){for(let b=0;b<3;b++){let w=0;const tg=api.blindTarget(a,b);for(let i=0;i<N;i++)if(runRound(tg,4,3,levels,relics))w++;out.push(`A${a}${'SBX'[b]}:${Math.round(w*100/N)}%`);}}
  console.log(label.padEnd(20),out.join(' '));
}
