function runFocusedChecksB174(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{closeSheetB100()}};
 const fresh=o=>{ranchB99=Object.assign(ranchDefaultB99(),o);ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
 const lv=n=>{ranchB99.refinery.level=n},t0=1e12,none=()=>1;
 test('B174 slot count 2,2,3,4,5,5 and capacity doubles',()=>{
  assert([1,2,3,4,5,6].map(l=>slotCountB174(l)).join()==='2,2,3,4,5,5','count');
  assert(slotCapB174('heart',1)===300&&slotCapB174('heart',2)===600&&slotCapB174('dust',1)===30&&slotCapB174('dust',3)===120,'cap');
 });
 test('B174 ♥300 at Lv 1 fills one slot: ◆6 in 15 min, one every 2.5 min',()=>{
  fresh({hearts:400});assert(loadSlotB174(0,'heart',300,t0)===6&&ranchB99.hearts===100,'load');
  tickSlotsB174(t0+150e3-1,none);assert(ranchB99.refinery.trayStones===0,'early');
  tickSlotsB174(t0+150e3,none);assert(ranchB99.refinery.trayStones===1,'first');
  tickSlotsB174(t0+900e3,none);assert(ranchB99.refinery.trayStones===6&&!slotsB174()[0].kind,'all');
  assert(loadSlotB174(1,'heart',350,t0)===0,'over capacity loaded');
 });
 test('B174 top-up restarts the timer on what is left (♥100 then +♥100 at half = one every 5 min)',()=>{
  fresh({hearts:200});loadSlotB174(0,'heart',100,t0);tickSlotsB174(t0+450e3,none);assert(ranchB99.refinery.trayStones===1,'7.5 min');
  const t1=t0+450e3;assert(loadSlotB174(0,'heart',100,t1)===2&&slotLeftB174(slotsB174()[0])===3,'top-up');
  tickSlotsB174(t1+300e3-1,none);assert(ranchB99.refinery.trayStones===1,'early');tickSlotsB174(t1+300e3,none);assert(ranchB99.refinery.trayStones===2,'5 min');
 });
 test('B174 dust: one load, one timer, stars drip into the wallet',()=>{
  fresh({dust:50,starStones:0});assert(loadSlotB174(1,'dust',30,t0)===6&&ranchB99.dust===20,'load');
  tickSlotsB174(t0+900e3,none);assert(ranchB99.starStones===6&&ranchB99.dust===20,'stars '+ranchB99.starStones+' dust '+ranchB99.dust);
 });
 test('B174 Min is the level minimum, Max is capacity or holdings; no mixing',()=>{
  fresh({hearts:1000,dust:12});lv(2);let r=slotRoomB174(0,'heart');assert(r.min===100&&r.max===600,'lv2 hearts '+JSON.stringify(r));
  r=slotRoomB174(0,'dust');assert(r.min===5&&r.max===10,'dust '+JSON.stringify(r));
  loadSlotB174(0,'heart',100,t0);assert(!slotRoomB174(0,'dust').max&&slotRoomB174(0,'heart').max===500,'mix/space');
  assert(!slotRoomB174(2,'heart').max,'slot 3 locked at lv2');
 });
 test('B174 refinery sheet: slot tiles first, no Refine/Fuse buttons, tile opens Min/Max',()=>{
  fresh({hearts:420,dust:7});openRanchB99();refinerySheetB102();
  const el=$('ranchSheetB100'),tiles=[...el.querySelectorAll('.b174slots .b174slot')];
  assert(tiles.length===2&&el.querySelectorAll('button')[0]===tiles[0],'tiles');
  assert(!ranchWorldB100.sheet.options.some(o=>/^(Refine |Fuse )/.test(o.label)),'old buttons');
  tiles[1].click();const l=ranchWorldB100.sheet.options.map(o=>o.label);
  assert(l.includes('Hearts · Min ♥ 50 → ◆ 1')&&l.includes('Hearts · Max ♥ 300 → ◆ 6')&&l.includes('Star Dust · Min ✧ 5 → ★ 1')&&!l.some(x=>/Star Dust · Max/.test(x)),l.join('|'));
  [...el.querySelectorAll('button')].find(b=>/Hearts · Max/.test(b.textContent)).click();
  assert(slotsB174()[1].kind==='heart'&&slotsB174()[1].n===6&&ranchB99.hearts===120,'loaded');
  assert(el.classList.contains('b174')&&/◆ 6/.test(el.querySelectorAll('.b174slot')[1].textContent),'back on refinery');
 });
 test('B174 old queues are refunded on load',()=>{
  fresh({hearts:0,dust:0});ranchB99.refinery.queue=3;ranchB99.fuse={queue:2,startedAt:Date.now()};saveRanchB99();
  ranchB99=loadRanchB99();assert(ranchB99.hearts===150&&ranchB99.dust===10&&!ranchB99.refinery.queue&&!ranchB99.fuse.queue,'refund');
 });
 test('B174 a running slot survives a reload',()=>{
  fresh({hearts:300});const now=Date.now();loadSlotB174(0,'heart',300,now);saveRanchB99();ranchB99=loadRanchB99();
  const s=ranchB99.slots[0];assert(s.kind==='heart'&&s.n===6&&s.start===now,'lost');
 });
 return out;
}
