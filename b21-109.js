// B116b Skill readout and Beam: threshold meter on the skill button; Beam needs a target and grows with level.
// One gate set drives both behavior and display: the skill's ignition line (B94 constants, as canIgniteOverdriveB38
// reads them) and, for Beam, the auto-fire reach attack() can actually hit. The button fills toward the ignition line
// and stays dim below it; a Beam press with nothing in reach is free and flashes NO TARGET.
const B116B_NO_TARGET_SECONDS=.9;
const B116B_BEAM_LEVELS=[null,{spread:[0],mult:.6},{spread:[-.05,.05],mult:.8},{spread:[-.13,0,.13],mult:1},{spread:[-.19,0,.19],mult:1.12},{spread:[-.26,-.13,0,.13,.26],mult:1.25}];

function skillGateB116b(id=S?.overType){return id==='pip'?B94_PIP_IGNITION_PERCENT:B94_IGNITION_PERCENT}
function skillReadoutB116b(id=S?.overType){const gate=skillGateB116b(id),heat=S?.heat||0;return {gate,fill:clamp(heat/gate,0,1),dim:!(heat>=gate-1e-9)}}
// attack() aims with getAutoTarget(), whose range B51 fades with Pip's bond; mirror that exactly.
function beamReachB116b(){
  const base=Math.min(270,Math.max(185,Math.min(W,H)*.55));if(!pipWithPlayer())return base;
  const b=pipBondB51();return b>=.999?S.attackRange:base+(S.attackRange-base)*b;
}
function beamTargetB116b(){return nearestEnemyFrom(P.x,P.y,beamReachB116b())}
function beamShapeB116b(lv=overLevel('beam')){return B116B_BEAM_LEVELS[clamp(Math.round(lv)||1,1,5)]}

const triggerOverdriveBeforeB116b=triggerOverdrive;
triggerOverdrive=function(){
  if(S?.overType==='beam'&&canIgniteOverdriveB38('beam')&&!beamTargetB116b()){
    S.b116bNoTarget=B116B_NO_TARGET_SECONDS;tone(140,.08,.01,'sine');updateUI();return false;
  }
  return triggerOverdriveBeforeB116b();
};

// Re-shape each active Beam volley by level; B06's shots are the template so pierce, life and buffs carry over.
const attackBeforeB116b=attack;
attack=function(){
  if(!(S?.over>0&&S.overType==='beam'))return attackBeforeB116b();
  const start=shots.length,out=attackBeforeB116b(),mine=[];
  for(let i=shots.length-1;i>=start;i--)if(shots[i]?.source==='player')mine.unshift(...shots.splice(i,1));
  if(!mine.length)return out;
  const mid=mine[mine.length>>1],shape=beamShapeB116b(),aim=Math.atan2(mid.vy,mid.vx),speed=hyp(mid.vx,mid.vy);
  for(const off of shape.spread){const a=aim+off;shots.push({...mid,x:P.x+Math.cos(a)*18,y:P.y+Math.sin(a)*18,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,power:mid.power*shape.mult})}
  return out;
};

const updateBeforeB116b=update;
update=function(dt){updateBeforeB116b(dt);if(S?.b116bNoTarget>0){S.b116bNoTarget=Math.max(0,S.b116bNoTarget-dt);updateUI()}};

// Last word on the button: fill = progress to the ignition line, dim below it, solid at or above it.
const updateUIBeforeB116b=updateUI;
updateUI=function(){
  updateUIBeforeB116b();const button=$('overdrive');if(!S||!button)return;
  const r=skillReadoutB116b(),noTarget=(S.b116bNoTarget||0)>0&&S.overType==='beam'&&S.over<=0;
  button.style.setProperty('--b95fill',(r.fill*100).toFixed(1)+'%');
  button.classList.add('b95gauge');button.classList.toggle('b116dim',r.dim);button.classList.toggle('b116solid',!r.dim);
  button.classList.toggle('b116notarget',noTarget);
  if(noTarget)button.innerHTML='BEAM<br><small>NO TARGET</small>';
};

(function styleSkillReadoutB116b(){
  const style=document.createElement('style');
  style.textContent=`
#overdrive.b116dim{opacity:1;background:#1d170bcc;border-color:#ffd36f33;box-shadow:0 0 0 6px #ffd36f08;color:#e9dcb0}
#overdrive.b116dim::before{opacity:.5;background:linear-gradient(0deg,#b98a4299,#8f733c55)}
#overdrive.b116dim small{color:#efe4c2}
#overdrive.b116solid{opacity:1;border-color:#fff0a8;text-shadow:0 1px 2px #000c}
#overdrive.b116solid::before{opacity:1;background:linear-gradient(0deg,#ffb347dd,#ffd36fb0)}
#overdrive.b116notarget{border-color:#ff9f6f;animation:none}
#overdrive.b116notarget small{color:#ffd0bd}
`;
  document.head.appendChild(style);
})();
updateUI();
