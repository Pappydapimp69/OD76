function runFocusedChecksB155(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{closeSheetB100()}};
 const fresh=(lv,hearts)=>{ranchB99=Object.assign(ranchDefaultB99(),{hearts});ensurePointsB100(ranchB99);syncCapsB102();ranchB99.refinery={level:lv,queue:0,startedAt:0,trayStones:0,trayDust:0,upgradeUntil:0,upgradeTo:0,lag:[]};saveRanchB99()};
 test('B155 the minimum load doubles per level; each stone still costs 50',()=>{
  assert([1,2,3,6].map(refineMinHeartsB155).join()==='50,100,200,1600','minimums');
  fresh(2,150);assert(loadHeartsB102(1)===0&&ranchB99.hearts===150,'Lv2 took a 50-heart load');
  assert(loadHeartsB102(2)===2&&ranchB99.hearts===50&&ranchB99.refinery.queue===2,'Lv2 100-heart load');
  fresh(3,150);assert(loadHeartsB102(4)===0&&ranchB99.hearts===150,'Lv3 loaded without 200 hearts');
 });
 test('B155 the sheet offers the minimum load or says what is needed',()=>{
  fresh(2,250);openRanchB99();refinerySheetB102();const l=(ranchWorldB100.sheet?.options||[]).map(o=>o.label);
  assert(l.some(x=>x==='Refine ♥ 100 → ◆ 2')&&l.some(x=>x==='Refine all · ♥ 250 → ◆ 5'),'labels: '+l);closeSheetB100();
  fresh(3,150);refinerySheetB102();const m=(ranchWorldB100.sheet?.options||[]).map(o=>o.label);
  assert(!m.some(x=>/^Refine /.test(x))&&$('ranchSheetB100').textContent.includes('needs ♥ 200 to start'),'short sheet: '+m);
 });
 return out;
}
