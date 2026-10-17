
// B135 Between-stage polish. Feeding Pip an arena snack at the stage gate now takes the same press-and-hold as every
// other purchase (B117h). The Sound Lab's free mix auditions ("Hear … Mix" and their mute toggle) are removed.
B117H_IDS.push('eatSnackB118');
const renderTollGateBeforeB135=renderTollGateB115;
renderTollGateB115=function(...a){
 const out=renderTollGateBeforeB135(...a),eat=$('eatSnackB118');
 if(eat&&!eat.textContent.startsWith('HOLD · '))eat.textContent='HOLD · '+eat.textContent;
 return out;
};
(function hideAuditionsB135(){const s=document.createElement('style');s.textContent='#mixAuditionsB60{display:none!important}';document.head.appendChild(s)})();
const soundLabContinueBeforeB135=ensureSoundLabContinueB41;
ensureSoundLabContinueB41=function(...a){
 const out=soundLabContinueBeforeB135(...a),intro=$('pipSoundStep')?.querySelector(':scope > p');
 if(intro)intro.textContent='Pip Sounds change his voice and cues. Mix Layers add recurring background music. Hold cards to buy.';
 return out;
};
