// B116d Stage appetite: food follows HEAT spent, cleanliness follows kills, hits and bosses.
function runAppetiteChecksB116(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const test=(name,fn)=>{try{keys.clear();fresh();reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear()}};
  const near=(a,b,m,eps=1e-6)=>assert(Math.abs(a-b)<eps,`${m}: ${a} vs ${b}`);
  const arena=(stage=1)=>{reset();S.audioEnabled=false;S.run=true;S.end=false;S.b39Paused=false;S.stagePending=false;S.waveState='active';S.bossActive=false;S.stageWaveCount=1;S.stage=stage;
    S.spawn=999;S.waveGoal=999;S.attackCd=999;S.loveClock=999;S.praiseCd=999;S.over=0;S.heat=0;S.overType='beam';S.overLevels={beam:1};S.invuln=0;
    enemies=[];shots=[];enemyShots=[];heartBits=[];P.x=0;P.y=0;for(const id of ['start','end','stageUp','pipPauseB39'])$(id)?.classList.add('hidden')};
  const step=s=>{for(let t=0;t<s-1e-8;t+=1/60)update(Math.min(1/60,s-t))};
  const foe=(x=160,y=0,hp=1)=>{const e={type:'chaser',x,y,r:12,hp,maxHp:hp,dead:false,age:0,flash:0,speed:0,markTime:0};enemies.push(e);return e};
  const app=()=>S.b116App;
  const clear=()=>{S.stageEnding=true;S.runHearts=10;S.heartCurrency=10;openStageUpgrade();continueSoundLabB41();
    assert(!$('stageUp').classList.contains('hidden')&&!$('ranchGateStepB99').classList.contains('stagehidden'),'gate missing')};
  test('B116 formula: food 2 + max(1, half the stage) + 1 per 25% HEAT spent; clean 2 + kills/15 + hits + 3 for a boss',()=>{
    assert(foodTollB116d(1,0)===3&&foodTollB116d(2,0)===3&&foodTollB116d(3,0)===3&&foodTollB116d(9,0)===6,'stage base');
    assert(foodTollB116d(6,60)===7&&foodTollB116d(6,24.99)===5&&foodTollB116d(6,25)===6&&foodTollB116d(6,100)===9,'HEAT steps');
    assert(cleanTollB116d(0,0,false)===2&&cleanTollB116d(14,0,false)===2&&cleanTollB116d(15,0,false)===3,'kill steps');
    assert(cleanTollB116d(34,1,true)===8&&cleanTollB116d(0,3,false)===5,'hits and boss');
  });
  test('B116 HEAT spent follows a real Beam drain; regen, chain HEAT, a hit\'s HEAT loss, refunds and pauses do not count',()=>{
    arena();step(3.1);assert(S.heat>0&&app().heat===0,'regen counted as spent');
    for(let i=0;i<3;i++)hitEnemy(foe(),99,'player');step(.1);assert(S.b115Combo.count===3&&app().heat===0,'chain HEAT counted');
    foe(160,0,1e9);S.heat=60;assert(triggerOverdrive()&&S.over>0,'Beam did not fire');step(1);stopOverdriveB38(false);update(1/60);
    near(app().heat,60-S.heat,'Beam drain not counted');near(app().heat,B38_DRAIN_ENERGY_PER_SEC.beam/heatCapacityB38()*100,'Beam drain size',.5);
    const beam=app().heat;S.heat=50;S.shields=1;hurt();assert(S.heat<50,'setup: the hit took no HEAT');update(1/60);near(app().heat,beam,'hit HEAT loss counted');
    arena();S.overType='nova';S.overUnlocked.add('nova');S.overLevels.nova=1;S.heat=60;assert(triggerOverdrive()&&S.b94Charge,'Nova did not charge');
    step(.5);near(app().heat,10,'Nova charge drain');cancelChargeB94(true);update(1/60);near(app().heat,0,'cancelled charge not refunded');
    S.b39Paused=true;S.heat-=20;update(1/60);S.b39Paused=false;update(1/60);near(app().heat,0,'paused HEAT loss counted');
  });
  test('B116 kills, hits (shield-absorbed too) and a boss fight count in live play only',()=>{
    arena();for(let i=0;i<4;i++)kill(foe(),i%2===1);hitEnemy(foe(),99,'player');assert(app().kills===5,'kills '+app().kills);
    S.shields=1;hurt();assert(app().hits===1&&S.shields===0,'shield hit');hurt();assert(app().hits===1,'hit during invulnerability counted');
    S.invuln=0;const hp=S.health;hurt();assert(app().hits===2&&S.health<hp,'health hit');
    S.invuln=0;S.b39Paused=true;hurt();kill(foe());assert(app().hits===2&&app().kills===5,'paused hit or kill counted');S.b39Paused=false;
    assert(!app().boss,'boss before the fight');S.invuln=0;startBossBattle();assert(app().boss&&S.waveState==='boss','boss fight not counted');
    arena();S.waveState='boss';update(1/60);assert(app().boss,'boss wave not seen by update');
  });
  test('B116 the appetite record starts fresh each stage',()=>{
    fresh({hunger:100,hygiene:100});arena(2);for(let i=0;i<16;i++)kill(foe());S.shields=1;hurt();S.heat=40;update(1/60);S.heat=10;update(1/60);
    near(app().heat,30,'stage 2 HEAT');assert(app().stage===2&&app().kills===16&&app().hits===1,'stage 2 record');
    clear();assert(S.b115Toll.hunger===-4&&S.b115Toll.hygiene===-4,'stage 2 toll '+JSON.stringify(S.b115Toll));
    $('nextStageB99').click();assert(S.stage===3&&S.run&&!S.stagePending,'next stage');update(1/60);
    assert(app().stage===3&&app().kills===0&&app().hits===0&&app().heat===0&&!app().boss,'record carried over: '+JSON.stringify(app()));
  });
  test('B116 integration: real Beam, kills, a shield hit and a boss fight give split food and clean deltas at the gate',()=>{
    fresh({hunger:100,hygiene:100,fatigue:0});arena(6);foe(160,0,1e9);S.heat=100;assert(triggerOverdrive()&&S.over>0,'Beam did not fire');
    for(let i=0;i<2000&&S.heat>40;i++)update(1/60);stopOverdriveB38(false);update(1/60);assert(app().heat>=60&&app().heat<61,'Beam spend '+app().heat);
    enemies=[];for(let i=0;i<34;i++)hitEnemy(foe(),99,'player');S.shields=1;S.invuln=0;hurt();startBossBattle();update(1/60);
    assert(app().kills===34&&app().hits===1&&app().boss,'counts '+JSON.stringify(app()));
    clear();const t=S.b115Toll;
    assert(t.hunger===-7&&t.hygiene===-8&&ranchB99.hunger===93&&ranchB99.hygiene===92,'deltas '+JSON.stringify(t));
    const txt=$('ranchGateMetersB115').textContent;
    assert(txt.includes('Food 93 (−7)')&&txt.includes('Clean 92 (−8)'),'meters: '+txt);
    assert($('ranchGateWhyB116d').textContent==='Food −7: 60% HEAT used · Clean −8: 34 kills, 1 hit, boss','why: '+$('ranchGateWhyB116d').textContent);
    openRanchGateB99();assert(ranchB99.hunger===93&&ranchB99.hygiene===92,'toll charged twice');
  });
  test('B116 a quiet stage costs only the base and the meters floor at 0',()=>{
    fresh({hunger:2,hygiene:1});arena(1);clear();
    assert(ranchB99.hunger===0&&ranchB99.hygiene===0&&S.b115Toll.hunger===-2&&S.b115Toll.hygiene===-1,'floor '+JSON.stringify(S.b115Toll));
    assert($('ranchGateWhyB116d').textContent==='Food −3: 0% HEAT used · Clean −2: 0 kills, 0 hits','quiet why: '+$('ranchGateWhyB116d').textContent);
  });
  fresh();reset();
  return out;
}
