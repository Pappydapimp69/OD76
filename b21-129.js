
// B123 Reach and basic shots. Player reach is 10% shorter (with or without Pip, Beam included). Basic shots
// cross the current reach in 0.5s (360–600px/s), so phones see slower shots, and live just long enough
// (+10%) to reach anything they were aimed at on any screen size.
const B123_RANGE_SCALE=.9,B123_SHOT_CROSS_SECONDS=.5,B123_SHOT_MIN=360,B123_SHOT_MAX=600,B123_SHOT_SLACK=1.1;
function baseReachB123(){return Math.min(270,Math.max(185,Math.min(W,H)*.55))*B123_RANGE_SCALE}
const applyPipPowerBeforeB123=applyPipPower;
applyPipPower=function(...a){const r=applyPipPowerBeforeB123(...a);if(S){S.attackRange*=B123_RANGE_SCALE;S.b123Range=S.attackRange}return r};
// The one reach both auto-fire and Beam use: Pip's full range, faded toward the base by a weak bond (B51).
function reachB123(){
  const base=baseReachB123();if(!S||!pipWithPlayer())return base;
  const full=S.b123Range??S.attackRange,b=pipBondB51();return b>=.999?full:base+(full-base)*b;
}
getAutoTarget=function(){let best=null,bestD=reachB123();for(const e of enemies){if(e.dead)continue;const d=hyp(P.x-e.x,P.y-e.y);if(d<bestD){bestD=d;best=e}}return best};
beamReachB116b=reachB123;
function shotSpeedB123(){return clamp(reachB123()/B123_SHOT_CROSS_SECONDS,B123_SHOT_MIN,B123_SHOT_MAX)}
const attackBeforeB123=attack;
attack=function(){
  if(!S||(S.over>0&&(S.overType==='beam'||S.overType==='pip')))return attackBeforeB123();
  const start=shots.length,out=attackBeforeB123(),speed=shotSpeedB123(),life=reachB123()/speed*B123_SHOT_SLACK;
  for(let i=start;i<shots.length;i++){const s=shots[i];if(s?.source!=='player')continue;const v=hyp(s.vx,s.vy)||1;s.vx*=speed/v;s.vy*=speed/v;s.life=life}
  return out;
};
if(S)applyPipPower();
