function runSpawnChecksB115(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const test=(name,fn)=>{try{keys.clear();fresh();reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear()}};
  const near=(a,b)=>Math.abs(a-b)<1e-9;
  // A live wave at a given stage/local wave/rank, with no hearts nudging the tier unless asked.
  const wave=(stage,local=1,rank=0,hearts=0)=>{S.b108Rank=rank;S.stage=stage;S.stageWaveCount=local;S.wave=(stage-1)*3+local;S.earlyRunHearts=0;S.runHearts=hearts;
    S.bossActive=false;S.waveState='active';S.waveKills=0;S.waveGoal=waveGoalFor(S.wave);S.spawn=.45;enemies=[];seed=0xB115+S.wave*7+rank};
  // Pre-B115 pacing, straight from the B63 spawner: base rate and bonus-spawn chance.
  const oldRate=()=>1/clamp(.68/difficulty(),.24,.74),oldBonus=()=>difficultyWaveB63()>=3?.075*difficulty():0;
  const rate=()=>difficultyStageB63()<=openingTierB115()?oldRate():1/spawnPaceB115().gap;
  const total=()=>rate()*(1+(difficultyStageB63()<=openingTierB115()?oldBonus():spawnPaceB115().bonus));
  // Run a spawner for `secs`. kills=0 clears the field each frame (raw rate); otherwise a player killing that many
  // per second (once an enemy is 1s old) plays the wave to its goal, and time spent at the enemy cap is recorded.
  const run=(spawner,secs,kills=0)=>{const dt=1/60,trace=[];let spawned=0,capped=0,peak=0,budget=0;
    for(let t=0;t<secs;t+=dt){const before=enemies.length;if(kills&&S.waveKills<S.waveGoal&&before>=enemyCap())capped+=dt;spawner(dt);spawned+=enemies.length-before;
      for(let i=before;i<enemies.length;i++){const e=enemies[i];trace.push(e.type,e.hp,Math.round(e.x),Math.round(e.y),+S.spawn.toFixed(9))}
      if(!kills){enemies=[];continue}
      for(const e of enemies)e.age=(e.age||0)+dt;budget+=kills*dt;if(!enemies.some(e=>e.age>=1))budget=Math.min(budget,1);
      while(budget>=1&&enemies.some(e=>e.age>=1)){enemies.splice(enemies.findIndex(e=>e.age>=1),1);S.waveKills++;budget--}
      peak=Math.max(peak,enemies.length);if(S.waveKills>=S.waveGoal&&!enemies.length)break}
    return{spawned,capped,peak,trace:trace.join()}};
  test('B115 waves 1-3 (all of stages 1-3) spawn exactly as before at every rank',()=>{
    for(let rank=0;rank<B108_RANKS.length;rank++)for(let stage=1;stage<=3;stage++)for(let local=1;local<=3;local++){
      wave(stage,local,rank);const before=run(spawnLogicBeforeB115,20);wave(stage,local,rank);const after=run(spawnLogic,20);
      assert(before.spawned>0&&after.trace===before.trace,`stage ${stage} wave ${local} rank ${rank} changed`);
      wave(stage,local,rank);const b2=run(spawnLogicBeforeB115,20,1.5);wave(stage,local,rank);const a2=run(spawnLogic,20,1.5);
      assert(a2.trace===b2.trace&&a2.peak===b2.peak,`stage ${stage} wave ${local} rank ${rank} changed under fire`);
    }
  });
  test('B115 past the opening tier spawns per second climb half as far as before',()=>{
    for(const rank of [0,1,3]){wave(1,1,rank);const open=oldRate();
      for(let stage=4;stage<=14;stage++){wave(stage,2,rank);const was=oldRate(),now=rate();
        assert(near(now-open,(was-open)/2),`rank ${rank} stage ${stage}: ${now} not halfway from ${open} to ${was}`);
        assert(now<was-1e-9&&near(spawnPaceB115().bonus,(rank?.075*tierDifficultyB115(openingTierB115()):0)/2+oldBonus()/2),`rank ${rank} stage ${stage} bonus not eased`)}}
    wave(3,3);const open=run(spawnLogic,60).spawned;
    for(const stage of [4,5,6,8,10,12]){wave(stage,2);const was=run(spawnLogicBeforeB115,60).spawned;wave(stage,2);const now=run(spawnLogic,60).spawned,share=(now-open)/(was-open);
      assert(now<was&&share>.35&&share<.65,`stage ${stage}: ${open}→${now} spawns/min vs ${was} before (${share.toFixed(2)} of the old rise)`)}
  });
  test('B115 eased spawn pressure rises every stage from 4 to 12 in half-size steps and never falls through stage 40',()=>{
    for(const hearts of [0,99999]){let prev=null,prevOld=null,prevTotal=null,maxOld=0;const steps=[];
      for(let stage=3;stage<=12;stage++){wave(stage,1,0,hearts);const now=rate(),was=oldRate(),tot=total();
        if(prev!==null){steps.push(now-prev);maxOld=Math.max(maxOld,was-prevOld);
          assert(now-prev>.01&&tot-prevTotal>.01,`hearts ${hearts}: stage ${stage} did not rise (${prev}→${now})`);
          assert(near(now-prev,(was-prevOld)/2),`hearts ${hearts}: stage ${stage} step ${now-prev} is not half of ${was-prevOld}`)}
        prev=now;prevOld=was;prevTotal=tot}
      assert(Math.max(...steps)<=maxOld/2+1e-9,'a step is larger than half the old largest step');
      wave(4,1,0,hearts);const s4=total();wave(12,1,0,hearts);assert(total()-s4>.8,`hearts ${hearts}: stages 4-12 barely rise`)}
    for(let rank=0;rank<B108_RANKS.length;rank++)for(const hearts of [0,99999]){let prev=0;
      for(let stage=1;stage<=40;stage++){wave(stage,2,rank,hearts);const now=total();assert(now>=prev-1e-12,`rank ${rank} hearts ${hearts}: stage ${stage} fell`);prev=now}}
  });
  test('B115 ranks still add spawn pressure at every stage',()=>{
    for(let stage=1;stage<=16;stage++)for(const hearts of [0,99999]){let prevGap=Infinity,prevRate=0;
      for(let rank=0;rank<B108_RANKS.length;rank++){wave(stage,2,rank,hearts);S.spawn=0;seed=42;spawnLogic(0);const gap=S.spawn;wave(stage,2,rank,hearts);const r=total();
        assert(gap<prevGap&&r>prevRate,`stage ${stage} hearts ${hearts}: rank ${B108_RANKS[rank].id} not above the rank below`);prevGap=gap;prevRate=r}}
  });
  test('B115 eases only spawn pacing: tier, speed factor, caps, goals and HP keep the B108 values',()=>{
    for(let rank=0;rank<B108_RANKS.length;rank++)for(let stage=1;stage<=30;stage++){wave(stage,2,rank);const tier=difficultyStageB63(),w=1+(tier-1)*3;
      assert(near(difficulty(),.88+Math.min(1.1,(w-1)*.12)+(tier>=5?.16+Math.min(.34,(tier-5)*.045):0))&&near(tierDifficultyB115(tier),difficulty()),`difficulty moved at stage ${stage} rank ${rank}`);
      assert(enemyCap()===enemyCapBeforeB82()||enemyRosterB82(),'cap moved');assert(waveGoalFor(S.wave)===Math.min(16,8+Math.floor((tier-1)*2/3)),'goal moved')}
    wave(7);spawnEnemy('charger');assert(difficultyStageB63()===6&&enemies.at(-1).hp===4,'HP moved');
  });
  test('B115 a 1.5 kills/s player meets the enemy cap far less often than before',()=>{
    let before=0,after=0;
    for(let stage=4;stage<=10;stage++)for(let local=1;local<=3;local++){wave(stage,local);before+=run(spawnLogicBeforeB115,60,1.5).capped;wave(stage,local);after+=run(spawnLogic,60,1.5).capped}
    assert(before>20&&after<before/4,`capped ${after.toFixed(1)}s after vs ${before.toFixed(1)}s before`);
  });
  fresh();reset();
  return out;
}
