function runFocusedChecksB144(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{closeSheetB100()}};
 const fresh=o=>{ranchB99=Object.assign(ranchDefaultB99(),o||{});ensurePointsB100(ranchB99);syncCapsB102();ranchB99.fatigue=0;ranchB99.tools.axe=true;ranchB99.tools.sickle=true;ranchB99.toolUses={axe:5,sickle:5};saveRanchB99();openRanchB99()};
 const trees=()=>B106_OBSTACLES.filter(o=>o.tree&&obstacleStandingB106(o));
 test('B144 the axe breaks on its fifth clear and is discarded',()=>{
  fresh();for(let i=0;i<4;i++){ranchB99.fatigue=0;assert(clearObstacleB106(trees()[0].id),'clear '+(i+1))}
  assert(ranchB99.tools.axe&&ranchB99.toolUses.axe===1,'after 4: '+ranchB99.toolUses.axe);
  ranchB99.fatigue=0;assert(clearObstacleB106(trees()[0].id),'fifth clear');assert(!ranchB99.tools.axe&&ranchB99.toolUses.axe===0,'axe not discarded');
  ranchB99.fatigue=0;assert(!clearObstacleB106(trees()[0].id),'cleared without an axe');assert(ranchB99.tools.sickle&&ranchB99.toolUses.sickle===5,'sickle wore from tree clears');
 });
 test('B144 a new axe has 5 uses; uses survive a reload',()=>{
  fresh();ranchB99.tools.axe=false;ranchB99.toolUses.axe=0;ranchB99.hearts=999;assert(buyToolB105('axe')&&ranchB99.toolUses.axe===5,'new axe');
  ranchB99.fatigue=0;clearObstacleB106(trees()[0].id);saveRanchB99();ranchB99=loadRanchB99();assert(ranchB99.tools.axe&&ranchB99.toolUses.axe===4,'reload: '+JSON.stringify(ranchB99.toolUses));
 });
 test('B144 the bag shows uses left',()=>{
  fresh();ranchB99.toolUses.axe=3;bagSheetB104();const row=[...document.querySelectorAll('#bagListB143 li')].find(li=>li.textContent.includes('Axe'));
  assert(row&&row.textContent.includes('3/5')&&row.textContent.includes('3 uses left'),'row: '+row?.textContent);
 });
 return out;
}
