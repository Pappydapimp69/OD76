function runFocusedChecksB141(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const fresh=o=>{ranchB99=Object.assign(ranchDefaultB99(),{tools:{axe:true,sickle:true,hoe:true,can:true}},o||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
 test('B141 the ranch tired line is 70% of the fatigue max',()=>{
  fresh();assert(tiredLineB141()===70,'max 100');fresh({bestPipLevel:11,fatigueMax:140});assert(tiredLineB141()===98,'max 140: '+tiredLineB141());
 });
 test('B141 tools and drills refuse at 70% of max, not at a flat 70',()=>{
  fresh({bestPipLevel:11,fatigueMax:140,fatigue:80});assert(toolReadyB106(),'tools refused at 80/140');
  assert(drillBlockB99('range')!=='tired','drill refused at 80/140: '+drillBlockB99('range'));
  ranchB99.fatigue=98;assert(!toolReadyB106()&&drillBlockB99('range')==='tired','not tired at 98/140');
  fresh({fatigue:70});assert(!toolReadyB106(),'base max: tools allowed at 70');
 });
 return out;
}
