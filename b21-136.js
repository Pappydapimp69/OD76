
// B125 patch 6: rate of fire. The basic auto-attack fires 25% slower (with or without Pip). Star Power now
// speeds it up instead of adding damage: each level +11% fire rate (it no longer adds +0.11 weapon power;
// its +7px range stays). Shots are never closer than 0.12s apart. Beam and Ascended Pip are unchanged.
const B130_FIRE_SLOW=1.25,B130_RATE_PER_LV=.11,B130_MIN_CD=.12;
function fireRateMultB130(){return 1+B130_RATE_PER_LV*Math.max(0,S?.pipPowerLv||0)}
const applyPipPowerBeforeB130=applyPipPower;
applyPipPower=function(...a){
  const r=applyPipPowerBeforeB130(...a);if(!S)return r;
  const lv=S.pipLevel||1,pw=Math.max(0,S.pipPowerLv||0);
  S.weaponPower-=pw*.11;
  S.attackMax=Math.max(B130_MIN_CD,Math.max(.17,.33-(lv-1)*.014)*B130_FIRE_SLOW/fireRateMultB130());
  return r;
};
const attackBeforeB130=attack;
attack=function(){
  if(!S||(S.over>0&&(S.overType==='beam'||S.overType==='pip')))return attackBeforeB130();
  const before=shots.length,out=attackBeforeB130();
  // Without Pip, B06 uses a fixed 0.33s; slow it the same way and let Star Power speed it up too.
  if(shots.length>before&&!pipWithPlayer())S.attackCd=Math.max(B130_MIN_CD,.33*B130_FIRE_SLOW/fireRateMultB130());
  return out;
};
PIP_ABILITY_INFO.power.desc='Faster auto-fire: +11% fire rate per level, plus a little range.';
const pipAbilityEffectBeforeB130=pipAbilityEffectText;
pipAbilityEffectText=function(kind){if(kind==='power')return '+11% fire rate · +7px attack range';return pipAbilityEffectBeforeB130(kind)};
if(S)applyPipPower();
