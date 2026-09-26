function runHeatChecksB115(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const test=(name,fn)=>{try{keys.clear();fresh();reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear();if(b39Pause?.open)closeAscendedPauseB39()}};
  const near=(a,b,m)=>assert(Math.abs(a-b)<1e-6,`${m}: ${a} vs ${b}`);
  const arena=()=>{reset();S.audioEnabled=false;S.run=true;S.end=false;S.b39Paused=false;S.stagePending=false;S.waveState='active';S.bossActive=false;S.stageWaveCount=1;
    S.spawn=999;S.waveGoal=999;S.attackCd=999;S.loveClock=999;S.praiseCd=999;S.over=0;S.heat=0;S.overType='beam';S.overLevels={beam:1};
    enemies=[];shots=[];enemyShots=[];heartBits=[];P.x=0;P.y=0;for(const id of ['start','end','stageUp','pipPauseB39'])$(id)?.classList.add('hidden')};
  const step=s=>{for(let t=0;t<s-1e-8;t+=1/60)update(Math.min(1/60,s-t))};
  const foe=(x=160,y=0)=>{const e={type:'chaser',x,y,r:12,hp:1,maxHp:1,dead:false,age:0,flash:0,speed:0,markTime:0};enemies.push(e);return e};
  const shoot=()=>hitEnemy(foe(),99,'player');
  const kills=n=>{for(let i=0;i<n;i++)shoot()};
  const combo=()=>S.b115Combo;

  test('B115 kills outside the basic chain add no HEAT, even at a high score combo with Cosmic resonance',()=>{
    arena();const rank=resonanceRankB41;resonanceRankB41=t=>t==='cosmic'?3:rank(t);
    try{
      S.combo=5;S.heat=40;
      S.dashTime=.3;kill(foe(),false);S.dashTime=0;kill(foe(),true);
      for(const src of ['pip','overdrive','burst','sound'])hitEnemy(foe(),99,src);
      near(S.heat,40,'a non-chain kill fed HEAT');assert(combo().count===0,'a non-chain kill counted');
      assert(S.combo>5,'the score multiplier stopped building');
      shoot();near(S.heat,40+100/heatCapacityB38(),'a basic kill added more than its 1x chain HEAT');
    }finally{resonanceRankB41=rank}
  });
  test('B115 HEAT regenerates on its own and pauses while Beam is held',()=>{
    arena();const rate=heatRegenRateB115();near(rate,2.525,'base regen with one constellation level');
    step(4);near(S.heat,4*rate,'regen over four seconds');
    S.heat=60;assert(triggerOverdrive()&&S.over>0,'Beam did not fire');step(1);
    const held=S.heat;near(held,60-B38_DRAIN_ENERGY_PER_SEC.beam/heatCapacityB38()*100,'Beam hold drain included regen');
    stopOverdriveB38(false);assert(S.over===0,'Beam did not stop');step(1);near(S.heat,held+rate,'regen did not resume after release');
    S.heat=99.9;step(1);assert(S.heat===100,'regen did not clamp at 100');
  });
  test('B115 regen waits while Thunderstorm gathers, Nova charges and Pip is Ascendant',()=>{
    arena();S.overType='storm';S.overUnlocked.add('storm');S.overLevels.storm=1;S.heat=60;S.b93StormCooldown=0;S.b93StormClouds=[];
    assert(triggerOverdrive()&&S.b93StormCharge,'storm did not gather');S.b93StormCharge.timer=99;const storm=S.heat;step(1);near(S.heat,storm,'HEAT regenerated while the storm gathered');
    arena();S.overType='nova';S.overUnlocked.add('nova');S.overLevels.nova=1;S.heat=60;
    assert(triggerOverdrive()&&S.b94Charge,'Nova did not charge');step(.5);near(S.heat,50,'HEAT regenerated while Nova charged');
    const one=100/heatCapacityB38();shoot();step(.1);near(S.heat,60+one-12,'chain HEAT earned mid-charge was lost to the charge recompute');
    arena();S.overType='pip';S.overLevels.pip=1;S.heat=100;assert(triggerOverdrive()&&S.over>0&&S.b58AscTime>0,'Pip did not ascend');
    assert(heatSkillBusyB115b(),'Ascendant not treated as an active skill');step(1);near(S.heat,100-100/8,'HEAT regenerated during Ascendant');
  });
  test('B115 each constellation level adds 1% regen without pinning HEAT full',()=>{
    arena();near(heatRegenRateB115(),2.525,'1 level');
    S.overLevels={beam:3,storm:2};near(heatRegenRateB115(),2.5*1.05,'5 levels');
    for(const id of OVER_ORDER){S.overUnlocked.add(id);S.overLevels[id]=5}
    const max=heatRegenRateB115();near(max,3.25,'30 levels');step(2);near(S.heat,2*max,'30-level regen over two seconds');
    assert(25/max>7.5&&100/max>30,'maxed regen ignites or fills too fast');
  });
  test('B115 the need hook scales regen',()=>{
    const hook=heatRegenNeedMultB115;
    try{
      arena();heatRegenNeedMultB115=()=>.5;near(heatRegenRateB115(),2.525*.5,'half-need regen rate');step(2);near(S.heat,2.525,'half-need regen');
      heatRegenNeedMultB115=()=>0;step(2);near(S.heat,2.525,'zero-need regen still filled');
    }finally{heatRegenNeedMultB115=hook}
  });
  test('B115 basic auto-fire kills build the chain and it resets after 1.2s without one',()=>{
    arena();const e=foe(120,0);e.hp=.1;S.attackCd=0;step(.5);
    assert(e.dead&&combo().count===1&&combo().tier===1,'a real auto-fire kill did not start the chain');
    kills(2);assert(combo().count===3&&combo().timer===B115B_COMBO_WINDOW,'chain did not build');
    step(1.1);assert(combo().count===3,'chain dropped inside the window');
    shoot();assert(combo().count===4,'kill inside the window did not extend the chain');
    step(1.1);assert(combo().count===4,'window was not refreshed by the last kill');
    step(.2);assert(combo().count===0&&combo().tier===0&&combo().timer===0,'chain did not reset after 1.2s idle');
  });
  test('B115 dash, chain, Pip, Overdrive, Beam and Ascendant kills neither count nor extend the chain',()=>{
    arena();shoot();const t=combo().timer;
    kill(foe(),true);for(const src of ['pip','overdrive','burst','sound'])hitEnemy(foe(),99,src);
    S.over=1;shoot();S.overType='pip';shoot();S.over=0;S.b58AscTime=3;shoot();S.b58AscTime=0;S.overType='beam';
    assert(combo().count===1&&combo().timer===t,'a non-basic kill counted or refreshed the chain');
    const d=foe(0,0);S.dashTime=.3;update(1/60);
    assert(d.dead&&combo().count===1&&combo().timer<t,'a real dash kill counted or refreshed the chain');
  });
  test('B115 tiers step every 10 kills to a 5x cap and add tier HEAT in energy units',()=>{
    assert([0,1,10,11,20,21,30,31,40,41,60].map(comboTierB115b).join()==='0,1,1,2,2,3,3,4,4,5,5','tier math');
    arena();S.overUnlocked.add('storm');S.overLevels.storm=3;const cap=heatCapacityB38();assert(cap===120,'fixture meter is not 120');
    const at=(n,tier,energy)=>{kills(n-combo().count);assert(combo().count===n&&combo().tier===tier,`count ${n} is not ${tier}x`);near(heatEnergyB38(),energy,`HEAT energy at ${n}`)};
    at(10,1,10);at(11,2,12);at(20,2,30);at(21,3,33);at(41,5,105);
    kills(19);assert(combo().count===60&&combo().tier===5&&S.heat===100,'5x cap or HEAT clamp failed');
  });
  test('B115 HUD reads tier and count, flashes on tier steps, survives updateUI and fades on reset',()=>{
    arena();const el=$('comboB115');assert(el&&el.parentElement===$('app'),'combo HUD missing');
    assert(el.classList.contains('b115out'),'HUD visible with no chain');
    kills(7);assert(el.textContent==='1x 7'&&!el.classList.contains('b115out')&&el.dataset.tier==='1','HUD did not show 1x 7');
    kills(3);assert(el.textContent==='1x 10'&&!el.classList.contains('b115flash'),'HUD flashed before a tier step');
    kills(1);assert(el.textContent==='2x 11'&&el.dataset.tier==='2'&&el.classList.contains('b115flash'),'tier step did not flash');
    updateUI();assert(el.textContent==='2x 11'&&el.classList.contains('b115flash'),'updateUI clobbered the HUD');
    step(.7);assert(!el.classList.contains('b115flash')&&combo().count===11,'flash did not settle');
    const tiers=new Set(['1','2']);for(const n of [21,31,41]){kills(n-combo().count);tiers.add(el.dataset.tier)}
    assert(tiers.size===5&&el.textContent==='5x 41','HUD tiers did not step to 5x');
    reset();assert(el.classList.contains('b115out')&&el.getAttribute('aria-hidden')==='true'&&combo().count===0,'HUD did not fade on reset');
  });
  test('B115 regen and chain clocks freeze on pause, the stage screen and run end; a new stage clears the chain',()=>{
    arena();kills(3);S.heat=30;const t=combo().timer,el=$('comboB115');
    assert(openAscendedPauseB39(),'pause did not open');step(3);
    assert(S.heat===30&&combo().count===3&&combo().timer===t,'pause did not freeze HEAT and the chain');
    closeAscendedPauseB39();step(.5);assert(S.heat>30&&combo().count===3,'clocks did not resume after pause');
    const heat=S.heat,left=combo().timer;S.stageEnding=true;openStageUpgrade();assert(S.stagePending,'stage screen did not open');step(3);
    assert(S.heat===heat&&combo().count===3&&combo().timer===left&&el.classList.contains('b115out'),'stage screen did not freeze HEAT and the chain');
    continueStageB99();assert(S.run&&!S.stagePending,'next stage did not start');update(1/60);
    assert(combo().count===0,'a new stage kept the chain');
    arena();kills(2);S.heat=30;finish(true);assert(S.end,'run did not end');step(2);
    assert(S.heat===30&&combo().count===2&&el.classList.contains('b115out'),'run end did not freeze HEAT and hide the chain');
  });
  fresh();reset();
  return out;
}
