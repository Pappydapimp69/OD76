function runFocusedChecksB134(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 test('B134 every Overdrive tile carries its full name, shown when the gamepad cursor is on it',()=>{
  ascB133=blankAscB133();saveAscB133();reset();S.run=true;S.stage=3;S.starPoints=14;S.stageEnding=true;openStageUpgrade();stageInputLockB117i=0;S.bossRewardPending=true;openOverdriveStep();
  for(const t of $('b132Strip').children)assert(t.querySelector('.b134Tip')?.textContent===OVERDRIVE_INFO[t.dataset.id].name,'tip missing on '+t.dataset.id);
  const tile=$('b132Strip').querySelector('[data-id="storm"]');tile.classList.add('gamepad-focus'); // jsdom has no layout, so B35 can't pick it
  assert([...document.querySelectorAll('style')].some(x=>x.textContent.includes('.b132Tile.gamepad-focus .b134Tip')),'focus rule missing');
  renderOverdriveStep();assert(tile.querySelector('.b134Tip'),'tip lost on re-render');
 });
 return out;
}
