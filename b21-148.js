
// B130 Fatigue on one scale + quick fixes. Farm fatigue now shares the arena maximum (fatigueMaxB118: 100 + 4 per
// best Pip level), so the same number carries between farm and arena with no clamp to 100. Every farm meter
// fills fatigue/max, and the farm bar grows 1% of its original length per full 15 over 100. Farm rules stay flat
// (rest −60, arena gate ≤60, tired 70, sleepy 40). Chop drops: shrub → Dewberry 70%, tree → Sunny Acorn 50%.
// Arena snacks heal 30 (B118_SNACK_HEAL). The stage-gate meter is labelled Fatigue.
const B130_GROW_STEP=15;

function fatiguePctB130(){return 100*arenaFatigueB118()/fatigueMaxB118()}
function fatigueGrowB130(){return 1+Math.floor(Math.max(0,fatigueMaxB118()-B118_BASE_FATIGUE)/B130_GROW_STEP)/100}

// ---- farm meters ----
(function styleFatigueB130(){const s=document.createElement('style');s.textContent='#ranchHudB100 .fat:not(.need){width:calc(54px*var(--fatGrowB130,1))}#ranchB99 .b99Fatigue{width:calc(100%*var(--fatGrowB130,1)/1.25)}@media(max-width:700px){#ranchHudB100 .fat:not(.need){width:calc(34px*var(--fatGrowB130,1))}}';document.head.appendChild(s)})();
function paintFatigueB130(){
 const pct=`${clamp(fatiguePctB130(),0,100)}%`,grow=String(fatigueGrowB130());
 const hud=$('ranchFatB100');if(hud){hud.style.width=pct;hud.parentElement.style.setProperty('--fatGrowB130',grow)}
 const old=$('ranchFatigueB99');if(old){old.style.width=pct;old.parentElement.style.setProperty('--fatGrowB130',grow)}
}
const renderRanchHudBeforeB130=renderRanchHudB100;
renderRanchHudB100=function(...a){const out=renderRanchHudBeforeB130(...a);paintFatigueB130();return out};
const renderRanchBeforeB130=renderRanchB99;
renderRanchB99=function(...a){const out=renderRanchBeforeB130(...a);paintFatigueB130();return out};

// ---- stage gate label ----
const renderTollGateBeforeB130=renderTollGateB115;
renderTollGateB115=function(...a){
 const out=renderTollGateBeforeB130(...a);
 for(const s of $('ranchGateBarsB115')?.querySelectorAll('span')||[])if(s.textContent.startsWith('Tired '))s.textContent='Fatigue '+s.textContent.slice(6);
 return out;
};

// ---- chop drops ----
const B130_DROP_CHANCE={tree:.5,shrub:.7};
function dropChanceB130(o){return o?.tree?B130_DROP_CHANCE.tree:B130_DROP_CHANCE.shrub}
