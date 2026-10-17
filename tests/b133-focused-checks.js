function runFocusedChecksB133(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},near=(a,b,m,eps=1e-6)=>assert(Math.abs(a-b)<=eps,`${m}: ${a} != ${b}`),test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const run=asc=>{ascB133=Object.assign(blankAscB133(),asc||{});saveAscB133();ranchB99=Object.assign(ranchDefaultB99(),{fatigue:0});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();reset();S.run=true;S.end=false;S.waveState='active';S.stagePending=true;S.bossRewardPending=true};
 test('B133 a mastered level 5 skill Ascends for ★10 and the save survives a reload',()=>{
  run();const m=masteryB131('beam');m.lv=5;m.t=5;S.starPoints=12;assert(nextStepB131('beam').kind==='ascend','no ascend step');
  assert(completeOverdriveHoldAction('beam')&&S.starPoints===2&&nextStepB131('beam').kind==='done','ascend');
  const raw=JSON.parse(localStorage.getItem(B133_KEY));assert(raw.v===1&&raw.asc.beam===1&&raw.asc.gravity===0,'saved: '+JSON.stringify(raw));
  assert(loadAscB133().beam===1,'reload');
 });
 test('B133 the next run starts an Ascended skill unlocked, one level higher, with lower levels mastered',()=>{
  run({gravity:1});const g=masteryB131('gravity');assert(S.overUnlocked.has('gravity')&&g&&g.lv===2&&g.t===0&&g.u===0,'gravity start: '+JSON.stringify(g));
  assert(overLevel('gravity')===5&&igniteThresholdB131('gravity')===24,'full L1 kit and 24% ignition');
  near(heatRegenRateB115(),100/heatCapacityB38()/2.9,'inherited tier-3 regen');
  run();assert(!S.overUnlocked.has('gravity'),'gravity unlocked without an ascension');
 });
 test('B133 uses per level grow with the starting ascension count',()=>{
  run({beam:1});const m=masteryB131('beam');assert(levelUsesB133(m)===13,'asc1 L2 uses');
  assert([0,1,2,3,4].map(t=>tierUsesAtB133(m,t)).join()==='1,3,7,9,13','asc1 tier thresholds');m.lv=4;assert(levelUsesB133(m)===12,'asc1 L4 uses');
  run({beam:2});assert(levelUsesB133(masteryB131('beam'))===14,'asc2');run({beam:3});assert(levelUsesB133(masteryB131('beam'))===15,'asc3');
 });
 test('B133 the fifth Ascend run costs 50 stars and needs 30 uses',()=>{
  run({nova:4});const m=masteryB131('nova');assert(m.lv===5&&levelUsesB133(m)===30,'asc4 start');
  let stars=0;for(let t=0;t<5;t++){m.t=t;stars+=nextStepB131('nova').stars}m.t=5;stars+=nextStepB131('nova').stars;assert(stars===50,'asc4 run stars '+stars);
  S.starPoints=20;assert(completeOverdriveHoldAction('nova')&&ascB133.nova===5,'fifth ascend');
 });
 test('B133 five Ascensions start the skill Ascended with nothing to master',()=>{
  run({storm:5});const m=masteryB131('storm');assert(m.lv===5&&m.t===5&&nextStepB131('storm').kind==='done','storm asc5');
  S.starPoints=99;assert(!completeOverdriveHoldAction('storm')&&ascB133.storm===5,'went past 5');
  S.stageEnding=true;openStageUpgrade();stageInputLockB117i=0;S.bossRewardPending=true;openOverdriveStep();b132.sel='storm';renderOverdriveStep();
  assert(!$('b132Main')&&!$('b132Why')&&$('b132Detail').textContent.includes('Nothing left to master'),'asc5 panel');
  assert($('b132Strip').querySelector('[data-id="storm"]').textContent.includes('ASCENDED'),'asc5 tile');
 });
 test('B133 missing, corrupt or out-of-range saves load safely',()=>{
  localStorage.removeItem(B133_KEY);assert(Object.values(loadAscB133()).every(v=>v===0),'missing');
  localStorage.setItem(B133_KEY,'{oops');assert(loadAscB133().beam===0,'corrupt');
  localStorage.setItem(B133_KEY,JSON.stringify({v:1,asc:{beam:9,nova:-2,storm:'x',gravity:2.7}}));const a=loadAscB133();
  assert(a.beam===5&&a.nova===0&&a.storm===0&&a.gravity===2,'clamp: '+JSON.stringify(a));
  run();
 });
 return out;
}
