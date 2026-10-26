function runFocusedChecksB182(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const ev=(trusted,detail=0)=>({isTrusted:trusted,detail});
 test('B182 a trusted click from the opening tap is stale, even with detail 0',()=>{tapGuardB173.down=5;tapGuardB173.opened=6;lastInputB182='pointer';assert(staleTapB182(ev(true,0))&&staleTapB182(ev(true,1)),'not stale')});
 test('B182 a fresh tap after opening passes',()=>{tapGuardB173.down=7;tapGuardB173.opened=6;lastInputB182='pointer';assert(!staleTapB182(ev(true,1)),'blocked')});
 test('B182 keyboard and code clicks pass',()=>{tapGuardB173.down=5;tapGuardB173.opened=6;lastInputB182='key';assert(!staleTapB182(ev(true,0)),'key blocked');lastInputB182='pointer';assert(!staleTapB182(ev(false,0)),'code blocked')});
 return out;
}
