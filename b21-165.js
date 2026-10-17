
// B148 Sound Lab bonuses are back. B136 hid the mix-pairing line (the bonus a sound gives with its mix) to save space,
// which hid what the sounds actually do. Each Pip Sound card now shows that bonus line instead of the flavour line,
// one line, ellipsised; Mix Layer cards show their pairings too.
(function styleB148(){const s=document.createElement('style');s.textContent=`
#pipSoundStep .b58Pairing,#audioStep .b58Pairing{display:-webkit-box!important;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-size:11px;line-height:1.3;color:#ffd36f;font-weight:700;margin:2px 0}
#pipSoundStep #pipSoundGrid .b53SoundEffect{display:none}
#audioStep .audiochoice{padding:9px 11px;min-height:0}#audioStep .audiochoice .note{font-size:18px;margin:0}#audioStep .audiochoice b{font-size:14px}
#audioStep .audiochoice .b53SoundEffect{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:11.5px}
@media(max-width:560px){#audioStep .audiochoice .b53SoundEffect{display:none}}`;document.head.appendChild(s)})();
