function runRanchChecksB99(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});saveRanchB99()};
  const test=(name,fn)=>{try{fresh();reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
  const clearStage=()=>{reset();S.run=true;S.stage=2;S.runHearts=40;S.stageEnding=true;openStageUpgrade();continueSoundLabB41()};
  test('B99 a drill spends ranch hearts, raises the stat, tires Pip, advances the week and persists',()=>{
    fresh({hearts:50});assert(trainB99('power'),'drill refused');
    assert(ranchB99.stats.power===1&&ranchB99.hearts===40&&ranchB99.fatigue===B99_DRILL_FATIGUE&&ranchB99.week===2,'drill effects wrong');
    const saved=loadRanchB99();assert(saved.stats.power===1&&saved.hearts===40&&saved.week===2,'drill not saved');
  });
  test('B99 fatigue, hearts and caps block drills and rest recovers',()=>{
    fresh({hearts:500,fatigue:B99_TIRED});assert(!trainB99('speed')&&ranchB99.stats.speed===0,'tired Pip trained');
    restB99();assert(ranchB99.fatigue===B99_TIRED-B99_REST&&ranchB99.week===2,'rest wrong');assert(trainB99('speed'),'rested Pip refused');
    fresh({hearts:5});assert(drillBlockB99('range')==='hearts','unaffordable drill allowed');
    fresh({hearts:500,stats:{range:0,speed:B99_DRILLS.speed.cap,power:0,guard:0}});assert(drillBlockB99('speed')==='capped','cap ignored');
  });
  test('B99 ranch levels start every run and in-run upgrades are priced from them',()=>{
    fresh({stats:{range:3,speed:2,power:4,guard:1}});reset();
    assert(S.pipRangeLv===3&&S.pipSpeedLv===2&&S.pipPowerLv===4&&S.pipGuardLv===1,'ranch levels not applied');
    assert(pipAbilityCost('power')===8&&pipAbilityCost('range')===5,'ranch levels raised shop prices');
    S.pipPowerLv++;assert(pipAbilityCost('power')===12,'in-run growth not priced');
  });
  test('B99 finishing the stage panel asks before advancing and Next stage continues',()=>{
    clearStage();assert(S.stage===2&&S.stagePending&&!$('ranchGateStepB99').classList.contains('stagehidden')&&!$('stageUp').classList.contains('hidden'),'gate missing');
    $('nextStageB99').click();assert(S.stage===3&&!S.stagePending&&S.run&&$('stageUp').classList.contains('hidden'),'next stage failed');
  });
  test('B99 Return to ranch banks every run heart, ends the run and opens the ranch',()=>{
    fresh({hearts:5});clearStage();$('returnRanchB99').click();
    assert(ranchB99.hearts===45&&ranchB99.tests===1&&S.end&&!S.run&&!S.stagePending,'return banking wrong');
    assert(!$('ranchB99').classList.contains('hidden')&&$('stageUp').classList.contains('hidden'),'ranch not shown');
    assert(stageUpgradeVisibleB35()&&gamepadMenuButtonsB35().includes($('ranchBattleB99')),'ranch not controller reachable');
    finish(true);assert(ranchB99.hearts===45&&ranchB99.tests===1,'ended run banked twice');
  });
  test('B99 Battle test starts a fresh run with ranch levels',()=>{
    fresh({stats:{range:0,speed:0,power:2,guard:0}});openRanchB99();$('ranchBattleB99').click();
    assert(S.run&&!S.end&&S.stage===1&&S.pipPowerLv===2&&$('ranchB99').classList.contains('hidden')&&$('start').classList.contains('hidden'),'battle test did not start');
  });
  test('B99 falling in battle banks half and sends Pip home worn out, once',()=>{
    fresh({hearts:1,fatigue:10});S.run=true;S.runHearts=31;finish(true);
    assert(ranchB99.hearts===16&&ranchB99.fatigue===B99_DEATH_FATIGUE&&ranchB99.tests===1,'death banking wrong');
    assert($('endText').textContent.includes('♥ 15'),'end text missing ranch line');finish(true);assert(ranchB99.hearts===16,'death banked twice');
    $('endRanchB99').click();assert(!$('ranchB99').classList.contains('hidden')&&$('end').classList.contains('hidden'),'end ranch button');
  });
  test('B99 corrupt ranch saves fall back to safe values',()=>{
    localStorage.setItem(B99_RANCH_KEY,JSON.stringify({week:-4,hearts:'x',fatigue:900,stats:{range:99,power:-3}}));
    const r=loadRanchB99();assert(r.week===1&&r.hearts===0&&r.fatigue===100&&r.stats.range===B99_DRILLS.range.cap&&r.stats.power===0&&r.stats.speed===0,'bad save accepted');
    localStorage.setItem(B99_RANCH_KEY,'{');assert(loadRanchB99().week===1,'unparseable save');
  });
  fresh();reset();
  return out;
}
