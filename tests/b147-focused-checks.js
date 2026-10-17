function runFocusedChecksB147(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{analyticsOnB136=realOn;window.goatcounter=realGc;window.setTimeout=realST}};
 const realOn=analyticsOnB136,realGc=window.goatcounter,realST=window.setTimeout;
 test('B147 events wait in a batch and are sent only when the arena run ends',()=>{
  const sent=[];analyticsOnB136=()=>true;window.goatcounter={count:ev=>sent.push(ev.path)};window.setTimeout=(fn)=>{fn();return 0};pendingB147.length=0;
  trackB136(['ranch','clear','x']);trackB136(['input','touch']);assert(!sent.length,'sent before the run ended: '+sent);
  reset();S.run=true;S.end=false;S.runHearts=0;finish(true);
  assert(sent.some(p=>p==='od76/ranch/clear/x')&&sent.some(p=>/^od76\/run\/end\//.test(p)),'batch not sent at run end: '+sent.join(' '));
  assert(!pendingB147.length,'batch not emptied');
 });
 test('B147 GoatCounter makes no page-load hit',()=>{assert(!realGc||realGc.no_onload!==false,'no_onload is off')});
 return out;
}
