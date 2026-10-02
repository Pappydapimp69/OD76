
// B124 Fixes: follow-cloud zap range ×3; boss dash freeze gives a 0.6s warning; a full Nova charge hits the
// whole screen; enemy HP grows with every wave this run and never falls under two basic shots; the Arena
// Merchant is themed and hold-to-confirm; between-stage holds take 0.9s; the meter is called Fatigue.

// ---- 1. follow-cloud zap range ×3 ----
for(let i=0;i<B122_ZAP_RANGE.length;i++)B122_ZAP_RANGE[i]*=3;

// ---- 2. boss dash freeze: the lane turns yellow, then 0.6s to step out ----
const B124_FREEZE_WARN=.6;
const freezeNowB124=freezePlayerB116c;
// B116c's lock check calls this the instant the lane locks; it now only arms the warning.
freezePlayerB116c=function(){
  if(frozenB116c()||S?.b124Warn)return false;
  const e=enemies.find(x=>x?.bossKey===5&&x.b59?.phase==='locked'&&!x.dead);if(!e)return freezeNowB124();
  S.b124Warn={e,t:B124_FREEZE_WARN,x:e.x,y:e.y,angle:e.b59.angle};announce('LEAVE THE LANE!',600);tone(880,.08,.014,'square');return false;
};
function inWarnedLaneB124(w){
  const x=w.x+Math.cos(w.angle)*B116C_POUNCE_REACH,y=w.y+Math.sin(w.angle)*B116C_POUNCE_REACH;
  return pointSegmentDistanceB59(P.x,P.y,w.x,w.y,x,y)<P.r+(w.e?.r||0);
}
function settleFreezeWarnB124(){
  const w=S?.b124Warn;if(!w)return false;S.b124Warn=null;
  if(w.e&&!w.e.dead&&S.run&&!S.end&&inWarnedLaneB124(w))return freezeNowB124();
  return false;
}
const updateBeforeB124=update;
update=function(dt){
  updateBeforeB124(dt);const w=S?.b124Warn;if(!w)return;
  if(!S.run||S.end||S.waveState==='stage'||S.stagePending||w.e?.dead){S.b124Warn=null;return}
  if(!S.b39Paused&&(w.t-=Math.max(0,Number(dt)||0))<=1e-9)settleFreezeWarnB124();
};
const resetBeforeB124=reset;
reset=function(){resetBeforeB124();if(S)S.b124Warn=null};
const killBossBeforeB124=killBoss;
killBoss=function(e){const out=killBossBeforeB124(e);if(S)S.b124Warn=null;return out};
const drawBeforeB124=draw;
draw=function(){
  drawBeforeB124();const w=S?.b124Warn;if(!w||!S.run||S.end)return;
  const x1=worldToScreenX(w.x),y1=worldToScreenY(w.y),x2=worldToScreenX(w.x+Math.cos(w.angle)*B116C_POUNCE_REACH),y2=worldToScreenY(w.y+Math.sin(w.angle)*B116C_POUNCE_REACH);
  X.save();X.globalAlpha=Math.sin(S.t*30)>0?.85:.35;X.strokeStyle='#fff0a8';X.lineWidth=(P.r+(w.e?.r||0))*2;X.lineCap='round';X.beginPath();X.moveTo(x1,y1);X.lineTo(x2,y2);X.stroke();X.restore();
};

// ---- 3. Nova: a full charge hits every enemy on screen ----
const releaseNovaBeforeB124=releaseNovaB94;
releaseNovaB94=function(frac,lv){
  releaseNovaBeforeB124(frac,lv);
  if(frac>=.999)for(const w of S?.b94NovaWaves||[])w.screen=true;
};
const fireNovaWaveBeforeB124=fireNovaWaveB94;
fireNovaWaveB94=function(wave){
  if(!wave?.screen)return fireNovaWaveBeforeB124(wave);
  const r=Math.hypot(W,H)/2;ring(P.x,P.y,'#ff9fba',r);particle(P.x,P.y,'#ffd36f',26,260);
  for(const e of visibleEnemies())hitEnemy(e,wave.damage,'overdrive');
  flash=Math.max(flash,.3);burstTone(260,5);
};

// ---- 4. enemy HP grows every wave and never dies to one basic shot ----
const B124_HP_PER_WAVE=.12;
const startWaveBeforeB124=startWave;
startWave=function(n){if(S)S.b124Waves=(S.b124Waves||0)+1;return startWaveBeforeB124(n)};
function wavesClearedB124(){return Math.max(0,(S?.b124Waves||1)-1)}
function minHpB124(){return 2*Math.max(1,Number(S?.weaponPower)||1)}
const spawnEnemyBeforeB124=spawnEnemy;
spawnEnemy=function(type){
  const before=enemies.length;spawnEnemyBeforeB124(type);
  for(let i=before;i<enemies.length;i++){const e=enemies[i];if(!e||e.type==='boss')continue;
    e.hp=Math.max(minHpB124(),e.hp*(1+B124_HP_PER_WAVE*wavesClearedB124()));e.maxHp=e.hp}
};
const resetBeforeB124hp=reset;
reset=function(){resetBeforeB124hp();if(S)S.b124Waves=0};
if(S&&S.b124Waves==null)S.b124Waves=0;

// ---- 5/6. Arena Merchant: themed, hold-to-confirm; between-stage holds take 0.9s ----
B117H_IDS.push('buySnackB118','leaveMerchantB118');
const B124_HOLD_MS=900;
const beginHoldBeforeB124=beginHoldB117h;
beginHoldB117h=function(btn,source){const ok=beginHoldBeforeB124(btn,source);if(ok&&holdB117h.ms===B117H_MS)holdB117h.ms=B124_HOLD_MS;return ok};
(function styleMerchantB124(){
  const style=document.createElement('style');
  style.textContent=`
#arenaMerchantB118 button{display:block;width:100%;margin-top:9px;padding:14px 12px;border-radius:14px;border:1px solid var(--line);background:#ffffff06;color:inherit;font:800 15px system-ui,sans-serif;text-align:center;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none}
#arenaMerchantB118 #buySnackB118{border-color:#ffd36f88;background:#ffd36f14;color:#ffe7a3}
#arenaMerchantB118 #buySnackB118:disabled{opacity:.45;cursor:default}
#arenaMerchantB118 button::after{content:'HOLD TO CONFIRM';display:block;margin-top:6px;font-size:10.5px;font-weight:800;letter-spacing:.08em;color:#ffd36f;opacity:.85}
#arenaMerchantB118 button.b117h-holding{border-color:#ffd36f;box-shadow:0 0 0 3px #ffd36f33}`;
  document.head.appendChild(style);
})();

// ---- 7. the meter is Fatigue, everywhere it is labelled ----
const renderTollGateBeforeB124=renderTollGateB115;
renderTollGateB115=function(...a){
  const out=renderTollGateBeforeB124(...a);
  for(const s of $('ranchGateBarsB115')?.querySelectorAll('span')||[])if(s.textContent.startsWith('Tired '))s.textContent='Fatigue '+s.textContent.slice(6);
  return out;
};
(function relabelQaFatigueB124(){
  const l=$('qa-fatigueB118v')?.closest('label');const t=l&&[...l.childNodes].find(n=>n.nodeType===3&&n.textContent.trim()==='Tired');if(t)t.textContent='Fatigue';
})();
