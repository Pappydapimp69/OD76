function runFocusedChecksB129(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},near=(a,b,m,eps=1e-6)=>assert(Math.abs(a-b)<=eps,`${m}: ${a} != ${b}`),test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();reset()};
 test('B129 Beam drains fixed HEAT energy instead of a fixed meter percent',()=>{
  fresh({fatigue:0});S.run=true;S.end=false;S.waveState='active';S.overType='beam';S.overLevels={beam:1,storm:3};S.overUnlocked.add('storm');S.heat=50;S.over=1;S.b38OverHeld=true;
  const cap=heatCapacityB38();assert(cap>100,'fixture did not raise HEAT cap');for(let i=0;i<25;i++)update(.04);
  near(S.heat,50-B129_BEAM_DRAIN_ENERGY/cap*100,'fixed-energy beam drain');
 });
 test('B129 Thunderstorm summon and seeking clouds use fixed HEAT energy',()=>{
  fresh({fatigue:0});S.run=true;S.end=false;S.waveState='active';S.overType='storm';S.overLevels={storm:4,beam:5};S.overUnlocked.add('storm');S.heat=80;S.b93StormCharge=chargeB122('summon',4);tickStormB93(B122_SUMMON_SECONDS+.01);
  near(S.heat,80-B129_STORM_SUMMON_ENERGY/heatCapacityB38()*100,'fixed-energy storm summon');
  S.b93StormCharge={b116a:true,level:4,max:3,prog:0,clouds:0,spent:0,auto:false,paused:false,full:false};gatherStormCloudB98(S.b93StormCharge);
  near(S.b93StormCharge.spent,B129_STORM_CLOUD_ENERGY/heatCapacityB38()*100,'fixed-energy storm cloud');
 });
 test('B129 late ranch progress reduces stage care tolls without removing them',()=>{
  fresh({bestPipLevel:1,stations:{range:0,speed:0,power:0,guard:0}});S.stage=10;S.run=true;S.b115Stage=10;S.b115Away=0;S.b116App={stage:10,heat:0,startHeat:0,kills:30,hits:2,boss:false,last:0,gain:0,hurt:0,refund:0};const base=stageAppetiteB116d();
  fresh({bestPipLevel:31,stations:{range:5,speed:5,power:5,guard:5}});S.stage=10;S.run=true;S.b115Stage=10;S.b115Away=0;S.b116App={stage:10,heat:0,startHeat:0,kills:30,hits:2,boss:false,last:0,gain:0,hurt:0,refund:0};const eased=stageAppetiteB116d();
  assert(eased.food<base.food&&eased.clean<base.clean&&eased.food>0&&eased.clean>0,'care relief did not ease tolls correctly');
 });
 test('B129 orchard kitchen restores ranch-buff recipes without changing the launch set',()=>{
  fresh({areas:{garden:true,kitchen:true,orchard:false}});kitchenSheetB105();let t=$('ranchSheetB100').textContent;assert(t.includes('Carrot Stew')&&!t.includes('Berry Tart')&&!t.includes('Pumpkin Pie'),'launch kitchen changed');
  fresh({areas:{garden:true,kitchen:true,orchard:true}});kitchenSheetB105();t=$('ranchSheetB100').textContent;assert(t.includes('Berry Tart')&&t.includes('Pumpkin Pie'),'ranch buff recipes missing after orchard');
 });
 test('B129 missing stage summaries recover before the ranch gate opens',()=>{
  fresh({fatigue:0});S.stageEnding=true;S.stagePending=false;S.end=false;S.waveState='break';S.waveBreak=0;openRanchGateB99();
  assert(S.stagePending&&$('stageUp')&&!$('stageUp').classList.contains('hidden'),'stage summary did not recover');
 });
 test('B129 bosses read the tracked most-used skill as a soft adaptation tag',()=>{
  fresh({fatigue:0});Object.assign(statsB117,{skills:{gravity:{n:12,sec:40},beam:{n:3,sec:20}}});S.stage=17;S.run=true;S.end=false;S.waveState='active';S.bossQueued=true;S.starsTotal=999;startBossBattle();
  const b=enemies.find(e=>e.type==='boss');assert(b&&b.b129Adapt==='gravity','boss did not adapt to tracked top skill');
  const before=enemyShots.length;fireBossVolley(b);assert(enemyShots.length>=before+4,'gravity adaptation did not add a soft pattern');
 });
 return out;
}
