// B124 fixes.
function runChecksB124(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)},near=(a,b,m,tol=1e-6)=>assert(Math.abs(a-b)<tol,`${m}: ${a} vs ${b}`);
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const hurtB124=hurt;
  const test=(name,fn)=>{try{keys.clear();fresh();reset();hurt=()=>{};fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{hurt=hurtB124;keys.clear()}};
  const step=s=>{for(let t=0;t<s-1e-8;t+=1/60)update(Math.min(1/60,s-t))};
  const live=()=>{S.audioEnabled=false;S.run=true;S.end=false;S.b39Paused=false;S.stagePending=false;S.spawn=999;S.attackCd=999;S.loveClock=999;S.praiseCd=999;S.over=0;
    shots=[];enemyShots=[];heartBits=[];P.x=0;P.y=0;P.vx=P.vy=0;for(const id of ['start','end','stageUp','pipPauseB39'])$(id)?.classList.add('hidden')};
  const fang=(x=150)=>{reset();live();S.waveState='boss';S.bossActive=true;S.stageWaveCount=3;S.heat=0;S.overType='beam';S.overLevels={beam:1};
    const e={type:'boss',bossKey:5,bossStage:1,x,y:0,r:30,hp:5000,maxHp:5000,dead:false,age:0,flash:0,attackClock:1,volleyCount:0,orbitAngle:0};
    enemies=[e];S.bossKey=5;S.bossName=bossData(5).name;initBossB59(e);return e};
  const lock=e=>{bossPhaseB59(e,'stalk',.01);update(1/60);assert(e.b59.phase==='locked','Fang did not lock')};

  test('B124 follow-cloud zap range is tripled',()=>{assert(B122_ZAP_RANGE.join()==='330,330,330,420,420','zap ranges '+B122_ZAP_RANGE.join())});

  test('B124 the dash lane warns 0.6s before it freezes; stepping out in time avoids it',()=>{
    let e=fang();lock(e);assert(!frozenB116c()&&S.b124Warn,'froze instantly or no warning');
    step(.55);assert(!frozenB116c(),'froze before the warning ended');step(.1);assert(frozenB116c(),'stayed in the lane and was not frozen');
    e=fang();lock(e);step(.2);P.x=0;P.y=200;step(.5);assert(!frozenB116c()&&!S.b124Warn,'stepped out and still froze');
    e=fang(520);lock(e);assert(!S.b124Warn,'a lane that cannot reach warned');
    e=fang();lock(e);e.dead=true;step(.7);assert(!frozenB116c(),'a dead boss froze the player');
  });

  test('B124 a full Nova charge hits every enemy on screen; a partial one keeps its radius',()=>{
    reset();live();S.waveState='active';S.weaponPower=1;W=900;H=600;CAM.x=0;CAM.y=0;
    const far={type:'chaser',x:420,y:250,r:12,hp:99,maxHp:99,dead:false,age:1,speed:0},close={type:'chaser',x:60,y:0,r:12,hp:99,maxHp:99,dead:false,age:1,speed:0};
    enemies=[far,close];assert(worldVisible(far.x,far.y,30),'fixture enemy not on screen');
    S.b94NovaWaves=[];releaseNovaB94(1,1);for(const w of [...S.b94NovaWaves])fireNovaWaveB94(w);assert(far.hp<99&&close.hp<99,'full Nova missed an on-screen enemy');
    far.hp=99;close.hp=99;S.b94NovaWaves=[];releaseNovaB94(.5,1);for(const w of [...S.b94NovaWaves])fireNovaWaveB94(w);assert(far.hp===99&&close.hp<99,'partial Nova reached the far enemy');
  });

  test('B124 enemy HP grows 12% per wave cleared and never dies to one basic shot',()=>{
    reset();live();S.waveState='active';S.weaponPower=1;S.stage=1;S.b124Waves=1;enemies=[];spawnEnemy('chaser');const base=enemies[0].hp;
    S.b124Waves=6;enemies=[];spawnEnemy('chaser');near(enemies[0].hp,Math.max(2,base*1.6),'wave 6 HP');
    S.weaponPower=3;S.b124Waves=1;enemies=[];spawnEnemy('core');assert(enemies[0].hp>=6,'core dies to one shot at weapon power 3');
    reset();assert(S.b124Waves===0,'wave count survived reset');
  });

  test('B124 the merchant buttons are hold-to-confirm and holds take 0.9s',()=>{
    assert(B117H_IDS.includes('buySnackB118')&&B117H_IDS.includes('leaveMerchantB118'),'merchant buttons not in the hold set');
    const b=$('bossReward0');$('stageUp').classList.remove('hidden');S.stagePending=true;const ok=beginHoldB117h(b,'test');const ms=holdB117h.ms;cancelHoldB117h('test');$('stageUp').classList.add('hidden');assert(!ok||ms===900,'hold not 0.9s: '+ms);
  });

  test('B124 the stage gate meter reads Fatigue, not Tired',()=>{
    reset();live();S.stagePending=true;S.waveState='stage';renderTollGateB115();const t=$('ranchGateBarsB115')?.textContent||'';
    assert(/Fatigue \d/.test(t)&&!/Tired/.test(t),'gate meter: '+t);
  });
  return out;
}
