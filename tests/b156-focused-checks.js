function runFocusedChecksB156(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{closeSheetB100()}};
 const fresh=dust=>{ranchB99=Object.assign(ranchDefaultB99(),{dust,starStones:0});ensurePointsB100(ranchB99);syncCapsB102();ranchB99.fuse={startedAt:0};saveRanchB99()};
 test('B156 ✧5 fuse into ★1 after 15 minutes, back to back, on their own',()=>{
  fresh(11);const t0=1e12;tickFuseB156(t0);assert(ranchB99.dust===6&&ranchB99.fuse.startedAt===t0,'did not start');
  tickFuseB156(t0+900e3-1);assert(ranchB99.starStones===0,'early');tickFuseB156(t0+900e3);assert(ranchB99.starStones===1&&ranchB99.dust===1&&ranchB99.fuse.startedAt===t0+900e3,'first fuse / second start');
  tickFuseB156(t0+5000e3);assert(ranchB99.starStones===2&&ranchB99.dust===1&&!ranchB99.fuse.startedAt,'catch-up while away');
 });
 test('B156 fewer than ✧5 waits; the timer survives a reload',()=>{
  fresh(4);tickFuseB156(1e12);assert(!ranchB99.fuse.startedAt&&ranchB99.dust===4,'started with 4');
  fresh(5);tickFuseB156(Date.now());saveRanchB99();ranchB99=loadRanchB99();assert(ranchB99.fuse.startedAt>0&&ranchB99.dust===0,'lost on reload');
 });
 test('B156 the refinery shows the fuser instead of a Fuse button',()=>{
  fresh(7);openRanchB99();refinerySheetB102();const l=(ranchWorldB100.sheet?.options||[]).map(o=>o.label);
  assert(!l.some(x=>/^Fuse ✧/.test(x))&&/Fusing ✧5 → ★1 · .+ left/.test($('ranchSheetB100').textContent),'sheet: '+l+' | '+$('ranchSheetB100').textContent);
 });
 return out;
}
