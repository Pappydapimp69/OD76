function runFocusedChecksB150(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{tone=realTone;window.setTimeout=realST}};
 const realTone=tone,realST=window.setTimeout;
 test('B150 buying at the ranch stall chimes and pops a badge; a failed buy does nothing',()=>{
  const heard=[];tone=f=>heard.push(f);window.setTimeout=(fn,ms)=>{if(ms<200)fn();return 0};
  ranchB99=Object.assign(ranchDefaultB99(),{hearts:100});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();openRanchB99();stallSheetB104();
  assert(buyItemB104('pellets',1),'buy failed');assert(heard.includes(880)&&heard.includes(1320),'no chime: '+heard);
  assert(document.querySelector('#ranchSheetB100 .b150Pop')?.textContent.includes('Pip Pellets'),'no pop');
  heard.length=0;ranchB99.hearts=0;assert(!buyItemB104('pellets',1)&&!heard.length,'failed buy made noise');closeSheetB100();
 });
 test('B150 Arena Merchant purchases pop over the merchant',()=>{
  window.setTimeout=(fn,ms)=>{if(ms<200)fn();return 0};tone=()=>{};
  reset();S.run=true;S.stage=7;S.heartCurrency=200;S.stageEnding=true;openStageUpgrade();openMerchantB118();
  assert(buySnackB118(),'snack buy failed');assert($('arenaMerchantB118').querySelector('.b150Pop'),'no merchant pop');
 });
 return out;
}
