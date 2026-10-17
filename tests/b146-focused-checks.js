function runFocusedChecksB146(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}};
 const B=['ranchIdle','ranchClear','ranchFarm','ranchTrain'];
 const fresh=()=>{ranchB99=Object.assign(ranchDefaultB99(),{tools:{axe:true,sickle:true,hoe:true,can:true}});ensurePointsB100(ranchB99);syncCapsB102();ranchB99.fatigue=0;saveRanchB99();openRanchB99();for(const k of B)statsB117[k]=0};
 test('B146 an X-button chop logs clearing time, not training',()=>{
  fresh();const w=ranchWorldB100,o=B106_OBSTACLES.find(o=>o.tree&&obstacleStandingB106(o));w.px=o.x+40;w.py=o.y;
  assert(startPipActionB109(pipActionForB109({st:{obstacle:o.id}})),'job did not start');for(let i=0;i<300&&w.b109Action;i++)updateRanchB100(.03);
  assert(statsB117.ranchClear>1&&statsB117.ranchTrain===0,'clear '+statsB117.ranchClear+' train '+statsB117.ranchTrain);
 });
 test('B146 a farm job logs farming time',()=>{
  fresh();ranchB99.areas.garden=true;const w=ranchWorldB100;w.b109Action={kind:'till',phase:'work',t:0,target:{x:0,y:0}};
  for(let i=0;i<10;i++)statsB117[ranchBucketB117r(w)]+=.1;w.b109Action=null;assert(statsB117.ranchFarm>.9,'farm '+statsB117.ranchFarm);
 });
 test('B146 a drill mini-game still logs training',()=>{fresh();const w=ranchWorldB100;w.game={type:'collect'};assert(ranchBucketB117r(w)==='ranchTrain','game bucket');w.game=null});
 test('B146 feeding or washing Pip logs care time',()=>{fresh();const w=ranchWorldB100;w.b116eCare={kind:'feed'};assert(ranchBucketB117r(w)==='ranchCare','care bucket');w.b116eCare=null;assert(ranchTimeTextB117r().includes('caring for Pip'),'report line')});
 return out;
}
