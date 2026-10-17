
// B155 A refine needs a minimum load that doubles each refinery level: ♥50 at Lv 1, 100 at Lv 2, 200 at Lv 3 … 1600 at
// Lv 6. Each stone still costs ♥50 (a ♥100 load makes 2 stones); smaller loads are refused. The sheet offers the
// minimum load and "Refine all", or says how many hearts the next refine needs.
function refineMinBatchesB155(lv=ranchB99.refinery.level){return 2**(clamp(Math.floor(lv)||1,1,B102_REFINERY_MAX)-1)}
function refineMinHeartsB155(lv){return refineMinBatchesB155(lv)*B102_HEARTS_PER_STONE}
const loadHeartsBeforeB155=loadHeartsB102;
loadHeartsB102=function(batches,...a){const min=refineMinBatchesB155();if(Math.floor(batches)<min||Math.floor(ranchB99.hearts/B102_HEARTS_PER_STONE)<min)return 0;return loadHeartsBeforeB155(batches,...a)};
const refinerySheetBeforeB155=refinerySheetB102;
refinerySheetB102=function(...a){
 const open=openSheetB100;
 openSheetB100=function(title,text,options,...rest){
  if(title==='Heart Refinery'){
   const f=ranchB99.refinery,min=refineMinBatchesB155(),can=Math.floor(ranchB99.hearts/B102_HEARTS_PER_STONE),st=stationB100('refinery');
   for(let i=options.length-1;i>=0;i--)if(/^Refine /.test(options[i].label))options.splice(i,1);
   const add=[];
   if(can>=min)add.push({label:`Refine ♥ ${min*B102_HEARTS_PER_STONE} → ◆ ${min}`,run:()=>{loadHeartsB102(min);renderRanchHudB100();ranchToastB100(`Loaded ♥ ${min*B102_HEARTS_PER_STONE}. ${min} stone${min===1?'':'s'} on the way.`)}});
   if(can>min)add.push({label:`Refine all · ♥ ${can*B102_HEARTS_PER_STONE} → ◆ ${can}`,run:()=>{const n=loadHeartsB102(can);renderRanchHudB100();ranchToastB100(`Loaded ${n} batches. The refinery hums along.`)}});
   const at=options.findIndex(o=>/^Collect /.test(o.label));options.splice(at>=0?at+1:0,0,...add);
   text+=can>=min?` Lv ${f.level} refines at least ♥ ${min*B102_HEARTS_PER_STONE} at a time (♥ ${B102_HEARTS_PER_STONE} per stone).`:` Lv ${f.level} needs ♥ ${min*B102_HEARTS_PER_STONE} to start a refine (♥ ${B102_HEARTS_PER_STONE} per stone) · you have ♥ ${ranchB99.hearts}.`;
  }
  return open(title,text,options,...rest);
 };
 try{return refinerySheetBeforeB155(...a)}finally{openSheetB100=open}
};
