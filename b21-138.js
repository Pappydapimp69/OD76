
// B125 patch 8: the controller works on the RUN COMPLETE screen. It joins the B35 gamepad menu: stick or d-pad
// moves between Again and Pip Ranch, A presses the focused one (the usual focus ring shows which).
function endScreenVisibleB132(){const el=$('end');return !!(el&&!el.classList.contains('hidden'))}
const stageUpgradeVisibleBeforeB132=stageUpgradeVisibleB35;
stageUpgradeVisibleB35=function(){return endScreenVisibleB132()||stageUpgradeVisibleBeforeB132()};
const gamepadMenuButtonsBeforeB132=gamepadMenuButtonsB35;
gamepadMenuButtonsB35=function(){
  if(!endScreenVisibleB132())return gamepadMenuButtonsBeforeB132();
  return[...$('end').querySelectorAll('button')].filter(b=>!b.disabled&&b.style.display!=='none'&&!b.closest('.hidden,.stagehidden'));
};
(function styleEndFocusB132(){const s=document.createElement('style');s.textContent='#end button.gamepad-focus{outline:3px solid #7ed8ff;outline-offset:3px;box-shadow:0 0 0 5px #7ed8ff18,0 0 24px #7ed8ff44}';document.head.appendChild(s)})();
