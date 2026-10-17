function runFocusedChecksB132(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{cancelHoldB117h()}};
 const open=(setup)=>{ranchB99=Object.assign(ranchDefaultB99(),{fatigue:0});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();reset();S.run=true;S.stage=3;S.starPoints=14;
  S.stageEnding=true;openStageUpgrade();S.bossRewardPending=true;openOverdriveStep();stageInputLockB117i=0;if(setup)setup();renderOverdriveStep()};
 const hold=btn=>{assert(btn,'no button to hold');assert(beginHoldB117h(btn,'test'),'hold did not start');tickHoldB117h(performance.now()+5000)};
 test('B132 the Overdrive step shows six tiles, one detail panel and Continue; the old cards are hidden',()=>{
  open();assert($('b132Strip').children.length===6,'tiles');assert(getComputedStyle($('overChoice0').parentElement).display==='none','old grid visible');
  assert($('b132Detail').textContent.includes('Beam')&&$('continueOverdrive').closest('#b132'),'detail/continue');
 });
 test('B132 tapping a tile selects it without equipping it',()=>{
  open(()=>{S.overUnlocked.add('nova');masteryB131('nova');applyMasteryB131()});
  $('b132Strip').querySelector('[data-id="nova"]').click();assert(b132.sel==='nova'&&S.overType==='beam','tile tap equipped or did not select');
  assert($('b132Detail').textContent.includes('Nova')&&$('b132Equip')&&!$('b132Equip').disabled,'nova detail/equip');
  $('b132Equip').click();assert(S.overType==='nova'&&$('b132Equip').disabled,'equip did not equip');
 });
 test('B132 the main button holds to buy the next tier',()=>{
  open(()=>{masteryB131('beam').u=1});const before=S.starPoints;
  assert($('b132Main')&&$('b132Main').textContent.includes('Unlock Tier 1'),'main label: '+($('b132Main')?.textContent||'none'));
  $('b132Main').click();assert(masteryB131('beam').t===0,'a tap bought the tier');
  hold($('b132Main'));assert(masteryB131('beam').t===1&&S.starPoints===before-2,'hold did not buy tier 1');
 });
 test('B132 short on uses or stars: the button stays pressable and says why, nothing is spent',()=>{
  open();assert(!$('b132Main')&&$('b132Why')&&$('b132Why').textContent.includes('Use Beam 1 more time'),'uses state');
  $('b132Why').click();assert(masteryB131('beam').t===0&&S.starPoints===14,'why button spent');
  open(()=>{masteryB131('beam').u=1;S.starPoints=1});assert($('b132Why')&&$('b132Why').textContent.includes('Need 1 more ★'),'stars state: '+$('b132Detail').textContent.slice(-80));
 });
 test('B132 all five tiers turn the main button into Level up',()=>{
  open(()=>{masteryB131('beam').t=5;applyMasteryB131()});assert($('b132Main')&&$('b132Main').textContent.includes('Level up to 2'),'level up label');
  hold($('b132Main'));assert(masteryB131('beam').lv===2&&masteryB131('beam').t===0,'level up via hold');
 });
 test('B132 locked skills unlock by hold; Pip shows Echoes and keeps its old upgrade',()=>{
  open();b132.sel='guardian';renderOverdriveStep();assert($('b132Main').textContent.includes('Unlock'),'locked label');
  hold($('b132Main'));assert(S.overUnlocked.has('guardian')&&masteryB131('guardian'),'guardian unlock');
  S.starPoints=20;b132.sel='pip';renderOverdriveStep();hold($('b132Main'));assert(S.overUnlocked.has('pip'),'pip unlock');
  assert($('b132Detail').textContent.includes("Pip's Echoes")&&$('b132Main').textContent.includes('Upgrade to Lv'),'pip panel');
 });
 test('B132 switch skills with [ / ], More and ? open and Escape closes them',()=>{
  open();const key=k=>window.dispatchEvent(new KeyboardEvent('keydown',{key:k}));
  key(']');assert(b132.sel==='storm','next skill');key('[');key('[');assert(b132.sel==='pip','wrap back');
  $('b132More').click();assert(b132.more&&$('b132More').textContent==='Less','more');$('b132Help').click();assert(!$('b132Rules').classList.contains('hidden'),'rules');
  key('Escape');assert(!b132.more&&$('b132Rules').classList.contains('hidden'),'escape');
 });
 test('B132 Continue still moves on to the boss reward',()=>{
  open();$('continueOverdrive').click();assert($('overdriveStep').classList.contains('stagehidden'),'continue did not leave the step');
 });
 test('B132 gamepad: RB/LB switch skill, Start continues',()=>{
  open();const real=navigator.getGamepads,btns=n=>Array.from({length:17},(_,i)=>({pressed:i===n,value:i===n?1:0}));let pad={connected:true,index:0,axes:[0,0],buttons:btns(-1)};
  Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pad]});
  try{
   pad.buttons=btns(5);updateGamepadMenuB35();assert(b132.sel==='storm','RB');pad.buttons=btns(-1);updateGamepadMenuB35();
   pad.buttons=btns(4);updateGamepadMenuB35();assert(b132.sel==='beam','LB');pad.buttons=btns(-1);updateGamepadMenuB35();
   pad.buttons=btns(9);updateGamepadMenuB35();assert($('overdriveStep').classList.contains('stagehidden'),'Start did not continue');
  }finally{Object.defineProperty(navigator,'getGamepads',{configurable:true,value:real})}
 });
 return out;
}
