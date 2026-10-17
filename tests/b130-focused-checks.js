function runFocusedChecksB130(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},near=(a,b,m,eps=1e-6)=>assert(Math.abs(a-b)<=eps,`${m}: ${a} != ${b}`),test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();reset()};
 const roll=dropRollB125;
 test('B130 farm fatigue above 100 survives save and reload up to the arena max',()=>{
  fresh({bestPipLevel:11,fatigueMax:140,fatigue:120});ranchB99=loadRanchB99();
  assert(fatigueMaxB118()===140&&ranchB99.fatigue===120,'fatigue clamped on reload: '+ranchB99.fatigue);
  fresh({bestPipLevel:11,fatigueMax:140,fatigue:900});ranchB99=loadRanchB99();assert(ranchB99.fatigue===140,'over-max save not clamped to max');
 });
 test('B130 arena and farm carry the same fatigue number both ways',()=>{
  fresh({bestPipLevel:11,fatigueMax:140,fatigue:110});assert(arenaFatigueB118()===110,'arena did not start from farm fatigue');
  S.run=true;setArenaFatigueB118(130);assert(ranchB99.fatigue===130,'farm did not receive arena fatigue above 100');
  bankRunB99(false);assert(ranchB99.fatigue===130,'banking clamped fatigue: '+ranchB99.fatigue);
 });
 test('B130 farm meters fill fatigue/max and the bar grows 1% per 15 over 100',()=>{
  fresh({bestPipLevel:11,fatigueMax:140,fatigue:70});renderRanchHudB100();
  near(parseFloat($('ranchFatB100').style.width),50,'hud fill');near(fatigueGrowB130(),1.02,'grow at 140');
  ranchB99.fatigueMax=114;near(fatigueGrowB130(),1,'grow below 115');ranchB99.fatigueMax=115;near(fatigueGrowB130(),1.01,'grow at 115');
  fresh({fatigue:60});renderRanchHudB100();near(parseFloat($('ranchFatB100').style.width),60,'base hud fill');
 });
 test('B130 farm chores add past 100 when the max allows it',()=>{
  fresh({bestPipLevel:11,fatigueMax:140,fatigue:95});tireB106('till');assert(ranchB99.fatigue===95+B106_TOOL_FATIGUE.till,'tool fatigue capped at 100');
  fresh({fatigue:95});tireB106('till');assert(ranchB99.fatigue===100,'base max no longer caps at 100');
 });
 test('B130 chop drops: trees 50%, shrubs 70%',()=>{
  const tree=B106_OBSTACLES.find(o=>o.tree),shrub=B106_OBSTACLES.find(o=>!o.tree);
  try{
   fresh({fatigue:0,tools:{axe:true,sickle:true}});dropRollB125=()=>.6;
   assert(clearObstacleB106(tree.id)&&!itemCountB104('acorn'),'tree dropped above 50%');
   assert(clearObstacleB106(shrub.id)&&itemCountB104('dewberry')===1,'shrub missed below 70%');
   fresh({fatigue:0,tools:{axe:true,sickle:true}});dropRollB125=()=>.49;assert(clearObstacleB106(tree.id)&&itemCountB104('acorn')===1,'tree missed below 50%');
  }finally{dropRollB125=roll}
 });
 test('B130 arena snacks remove 30 fatigue and the gate meter says Fatigue',()=>{
  fresh({fatigue:80});S.run=true;S.stage=8;S.b118Snacks=1;S.stageEnding=true;openStageUpgrade();renderTollGateB115();
  const label=[...$('ranchGateBarsB115').querySelectorAll('span')].map(s=>s.textContent).find(t=>/^(Fatigue|Tired) /.test(t));
  assert(label&&label.startsWith('Fatigue '),'gate label: '+label);
  const f=arenaFatigueB118();assert(eatSnackB118()&&arenaFatigueB118()===f-30,'snack heal not 30');
 });
 return out;
}
