
// B115b Heat flow: HEAT regenerates over time; basic-attack kill combos add HEAT.
// Kills no longer feed HEAT: the outermost kill wrapper undoes base kill heat and Cosmic resonance heat.
// HEAT refills by itself 1 point (energy) every 3s, slowed by heatRegenNeedMultB115() (B115e's hunger hook),
// and only up to a ceiling: 20% of the meter, +1% per Constellation level bought past Beam's starting level.
// Regen waits while a skill is held, gathering, charging or Ascended, for 3s after any skill spends HEAT,
// and freezes with the run (pause, stage screen, run end). Only kills landed by the basic
// auto-attack chain: each keeps the chain alive 1.2s, every 10 kills raise the tier (1x..5x), and each kill
// adds `tier` HEAT energy. The chain reads "3x 24" at mid-right and flashes a new colour on each tier step.
const B115_HEAT_REGEN_SECONDS=3,B115_HEAT_REGEN_CEIL=20,B115_HEAT_REGEN_DELAY=3;
const B115B_COMBO_WINDOW=1.2;
const B115B_COMBO_STEP=10;
const B115B_COMBO_MAX_TIER=5;
function heatRegenNeedMultB115(){return 1}
function constellationLevelsB115b(){if(!S)return 1;let n=0;for(const id of OVER_ORDER)n+=overLevel(id);return Math.max(1,n)}
function heatRegenNeedB115b(){return Math.max(0,Number(heatRegenNeedMultB115())||0)}
// Effective regen in % of the meter per second (1 point per 3s, times the need multiplier).
function heatRegenRateB115(){return 100/heatCapacityB38()/B115_HEAT_REGEN_SECONDS*heatRegenNeedB115b()}
function heatRegenCeilB115(){return Math.min(100,B115_HEAT_REGEN_CEIL+constellationLevelsB115b()-1)}
function comboTierB115b(n){return n>0?Math.min(B115B_COMBO_MAX_TIER,Math.ceil(n/B115B_COMBO_STEP)):0}
function comboB115b(){if(S&&!S.b115Combo)S.b115Combo={count:0,timer:0,tier:0};return S?.b115Combo}
function heatLiveB115b(){return !!(S&&S.run&&!S.end&&!S.b39Paused&&!S.stagePending&&S.waveState!=='stage'&&!ranchWorldB100?.active)}
function heatSkillBusyB115b(){return !!(S&&(S.over>0||S.b93StormCharge||S.b94Charge||(S.b58AscTime||0)>0))}
// Beam and Ascended Pip fire through attack() too, so a "player" hit only counts outside them.
function basicHitB115b(source){return source==='player'&&!(S.over>0&&(S.overType==='beam'||S.overType==='pip'))&&!((S.b58AscTime||0)>0)}

const comboHudB115b=(()=>{
  const el=document.createElement('div');el.id='comboB115';el.className='b115out';el.setAttribute('aria-hidden','true');
  el.innerHTML='<b>1x</b> <span>0</span>';$('app')?.appendChild(el);return el;
})();
let comboFlashB115b=0;
function renderComboHudB115b(){
  const el=comboHudB115b,c=S?.b115Combo;if(!el)return;
  const show=!!(c&&c.count>0&&!S.end&&!S.stagePending&&!ranchWorldB100?.active);
  if(el.classList.contains('b115out')===show){el.classList.toggle('b115out',!show);el.setAttribute('aria-hidden',String(!show))}
  if(!show)return; // fading out keeps the last reading
  if(el.textContent!==`${c.tier}x ${c.count}`){el.firstChild.textContent=c.tier+'x';el.lastChild.textContent=String(c.count)}
  if(el.dataset.tier!==String(c.tier))el.dataset.tier=String(c.tier);
}
function flashComboHudB115b(){const el=comboHudB115b;if(!el)return;el.classList.remove('b115flash');void el.offsetWidth;el.classList.add('b115flash');comboFlashB115b=.6}
function resetComboB115b(){const c=comboB115b();if(c){c.count=0;c.timer=0;c.tier=0}comboFlashB115b=0;comboHudB115b?.classList.remove('b115flash');renderComboHudB115b()}

// Combo HEAT is energy: `tier` units against the current meter size. A pending charge's refund base grows too,
// so Nova/Gravity's per-tick recompute and a cancelled storm keep what the chain earned.
function addComboHeatB115b(tier){
  const add=tier/heatCapacityB38()*100;S.heat=clamp(S.heat+add,0,100);
  for(const ch of [S.b94Charge,S.b93StormCharge])if(ch&&Number.isFinite(ch.startHeat))ch.startHeat=clamp(ch.startHeat+add,0,100);
}
function comboKillB115b(){
  const c=comboB115b(),was=c.tier;
  c.count++;c.timer=B115B_COMBO_WINDOW;c.tier=comboTierB115b(c.count);
  addComboHeatB115b(c.tier);
  if(was>0&&c.tier>was)flashComboHudB115b();
  renderComboHudB115b();
}

// The hit records its own source on the enemy for exactly the duration of the hit, so only a kill made by
// this hit sees it; dash kills (kill() from updateEnemy) and chain kills never do.
const hitEnemyBeforeB115b=hitEnemy;
hitEnemy=function(e,power=1,source="player"){
  if(!S||!e)return hitEnemyBeforeB115b(e,power,source);
  const prev=e.b115Basic;e.b115Basic=basicHitB115b(source);
  try{return hitEnemyBeforeB115b(e,power,source)}finally{e.b115Basic=prev}
};
const killBeforeB115b=kill;
kill=function(e,chain=false){
  if(!S||!e)return killBeforeB115b(e,chain);
  const was=!!e.dead,heat=S.heat,basic=!chain&&e.b115Basic===true;
  killBeforeB115b(e,chain);
  if(S.heat>heat)S.heat=heat; // kill-fed HEAT (base kill, Cosmic resonance) is gone
  if(!was&&e.dead&&basic)comboKillB115b();
};

// Outermost update: the chain clock ticks before the frame (a kill this frame gets the full window) and regen
// lands after it, outside B25's heat-restore wrapper. Both clocks stop whenever the run is not live.
let comboStageB115b=null,regenClockB115b=0,regenWaitB115b=0,regenLastHeatB115b=null;
const updateBeforeB115b=update;
update=function(dt){
  if(!S)return updateBeforeB115b(dt);
  const step=Math.max(0,Number(dt)||0),c=comboB115b();
  if(comboStageB115b!==S.stage){comboStageB115b=S.stage;if(c.count)resetComboB115b()}
  if(c.count>0&&heatLiveB115b()&&(c.timer-=step)<=0)resetComboB115b();
  updateBeforeB115b(dt);
  regenB115b(step);
  if(comboFlashB115b>0&&(comboFlashB115b-=step)<=0)comboHudB115b?.classList.remove('b115flash');
  renderComboHudB115b();
};
// Regen ticks 1 point per 3s while under the ceiling; any skill use (held, charging, or HEAT spent this frame)
// holds it for 3s and restarts the tick.
// HEAT spent anywhere since the last frame (input handlers fire skills between frames) counts as skill use.
function regenB115b(step){
  const last=regenLastHeatB115b;regenLastHeatB115b=S.heat;
  if(!heatLiveB115b())return;
  if(heatSkillBusyB115b()||(last!==null&&S.heat<last-1e-9)){regenWaitB115b=B115_HEAT_REGEN_DELAY;regenClockB115b=0;return}
  if(regenWaitB115b>0){regenWaitB115b=Math.max(0,regenWaitB115b-step);return}
  const ceil=heatRegenCeilB115();if(S.heat>=ceil){regenClockB115b=0;return}
  regenClockB115b+=step*heatRegenNeedB115b();
  while(regenClockB115b>=B115_HEAT_REGEN_SECONDS-1e-9&&S.heat<ceil){regenClockB115b-=B115_HEAT_REGEN_SECONDS;S.heat=Math.min(ceil,S.heat+100/heatCapacityB38())}
  regenLastHeatB115b=S.heat;
}
const resetBeforeB115b=reset;
reset=function(){resetBeforeB115b();regenClockB115b=0;regenWaitB115b=0;regenLastHeatB115b=null;if(S){S.b115Combo={count:0,timer:0,tier:0};comboStageB115b=S.stage}resetComboB115b()};
const updateUIBeforeB115b=updateUI;
updateUI=function(){updateUIBeforeB115b();renderComboHudB115b()};

(function styleComboB115b(){
  const style=document.createElement('style');
  style.textContent=`
#comboB115{--b115c:#9ee7ff;position:absolute;z-index:9;right:max(18px,env(safe-area-inset-right));top:clamp(170px,50%,calc(100% - 150px));transform:translateY(-50%);transform-origin:100% 50%;display:flex;align-items:baseline;gap:6px;padding:5px 11px;border:1px solid var(--b115c);border-radius:14px;background:#070a11cc;backdrop-filter:blur(7px);color:var(--b115c);font-weight:950;letter-spacing:.04em;white-space:nowrap;pointer-events:none;text-shadow:0 0 10px var(--b115c);box-shadow:0 0 14px #0006;opacity:1;transition:opacity .45s ease,transform .45s ease,color .2s,border-color .2s}
#comboB115::before{content:"CHAIN";font-size:9px;letter-spacing:.12em;color:#ffffff99;align-self:center}#comboB115 b{font-size:22px;line-height:1}
#comboB115 span{font-size:14px;color:#f4f7ff;text-shadow:none;font-variant-numeric:tabular-nums}
#comboB115.b115out{opacity:0;transform:translate(12px,-50%)}
#comboB115[data-tier="2"]{--b115c:#9fffb0}#comboB115[data-tier="3"]{--b115c:#ffd36f}#comboB115[data-tier="4"]{--b115c:#ff9f6f}#comboB115[data-tier="5"]{--b115c:#ff6fd8}
#comboB115.b115flash{animation:b115pop .6s ease-out}
@keyframes b115pop{0%{transform:translateY(-50%) scale(1.6);background:#ffffff38;box-shadow:0 0 0 0 var(--b115c),0 0 34px var(--b115c)}100%{transform:translateY(-50%) scale(1);box-shadow:0 0 0 14px transparent,0 0 14px #0006}}
@media(max-width:560px){#comboB115{right:8px;top:clamp(236px,50%,calc(100% - 150px));padding:4px 9px;border-radius:12px}#comboB115 b{font-size:18px}#comboB115 span{font-size:12px}}
`;
  document.head.appendChild(style);
})();
if(S){S.b115Combo={count:0,timer:0,tier:0};comboStageB115b=S.stage}
renderComboHudB115b();
