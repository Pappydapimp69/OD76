function runFocusedChecksB163(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const even=(n,ai='patient')=>({name:'e',stats:{range:n,speed:n,power:n,guard:n},asc:2,ai});
 test('B163 fold seeding pairs 1v8, 4v5, 2v7, 3v6 and keeps seeds 1 and 2 apart until the final',()=>{
  for(const st of [{range:0,speed:0,power:0,guard:0},{range:6,speed:6,power:6,guard:6},{range:40,speed:40,power:40,guard:40}])for(let rank=0;rank<6;rank++){
   Object.assign(ranchB99.stats,st);const br=bracketB163(rank,7),seedOf=i=>br.entrants[i].seed;
   assert(pairsB163(br).map(p=>p.map(seedOf).join('v')).join(',')==='1v8,4v5,2v7,3v6','pairs '+pairsB163(br).map(p=>p.map(seedOf).join('v')));
   const half=s=>br.slots.findIndex(i=>seedOf(i)===s)<4;assert(half(1)!==half(2),'seeds 1 and 2 share a half');
   assert(new Set(br.entrants.map(e=>e.seed)).size===8&&br.entrants.filter(e=>e.pip).length===1,'seeds not 1..8 with one Pip');
  }
  Object.assign(ranchB99.stats,{range:0,speed:0,power:0,guard:0});
 });
 test('B163 rival stat totals follow the rank budget and spread',()=>{
  for(let r=0;r<6;r++)for(let i=0;i<7;i++){const v=rivalB163(r,i);assert(totalB163(v)===Math.round(B163_BUDGET[r]*B163_SPREAD[i]),`rank ${r} rival ${i}: ${totalB163(v)}`);assert(v.asc===r,'asc')}
 });
 test('B163 Ascend is refused under 70% HEAT for both Pips',()=>{
  const f=fightB163(even(5),even(5),3);f.a.heat=69.9;f.b.heat=69.9;
  stepFightB163(f,{ascend:true},{ascend:true});assert(f.a.ascT===0&&f.b.ascT===0,'ascended under 70');
  f.a.heat=70;stepFightB163(f,{ascend:true},{});assert(f.a.ascT>0,'did not ascend at 70');
 });
 test('B163 same seed and command timeline give the same fight; cosmetic rolls do not change it',()=>{
  const coach=f=>({focus:Math.floor(f.t*60)%300===0,ascend:true,guard:f.b.ascT>0});
  const a=runFightB163(even(8),even(9),42,coach);
  const b=runFightB163(even(8),even(9),42,f=>{Math.random();Math.random();return coach(f)});
  assert(a.winner===b.winner&&a.t===b.t&&a.a.hp===b.a.hp&&a.b.hp===b.b.hp,'diverged');
 });
 test('B163 even fights last 20-40 s over 50 seeds with no early knockouts',()=>{
  for(const n of [0,5,20,60]){const ts=[];for(let s=1;s<=50;s++)ts.push(runFightB163(even(n),even(n),s).t);ts.sort((x,y)=>x-y);
   assert(ts[25]>=20&&ts[25]<=40,`level ${n} median ${ts[25].toFixed(1)}`);assert(ts[0]>=12,`level ${n} fastest ${ts[0].toFixed(1)}`)}
 });
 test('B163 every ranch stat pays off in the ring',()=>{
  for(const k of B163_STATS){const st=even(10);st.stats={...st.stats,[k]:14};let w=0;for(let s=1;s<=40;s++)if(runFightB163(st,even(10),s).winner===0)w++;assert(w>=24,`${k} +4 won ${w}/40`)}
 });
 test('B163 each coaching command changes at least 1 fight in 3',()=>{
  const best=f=>aiCmdB163(f.a,f.b,f.t);
  for(const cmd of ['focus','ascend','guard']){let changed=0;
   for(let s=1;s<=30;s++){const x=runFightB163(even(10),even(10),s,best),y=runFightB163(even(10),even(10),s,f=>({...best(f),[cmd]:false}));
    if(x.winner!==y.winner||Math.abs(x.a.hp/x.a.maxHp-y.a.hp/y.a.maxHp)>.05||Math.abs(x.b.hp/x.b.maxHp-y.b.hp/y.b.maxHp)>.05)changed++}
   assert(changed>=10,`${cmd} changed ${changed}/30`)}
 });
 test('B163 prizes follow rounds won and the rank multiplier; a loss costs nothing',()=>{
  const br={rank:5,won:0};const want=[0,1,3,7];for(let w=0;w<=3;w++){br.won=w;assert(prizeB163(br)===Math.floor(want[w]*B108_RANKS[5].reward),'won '+w)}
  const b2=bracketB163(0,9);playRoundB163(b2,false);assert(b2.out&&b2.won===0&&prizeB163(b2)===0,'loss');
  const b3=bracketB163(0,9);playRoundB163(b3,true);playRoundB163(b3,true);playRoundB163(b3,true);assert(b3.champion&&b3.slots.length===1&&b3.won===3,'champion');
 });
 test('B163 fatigue is charged per fight, and a full bracket costs about one battle test',()=>{
  ranchB99.fatigue=0;ranchB99.fatigueMax=100;const before=ranchB99.rankUnlocked,hearts=ranchB99.hearts;
  assert(startColosseumB163(0),'did not start');assert(ranchB99.fatigue===fightFatigueB163(),'first fight fatigue '+ranchB99.fatigue);
  colB163.fight.done=true;colB163.fight.winner=0;finishPipFightB163();afterFightB163();
  const opts=[...document.querySelectorAll('#ranchSheetB100 button')];assert(opts.length>=2&&/Heal/.test(opts[0].textContent),'between-round sheet missing');
  chooseSheetB100(0);assert(ranchB99.fatigue===2*fightFatigueB163(),'second fight fatigue');
  colB163.fight.done=true;colB163.fight.winner=0;finishPipFightB163();afterFightB163();chooseSheetB100(0);
  assert(ranchB99.fatigue===3*fightFatigueB163()&&3*fightFatigueB163()===12,'bracket cost '+ranchB99.fatigue);
  colB163.fight.done=true;colB163.fight.winner=0;finishPipFightB163();afterFightB163();
  assert(!colB163.active&&ranchB99.rankUnlocked===before&&ranchB99.hearts===hearts,'champion changed ranks or hearts');
 });
 test('B163 falling below the tired line between rounds ends the bracket',()=>{
  ranchB99.fatigue=0;startColosseumB163(0);ranchB99.fatigue=tiredLineB141();
  colB163.fight.done=true;colB163.fight.winner=0;finishPipFightB163();afterFightB163();assert(!colB163.active,'bracket kept going');
  ranchB99.fatigue=0;
 });
 test('B163 the Arena gate offers the Colosseum only when Pip may battle',()=>{
  const gate=B100_STATIONS.find(s=>s.id==='gate');ranchB99.fatigue=0;interactStationB100(gate);
  assert([...document.querySelectorAll('#ranchSheetB100 button')].some(b=>/Colosseum/.test(b.textContent)),'no Colosseum option');closeSheetB100();
  ranchB99.fatigue=B114_ARENA_MAX_FATIGUE+1;interactStationB100(gate);
  assert(![...document.querySelectorAll('#ranchSheetB100 button')].some(b=>/Colosseum/.test(b.textContent)),'offered while too tired');closeSheetB100();ranchB99.fatigue=0;
 });
 test('B163 save loads clamped',()=>{
  localStorage.setItem(B163_KEY,JSON.stringify({v:1,seed:-5,wins:{E:3,D:'x'},best:{E:9,S:2}}));const c=loadColB163();
  assert(c.seed>=1&&c.wins.E===3&&c.wins.D===0&&c.best.E===3&&c.best.S===2,JSON.stringify(c));localStorage.removeItem(B163_KEY);
 });
 return out;
}
