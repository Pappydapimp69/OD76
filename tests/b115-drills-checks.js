function runDrillsChecksB115(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
 const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
 const test=(name,fn)=>{try{keys.clear();fresh();reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear()}};
 const press=(key=' ')=>{updateRanchB100(.016);keys.add(key);updateRanchB100(.016);keys.delete(key);updateRanchB100(.016)};
 const at=id=>{const st=stationB100(id);ranchWorldB100.px=st.x;ranchWorldB100.py=st.y+20;ranchWorldB100.pip.x=st.x+400;ranchWorldB100.pip.y=st.y};
 const sheet=id=>{closeSheetB100();at(id);press();return $('ranchSheetB100').textContent};
 const upgradeOpt=()=>(ranchWorldB100.sheet?.options||[]).findIndex(o=>o.label.startsWith('Upgrade station'));
 test('B115 drill gates use skill levels, not a training-session counter',()=>{
  fresh({stones:999,fatigue:0,stats:{range:0,speed:0,power:5,guard:0},points:{range:0,speed:0,power:50,guard:0}});openRanchB99();
  for(let i=0;i<10;i++){assert(!drillBlockB99('power'),'session count blocked training at '+i);assert(soloDrillB100('power',.999),'drill refused at '+i);ranchB99.fatigue=0}
  assert(ranchB99.stats.power===10&&drillBlockB99('power')==='level','Lv 10 did not block');
 assert(!soloDrillB100('power',0)&&!startGameB100('power')&&!('drillCounts' in ranchB99),'blocked drill or obsolete counter survived');
  assert(!drillBlockB99('speed'),'other station blocked');
  const t=sheet('power');assert(t.includes("reached this station's Lv 10 limit")&&!t.includes('Set'),'level-gate message wrong: '+t);
 assert(!ranchWorldB100.sheet.options.some(o=>o.label.startsWith('Let Pip')||o.label.startsWith('Train together')),'blocked sheet still offers training');
 });
 test('B115 a drill that reaches the gate cannot spill into the next level band',()=>{
  fresh({stones:999,fatigue:0,stats:{range:0,speed:0,power:9,guard:0},points:{range:0,speed:0,power:99,guard:0}});
  const r=soloDrillB100('power',0);assert(r.gain===1&&ranchB99.points.power===100&&ranchB99.stats.power===10&&drillBlockB99('power')==='level','drill crossed the Lv 10 gate');
 });
 test('B115 station upgrades unlock each next ten-level band',()=>{
  fresh({stones:999,starStones:10,stats:{range:0,speed:0,power:9,guard:0},points:{range:0,speed:0,power:90,guard:0}});openRanchB99();
  let t=sheet('power');assert(t.includes('trains through Star Power Lv 10')&&upgradeOpt()<0,'upgrade offered before Lv 10: '+t);
  assert(!upgradeStationB102('power'),'upgrade went through before level gate');
  ranchB99.stats.power=10;ranchB99.points.power=100;t=sheet('power');const i=upgradeOpt();assert(i>=0&&ranchWorldB100.sheet.options[i].label.includes('★ 1'),'upgrade not offered at Lv 10: '+t);
  focusSheetB100(i);press();assert(ranchB99.stations.power===1&&ranchB99.stats.power===10&&ranchB99.starStones===9,'upgrade changed skill level or cost');
  assert(!drillBlockB99('power')&&drillLevelCapB115d('power')===20&&soloDrillB100('power',0).gain===B100_BASE+B102_STATION_POINTS,'Lv 11-20 band did not unlock');
 });
 test('B115 level-gated stations explain a missing Star Stone',()=>{
  fresh({stones:999,starStones:0,stats:{range:0,speed:0,power:0,guard:10},points:{range:0,speed:0,power:0,guard:100}});openRanchB99();
  const t=sheet('guard');assert(t.includes('costs ★ 1')&&upgradeOpt()<0&&ranchWorldB100.sheet.options.length===1,'missing-stars text wrong: '+t);
 });
 test('B115 station levels go past 3; cost stays lv+1 and each level adds 2 points',()=>{
  fresh({stones:999,starStones:100});
  for(let lv=0;lv<5;lv++){ranchB99.stats.speed=(lv+1)*10;ranchB99.points.speed=ranchB99.stats.speed*B100_POINTS_PER_LEVEL;assert(upgradeStationB102('speed'),'upgrade refused at skill Lv '+ranchB99.stats.speed)}
  assert(ranchB99.stations.speed===5&&ranchB99.starStones===100-15&&drillBaseB102('speed')===B100_BASE+5*B102_STATION_POINTS,'uncapped upgrades wrong');
  assert(loadRanchB99().stations.speed===5,'station level clamped on reload');
  openRanchB99();const t=sheet('speed');assert(t.includes('Station Lv 5')&&t.includes('Swift Pip Lv 60')&&!t.includes('Set')&&!t.includes('Infinity'),'sheet still shows counter or cap: '+t);
 });
 test('B115 old drillCounts saves discard the counter and keep level gates',()=>{
  localStorage.setItem(B99_RANCH_KEY,JSON.stringify({week:5,stones:4,stations:{speed:2,power:3},stats:{range:1,speed:20,power:31,guard:1},points:{range:10,speed:200,power:310,guard:10},drillCounts:{range:4,speed:10,power:9,guard:2}}));
  const r=loadRanchB99();assert(!('drillCounts' in r)&&r.stations.power===3&&r.stations.speed===2,'obsolete counter survived migration');
  ranchB99=r;assert(drillBlockB99('power')!=='level'&&drillBlockB99('speed')!=='level','saved levels used the wrong station gate');
  ranchB99.stats.power=40;ranchB99.points.power=400;assert(drillBlockB99('power')==='level','Lv 40 did not meet station Lv 3 gate');
 });
 fresh();reset();return out;
}
