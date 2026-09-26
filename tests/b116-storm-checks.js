
// B116a Storm levels: clouds by level, per-cloud charge delay, Lv 3 chain.
function runStormChecksB116(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const hitBaseB116a=hitEnemy;let strikes=[];
  const test=(name,fn)=>{try{keys.clear();fresh();reset();strikes=[];hitEnemy=function(e,power=1,source='player'){if(source==='overdrive')strikes.push({e,power});return hitBaseB116a(e,power,source)};fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{hitEnemy=hitBaseB116a;keys.clear();if(S?.b93StormCharge)cancelStormChargeB93(false)}};
  const near=(a,b,m)=>assert(Math.abs(a-b)<1e-6,`${m}: ${a} vs ${b}`);
  const foe=(x,y=0)=>{const e={type:'chaser',x,y,r:12,hp:50,maxHp:50,dead:false,age:1,flash:0,speed:0,markTime:0};enemies.push(e);return e};
  const arena=(lv,heat=100)=>{reset();strikes=[];S.audioEnabled=false;S.run=true;S.end=false;S.b39Paused=false;S.stagePending=false;S.waveState='active';S.bossActive=false;S.stageWaveCount=1;
    S.spawn=999;S.waveGoal=999;S.attackCd=999;S.loveClock=999;S.praiseCd=999;S.over=0;S.overType='storm';S.overUnlocked.add('storm');S.overLevels={storm:lv};S.pipBossPowers.constellation=0;
    S.heat=heat;S.b93StormCooldown=0;S.b93StormClouds=[];enemies=[];shots=[];enemyShots=[];heartBits=[];P.x=0;P.y=0;CAM.x=0;CAM.y=0;for(const id of ['start','end','stageUp','pipPauseB39'])$(id)?.classList.add('hidden')};
  const step=(s,fps=60)=>{for(let t=0;t<s-1e-8;t+=1/fps)update(Math.min(1/fps,s-t))};
  const press=()=>assert(triggerOverdrive()&&S.b93StormCharge,'storm press rejected');
  const release=()=>stopOverdriveB38(false);
  const tap=()=>{press();step(.05);release()};
  const clouds=()=>S.b93StormCharge?.clouds??-1;
  fresh();reset();

  test('B116 cloud count per level: Lv1 1, Lv2 2, Lv3 2, Lv4 3, Lv5 4',()=>{
    for(const [lv,n] of [[1,1],[2,2],[3,2],[4,3],[5,4]]){
      arena(lv);press();step(12);const c=S.b93StormCharge;
      assert(c.clouds===n&&c.full&&c.max===n,`Lv${lv} held ${c.clouds} clouds, wanted ${n}`);near(S.heat,100-8*n,`Lv${lv} HEAT`);
      assert(/FULL/.test($('overdrive').innerHTML),`Lv${lv} button not full`);
      foe(90);foe(90,300);release();assert(!S.b93StormCharge&&S.b93StormCooldown>0,`Lv${lv} release did not strike`);
      if(n>1)assert(S.b93StormClouds.length===n,`Lv${lv} launched ${S.b93StormClouds.length} clouds`);else assert(strikes.length>=1&&!S.b93StormClouds.length,'Lv1 single cloud did not strike at once');
      step(B93_STORM_COOLDOWN+3);press();const again=S.b93StormCharge;
      assert(again.clouds===0&&again.prog===0&&!again.auto&&!again.full&&again.spent===0,`Lv${lv} fresh press kept old charge state`);release();cancelStormChargeB93(false);strikes=[];
    }
  });

  test('B116 clouds charge 2.2s then 1.8s each, and 25% faster at Lv5 (1.65s, 1.35s) at 60 and 30 fps',()=>{
    for(const fps of [60,30]){
      arena(4);press();assert(clouds()===0&&S.heat===100,'a cloud formed on press');
      assert(/CHARGING 1\/3/.test($('overdrive').innerHTML),'button does not show CHARGING 1/3');
      step(2.15,fps);assert(clouds()===0,`first cloud early at ${fps}fps`);step(.1,fps);assert(clouds()===1,`first cloud late at ${fps}fps`);
      assert(/CHARGING 2\/3/.test($('overdrive').innerHTML),'button does not show CHARGING 2/3');
      step(1.65,fps);assert(clouds()===1,`second cloud early at ${fps}fps`);step(.1,fps);assert(clouds()===2,`second cloud late at ${fps}fps`);
      step(1.7,fps);assert(clouds()===2,'third cloud early');step(.1,fps);assert(clouds()===3,'third cloud late');cancelStormChargeB93(false);
      arena(5);press();step(1.6,fps);assert(clouds()===0,`Lv5 first cloud early at ${fps}fps`);step(.1,fps);assert(clouds()===1,`Lv5 first cloud late at ${fps}fps`);
      step(1.25,fps);assert(clouds()===1,'Lv5 second cloud early');step(.1,fps);assert(clouds()===2,'Lv5 second cloud late');cancelStormChargeB93(false);
    }
    near(stormDelayB116a(1,0),2.2,'Lv1 first');near(stormDelayB116a(3,2),1.8,'Lv3 next');near(stormDelayB116a(5,0),1.65,'Lv5 first');near(stormDelayB116a(5,3),1.35,'Lv5 next');
  });

  test('B116 each cloud costs 8% HEAT as it forms and forming pauses below 8%',()=>{
    arena(5,30);press();near(S.heat,30,'press spent HEAT');
    step(1.7);near(S.heat,22,'first cloud');step(1.35);near(S.heat,14,'second cloud');step(1.35);near(S.heat,6,'third cloud');
    step(3);const c=S.b93StormCharge;assert(c.clouds===3&&c.paused&&!c.full,'did not pause below 8%');near(S.heat,6,'paused cloud spent HEAT');
    S.heat=20;step(.05);assert(c.clouds===4&&!c.paused&&c.full,'did not resume when HEAT returned');near(S.heat,12,'fourth cloud');
    foe(90);release();assert(S.b93StormClouds.length===4,'release lost clouds');
  });

  test('B116 storm clouds keep charging and waiting through a wave break',()=>{
    arena(2,60);press();step(1);S.waveState='break';S.waveBreak=99;step(1.3);assert(S.b93StormCharge&&clouds()===1,'wave break stopped the charge');
    release();step(.1);assert(!S.b93StormCharge&&S.b93StormClouds.length===1&&S.b93StormClouds[0].waiting,'released cloud did not wait through the break: ');
    S.waveState='active';const e=foe(90);step(1.5);assert(strikes.length===1&&strikes[0].e===e,'cloud did not strike when the next wave came');
    arena(1,60);tap();step(1);S.waveState='break';S.waveBreak=99;step(1.3);assert(S.b93StormClouds.length===1,'tapped cloud did not finish charging in the break');
    S.waveState='stage';step(.1);assert(!S.b93StormClouds.length&&!S.b93StormCharge,'stage end kept storm clouds');
  });
  test('B116 a charged cloud with no target waits with the player until one appears',()=>{
    arena(1,60);tap();step(2.3);
    const cl=S.b93StormClouds;assert(!S.b93StormCharge&&cl.length===1&&cl[0].waiting&&!strikes.length,'cloud did not wait without a target');near(S.heat,52,'waiting cloud cost');
    P.x=400;P.y=300;step(6);assert(S.b93StormClouds.length===1&&Math.hypot(S.b93StormClouds[0].x-P.x,S.b93StormClouds[0].y-P.y)<90,'waiting cloud expired or did not follow the player');
    S.waveState='break';S.waveBreak=99;step(1);assert(S.b93StormClouds.length===1,'wave break dropped the waiting cloud');S.waveState='active';
    S.b93StormCooldown=0;S.heat=60;assert(!triggerOverdrive()&&S.heat===60,'a second storm started while a cloud waits');
    const e=foe(P.x+80,P.y);step(2);assert(strikes.length===1&&strikes[0].e===e&&!S.b93StormClouds.length,'waiting cloud did not strike the new target');
    finish(true);assert(!S.b93StormClouds?.length,'waiting cloud survived the run end');
  });
  test('B116 a tap charges exactly one cloud that strikes by itself after 2.2s with no hold',()=>{
    arena(2,60);const a=foe(90),b=foe(-90);tap();
    const c=S.b93StormCharge;assert(c&&c.auto&&!S.b38OverHeld,'tap did not leave an auto-charging cloud');assert(heatSkillBusyB115b(),'auto cloud not treated as busy');
    assert(/CHARGING 1\/1/.test($('overdrive').innerHTML)&&$('overdrive').disabled,'button does not show the tapped cloud charging');
    release();assert(S.b93StormCharge===c&&c.auto,'repeat pointerup cancelled the tapped cloud');
    step(2.05);assert(!strikes.length&&S.heat===60,'tapped cloud struck or spent early');
    step(.15);assert(!S.b93StormCharge&&strikes.length===1&&[a,b].includes(strikes[0].e),'tapped cloud did not strike once');near(S.heat,52,'tapped cloud cost');
    assert(!S.b93StormClouds.length&&S.b93StormCooldown>0,'auto strike queued clouds or skipped cooldown');step(4);assert(strikes.length===1,'more than one cloud struck');
  });

  test('B116 Lv3+ strikes arc to exactly one other nearby enemy for reduced damage',()=>{
    arena(3,60);foe(80);foe(140);foe(180);tap();step(2.3);
    assert(strikes.length===2&&strikes[0].e!==strikes[1].e,`Lv3 strike hit ${strikes.length} times`);
    near(strikes[1].power,strikes[0].power*B116A_CHAIN_DAMAGE,'chain damage');assert(hyp(strikes[0].e.x-strikes[1].e.x,strikes[0].e.y-strikes[1].e.y)<=140,'chain went beyond range');
    arena(5,60);foe(90);foe(90,130);press();step(1.8);release();step(.1);assert(strikes.length===2,'Lv5 did not chain');
    arena(4,60);foe(90);foe(90,160);tap();step(2.3);assert(strikes.length===1,'chain reached an enemy beyond range');
    arena(2,60);foe(80);foe(140);foe(180);tap();step(2.3);assert(strikes.length===1,'Lv2 chained');
  });

  test('B116 the old Constellation ricochet no longer drives the storm',()=>{
    arena(2,60);S.pipBossPowers.constellation=3;foe(80);foe(120);foe(160);press();step(4.2);release();step(2);
    assert(strikes.length===2&&strikes.every(s=>s.power===stormDamageB116a(2)),`Constellation changed the strikes: ${strikes.length}`);
    strikes=[];assert(strikeStormTargetB93(enemies.find(e=>!e.dead),bossPowerLevel('constellation'),1)===1&&strikes.length===1,'strikeStormTargetB93 still ricochets');
  });
  return out;
}
