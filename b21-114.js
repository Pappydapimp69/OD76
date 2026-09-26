// B117 Guardian rework (shipped inside B117, no new build number). Pip is the Guardian.
// Holding Guardian calls Pip home: he drops his errand and flies back, and HEAT drains from the press, but the
// flight itself costs at most 10% HEAT. Once Pip is in orbit, blocks charge one by one (first 0.4s, then 1.2s
// each, 10% faster per Guardian level and shortened by Guardian Glow) up to the level's count: Lv1 2, Lv2 3,
// Lv3 3 + reflect, Lv4 4 + stronger reflect, Lv5 4 + mends up to 2 shields. The shield refill on press and the
// 0.7s pulse are gone. One knockback pulse fires on release (clean ring) or when the last block breaks (cracked
// ring, same power); a break also ends Guardian and stuns Pip for 1.8s. While Guardian is active or Pip is stunned,
// Pip counts as away: no gathering, auto-fire, heart skills, Cover, Rally, Pip Catch or music resonance, and his
// heart meter hides.
const B117G_BLOCKS=[2,3,3,4,4];
const B117G_FIRST=.4,B117G_NEXT=1.2,B117G_LEVEL_TRIM=.9;
const B117G_RETURN_CAP=10,B117G_ORBIT_REACH=30;
const B117G_STUN=1.8;
const B117G_PULSE=[{r:90,dmg:1.0,push:60},{r:115,dmg:1.3,push:75},{r:115,dmg:1.5,push:75},{r:140,dmg:1.8,push:90},{r:140,dmg:2.1,push:90}];
const B117G_REFLECT=[0,0,1.0,1.4,1.4];
const B117G_REGEN_MAX=2,B117G_REGEN_SECONDS=1.5;
let b117gPulses=[],b117gClock=0;

function guardLevelB117g(lv=overLevel('guardian')){return clamp(Math.floor(Number(lv)||1),1,5)}
function guardB117g(){return S?.b117Guard||null}
function guardActiveB117g(){return !!(S?.b117Guard&&S.over>0&&S.overType==='guardian')}
function pipStunnedB117g(){return (S?.b117PipStun||0)>0}
function pipOffB117g(){return !!S&&(guardActiveB117g()||pipStunnedB117g())}
function guardDelayB117g(lv,charged){
  const glow=clamp((Number(S?.shieldRegenDelay)||4)/4,.25,1);
  return (charged>0?B117G_NEXT:B117G_FIRST)*Math.pow(B117G_LEVEL_TRIM,guardLevelB117g(lv)-1)*glow;
}
function guardDrainB117g(dt){return (B38_DRAIN_ENERGY_PER_SEC.guardian/heatCapacityB38())*100*Math.max(0,Number(dt)||0)}

// ---- Pip counts as away while he guards or is stunned ----
const pipWithBeforeB117g=pipWithPlayer;
pipWithPlayer=function(){return !pipOffB117g()&&pipWithBeforeB117g()};
const pipBondBeforeB117g=pipBondB51;
pipBondB51=function(){return pipOffB117g()?0:pipBondBeforeB117g()};
const supportEmergencyBeforeB117g=supportEmergencyB63;
supportEmergencyB63=function(){return !pipOffB117g()&&supportEmergencyBeforeB117g()};
const coverBeforeB117g=coverAvailableB59;
coverAvailableB59=function(){return !pipOffB117g()&&coverBeforeB117g()};
const resonanceBeforeB117g=resonanceRankB41;
resonanceRankB41=function(theme){return pipOffB117g()?0:resonanceBeforeB117g(theme)};
const heartMeterBeforeB117g=drawPipBondHeartB51;
drawPipBondHeartB51=function(){if(!pipOffB117g())heartMeterBeforeB117g()};
const heartTimerBeforeB117g=drawPipBondTimerB72;
drawPipBondTimerB72=function(){if(!pipOffB117g())heartTimerBeforeB117g()};
const pipCombatBeforeB117g=updatePipCombat;
updatePipCombat=function(dt){if(!pipOffB117g())return pipCombatBeforeB117g(dt)};
// Guarding Pip flies home and then rides the orbit; a stunned Pip stays where he is.
const companionBeforeB117g=updatePipCompanion;
updatePipCompanion=function(dt){
  if(!pipOffB117g())return companionBeforeB117g(dt);
  if(pipStunnedB117g()||!guardActiveB117g())return;
  const o=pipOrbitPoint();
  if(S.b117Guard.orbit){P.pipX=o.x;P.pipY=o.y}else flyPipB60(o.x,o.y,clamp(Number(dt)||0,0,.1));
};

// ---- activation ----
const canIgniteBeforeB117g=canIgniteOverdriveB38;
canIgniteOverdriveB38=function(id=S?.overType){if(id==='guardian'&&pipStunnedB117g())return false;return canIgniteBeforeB117g(id)};
const triggerBeforeB117g=triggerOverdrive;
triggerOverdrive=function(...a){
  const fresh=S?.overType==='guardian'&&!(S.over>0);
  if(fresh&&pipStunnedB117g()&&S.run&&!S.end){announce('PIP IS STUNNED',500);return false}
  const shields=S?.shields,regen=S?.shieldRegenClock;
  const ok=triggerBeforeB117g(...a);
  if(ok&&fresh&&S.over>0&&S.overType==='guardian'){
    S.shields=shields;S.shieldRegenClock=regen;S.overGuardHits=0;
    const lv=guardLevelB117g();
    // Blocks still standing from an earlier activation carry in and count toward this one's cap.
    const max=B117G_BLOCKS[lv-1],kept=Math.min(max,S.b117Held?.n||0);S.b117Held=null;
    S.b117Guard={level:lv,max,ready:kept,used:0,charged:kept,prog:0,orbit:false,returnSpent:0,regen:0,regenClock:0,broken:false};
    // Pip drops his errand; he picks his duties back up after Guardian.
    if(S.b59){S.b59.rallyReturn=false;S.b59.lure=null;S.b59.setup=null}
    if(typeof clearMiningB74==='function')clearMiningB74();
    if(S.pipState!=='orbit'){S.pipTarget=null;S.pipState='return'}
    if(hyp(P.pipX-P.x,P.pipY-P.y)<=B117G_ORBIT_REACH)reachOrbitB117g(S.b117Guard);
    else announce('GUARDIAN · PIP IS COMING',650);
    updateUI();
  }
  return ok;
};
function reachOrbitB117g(g){
  g.orbit=true;ring(P.x,P.y,'#7ed8ff',52);particle(P.pipX,P.pipY,'#7ed8ff',10,90);tone(520,.1,.018,'sine');
}

// ---- blocks ----
function reflectB117g(g){
  const power=B117G_REFLECT[g.level-1];if(!power)return;
  const t=nearestEnemyFrom(P.x,P.y,460);if(!t)return;
  const a=Math.atan2(t.y-P.y,t.x-P.x);
  shots.push({x:P.x,y:P.y,vx:Math.cos(a)*580,vy:Math.sin(a)*580,r:6,life:.9,power,source:'overdrive',b117gReflect:true});
  addOverLine(P.x,P.y,P.x+Math.cos(a)*60,P.y+Math.sin(a)*60,'#fff0a8',.14);
}
const hurtBeforeB117g=hurt;
hurt=function(...a){
  const g=guardB117g();
  if(g&&guardActiveB117g()&&g.ready>0&&!(S.invuln>0)&&!S.end&&combatB59()){
    g.ready--;g.used++;S.invuln=.42;
    ring(P.x,P.y,'#fff0a8',80);particle(P.x,P.y,'#7ed8ff',16,160);popup(P.x,P.y-18,'GUARDIAN BLOCK','#fff0a8',true,.7);sfxShield();
    reflectB117g(g);
    if(g.used>=g.max)breakGuardB117g();
    updateUI();return;
  }
  const h=S?.b117Held;
  if(h?.n>0&&!guardActiveB117g()&&!(S.invuln>0)&&!S.end&&combatB59()){
    h.n--;S.invuln=.42;
    ring(P.x,P.y,'#fff0a8',80);particle(P.x,P.y,'#7ed8ff',16,160);popup(P.x,P.y-18,'GUARDIAN BLOCK','#fff0a8',true,.7);sfxShield();
    reflectB117g(h);if(h.n<=0)S.b117Held=null;
    updateUI();return;
  }
  return hurtBeforeB117g(...a);
};

// ---- pulse, break, stun ----
function guardPulseB117g(level,broken){
  const p=B117G_PULSE[guardLevelB117g(level)-1];
  for(const e of [...enemies]){
    if(e.dead)continue;const dx=e.x-P.x,dy=e.y-P.y,d=hyp(dx,dy)||1;if(d>p.r)continue;
    hitEnemy(e,p.dmg,'overdrive');
    if(!e.dead&&e.type!=='boss'){const push=p.push*(1-.5*d/p.r);e.x+=dx/d*push;e.y+=dy/d*push}
  }
  b117gPulses.push({x:P.x,y:P.y,r:p.r,broken,life:.55,max:.55,seed:rnd()*Math.PI*2});
  shake=Math.max(shake,broken?9:7);
  if(broken){tone(170,.22,.03,'sawtooth');tone(118,.3,.025,'square')}else burstTone(420,5);
}
function stunChirpB117g(){
  try{
    if(!ensureAudio()||!audioEngine?.sfx)return;
    const ctx=audioCtx,t0=ctx.currentTime;
    for(let i=0;i<12;i++){
      const t=t0+.08+i*.13+(i%2)*.03,f=2100+(i%3)*380,o=ctx.createOscillator(),v=ctx.createGain();
      o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*1.45,t+.045);o.frequency.exponentialRampToValueAtTime(f*.92,t+.09);
      v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(.028,t+.01);v.gain.exponentialRampToValueAtTime(.0001,t+.1);
      o.connect(v);v.connect(audioEngine.sfx);o.start(t);o.stop(t+.12);
    }
  }catch(e){}
}
function breakGuardB117g(){
  const g=guardB117g();if(!g||g.broken)return;
  g.broken=true;guardPulseB117g(g.level,true);
  S.b117PipStun=B117G_STUN;stunChirpB117g();
  stopOverdriveB38(false);
  announce('GUARDIAN BROKEN',800);
}
const stopBeforeB117g=stopOverdriveB38;
stopOverdriveB38=function(spent=false,...a){
  const g=guardB117g(),live=!!g&&guardActiveB117g();
  const r=stopBeforeB117g(spent,...a);
  if(live&&!guardActiveB117g()){
    S.b117Guard=null;
    // Charged blocks outlive the hold: they stay up until hits destroy them.
    if(!g.broken)S.b117Held=g.ready>0?{n:g.ready,level:g.level}:null;
    if(!g.broken&&combatB59())guardPulseB117g(g.level,false);
    updateUI();
  }
  return r;
};

// ---- per-frame: return-flight HEAT cap, charging, Lv5 mending, stun timer ----
function tickGuardB117g(g,dt){
  if(!g.orbit){if(hyp(P.pipX-P.x,P.pipY-P.y)<=B117G_ORBIT_REACH)reachOrbitB117g(g);else return}
  if(g.ready+g.used<g.max){
    g.prog+=dt;const need=guardDelayB117g(g.level,g.charged);
    if(g.prog>=need-1e-9){g.prog-=need;g.charged++;g.ready++;ring(P.x,P.y,'#fff0a8',44);tone(620+g.charged*120,.08,.018,'sine');updateUI()}
  }else g.prog=0;
  if(g.level>=5&&g.regen<B117G_REGEN_MAX&&S.shields<S.maxShields){
    g.regenClock+=dt;
    if(g.regenClock>=B117G_REGEN_SECONDS){g.regenClock=0;g.regen++;S.shields++;ring(P.x,P.y,'#7ed8ff',60);popup(P.x,P.y-18,'GUARDIAN MEND','#7ed8ff',false,.6);sfxShield()}
  }
}
const updateBeforeB117g=update;
update=function(dt){
  const g=guardB117g(),active=!!g&&guardActiveB117g()&&S.b38OverHeld,returning=active&&!g.orbit;
  const r=updateBeforeB117g(dt);
  if(!S)return r;
  // A break inside this frame's hurt() stops Guardian before B38 re-marks it active; keep it stopped.
  if(S.overType==='guardian'&&S.over>0&&!S.b38OverHeld&&!S.b117Guard)S.over=0;
  const step=clamp(Number(dt)||0,0,.1);b117gClock+=step;
  for(const p of b117gPulses)p.life-=step;b117gPulses=b117gPulses.filter(p=>p.life>0);
  if(returning&&guardActiveB117g()){
    // B38 drained this frame; refund whatever the flight spends past the cap.
    const d=guardDrainB117g(dt),room=Math.max(0,B117G_RETURN_CAP-g.returnSpent);
    if(d>room)S.heat=Math.min(100,S.heat+d-room);
    g.returnSpent+=Math.min(d,room);
  }
  if(g&&!guardActiveB117g()){if(S.b117Guard===g)S.b117Guard=null}
  else if(g&&liveB59()&&!S.b39Paused)tickGuardB117g(g,step);
  if(S.b117PipStun>0&&liveB59())S.b117PipStun=Math.max(0,S.b117PipStun-step);
  return r;
};
// The legacy every-0.7s Guardian pulse is retired.
const updateOverdriveBeforeB117g=updateOverdrive;
updateOverdrive=function(dt){if(S?.overType==='guardian')return;return updateOverdriveBeforeB117g(dt)};
const resetBeforeB117g=reset;
reset=function(){resetBeforeB117g();S.b117Guard=null;S.b117Held=null;S.b117PipStun=0;b117gPulses=[]};
if(S){S.b117Guard=null;S.b117Held=null;S.b117PipStun=0}

// ---- visuals ----
function drawGuardB117g(){
  if(!S?.run||S.end||S.waveState==='stage'||!P)return;
  const g=guardB117g(),px=worldToScreenX(P.x),py=worldToScreenY(P.y);
  X.save();
  if(g&&guardActiveB117g()){
    const pulse=.5+.5*Math.sin(b117gClock*6);
    X.strokeStyle='#7ed8ff';X.globalAlpha=g.orbit?.55+.25*pulse:.25;X.lineWidth=2;
    X.beginPath();X.arc(px,py,30,0,Math.PI*2);X.stroke();
    if(!g.orbit){X.setLineDash([4,5]);X.globalAlpha=.5;X.beginPath();X.moveTo(worldToScreenX(P.pipX),worldToScreenY(P.pipY));X.lineTo(px,py);X.stroke();X.setLineDash([])}
    const left=g.max-g.used;
    for(let i=0;i<left;i++){
      const a=-Math.PI/2+(i-(left-1)/2)*.42,x=px+Math.cos(a)*38,y=py+Math.sin(a)*38,ready=i<g.ready;
      X.globalAlpha=ready?.95:.45;X.beginPath();X.moveTo(x,y-5);X.lineTo(x+4,y);X.lineTo(x,y+5);X.lineTo(x-4,y);X.closePath();
      if(ready){X.fillStyle='#fff0a8';X.fill()}else{X.strokeStyle='#fff0a8';X.lineWidth=1.3;X.stroke()}
    }
  }
  else if(S.b117Held?.n>0){
    const n=S.b117Held.n;X.globalAlpha=.5;X.strokeStyle='#fff0a8';X.lineWidth=1.5;X.beginPath();X.arc(px,py,30,0,Math.PI*2);X.stroke();
    for(let i=0;i<n;i++){const a=-Math.PI/2+(i-(n-1)/2)*.42,x=px+Math.cos(a)*38,y=py+Math.sin(a)*38;
      X.globalAlpha=.95;X.fillStyle='#fff0a8';X.beginPath();X.moveTo(x,y-5);X.lineTo(x+4,y);X.lineTo(x,y+5);X.lineTo(x-4,y);X.closePath();X.fill()}
  }
  for(const p of b117gPulses){
    const t=1-p.life/p.max,r=12+(p.r-12)*Math.min(1,t*1.4),x=worldToScreenX(p.x),y=worldToScreenY(p.y);
    X.globalAlpha=Math.max(0,1-t);
    if(p.broken){
      X.strokeStyle='#b9d6e6';X.lineWidth=3;
      for(let i=0;i<9;i++){
        if(i%4===3)continue; // missing shards
        const a0=p.seed+i*Math.PI*2/9,a1=a0+Math.PI*2/9*.55,jr=r*(1+.1*Math.sin(p.seed*7+i*3));
        X.beginPath();X.arc(x,y,jr,a0,a1);X.stroke();
      }
    }else{
      X.strokeStyle='#fff0a8';X.lineWidth=6;X.shadowColor='#7ed8ff';X.shadowBlur=14;
      X.beginPath();X.arc(x,y,r,0,Math.PI*2);X.stroke();
      X.lineWidth=2;X.strokeStyle='#7ed8ff';X.beginPath();X.arc(x,y,r*.82,0,Math.PI*2);X.stroke();X.shadowBlur=0;
    }
  }
  if(pipStunnedB117g()){
    const x=worldToScreenX(P.pipX),y=worldToScreenY(P.pipY)-14;
    X.globalAlpha=.95;X.fillStyle='#ffe38a';X.font='bold 13px system-ui';X.textAlign='center';X.textBaseline='middle';
    for(let i=0;i<3;i++){const a=b117gClock*6+i*Math.PI*2/3;X.fillText('✦',x+Math.cos(a)*13,y+Math.sin(a)*5)}
  }
  X.restore();
}
const drawBeforeB117g=draw;
draw=function(){drawBeforeB117g();drawGuardB117g()};
const updateUIBeforeB117g=updateUI;
updateUI=function(){
  updateUIBeforeB117g();const button=$('overdrive');if(!S||!button||S.overType!=='guardian')return;
  const g=guardB117g();
  if(g&&guardActiveB117g())button.innerHTML=`GUARDIAN<br><small>${g.orbit?`BLOCKS ${g.ready} READY · ${g.max-g.used} LEFT`:'PIP RETURNING'}</small>`;
  else if(pipStunnedB117g())button.innerHTML='GUARDIAN<br><small>PIP STUNNED</small>';
};
OVERDRIVE_INFO.guardian.desc='Hold: Pip flies to you and becomes your Guardian, charging blocks one by one (Lv1 2, Lv2-3 3, Lv4-5 4). Lv3+ blocks reflect a bolt; Lv5 mends up to 2 shields. Release for a knockback pulse; charged blocks stay up until destroyed. If every block breaks, Guardian ends and Pip is stunned 1.8s. Pip does nothing else while guarding.';
