
// B121 Heart Sense carry capacity: 3 at the start, +3 per Sense level through Lv 10 (33), then +1 per level.
// An upgrade never lowers capacity. Hearts still weigh 3; dirt never touches capacity.
function carryCapacityB121(lv){const l=Math.max(0,Math.floor(Number(lv)||0));return 3+Math.min(10,l)*3+Math.max(0,l-10)}
const applyPipPowerBeforeB121=applyPipPower;
applyPipPower=function(...a){const r=applyPipPowerBeforeB121(...a);if(S)S.pipCarryCapacity=carryCapacityB121(S.pipRangeLv);return r};
PIP_ABILITY_INFO.range.desc="+8px sense per level through Lv 10, then +2px (200px cap). Carry capacity starts at 3, +3 per level through Lv 10, then +1; hearts weigh 3.";
const pipAbilityEffectTextBeforeB121=pipAbilityEffectText;
pipAbilityEffectText=function(kind){
  if(kind!=="range")return pipAbilityEffectTextBeforeB121(kind);
  const next=(S.pipRangeLv||0)+1;
  return `${Math.round(S.pipDetectRange)} → ${heartRangeB60(next)}px sense · ${S.pipCarryCapacity} → ${carryCapacityB121(next)} capacity. Range growth slows after Lv 10.`;
};
if(S)applyPipPower();
