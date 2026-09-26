// B117 Hold to confirm (shipped inside B117). Boss rewards, Pip traits and heart skills between stages now
// buy only after a completed hold, like Overdrive skills and the Sound Lab. Pointer, keyboard (Space/Enter)
// and gamepad A all hold; releasing early cancels with nothing spent. A plain tap only shows a hint.
const B117H_IDS=['bossReward0','bossReward1','bossReward2','upLove','upCompassion','upSupport','abilityRange','abilitySpeed','abilityPower','abilityGuard'];
const B117H_MS=OVERDRIVE_HOLD_MS;
const holdB117h={btn:null,source:null,start:0,raf:0,allow:false,suppressUntil:0};
function holdButtonB117h(el){const btn=el?.closest?.('button');return btn&&B117H_IDS.includes(btn.id)?btn:null}
function clearHoldVisualB117h(btn){if(!btn)return;btn.classList.remove('b117h-holding');btn.style.removeProperty('background');btn.style.removeProperty('background-image')}
function cancelHoldB117h(source=null){
  if(!holdB117h.btn||(source!==null&&source!==holdB117h.source))return false;
  cancelAnimationFrame(holdB117h.raf);clearHoldVisualB117h(holdB117h.btn);
  holdB117h.btn=null;holdB117h.source=null;holdB117h.start=0;holdB117h.raf=0;return true;
}
function completeHoldB117h(){
  const btn=holdB117h.btn;cancelHoldB117h();if(!btn||!stageUpgradeVisibleB35())return false;
  holdB117h.suppressUntil=performance.now()+700;holdB117h.allow=true;
  try{btn.click()}finally{holdB117h.allow=false}
  return true;
}
function tickHoldB117h(now=performance.now()){
  const btn=holdB117h.btn;if(!btn)return;
  if(!stageUpgradeVisibleB35()||btn.disabled){cancelHoldB117h();return}
  const p=clamp((now-holdB117h.start)/(holdB117h.ms||B117H_MS),0,1),pct=(p*100).toFixed(1)+'%';
  btn.style.background=`linear-gradient(90deg, rgba(255,211,111,.34) 0%, rgba(255,211,111,.34) ${pct}, rgba(255,255,255,.04) ${pct}, rgba(255,255,255,.04) 100%)`;
  if(p>=1){completeHoldB117h();return}
  holdB117h.raf=requestAnimationFrame(()=>tickHoldB117h());
}
function beginHoldB117h(btn,source){
  if(!btn||btn.disabled||holdB117h.btn||!stageUpgradeVisibleB35())return false;
  holdB117h.btn=btn;holdB117h.source=source;holdB117h.start=performance.now();btn.classList.add('b117h-holding');tickHoldB117h();return true;
}
// Every click on these buttons must come from a finished hold.
window.addEventListener('click',e=>{
  const btn=holdButtonB117h(e.target);if(!btn||holdB117h.allow)return;
  e.stopImmediatePropagation();e.preventDefault();
  if(performance.now()>=holdB117h.suppressUntil&&stageUpgradeVisibleB35())showPipMessage('hold to confirm this upgrade.',true);
},true);
window.addEventListener('pointerdown',e=>{
  const btn=holdButtonB117h(e.target);if(!btn||(e.button!==undefined&&e.button!==0))return;
  if(beginHoldB117h(btn,e.pointerId)){try{btn.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()}
},true);
for(const type of ['pointerup','pointercancel','lostpointercapture'])window.addEventListener(type,e=>cancelHoldB117h(e.pointerId),true);
window.addEventListener('keydown',e=>{
  if(e.repeat||(e.key!==' '&&e.key!=='Enter'))return;const btn=holdButtonB117h(document.activeElement);if(!btn)return;
  e.preventDefault();beginHoldB117h(btn,'keyboard');
},true);
window.addEventListener('keyup',e=>{if((e.key===' '||e.key==='Enter')&&holdB117h.source==='keyboard'){e.preventDefault();cancelHoldB117h('keyboard')}},true);
const pressGamepadMenuABeforeB117h=pressGamepadMenuA_B35;
pressGamepadMenuA_B35=function(){
  const btn=holdButtonB117h(ensureGamepadMenuFocusB35());
  if(btn){beginHoldB117h(btn,'gamepad');return}
  pressGamepadMenuABeforeB117h();
};
const releaseGamepadMenuABeforeB117h=releaseGamepadMenuA_B35;
releaseGamepadMenuA_B35=function(){if(cancelHoldB117h('gamepad'))return;releaseGamepadMenuABeforeB117h()};
const clearGamepadMenuBeforeB117h=clearGamepadMenuB35;
clearGamepadMenuB35=function(){cancelHoldB117h('gamepad');clearGamepadMenuBeforeB117h()};
// Cards read as name, then a small level/cost line, description and the hold hint across the full width.
function tidyCardsB117h(){
  for(const id of B117H_IDS){
    const btn=$(id),b=btn?.querySelector(':scope > b');if(!b||btn.querySelector('.b117meta'))continue;
    const t=b.textContent,i=t.indexOf(' · ');if(i<0)continue;
    b.textContent=t.slice(0,i);b.insertAdjacentHTML('afterend',`<span class="b117meta">${t.slice(i+3)}</span>`);btn.classList.add('b117card');
  }
}
const renderEmotionBeforeB117h=renderEmotionButtons;
renderEmotionButtons=function(...a){const r=renderEmotionBeforeB117h(...a);tidyCardsB117h();return r};
const renderAbilityShopBeforeB117h=renderAbilityShop;
renderAbilityShop=function(...a){const r=renderAbilityShopBeforeB117h(...a);tidyCardsB117h();return r};
const renderBossRewardBeforeB117h=renderBossRewardStep;
renderBossRewardStep=function(...a){const r=renderBossRewardBeforeB117h(...a);tidyCardsB117h();return r};
(function styleHoldB117h(){
  const style=document.createElement('style');
  const ids=B117H_IDS.map(id=>'#stageUp #'+id);
  style.textContent=`#stageUp .b117h-holding{border-color:#ffd36f;box-shadow:0 0 0 3px #ffd36f33}
${B117H_IDS.map(id=>'#'+id).join(',')}{touch-action:none;user-select:none;-webkit-user-select:none}
${ids.map(s=>s+'::after').join(',')}{content:'HOLD TO CONFIRM';grid-column:1 / -1;align-self:end;margin-top:10px;font-size:10.5px;font-weight:800;letter-spacing:.08em;color:#ffd36f;opacity:.85}
#stageUp .upgrade.b117card{grid-template-rows:auto auto 1fr auto}
#stageUp .upgrade.b117card b{font-size:clamp(17px,1.9vw,21px)}
#stageUp .upgrade.b117card .b117meta{grid-column:1 / -1;grid-row:2;margin-top:8px;font-size:12.5px;font-weight:800;letter-spacing:.03em;color:#ffd36f}
#stageUp .upgrade.b117card .small{grid-row:3}
${ids.map(s=>s+'.b117card::after').join(',')}{grid-row:4}`;
  document.head.appendChild(style);
})();
