function runRanchChecksB99(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const test=(name,fn)=>{try{keys.clear();fresh();reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear()}};
  const clearStage=()=>{reset();S.run=true;S.stage=2;S.runHearts=40;S.heartCurrency=40;S.stageEnding=true;openStageUpgrade();continueSoundLabB41()};
  const clearStageStones=()=>{reset();S.run=true;S.stage=2;S.runStones=2;S.stageEnding=true;openStageUpgrade();continueSoundLabB41()};
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
    fresh({fatigue:80});openRanchB99();const w=ranchWorldB100;w.pip.x=w.px+10;w.pip.y=w.py;w.pip.state='idle';w.idle=1;press();assert(w.sheet&&$('ranchSheetB100').textContent.includes('Pet Pip'),'pip menu missing');press();
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
  test('B103 the ranch plays its own soft loop at 66 bpm and the arena loop elsewhere',()=>{
    const calls=[],fake=Object.create(PipAudioEngine.prototype);fake.ctx={currentTime:10};fake.music={};
    fake.voice=(f,t,d,v)=>calls.push({t,v});fake.fmBell=(f,t,d,v)=>calls.push({t,v});
    openRanchB99();fake.b103Next=NaN;for(let i=0;i<60;i++)fake.scheduleStep(10+i*.1);
    assert(calls.length>20&&calls.every(c=>c.v<=.03),'ranch loop missing or too loud');
    const n=fake.b103Eighth,span=fake.b103Next-10.06;assert(Math.abs(span-n*B103_EIGHTH)<1e-6&&Math.abs(B103_EIGHTH-60/66/2)<1e-9,'ranch tempo wrong');
    S.audioEnabled=false;const before=calls.length;fake.scheduleStep(20);assert(calls.length===before,'muted ranch still played');S.audioEnabled=true;
    reset();fake.scheduleStep(21);assert(!Number.isFinite(fake.b103Next),'ranch loop did not reset after leaving');
  });
  test('B104 each ranch week makes Pip hungrier and messier; drills dirty him more',()=>{
    fresh({stones:10,hunger:80,hygiene:80});soloDrillB100('power',0);assert(ranchB99.hunger===80-B104_WEEK_HUNGER&&ranchB99.hygiene===80-B104_WEEK_DIRT.drill,'drill week wrong');
    fresh({hunger:80,hygiene:80});restB99();assert(ranchB99.hunger===68&&ranchB99.hygiene===74&&ranchB99.week===2,'rest week wrong');
    fresh({hunger:80,hygiene:80});S.run=true;S.heartCurrency=10;finish(true);assert(ranchB99.week===2&&ranchB99.hunger===68&&ranchB99.hygiene===60,'battle week wrong');
  });
  test('B104 the stall sells food and soap for hearts; feeding and washing refill the meters',()=>{
    fresh({hearts:50,hunger:30,hygiene:10,fatigue:20});assert(buyItemB104('bun')&&ranchB99.hearts===20&&itemCountB104('bun')===1,'buy failed');
    assert(!buyItemB104('bun'),'bought without hearts');assert(feedB104('bun')&&ranchB99.hunger===70&&ranchB99.fatigue===15&&!itemCountB104('bun'),'feeding wrong');
    assert(!washB104(),'washed without soap');buyItemB104('soap');assert(washB104()&&ranchB99.hygiene===60,'wash wrong');
    assert(loadRanchB99().hunger===70&&loadRanchB99().hygiene===60,'needs not saved');
  });
  test('B104 low needs lower solo odds and add fatigue; starving and filthy Pips start battle tests weaker',()=>{
    fresh({fatigue:0});const ok=soloChanceB100();fresh({fatigue:0,hunger:30,hygiene:30});assert(Math.abs(soloChanceB100()-(ok-.25))<1e-9,'need penalty wrong');
    fresh({stones:5,hunger:30});soloDrillB100('guard',0);assert(ranchB99.fatigue===B99_DRILL_FATIGUE+10,'hungry fatigue missing');
    fresh({stats:{range:2,speed:2,power:2,guard:2},hunger:10,hygiene:10});startBattleTestB99();
    assert(S.pipSpeedLv===1&&S.pipPowerLv===1&&S.pipRangeLv===1&&S.pipGuardLv===1&&S.b104Notes.length===2,'battle penalty wrong');
  });
  test('B104 pressing A at Pip opens his care menu and feeding works from it',()=>{
    fresh({hunger:20});addItemB104('pellets',2);openRanchB99();const w=ranchWorldB100;w.pip.x=w.px+10;w.pip.y=w.py;w.idle=1;press();
    const i=w.sheet.options.findIndex(o=>o.label.startsWith('Feed'));assert(i>0,'feed option missing');focusSheetB100(i);press();
    assert(ranchB99.hunger===45&&itemCountB104('pellets')===1,'feed from menu failed');
  });
  test('B105 areas unlock with Heart Stones or Star Stones',()=>{
    fresh({stones:4,starStones:0});assert(unlockAreaB105('garden')&&ranchB99.stones===2,'garden unlock');assert(!unlockAreaB105('kitchen'),'kitchen too cheap');
    assert(!unlockAreaB105('orchard'),'orchard without star');ranchB99.starStones=1;assert(unlockAreaB105('orchard')&&!ranchB99.starStones,'orchard unlock');
    assert(!unlockAreaB105('garden'),'unlocked twice');assert(loadRanchB99().areas.garden&&loadRanchB99().areas.orchard,'areas not saved');
  });
  test('B105 garden: till, plant, water each week, grow and harvest',()=>{
    fresh({hearts:500,areas:{garden:true,kitchen:false,orchard:false}});
    assert(!tillB105(0),'tilled without hoe');buyToolB105('hoe');buyToolB105('can');buyItemB104('seed_carrot');
    assert(tillB105(0)&&plantB105(0,'carrot')&&!itemCountB104('seed_carrot'),'plant failed');
    restB99();assert(plotB105(0).stage===0,'grew unwatered');
    assert(waterB105(0)&&!waterB105(0),'water twice');restB99();assert(plotB105(0).stage===1&&!plotB105(0).watered,'watered crop did not grow');
    waterAllB105();restB99();assert(plotRipeB105(plotB105(0)),'carrot not ripe after 2 watered weeks');assert(!waterB105(0),'watered ripe crop');
    const h=harvestB105(0);assert(h.n===2&&itemCountB104('carrot')===2&&!plotB105(0).crop&&plotB105(0).tilled,'harvest wrong');
    assert(sellItemB104('carrot')&&ranchB99.hearts===500-80-60-10+8,'sell wrong');
  });
  test('B105 the orchard fruits every two ranch weeks up to a cap',()=>{
    fresh({areas:{garden:false,kitchen:false,orchard:true}});restB99();assert(!ranchB99.orchard.apples,'fruited early');restB99();assert(ranchB99.orchard.apples===B105_ORCHARD_APPLES,'no apples');
    for(let i=0;i<6;i++)restB99();assert(ranchB99.orchard.apples===B105_ORCHARD_MAX,'apple cap');assert(pickApplesB105()===B105_ORCHARD_MAX&&itemCountB104('apple')===B105_ORCHARD_MAX,'pick wrong');
  });
  test('B105 kitchen cooks meals from ingredients; battle meals buff the next test once',()=>{
    fresh({areas:{garden:true,kitchen:false,orchard:true}});addItemB104('carrot',2);addItemB104('pumpkin',1);assert(!cookB105('stew'),'cooked without kitchen');
    ranchB99.areas.kitchen=true;assert(cookB105('stew')&&!itemCountB104('carrot')&&itemCountB104('meal_stew')===1,'cook failed');assert(!cookB105('stew'),'cooked twice');
    ranchB99.hunger=10;feedB104('meal_stew');assert(ranchB99.hunger===70&&ranchB99.buffs.battle==='stew','meal effect wrong');
    startBattleTestB99();assert(S.maxHealth===120&&S.health===120&&!ranchB99.buffs.battle,'stew buff wrong');
    startBattleTestB99();assert(S.maxHealth===100,'buff applied twice');
  });
  test('B105 ranch meals boost the next three drills',()=>{
    fresh({stones:20,fatigue:0});ranchB99.buffs.ranch={id:'tart',drills:3};let r=soloDrillB100('power',0);assert(r.gain===B100_BASE+3&&ranchB99.buffs.ranch.drills===2,'tart wrong');
    fresh({stones:20,fatigue:0});ranchB99.buffs.ranch={id:'pie',drills:1};soloDrillB100('power',0);assert(ranchB99.fatigue===B99_DRILL_FATIGUE-15&&!ranchB99.buffs.ranch,'pie wrong');
  });
  test('B105 locked areas explain their cost and plots are only reachable once the garden opens',()=>{
    fresh({stones:0});openRanchB99();const g=stationB100('garden');ranchWorldB100.px=g.x;ranchWorldB100.py=g.y+10;press();
    assert($('ranchSheetB100').textContent.includes('Unlock for ◆ 2'),'lock sheet');press();
    const q=B105_PLOT_POS[0];ranchWorldB100.px=q.x;ranchWorldB100.py=q.y;assert(!(nearestInteractB100()?.st?.plot===0),'locked plot reachable');
    ranchB99.areas.garden=true;assert(nearestInteractB100()?.st?.plot===0,'open plot unreachable');draw();
  });
  test('B105 corrupt farm saves fall back safely',()=>{
    localStorage.setItem(B99_RANCH_KEY,JSON.stringify({hunger:500,items:{carrot:-4,'bad key!':3,pumpkin:2.9},plots:[{crop:'tomato',stage:9},{crop:'carrot',stage:99,watered:true}],orchard:{apples:99},buffs:{battle:'cake',ranch:{id:'pie',drills:9}}}));
    const r=loadRanchB99();assert(r.hunger===100&&!r.items.carrot&&r.items.pumpkin===2&&!r.items['bad key!'],'bad items');
    assert(!r.plots[0].crop&&r.plots[1].crop==='carrot'&&r.plots[1].stage===2&&r.plots[1].tilled&&r.orchard.apples===B105_ORCHARD_MAX,'bad plots');
    assert(r.buffs.battle===null&&r.buffs.ranch.drills===3,'bad buffs');
  });
  test('B106 no drill site can be walked into from any direction while fully overgrown',()=>{
    openRanchB99();const w=ranchWorldB100;
    for(const site of ['range','speed','power','guard']){const st=stationB100(site),R=Math.max(...B106_OBSTACLES.filter(q=>q.site===site).map(q=>hyp(q.x-st.x,q.y-st.y)));
      for(let k=0;k<24;k++){const a=k/24*Math.PI*2;w.px=st.x+Math.cos(a)*(R+60);w.py=st.y+Math.sin(a)*(R+60);
        for(let i=0;i<60;i++){const dx=st.x-w.px,dy=st.y-w.py;keys.clear();if(dx<-5)keys.add('a');if(dx>5)keys.add('d');if(dy<-5)keys.add('w');if(dy>5)keys.add('s');updateRanchB100(.05)}
        keys.clear();assert(hyp(w.px-st.x,w.py-st.y)>st.r,`reached ${site} from angle ${k}`)}}
  });
  test('B106 drill sites start ringed by obstacles the player cannot walk through',()=>{
    openRanchB99();const st=stationB100('power'),o=B106_OBSTACLES.find(q=>q.site==='power'),w=ranchWorldB100;
    assert(B106_OBSTACLES.filter(q=>q.site==='power').length===8+B106_OUTER_COUNT&&!siteOpenB106('power'),'site not overgrown');
    for(let k=0;k<24;k++){const a=k/24*Math.PI*2;w.px=st.x+Math.cos(a)*(B106_OUTER_RING+60);w.py=st.y+Math.sin(a)*(B106_OUTER_RING+60);
      for(let i=0;i<60;i++){const dx=st.x-w.px,dy=st.y-w.py,d=hyp(dx,dy);keys.clear();if(dx<-5)keys.add('a');if(dx>5)keys.add('d');if(dy<-5)keys.add('w');if(dy>5)keys.add('s');updateRanchB100(.05)}
      keys.clear();assert(hyp(w.px-st.x,w.py-st.y)>B106_OUTER_RING-45,`walked through the outer ring from angle ${k}`)}
    const outer=B106_OBSTACLES.filter(q=>q.site==='power'&&hyp(q.x-st.x,q.y-st.y)>B106_OBSTACLE_RING+20).sort((a,b)=>hyp(a.x-st.x,a.y-st.y-B106_OUTER_RING)-hyp(b.x-st.x,b.y-st.y-B106_OUTER_RING))[0];ranchB99.cleared[outer.id]=true;
    const below=B106_OBSTACLES.filter(q=>q.site==='power').sort((a,b)=>hyp(a.x-st.x,a.y-st.y-B106_OBSTACLE_RING)-hyp(b.x-st.x,b.y-st.y-B106_OBSTACLE_RING))[0];ranchB99.cleared[below.id]=true;
    w.px=outer.x;w.py=st.y+B106_OUTER_RING+50;for(let i=0;i<40;i++){keys.clear();const tx=hyp(w.px-st.x,w.py-st.y)>B106_OBSTACLE_RING+30?outer.x:below.x;if(w.px<tx-4)keys.add('d');if(w.px>tx+4)keys.add('a');if(w.py>st.y+10)keys.add('w');updateRanchB100(.05)}keys.clear();
    assert(hyp(w.px-st.x,w.py-st.y)<60,'cleared gap still blocked');draw();
  });
  test('B106 only Pip clears obstacles with the right tool, and it tires him',()=>{
    fresh({hearts:200,fatigue:0});const tree=B106_OBSTACLES.find(o=>o.tree),shrub=B106_OBSTACLES.find(o=>!o.tree);
    assert(!clearObstacleB106(tree.id),'chopped without an axe');
    openRanchB99();ranchWorldB100.px=shrub.x;ranchWorldB100.py=shrub.y+shrub.r+16;press();
    assert($('ranchSheetB100').textContent.includes('needs a Sickle'),'tool hint missing');press();
    assert(buyToolB105('axe')&&buyToolB105('sickle')&&ranchB99.hearts===125,'tool prices wrong');
    assert(clearObstacleB106(tree.id)&&ranchB99.fatigue===15&&clearObstacleB106(shrub.id)&&ranchB99.fatigue===23,'clear fatigue wrong');
    assert(!clearObstacleB106(tree.id),'cleared twice');ranchB99.fatigue=B99_TIRED;assert(!clearObstacleB106(B106_OBSTACLES.find(o=>o.tree&&o!==tree).id),'tired Pip chopped');
    assert(loadRanchB99().cleared[tree.id]&&siteOpenB106(tree.site),'clearing not saved');
  });
  test('B106 tilling and watering tire Pip and stop when he is tired',()=>{
    fresh({fatigue:0,areas:{garden:true,kitchen:false,orchard:false},tools:{hoe:true,can:true,axe:false,sickle:false}});addItemB104('seed_carrot',2);
    assert(tillB105(0)&&ranchB99.fatigue===8,'till fatigue');plantB105(0,'carrot');assert(waterB105(0)&&ranchB99.fatigue===12,'water fatigue');
    ranchB99.fatigue=B99_TIRED;assert(!tillB105(1),'tired Pip tilled');
  });
  test('B106 the stall sells the axe and sickle before any area opens',()=>{
    fresh({hearts:100});openRanchB99();stallSheetB104();const labels=ranchWorldB100.sheet.options.map(o=>o.label).join('|');
    assert(labels.includes('Axe')&&labels.includes('Sickle')&&!labels.includes('Hoe'),'early tools wrong');closeSheetB100();
  });
  test('B106 Heart Stones fall in the arena, bosses drop one, and they bank like hearts',()=>{
    fresh({stones:0});reset();S.run=true;S.waveState='active';spawnHeartStoneB106();assert(heartStoneDropsB106.length===1,'no stone drop');
    const n=heartStoneDropsB106[0];n.fall=0;P.x=n.x;P.y=n.y;updateB26Drops(.016);assert(S.runStones===1&&!heartStoneDropsB106.length,'stone not collected');
    dropBossExplorationRewardsB30(0,0);assert(heartStoneDropsB106.some(q=>q.bossDrop),'boss stone missing');
    S.runStones=3;S.heartCurrency=0;finish(true);assert(ranchB99.stones===1,'death did not bank half the stones');
    fresh({stones:0});clearStageStones();$('returnRanchB99').click();assert(ranchB99.stones===2,'return did not bank every stone');
    reset();assert(!heartStoneDropsB106.length&&S.runStones===0,'stones leaked into the next run');
  });
  test('B106 corrupt overgrowth saves keep only real obstacles',()=>{
    localStorage.setItem(B99_RANCH_KEY,JSON.stringify({cleared:{power0:true,power1:'yes',bogus:true},tools:{axe:1}}));
    const r=loadRanchB99();assert(r.cleared.power0&&!r.cleared.power1&&!r.cleared.bogus&&r.tools.axe===true,'bad overgrowth save');
  });
  test('B107 the stage-end gate shows the refinery timer while it works',()=>{
    fresh({hearts:0});clearStage();assert($('ranchGateRefineB107').style.display==='none','idle refinery shown');$('nextStageB99').click();
    fresh({hearts:150});loadHeartsB102(3);clearStage();const line=$('ranchGateRefineB107');
    assert(line.style.display!=='none'&&/next ◆ in 1[45]:\d\d · 3 batches, all done in 4[45]:\d\d/.test(line.textContent),'timer missing: '+line.textContent);
    ranchB99.refinery.startedAt-=901e3;renderGateRefineryB107();assert(line.textContent.includes('Tray ready: ◆ 1')&&line.textContent.includes('2 batches'),'tray/progress not live');
    $('nextStageB99').click();
  });
  test('B108 ranks: E by default, gate offers unlocked ranks, rank offsets difficulty from stage 1',()=>{
    fresh();reset();assert(S.b108Rank===0&&difficultyStageB63()===1,'default rank');
    fresh({rankUnlocked:2});openRanchB99();at('gate');press();const labels=ranchWorldB100.sheet.options.map(o=>o.label).join('|');
    assert(labels.includes('Switch to Rank C')&&labels.includes('Switch to Rank D')&&!labels.includes('Rank B'),'gate rank list wrong');
    const i=ranchWorldB100.sheet.options.findIndex(o=>o.label.startsWith('Switch to Rank C'));focusSheetB100(i);press();
    assert(ranchB99.rank===2&&ranchWorldB100.sheet.options[0].label.includes('Rank C'),'switch failed');focusSheetB100(0);press();
    assert(S.run&&S.b108Rank===2&&S.stage===1&&difficultyStageB63()===5,'rank C stage 1 not tier 5');
  });
  test('B108 clearing stage 5 at the highest rank unlocks the next, once',()=>{
    fresh();reset();S.run=true;S.stage=4;S.stageEnding=true;openStageUpgrade();assert(ranchB99.rankUnlocked===0,'unlocked early');
    reset();S.run=true;S.stage=5;S.stageEnding=true;openStageUpgrade();assert(ranchB99.rankUnlocked===1,'no unlock at stage 5');
    S.stage=6;openStageUpgrade();assert(ranchB99.rankUnlocked===1,'unlocked twice in one run');
    fresh({rankUnlocked:3,rank:1});reset();S.run=true;S.stage=5;openStageUpgrade();assert(ranchB99.rankUnlocked===3,'lower rank unlocked the next');
  });
  test('B108 higher ranks multiply banked hearts and stones',()=>{
    fresh({rankUnlocked:5,rank:5});reset();S.run=true;S.stage=2;S.heartCurrency=40;S.runStones=2;S.stageEnding=true;openStageUpgrade();continueSoundLabB41();
    assert($('ranchGateTextB99').textContent.includes('Rank S pays ×2'),'gate reward note');$('returnRanchB99').click();
    assert(ranchB99.hearts===80&&ranchB99.stones===4&&ranchB99.report.includes('Rank S bonus'),'rank S did not double rewards');
    fresh({rankUnlocked:1,rank:1});reset();S.run=true;S.heartCurrency=21;finish(true);assert(ranchB99.hearts===12,'rank D death bank wrong: '+ranchB99.hearts+' '+ranchB99.report);
  });
  test('B108 corrupt rank saves clamp to what is unlocked',()=>{
    localStorage.setItem(B99_RANCH_KEY,JSON.stringify({rank:9,rankUnlocked:-3}));let r=loadRanchB99();assert(r.rank===0&&r.rankUnlocked===0,'bad rank');
    localStorage.setItem(B99_RANCH_KEY,JSON.stringify({rank:4,rankUnlocked:2}));r=loadRanchB99();assert(r.rank===2&&r.rankUnlocked===2,'rank above unlocked');
  });
  const standBy=o=>{const c=stationB100(o.site),d=hyp(o.x-c.x,o.y-c.y);ranchWorldB100.px=o.x+(o.x-c.x)/d*(o.r+18);ranchWorldB100.py=o.y+(o.y-c.y)/d*(o.r+18)};
  const pressX=()=>{updateRanchB100(.016);ranchWorldB100.b109XTap=true;updateRanchB100(.016)};
  const runFor=sec=>{for(let i=0;i<Math.ceil(sec/.05);i++)updateRanchB100(.05)};
  test('B109 without the tool only A shows; with it X starts a 3-second chop that animates Pip and the tree',()=>{
    fresh({hearts:200,fatigue:0});openRanchB99();const tree=B106_OBSTACLES.find(o=>o.tree);standBy(tree);
    assert(!pipActionForB109(nearestInteractB100())&&nearestInteractB100().label==='Clear','X offered without an axe');
    pressX();assert(!ranchWorldB100.b109Action&&obstacleStandingB106(tree),'X chopped without an axe');
    ranchB99.tools.axe=true;updateRanchB100(.016);assert(nearestInteractB100().label==='Info'&&$('ranchPipBtnB109').classList.contains('on')&&$('ranchPipBtnB109').textContent==='Chop','X prompt missing');
    pressX();const a=ranchWorldB100.b109Action;assert(a&&a.kind==='chop'&&a.dur===3,'chop did not start');
    runFor(B109_APPROACH_MAX+.1);assert(a.phase==='work'&&obstacleStandingB106(tree)&&ranchB99.fatigue===0,'finished before working');
    const leavesBefore=ranchWorldB100.b109Leaves.length;runFor(1);assert(ranchWorldB100.b109Leaves.length>leavesBefore,'no chips flying');
    draw();assert(!nearestInteractB100(),'other interactions open mid-chop');
    runFor(2.1);assert(!ranchWorldB100.b109Action&&!obstacleStandingB106(tree)&&ranchB99.fatigue===B106_TOOL_FATIGUE.chop,'chop did not finish at 3s');
    assert(ranchWorldB100.b109Fx.some(f=>f.kind==='fall'),'tree did not topple');draw();
  });
  test('B109 A still opens the info sheet near a job, and its option plays the animation',()=>{
    fresh({fatigue:0,tools:{axe:false,sickle:true,hoe:false,can:false}});openRanchB99();const shrub=B106_OBSTACLES.find(o=>!o.tree);standBy(shrub);press();
    assert(ranchWorldB100.sheet&&$('ranchSheetB100').textContent.includes('Shrub'),'A did not open info');
    const i=ranchWorldB100.sheet.options.findIndex(o=>o.label.startsWith('Let Pip'));focusSheetB100(i);press();
    assert(ranchWorldB100.b109Action?.kind==='cut'&&obstacleStandingB106(shrub),'sheet option skipped the animation');runFor(B109_APPROACH_MAX+2.2);assert(!obstacleStandingB106(shrub),'cut never finished');
  });
  test('B109 X tills, waters and harvests garden plots; tired Pips only get A',()=>{
    fresh({fatigue:0,areas:{garden:true,kitchen:false,orchard:false},tools:{hoe:true,can:true,axe:false,sickle:false}});openRanchB99();
    const q=B105_PLOT_POS[0];ranchWorldB100.px=q.x;ranchWorldB100.py=q.y;updateRanchB100(.016);
    assert(pipActionForB109(nearestInteractB100())?.kind==='till','till not offered');pressX();runFor(B109_APPROACH_MAX+2.1);assert(plotB105(0).tilled,'till failed');
    addItemB104('seed_carrot');plantB105(0,'carrot');updateRanchB100(.016);assert(pipActionForB109(nearestInteractB100())?.kind==='water','water not offered');
    ranchB99.fatigue=B99_TIRED;assert(!pipActionForB109(nearestInteractB100()),'tired Pip offered water');ranchB99.fatigue=0;
    pressX();runFor(B109_APPROACH_MAX+1.3);assert(plotB105(0).watered,'water failed');
    plotB105(0).stage=2;updateRanchB100(.016);assert(pipActionForB109(nearestInteractB100())?.kind==='harvest','harvest not offered');pressX();runFor(B109_APPROACH_MAX+1.1);assert(itemCountB104('carrot')===2,'harvest failed');
  });
  test('B109 the keyboard X key and leaving mid-job both behave',()=>{
    fresh({fatigue:0,tools:{axe:true,sickle:true,hoe:false,can:false}});openRanchB99();const tree=B106_OBSTACLES.find(o=>o.tree);standBy(tree);updateRanchB100(.016);
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'x'}));updateRanchB100(.016);assert(ranchWorldB100.b109Action,'X key ignored');
    reset();assert(!ranchWorldB100.b109Action&&!obstacleStandingB106(tree),'leaving lost the job');
  });
  test('B110 the controller Select button opens and closes the bag',()=>{
    const orig=navigator.getGamepads,pad={connected:true,index:0,axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
    Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pad]});
    try{
      fresh();addItemB104('pellets',2);openRanchB99();updateRanchB100(.016);assert($('ranchBagB104').textContent==='🎒 Bag · Select','select hint missing');
      pad.buttons[8].pressed=true;updateRanchB100(.016);assert(ranchWorldB100.sheet?.bag&&$('ranchSheetB100').textContent.includes('Pip Pellets ×2'),'select did not open the bag');
      updateRanchB100(.016);assert(ranchWorldB100.sheet?.bag,'held select toggled again');
      pad.buttons[8].pressed=false;updateRanchB100(.016);pad.buttons[8].pressed=true;updateRanchB100(.016);assert(!ranchWorldB100.sheet,'select did not close the bag');
      pad.buttons[8].pressed=false;updateRanchB100(.016);stallSheetB104();pad.buttons[8].pressed=true;updateRanchB100(.016);assert(ranchWorldB100.sheet&&!ranchWorldB100.sheet.bag,'select replaced another menu');
    }finally{if(orig)Object.defineProperty(navigator,'getGamepads',{configurable:true,value:orig});else delete navigator.getGamepads;closeSheetB100()}
  });
  test('B111 the splash Start opens the ranch and runs only start from the gate',()=>{
    fresh();reset();assert(!$('openRanchB99')&&$('begin').textContent.includes('A / CROSS'),'splash ranch button still there');
    $('begin').click();assert(ranchWorldB100.active&&!S.run&&$('start').classList.contains('hidden'),'Start did not open the ranch');
    at('gate');press();press();assert(S.run&&!ranchWorldB100.active&&S.wave===1,'gate did not start the run');
  });
  fresh();reset();
  return out;
}
