function runFocusedChecksB151(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{closeSheetB100()}};
 const fresh=()=>{ranchB99=Object.assign(ranchDefaultB99(),{starStones:9,hearts:0});ensurePointsB100(ranchB99);syncCapsB102();ranchB99.refinery={level:1,queue:0,startedAt:0,trayStones:0,trayDust:0,upgradeUntil:0,upgradeTo:0,lag:[]};saveRanchB99()};
 test('B151 upgrade time grows with level: (target − 1) × 2 min',()=>{
  assert([2,5,10].map(upgradeSecondsB151).join()==='120,480,1080','curve');
  fresh();const t0=1e12;assert(upgradeRefineryB102(t0),'refused');const f=ranchB99.refinery;
  assert(f.level===1&&f.upgradeTo===2&&f.upgradeUntil===t0+120e3,'timer: '+JSON.stringify(f));assert(!upgradeRefineryB102(t0+1),'second upgrade while upgrading');
  tickRefineryB102(t0+120e3-1);assert(f.level===1,'early');tickRefineryB102(t0+120e3);assert(f.level===2&&!f.upgradeTo,'not finished');
 });
 test('B151 refining keeps going at the old speed, and a running batch keeps its progress at the switch',()=>{
  fresh();const f=ranchB99.refinery,t0=1e12;f.queue=2;f.startedAt=t0-850e3;f.lag=[0,0];
  assert(upgradeRefineryB102(t0),'refused');assert(f.level===1,'level jumped');
  tickRefineryB102(t0+60e3);assert(f.level===1&&f.trayStones===2,'old-speed batches did not finish during the upgrade: '+f.trayStones);
  fresh();const g=ranchB99.refinery;g.queue=1;g.startedAt=t0-450e3;g.lag=[0];upgradeRefineryB102(t0);
  tickRefineryB102(t0+120e3);assert(g.level===2&&g.trayStones===0,'half-done batch finished instantly at the switch');
  tickRefineryB102(t0+120e3+((900-570)/900)*600e3+1);assert(g.trayStones===1,'batch did not finish its rest at the new speed');
 });
 test('B151 the timer survives a reload and is capped',()=>{
  fresh();upgradeRefineryB102(Date.now());saveRanchB99();ranchB99=loadRanchB99();assert(ranchB99.refinery.upgradeTo===2,'lost');
  const raw=JSON.parse(localStorage.getItem(B99_RANCH_KEY));raw.refinery.upgradeUntil=Date.now()+1e12;localStorage.setItem(B99_RANCH_KEY,JSON.stringify(raw));
  ranchB99=loadRanchB99();assert(ranchB99.refinery.upgradeUntil<=Date.now()+120e3+5,'not capped');
 });
 test('B151 the sheet shows duration and per-stone time; while upgrading, a countdown instead of the button',()=>{
  fresh();openRanchB99();refinerySheetB102();let labels=(ranchWorldB100.sheet?.options||[]).map(o=>o.label);
  assert(labels.some(l=>/Upgrade refinery → Lv 2 · ★ 1 · takes 2 min \(then 10 min\/stone\)/.test(l)),'label: '+labels);closeSheetB100();
  upgradeRefineryB102();refinerySheetB102();labels=(ranchWorldB100.sheet?.options||[]).map(o=>o.label);
  assert(!labels.some(l=>/^Upgrade refinery/.test(l))&&/Upgrading → Lv 2 · .+ left · still refining at 15 min\/stone/.test($('ranchSheetB100').textContent),'upgrading sheet: '+$('ranchSheetB100').textContent);
 });
 test('B151 the "ready" toast waits for the ranch',()=>{
  fresh();ranchWorldB100.active=false;const t0=1e12;upgradeRefineryB102(t0);tickRefineryB102(t0+130e3);assert(ranchB99.refinery.upgradeNotice===true,'notice not kept for the ranch');
 });
 return out;
}
