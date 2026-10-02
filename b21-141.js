
// B125 patch 11: clearing feels like progress. (2) Cutting a site's first path plays a "restored" moment —
// chime, heart burst, banner — and a fully cleared site gives +1 drill point per training there (Pip loves the
// open space). (3) Chops are juicier: wood chips or leaves fly, the obstacle tips over, and a thunk or rustle
// plays. (5) Each overgrown site shows "Cleared n/22" with a ring meter. (6) Pip cheers and carries a log or a
// bundle of twigs home after each clear.
const B135_FULL_BONUS=1;
function siteCountB135(site){const obs=B106_OBSTACLES.filter(o=>o.site===site);return{done:obs.filter(o=>!obstacleStandingB106(o)).length,total:obs.length}}
function siteFullB135(site){const c=siteCountB135(site);return c.total>0&&c.done>=c.total}
const fxB135=[];// chips, leaves, falling obstacles and carried logs, in world space
function siteTitleB135(site){return B100_GAMES[site]?.title||stationB100(site)?.name||site}
function chimeB135(full){const n=full?[523,659,784,1047]:[523,659,784];n.forEach((f,i)=>setTimeout(()=>tone(f,.14,.045,'triangle'),i*110))}

const clearObstacleBeforeB135=clearObstacleB106;
clearObstacleB106=function(id){
  const o=obstacleB106(id),wasPath=o&&B134_DRILL_SITES.includes(o.site)?sitePathB134(o.site):true,wasFull=o?siteFullB135(o.site):true;
  const ok=clearObstacleBeforeB135(id);if(!ok||!o)return ok;
  // (3) chips/leaves + a tipping ghost of the obstacle, and a thunk or rustle
  const col=o.tree?['#c8935a','#9b6b3d','#e3b67a']:['#7fcf8a','#5fae6a','#a6e3a1'];
  for(let i=0;i<(o.tree?16:12);i++){const a=Math.random()*Math.PI*2,sp=60+Math.random()*120;fxB135.push({kind:'chip',x:o.x,y:o.y-10,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-80,t:0,life:.8,c:col[i%3],r:o.tree?3:2.5,leaf:!o.tree})}
  fxB135.push({kind:'fall',x:o.x,y:o.y,r:o.r,tree:o.tree,t:0,life:.6,dir:Math.random()<.5?-1:1});
  if(o.tree){tone(120,.16,.07,'square');setTimeout(()=>tone(80,.2,.06,'sine'),90)}else{tone(900,.05,.03,'triangle');setTimeout(()=>tone(700,.06,.025,'triangle'),50)}
  // (6) Pip cheers and carries a log or twigs home
  const w=ranchWorldB100,home=stationB100('home');w.pip.happy=Math.max(w.pip.happy||0,2.2);burstHeartsB100(w.pip.x,w.pip.y-6,3);
  if(home)fxB135.push({kind:'carry',x:w.pip.x,y:w.pip.y,fx:w.pip.x,fy:w.pip.y,tx:home.x,ty:home.y,t:0,life:2.2,log:o.tree});
  // (2) restored moments
  if(B134_DRILL_SITES.includes(o.site)){
    const st=stationB100(o.site),full=siteFullB135(o.site);
    if(!wasPath&&sitePathB134(o.site)){chimeB135(false);if(st)burstHeartsB100(st.x,st.y-30,10);ranchToastB100(`${siteTitleB135(o.site)} restored! The path is open.`,3.4)}
    if(!wasFull&&full){chimeB135(true);if(st)burstHeartsB100(st.x,st.y-30,16);ranchToastB100(`${siteTitleB135(o.site)} fully restored! Pip loves the open space: +${B135_FULL_BONUS} point every training here.`,4.2)}
  }
  return ok;
};
const awardDrillBeforeB135=awardDrillB100;
awardDrillB100=function(kind,bonus){
  const r=awardDrillBeforeB135(kind,bonus);if(!B134_DRILL_SITES.includes(kind)||!siteFullB135(kind))return r;
  const cap=B99_DRILLS[kind].cap*B100_POINTS_PER_LEVEL,before=ranchB99.stats[kind];
  ranchB99.points[kind]=Math.min(cap,ranchB99.points[kind]+B135_FULL_BONUS);ranchB99.stats[kind]=Math.floor(ranchB99.points[kind]/B100_POINTS_PER_LEVEL);saveRanchB99();
  return{...r,gain:(r?.gain||0)+B135_FULL_BONUS,levelUp:!!(r?.levelUp||ranchB99.stats[kind]>before)};
};
const updateRanchBeforeB135=updateRanchB100;
updateRanchB100=function(dt){
  const out=updateRanchBeforeB135(dt),d=Math.max(0,Number(dt)||0);
  for(let i=fxB135.length-1;i>=0;i--){const f=fxB135[i];f.t+=d;if(f.kind==='chip'){f.x+=f.vx*d;f.y+=f.vy*d;f.vy+=320*d}
    if(f.kind==='carry'){const k=Math.min(1,f.t/f.life),e=k*k*(3-2*k);f.x=f.fx+(f.tx-f.fx)*e;f.y=f.fy+(f.ty-f.fy)*e-Math.sin(k*Math.PI)*30}
    if(f.t>=f.life)fxB135.splice(i,1)}
  return out;
};
const drawRanchBeforeB135=drawRanchB100;
drawRanchB100=function(...a){
  const out=drawRanchBeforeB135(...a),w=ranchWorldB100;if(!w.active)return out;
  X.save();X.translate(Math.round(W/2-w.cam.x),Math.round(H/2-w.cam.y));
  // (5) progress ring + "Cleared n/22" on every site that still has overgrowth
  for(const site of B134_DRILL_SITES){const st=stationB100(site),c=siteCountB135(site);if(!st||c.done>=c.total)continue;
    const y=st.y-(B106_LABEL_Y[site]||90)-30,k=c.done/c.total;
    X.fillStyle='#fffaf3e6';X.beginPath();X.roundRect?X.roundRect(st.x-58,y-13,116,26,13):X.rect(st.x-58,y-13,116,26);X.fill();
    X.strokeStyle='#e5dcfb';X.lineWidth=4;X.beginPath();X.arc(st.x-42,y,8,0,Math.PI*2);X.stroke();
    X.strokeStyle=sitePathB134(site)?'#7be0ae':'#ffb36b';X.beginPath();X.arc(st.x-42,y,8,-Math.PI/2,-Math.PI/2+Math.PI*2*k);X.stroke();
    X.fillStyle='#4b4470';X.font='800 12px system-ui';X.textAlign='left';X.fillText(`Cleared ${c.done}/${c.total}`,st.x-28,y+4)}
  // (3)/(6) effects
  for(const f of fxB135){const k=f.t/f.life;
    if(f.kind==='chip'){X.globalAlpha=1-k;X.fillStyle=f.c;X.save();X.translate(f.x,f.y);X.rotate(f.t*8);if(f.leaf){X.beginPath();X.ellipse(0,0,f.r*1.6,f.r*.8,0,0,Math.PI*2);X.fill()}else X.fillRect(-f.r,-f.r*.6,f.r*2,f.r*1.2);X.restore()}
    else if(f.kind==='fall'){X.globalAlpha=1-k;X.save();X.translate(f.x,f.y+f.r*.4);X.rotate(f.dir*k*1.4);X.fillStyle=f.tree?'#7fbf6a':'#8fd39a';X.beginPath();X.arc(0,-f.r*.6,f.r*.75,0,Math.PI*2);X.fill();if(f.tree){X.fillStyle='#9b6b3d';X.fillRect(-4,-f.r*.2,8,f.r*.6)}X.restore()}
    else if(f.kind==='carry'){X.globalAlpha=k>.9?(1-k)*10:1;X.save();X.translate(f.x,f.y-18);X.rotate(Math.sin(f.t*6)*.15);if(f.log){X.fillStyle='#9b6b3d';X.fillRect(-11,-4,22,8);X.fillStyle='#e3b67a';X.beginPath();X.arc(11,0,4,0,Math.PI*2);X.fill()}else{X.strokeStyle='#7fcf8a';X.lineWidth=2;X.beginPath();for(let j=-1;j<=1;j++){X.moveTo(-8,j*2);X.lineTo(8,j*2+j)}X.stroke()}X.restore()}}
  X.globalAlpha=1;X.restore();return out;
};
