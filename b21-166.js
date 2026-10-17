
// B149 "All done here" between stages. When a step has nothing left the player can afford (Traits, Hearts, Sound Lab,
// Overdrive), its Continue is a plain tap instead of press-and-hold, and the step says so: a gold "Nothing left to buy
// here" banner above Continue, the option cards dimmed, and Continue reading "Tap to continue". As soon as something
// is affordable again the hold comes back.
const B149_STEPS={emotionStep:'skipPipUpgrade',abilityStep:'continueAbilities',pipSoundStep:'continueSoundLabB41',overdriveStep:'continueOverdrive'};
function stepOutOfOptionsB149(step){
 const el=$(step);if(!el||el.classList.contains('stagehidden')||!S)return false;
 if(step==='emotionStep')return !['upLove','upCompassion','upSupport'].some(id=>$(id)?.classList.contains('ready'));
 if(step==='abilityStep')return ![...el.querySelectorAll('.abilitygrid button')].some(b=>b.classList.contains('ready'));
 if(step==='pipSoundStep')return ![...el.querySelectorAll('button[data-sound-hold-kind]')].some(b=>!b.classList.contains('b53SoundBlocked')&&b.getAttribute('aria-disabled')!=='true'&&!b.disabled&&!/MAX|ACTIVE|EQUIPPED|OWNED|NEEDS /.test(b.textContent));
 if(step==='overdriveStep')return typeof b132Afford==='function'&&!OVER_ORDER.some(id=>b132Afford(id));
 return false;
}
function continueIsTapB149(id){const step=Object.keys(B149_STEPS).find(k=>B149_STEPS[k]===id);return !!step&&stepOutOfOptionsB149(step)}
const holdButtonBeforeB149=holdButtonB117h;
holdButtonB117h=function(el){const btn=holdButtonBeforeB149(el);return btn&&continueIsTapB149(btn.id)?null:btn};
function decorateDoneB149(){
 const up=$('stageUp');if(!up||up.classList.contains('hidden'))return;
 for(const [step,cid] of Object.entries(B149_STEPS)){
  const el=$(step);if(!el)continue;const done=stepOutOfOptionsB149(step),c=$(cid);
  el.classList.toggle('b149Done',done);
  let tag=el.querySelector(':scope .b149Banner');
  if(done&&c){if(!tag){tag=document.createElement('div');tag.className='b149Banner';tag.textContent='✓ Nothing left to buy here';c.insertAdjacentElement('beforebegin',tag)}
   if(!c.dataset.b149Label)c.dataset.b149Label=c.textContent;if(c.textContent!=='Tap to continue ›')c.textContent='Tap to continue ›'}
  else{if(tag)tag.remove();if(c&&c.dataset.b149Label){c.textContent=c.dataset.b149Label;delete c.dataset.b149Label}}
 }
}
setInterval(decorateDoneB149,200);
const openStageBeforeB149=openStageUpgrade;
openStageUpgrade=function(...a){const r=openStageBeforeB149(...a);decorateDoneB149();return r};
(function styleB149(){const s=document.createElement('style');s.textContent=`
.b149Banner{margin:8px 0 6px;padding:8px 12px;border-radius:10px;background:#ffd36f1a;border:1px solid #ffd36f66;color:#ffd36f;font-weight:800;font-size:13px;text-align:center}
.b149Done .upgradegrid,.b149Done .abilitygrid,.b149Done #pipSoundGrid,.b149Done #audioStep .audiochoice,.b149Done #b132Strip{opacity:.55}
#pipSoundStep.b136Empty .b149Banner{display:none}
.b149Done #skipPipUpgrade,.b149Done #continueAbilities,.b149Done #continueSoundLabB41,.b149Done #continueOverdrive{border-color:#8fe3b8;box-shadow:0 0 0 3px #8fe3b833,0 0 18px #8fe3b844}`;document.head.appendChild(s)})();
