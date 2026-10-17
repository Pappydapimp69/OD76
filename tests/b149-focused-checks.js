function runFocusedChecksB149(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const open=(seeds)=>{ascB133=blankAscB133();saveAscB133();reset();S.run=true;S.stage=3;S.prismSeeds=seeds;S.stageEnding=true;openStageUpgrade();stageInputLockB117i=0;$('pipSoundStep').classList.add('stagehidden');renderEmotionButtons?.();decorateDoneB149()};
 test('B149 with nothing affordable, Continue is a tap and the step says so',()=>{
  open(0);assert(stepOutOfOptionsB149('emotionStep'),'traits not out of options');assert(holdButtonB117h($('skipPipUpgrade'))===null,'continue still needs a hold');
  assert($('emotionStep').querySelector('.b149Banner')?.textContent.includes('Nothing left to buy'),'no banner');assert($('skipPipUpgrade').textContent.includes('Tap to continue'),'label');
 });
 test('B149 with something affordable, Continue keeps its hold and no banner',()=>{
  open(3);assert(!stepOutOfOptionsB149('emotionStep'),'had seeds but out of options');assert(holdButtonB117h($('skipPipUpgrade'))===$('skipPipUpgrade'),'hold lost');
  assert(!$('emotionStep').querySelector('.b149Banner')&&!$('skipPipUpgrade').textContent.includes('Tap to continue'),'banner/label stuck');
 });
 return out;
}
