function runDrillsChecksB115(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
  const test=(name,fn)=>{try{keys.clear();fresh();reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear()}};
  const press=(key=' ')=>{updateRanchB100(.016);keys.add(key);updateRanchB100(.016);keys.delete(key);updateRanchB100(.016)};
  const at=id=>{const st=stationB100(id);ranchWorldB100.px=st.x;ranchWorldB100.py=st.y+20;ranchWorldB100.pip.x=st.x+400;ranchWorldB100.pip.y=st.y};
  const sheet=id=>{closeSheetB100();at(id);press();return $('ranchSheetB100').textContent};
  const upgradeOpt=()=>(ranchWorldB100.sheet?.options||[]).findIndex(o=>o.label.startsWith('Upgrade station'));
  const sets=(o={})=>Object.assign({range:0,speed:0,power:0,guard:0},o);
  test('B115 ten trainings finish a set, then the station blocks',()=>{
    fresh({stones:999,fatigue:0});openRanchB99();
    for(let i=0;i<B115D_SET;i++){
      assert(!drillBlockB99('power'),'blocked early at '+i);
      if(i%3===0){assert(startGameB100('power'),'together refused at '+i);finishGameB100()}
      else assert(soloDrillB100('power',i%3===1?0:.999),'solo refused at '+i);
      ranchB99.fatigue=0;assert(ranchB99.drillCounts.power===i+1,'count wrong at '+i);
    }
    assert(drillBlockB99('power')==='set'&&!soloDrillB100('power',0)&&!startGameB100('power')&&ranchB99.drillCounts.power===10,'11th training allowed');
    assert(!drillBlockB99('speed')&&ranchB99.drillCounts.speed===0,'other stations blocked');
    assert(loadRanchB99().drillCounts.power===10,'count lost on reload');
    const t=sheet('power');assert(t.includes('Pip finished this set (10/10). Upgrade the station to train again.')&&t.includes('Set\u00a010/10'),'set message missing: '+t);
    assert(!ranchWorldB100.sheet.options.some(o=>o.label.startsWith('Let Pip')||o.label.startsWith('Train together')),'blocked sheet still offers training');
  });
  test('B115 the station upgrade stays locked until the set is done',()=>{
    fresh({stones:999,starStones:10,drillCounts:sets({power:7})});openRanchB99();
    let t=sheet('power');assert(t.includes('Set 7/10 · upgrade unlocks at 10')&&upgradeOpt()<0,'upgrade offered before the set: '+t);
    assert(!upgradeStationB102('power')&&ranchB99.stations.power===0&&ranchB99.starStones===10,'upgrade went through before the set');
    ranchB99.drillCounts.power=10;t=sheet('power');const i=upgradeOpt();assert(i>=0&&ranchWorldB100.sheet.options[i].label.includes('★ 1'),'upgrade not offered at 10: '+t);
    focusSheetB100(i);press();assert(ranchB99.stations.power===1&&ranchB99.drillCounts.power===0&&ranchB99.starStones===9,'upgrade did not reset the set');
    assert(!drillBlockB99('power')&&soloDrillB100('power',0).gain===B100_BASE+B102_STATION_POINTS&&ranchB99.drillCounts.power===1,'training did not resume after upgrade');
    t=sheet('power');assert(t.includes('Set 1/10')&&upgradeOpt()<0,'new set not shown');
  });
  test('B115 finished sets without Star Stones explain the upgrade cost',()=>{
    fresh({stones:999,starStones:0,drillCounts:sets({guard:10})});openRanchB99();
    const t=sheet('guard');assert(t.includes('costs ★ 1')&&upgradeOpt()<0&&ranchWorldB100.sheet.options.length===1,'missing-stars text wrong: '+t);
  });
  test('B115 station levels go past 3; cost stays lv+1 and each level adds 2 points',()=>{
    fresh({stones:999,starStones:100});
    for(let lv=0;lv<5;lv++){ranchB99.drillCounts.speed=10;assert(upgradeStationB102('speed'),'upgrade refused at Lv '+lv)}
    assert(ranchB99.stations.speed===5&&ranchB99.starStones===100-15&&drillBaseB102('speed')===B100_BASE+5*B102_STATION_POINTS,'uncapped upgrades wrong');
    assert(loadRanchB99().stations.speed===5,'station level clamped on reload');
    openRanchB99();const t=sheet('speed');assert(t.includes('Station Lv 5 ·')&&!/Lv \d+\/\d/.test(t)&&!t.includes('Infinity'),'sheet still shows a cap: '+t);
    assert($('ranchSheetB100').querySelector('h3').textContent==='Sky Laps · Swift Pip Lv 0 · Set\u00a00/10','drill header wrong');
  });
  test('B115 old saves without drillCounts load with fresh sets',()=>{
    localStorage.setItem(B99_RANCH_KEY,JSON.stringify({week:5,stones:4,stations:{speed:2,power:3},stats:{range:1,speed:1,power:1,guard:1}}));
    let r=loadRanchB99();assert(Object.keys(B99_DRILLS).every(k=>r.drillCounts[k]===0)&&r.stations.power===3&&r.stations.speed===2&&r.stations.guard===0,'old save migrated wrong');
    ranchB99=r;assert(!drillBlockB99('power')&&soloDrillB100('power',0)&&loadRanchB99().drillCounts.power===1,'old save cannot train');
    localStorage.setItem(B99_RANCH_KEY,JSON.stringify({drillCounts:{range:4.7,speed:'x',power:99,guard:-4}}));
    r=loadRanchB99();assert(r.drillCounts.range===4&&r.drillCounts.speed===0&&r.drillCounts.power===10&&r.drillCounts.guard===0,'corrupt counts accepted');
    localStorage.setItem(B99_RANCH_KEY,'null');r=loadRanchB99();assert(r.drillCounts.power===0&&r.stations.power===0,'empty save broke');
  });
  fresh();reset();
  return out;
}
