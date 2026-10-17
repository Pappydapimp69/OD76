function runFocusedChecksB134(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 test('B134 every Overdrive tile carries its full name, shown when the gamepad cursor is on it',()=>{
  ascB133=blankAscB133();saveAscB133();reset();S.run=true;S.stage=3;S.starPoints=14;S.stageEnding=true;openStageUpgrade();stageInputLockB117i=0;S.bossRewardPending=true;openOverdriveStep();
  for(const t of $('b132Strip').children)assert(t.querySelector('.b134Tip')?.textContent===OVERDRIVE_INFO[t.dataset.id].name,'tip missing on '+t.dataset.id);
  const tile=$('b132Strip').querySelector('[data-id="storm"]');focusGamepadButtonB35(tile);assert(tile.classList.contains('gamepad-focus'),'tile not focused');
  renderOverdriveStep();assert(tile.querySelector('.b134Tip'),'tip lost on re-render');
 });
 return out;
}
