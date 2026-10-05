function runFocusedChecksB127(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();reset()};
 test('B127 ranch food tiers buy, feed and persist',()=>{
  fresh({hearts:300,hunger:0});assert(B104_ITEMS.pellets.food===25&&B104_ITEMS.bun.food===50&&B104_ITEMS.bun.price===60&&B104_ITEMS.feast.food===100&&B104_ITEMS.feast.price===240,'food values');
  assert(buyItemB104('bun')&&feedB104('bun')&&ranchB99.hunger===50&&ranchB99.hearts===240,'bun');assert(buyItemB104('feast'),'feast buy');ranchB99.hunger=0;assert(feedB104('feast')&&ranchB99.hunger===100,'feast feed');
 });
 test('B127 all rare-drop counts are possible at one 15-kill checkpoint',()=>{
  const er=rollExplorationDropB30,hr=heartStoneRollB106,dr=starDustRollB126;
  const run=(e,h,d)=>{fresh({dust:0});S.run=true;S.waveState='active';S.kills=15;S.b30LastKillMilestone=0;let n=0;rollExplorationDropB30=()=>{if(e)n++;return e};heartStoneRollB106=()=>h?0:1;starDustRollB126=()=>d?0:1;checkKillMilestoneDropB30();return n+heartStoneDropsB106.filter(x=>!x.bossDrop).length+starDustDropsB126.length};
  try{assert(run(0,0,0)===0&&run(1,0,0)===1&&run(1,1,0)===2&&run(1,1,1)===3,'independent outcomes')}finally{rollExplorationDropB30=er;heartStoneRollB106=hr;starDustRollB126=dr}
 });
 test('B127 actual enemy kills reach the authoritative rare-drop checkpoint',()=>{
  fresh({dust:0});S.run=true;S.waveState='active';S.kills=14;S.b30LastKillMilestone=0;S.waveKills=0;S.waveGoal=99;
  const er=rollExplorationDropB30,hr=heartStoneRollB106,dr=starDustRollB126;let explored=0;
  try{rollExplorationDropB30=()=>{explored++;return true};heartStoneRollB106=()=>0;starDustRollB126=()=>0;kill({type:'chaser',dead:false,x:P.x+40,y:P.y,r:12,hp:1,maxHp:1});assert(S.kills===15&&explored===1&&heartStoneDropsB106.some(x=>!x.bossDrop)&&starDustDropsB126.length===1,'live kill path missed rare drops')}finally{rollExplorationDropB30=er;heartStoneRollB106=hr;starDustRollB126=dr}
 });
 test('B127 Gravity Well gathers hearts and manual collapse launches them to Pip',()=>{
  fresh();S.run=true;S.waveState='active';S.overType='gravity';P.pipX=300;P.pipY=0;heartBits=[{x:30,y:0,vx:0,vy:0,life:10,dead:false,bob:0}];S.b94Well={x:0,y:0,level:2,time:2,pulse:1,radius:200,frac:1,mass:0};updateWellB94(.1);assert(heartBits[0].x<30&&heartBits[0].b127Well,'heart not gathered');assert(triggerOverdrive()&&!S.b94Well&&heartBits[0].vx>0,'manual collapse failed');
 });
 test('B127 Ascendant cycles Echoes and exposes Harmony',()=>{
  fresh();S.run=true;S.waveState='active';S.overType='pip';S.over=1;S.overUnlocked=new Set(['beam','nova']);S.overLevels={pip:4,beam:1,nova:1};startAscendantB127();ascendantPulse();assert(S.b127Asc.lastEcho==='beam','first echo');ascendantPulse();assert(S.b127Asc.lastEcho==='nova','second echo');
 });
 test('B127 stage gate shows compact effect chips',()=>{
  fresh({hunger:30,hygiene:10});S.run=true;S.stagePending=true;setArenaFatigueB118(70);S.b115Toll={};renderTollGateB115();const t=$('ranchGateBarsB115').textContent;assert(t.includes('Move + attack 90%')&&t.includes('HEAT refill 50%')&&t.includes('Guardian Glow 55%'),'effect chips');
 });
 return out;
}
