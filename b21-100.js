
// B112 Uncapped heart skills: Swift Pip, Star Power and Guardian Glow can be bought forever,
// like Heart Sense. Every level still does something.
for(const kind of ["speed","power","guard"])PIP_ABILITY_INFO[kind].max=Infinity;
// Swift: each level keeps adding its increase past 8.
swiftSpeedB61=function(level,config=settingsB61){
 let speed=config.pipBase;
 for(let lv=1;lv<=Math.max(0,Math.floor(level));lv++)speed=config.swiftMode==="alternating"&&lv%2===0?speed*(1+config.swiftPercent/100):speed+config.swiftFlat;
 return speed;
};
// Star Power's damage already grows every level. Guardian Glow's shield recovery hits its old
// floors near level 13; past level 12 each level now trims recovery further with diminishing returns.
const B112_GUARD_KNEE=12,B112_GUARD_STEP=.05,B112_MIN_REGEN=.25;
function guardFactorB112(lv=S?.pipGuardLv||0){return 1/(1+B112_GUARD_STEP*Math.max(0,lv-B112_GUARD_KNEE))}
const applyPipPowerBeforeB112=applyPipPower;
applyPipPower=function(){
 applyPipPowerBeforeB112();
 const f=guardFactorB112();
 if(f<1){S.shieldRegenDelay=Math.max(B112_MIN_REGEN,S.shieldRegenDelay*f);S.shieldRegenRate=Math.max(B112_MIN_REGEN,S.shieldRegenRate*f)}
};
if(S)applyPipPower();
