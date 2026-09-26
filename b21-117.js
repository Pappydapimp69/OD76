// B117 Stage-end input guard (shipped inside B117). When a stage ends and the upgrade screen opens, every player
// input (pointer, keyboard, gamepad) is ignored for 0.7s so a button still being mashed from combat cannot
// buy, select or skip anything by accident.
let stageInputLockMsB117i=700; // tests set 0 to drive the screen synchronously
let stageInputLockB117i=0;
function stageInputLockedB117i(now=performance.now()){return now<stageInputLockB117i}
const openStageUpgradeBeforeB117i=openStageUpgrade;
openStageUpgrade=function(...a){stageInputLockB117i=stageInputLockMsB117i>0?performance.now()+stageInputLockMsB117i:0;return openStageUpgradeBeforeB117i(...a)};
for(const type of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click','keydown','keyup'])
  window.addEventListener(type,e=>{if(!stageInputLockedB117i())return;e.stopImmediatePropagation();if(e.cancelable&&type!=='keyup')e.preventDefault()},true);
const pressGamepadMenuABeforeB117i=pressGamepadMenuA_B35;
pressGamepadMenuA_B35=function(){if(!stageInputLockedB117i())return pressGamepadMenuABeforeB117i()};
const gamepadBackBeforeB117i=gamepadBackActionB35;
gamepadBackActionB35=function(){return stageInputLockedB117i()?false:gamepadBackBeforeB117i()};
const moveGamepadFocusBeforeB117i=moveGamepadMenuFocusB35;
moveGamepadMenuFocusB35=function(dx,dy){if(!stageInputLockedB117i())return moveGamepadFocusBeforeB117i(dx,dy)};
