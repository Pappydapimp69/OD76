function runFocusedChecksB171(){
 const realOn=analyticsOnB136,realGc=window.goatcounter,realST=window.setTimeout,sent=[];
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{sent.length=0;pendingB147.length=0;analyticsOnB136=()=>true;window.goatcounter={count:ev=>sent.push(ev.path)};window.setTimeout=fn=>{fn();return 0};
  try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{analyticsOnB136=realOn;window.goatcounter=realGc;window.setTimeout=realST;pendingB147.length=0}};
 const home=()=>{reset();S.run=true;S.end=false;S.stage=1;startWave(1);S.stage=4;S.runHearts=20;skillB117('storm').n+=3;S.stagePending=true;returnToRanchB99()};
 test('B171 heading home sends run/end/home with the skills used',()=>{
  home();
  assert(sent.some(p=>/^od76\/run\/end\/home\/stage-4\//.test(p)),'no run/end/home: '+sent.join(' '));
  assert(sent.includes('od76/run/skill-uses/storm/le5'),'no storm skill-uses: '+sent.join(' '));
  assert(sent.filter(p=>p.startsWith('od76/run/end/')).length===1,'run end sent twice');
 });
 test('B171 run/start no longer names the opening skill',()=>{
  home();const s=sent.filter(p=>p.startsWith('od76/run/start/'));
  assert(s.length===1&&/^od76\/run\/start\/rank-[a-z]+$/.test(s[0]),'run start path: '+s);
 });
 test('B171 a fall still sends exactly one run/end',()=>{
  reset();S.run=true;S.end=false;S.runHearts=0;finish(true);
  const e=sent.filter(p=>p.startsWith('od76/run/end/'));assert(e.length===1&&e[0].startsWith('od76/run/end/fell/'),'fall run end: '+e);
 });
 test('B171 pending events go out when the page is hidden or closed',()=>{
  trackB136(['ranch','rest']);assert(!sent.length,'sent early');
  window.dispatchEvent(new Event('pagehide'));
  assert(sent.includes('od76/ranch/rest')&&sent.some(p=>p.startsWith('od76/session/end/')),'not flushed on pagehide: '+sent.join(' '));
 });
 return out;
}
