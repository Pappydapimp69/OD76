
// B138 Hold everywhere between stages. Every button that acts — Continue on each step, Equip, Next stage, Return to
// ranch, Enter/Skip/Exit shop — now needs the same press-and-hold as purchases (B117h). Picking a tile, More, ? and
// Show sounds stay taps. Code-driven clicks (gamepad Start shortcut, scripted checks) still pass for these buttons.
const B138_HOLD_IDS=['skipPipUpgrade','skipEmotionB28','continueAbilities','continuePipSounds','continueSoundLabB41','continueOverdrive','b132Equip','nextStageB99','returnRanchB99','enterMerchantB126','leaveMerchantB118','exitMerchantB126'];
for(const id of B138_HOLD_IDS)if(!B117H_IDS.includes(id))B117H_IDS.push(id);
const holdButtonBeforeB138=holdButtonB117h;
holdButtonB117h=function(el){
 const btn=holdButtonBeforeB138(el),ev=typeof window!=='undefined'?window.event:null;
 if(btn&&B138_HOLD_IDS.includes(btn.id)&&ev&&ev.type==='click'&&!ev.isTrusted)return null; // untrusted click = code, not a tap
 return btn;
};
(function styleB138(){const s=document.createElement('style');s.textContent=B138_HOLD_IDS.map(id=>'#'+id).join(',')+'{touch-action:none;user-select:none;-webkit-user-select:none}';document.head.appendChild(s)})();
