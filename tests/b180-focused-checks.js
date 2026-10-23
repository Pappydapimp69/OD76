function runFocusedChecksB180(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const setup=(wins,spent)=>{stageInputLockMsB117i=0;reset();ranchB99.rank=1;S.b108Rank=1;colSaveB163.wins.D=wins;spentB180.D=spent;spentB180.E=0;colSaveB163.wins.E=0;S.stage=4;S.bossRewardPending=true;S.starPoints=0;S.overUnlocked.add('beam');openStageUpgrade();b132.sel='beam'};
 test('B180 a rank D trophy adds 5 uses to the selected skill and is spent',()=>{setup(2,0);const m=masteryB131('beam'),u=m.u;renderOverdriveStep();assert($('b180Trophy'),'no button');
  holdB117h.allow=true;try{$('b180Trophy').click()}finally{holdB117h.allow=false}
  assert(masteryB131('beam').u===u+5&&trophiesLeftB180('D')===1&&masteryB131('beam').t===0,'uses '+masteryB131('beam').u+' left '+trophiesLeftB180('D'))});
 test('B180 rank locked: D trophies do nothing in a rank E run',()=>{setup(3,0);ranchB99.rank=0;S.b108Rank=0;renderOverdriveStep();assert(!$('b180Trophy')&&!spendTrophyB180('beam'),'spent in E')});
 test('B180 no trophies left, no button; locked skills take none',()=>{setup(1,1);renderOverdriveStep();assert(!$('b180Trophy'),'button');setup(1,0);assert(!spendTrophyB180('nova'),'locked skill')});
 test('B180 the Overdrive page is not skipped while a trophy can be spent',()=>{setup(1,0);assert(!stepOutOfOptionsB149('overdriveStep'),'skipped');setup(1,1);assert(stepOutOfOptionsB149('overdriveStep')===!OVER_ORDER.some(id=>b132Afford(id)),'normal')});
 test('B180 spent trophies survive a reload',()=>{setup(2,0);spendTrophyB180('beam');assert(loadSpentB180().D===1,'lost')});
 return out;
}
