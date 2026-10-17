function runFocusedChecksB139(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const arena=()=>{ascB133=blankAscB133();saveAscB133();reset();S.run=true;S.end=false;S.waveState='active';W=900;H=600;CAM.x=P.x;CAM.y=P.y;enemies=[];shots=[]};
 const foe=(dx,dy)=>{const e={type:'chaser',x:P.x+dx,y:P.y+dy,r:12,hp:50,maxHp:50,dead:false,age:1,speed:0};enemies.push(e);return e};
 test('B139 skill, Pip and basic hits skip enemies fully off screen',()=>{
  arena();const off=foe(900,0),on=foe(200,0);
  for(const src of ['overdrive','pip','player']){hitEnemy(off,5,src);hitEnemy(on,5,src)}
  assert(off.hp===50,'off-screen enemy took damage');assert(on.hp<50,'on-screen enemy was not hit');
 });
 test('B139 an enemy partly in view can still be hit',()=>{arena();const edge=foe(W/2+8,0);hitEnemy(edge,5,'overdrive');assert(edge.hp<50,'edge enemy not hit')});
 test('B139 targeting ignores off-screen enemies',()=>{
  arena();const off=foe(470,0);assert(nearestEnemyFrom(P.x,P.y,900)===null,'nearest picked an off-screen enemy');
  const on=foe(300,0);assert(nearestEnemyFrom(P.x,P.y,900)===on,'nearest missed the on-screen enemy');
  const t=getAutoTarget();assert(!t||t===on,'auto target off screen');
 });
 test('B139 player and Pip shots end at the screen edge',()=>{
  arena();shots.push({x:P.x+W,y:P.y,vx:600,vy:0,r:4,life:2,power:1,source:'player'},{x:P.x,y:P.y,vx:0,vy:0,r:4,life:2,power:1,source:'pip'});
  update(.016);assert(shots.length===1&&shots[0].source==='pip','off-screen shot kept or on-screen shot lost: '+shots.length);
 });
 return out;
}
