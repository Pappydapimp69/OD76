function runFocusedChecksB176(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{cancelHoldB117h()}};
 const hold=id=>{stageInputLockMsB117i=0;S.stagePending=true;$('stageUp').classList.remove('hidden');const b=$(id);cancelHoldB117h();resetRepeatB117q?.();beginHoldB117h(b,'test');return holdB117h.ms};
 reset();
 test('B176 Continue and Next stage hold 0.4s',()=>{for(const id of ['skipPipUpgrade','continueAbilities','nextStageB99','leaveMerchantB118'])assert(hold(id)===400,id+' '+holdB117h.ms)});
 test('B176 buys hold 0.6s',()=>{for(const id of ['upLove','abilityRange','buySnackB118'])assert(hold(id)===600,id+' '+holdB117h.ms)});
 test('B176 Ascend keeps 1.8s',()=>{const b=document.createElement('button');b.id='b132Main';b.textContent='HOLD · Ascend Beam';document.body.append(b);assert(hold('b132Main')===OVERDRIVE_HOLD_MS,'ascend '+holdB117h.ms);b.textContent='HOLD · Upgrade to Lv 2';assert(hold('b132Main')===600,'upgrade');b.remove()});
 test('B176 a repeat hold is never longer than the first',()=>{hold('upLove');cancelHoldB117h();repeatKeyB117q='h:upLove';beginHoldB117h($('upLove'),'test');assert(holdB117h.ms===600,'repeat '+holdB117h.ms);cancelHoldB117h();repeatKeyB117q='h:nextStageB99';beginHoldB117h($('nextStageB99'),'test');assert(holdB117h.ms===400,'nav repeat '+holdB117h.ms)});
 test('B176 survey says 100% fatigue',()=>{assert(/Gate stops at 100% fatigue/.test(statsTextB117())&&/stopped by 100% fatigue/.test(detailB117()),'text')});
 return out;
}
