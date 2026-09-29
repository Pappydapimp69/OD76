function runFarmWeekChecksB119(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
 const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();reset();weekFadeB119.pending=null;weekFadeB119.last=null};
 const test=(name,fn)=>{try{keys.clear();fresh();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear()}};
 const garden=()=>{fresh({fatigue:0,areas:{garden:true,kitchen:false,orchard:false},tools:{hoe:true,can:true,axe:false,sickle:false}});addItemB104('seed_strawberry',2);tillB105(0);plantB105(0,'strawberry')};
 test('B119 watering is the player\'s: free and allowed when Pip is tired',()=>{
  garden();ranchB99.fatigue=B99_TIRED;const f=ranchB99.fatigue;
  assert(waterB105(0)&&plotB105(0).watered&&ranchB99.fatigue===f,'tired Pip blocked or tired by watering');
 });
 test('B119 growth: watered +1, first dry week +0.5, second dry week +0',()=>{
  garden();waterB105(0);restB99();assert(plotB105(0).stage===1&&plotB105(0).dry===0,'watered week');
  restB99();assert(plotB105(0).stage===1.5&&plotB105(0).dry===1,'first dry week not half');
  restB99();assert(plotB105(0).stage===1.5&&plotB105(0).dry===2,'second dry week grew');
  waterB105(0);restB99();assert(plotB105(0).stage===2.5&&plotB105(0).dry===0,'watering did not reset the dry count');
 });
 test('B119 three dry weeks in a row wither the crop and leave tilled soil',()=>{
  garden();restB99();restB99();assert(plotB105(0).crop==='strawberry','withered too early');
  restB99();const p=plotB105(0);assert(!p.crop&&p.stage===0&&p.dry===0&&p.tilled,'crop did not wither');
  const f=weekFadeB119.pending||weekFadeB119.last;assert(f?.report.withered.includes('strawberry')&&f.text.includes('withered'),'wither not reported');
 });
 test('B119 half-week growth and dry weeks survive a reload',()=>{
  garden();restB99();const r=loadRanchB99();assert(r.plots[0].stage===.5&&r.plots[0].dry===1,'lost '+r.plots[0].stage+'/'+r.plots[0].dry);
 });
 test('B119 every week-ending event shows the Week N fade; rest queues the twinkle',()=>{
  fresh({hearts:500});openRanchB99();ranchB99.fatigue=0;
  restB99();let f=weekFadeB119.last;assert(f&&f.kind==='rest'&&f.week===ranchB99.week&&$('weekFadeB119').classList.contains('on'),'rest fade');
  assert($('weekFadeB119').textContent.includes(`Week ${ranchB99.week}`),'week text');
  weekPassedB104('drill');assert(weekFadeB119.last.kind==='drill'&&weekFadeB119.last.text.includes('trained'),'drill fade');
 });
 test('B119 a battle-test week waits for the ranch, then fades',()=>{
  leaveRanchB100();ranchWorldB100.active=false;weekFadeB119.last=null;weekFadeB119.pending=null;S.run=true;S.pipLevel=1;S.runHearts=0;bankRunB99(false);
  assert(weekFadeB119.pending?.kind==='battle'&&!weekFadeB119.last,'battle fade not deferred');
  openRanchB99();assert(weekFadeB119.last?.kind==='battle'&&!weekFadeB119.pending,'battle fade not shown on entry');
 });
 test('B119 a together drill shows its week after the mini-game, not over it',()=>{
  fresh({stones:20,fatigue:0});openRanchB99();ranchB99.stones=20;
  assert(startGameB100('speed')&&ranchWorldB100.game,'game did not start');
  assert(weekFadeB119.pending?.kind==='drill'&&!weekFadeB119.last,'fade covered the mini-game');
  finishGameB100();assert(weekFadeB119.last?.kind==='drill'&&!weekFadeB119.pending,'fade not shown after the game');
 });
 test('B119 plot and garden sheets explain the dry rule',()=>{
  garden();openRanchB99();restB99();restB99();plotSheetB105(0);
  assert($('ranchSheetB100').textContent.includes('withers'),'plot sheet missing warning');closeSheetB100();
  gardenSheetB105();assert($('ranchSheetB100').textContent.includes('dry three weeks')&&$('ranchSheetB100').textContent.includes('will wither'),'garden sheet missing rule');closeSheetB100();
 });
 fresh();reset();return out;
}
