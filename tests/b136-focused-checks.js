function runFocusedChecksB136(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{cancelHoldB117h();tone=realTone;burstTone=realBurst}};
 const realTone=tone,realBurst=burstTone;let heard=[];
 const spy=()=>{heard=[];tone=(f)=>heard.push('tone'+Math.round(f));burstTone=(b)=>heard.push('burst'+b);for(const k in b136Last)b136Last[k]=0};
 const open=()=>{ascB133=blankAscB133();saveAscB133();ranchB99=Object.assign(ranchDefaultB99(),{fatigue:20});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();reset();S.run=true;S.stage=3;S.prismSeeds=3;S.heartCurrency=60;S.audioEnabled=true;S.stageEnding=true;openStageUpgrade();stageInputLockB117i=0;$('pipSoundStep').classList.add('stagehidden')}; // an earlier check left the lab open
 test('B136 the eyebrow counts the steps of this break',()=>{
  open();assert(stepsB136().join()==='Traits,Hearts,Sound Lab,Head out','steps '+stepsB136());
  S.bossRewardPending=true;assert(stepsB136().length===6,'boss steps');S.bossRewardPending=false;S.stage=7;assert(stepsB136().includes('Merchant'),'merchant step');
 });
 test('B136/B138 shop buttons and purchases all need a hold',()=>{
  for(const id of ['enterMerchantB126','leaveMerchantB118','exitMerchantB126'])assert(B117H_IDS.includes(id),id+' is a tap (B138: hold everywhere)');
  assert(B117H_IDS.includes('buySnackB118')&&B117H_IDS.includes('eatSnackB118'),'purchases lost their hold');
 });
 test('B136 Sound Lab folds to one line only when nothing is affordable',()=>{
  open();openPipSoundStepB26();openAudioStep();decorateStageB136();
  const lab=$('pipSoundStep');assert(lab.classList.contains('b136Empty'),'did not fold with 0 notes');
  $('b136ShowSounds').click();assert(!lab.classList.contains('b136Empty'),'show sounds did not unfold');
 });
 test('B136 Traits and Hearts show only their currency line',()=>{
  open();decorateStageB136();assert($('stageText').textContent==='◆ 3 Prism Seeds','traits: '+$('stageText').textContent);
  openAbilityStep();decorateStageB136();assert($('abilityBalance').textContent==='♥ 60 Heart Bits','hearts: '+$('abilityBalance').textContent);
 });
 test('B136 shared sounds: hold start, a silent purchase gains the burst, continue ticks',()=>{
  open();S.bossRewardPending=true;openBossRewardStep();spy();const b=$('bossReward0');
  assert(beginHoldB117h(b,'test'),'hold');assert(heard.includes('tone440'),'no hold sound: '+heard);
  tickHoldB117h(performance.now()+5000);assert(heard.includes('burst420'),'no purchase burst: '+heard);
  spy();open();$('skipPipUpgrade').click();assert(heard.includes('tone660'),'no continue tick: '+heard);
  spy();S.audioEnabled=false;uiSoundB136('next');assert(!heard.length,'sound with audio off');
 });
 return out;
}
