function runFocusedChecksB145(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},near=(a,b,m)=>assert(Math.abs(a-b)<1e-6,`${m}: ${a} != ${b}`),test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const fresh=o=>{ranchB99=Object.assign(ranchDefaultB99(),o||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
 test('B145 hunt speed: Swift sets the base, fatigue and hunger scale it smoothly',()=>{
  fresh({fatigue:0,hunger:100});ranchB99.stats.speed=5;near(pipHuntSpeedB125(),110,'rested, fed, Swift 5');
  ranchB99.fatigue=100;near(pipHuntSpeedB125(),110*.6,'max fatigue');ranchB99.fatigue=50;near(pipHuntSpeedB125(),110*.8,'half fatigue');
  ranchB99.fatigue=0;ranchB99.hunger=0;near(pipHuntSpeedB125(),110*.6,'starving');ranchB99.hunger=30;near(pipHuntSpeedB125(),110*.8,'half fed');
  ranchB99.hunger=90;near(pipHuntSpeedB125(),110,'well fed');
 });
 test('B145 fatigue uses the shared max',()=>{fresh({bestPipLevel:11,fatigueMax:140,fatigue:70,hunger:100});near(pipHuntSpeedB125(),90*(1-.4*.5),'70/140')});
 return out;
}
