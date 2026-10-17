function runFocusedChecksB135(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{cancelHoldB117h()}};
 const gate=()=>{ascB133=blankAscB133();saveAscB133();ranchB99=Object.assign(ranchDefaultB99(),{fatigue:80});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();reset();S.run=true;S.stage=8;S.b118Snacks=2;S.stageEnding=true;openStageUpgrade();stageInputLockB117i=0;openRanchGateB99();renderTollGateB115()};
 test('B135 arena snacks need a completed hold; a tap feeds nothing',()=>{
  gate();const eat=$('eatSnackB118'),f=arenaFatigueB118();assert(eat&&eat.textContent.startsWith('HOLD · '),'label: '+eat?.textContent);
  eat.click();assert(arenaFatigueB118()===f&&S.b118Snacks===2,'tap fed Pip');
  assert(beginHoldB117h(eat,'test'),'hold did not start');tickHoldB117h(performance.now()+5000);
  assert(arenaFatigueB118()===f-B118_SNACK_HEAL&&S.b118Snacks===1,'hold did not feed');
 });
 test('B135 the Sound Lab no longer offers free mix auditions',()=>{
  reset();S.run=true;S.stage=2;S.stageEnding=true;openStageUpgrade();openPipSoundStepB26();openAudioStep();
  const a=$('mixAuditionsB60');assert(!a||[...document.querySelectorAll('style')].some(s=>s.textContent.includes('#mixAuditionsB60{display:none')),'auditions still shown');
  assert(!$('pipSoundStep').querySelector(':scope > p').textContent.includes('hear mixes'),'intro still mentions auditions');
 });
 return out;
}
