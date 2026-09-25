function runRanchChecksB99(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const test=(name,fn)=>{try{keys.clear();fresh();reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear()}};
  const clearStage=()=>{reset();S.run=true;S.stage=2;S.runHearts=40;S.heartCurrency=40;S.stageEnding=true;openStageUpgrade();continueSoundLabB41()};
  const press=(key=' ')=>{updateRanchB100(.016);keys.add(key);updateRanchB100(.016);keys.delete(key);updateRanchB100(.016)};
  const at=id=>{const st=stationB100(id);ranchWorldB100.px=st.x;ranchWorldB100.py=st.y+20;ranchWorldB100.pip.x=st.x+400;ranchWorldB100.pip.y=st.y};
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
  test('B99 Return to ranch banks every run heart, ends the run and walks into the ranch',()=>{
    fresh({hearts:5});clearStage();$('returnRanchB99').click();
    assert(ranchB99.hearts===45&&ranchB99.tests===1&&S.end&&!S.run&&!S.stagePending,'return banking wrong');
    assert(ranchWorldB100.active&&document.body.classList.contains('ranchB100')&&$('stageUp').classList.contains('hidden'),'ranch world not entered');
    finish(true);assert(ranchB99.hearts===45&&ranchB99.tests===1,'ended run banked twice');
  });
  test('B99 falling in battle banks half and sends Pip home worn out, once',()=>{
    fresh({hearts:1,fatigue:10});S.run=true;S.runHearts=31;S.heartCurrency=31;finish(true);
    assert(ranchB99.hearts===16&&ranchB99.fatigue===B99_DEATH_FATIGUE&&ranchB99.tests===1,'death banking wrong');
    assert($('endText').textContent.includes('♥ 15'),'end text missing ranch line');finish(true);assert(ranchB99.hearts===16,'death banked twice');
    $('endRanchB99').click();assert(ranchWorldB100.active&&$('end').classList.contains('hidden'),'end ranch button');
  });
  test('B101 hearts spent on in-run upgrades never reach the ranch',()=>{
    fresh({hearts:0});clearStage();$('returnRanchB99').click();assert(ranchB99.hearts===40,'unspent baseline');
    fresh({hearts:0});reset();S.run=true;S.stage=2;S.runHearts=40;S.heartCurrency=40;S.stageEnding=true;openStageUpgrade();
    openAbilityStep();buyPipAbility('range');const spent=40-S.heartCurrency;assert(spent>0,'upgrade not bought');
    continueSoundLabB41();assert($('ranchGateTextB99').textContent.includes(`♥ ${40-spent} unspent`),'gate shows collected, not unspent');
    $('returnRanchB99').click();assert(ranchB99.hearts===40-spent,'spent hearts reached the ranch');
    fresh({hearts:0});reset();S.run=true;S.runHearts=30;S.heartCurrency=11;finish(true);assert(ranchB99.hearts===5,'death banked spent hearts');
  });
  test('B99 corrupt ranch saves fall back to safe values',()=>{
    localStorage.setItem(B99_RANCH_KEY,JSON.stringify({week:-4,hearts:'x',fatigue:900,stats:{range:99,power:-3},points:{range:'q',speed:1e9}}));
    const r=loadRanchB99();assert(r.week===1&&r.hearts===0&&r.fatigue===100&&r.stats.range===B99_DRILLS.range.cap&&r.stats.power===0&&r.stats.speed===0,'bad save accepted');
    assert(r.points.range===B99_DRILLS.range.cap*10&&r.points.speed===9&&r.points.power===0,'bad points accepted');
    localStorage.setItem(B99_RANCH_KEY,'{');assert(loadRanchB99().week===1,'unparseable save');
  });
  test('B100 ranch world hides the arena HUD, moves the player and keeps them inside the fence',()=>{
    openRanchB99();assert(ranchWorldB100.active&&document.body.classList.contains('ranchB100')&&$('start').classList.contains('hidden'),'ranch not open');
    const x=ranchWorldB100.px;keys.add('d');for(let i=0;i<10;i++)updateRanchB100(.05);keys.delete('d');assert(ranchWorldB100.px>x+100,'player did not walk');
    keys.add('a');for(let i=0;i<400;i++)updateRanchB100(.05);keys.delete('a');assert(ranchWorldB100.px===40,'left the ranch');
    draw();
  });
  test('B100 a solo drill costs a week and succeeds for base points or fails for base minus bonus',()=>{
    fresh({stones:100});openRanchB99();
    let r=soloDrillB100('power',0);assert(r.ok&&r.gain===B100_BASE&&ranchB99.points.power===10&&ranchB99.stats.power===1&&r.levelUp,'solo success wrong');
    assert(ranchB99.stones===99&&ranchB99.fatigue===B99_DRILL_FATIGUE&&ranchB99.week===2,'solo cost wrong');
    r=soloDrillB100('power',.999);assert(!r.ok&&r.gain===B100_BASE-B100_BONUS&&ranchB99.points.power===15&&ranchB99.stats.power===1,'solo failure wrong');
    fresh({fatigue:0});const rested=soloChanceB100();fresh({fatigue:60});assert(soloChanceB100()<rested,'fatigue did not lower solo odds');
    assert(loadRanchB99().points.power===0,'fresh save kept points');
  });
  test('B100 walking to a station and pressing A opens its drill sheet; solo runs from the sheet',()=>{
    fresh({stones:100});openRanchB99();at('guard');press();
    assert(ranchWorldB100.sheet&&$('ranchSheetB100').classList.contains('on')&&$('ranchSheetB100').textContent.includes('Glow Pond'),'station sheet missing');
    press();assert(!ranchWorldB100.sheet&&ranchB99.week===2&&ranchB99.points.guard>=5,'solo from sheet failed');
  });
  test('B100 blocked drills explain why and never charge',()=>{
    fresh({hearts:500,stones:0});openRanchB99();at('speed');press();
    assert($('ranchSheetB100').textContent.includes('Refine hearts at the Heart Refinery')&&ranchWorldB100.sheet.options.length===1,'no-stone reason missing');
    press();assert(ranchB99.week===1&&!ranchWorldB100.game,'blocked drill ran');
    fresh({stones:99,fatigue:B99_TIRED});openRanchB99();at('speed');press();assert($('ranchSheetB100').textContent.includes('too tired'),'tired reason missing');
  });
  test('B100 timing mini-game: 3 of 4 wins base plus bonus, fewer loses the bonus',()=>{
    fresh({stones:100});openRanchB99();assert(startGameB100('power'),'game refused');const g=ranchWorldB100.game;assert(g&&ranchB99.stones===99&&ranchB99.week===2,'game cost wrong');
    const hit=()=>{g.zone=.5-.5*Math.cos(g.phase);g.cool=0;gameInputB100(g,0,true,true)},miss=()=>{const pos=.5-.5*Math.cos(g.phase);g.zone=pos>.5?pos-.4:pos+.4;g.cool=0;gameInputB100(g,0,true,true)};
    hit();hit();miss();hit();assert(!ranchWorldB100.game&&ranchB99.points.power===B100_BASE+B100_BONUS,'win did not award bonus');
    startGameB100('power');const h=ranchWorldB100.game;const m=()=>{const pos=.5-.5*Math.cos(h.phase);h.zone=pos>.5?pos-.4:pos+.4;h.cool=0;gameInputB100(h,0,true,true)};
    m();m();h.zone=.5-.5*Math.cos(h.phase);h.cool=0;gameInputB100(h,0,true,true);m();
    assert(ranchB99.points.power===B100_BASE+B100_BONUS+B100_BASE-B100_BONUS,'loss did not subtract bonus');
  });
  test('B100 hold mini-game scores releases inside the band and overflow as a miss',()=>{
    fresh({stones:100});openRanchB99();startGameB100('guard');const g=ranchWorldB100.game;
    const release=f=>{g.cool=0;g.holding=true;g.fill=f;gameInputB100(g,0,false,false)};
    release(g.lo+.01);assert(g.hits===1,'band release missed');release(.1);assert(g.hits===1&&g.attempts===2,'early release scored');
    g.cool=0;g.fill=1.01;gameInputB100(g,.1,true,true);assert(!ranchWorldB100.game&&ranchB99.points.guard===B100_BASE-B100_BONUS,'overflow not a miss');
  });
  test('B100 Scent Hunt lets the player walk over sparkles and times out',()=>{
    fresh({stones:100});openRanchB99();startGameB100('range');const g=ranchWorldB100.game;
    for(const s of g.sparks.slice(0,4)){ranchWorldB100.px=s.x;ranchWorldB100.py=s.y;gameInputB100(g,.01,false,false)}
    assert(g.hits===4&&ranchWorldB100.game===g,'pickups wrong');g.time=0;gameInputB100(g,.01,false,false);
    assert(!ranchWorldB100.game&&ranchB99.points.range===B100_BASE+B100_BONUS,'4 of 5 did not win');
  });
  test('B100 petting Pip and resting at the bed',()=>{
    fresh({fatigue:80});openRanchB99();const w=ranchWorldB100;w.pip.x=w.px+10;w.pip.y=w.py;w.pip.state='idle';w.idle=1;press();
    assert(w.pip.happy>0&&w.hearts.length>0,'pet failed');
    at('home');press();assert(w.sheet&&$('ranchSheetB100').textContent.includes('Rest'),'bed sheet missing');press();
    assert(ranchB99.fatigue===80-B99_REST&&ranchB99.week===2&&w.pip.state==='sleep','rest failed');
  });
  test('B100 the arena gate starts a battle test with ranch levels and leaves the ranch',()=>{
    fresh({stats:{range:0,speed:0,power:2,guard:0}});openRanchB99();at('gate');press();press();
    assert(!ranchWorldB100.active&&!document.body.classList.contains('ranchB100')&&S.run&&!S.end&&S.stage===1&&S.pipPowerLv===2&&$('start').classList.contains('hidden'),'gate did not start a test');
  });
  test('B100 sheet navigation and back close without acting',()=>{
    fresh({stones:100});openRanchB99();at('power');press();focusSheetB100(0);keys.add('ArrowDown');updateRanchB100(.016);keys.delete('ArrowDown');updateRanchB100(.016);
    assert(ranchWorldB100.sheet.focus===1,'nav failed');keys.add('Escape');updateRanchB100(.016);keys.delete('Escape');
    assert(!ranchWorldB100.sheet&&ranchB99.week===1,'back acted');
  });
  test('B102 refining takes the level time per 50 hearts and fills the tray',()=>{
    assert(B102_REFINE_SECONDS.join()==='900,600,480,300,240,180,120,60,30,10','refine times wrong');
    fresh({hearts:120});const t0=1e12;assert(loadHeartsB102(9,t0)===2&&ranchB99.hearts===20&&ranchB99.refinery.queue===2,'loading wrong');
    const never=()=>.9;tickRefineryB102(t0+899e3,never);assert(ranchB99.refinery.trayStones===0,'finished early');
    tickRefineryB102(t0+900e3,never);assert(ranchB99.refinery.trayStones===1&&ranchB99.refinery.queue===1,'first stone late');
    tickRefineryB102(t0+1800e3,never);assert(ranchB99.refinery.trayStones===2&&!ranchB99.refinery.queue&&!ranchB99.refinery.startedAt,'second stone');
    const g=collectTrayB102(t0+1800e3);assert(g.stones===2&&ranchB99.stones===2&&!ranchB99.refinery.trayStones,'collect wrong');
    assert(loadRanchB99().stones===2,'stones not saved');
  });
  test('B102 each refining task has a 10% star dust chance and 5 dust fuse into a Star Stone',()=>{
    fresh({hearts:100});const t0=1e12;loadHeartsB102(2,t0);let i=0;const rolls=[.05,.5];tickRefineryB102(t0+1800e3,()=>rolls[i++]);
    assert(ranchB99.refinery.trayDust===1,'dust roll wrong');
    fresh({dust:4});assert(!fuseStarB102(),'fused with 4 dust');ranchB99.dust=5;assert(fuseStarB102()&&ranchB99.dust===0&&ranchB99.starStones===1,'fuse wrong');
  });
  test('B102 refinery upgrades cost Star Stones, speed refining and keep finished work',()=>{
    fresh({hearts:100,starStones:1});const t0=1e12;loadHeartsB102(2,Date.now());
    const f=ranchB99.refinery;f.startedAt=Date.now()-900e3;assert(upgradeRefineryB102()&&f.level===2&&ranchB99.starStones===0,'upgrade failed');
    assert(f.trayStones===1&&f.queue===1,'finished work lost on upgrade');assert(refineSecondsB102(2)===600&&refineSecondsB102(10)===10,'level times');
    assert(!upgradeRefineryB102(),'upgraded without stars');ranchB99.starStones=99;f.level=10;assert(!upgradeRefineryB102(),'passed max level');
  });
  test('B102 drills cost Heart Stones, not hearts',()=>{
    fresh({hearts:999,stones:0});assert(drillBlockB99('power')==='stones'&&!soloDrillB100('power',0),'hearts bought a drill');
    fresh({stones:3,stats:{range:0,speed:0,power:3,guard:0}});assert(drillCostB99('power')===2,'stone cost wrong');soloDrillB100('power',0);assert(ranchB99.stones===1,'stones not spent');
  });
  test('B102 station upgrades cost Star Stones, add drill points and raise the cap across reloads',()=>{
    fresh({stones:10,starStones:3,stats:{range:0,speed:B99_DRILLS.speed.cap,power:0,guard:0}});
    assert(drillBlockB99('speed')==='capped','cap not reached');assert(upgradeStationB102('speed')&&ranchB99.starStones===2&&B99_DRILLS.speed.cap===B102_BASE_CAPS.speed+1,'upgrade wrong');
    assert(!drillBlockB99('speed'),'cap not raised');const r=soloDrillB100('speed',0);assert(r.gain===B100_BASE+B102_STATION_POINTS,'station points missing');
    const saved=loadRanchB99();assert(saved.stations.speed===1&&saved.stats.speed===B102_BASE_CAPS.speed+1,'raised level clamped on reload');
    ranchB99.starStones=1;assert(!upgradeStationB102('speed'),'second upgrade too cheap');
  });
  test('B102 the refinery station opens its sheet and loads hearts from it',()=>{
    fresh({hearts:130});openRanchB99();at('refinery');press();
    assert($('ranchSheetB100').textContent.includes('Heart Refinery')&&$('ranchSheetB100').textContent.includes('Refine all'),'refinery sheet missing');
    const i=ranchWorldB100.sheet.options.findIndex(o=>o.label.startsWith('Refine all'));focusSheetB100(i);press();
    assert(ranchB99.refinery.queue===2&&ranchB99.hearts===30,'refine all failed');draw();
  });
  test('B102 corrupt refinery saves fall back safely',()=>{
    localStorage.setItem(B99_RANCH_KEY,JSON.stringify({stones:-3,dust:'x',starStones:2.7,refinery:{level:40,queue:-1,trayStones:'q'},stations:{speed:9,power:-2}}));
    const r=loadRanchB99();assert(r.stones===0&&r.dust===0&&r.starStones===2&&r.refinery.level===10&&r.refinery.queue===0&&r.refinery.trayStones===0&&r.stations.speed===3&&r.stations.power===0,'bad economy accepted');
  });
  fresh();reset();
  return out;
}
