function runFocusedChecksB151(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{closeSheetB100()}};
 const fresh=()=>{ranchB99=Object.assign(ranchDefaultB99(),{starStones:9,hearts:0});ensurePointsB100(ranchB99);syncCapsB102();ranchB99.refinery={level:1,queue:0,startedAt:0,trayStones:0,trayDust:0,upgradeUntil:0,upgradeTo:0,lag:[]};saveRanchB99()};
 test('B151 upgrade times: Lv2 15, Lv3 20, Lv4 30, Lv5 20, Lv6 60 min; max Lv 6',()=>{
  assert([2,3,4,5,6].map(upgradeSecondsB151).join()==='900,1200,1800,1200,3600','curve');assert(B102_REFINERY_MAX===6,'max');
  fresh();const t0=1e12;assert(upgradeRefineryB102(t0),'refused');const f=ranchB99.refinery;
  assert(f.level===1&&f.upgradeTo===2&&f.upgradeUntil===t0+900e3,'timer: '+JSON.stringify(f));assert(!upgradeRefineryB102(t0+1),'second upgrade while upgrading');
  tickRefineryB102(t0+900e3-1);assert(f.level===1,'early');tickRefineryB102(t0+900e3);assert(f.level===2&&!f.upgradeTo,'not finished');
 });
 test('B151 refining keeps going at the old speed, and a running batch keeps its progress at the switch',()=>{
  fresh();const f=ranchB99.refinery,t0=1e12;f.queue=2;f.startedAt=t0-850e3;f.lag=[0,0];
  assert(upgradeRefineryB102(t0),'refused');tickRefineryB102(t0+60e3);assert(f.level===1&&f.trayStones===2,'old-speed batches did not finish during the upgrade: '+f.trayStones);
  fresh();const g=ranchB99.refinery;upgradeRefineryB102(t0);g.queue=1;g.startedAt=t0+800e3;g.lag=[0]; // loaded 100s before the switch
  tickRefineryB102(t0+900e3);assert(g.level===2&&g.trayStones===0,'batch finished instantly at the switch');
  const rest=(800/900)*600e3;tickRefineryB102(t0+900e3+rest-1000);assert(g.trayStones===0,'finished early');tickRefineryB102(t0+900e3+rest+1);assert(g.trayStones===1,'did not finish its rest at the new speed');
 });
 test('B151 the timer survives a reload and is capped',()=>{
  fresh();upgradeRefineryB102(Date.now());saveRanchB99();ranchB99=loadRanchB99();assert(ranchB99.refinery.upgradeTo===2,'lost');
  const raw=JSON.parse(localStorage.getItem(B99_RANCH_KEY));raw.refinery.upgradeUntil=Date.now()+1e12;localStorage.setItem(B99_RANCH_KEY,JSON.stringify(raw));
  ranchB99=loadRanchB99();assert(ranchB99.refinery.upgradeUntil<=Date.now()+900e3+5,'not capped');
 });
 test('B151 the sheet shows duration and per-stone time; while upgrading, a countdown instead of the button',()=>{
  fresh();openRanchB99();refinerySheetB102();let labels=(ranchWorldB100.sheet?.options||[]).map(o=>o.label);
  assert(labels.some(l=>/Upgrade refinery → Lv 2 · ★ 1 · takes 15 min \(then 10 min\/stone\)/.test(l)),'label: '+labels);closeSheetB100();
  upgradeRefineryB102();refinerySheetB102();labels=(ranchWorldB100.sheet?.options||[]).map(o=>o.label);
  assert(!labels.some(l=>/^Upgrade refinery/.test(l))&&/Upgrading → Lv 2 · .+ left · still refining at 15 min\/stone/.test($('ranchSheetB100').textContent),'upgrading sheet: '+$('ranchSheetB100').textContent);
 });
 test('B151 the "ready" toast waits for the ranch',()=>{
  fresh();ranchWorldB100.active=false;const t0=1e12;upgradeRefineryB102(t0);tickRefineryB102(t0+901e3);assert(ranchB99.refinery.upgradeNotice===true,'notice not kept for the ranch');
 });
 return out;
}
