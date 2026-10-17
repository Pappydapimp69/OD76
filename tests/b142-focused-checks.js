function runFocusedChecksB142(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 test('B142 every unclaimed scent sparkle draws a highlight on top; claimed ones do not',()=>{
  const realText=X.fillText;const drawn=[];X.fillText=(s,x,y)=>drawn.push(s);
  try{ranchWorldB100.game={type:'collect',sparks:[{x:10,y:10,got:false},{x:50,y:10,got:true},{x:90,y:10,got:false}],decoys:[]};drawScentSparksB142(1);
   assert(drawn.filter(s=>s==='✿').length===2,'highlights: '+drawn.length)}finally{X.fillText=realText;ranchWorldB100.game=null}
 });
 return out;
}
