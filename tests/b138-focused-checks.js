function runFocusedChecksB138(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{cancelHoldB117h()}};
 const open=()=>{ascB133=blankAscB133();saveAscB133();ranchB99=Object.assign(ranchDefaultB99(),{fatigue:20});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();reset();S.run=true;S.stage=3;S.prismSeeds=3;S.stageEnding=true;openStageUpgrade();stageInputLockB117i=0;$('pipSoundStep').classList.add('stagehidden')};
 test('B138 every acting button between stages is in the hold set',()=>{for(const id of B138_HOLD_IDS)assert(B117H_IDS.includes(id),id)});
 test('B138 Continue is a hold button; a completed hold continues',()=>{
  open();const c=$('skipPipUpgrade');assert(c&&!$('emotionStep').classList.contains('stagehidden'),'traits step');
  assert(holdButtonB117h(c)===c,'continue is not a hold button outside a scripted click');
  assert(beginHoldB117h(c,'test'),'hold did not start');tickHoldB117h(performance.now()+5000);
  assert($('emotionStep').classList.contains('stagehidden'),'hold did not continue');
 });
 return out;
}
