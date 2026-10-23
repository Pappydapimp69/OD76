// Seeded bracket sweeps for the B178 Colosseum rework. Coaches: good (guards real Ascensions and Focus volleys except a
// Breaker's, never a wind-up; ascends into an open guard), naive (guards every wind-up and Focus too) and none (no input).
function coachB178(kind){
 return f=>{const me=f.a,op=f.b,c={focus:false,ascend:false,guard:false};if(kind==='none')return c;
  c.focus=me.focusCd<=0&&!op.guarding&&(op.hp<op.maxHp*.7||op.broken>0);
  c.ascend=me.heat>=70&&me.ascT<=0&&!op.guarding;
  const threat=kind==='naive'?(op.ascT>0||op.windT>0||op.focus>0):(op.ascT>0||(op.focus>0&&op.src.trick!=='breaker'));
  c.guard=threat&&me.glow>.2&&me.broken<=0&&me.ascT<=0;return c};
}
function sweepB178(rank,stats,coach,n=60){
 ranchB99.stats=Object.assign({},stats);B108_RANKS.forEach((k,i)=>{colSaveB163.wins[k.id]=i<rank?1:0}); /* a player at this rank has won the ranks below */const reach=[0,0,0];let champ=0;
 for(let s=1;s<=n;s++){
  const br=bracketB163(rank,s*104729);
  while(!br.out&&!br.champion){const pair=pipPairB163(br),opp=br.entrants[br.entrants[pair[0]].pip?pair[1]:pair[0]];reach[br.round]++;
   const f=runFightB163(br.entrants.find(e=>e.pip),opp,(br.seed*13+br.round*101)>>>0,coachB178(coach));playRoundB163(br,f.winner===0)}
  if(br.champion)champ++;
 }
 // per-round win rate = reached next round / reached this round
 const won=[reach[1],reach[2],champ];return{rate:reach.map((r,i)=>r?won[i]/r:0),champ:champ/n};
}
function runFocusedChecksB178(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const pct=x=>Math.round(x*100)+'%',profiles=[[1,{range:4,speed:3,power:4,guard:3}],[3,{range:12,speed:10,power:12,guard:10}],[5,{range:60,speed:45,power:70,guard:50}],[5,{range:200,speed:150,power:220,guard:160}]];
 const rows=[];for(const [rank,st] of profiles)for(const coach of ['good','naive','none']){const r=sweepB178(rank,st,coach);rows.push({rank,tot:st.range+st.speed+st.power+st.guard,coach,...r})}
 for(const r of rows)out.push({name:`sweep rank ${B108_RANKS[r.rank].id} Pip ${r.tot} ${r.coach}: QF ${pct(r.rate[0])} SF ${pct(r.rate[1])} F ${pct(r.rate[2])} · bracket ${pct(r.champ)}`,ok:true});
 test('B178 rivals scale with Pip: an overtrained Pip no longer sweeps',()=>{const g=rows.filter(r=>r.coach==='good'&&r.tot>=200);assert(g.every(r=>r.champ<=.45),g.map(r=>pct(r.champ)).join())});
 test('B178 once scaling applies, a good coach wins about 1 bracket in 4 (15-45%)',()=>{const g=rows.filter(r=>r.coach==='good'&&r.rank===5);assert(g.every(r=>r.champ>=.15&&r.champ<=.45),g.map(r=>pct(r.champ)).join())});
 test('B178 no coaching wins no brackets',()=>{const g=rows.filter(r=>r.coach==='none');assert(g.every(r=>r.champ<=.05),g.map(r=>pct(r.champ)).join())});
 test('B178 Breaker: a Focus shot into a raised guard lands in full and cracks it',()=>{
  ranchB99.stats={range:20,speed:20,power:20,guard:20};const br=rivalB163(3,0);br.trick='breaker';const f=fightB163(pipEntrantB163(),br,1);
  f.a.guarding=true;f.a.glow=1;const hp=f.a.hp;landShotB163(f,{from:1,hit:true,homing:true,dmg:10,asc:false});
  const d1=hp-f.a.hp;f.b.src={...f.b.src,trick:''};f.a.guarding=true;const hp2=f.a.hp;landShotB163(f,{from:1,hit:true,homing:true,dmg:10,asc:false});
  assert(d1>2.5*(hp2-f.a.hp)&&f.a.glow<1,'full '+d1+' vs '+(hp2-f.a.hp)+' glow '+f.a.glow)});
 test('B178 Feint: a fake wind-up breaks a guard raised against it; a real one ascends',()=>{
  ranchB99.stats={range:20,speed:20,power:20,guard:20};const r=rivalB163(3,0);r.trick='feint';const f=fightB163(pipEntrantB163(),r,1);
  f.b.heat=80;let c=aiCmdB163(f.b,f.a,0);assert(f.b.windT>0&&!c.ascend,'wind');f.a.guarding=true;
  for(let k=0;k<60&&f.b.windT>0;k++)c=aiCmdB163(f.b,f.a,0);assert(!c.ascend&&f.a.broken>0,'fake broke guard');
  f.b.feintCd=0;f.a.guarding=false;f.a.broken=0;aiCmdB163(f.b,f.a,0);for(let k=0;k<60&&f.b.windT>0;k++)c=aiCmdB163(f.b,f.a,0);assert(c.ascend,'real ascends')});
 test('B178 tricks and lines: strikers break guards, sly Pips feint',()=>{ranchB99.stats={range:20,speed:20,power:20,guard:20};const rs=[0,1,2,3,4,5,6].map(i=>rivalB163(3,i));
  assert(rs.some(r=>r.trick==='breaker'&&/crack a raised Guard/.test(r.line))&&rs.some(r=>r.trick==='feint'&&/wind-up/.test(r.line)),'tricks')});
 return out;
}
