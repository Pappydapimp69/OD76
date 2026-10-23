// B176 Shorter holds between stages and the survey's fatigue wording. Continue / Next stage / shop Enter-Skip-Leave
// take a 0.4s hold (was 0.9s); buys take 0.6s (was 0.9s, Sound Lab 1.8s); Ascend keeps the full 1.8s. A B117q
// repeat hold (0.7s) is never longer than these. The survey's gate-stop line reads "100% fatigue": arena
// fatigue is a share of fatigueMaxB118(), which grows past 100 with endurance.
const B176_NAV_MS=400,B176_BUY_MS=600,B176_NAV_IDS=B138_HOLD_IDS.filter(id=>id!=='b132Equip');
function holdMsB176(btn){return B176_NAV_IDS.includes(btn?.id)?B176_NAV_MS:btn?.id==='b132Main'&&/ascend/i.test(btn.textContent)?OVERDRIVE_HOLD_MS:B176_BUY_MS}
const beginHoldBeforeB176=beginHoldB117h;
beginHoldB117h=function(btn,source){const ok=beginHoldBeforeB176(btn,source);if(ok&&holdB117h.ms===B124_HOLD_MS)holdB117h.ms=holdMsB176(btn);else if(ok&&holdB117h.ms===B117Q_REPEAT_MS)holdB117h.ms=Math.min(B117Q_REPEAT_MS,holdMsB176(btn));return ok};
const beginSoundBeforeB176=beginSoundLabHoldB45;
beginSoundLabHoldB45=function(btn,...a){
 const r=beginSoundBeforeB176(btn,...a);
 if(soundLabHold.active&&soundLabHold.button===btn){const left=SOUNDLAB_HOLD_MS-(performance.now()-soundLabHold.start);if(left>B176_BUY_MS)soundLabHold.start-=left-B176_BUY_MS} // a B117q repeat may already be shorter
 return r;
};
const statsTextBeforeB176=statsTextB117;
statsTextB117=function(...a){return statsTextBeforeB176(...a).replace('Gate stops at 100 fatigue','Gate stops at 100% fatigue')};
const detailBeforeB176=detailB117;
detailB117=function(...a){return detailBeforeB176(...a).replace('stopped by 100 fatigue','stopped by 100% fatigue')};
