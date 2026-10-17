function runFocusedChecksB140(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{tone=real;setTimeout=realST}};
 const real=tone,realST=setTimeout;
 test('B140 a felled tree plays only soft sine tones',()=>{
  ranchB99=Object.assign(ranchDefaultB99(),{tools:{axe:true,sickle:true},fatigue:0});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();openRanchB99();
  const heard=[];tone=(f,d,v,type)=>heard.push({f,v,type});setTimeout=(fn)=>{fn();return 0};
  const o=B106_OBSTACLES.find(o=>o.tree&&obstacleStandingB106(o));clearObstacleB106(o.id);
  assert(heard.length,'no clear sound');assert(heard.every(h=>h.type!=='square'&&h.v<=.02),'harsh tone: '+JSON.stringify(heard));
 });
 return out;
}
