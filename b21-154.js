
// B136 Between-stage declutter + one set of UI sounds. Traits, Hearts and Boss Bond cards become compact tiles you
// still hold to buy (name, level/cost, a two-line effect); the repeated "Stage complete" eyebrow becomes a step
// counter; the Sound Lab drops its stats panel for chips in the title, shows one effect line per card, and folds to a
// single line when nothing there is affordable. Entering/skipping/leaving the shop are plain taps; the gate's cursor
// starts on Next stage. Sounds: pad/keyboard focus tick, hold start, purchase burst, refusal, continue — each with its
// own cooldown, pitched high enough for phone speakers, silent when audio is off.
B117H_IDS.splice(0,B117H_IDS.length,...B117H_IDS.filter(id=>!['enterMerchantB126','leaveMerchantB118','exitMerchantB126'].includes(id)));

// ---- sounds ----
const B136_SFX={
 focus:{cd:70,play:()=>tone(720,.035,.006,'triangle')},
 hold:{cd:120,play:()=>tone(440,.07,.01,'sine')},
 buy:{cd:120,play:()=>burstTone(420,4)},
 refuse:{cd:200,play:()=>{tone(520,.06,.012,'square');setTimeout(()=>tone(360,.08,.012,'square'),70)}},
 next:{cd:150,play:()=>tone(660,.06,.012,'sine')}
};
const b136Last={};
function uiSoundB136(kind){
 const s=B136_SFX[kind],now=performance.now();if(!s||!S?.audioEnabled)return;
 if(now-(b136Last[kind]||0)<s.cd)return;b136Last[kind]=now;try{s.play()}catch(_){}
}
const padMoveBeforeB136=moveGamepadMenuFocusB35;
moveGamepadMenuFocusB35=function(...a){const f=gamepadMenuB35.focus,r=padMoveBeforeB136(...a);if(gamepadMenuB35.focus&&gamepadMenuB35.focus!==f)uiSoundB136('focus');return r};
const beginHoldBeforeB136=beginHoldB117h;
beginHoldB117h=function(...a){const r=beginHoldBeforeB136(...a);if(r)uiSoundB136('hold');return r};
// purchases whose handlers are silent today get the shared burst (Traits/Hearts already burst through praise())
const B136_SILENT_BUYS=['b132Main','bossReward0','bossReward1','bossReward2','buySnackB118','eatSnackB118','buyDustB126'];
const completeHoldBeforeB136=completeHoldB117h;
completeHoldB117h=function(...a){const id=holdB117h.btn?.id,r=completeHoldBeforeB136(...a);if(r&&B136_SILENT_BUYS.includes(id))uiSoundB136('buy');return r};
const B136_NEXT=['skipEmotionB28','skipPipUpgrade','continueAbilities','continuePipSounds','continueSoundLabB41','continueOverdrive','nextStageB99','returnRanchB99','leaveMerchantB118','enterMerchantB126','exitMerchantB126'];
document.addEventListener('click',e=>{
 const b=e.target.closest?.('#stageUp button');if(!b)return;
 if(B136_NEXT.includes(b.id))uiSoundB136('next');else if(b.id==='b132Why')uiSoundB136('refuse');
});
const soundOpenBeforeB136=openPipSoundStepB26;
openPipSoundStepB26=function(...a){const t=burstTone;burstTone=()=>{};try{return soundOpenBeforeB136(...a)}finally{burstTone=t}}; // no step-open sound

// ---- step counter replaces the repeated eyebrow ----
function stepsB136(){
 const list=['Traits','Hearts','Sound Lab'];
 if(S?.bossRewardPending)list.push('Overdrive','Boss Bond');
 if(typeof merchantStageB118==='function'&&merchantStageB118())list.push('Merchant');
 list.push('Head out');return list;
}
const B136_STEP_EL={emotionStep:'Traits',abilityStep:'Hearts',pipSoundStep:'Sound Lab',overdriveStep:'Overdrive',bossRewardStep:'Boss Bond',arenaMerchantB118:'Merchant',ranchGateStepB99:'Head out'};
function decorateStageB136(){
 const up=$('stageUp');if(!up||up.classList.contains('hidden'))return;
 const card=up.querySelector('.card'),kick=card?.querySelector(':scope > .kicker');
 const open=Object.keys(B136_STEP_EL).reverse().find(id=>{const el=$(id);return el&&!el.classList.contains('stagehidden')}); // later steps win
 if(kick&&open){const list=stepsB136(),name=B136_STEP_EL[open],i=list.indexOf(name);kick.textContent=i>=0?`Stage ${S.stage} clear · Step ${i+1} of ${list.length} · ${name}`:`Stage ${S.stage} clear`}
 // Traits: currency only
 const st=$('stageText');if(st&&open==='emotionStep'){const t=`◆ ${S.prismSeeds||0} Prism Seed${S.prismSeeds===1?'':'s'}`;if(st.textContent!==t)st.textContent=t}
 // Hearts: currency only
 const ab=$('abilityBalance');if(ab&&open==='abilityStep'){const t=`♥ ${S.heartCurrency||0} Heart Bits`;if(ab.textContent!==t)ab.textContent=t}
 // Sound Lab: chips in the title, fold when nothing is affordable
 if(open==='pipSoundStep'){
  const h=$('pipSoundStep').querySelector(':scope > h2');
  const notes=$('soundLabNotesB53')?.textContent||'0',sc=$('soundLabSoundChoicesB53')?.textContent||'0',mc=$('soundLabMixChoicesB53')?.textContent||'0';
  if(h){let chip=h.querySelector('.b136Chips');if(!chip){chip=document.createElement('span');chip.className='b136Chips';h.appendChild(chip)}const t=`♪ ${notes} · ${sc} sound · ${mc} mix`;if(chip.textContent!==t)chip.textContent=t}
  const lab=$('pipSoundStep');lab.classList.remove('b136Empty'); // B159: unfold to measure; folded cards have no offsetParent, so it never unfolded again
  const buyable=[...lab.querySelectorAll('button[data-sound-hold-kind],#audioStep button[id^="audioChoice"]')].some(b=>!b.classList.contains('b53SoundBlocked')&&b.getAttribute('aria-disabled')!=='true'&&!b.disabled&&b.offsetParent!==null&&!/MAX|ACTIVE|EQUIPPED|OWNED|NEEDS /.test(b.textContent));
  lab.classList.toggle('b136Empty',!buyable&&!lab.classList.contains('b136ShowAll'));
  let line=$('b136EmptyLine');
  if(!line){line=document.createElement('p');line.id='b136EmptyLine';line.innerHTML='<span>Nothing to buy here yet. Notes arrive as Pip levels up.</span> <button type="button" id="b136ShowSounds">Show sounds</button>';lab.querySelector(':scope > h2').insertAdjacentElement('afterend',line);
   $('b136ShowSounds').addEventListener('click',()=>{lab.classList.add('b136ShowAll');decorateStageB136()})}
 }
}
setInterval(decorateStageB136,200);
const openStageBeforeB136=openStageUpgrade;
openStageUpgrade=function(...a){const r=openStageBeforeB136(...a);$('pipSoundStep')?.classList.remove('b136ShowAll');decorateStageB136();return r};
const gateFocusBeforeB136=openRanchGateB99;
openRanchGateB99=function(...a){const r=gateFocusBeforeB136(...a);const n=$('nextStageB99');if(n&&!n.disabled&&stageUpgradeVisibleB35())focusGamepadButtonB35(n);return r};

// ---- compact tiles ----
(function styleB136(){const s=document.createElement('style');s.textContent=`
#stageUp .card>.kicker{letter-spacing:.12em}
#emotionStep #stageBond,#abilityStep>p{display:none}
#abilityStep #abilityBalance{margin:2px 0 8px;font-weight:800;color:#ffd36f;font-size:14px}
#arenaMerchantB118 #enterMerchantB126::after,#arenaMerchantB118 #leaveMerchantB118::after,#arenaMerchantB118 #exitMerchantB126::after{content:none;display:none}
#emotionStep #stageText{margin:2px 0 8px;font-weight:800;color:#ffd36f}
#emotionStep .upgradegrid,#abilityStep .abilitygrid,#bossRewardStep .upgradegrid,#bossRewardStep .bossgrid{gap:8px}
#stageUp #emotionStep .upgrade.b117card,#stageUp #abilityStep .upgrade.b117card,#stageUp #bossRewardStep .upgrade.b117card{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto auto;column-gap:10px;row-gap:3px;align-content:start;text-align:left;padding:11px 12px;min-height:0}
#stageUp #emotionStep .upgrade.b117card .heart,#stageUp #abilityStep .upgrade.b117card .heart,#stageUp #bossRewardStep .upgrade.b117card .heart{grid-column:1;grid-row:1/3;font-size:22px;margin:0;align-self:center;width:auto;height:auto}
#stageUp #emotionStep .upgrade.b117card b,#stageUp #abilityStep .upgrade.b117card b,#stageUp #bossRewardStep .upgrade.b117card b,#stageUp #emotionStep .upgrade.b117card .b117meta,#stageUp #abilityStep .upgrade.b117card .b117meta,#stageUp #bossRewardStep .upgrade.b117card .b117meta{grid-column:2}
#stageUp #emotionStep .upgrade.b117card b,#stageUp #abilityStep .upgrade.b117card b,#stageUp #bossRewardStep .upgrade.b117card b{font-size:15px;line-height:1.2}
#stageUp #emotionStep .upgrade.b117card .b117meta,#stageUp #abilityStep .upgrade.b117card .b117meta,#stageUp #bossRewardStep .upgrade.b117card .b117meta{font-size:11px;margin:0}
#stageUp #emotionStep .upgrade.b117card .small,#stageUp #abilityStep .upgrade.b117card .small,#stageUp #bossRewardStep .upgrade.b117card .small{grid-column:1/-1;font-size:12px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:2px 0 0}
#stageUp #emotionStep .upgrade.b117card::after,#stageUp #abilityStep .upgrade.b117card::after,#stageUp #bossRewardStep .upgrade.b117card::after{grid-column:1/-1;grid-row:auto;font-size:10px;margin-top:4px}
#soundLabWalletB53,#pipSoundBalance{display:none!important}
#pipSoundStep>h2 .b136Chips{display:inline-block;margin-left:10px;font-size:13px;font-weight:800;color:#ffd36f;vertical-align:middle;letter-spacing:.02em}
#pipSoundStep>p:not(#b136EmptyLine){display:none}
#pipSoundStep .upgrade{padding:9px 11px;min-height:0}
#pipSoundStep .upgrade b{font-size:14px}
#pipSoundStep .upgrade .heart{font-size:18px}
#pipSoundStep .upgrade .small{font-size:11.5px;line-height:1.3}
#pipSoundStep .b58Pairing,#audioStep .b58Pairing{display:none}
#pipSoundStep .b53SoundEffect{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
#audioStep>p{display:none}#audioStep>h2{font-size:18px;margin:10px 0 6px}
#audioStep .upgrade .small{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#b136EmptyLine{display:none;margin:8px 0;color:#9aa6b8;font-size:13px}
#b136EmptyLine button{display:inline;width:auto;min-height:0;padding:4px 8px;margin:0 0 0 4px;border:0;background:none;color:#7ed8ff;font:700 13px system-ui}
#pipSoundStep.b136Empty #b136EmptyLine{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px}
#stageUp #b136EmptyLine #b136ShowSounds{position:static;flex:none}
#pipSoundStep.b136Empty #pipSoundSectionTitleB53,#pipSoundStep.b136Empty #pipSoundGrid,#pipSoundStep.b136Empty #audioStep{display:none!important}
@media(max-width:560px){
 #emotionStep .upgradegrid,#bossRewardStep .upgradegrid{grid-template-columns:1fr}
 #abilityStep .abilitygrid{grid-template-columns:1fr 1fr}
 #stageUp #emotionStep .upgrade.b117card,#stageUp #abilityStep .upgrade.b117card,#stageUp #bossRewardStep .upgrade.b117card{padding:9px 10px}
 #pipSoundStep .upgrade .small{font-size:11px}
}`;document.head.appendChild(s)})();
