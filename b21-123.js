// B117 Quick repeat holds (shipped inside B117). Between stages, holding the same upgrade again right after it
// confirmed takes only 0.7s. Any other input (another card, another key, a gamepad move or back, a new stage)
// resets it to the full hold. Covers Overdrive skills, the Sound Lab, boss rewards, Pip traits and heart skills.
const B117Q_REPEAT_MS=700;
let repeatKeyB117q=null;
function holdKeyB117q(el){
  const btn=el?.closest?.('button');if(!btn)return null;
  if(B117H_IDS.includes(btn.id))return 'h:'+btn.id;
  const m=/^overChoice(\d+)$/.exec(btn.id||'');if(m)return OVER_ORDER[Number(m[1])]?'o:'+OVER_ORDER[Number(m[1])]:null;
  if(btn.dataset?.soundHoldKind)return `s:${btn.dataset.soundHoldKind}:${btn.dataset.soundHoldId}`;
  return null;
}
function resetRepeatB117q(){repeatKeyB117q=null}
// ---- a confirmed hold arms the repeat ----
const completeHoldBeforeB117q=completeHoldB117h;
completeHoldB117h=function(...a){const btn=holdB117h.btn,r=completeHoldBeforeB117q(...a);repeatKeyB117q=r&&btn?'h:'+btn.id:null;return r};
const completeOverBeforeB117q=completeOverdriveHoldAction;
completeOverdriveHoldAction=function(id,...a){const r=completeOverBeforeB117q(id,...a);repeatKeyB117q=r?'o:'+id:null;return r};
const completeSoundBeforeB117q=completeSoundLabHoldB45;
completeSoundLabHoldB45=function(kind,id,...a){const r=completeSoundBeforeB117q(kind,id,...a);repeatKeyB117q=r?`s:${kind}:${id}`:null;return r};
// ---- the next hold on the same card is short ----
const beginHoldBeforeB117q=beginHoldB117h;
beginHoldB117h=function(btn,source){holdB117h.ms=repeatKeyB117q&&repeatKeyB117q==='h:'+btn?.id?B117Q_REPEAT_MS:B117H_MS;return beginHoldBeforeB117q(btn,source)};
function shortenOverB117q(id){if(overHold.active&&overHold.id===id&&repeatKeyB117q==='o:'+id)overHold.start-=OVERDRIVE_HOLD_MS-B117Q_REPEAT_MS}
const beginOverBeforeB117q=beginOverdriveHold;
beginOverdriveHold=function(id,...a){const r=beginOverBeforeB117q(id,...a);shortenOverB117q(id);return r};
const beginPadOverBeforeB117q=beginGamepadOverdriveHoldB35;
beginGamepadOverdriveHoldB35=function(id,...a){const r=beginPadOverBeforeB117q(id,...a);shortenOverB117q(id);return r};
const beginSoundBeforeB117q=beginSoundLabHoldB45;
beginSoundLabHoldB45=function(btn,...a){
  const r=beginSoundBeforeB117q(btn,...a);
  if(soundLabHold.active&&soundLabHold.button===btn&&repeatKeyB117q&&repeatKeyB117q===holdKeyB117q(btn))soundLabHold.start-=SOUNDLAB_HOLD_MS-B117Q_REPEAT_MS;
  return r;
};
// ---- any other input resets ----
window.addEventListener('pointerdown',e=>{if(holdKeyB117q(e.target)!==repeatKeyB117q)resetRepeatB117q()},true);
window.addEventListener('keydown',e=>{if(e.repeat)return;if((e.key!==' '&&e.key!=='Enter')||holdKeyB117q(document.activeElement)!==repeatKeyB117q)resetRepeatB117q()},true);
const padABeforeB117q=pressGamepadMenuA_B35;
pressGamepadMenuA_B35=function(...a){if(holdKeyB117q(ensureGamepadMenuFocusB35())!==repeatKeyB117q)resetRepeatB117q();return padABeforeB117q(...a)};
const padMoveBeforeB117q=moveGamepadMenuFocusB35;
moveGamepadMenuFocusB35=function(...a){resetRepeatB117q();return padMoveBeforeB117q(...a)};
const padBackBeforeB117q=gamepadBackActionB35;
gamepadBackActionB35=function(...a){resetRepeatB117q();return padBackBeforeB117q(...a)};
const openStageBeforeB117q=openStageUpgrade;
openStageUpgrade=function(...a){resetRepeatB117q();return openStageBeforeB117q(...a)};
