function runFocusedChecksB156(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{closeSheetB100()}};
 const fresh=dust=>{ranchB99=Object.assign(ranchDefaultB99(),{dust,starStones:0});ensurePointsB100(ranchB99);syncCapsB102();ranchB99.fuse={startedAt:0,queue:0};saveRanchB99()};
 test('B157 nothing fuses unless the player starts it',()=>{fresh(11);tickFuseB156(1e12);tickFuseB156(1e12+5000e3);assert(ranchB99.dust===11&&ranchB99.starStones===0,'fused on its own')});
 test('B157 a started fuse gives ★1 15 minutes later; Fuse all queues back to back',()=>{
  fresh(11);const t0=1e12;assert(startFuseB156(1,t0)===1&&ranchB99.dust===6,'start');
  tickFuseB156(t0+900e3-1);assert(ranchB99.starStones===0,'early');tickFuseB156(t0+900e3);assert(ranchB99.starStones===1&&!ranchB99.fuse.queue,'first fuse');
  fresh(11);assert(startFuseB156(9,t0)===2&&ranchB99.dust===1,'fuse all');tickFuseB156(t0+1800e3);assert(ranchB99.starStones===2&&!ranchB99.fuse.queue,'queue done while away');
 });
 test('B157 a running fuse survives a reload',()=>{fresh(5);startFuseB156(1,Date.now());saveRanchB99();ranchB99=loadRanchB99();assert(ranchB99.fuse.queue===1&&ranchB99.fuse.startedAt>0&&ranchB99.dust===0,'lost')});
 test('B157 the refinery offers timed Fuse buttons and shows the countdown',()=>{
  fresh(12);openRanchB99();refinerySheetB102();let l=(ranchWorldB100.sheet?.options||[]).map(o=>o.label);
  assert(l.includes('Fuse ✧ 5 → ★ 1 · takes 15 min')&&l.includes('Fuse all · ✧ 10 → ★ 2 · 15 min each'),'labels: '+l);
  ranchWorldB100.sheet.options.find(o=>o.label.startsWith('Fuse ✧')).run();closeSheetB100();refinerySheetB102();assert(/Fusing ✧ → ★ · next in/.test($('ranchSheetB100').textContent),'countdown');
 });
 return out;
}
