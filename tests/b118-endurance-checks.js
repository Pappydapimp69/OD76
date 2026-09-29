function runEnduranceChecksB118(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
 const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();reset()};
 const test=(name,fn)=>{try{keys.clear();fresh();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear()}};
 const gate=(stage=7)=>{S.run=false;S.stage=stage;S.stagePending=true;S.waveState='stage';S.b115Stage=stage;S.b115Away=0;S.b115TollStage=stage;S.b115Toll={away:0,fatigue:0,hunger:0,hygiene:0,why:{food:0,clean:0,heat:0,kills:0,hits:0,boss:false}};openRanchGateB99()};
 const clear=(stage=7)=>{S.run=true;S.stage=stage;S.stageEnding=true;S.stagePending=false;S.bossRewardPending=false;openStageUpgrade()};
 test('B118 old ranch saves begin at 100 maximum fatigue and best Pip level 1',()=>{
  assert(ranchB99.fatigueMax===100&&ranchB99.bestPipLevel===1,'defaults '+ranchB99.fatigueMax+'/'+ranchB99.bestPipLevel);
  localStorage.setItem(B99_RANCH_KEY,JSON.stringify({fatigue:70,bestPipLevel:6,stats:{}}));const r=loadRanchB99();
  assert(r.fatigue===70&&r.bestPipLevel===6&&r.fatigueMax===120,'saved endurance lost');
 });
 test('B118 only newly reached Pip levels bank +4 maximum fatigue for future runs',()=>{
  S.run=true;S.pipLevel=6;S.runHearts=0;bankRunB99(false);
  assert(ranchB99.bestPipLevel===6&&ranchB99.fatigueMax===120,'first best not banked');
  reset();S.run=true;S.pipLevel=4;S.runHearts=0;bankRunB99(false);assert(ranchB99.fatigueMax===120,'repeated level farmed endurance');
  reset();S.run=true;S.pipLevel=8;S.runHearts=0;bankRunB99(false);assert(ranchB99.fatigueMax===128,'new levels not banked once');
 });
 test('B118 expanded fatigue applies next run and preserves percentage debuffs',()=>{
  fresh({bestPipLevel:6,fatigueMax:120,fatigue:60});assert(S.b118ArenaFatigue===60&&fatigueMaxB118()===120,'run capacity');
  S.run=true;S.b118ArenaFatigue=71;assert(tiredMultB115()===1,'59 percent tired early');
  S.b118ArenaFatigue=72;assert(tiredMultB115()===.9,'60 percent tier missing');
  S.b118ArenaFatigue=96;assert(tiredMultB115()===.8&&needNotesB115().some(x=>x.includes('worn out')),'80 percent tier missing');
  S.b118ArenaFatigue=120;assert(exhaustedB115(),'expanded cap did not block');
 });
 test('B118 merchant comes first; buying skips upgrades while declining keeps them',()=>{
  S.heartCurrency=200;clear(7);assert(!$('arenaMerchantB118').classList.contains('stagehidden')&&$('emotionStep').classList.contains('stagehidden'),'stage 7 merchant not first');
  resolveMerchantB118(true);assert(S.b118Snacks===1&&S.heartCurrency===180&&!$('ranchGateStepB99').classList.contains('stagehidden'),'purchase did not skip to gate');
  clear(12);resolveMerchantB118(false);assert(!$('emotionStep').classList.contains('stagehidden')&&$('arenaMerchantB118').classList.contains('stagehidden'),'decline did not continue upgrades');
  clear(12);resolveMerchantB118(true);clear(17);resolveMerchantB118(true);
  assert(S.b118Snacks===3&&S.b118SnackBought===3&&S.heartCurrency===105,'prices or run stock wrong');
  clear(8);assert($('arenaMerchantB118').classList.contains('stagehidden')&&!$('emotionStep').classList.contains('stagehidden'),'merchant appeared at stage 8');
 });
 test('B118 zero free fatigue offers an arena snack with count and eating unlocks Next',()=>{
  S.b118Snacks=2;S.b118ArenaFatigue=100;ranchB99.fatigue=100;gate(8);renderTollGateB115();
  assert($('nextStageB99').disabled&&!$('eatSnackB118').classList.contains('stagehidden'),'snack option missing');
  assert($('eatSnackB118').textContent.includes('2 left'),'snack count missing');assert(eatSnackB118(),'snack refused');
  assert(S.b118Snacks===1&&arenaFatigueB118()===85&&!$('nextStageB99').disabled&&$('eatSnackB118').classList.contains('stagehidden'),'snack did not restore headroom');
 });
 test('B118 snacks are run-only and reset before the next arena test',()=>{
  S.b118Snacks=3;S.b118SnackBought=3;reset();assert(S.b118Snacks===0&&S.b118SnackBought===0,'snacks carried runs');
 });
 fresh();reset();return out;
}
