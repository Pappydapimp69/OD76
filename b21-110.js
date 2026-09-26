
// B116c Boss dash freeze: standing in a yellow dash path freezes the player 2.2s.
// Fang's pounce lane turns yellow the instant bossPhaseB59(e,"locked") commits its aim (b21-47, drawn in b21-48).
// A player overlapping that lane then is frozen: one gate on the outermost update, attack, dashVector and
// triggerOverdrive blocks movement, auto-fire, dash and skills while Pip keeps acting. Held or charging skills
// end with no HEAT refund (Ascendant loses its committed reserve); regen waits while frozen. The clock holds on
// pause and clears on run end, stage end, boss death and reset. One check per lock; a lock never extends a freeze.
const B116C_FREEZE_SECONDS=2.2,B116C_POUNCE_REACH=206;
function frozenB116c(){return !!(S&&(S.b116cFreeze||0)>0)}
function clearFreezeB116c(){if(S)S.b116cFreeze=0}
function inDashLaneB116c(e){
  const q=e.b59,x=e.x+Math.cos(q.angle)*B116C_POUNCE_REACH,y=e.y+Math.sin(q.angle)*B116C_POUNCE_REACH;
  return pointSegmentDistanceB59(P.x,P.y,e.x,e.y,x,y)<P.r+e.r;
}
// Whatever HEAT a skill has taken stays spent; a charge that defers its cost is charged here.
function cancelSkillsB116c(){
  for(const k of ['b93StormCharge','b94Charge']){const c=S[k];if(!c)continue;
    if(Number.isFinite(c.startHeat)&&Number.isFinite(c.spent))S.heat=clamp(Math.min(S.heat,c.startHeat-c.spent),0,100);S[k]=null}
  if(S.overType==='pip'&&(S.over>0||(S.b58AscTime||0)>0))S.heat=0;
  if(S.over>0)stopOverdriveB38(true);
  S.over=0;S.b38OverHeld=false;S.b43AscAuto=false;S.b58AscTime=0;
}
function freezePlayerB116c(){
  if(frozenB116c())return false;
  cancelSkillsB116c();S.b116cFreeze=B116C_FREEZE_SECONDS;S.dashTime=0;P.vx=P.vy=0;
  announce('FROZEN',700);ring(P.x,P.y,'#9ee7ff',64);particle(P.x,P.y,'#dff9ff',12,90);
  tone(1320,.12,.014,'triangle');updateUI();return true;
}
const bossPhaseBeforeB116c=bossPhaseB59;
bossPhaseB59=function(e,phase,seconds){
  bossPhaseBeforeB116c(e,phase,seconds);
  if(phase==='locked'&&e?.bossKey===5&&e.b59&&!e.dead&&S?.run&&!S.end&&inDashLaneB116c(e))freezePlayerB116c();
};
const updateBeforeB116c=update;
update=function(dt){
  if(!S||S.b39Paused)return updateBeforeB116c(dt);
  // A lock lands mid-frame; B38's held-skill wrapper re-arms S.over on its way out, so cancel again after it.
  if(!frozenB116c()){updateBeforeB116c(dt);if(frozenB116c())cancelSkillsB116c();return}
  if(!S.run||S.end||S.stagePending||S.waveState==='stage'||ranchWorldB100?.active){clearFreezeB116c();return updateBeforeB116c(dt)}
  const held=[...keys],pad=[gamepad.dx,gamepad.dy],stick=joy.active,x=P.x,y=P.y;
  keys.clear();gamepad.dx=gamepad.dy=0;joy.active=false;P.vx=P.vy=0;S.dashTime=0;
  try{updateBeforeB116c(dt)}finally{for(const k of held)keys.add(k);gamepad.dx=pad[0];gamepad.dy=pad[1];joy.active=stick;P.x=x;P.y=y;P.vx=P.vy=0}
  if(frozenB116c()&&(S.b116cFreeze-=Math.max(0,Number(dt)||0))<=1e-9){S.b116cFreeze=0;ring(P.x,P.y,'#dff9ff',40)}
};
const attackBeforeB116c=attack;
attack=function(){if(frozenB116c())return;return attackBeforeB116c()};
const dashVectorBeforeB116c=dashVector;
dashVector=function(dx,dy){if(frozenB116c())return false;return dashVectorBeforeB116c(dx,dy)};
const triggerOverdriveBeforeB116c=triggerOverdrive;
triggerOverdrive=function(){if(frozenB116c())return false;return triggerOverdriveBeforeB116c()};
const canIgniteBeforeB116c=canIgniteOverdriveB38;
canIgniteOverdriveB38=function(id=S?.overType){return !frozenB116c()&&canIgniteBeforeB116c(id)};
const heatSkillBusyBeforeB116c=heatSkillBusyB115b;
heatSkillBusyB115b=function(){return heatSkillBusyBeforeB116c()||frozenB116c()};
const killBossBeforeB116c=killBoss;
killBoss=function(e){const out=killBossBeforeB116c(e);clearFreezeB116c();return out};
const resetBeforeB116c=reset;
reset=function(){resetBeforeB116c();clearFreezeB116c()};
function drawFreezeB116c(){
  if(!frozenB116c()||!S.run||S.end)return;
  const x=worldToScreenX(P.x),y=worldToScreenY(P.y),k=clamp(S.b116cFreeze/B116C_FREEZE_SECONDS,0,1);
  X.save();X.globalAlpha=.5;X.fillStyle='#9ee7ff';X.beginPath();X.arc(x,y,P.r+5,0,Math.PI*2);X.fill();
  X.globalAlpha=.95;X.strokeStyle='#dff9ff';X.lineWidth=3;X.beginPath();X.arc(x,y,P.r+11,-Math.PI/2,-Math.PI/2+Math.PI*2*k);X.stroke();
  X.textAlign='center';X.font='900 12px system-ui,sans-serif';X.fillStyle='#dff9ff';X.fillText(`FROZEN ${S.b116cFreeze.toFixed(1)}s`,x,y-P.r-20);X.restore();
}
const drawBeforeB116c=draw;
draw=function(){drawBeforeB116c();drawFreezeB116c()};
