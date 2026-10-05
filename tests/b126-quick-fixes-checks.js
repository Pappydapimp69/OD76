// B126 playtest quick fixes: input release, iOS browser suppression, ranch exits, farm copy and black handoff.
function runQuickFixChecksB126(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{keys.clear();fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{keys.clear();closeSheetB100();clearTimeout(arenaReturnTimerB126);weekFadeB119.returning=false;weekFadeB119.fromArena=false;$('weekFadeB119')?.classList.remove('on','b126-preblack','b126-fromblack')}};
 const fresh=over=>{ranchB99=Object.assign(ranchDefaultB99(),over||{});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99()};
 test('B126 stage boundaries release keyboard, touch, gamepad and velocity',()=>{
  reset();S.run=true;keys.add('d');gamepad.dx=1;joy.active=true;joy.id=7;joy.dx=1;P.vx=80;openStageUpgrade();
  assert(!keys.size&&!joy.active&&joy.id===null&&gamepad.dx===0&&P.vx===0,'stage upgrade preserved movement');
 });
 test('B126 app double taps and selection are suppressed, survey text is exempt',()=>{
  const dbl=new Event('dblclick',{bubbles:true,cancelable:true});C.dispatchEvent(dbl);assert(dbl.defaultPrevented,'double click default survived');
  const sel=new Event('selectstart',{bubbles:true,cancelable:true});$('stageUp').dispatchEvent(sel);assert(sel.defaultPrevented,'game text selection survived');
  openRanchB99();openSurveyB117();const input=$('b117-name'),textSel=new Event('selectstart',{bubbles:true,cancelable:true});input.dispatchEvent(textSel);assert(!textSel.defaultPrevented,'survey input selection blocked');closeSurveyB117();
 });
 test('B126 every ranch sheet exposes a visible Back / Exit',()=>{
  fresh({hearts:99});openRanchB99();stallSheetB104();const b=[...$('ranchSheetB100').querySelectorAll('button')].find(x=>x.textContent==='Back / Exit');assert(b,'shop exit missing');b.click();assert(!ranchWorldB100.sheet,'shop exit did not close');
 });
 test('B126 farm sheets say only tilling adds fatigue',()=>{
  fresh({areas:{garden:true,kitchen:false,orchard:false},tools:{hoe:true,can:true,axe:false,sickle:false},fatigue:0});openRanchB99();plotSheetB105(0);assert($('ranchSheetB100').textContent.includes('Only tilling adds fatigue (+8). Planting and watering add no fatigue.'),'plot copy stale');closeSheetB100();gardenSheetB105();assert($('ranchSheetB100').textContent.includes('Planting and watering add no fatigue.'),'garden copy stale');
 });
 test('B126 arena merchant shows spendable hearts',()=>{
  reset();S.stage=7;S.stagePending=true;S.heartCurrency=37;openMerchantB118();
  assert($('merchantTextB118').textContent.includes('♥ 37 available to spend.'),'merchant balance missing');
  $('arenaMerchantB118').classList.add('stagehidden');
 });
 test('B126 arena return reaches black before switching to ranch and Week N',()=>{
  fresh({fatigue:0});reset();S.run=true;S.stage=3;S.stagePending=true;S.runHearts=5;S.heartCurrency=5;openRanchGateB99();
  assert(returnToRanchWithFadeB126()&&!ranchWorldB100.active&&$('weekFadeB119').classList.contains('b126-preblack'),'ranch appeared before black');
  assert(finishArenaReturnB126()&&ranchWorldB100.active&&$('weekFadeB119').classList.contains('b126-fromblack')&&weekFadeB119.last?.kind==='battle','Week transition did not start from black');
 });
 return out;
}
