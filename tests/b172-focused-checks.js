function runFocusedChecksB172(){
 const realOn=analyticsOnB136,realGc=window.goatcounter,realST=window.setTimeout,sent=[];
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{sent.length=0;pendingB147.length=0;analyticsOnB136=()=>true;window.goatcounter={count:ev=>sent.push(ev.path)};window.setTimeout=fn=>{fn();return 0};
  try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{analyticsOnB136=realOn;window.goatcounter=realGc;window.setTimeout=realST;pendingB147.length=0}};
 const live=()=>{reset();S.run=true;S.end=false;S.stage=1;startWave(1);S.stage=4;S.runHearts=20;S.stageWaveCount=2;S.bossActive=false};
 const reached=()=>sent.filter(p=>p.startsWith('od76/run/wave-reached/'));
 test('B172 heading home says the stage was cleared',()=>{
  live();S.stagePending=true;returnToRanchB99();const r=reached();assert(r.length===1&&/^od76\/run\/wave-reached\/rank-[a-z]+\/stage-4\/cleared$/.test(r[0]),'home: '+r);
 });
 test('B172 a fall sends the highest wave once',()=>{
  live();finish(true);const r=reached();assert(r.length===1&&/^od76\/run\/wave-reached\/rank-[a-z]+\/stage-4\/wave-2$/.test(r[0]),'fall: '+r);
 });
 test('B172 a run that ends in the boss fight says boss',()=>{
  live();S.bossActive=true;finish(true);const r=reached();assert(r.length===1&&/\/stage-4\/boss$/.test(r[0]),'boss: '+r);
 });
 test('B172 finishing an already-ended run sends nothing more',()=>{
  live();finish(true);sent.length=0;finish(true);assert(!reached().length,'sent again');
 });
 return out;
}
