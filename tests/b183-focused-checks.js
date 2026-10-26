function runFocusedChecksB183(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{closeSheetB100()}};
 const fresh=()=>{leaveQuarryB183(false);quarryB183={unlocked:false,broken:{},total:0};saveQuarryB183();ranchB99=Object.assign(ranchDefaultB99(),{starStones:3,dust:0,stones:0});ensurePointsB100(ranchB99);syncCapsB102();ranchB99.fatigue=0;saveRanchB99();openRanchB99()};
 test('B183 the signpost unlocks the quarry for ★2 and takes Pip there',()=>{fresh();const n=B100_STATIONS.length;interactStationB100(stationB100('signpost'));chooseSheetB100(0);
  assert(quarryB183.unlocked&&ranchB99.starStones===1&&inQuarryB183()&&B100_WORLD.w===1400&&B100_STATIONS.some(s=>s.rock)&&!stationB100('refinery'),'enter')});
 test('B183 a rock gives ✧ for 10 fatigue and regrows after 20 min',()=>{const id=B183_ROCKS[0].id,zero=()=>.99;const g=breakRockB183(id,zero);
  assert(g&&g.dust===1&&ranchB99.dust===1&&ranchB99.fatigue===10&&!rockUpB183(id),'break');assert(!breakRockB183(id),'broke twice');
  quarryB183.broken[id]-=20*60e3;assert(rockUpB183(id),'regrow')});
 test('B183 lucky rolls: a second ✧ and a ◆',()=>{const g=breakRockB183(B183_ROCKS[1].id,()=>0);assert(g.dust===2&&g.stones===1,'luck')});
 test('B183 a tired Pip cannot break rocks',()=>{ranchB99.fatigue=fatigueMaxB118();assert(!breakRockB183(B183_ROCKS[2].id),'tired broke');ranchB99.fatigue=0});
 test('B183 the path home restores the ranch exactly',()=>{interactStationB100(B100_STATIONS.find(s=>s.id==='quarryExit'));chooseSheetB100(0);
  assert(!inQuarryB183()&&B100_WORLD.w===2400&&stationB100('refinery')&&stationB100('signpost')&&B106_OBSTACLES.length>0,'restore')});
 test('B183 leaving the ranch from the quarry restores the map first',()=>{enterQuarryB183();leaveRanchB100();assert(!inQuarryB183()&&B100_WORLD.w===2400,'leave')});
 test('B183 quarry progress survives a reload',()=>{const q=loadQuarryB183();assert(q.unlocked&&q.total===2&&Object.keys(q.broken).length>=1,'lost')});
 return out;
}
