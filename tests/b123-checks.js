// B123 reach −10% and viewport-tuned basic shots.
function runChecksB123(){
  const out=[],assert=(v,m)=>{if(!v)throw Error(m)};
  const near=(a,b,m,tol=1e-6)=>assert(Math.abs(a-b)<tol,`${m}: ${a} vs ${b}`);
  const test=(name,fn)=>{const w=W,h=H;try{reset();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{W=w;H=h;if(S){S.over=0;applyPipPower()}}};
  const arena=()=>{S.run=true;S.end=false;S.b39Paused=false;S.waveState='active';S.over=0;S.attackCd=0;enemies=[];shots=[];P.x=0;P.y=0};
  const raw=()=>Math.min(270,Math.max(185,Math.min(W,H)*.55));

  test('B123 reach is 10% shorter with and without Pip, and Beam uses the same reach',()=>{
    for(const [w,h] of [[390,844],[1280,800]]){W=w;H=h;S.pipLevel=3;S.pipPowerLv=2;applyPipPower();arena();
      near(S.attackRange,Math.min(430,Math.min(W,H)*.55+2*12+2*7)*.9,`attackRange at ${w}x${h}`);
      S.b51PipBond=1;P.pipX=0;P.pipY=0;
      if(pipWithPlayer())near(reachB123(),S.attackRange,'reach with Pip');
      near(beamReachB116b(),reachB123(),'Beam reach differs');
      P.pipX=5000;P.pipY=5000;if(!pipWithPlayer())near(reachB123(),raw()*.9,'reach without Pip');
    }
  });

  test('B123 auto-target ignores an enemy just past the shorter reach',()=>{
    W=390;H=844;applyPipPower();arena();P.pipX=5000;P.pipY=5000;const r=reachB123();
    enemies=[{type:'chaser',x:r+4,y:0,r:12,hp:5,maxHp:5,dead:false,age:1,speed:0}];assert(!getAutoTarget(),'targeted past reach');
    enemies[0].x=r-4;assert(getAutoTarget()===enemies[0],'missed an enemy inside reach');
  });

  test('B123 basic shots cross the reach in 0.5s (360–600px/s) and live long enough to reach it',()=>{
    for(const [w,h] of [[390,844],[1280,800],[2400,1600]]){W=w;H=h;applyPipPower();arena();P.pipX=5000;P.pipY=5000;
      const r=reachB123();enemies=[{type:'chaser',x:r-2,y:0,r:12,hp:50,maxHp:50,dead:false,age:1,speed:0}];attack();
      const s=shots.filter(x=>x.source==='player');assert(s.length>=1,`no shot at ${w}x${h}`);
      const v=hyp(s[0].vx,s[0].vy),want=clamp(r/.5,360,600);near(v,want,`speed at ${w}x${h}`,1e-3);
      assert(v*s[0].life>=r,`shot dies before reach at ${w}x${h}`);
    }
    W=390;H=844;applyPipPower();arena();P.pipX=5000;P.pipY=5000;enemies=[{type:'chaser',x:150,y:0,r:12,hp:50,maxHp:50,dead:false,age:1,speed:0}];attack();
    assert(hyp(shots[0].vx,shots[0].vy)<600,'phone shots not slower than before');
  });

  test('B123 Beam shots keep their own speed',()=>{
    arena();S.overType='beam';S.overUnlocked.add('beam');S.overLevels={beam:1};S.over=1;S.b38OverHeld=true;P.pipX=0;P.pipY=0;
    enemies=[{type:'chaser',x:100,y:0,r:12,hp:50,maxHp:50,dead:false,age:1,speed:0}];attack();
    const s=shots.filter(x=>x.source==='player');assert(s.length&&Math.abs(hyp(s[0].vx,s[0].vy)-600)<1e-6,'Beam shot speed changed');
  });
  return out;
}
