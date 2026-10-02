// B122 Thunderstorm follow cloud, Beam/Nova balance, ranch HUD and refinery sheet.
function runChecksB122(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const hitBaseB122=hitEnemy;let strikes=[];
  const test=(name,fn)=>{try{keys.clear();fresh();reset();strikes=[];hitEnemy=function(e,power=1,source='player'){if(source==='overdrive')strikes.push({e,power});return hitBaseB122(e,power,source)};fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{hitEnemy=hitBaseB122;keys.clear();if(S?.b93StormCharge)cancelStormChargeB93(false);if(S)S.b122Cloud=null}};
  const near=(a,b,m,tol=1e-6)=>assert(Math.abs(a-b)<tol,`${m}: ${a} vs ${b}`);
  const foe=(x,y=0)=>{const e={type:'chaser',x,y,r:12,hp:500,maxHp:500,dead:false,age:1,flash:0,speed:0,markTime:0};enemies.push(e);return e};
  const arena=(lv,heat=100)=>{reset();strikes=[];S.audioEnabled=false;S.run=true;S.end=false;S.b39Paused=false;S.stagePending=false;S.waveState='active';S.bossActive=false;S.stageWaveCount=1;
    S.spawn=999;S.waveGoal=999;S.attackCd=999;S.loveClock=999;S.praiseCd=999;S.over=0;S.overType='storm';S.overUnlocked.add('storm');S.overLevels={storm:lv};S.pipBossPowers.constellation=0;S.weaponPower=1;
    S.heat=heat;S.b93StormCooldown=0;S.b93StormClouds=[];S.b122Cloud=null;enemies=[];shots=[];enemyShots=[];heartBits=[];P.x=0;P.y=0;CAM.x=0;CAM.y=0;for(const id of ['start','end','stageUp','pipPauseB39'])$(id)?.classList.add('hidden')};
  const step=(s,fps=60)=>{for(let t=0;t<s-1e-8;t+=1/fps)update(Math.min(1/fps,s-t))};
  const press=()=>assert(triggerOverdrive()&&S.b93StormCharge,'storm press rejected');
  const release=()=>stopOverdriveB38(false);
  const tap=()=>{press();step(.05);release()};
  const summon=(lv,heat=100,zaps=true)=>{arena(lv,heat);tap();step(2.3);assert(S.b122Cloud&&!S.b93StormCharge,'follow cloud did not form');if(!zaps)S.b122Cloud.zap=1e9;strikes=[]};
  const dmg=lv=>B122_STORM_DAMAGE[lv-1];
  fresh();reset();

  test('B122 a press forms the follow cloud after 2.2s for 25% HEAT; letting go early still finishes it',()=>{
    for(const fps of [60,30]){
      arena(2);press();step(.05,fps);release();const c=S.b93StormCharge;assert(c&&c.auto&&c.mode==='summon'&&!S.b38OverHeld,'early release dropped the forming cloud');
      assert(heatSkillBusyB115b(),'forming cloud not busy');assert(!triggerOverdrive(),'a second press started during the forming');
      step(2.05,fps);assert(!S.b122Cloud&&S.heat===100,`cloud early at ${fps}fps`);step(.2,fps);
      assert(S.b122Cloud&&!S.b93StormCharge&&S.b122Cloud.level===2,`cloud late at ${fps}fps`);near(S.heat,75,'summon cost');near(S.b122Cloud.time,12,'cloud time',.3);
      assert(/TAP BOLT/.test($('overdrive').innerHTML)&&!$('overdrive').disabled,'button does not offer bolts: '+$('overdrive').innerHTML);
    }
    arena(1,24);assert(!triggerOverdrive()&&!S.b93StormCharge,'summon started below the ignition line');
    arena(1,100);press();step(2.5);assert(S.b122Cloud&&S.b93StormCharge?.mode==='seek'&&S.b93StormCharge.clouds===0,'holding past the summon did not move on to seeking clouds');
    near(S.heat,75,'held summon cost');release();assert(!S.b93StormCharge,'release after summon kept a charge');near(S.heat,75,'empty seek release spent HEAT');
  });

  test('B122 the follow cloud zaps the nearest enemy in range on its level clock, half a cloud strike, chaining from Lv3',()=>{
    summon(1);const e=foe(90);step(.02);assert(strikes.length===1&&strikes[0].e===e,'no zap on an enemy in range');near(strikes[0].power,dmg(1)*.5,'zap damage');
    step(.7);assert(strikes.length===1,'zapped again too soon');step(.15);assert(strikes.length===2,'second zap late');
    summon(1);foe(B122_ZAP_RANGE[0]+20);step(2);assert(!strikes.length,'zapped beyond range');
    summon(4);foe(B122_ZAP_RANGE[0]+20);step(.02);assert(strikes.length===1,'Lv4 range not wider than Lv1');
    summon(3);foe(80);foe(140);step(.02);assert(strikes.length===2&&strikes[0].e!==strikes[1].e,'Lv3 zap did not chain');near(strikes[1].power,dmg(3)*.5*B116A_CHAIN_DAMAGE,'chain damage');
    summon(2);S.weaponPower=2;foe(80);step(.02);near(strikes[0].power,dmg(2),'zap ignores weapon power');
  });

  test('B122 a tap fires a bolt from the cloud for 1s of cloud time and no HEAT, 0.25s apart; no target costs nothing',()=>{
    summon(1,100,false);const e=foe(300),t0=S.b122Cloud.time;tap();assert(strikes.length===1&&strikes[0].e===e,'bolt did not fire');near(strikes[0].power,dmg(1)*.6,'bolt damage');
    near(t0-S.b122Cloud.time,B122_BOLT_SECONDS+.05,'bolt did not cost 1s',.05);near(S.heat,75,'bolt spent HEAT');assert(!S.b93StormCharge&&!S.b38OverHeld,'bolt left a charge');
    tap();assert(strikes.length===1,'bolt ignored its cooldown');step(.3);tap();assert(strikes.length===2,'second bolt after cooldown missing');
    summon(1,100,false);const t1=S.b122Cloud.time;tap();assert(!strikes.length,'bolt with no target struck');near(t1-S.b122Cloud.time,.05,'no-target bolt cost cloud time',.05);
    summon(1,30,false);S.heat=10;foe(300);tap();assert(strikes.length===1,'bolt refused below the ignition line');
  });

  test('B122 holding with the cloud up charges seeking clouds (1.1s then 0.9s, 8% each, max by level) that travel and strike; letting go before the first forms costs nothing',()=>{
    summon(4,100,false);foe(0,-300);press();step(.1);assert(S.b93StormCharge?.mode==='pending'&&S.heat===75,'press spent HEAT inside the tap window');
    step(1.1);assert(S.b93StormCharge?.mode==='seek'&&S.b93StormCharge.clouds===0,'first seeking cloud early');
    step(.2);assert(S.b93StormCharge.clouds===1,'first seeking cloud late');near(S.heat,67,'first cloud cost');
    step(.75);assert(S.b93StormCharge.clouds===1,'second early');step(.2);assert(S.b93StormCharge.clouds===2,'second late');
    step(.65);assert(S.b93StormCharge.clouds===2,'third early');step(.2);assert(S.b93StormCharge.clouds===3&&S.b93StormCharge.full,'Lv4 did not fill at 3');near(S.heat,51,'three clouds cost');
    step(1);assert(S.b93StormCharge.clouds===3,'overfilled');release();
    assert(!S.b93StormCharge&&S.b93StormClouds.length===3&&S.b122Cloud,'release did not launch three clouds or dropped the follow cloud');
    step(8);assert(strikes.length>=3&&strikes.every(s=>s.e===enemies[0]),'seeking clouds did not strike');near(strikes[0].power,dmg(4),'seeking cloud damage');
    summon(5,100,false);press();step(1.4);assert(S.b93StormCharge.clouds===1,'Lv5 first seeking cloud not 25% faster');cancelStormChargeB93(false);
    summon(2,100,false);press();step(.6);release();assert(!S.b93StormCharge&&!S.b93StormClouds.length,'early release launched something');near(S.heat,75,'early release spent HEAT');
    summon(1,30,false);press();step(.5);assert(S.b93StormCharge?.mode==='dud','hold below the ignition line charged');release();near(S.heat,5,'dud spent HEAT');
    summon(1,100,false);foe(300);tap();step(.3);assert(S.b93StormClouds.length===0,'a bolt sent a seeking cloud');
  });

  test('B122 the follow cloud fades after 12s or 12 bolts; the next press forms a new one; stage end clears it',()=>{
    summon(1,100,false);step(11.5);assert(S.b122Cloud,'cloud faded early');step(.4);assert(!S.b122Cloud,'cloud outlived 12s');
    press();assert(S.b93StormCharge?.mode==='summon','press after fading did not start a new cloud');cancelStormChargeB93(true);
    summon(1,100,false);foe(300);let bolts=0;while(S.b122Cloud&&bolts<20){tap();bolts++;step(.26)}
    // the last tap can land as the cloud fades mid-press, so it may fire nothing
    assert(!S.b122Cloud&&strikes.length>=8&&strikes.length<12&&bolts-strikes.length<=1,`bolts did not spend the cloud: ${bolts} bolts, ${strikes.length} strikes`);
    summon(1,100,false);S.waveState='break';S.waveBreak=99;step(3);assert(S.b122Cloud&&S.b122Cloud.time>11,'wave break ran the cloud down');
    S.waveState='stage';step(.1);assert(!S.b122Cloud,'stage end kept the cloud');
    summon(1,100,false);finish(true);step(.1);assert(!S.b122Cloud,'run end kept the cloud');
  });

  test('B122 Beam drains 26% of the meter per second at any size, hits 1.5+0.2×Lv, and Nova scales with weapon power',()=>{
    arena(1);near(B38_DRAIN_ENERGY_PER_SEC.beam/heatCapacityB38()*100,26,'drain at 100');
    S.overLevels={storm:3};assert(heatCapacityB38()===120,'fixture meter');near(B38_DRAIN_ENERGY_PER_SEC.beam/heatCapacityB38()*100,26,'drain at 120');
    S.overType='beam';S.overUnlocked.add('beam');S.overLevels={beam:5};S.over=1;S.b38OverHeld=true;S.attackCd=0;foe(60);shots=[];attack();
    const mine=shots.filter(s=>s.source==='player');assert(mine.length===5,`Lv5 Beam fired ${mine.length} streams`);
    for(const s of mine)near(s.power,(1.5+5*.2)*1.25,'Lv5 Beam power');
    S.overLevels={beam:1};S.attackCd=0;shots=[];attack();const one=shots.filter(s=>s.source==='player');assert(one.length===1,'Lv1 streams');near(one[0].power,(1.5+.2)*.6,'Lv1 Beam power');
    S.weaponPower=2;S.b94NovaWaves=[];releaseNovaB94(1,1);near(S.b94NovaWaves[0].damage,(.9+.72)*1.7*2,'Nova ignores weapon power');
  });

  test('B122 the ranch HUD shows Heart Stones and the Fatigue label; the refinery sheet lists them',()=>{
    fresh({stones:7,hearts:120});renderRanchHudB100();
    assert($('ranchStoneB102').textContent==='◆ 7','stone counter: '+$('ranchStoneB102').textContent);
    const hud=$('ranchHudB100').textContent;assert(!/Arena max/.test(hud)&&!/Tired/.test(hud)&&/😴/.test(hud),'HUD text: '+hud);
    refinerySheetB102();const p=$('ranchSheetB100').querySelector('p').textContent;assert(/You have ◆ 7 · ♥ 120/.test(p),'refinery sheet: '+p);
  });

  return out;
}
