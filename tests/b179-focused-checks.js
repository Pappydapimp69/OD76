function runFocusedChecksB179(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 test('B179 every ranch save also writes the slots to their own key',()=>{ranchB99=Object.assign(ranchDefaultB99(),{hearts:300});loadSlotB174(0,'heart',300,Date.now());
  const v=JSON.parse(localStorage.getItem(B179_KEY));assert(v.slots[0].kind==='heart'&&v.slots[0].n===6,'key')});
 test('B179 a ranch save without slots (an early-loading module) no longer loses them',()=>{
  const blob=JSON.parse(localStorage.getItem(B99_RANCH_KEY));delete blob.slots;localStorage.setItem(B99_RANCH_KEY,JSON.stringify(blob)); // what b21-124 etc. write during page load
  ranchB99=loadRanchB99();assert(ranchB99.slots[0].kind==='heart'&&ranchB99.slots[0].n===6&&ranchB99.hearts===0,'lost')});
 return out;
}
