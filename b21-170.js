
// B156 Fusing Star Dust takes time. The refinery's Fuse button now loads ✧5 into the fuser (or "Fuse all" loads every
// ✧5 you have); each ★1 Star Stone comes out 15 minutes after the last (real clock, keeps going while away). Nothing
// fuses unless the player starts it. Loaded dust is reserved; the sheet shows the countdown and how many are queued.
const B156_FUSE_SECONDS=900;
function fuseStateB156(){const r=ranchB99;if(!r.fuse||typeof r.fuse!=='object')r.fuse={startedAt:0,queue:0};return r.fuse}
function rawFuseB156(){try{const v=JSON.parse(localStorage.getItem(B99_RANCH_KEY)||'null');return v?.fuse}catch(_){return null}}
function fuseFieldsB156(r,raw){const s=Number(raw?.startedAt),q=Math.floor(Number(raw?.queue));r.fuse={queue:Number.isFinite(q)&&q>0?Math.min(q,1e6):0,startedAt:0};if(r.fuse.queue)r.fuse.startedAt=Number.isFinite(s)&&s>0?Math.min(s,Date.now()):Date.now();return r}
const loadRanchBeforeB156=loadRanchB99;
loadRanchB99=function(...a){return fuseFieldsB156(loadRanchBeforeB156(...a),rawFuseB156())};
const ranchDefaultBeforeB156=ranchDefaultB99;
ranchDefaultB99=function(...a){return fuseFieldsB156(ranchDefaultBeforeB156(...a),null)};
fuseFieldsB156(ranchB99,rawFuseB156());
function tickFuseB156(now=Date.now()){
 const f=fuseStateB156(),T=B156_FUSE_SECONDS*1000;let made=0;
 while(f.queue>0&&f.startedAt&&now>=f.startedAt+T){
  const end=f.startedAt+T;ranchB99.dust+=B102_DUST_PER_STAR;fuseStarB102();made++; // fuseStarB102 keeps the stats/analytics hooks
  f.queue--;f.startedAt=f.queue>0?end:0;
 }
 if(made){saveRanchB99();if(ranchWorldB100?.active){renderRanchHudB100?.();ranchToastB100?.(`Star Dust fused · ★${made} Star Stone${made===1?'':'s'}.`,2)}}
 return made;
}
function startFuseB156(n=1,now=Date.now()){
 tickFuseB156(now);const f=fuseStateB156(),k=Math.min(Math.floor(n),Math.floor(ranchB99.dust/B102_DUST_PER_STAR));if(k<1)return 0;
 ranchB99.dust-=k*B102_DUST_PER_STAR;if(!f.queue)f.startedAt=now;f.queue+=k;saveRanchB99();return k;
}
const tickRefineryBeforeB156=tickRefineryB102;
tickRefineryB102=function(now=Date.now(),...a){tickFuseB156(now);return tickRefineryBeforeB156(now,...a)};
const updateRanchBeforeB156=updateRanchB100;
updateRanchB100=function(dt,...a){if(ranchWorldB100.active&&(ranchWorldB100.b156T=(ranchWorldB100.b156T||0)+dt)>1){ranchWorldB100.b156T=0;tickFuseB156()}return updateRanchBeforeB156(dt,...a)}; // only finishes what the player started
const refinerySheetBeforeB156=refinerySheetB102;
refinerySheetB102=function(...a){
 const open=openSheetB100;
 openSheetB100=function(title,text,options,...rest){
  if(title==='Heart Refinery'){
   const i=options.findIndex(o=>/^Fuse ✧/.test(o.label));if(i>=0)options.splice(i,1);
   const f=fuseStateB156(),can=Math.floor(ranchB99.dust/B102_DUST_PER_STAR),st=stationB100('refinery'),add=[];
   if(can>=1)add.push({label:`Fuse ✧ ${B102_DUST_PER_STAR} → ★ 1 · takes ${B156_FUSE_SECONDS/60} min`,run:()=>{startFuseB156(1);renderRanchHudB100();ranchToastB100(`Fusing ✧${B102_DUST_PER_STAR} · ★1 in ${B156_FUSE_SECONDS/60} min.`)}});
   if(can>1)add.push({label:`Fuse all · ✧ ${can*B102_DUST_PER_STAR} → ★ ${can} · ${B156_FUSE_SECONDS/60} min each`,run:()=>{const n=startFuseB156(can);renderRanchHudB100();ranchToastB100(`Fusing ${n} Star Stones, one every ${B156_FUSE_SECONDS/60} min.`)}});
   options.splice(i>=0?i:Math.max(0,options.length-1),0,...add);
   if(f.queue)text+=` Fusing ✧ → ★ · next in ${clockB102(Math.max(0,f.startedAt+B156_FUSE_SECONDS*1000-Date.now()))}${f.queue>1?` · ${f.queue} queued`:''}.`;
  }
  return open(title,text,options,...rest);
 };
 try{return refinerySheetBeforeB156(...a)}finally{openSheetB100=open}
};
