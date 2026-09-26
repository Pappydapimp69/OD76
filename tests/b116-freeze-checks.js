// B116c Boss dash freeze: standing in a yellow dash path freezes the player 2.2s.
function runFreezeChecksB116(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)},near=(a,b,m)=>assert(Math.abs(a-b)<1e-6,`${m}: ${a} vs ${b}`);
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const hurtB116c=hurt;
  const test=(name,fn)=>{try{keys.clear();fresh();reset();hurt=()=>{};fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{hurt=hurtB116c;keys.clear();if(b39Pause?.open)closeAscendedPauseB39()}};
  const step=s=>{for(let t=0;t<s-1e-8;t+=1/60)update(Math.min(1/60,s-t))};
  // A live Fang fight: the player at the origin, Fang stalking from `x`.
  const fang=(x=150)=>{reset();S.audioEnabled=false;S.run=true;S.end=false;S.b39Paused=false;S.stagePending=false;S.waveState='boss';S.bossActive=true;S.stageWaveCount=3;
    S.spawn=999;S.attackCd=999;S.loveClock=999;S.praiseCd=999;S.over=0;S.heat=0;S.overType='beam';S.overLevels={beam:1};
    shots=[];enemyShots=[];heartBits=[];P.x=0;P.y=0;P.vx=P.vy=0;for(const id of ['start','end','stageUp','pipPauseB39'])$(id)?.classList.add('hidden');
    const e={type:'boss',bossKey:5,bossStage:1,x,y:0,r:30,hp:5000,maxHp:5000,dead:false,age:0,flash:0,attackClock:1,volleyCount:0,orbitAngle:0};
    enemies=[e];S.bossKey=5;S.bossName=bossData(5).name;initBossB59(e);return e};
  // The real boss update commits the aim: stalk runs out and the lane turns yellow ("locked") inside update().
  const lock=e=>{bossPhaseB59(e,'stalk',.01);update(1/60);assert(e.b59.phase==='locked','Fang did not lock its pounce')};
  const calm=e=>bossPhaseB59(e,'recover',99);
  const skill=(id,heat)=>{S.overType=id;S.overUnlocked.add(id);S.overLevels[id]=1;S.heat=heat;S.b93StormCooldown=0;S.b93StormClouds=[]};

  test('B116 the yellow lane freezes a player inside it for 2.2s; outside it does not',()=>{
    let e=fang();lock(e);assert(frozenB116c(),'player in the lane was not frozen');near(S.b116cFreeze,2.2,'freeze length');calm(e);
    step(2.18);assert(frozenB116c(),'thawed early');step(.04);assert(!frozenB116c(),'still frozen after 2.2s');
    e=fang(520);lock(e);assert(!frozenB116c(),'a lock that cannot reach the player froze them');
    e=fang();partnershipB59().lure={boss:e,x:e.x,y:e.y+300};lock(e);assert(!frozenB116c(),'a lane turned onto the lure froze the player');
  });
  test('B116 one check per dash: the rest of the lock and pounce never refreeze or extend',()=>{
    const e=fang();lock(e);step(.3);assert(e.b59.phase==='locked'&&S.b116cFreeze<2,'the locked phase re-checked');
    const left=S.b116cFreeze;bossPhaseB59(e,'locked',.6);near(S.b116cFreeze,left,'a new lock extended a live freeze');
    step(1.95);assert(!frozenB116c()&&e.b59.phase!=='locked','freeze outlived its first 2.2s');
  });
  test('B116 frozen: no movement, auto-fire, dash or skill; all return after 2.2s',()=>{
    const e=fang();P.vx=200;keys.add('d');lock(e);calm(e);S.attackCd=0;S.dashCd=0;S.heat=60;shots=[];const x=P.x;
    step(1);near(P.x,x,'frozen player moved');assert(P.vx===0&&P.vy===0,'velocity not zeroed');assert(shots.length===0,'frozen player auto-fired');
    assert(!dash()&&S.dashTime===0,'frozen player dashed');assert(!triggerOverdrive()&&S.over===0,'frozen player fired a skill');
    assert(!canIgniteOverdriveB38(),'skill shown ready while frozen');
    step(1.25);assert(!frozenB116c(),'freeze did not end');step(.1);assert(P.x>x,'movement did not return');assert(shots.length>0,'auto-fire did not return');
    assert(dash()&&S.dashTime>0,'dash did not return');S.dashTime=0;assert(triggerOverdrive()&&S.over>0,'skill did not return');
  });
  test('B116 Pip keeps acting while the player is frozen',()=>{
    const e=fang();lock(e);calm(e);S.pipState='orbit';P.pipX=90;P.pipY=60;const a=P.pipAngle;
    step(.5);assert(frozenB116c(),'thawed');assert(P.pipAngle>a,'Pip stopped orbiting');assert(hyp(P.pipX-90,P.pipY-60)>1,'Pip stopped moving');
  });
  test('B116 HEAT regen pauses while frozen',()=>{
    const e=fang();calm(e);step(2.5);near(S.heat,0,'regen before the freeze');lock(e);calm(e);
    assert(heatSkillBusyB115b(),'freeze not treated as busy');step(2);near(S.heat,0,'HEAT regenerated while frozen');
    step(6.5);assert(S.heat>0,'regen never resumed after the thaw');
  });
  test('B116 a gathering Thunderstorm is cancelled with its HEAT lost',()=>{
    const e=fang();skill('storm',60);assert(triggerOverdrive()&&S.b93StormCharge,'storm did not gather');S.b93StormCharge.prog=2.19;step(.1);
    const h=S.heat;assert(h<60,'storm took no HEAT');lock(e);calm(e);
    assert(!S.b93StormCharge&&!S.b38OverHeld&&S.over===0,'storm still gathering');near(S.heat,h,'storm HEAT refunded');
    stopOverdriveB38(false);assert(!(S.b93StormClouds?.length),'the release after the freeze struck');near(S.heat,h,'release refunded');
    step(2.3);near(S.heat,h,'HEAT came back after the thaw');assert(triggerOverdrive()&&S.b93StormCharge.startHeat===h,'next press did not start fresh');
  });
  test('B116 a charging Nova or Gravity Well is cancelled with no refund',()=>{
    for(const id of ['nova','gravity']){
      const e=fang();skill(id,60);assert(triggerOverdrive()&&S.b94Charge,id+' did not charge');step(.5);near(S.heat,50,id+' charge drain');
      lock(e);calm(e);assert(!S.b94Charge&&!S.b38OverHeld,id+' still charging');near(S.heat,50,id+' HEAT refunded');
      stopOverdriveB38(false);assert(!(S.b94NovaWaves?.length)&&!S.b94Well,id+' released after the freeze');step(2.3);near(S.heat,50,id+' HEAT came back');
    }
  });
  test('B116 a held Beam stops and Pip Ascendant ends, both with no refund',()=>{
    let e=fang();skill('beam',60);assert(triggerOverdrive()&&S.over>0,'Beam did not fire');step(.5);const h=S.heat;assert(h<60,'Beam took no HEAT');
    lock(e);calm(e);assert(S.over===0&&!S.b38OverHeld,'Beam still held');assert(S.heat<=h&&S.heat>h-1,'Beam HEAT refunded or wiped');
    const kept=S.heat;stopOverdriveB38(false);step(2.3);near(S.heat,kept,'Beam HEAT came back');
    e=fang();skill('pip',100);assert(triggerOverdrive()&&S.b58AscTime>0,'Pip did not ascend');step(.5);
    lock(e);calm(e);assert(S.over===0&&S.b58AscTime===0&&!S.b43AscAuto,'Ascendant still active');near(S.heat,0,'Ascendant reserve kept');
    step(2.3);assert(S.over===0&&S.heat<1,'Ascendant or its HEAT came back');
  });
  test('B116 the freeze holds through pause and clears on reset, run end, stage end and boss death',()=>{
    let e=fang();lock(e);calm(e);assert(openAscendedPauseB39(),'pause did not open');step(3);near(S.b116cFreeze,2.2,'freeze ticked while paused');
    closeAscendedPauseB39();step(2.25);assert(!frozenB116c(),'freeze stuck after resume');
    e=fang();lock(e);reset();assert(!frozenB116c(),'reset kept the freeze');
    e=fang();lock(e);S.end=true;update(1/60);assert(!frozenB116c(),'run end kept the freeze');
    e=fang();lock(e);S.waveState='stage';update(1/60);assert(!frozenB116c(),'stage end kept the freeze');
    e=fang();lock(e);killBoss(e);assert(!frozenB116c(),'boss death kept the freeze');
  });
  keys.clear();fresh();reset();
  return out;
}
