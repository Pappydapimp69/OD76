function runFocusedChecksB137(){
 const out=[],assert=(v,m)=>{if(!v)throw Error(m)},test=(name,fn)=>{try{fn();out.push({name,ok:true})}catch(e){out.push({name,ok:false,error:e.message})}finally{labelB100=realLabel}};
 const realLabel=labelB100;
 test('B137 site names draw once, outside Pip, and only the chopped site jolts',()=>{
  ranchB99=Object.assign(ranchDefaultB99(),{tools:{axe:true,sickle:true}});ensurePointsB100(ranchB99);syncCapsB102();saveRanchB99();openRanchB99();
  const w=ranchWorldB100,o=B106_OBSTACLES.find(o=>o.site==='range'&&o.tree&&obstacleStandingB106(o));w.px=o.x+40;w.py=o.y;
  assert(startPipActionB109(pipActionForB109({st:{obstacle:o.id}})),'chop did not start');
  for(let i=0;i<200&&w.b109Action?.phase!=='work';i++)updateRanchB100(.03);assert(w.b109Action?.phase==='work','never reached work');
  const seen=[];labelB100=(x,y,title)=>{seen.push({x,title})};
  drawPipB100(performance.now()/1000);assert(!seen.length,'Pip still draws site names: '+seen.map(s=>s.title));
  const xs={};for(let k=0;k<12;k++){w.b109Action.t=k*.03;seen.length=0;drawSiteLabelsB137(0);for(const s of seen)(xs[s.title]=xs[s.title]||new Set()).add(Math.round(s.x*10))}
  const range=B100_GAMES.range.title;assert(xs[range]&&xs[range].size>1,'chopped site did not jolt');
  for(const t in xs)if(t!==range)assert(xs[t].size===1,t+' moved while another site was chopped');
 });
 return out;
}
