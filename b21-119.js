// B117 Survey ranch detail (shipped inside B117). Ranch time now splits into idle, clearing obstacles
// (Pip's chop/cut jobs), farming (till/water/harvest) and training (solo drill or a together mini-game), and each
// drill station counts its solo and together trainings. Same save; older saves just start these at 0.
const B117R_BUCKETS=['ranchIdle','ranchClear','ranchFarm','ranchTrain'];
const statsDefaultBeforeB117r=statsDefaultB117;
statsDefaultB117=function(){const s=statsDefaultBeforeB117r();for(const k of B117R_BUCKETS)s[k]=0;s.drillModes=drillModesDefaultB117r();return s};
function drillModesDefaultB117r(){const m={};for(const k in B99_DRILLS)m[k]={solo:0,together:0};return m}
const loadStatsBeforeB117r=loadStatsB117;
loadStatsB117=function(){
  const s=loadStatsBeforeB117r();let raw=null;try{raw=JSON.parse(localStorage.getItem(B117_KEY)||'null')}catch(_){}
  const n=x=>Number.isFinite(x)&&x>0?x:0;
  s.drillModes=drillModesDefaultB117r();
  if(raw&&raw.v===B117_V)for(const k in s.drillModes)s.drillModes[k]={solo:n(raw.drillModes?.[k]?.solo),together:n(raw.drillModes?.[k]?.together)};
  return s;
};
statsB117=loadStatsB117();
function ranchBucketB117r(w=ranchWorldB100){
  if(w.game||w.pip?.state==='drill')return 'ranchTrain';
  const a=w.b109Action;if(a)return a.kind==='chop'||a.kind==='cut'?'ranchClear':'ranchFarm';
  return 'ranchIdle';
}
const updateRanchBeforeB117r=updateRanchB100;
updateRanchB100=function(dt){
  const w=ranchWorldB100,t=Math.min(1,Math.max(0,Number(dt)||0));
  if(w.active&&t&&!document.hidden)statsB117[ranchBucketB117r(w)]+=t;
  return updateRanchBeforeB117r(dt);
};
function drillModeB117r(kind,mode){const m=statsB117.drillModes[kind];if(!m)return;m[mode]++;saveStatsB117()}
const soloDrillBeforeB117r=soloDrillB100;
soloDrillB100=function(kind,...a){const r=soloDrillBeforeB117r(kind,...a);if(r)drillModeB117r(kind,'solo');return r};
const startGameBeforeB117r=startGameB100;
startGameB100=function(kind,...a){const ok=startGameBeforeB117r(kind,...a);if(ok)drillModeB117r(kind,'together');return ok};
function secsB117r(sec){return sec<60?`${Math.round(sec)}s`:minutesB117(sec)}
function ranchTimeTextB117r(){const s=statsB117;return`idle ${secsB117r(s.ranchIdle)}, clearing obstacles ${secsB117r(s.ranchClear)}, farming ${secsB117r(s.ranchFarm)}, training ${secsB117r(s.ranchTrain)}`}
function drillModesTextB117r(){return Object.keys(B99_DRILLS).map(k=>{const m=statsB117.drillModes[k];return`${B99_DRILLS[k].name} ${m.solo} solo / ${m.together} together`}).join(', ')}
const statsTextBeforeB117r=statsTextB117;
statsTextB117=function(){return`${statsTextBeforeB117r()}\nRanch time: ${ranchTimeTextB117r()}\nDrills: ${drillModesTextB117r()}`};
const detailBeforeB117r=detailB117;
detailB117=function(){return`${detailBeforeB117r()} · ranch: ${ranchTimeTextB117r()}`};
