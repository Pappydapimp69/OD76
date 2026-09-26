// B117 fixes: Guardian rework (Pip is the Guardian) and hold-to-confirm stage upgrades.
function runFixChecksB117(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const fresh=()=>{ranchB99=Object.assign(ranchDefaultB99());ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const test=(name,fn)=>{try{keys.clear();fresh();reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{if(S){stopOverdriveB38(false);S.b117PipStun=0}}};
  const near=(a,b,m,eps=1e-6)=>assert(Math.abs(a-b)<eps,`${m}: ${a} vs ${b}`);
  const foe=(x,y=0,hp=50)=>{const e={type:'chaser',x,y,r:12,hp,maxHp:hp,dead:false,age:1,flash:0,speed:0,markTime:0};enemies.push(e);return e};
  const arena=(lv,heat=100,pipAway=0)=>{reset();S.audioEnabled=false;S.run=true;S.end=false;S.b39Paused=false;S.stagePending=false;S.waveState='active';S.bossActive=false;S.stageWaveCount=1;
    S.spawn=999;S.waveGoal=999;S.attackCd=999;S.loveClock=999;S.praiseCd=999;S.over=0;S.overType='guardian';S.overUnlocked.add('guardian');S.overLevels={beam:1,guardian:lv};
    S.heat=heat;enemies=[];shots=[];enemyShots=[];heartBits=[];P.x=0;P.y=0;P.vx=0;P.vy=0;CAM.x=0;CAM.y=0;S.pipMoveSpeed=170;S.b117PipStun=0;
    if(pipAway){S.pipState='collect';P.pipX=pipAway;P.pipY=0}else{S.pipState='orbit';const o=pipOrbitPoint();P.pipX=o.x;P.pipY=o.y}
    for(const id of ['start','end','stageUp','pipPauseB39'])$(id)?.classList.add('hidden')};
  const step=(s,fps=60)=>{for(let t=0;t<s-1e-8;t+=1/fps)update(Math.min(1/fps,s-t))};
  const press=()=>assert(triggerOverdrive()&&guardActiveB117g(),'guardian press rejected');
  const g=()=>S.b117Guard;
  const hit=()=>{S.invuln=0;hurt()};
  fresh();reset();

  test('B117g block counts per level: 2, 3, 3, 4, 4, and no shield refill or legacy hits on press',()=>{
    for(const [lv,n] of [[1,2],[2,3],[3,3],[4,4],[5,4]]){
      arena(lv);S.shields=1;press();assert(S.shields===1,`Lv${lv} refilled shields`);assert(S.overGuardHits===0,'legacy guard hits set');
      assert(g().max===n,`Lv${lv} max ${g().max}`);step(3.2);assert(g().ready===n,`Lv${lv} charged ${g().ready}, wanted ${n}`);stopOverdriveB38(false);
    }
  });

  test('B117g first block 0.4s after orbit, then 1.2s, trimmed 10% per level',()=>{
    arena(1);press();step(.37);assert(g().ready===0,'Lv1 first early');step(.05);assert(g().ready===1,'Lv1 first late');
    step(1.15);assert(g().ready===1,'Lv1 second early');step(.07);assert(g().ready===2,'Lv1 second late');stopOverdriveB38(false);
    near(guardDelayB117g(1,0),.4,'Lv1 first');near(guardDelayB117g(1,1),1.2,'Lv1 next');near(guardDelayB117g(3,0),.4*.81,'Lv3 first');near(guardDelayB117g(5,2),1.2*Math.pow(.9,4),'Lv5 next');
  });

  test('B117g Pip flies home first; the flight costs at most 10% HEAT',()=>{
    arena(1,100,500);press();assert(!g().orbit,'far Pip counted as in orbit');step(1);assert(!g().orbit&&g().ready===0,'charged before Pip arrived');
    step(2.5);assert(g().orbit,'Pip never arrived');assert(g().returnSpent<=10+1e-6,'return spent '+g().returnSpent);
    const spent=100-S.heat;assert(spent<25,'flight + charge spent '+spent);
  });

  test('B117g Pip counts as away while guarding: bond, presence, resonance, emergency all off; heart meter hidden',()=>{
    arena(2);S.pipSupport=3;S.shields=0;assert(pipWithPlayer()&&pipBondB51()>0,'baseline Pip not present');
    press();assert(!pipWithPlayer()&&pipBondB51()===0,'Pip still with player');assert(resonanceRankB41('plush')===0,'resonance live');
    assert(!supportEmergencyB63(),'support emergency live');assert(!coverAvailableB59(),'cover live');
    stopOverdriveB38(false);assert(pipWithPlayer(),'Pip not back after release');
  });

  test('B117g blocks absorb hits; a hit with no ready block lands on shields',()=>{
    arena(1);S.shields=3;press();hit();assert(S.shields===2&&g().used===0,'unready hit not landed');
    step(.45);hit();assert(S.shields===2&&g().used===1&&g().ready===0,'ready block not spent');
  });

  test('B117g break: last block ends Guardian, cracked pulse, Pip stunned 1.8s and cannot re-ignite',()=>{
    arena(1);const e=foe(60);press();step(1.7);assert(g().ready===2,'blocks not charged');
    hit();hit();assert(!guardActiveB117g()&&!S.b117Guard,'Guardian survived break');step(.02);assert(S.over===0,'overdrive still marked active');
    assert(pipStunnedB117g(),'Pip not stunned');assert(b117gPulses.some(p=>p.broken),'no cracked pulse');assert(e.hp<50,'break pulse did no damage');
    assert(!canIgniteOverdriveB38('guardian')&&!triggerOverdrive(),'re-ignited while stunned');assert(!pipWithPlayer(),'stunned Pip counted as present');
    step(1.8);assert(!pipStunnedB117g(),'stun did not expire');assert(canIgniteOverdriveB38('guardian'),'cannot ignite after stun');
  });

  test('B117g release: clean pulse with knockback, no stun',()=>{
    arena(2);const e=foe(80);press();step(.5);stopOverdriveB38(false);
    assert(!pipStunnedB117g(),'release stunned Pip');assert(b117gPulses.some(p=>!p.broken),'no clean pulse');assert(e.hp<50&&e.x>80,'no damage or push');
  });

  test('B117g Lv3 reflects a bolt; Lv5 mends at most 2 shields',()=>{
    arena(3);foe(200);press();step(.4);const n=shots.length;hit();assert(shots.length===n+1&&shots.at(-1).b117gReflect,'no reflect at Lv3');stopOverdriveB38(false);
    arena(2);foe(200);press();step(.4);const m=shots.length;hit();assert(shots.length===m,'reflect below Lv3');stopOverdriveB38(false);
    arena(5);S.shields=0;S.shieldRegenClock=-999;press();step(5);assert(S.shields===2,'Lv5 mended '+S.shields);
  });

  test('B117h stage upgrades buy only after a full hold; taps and early release spend nothing',()=>{
    reset();S.run=true;openStageUpgrade();S.prismSeeds=2;renderEmotionButtons();$('stageUp').classList.remove('hidden');
    const btn=$('upLove'),love=S.pipLove||0;
    btn.click();assert(S.prismSeeds===2&&(S.pipLove||0)===love,'tap spent');
    beginHoldB117h(btn,'test');tickHoldB117h(performance.now()+B117H_MS*.5);cancelHoldB117h('test');assert(S.prismSeeds===2,'early release spent');
    beginHoldB117h(btn,'test');tickHoldB117h(performance.now()+B117H_MS);assert(S.prismSeeds===1&&S.pipLove===love+1,'full hold did not buy');
    assert(!holdB117h.btn,'hold not cleared');
  });

  test('B117i stage end ignores every input for 0.7s, then accepts it',()=>{
    const saved=stageInputLockMsB117i;stageInputLockMsB117i=700;
    try{
      reset();S.run=true;openStageUpgrade();S.prismSeeds=2;renderEmotionButtons();$('stageUp').classList.remove('hidden');
      let got=0;const probe=()=>got++;window.addEventListener('keydown',probe);
      try{
        window.dispatchEvent(new KeyboardEvent('keydown',{key:'x'}));assert(got===0,'keydown reached game during lock');
        $('skipPipUpgrade').click();assert(!$('emotionStep').classList.contains('stagehidden'),'click skipped during lock');
        assert(gamepadBackActionB35()===false,'gamepad back acted during lock');
        stageInputLockB117i=performance.now()-1;
        window.dispatchEvent(new KeyboardEvent('keydown',{key:'x'}));assert(got===1,'keydown blocked after lock');
      }finally{window.removeEventListener('keydown',probe)}
    }finally{stageInputLockMsB117i=saved;stageInputLockB117i=0}
  });

  test('B117n a week starting at 0 food or 0 clean adds +10 fatigue each; sleep still works',()=>{
    const week=(h,g,kind='drill')=>{ranchB99.hunger=h;ranchB99.hygiene=g;ranchB99.fatigue=40;weekPassedB104(kind);return ranchB99.fatigue};
    assert(week(80,80)===40,'fed and clean Pip tired');
    assert(week(0,80)===50,'empty food not +10');assert(week(80,0)===50,'empty clean not +10');assert(week(0,0)===60,'both empty not +20');
    assert(week(10,10,'rest')===40,'week that began above 0 was penalised');
    ranchB99.fatigue=99;ranchB99.hunger=0;ranchB99.hygiene=0;weekPassedB104('drill');assert(ranchB99.fatigue===100,'fatigue passed 100');
  });

  test('B117p petting: +1% per 15 arena minutes and per 500 kills, a stone resets both',()=>{
    const roll=petRollB117p;
    try{
      ranchB99=Object.assign(ranchDefaultB99(),{hearts:0});ensurePointsB100(ranchB99);syncCapsB102();ranchB99.starStones=0;ranchB99.b117Pet={arena:0,kills:0};
      assert(petChanceB117p()===0,'chance without play');
      arena(1);S.overType='beam';step(2);assert(Math.abs(petStateB117p().arena-2)<.05,'arena time not counted');
      const e=foe(100);kill(e);kill(e);assert(petStateB117p().kills===1,'kill miscounted');
      ranchB99.b117Pet={arena:1800,kills:500};assert(Math.abs(petChanceB117p()-.03)<1e-9,'30 min + 500 kills not 3%');
      ranchB99.b117Pet={arena:899,kills:499};assert(petChanceB117p()===0,'partial blocks counted');
      reset();openRanchB99();ranchB99.b117Pet={arena:1800,kills:500};ranchB99.starStones=0;
      petRollB117p=()=>.05;pipSheetB104();assert(/chance when petted: 3%/.test($('ranchSheetB100').textContent),'chance not shown');
      ranchWorldB100.sheet.options.find(o=>o.label==='Pet Pip').run();assert(ranchB99.starStones===0&&petStateB117p().arena===1800,'miss gave a stone or reset');
      petRollB117p=()=>.02;closeSheetB100();pipSheetB104();ranchWorldB100.sheet.options.find(o=>o.label==='Pet Pip').run();
      assert(ranchB99.starStones===1&&petStateB117p().arena===0&&petStateB117p().kills===0,'hit did not give a stone and reset');
      ranchB99.b117Pet={arena:900,kills:0};saveRanchB99();assert(loadRanchB99().b117Pet.arena===900,'progress lost on reload');
    }finally{petRollB117p=roll;closeSheetB100();ranchWorldB100.active=false}
  });

  test('B117f refinery slots: 2 at Lv1, 3 at Lv5, 4 at Lv10; waiting batches take freed slots',()=>{
    const fr=o=>{ranchB99=Object.assign(ranchDefaultB99(),o);ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
    assert(refinerySlotsB117f(1)===2&&refinerySlotsB117f(4)===2&&refinerySlotsB117f(5)===3&&refinerySlotsB117f(9)===3&&refinerySlotsB117f(10)===4,'slot counts');
    const never=()=>.9,t0=1e12;fr({hearts:250});loadHeartsB102(5,t0);const f=ranchB99.refinery;
    tickRefineryB102(t0+899e3,never);assert(f.trayStones===0,'early');tickRefineryB102(t0+900e3,never);assert(f.trayStones===2&&f.queue===3,'Lv1 wave 1');
    tickRefineryB102(t0+1800e3,never);assert(f.trayStones===4&&f.queue===1,'Lv1 wave 2');tickRefineryB102(t0+2700e3,never);assert(f.trayStones===5&&!f.queue,'Lv1 last');
    fr({hearts:500});ranchB99.refinery.level=5;loadHeartsB102(6,t0);tickRefineryB102(t0+240e3,never);assert(ranchB99.refinery.trayStones===3,'Lv5 not 3 slots');
    fr({hearts:500});ranchB99.refinery.level=10;loadHeartsB102(8,t0);tickRefineryB102(t0+10e3,never);assert(ranchB99.refinery.trayStones===4,'Lv10 not 4 slots');
    fr({hearts:150});loadHeartsB102(1,t0);loadHeartsB102(1,t0+300e3);const g=ranchB99.refinery;assert(g.lag.length===2&&g.lag[1]===300e3,'second load did not start in the free slot');
    tickRefineryB102(t0+900e3,never);assert(g.trayStones===1&&g.queue===1,'first load');tickRefineryB102(t0+1200e3,never);assert(g.trayStones===2&&!g.queue,'second load');
    fr({hearts:150});loadHeartsB102(3,t0);saveRanchB99();assert(loadRanchB99().refinery.lag.length===2,'slots lost on reload');
  });

  test('B117u More Supportive no longer prepares openings at any level; Emergency Return stays',()=>{
    assert(pipSetupOnB117u===false,'Setup switched on');
    const e=fixtureB59(1,{support:3});bossPhaseB59(e,'recover',2);e.b59.clean=true;S.b59.actionTime=0;
    planSetupB59();assert(!S.b59.setup&&!S.b59.lure,'Setup planned');assert(!markSetupB59(e),'Setup marked');
    S.pipSupport=0;const txt=emotionalNextText('support');assert(!/SETUP|prepares openings|diamond/i.test(txt)&&/EMERGENCY RETURN/.test(txt),'card text: '+txt);
    S.pipSupport=2;renderAscendedPauseB39();assert(!/Setup/.test($('b39CoreList').textContent)&&/Rally/.test($('b39CoreList').textContent),'pause still lists Setup');
  });

  return out;
}
