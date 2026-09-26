function runTollChecksB115(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)},near=(a,b)=>Math.abs(a-b)<1e-9;
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const test=(name,fn)=>{try{keys.clear();fresh();reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear()}};
  // Clear a stage with `away` seconds of Pip away already counted; lands on the ranch gate.
  const toGate=(stage=2,away=0)=>{reset();S.run=true;S.stage=stage;S.b115Stage=stage;S.b115Away=away;S.runHearts=40;S.heartCurrency=40;S.stageEnding=true;openStageUpgrade();continueSoundLabB41()};
  const gateOpen=()=>!$('stageUp').classList.contains('hidden')&&!$('ranchGateStepB99').classList.contains('stagehidden');
  const live=()=>{S.run=true;S.end=false;S.b39Paused=false;S.stagePending=false;S.waveState='active';S.waveGoal=999;S.spawn=999;enemies=[]};
  const fine={hunger:100,hygiene:100};
  test('B115 stage fatigue is 4 + stage + 1 per 6s Pip was away, capped at 25 and at 100',()=>{
    fresh({fatigue:0,...fine});toGate(2,37);assert(gateOpen(),'gate missing');assert(ranchB99.fatigue===12&&S.b115Toll.fatigue===12,'toll '+ranchB99.fatigue);
    openRanchGateB99();assert(ranchB99.fatigue===12,'toll charged twice for one stage');assert(loadRanchB99().fatigue===12,'toll not saved');
    fresh({fatigue:0,...fine});toGate(3,5.99);assert(ranchB99.fatigue===7,'partial 6s counted');
    fresh({fatigue:0,...fine});toGate(3,36-1e-12);assert(ranchB99.fatigue===13,'float drift lost a step');
    fresh({fatigue:0,...fine});toGate(20,120);assert(ranchB99.fatigue===25,'cap 25 ignored');
    fresh({fatigue:90,...fine});toGate(9);assert(ranchB99.fatigue===100&&S.b115Toll.fatigue===10,'fatigue passed 100');
    assert(tollFatigueB115(1,0)===5&&tollFatigueB115(2,59.9)===15&&tollFatigueB115(30,0)===25,'formula');
  });
  test('B115 away time counts only in live play and resets each stage',()=>{
    reset();live();S.stage=2;update(.04);S.b115Away=0;
    const tick=()=>{S.pipState='collect';update(.04)};
    tick();tick();assert(near(S.b115Away,.08),'away not counted: '+S.b115Away);
    S.waveState='boss';tick();assert(near(S.b115Away,.12),'boss fight not counted');live();
    let was=S.b115Away;S.pipState='orbit';update(.04);assert(S.b115Away===was,'orbiting Pip counted');
    S.b39Paused=true;S.run=false;tick();assert(S.b115Away===was,'pause counted');live();
    S.waveState='break';S.waveBreak=10;tick();assert(S.b115Away===was,'wave break counted');live();
    S.stagePending=true;S.run=false;S.waveState='stage';tick();assert(S.b115Away===was,'stage gate counted');live();
    S.end=true;tick();assert(S.b115Away===was,'finished run counted');live();
    S.stage=3;S.pipState='orbit';update(.04);assert(S.b115Away===0,'new stage kept old away time');
  });
  test('B115 each stage clear costs 3 + half the stage (rounded up) of hunger and cleanliness',()=>{
    fresh({hunger:50,hygiene:50});toGate(2);assert(ranchB99.hunger===46&&ranchB99.hygiene===46&&S.b115Toll.hunger===-4,'stage 2 toll');
    fresh({hunger:50,hygiene:2});toGate(5);assert(ranchB99.hunger===44&&ranchB99.hygiene===0&&S.b115Toll.hygiene===-2,'stage 5 toll or floor');
    assert(loadRanchB99().hunger===44&&loadRanchB99().hygiene===0,'need toll not saved');
  });
  test('B115 banking a test keeps the week and its hooks but no longer drains hunger and cleanliness again',()=>{
    fresh({hearts:0,hunger:80,hygiene:80});ranchB99.areas.orchard=true;ranchB99.orchard.weeks=0;
    toGate(2);$('returnRanchB99').click();
    assert(ranchB99.week===2&&ranchB99.tests===1&&ranchB99.orchard.weeks===1,'week or week hooks lost');
    assert(ranchB99.hunger===76&&ranchB99.hygiene===76,'bank drained again: '+ranchB99.hunger+'/'+ranchB99.hygiene);
    fresh({hunger:80,hygiene:80,fatigue:10});reset();S.run=true;S.heartCurrency=10;finish(true);
    assert(ranchB99.week===2&&ranchB99.hunger===80&&ranchB99.hygiene===80&&ranchB99.fatigue===B99_DEATH_FATIGUE,'death week wrong');
    fresh({hunger:80,hygiene:80});restB99();assert(ranchB99.hunger===65&&ranchB99.hygiene===65,'rest week lost its drain');
  });
  test('B115 the stage gate shows Pip\'s meters with this stage\'s change and the debuffs in words',()=>{
    fresh({fatigue:40,hunger:50,hygiene:30});toGate(2,12);
    const box=$('ranchGateMetersB115'),txt=box.textContent;
    assert(txt.includes('Tired 48 (+8)')&&txt.includes('Food 46 (−4)')&&txt.includes('Clean 26 (−4)'),'meters: '+txt);
    assert(txt.includes('Pip is hungry: HEAT refills at 75% speed')&&txt.includes('Pip is dirty: Guardian Glow at 70% strength')&&txt.includes('12s away'),'debuffs: '+txt);
    assert(!txt.includes('exhausted')&&!$('nextStageB99').disabled,'rested Pip blocked');
    assert(box.querySelector('.fat i').style.width==='48%'&&box.querySelector('.clean i').style.width==='26%','bars');
    assert(box.compareDocumentPosition($('nextStageB99'))&Node.DOCUMENT_POSITION_FOLLOWING,'meters below the buttons');
    renderGateRefineryB107();assert($('ranchGateMetersB115').textContent===txt,'refinery refresh wiped the meters');
    fresh({fatigue:0,...fine});toGate(2);assert($('ranchGateMetersB115').textContent.includes('No penalties'),'no-debuff line missing');
  });
  test('B115 fatigue 100 blocks Next stage while Return to ranch still works',()=>{
    fresh({fatigue:94,hearts:5,...fine});toGate(2);assert(ranchB99.fatigue===100&&gateOpen(),'setup');
    assert($('nextStageB99').disabled&&$('ranchGateExhaustB115').textContent==='Pip is exhausted — return to the ranch.','block text missing');
    $('nextStageB99').click();assert(S.stage===2&&S.stagePending&&gateOpen(),'click advanced');
    assert(continueStageB99()===false&&S.stage===2&&S.stagePending&&gateOpen(),'direct continue advanced');
    S.b99Onward=true;advanceToNextStage();assert(S.stage===2&&S.stagePending&&gateOpen()&&!S.b99Onward,'forced advance');
    $('returnRanchB99').click();assert(ranchB99.hearts===45&&ranchB99.tests===1&&S.end&&!S.run&&ranchWorldB100.active,'return failed');
    fresh({fatigue:93,...fine});toGate(2);assert(ranchB99.fatigue===99&&!$('nextStageB99').disabled,'99 blocked');
    $('nextStageB99').click();assert(S.stage===3&&!S.stagePending&&S.run,'next failed at 99');
  });
  test('B115 an exhausted Pip recovers: home, one rest, and the arena opens again',()=>{
    fresh({fatigue:94,...fine});toGate(2);assert(ranchB99.fatigue===100&&$('nextStageB99').disabled,'setup');
    $('returnRanchB99').click();assert(ranchWorldB100.active&&startBattleTestB99()===false&&!S.run,'exhausted Pip entered the arena');
    restB99();assert(ranchB99.fatigue===40&&arenaReadyB114(),'rest did not recover');
    startBattleTestB99();assert(S.run&&!ranchWorldB100.active,'arena stayed shut');
  });
  test('B115 hunger tiers scale HEAT regen',()=>{
    assert(typeof heatRegenNeedMultB115==='function','HEAT hook not exposed');
    for(const [h,m] of [[100,1],[60,1],[59,.75],[40,.75],[39,.5],[20,.5],[19,.25],[0,.25]]){ranchB99.hunger=h;assert(heatRegenNeedMultB115()===m,`hunger ${h} gave ${heatRegenNeedMultB115()}`)}
  });
  test('B115 fatigue tiers slow the player\'s attacks and movement',()=>{
    const fire=()=>{S.attackCd=0;enemies=[{type:'chaser',x:P.x+60,y:P.y,r:10,hp:99,maxHp:99,dead:false}];attack();return S.attackCd};
    reset();live();ranchB99.fatigue=0;const cd=fire(),speed=playerSpeedB61();assert(cd>0&&speed>0,'no baseline');
    for(const [f,m] of [[59,1],[60,.9],[79,.9],[80,.8],[99,.8],[100,.8]]){
      ranchB99.fatigue=f;assert(tiredMultB115()===m,`fatigue ${f} tier`);
      assert(near(fire(),cd/m),`fatigue ${f} attack cooldown`);assert(near(playerSpeedB61(),speed*m),`fatigue ${f} move speed`);
    }
    S.run=false;assert(near(playerSpeedB61(),speed),'speed slowed outside a run');
    const top=f=>{reset();live();ranchB99.fatigue=f;keys.add('d');for(let i=0;i<80;i++){enemies=[];update(.04)}keys.delete('d');return hyp(P.vx,P.vy)};
    const v0=top(0),v80=top(80);assert(Math.abs(v80-v0*.8)<.5,`moved at ${v80} vs ${v0}`);
  });
  test('B115 grime tiers weaken Guardian Glow without touching its level',()=>{
    reset();S.pipGuardLv=10;
    const at=(g,lv=10)=>{ranchB99.hygiene=g;S.pipGuardLv=lv;applyPipPower();const v={d:S.shieldRegenDelay,r:S.shieldRegenRate,p:S.supportPower,lv:S.pipGuardLv};S.pipGuardLv=10;return v};
    const clean=at(100);
    for(const [g,m] of [[60,1],[59,.85],[40,.85],[39,.7],[20,.7],[19,.55],[0,.55]]){
      const v=at(g),ref=at(100,10*m);ranchB99.hygiene=g;
      assert(grimeGlowMultB115()===m&&v.lv===10,`hygiene ${g} tier or level`);
      assert(near(v.d,ref.d)&&near(v.r,ref.r)&&near(v.p,ref.p),`hygiene ${g} glow not scaled`);
      if(m<1)assert(v.d>clean.d&&v.r>clean.r&&v.p<clean.p,`hygiene ${g} glow not weaker`);
    }
    const pulse=g=>{ranchB99.hygiene=g;S.pipGuardLv=10;S.shields=1;S.maxShields=3;S.b38AscPulse=5;ascendantPulse();return S.shields};
    assert(pulse(100)===2&&pulse(0)===1&&S.pipGuardLv===10,'Ascended glow pulse not scaled');
  });
  test('B115 starving, filthy or tired Pips keep their levels and hear the debuffs at each stage start',()=>{
    fresh({stats:{range:2,speed:2,power:2,guard:2},hunger:10,hygiene:10,fatigue:60});ranchB99.buffs.battle='stew';startBattleTestB99();
    assert(S.run&&S.pipSpeedLv===2&&S.pipPowerLv===2&&S.pipRangeLv===2&&S.pipGuardLv===2,'stat levels dropped');
    assert(S.b99Base.speed===2&&S.b99Base.power===2&&S.b99Base.range===2&&S.b99Base.guard===2,'ranch base dropped');
    assert(S.maxHealth===120&&S.b104Notes.length===4&&!S.b104Notes.some(n=>n.includes('−1')),'notes or meal hook wrong: '+S.b104Notes.join('|'));
    let mood=$('pipMood').textContent;
    assert(mood.includes('starving')&&mood.includes('filthy')&&mood.includes('tired')&&mood.includes('Carrot Stew'),'stage 1 mood: '+mood);
    S.stageEnding=true;S.runHearts=10;openStageUpgrade();continueSoundLabB41();assert(gateOpen(),'gate missing');
    $('nextStageB99').click();mood=$('pipMood').textContent;
    assert(S.stage===2&&mood.includes('starving')&&mood.includes('filthy')&&mood.includes('tired')&&!mood.includes('Carrot'),'stage 2 mood: '+mood);
  });
  test('B115 integration: hunger slows the real HEAT regen rate from b21-104',()=>{
    fresh({hunger:80});reset();const full=heatRegenRateB115();fresh({hunger:30});reset();const half=heatRegenRateB115();fresh({hunger:5});reset();const low=heatRegenRateB115();
    assert(full>0&&Math.abs(half-full*.5)<1e-9&&Math.abs(low-full*.25)<1e-9,'hunger does not reach regen: '+[full,half,low]);
  });
  fresh();reset();
  return out;
}
