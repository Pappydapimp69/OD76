
// B156 Star Dust fuses on its own. Whenever the ranch holds ✧5, they go into the fuser and become ★1 Star Stone 15
// minutes later (real clock, so it keeps going while away); the next ✧5 start right after. The instant Fuse button is
// gone; the refinery sheet shows the fuser's countdown. Dust in the fuser is reserved (it leaves the dust count).
const B156_FUSE_SECONDS=900;
function fuseStateB156(){const r=ranchB99;if(!r.fuse||typeof r.fuse!=='object')r.fuse={startedAt:0};return r.fuse}
function rawFuseB156(){try{const v=JSON.parse(localStorage.getItem(B99_RANCH_KEY)||'null');return v?.fuse}catch(_){return null}}
function fuseFieldsB156(r,raw){const s=Number(raw?.startedAt);r.fuse={startedAt:Number.isFinite(s)&&s>0?Math.min(s,Date.now()):0};return r}
const loadRanchBeforeB156=loadRanchB99;
loadRanchB99=function(...a){return fuseFieldsB156(loadRanchBeforeB156(...a),rawFuseB156())};
const ranchDefaultBeforeB156=ranchDefaultB99;
ranchDefaultB99=function(...a){return fuseFieldsB156(ranchDefaultBeforeB156(...a),null)};
fuseFieldsB156(ranchB99,rawFuseB156());
function tickFuseB156(now=Date.now()){
 const f=fuseStateB156(),T=B156_FUSE_SECONDS*1000;let made=0;
 for(let guard=0;guard<10000;guard++){
  if(!f.startedAt){if(ranchB99.dust<B102_DUST_PER_STAR)break;ranchB99.dust-=B102_DUST_PER_STAR;f.startedAt=now;saveRanchB99();break}
  if(now<f.startedAt+T)break;
  const end=f.startedAt+T;ranchB99.dust+=B102_DUST_PER_STAR;fuseStarB102();made++; // fuseStarB102 keeps the stats/analytics hooks
  if(ranchB99.dust>=B102_DUST_PER_STAR){ranchB99.dust-=B102_DUST_PER_STAR;f.startedAt=end}else f.startedAt=0;
 }
 if(made){saveRanchB99();if(ranchWorldB100?.active){renderRanchHudB100?.();ranchToastB100?.(`Star Dust fused · ★${made} Star Stone${made===1?'':'s'}.`,2)}}
 return made;
}
const tickRefineryBeforeB156=tickRefineryB102;
tickRefineryB102=function(now=Date.now(),...a){tickFuseB156(now);return tickRefineryBeforeB156(now,...a)};
const updateRanchBeforeB156=updateRanchB100;
updateRanchB100=function(dt,...a){if(ranchWorldB100.active&&(ranchWorldB100.b156T=(ranchWorldB100.b156T||0)+dt)>1){ranchWorldB100.b156T=0;tickFuseB156()}return updateRanchBeforeB156(dt,...a)};
const refinerySheetBeforeB156=refinerySheetB102;
refinerySheetB102=function(...a){
 const open=openSheetB100;
 openSheetB100=function(title,text,options,...rest){
  if(title==='Heart Refinery'){
   for(let i=options.length-1;i>=0;i--)if(/^Fuse ✧/.test(options[i].label))options.splice(i,1);
   const f=fuseStateB156();
   text+=f.startedAt?` Fusing ✧${B102_DUST_PER_STAR} → ★1 · ${clockB102(Math.max(0,f.startedAt+B156_FUSE_SECONDS*1000-Date.now()))} left.`:` Star Dust fuses on its own: ✧${B102_DUST_PER_STAR} → ★1 every ${B156_FUSE_SECONDS/60} min.`;
  }
  return open(title,text,options,...rest);
 };
 try{return refinerySheetBeforeB156(...a)}finally{openSheetB100=open}
};
