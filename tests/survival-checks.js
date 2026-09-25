function runSurvivalChecksB63(){
  const results=[],saved={...settingsB61};
  const assert=(ok,msg)=>{if(!ok)throw Error(msg)},near=(a,b)=>Math.abs(a-b)<1e-6;
  const test=(name,fn)=>{try{applySettingsB61(B61_DEFAULTS);transportFixtureB60();fn();results.push({name,ok:true})}catch(e){results.push({name,ok:false,error:e.message})}};
  test('Opening stages freeze all numeric enemy and boss scaling',()=>{
    for(const stage of [1,2,3]){S.stage=stage;S.wave=stage*3;S.stageWaveCount=3;S.runHearts=999;S.bossCount=4;
      assert(difficulty()===.88&&difficultyWaveB63()===1&&difficultyStageB63()===1,'opening pressure scaled');
      assert(enemyCap()===(H>W?8:11)&&waveGoalFor(S.wave)===8,'opening population scaled');
      spawnEnemy('chaser');assert(enemies.at(-1).hp===2,'opening HP scaled');
      startBossBattle();assert(S.bossMaxHp===79&&enemies.at(-1).bossStage===1,'opening boss scaled');
    }
  });
  const curveB108=(stage,hearts)=>{const base=stage<=10?1+(stage-3)*9/7:10+9/7*4*(Math.sqrt(1+(stage-10)/2)-1);return Math.max(1,Math.floor(base*(1+.15*Math.min(1,hearts/(30*(stage-3))))+1e-9))};
  test('B108 stages 4+ follow the stage curve and hearts nudge it by at most 15%',()=>{
    for(const stage of [4,7,10,11,14,20,30])for(const hearts of [0,30,999]){
      S.stage=stage;S.wave=99;S.earlyRunHearts=0;S.runHearts=hearts;S.heartCurrency=0;S.heartTotal=99999;
      const tier=curveB108(stage,hearts),w=1+(tier-1)*3;
      const expected=.88+Math.min(1.1,(w-1)*.12)+(tier>=5?.16+Math.min(.34,(tier-5)*.045):0);
      assert(difficultyStageB63()===tier&&near(difficulty(),expected),`wrong tier at stage ${stage} hearts ${hearts}`);
      assert(waveGoalFor(99)===Math.min(16,8+Math.floor((tier-1)*2/3)),'wrong kill target');
    }
  });
  test('B108 the curve never cliffs: at most two tiers per stage even with every heart',()=>{
    let prev=1;for(let stage=1;stage<=40;stage++){S.stage=stage;S.earlyRunHearts=0;S.runHearts=99999;const t=difficultyStageB63();assert(t>=prev&&t-prev<=2,`cliff at stage ${stage}: ${prev}→${t}`);prev=t}
    S.stage=10;S.runHearts=0;const calm=difficultyStageB63();S.runHearts=99999;assert(difficultyStageB63()<=Math.floor(calm*1.15)+1,'hearts moved difficulty too far');
  });
  test('Stage 4 discounts only opening hearts once, then counts new hearts normally',()=>{
    S.stage=3;S.wave=9;S.runHearts=60;S.stageEnding=false;advanceToNextStage();
    assert(S.stage===4&&S.earlyRunHearts===60&&difficultyHeartsB63()===20&&difficultyStageB63()===curveB108(4,20),'entry discount wrong');
    assert(S.waveGoal===waveGoalFor(S.wave),'first wave used undiscounted hearts');
    S.runHearts+=20;assert(difficultyHeartsB63()===40,'new hearts discounted');
    advanceToNextStage();assert(S.earlyRunHearts===60&&difficultyHeartsB63()===40,'discount repeated next stage');
    S.stage=11;assert(difficultyStageB63()===curveB108(11,40),'curve past 10 wrong');
    reset();assert(S.earlyRunHearts===0&&S.runHearts===0,'discount survived new run');
  });
  test('B108 stages past 10 extend the curve into capped enemy stats',()=>{
    for(const stage of [11,13,17,30]){
      S.stage=stage;S.wave=(stage-1)*3+2;S.stageWaveCount=2;S.earlyRunHearts=0;S.runHearts=0;S.bossCount=3;
      const tier=curveB108(stage,0),boss=Math.floor((tier-1)/3);
      assert(difficultyWaveB63()===1+(tier-1)*3&&difficultyBossCountB63()===boss,'wave or boss count wrong');
      assert(enemyCap()===(H>W?15:18),'cap not saturated');
      spawnEnemy('charger');assert(enemies.at(-1).hp===3+Math.min(5,1+Math.floor((tier-5)/2)),'HP wrong');
      startBossBattle();assert(S.bossMaxHp===Math.round(54+tier*7+(1+boss)*18)&&enemies.at(-1).bossStage===tier+boss*2,'boss wrong');
    }
  });
  test('Run hearts count only banked pickups, survive spending and stages, and reset independently of lifetime',()=>{
    const h=heartFixtureB60();heartBits=[h];gatherHeartB60(h);assert(S.runHearts===0,'cargo counted early');
    deliverCargoB60(false);assert(S.runHearts===1,'delivery not counted');collectHeartBit(h);assert(S.runHearts===1,'duplicate counted');
    S.heartCurrency=0;S.stage=4;assert(S.runHearts===1,'spending or stage reset counter');
    const total=S.heartTotal;reset();assert(S.runHearts===0&&S.heartTotal===total,'run reset changed lifetime or retained run hearts');
  });
  test('Compassion extends actual away duration and removes its shield-delay reduction',()=>{
    for(const lv of [0,1,4]){
      transportFixtureB60();S.pipCompassion=lv;S.pipGuardLv=2;applyPipPower();P.pipX=10000;S.pipState='return';
      assert(heartSecondsB63()===1+lv*.5&&near(S.shieldRegenDelay,3.6),'duration or Guard delay wrong');
      stepB59(.5);assert(near(pipBondB51(),1-.5/(1+lv*.5)),'actual decay ignored Compassion');
      stepB59(1+lv*.5);assert(pipBondB51()===0&&near(carrySpeedB60(),285*.9),'empty meter penalty missing');
    }
  });
  test('Shield loss immediately drops cargo without banking and starts a physical emergency return',()=>{
    S.pipSupport=1;S.shields=2;S.invuln=0;S.pipState='collect';transportB60().cargo=[heartFixtureB60(),heartFixtureB60()];
    const oldX=P.pipX;hurt();
    assert(S.shields===1&&S.pipState==='return'&&transportB60().cargo.length===0&&heartBits.length===2,'emergency failed');
    assert(P.pipX===oldX&&S.runHearts===0&&S.heartCurrency===0,'recall teleported or banked');
    assert(heartBits.every(h=>!h.b60Carried&&!h.dead&&h.life===10),'dropped hearts not collectible');
    const dropped=[...heartBits];updatePipCompanion(.02);assert(P.pipX<oldX&&heartBits.length===2,'return not physical or drops duplicated');
    S.shields=2;S.pipState='collect';assert(gatherHeartB60(dropped[0]),'dropped heart could not be recovered');deliverCargoB60(false);assert(S.runHearts===1,'recovered heart was not banked exactly once');
  });
  test('Emergency support overrides Rally and refuses cargo or magnet pickups until two shields',()=>{
    S.pipSupport=2;S.pipLove=2;S.shields=1;S.b51PipBond=0;partnershipB59().rallyReturn=true;
    const h=heartFixtureB60();heartBits=[h];S.over=3;S.overType='pip';
    updatePipCompanion(.02);assert(S.pipState==='return'&&!partnershipB59().rallyReturn,'Rally overrode emergency');
    assert(!gatherHeartB60(h),'emergency gathered');const x=h.x;updateAscendantHeartMagnetB26(.1);assert(h.x===x,'emergency magnet moved cargo');
    P.pipX=P.x+20;P.pipY=P.y;updatePipCompanion(.02);assert(S.pipState==='orbit','did not reunite');
    heartBits=[heartFixtureB60(P.x+5,P.y)];transportB60().rest=0;updatePipCompanion(.02);assert(S.pipState==='orbit'&&!S.pipTarget,'left while vulnerable');
    S.shields=2;assert(findPipHeartTarget()!==null,'did not release collection after recovery');
  });
  test('Emergency return fires learned Pip weapons at orbit strength without restoring bond or player bonuses',()=>{
    S.pipSupport=1;S.shields=1;S.pipState='return';S.b51PipBond=0;S.pipShotCd=0;enemies=[{type:'chaser',x:200,y:0,r:12,hp:999,speed:60,age:0,dead:false}];shots=[];
    updatePipCombat(.02);assert(shots.length===0,'granted an unlearned attack');
    S.pipBossPowers.starshot=1;updatePipCombat(.02);
    assert(shots.some(s=>s.source==='pip'&&near(s.power,.86)),'return attack missing or bond-scaled');
    assert(pipBondB51()===0&&!pipWithPlayer()&&near(carrySpeedB60(),256.5),'support restored bond or removed loneliness');
  });
  test('Unlearned Support and two healthy shields preserve cargo gathering',()=>{
    for(const [support,shields] of [[0,1],[1,2]]){
      transportFixtureB60();S.pipSupport=support;S.shields=shields;transportB60().cargo=[heartFixtureB60()];
      const h=heartFixtureB60(160);heartBits=[h];S.pipTarget=h;updatePipCompanion(.02);
      assert(transportB60().cargo.length>=1&&S.runHearts===0,'healthy/unlearned support dropped cargo');
    }
  });
  test('Pause freezes emergency return and describes both changed traits and run pressure',()=>{
    S.pipSupport=1;S.pipCompassion=2;S.shields=1;S.b51PipBond=.5;openAscendedPauseB39();
    const state=JSON.stringify([P.pipX,S.t,pipBondB51(),S.runHearts]);stepB59(.5);
    assert(JSON.stringify([P.pipX,S.t,pipBondB51(),S.runHearts])===state,'paused emergency changed state');
    assert($('b39CoreList').textContent.includes('2.0 seconds away')&&emotionalNextText('compassion').includes('2.0 → 2.5')&&emotionalNextText('support').includes('Below 2 shields'),'copy stale');
    closeAscendedPauseB39();
  });
  test('B108 difficulty HUD reports opening, tier, rank and heart nudge',()=>{
    S.stage=2;updateUI();assert($('difficultyHudB65').textContent==='DIFF · OPENING','opening HUD wrong');
    S.stage=4;S.earlyRunHearts=30;S.runHearts=30;updateUI();assert($('difficultyHudB65').textContent==='DIFF · T2 · ♥+5%','nudge HUD wrong: '+$('difficultyHudB65').textContent);
    S.runHearts=0;S.earlyRunHearts=0;updateUI();assert($('difficultyHudB65').textContent==='DIFF · T2','plain HUD wrong');
    S.stage=11;updateUI();assert($('difficultyHudB65').textContent==='DIFF · T11','late HUD wrong');
    S.stage=2;S.b108Rank=2;updateUI();assert($('difficultyHudB65').textContent==='DIFF · T5 · RANK C','rank HUD wrong');
    reset();assert($('difficultyHudB65').textContent==='DIFF · OPENING','reset HUD stale');
  });
  test('Supportive emergency announces once, labels return and guard, then clears at two shields',()=>{
    S.pipSupport=1;S.shields=2;S.invuln=0;S.pipState='collect';transportB60().cargo=[heartFixtureB60(),heartFixtureB60()];
    const beforePopup=popup,seen=[];popup=(...args)=>seen.push(args);
    try{
      hurt();updateUI();assert(!seen.some(args=>String(args[2]).includes('CARGO DROPPED'))&&seen.some(args=>String(args[2]).includes('SHIELD BROKE'))&&S.b66EmergencyActive,'activation cues wrong');
      assert($('tip').textContent.includes('PIP RETURNING')&&$('tip').textContent.includes('SHIELDS 1/2'),'return label missing');
      const count=seen.length;update(.02);update(.02);assert(seen.length===count,'announcement repeated');
      P.pipX=P.x+10;P.pipY=P.y;update(.02);updateUI();assert($('tip').textContent.includes('PIP GUARDING'),'guard label missing');
      S.shields=2;update(.02);updateUI();assert(!S.b66EmergencyActive&&!$('tip').textContent.includes('PIP GUARDING'),'cue did not clear');
    }finally{popup=beforePopup}
    reset();assert(!S.b66EmergencyActive,'cue survived reset');
  });
  test('Emergency-dropped cargo survives indefinitely until two shields, then expires normally',()=>{
    S.pipSupport=1;S.shields=2;S.invuln=0;S.pipState='collect';P.pipX=2000;transportB60().cargo=[heartFixtureB60(2000),heartFixtureB60(2000)];
    hurt();S.shieldRegenClock=-999;assert(heartBits.every(h=>h.b67SafeDrop)&&safeCargoCountB67()===2,'cargo not safeguarded');
    updateUI();assert($('tip').textContent.includes('CARGO 2 SAFE'),'safe cargo cue missing');
    stepB59(18);assert(heartBits.length===2&&heartBits.every(h=>h.life>9.9),'cargo expired during emergency');
    const life=heartBits[0].life;openAscendedPauseB39();stepB59(2);assert(heartBits[0].life===life,'pause changed safe lifetime');closeAscendedPauseB39();
    S.shields=2;S.pipSupport=0;P.pipX=P.x;heartBits.forEach(h=>{h.x=10000;h.y=0});stepB59(9.8);
    assert(heartBits.length===2&&heartBits[0].life<.3,'normal countdown did not resume');stepB59(.3);assert(heartBits.length===0,'released cargo did not expire');
  });
  test('Ordinary hearts retain normal lifetime and recovered safe cargo banks once',()=>{
    const ordinary=heartFixtureB60();ordinary.life=.2;heartBits=[ordinary];stepB59(.3);assert(!heartBits.includes(ordinary),'ordinary heart was protected');
    transportFixtureB60();S.pipSupport=1;S.shields=2;S.invuln=0;transportB60().cargo=[heartFixtureB60()];hurt();
    const dropped=heartBits[0];S.shields=2;S.pipSupport=0;S.pipState='collect';assert(gatherHeartB60(dropped),'safe cargo not recoverable');deliverCargoB60(false);
    assert(S.runHearts===1&&S.heartCurrency===1&&dropped.dead,'recovered cargo did not bank once');
  });
  test('Emergency drops form stable, separate recovery markers that update and disappear',()=>{
    S.pipSupport=1;S.shields=2;S.invuln=0;transportB60().cargo=[heartFixtureB60(),heartFixtureB60()];hurt();
    const first=cargoGroupsB68();assert(first.length===1&&first[0].count===2&&first[0].id===1,'first marker wrong');
    const group=first[0].id,heart=heartBits[0];heart.x+=20;const moved=cargoGroupsB68()[0];assert(moved.id===group&&moved.x!==first[0].x,'centroid stale');
    S.shields=2;S.pipState='collect';assert(gatherHeartB60(heart)&&cargoGroupsB68()[0].count===1,'collection did not update marker');
    deliverCargoB60(false);S.shields=1;S.pipState='collect';transportB60().cargo=[heartFixtureB60()];dropCargoB63();
    assert(cargoGroupsB68().length===2&&new Set(cargoGroupsB68().map(g=>g.id)).size===2,'drop groups merged');
    heartBits.forEach(h=>h.dead=true);assert(cargoGroupsB68().length===0,'empty marker survived');
    reset();assert(!S.b68DropSerial&&cargoGroupsB68().length===0,'marker state survived reset');
  });
  test('Mobile HUD preserves every resource, accessible label and movement fade',()=>{
    S.heartCurrency=12;S.prismSeeds=3;S.musicNotes=4;S.starPoints=5;S.pipSoundCredits=2;S.audioMixCredits=1;renderCurrencyHudB47();
    const items=[...$('currencyHud').querySelectorAll('.b47-currency')];
    assert(items.length===6&&items.map(x=>x.getAttribute('aria-label')).join('|')==='Hearts 12|Prism Seeds 3|Music Notes 4|Run Stars 5|Sound Choices 2|Mix Choices 1','resource HUD lost data');
    S.b47CurrencyHudMoving=true;renderCurrencyHudB47();assert($('currencyHud').classList.contains('b47-moving'),'movement fade lost');
  });
  test('Pip dialogue is one polite status region and emergency tip stays separate',()=>{
    assert($('pipMood').getAttribute('role')==='status'&&$('pipMood').getAttribute('aria-live')==='polite'&&$('pipMood').getAttribute('aria-atomic')==='true','Pip message semantics missing');
    showPipMessage('lane check');assert($('pipMood').textContent.includes('lane check'),'Pip message content lost');
    S.pipSupport=1;S.shields=1;S.pipState='return';updateUI();assert($('tip').textContent.includes('PIP RETURNING')&&!$('pipMood').textContent.includes('PIP RETURNING'),'combat tip merged into dialogue');
  });
  test('Heart timer reports the mechanical reserve only while Pip is away',()=>{
    S.pipCompassion=2;S.b51PipBond=.5;S.b51PipBondVisual=.5;S.pipState='collect';
    assert(near(pipBondSecondsRemainingB72(),1),'timer ignored bond or Compassion');
    const beforeFill=X.fillText,seen=[];X.fillText=(text,...args)=>seen.push(String(text));
    try{drawPipBondTimerB72();assert(seen.includes('1.0s'),'away timer not drawn');seen.length=0;S.pipState='orbit';drawPipBondTimerB72();assert(!seen.length,'orbit timer added permanent clutter')}finally{X.fillText=beforeFill}
    S.pipState='return';S.b51PipBond=0;assert(pipBondSecondsRemainingB72()===0,'empty timer did not reach zero');
  });
  test('Banking a heart-tier boundary pulses the difficulty pill and obeys pause',()=>{
    S.stage=7;S.earlyRunHearts=0;S.runHearts=111;assert(difficultyStageB63()===6,'fixture tier');collectHeartBit(heartFixtureB60());updateUI();
    assert(S.b73DifficultyTier===7&&near(S.b73DifficultyPulse,1)&&difficultyHudB65.classList.contains('b73-tier-up'),'tier cue missing');
    assert(difficultyHudB65.textContent==='DIFF · T7 · ♥+14%'&&difficultyHudB65.getAttribute('aria-label').includes('Tier 7 reached'),'new tier not reported: '+difficultyHudB65.textContent);
    S.b39Paused=true;update(.4);assert(near(S.b73DifficultyPulse,1),'pause consumed cue');S.b39Paused=false;update(.4);assert(S.b73DifficultyPulse<1,'active play did not consume cue');
    S.b73DifficultyPulse=.01;update(.02);updateUI();assert(!difficultyHudB65.classList.contains('b73-tier-up'),'expired cue stayed lit');
    for(const stage of [3,11]){transportFixtureB60();S.stage=stage;S.runHearts=19;collectHeartBit(heartFixtureB60());assert(!S.b73DifficultyPulse,`stage ${stage} triggered heart-tier cue`)}
    reset();assert(!S.b73DifficultyPulse&&!difficultyHudB65.classList.contains('b73-tier-up'),'reset retained cue');
  });
  test('B82 stages one through six preserve the original enemy population path',()=>{
    for(const stage of [1,4,6]){S.stage=stage;S.stageWaveCount=3;S.runHearts=180;assert(enemyRosterB82()===null,'early stage gained rotation');assert(enemyCap()===enemyCapBeforeB82(),'early cap changed')}
  });
  test('B82 late waves rotate every enemy type through lower rising caps',()=>{
    const width=W,height=H;try{W=1000;H=600;S.stage=7;for(let wave=1;wave<=3;wave++){S.stageWaveCount=wave;const roster=enemyRosterB82(),expected=B82_ROSTERS[wave-1];assert(roster===expected&&enemyCap()===12+wave,'landscape rotation/cap wrong');assert(rosterEnemyB82(roster,.1)==='chaser'&&rosterEnemyB82(roster,(roster.chaser+roster.core)/2)==='core'&&rosterEnemyB82(roster,.99)==='charger','roster lost an enemy type')}W=390;H=844;for(let wave=1;wave<=3;wave++){S.stageWaveCount=wave;assert(enemyCap()===9+wave,'portrait cap wrong')}}finally{W=width;H=height}
  });
  test('B82 stage eleven restores the exact legacy cap and roster',()=>{
    const width=W,height=H;try{S.stage=11;S.wave=31;S.stageWaveCount=2;S.runHearts=999;assert(enemyRosterB82()===null,'rotation leaked into legacy');W=1000;H=600;assert(enemyCap()===18&&enemyCap()===enemyCapBeforeB82(),'landscape legacy cap changed');W=390;H=844;assert(enemyCap()===15&&enemyCap()===enemyCapBeforeB82(),'portrait legacy cap changed')}finally{W=width;H=height}
  });
  applySettingsB61(saved);reset();S.audioEnabled=false;return results;
}
