
// B145 Scent Hunt speed follows Pip's state. Base speed is still 90 + 4 per Swift level; fatigue now slows him
// smoothly (full speed rested → 60% at max fatigue, replacing the flat 60% once tired) and hunger does too (full
// speed at Food 60+ → 60% at Food 0).
const B145_MIN_FATIGUE=.6,B145_MIN_HUNGER=.6,B145_FED=60;
function huntFatigueMultB145(){return 1-(1-B145_MIN_FATIGUE)*clamp((ranchB99.fatigue||0)/fatigueMaxB118(),0,1)}
function huntHungerMultB145(){return B145_MIN_HUNGER+(1-B145_MIN_HUNGER)*clamp((ranchB99.hunger??100)/B145_FED,0,1)}
const huntSpeedBeforeB145=pipHuntSpeedB125;
pipHuntSpeedB125=function(...a){return huntSpeedBeforeB145(...a)*huntFatigueMultB145()*huntHungerMultB145()};
