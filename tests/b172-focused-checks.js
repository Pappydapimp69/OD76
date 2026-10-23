function runFocusedChecksB172(){
 const realOn=analyticsOnB136,realGc=window.goatcounter,realST=window.setTimeout,sent=[];
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{sent.length=0;pendingB147.length=0;analyticsOnB136=()=>true;window.goatcounter={count:ev=>sent.push(ev.path)};window.setTimeout=fn=>{fn();return 0};
  try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{analyticsOnB136=realOn;window.goatcounter=realGc;window.setTimeout=realST;pendingB147.length=0}};
 const live=()=>{reset();S.run=true;S.end=false;S.stage=1;startWave(1);S.stage=4;S.runHearts=20;S.wave=11};
 const reached=()=>sent.filter(p=>p.startsWith('od76/run/wave-reached/'));
 test('B172 heading home sends the highest wave once',()=>{
  live();S.stagePending=true;returnToRanchB99();const r=reached();assert(r.length===1&&r[0]==='od76/run/wave-reached/wave-11','home: '+r);
 });
 test('B172 a fall sends the highest wave once',()=>{
  live();finish(true);const r=reached();assert(r.length===1&&r[0]==='od76/run/wave-reached/wave-11','fall: '+r);
 });
 test('B172 finishing an already-ended run sends nothing more',()=>{
  live();finish(true);sent.length=0;finish(true);assert(!reached().length,'sent again');
 });
 return out;
}
