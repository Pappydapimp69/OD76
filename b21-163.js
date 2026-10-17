
// B146 Clearing time is counted. Pip's X-button chop/cut/till/water jobs (B109) set his state to "drill" directly,
// so the B117 ranch-time split filed them under training before it ever looked at the job. The job now decides
// first: chop/cut → clearing, till/water/harvest → farming. Feeding/washing (B116e care, also "drill") gets its own
// care bucket. Menu chops are rerouted to B109 jobs, so they're covered. Old saves keep their old split.
const ranchBucketBeforeB146=ranchBucketB117r;
ranchBucketB117r=function(w=ranchWorldB100,...a){
 const job=w.b109Action;
 if(job&&!w.game)return job.kind==='chop'||job.kind==='cut'?'ranchClear':'ranchFarm';
 if(!w.game&&careBusyB116e())return 'ranchCare';
 return ranchBucketBeforeB146(w,...a);
};
const statsDefaultBeforeB146=statsDefaultB117;
statsDefaultB117=function(){const s=statsDefaultBeforeB146();s.ranchCare=0;return s};
statsB117=loadStatsB117();
ranchTimeTextB117r=function(){const s=statsB117;return`idle ${secsB117r(s.ranchIdle)}, clearing obstacles ${secsB117r(s.ranchClear)}, farming ${secsB117r(s.ranchFarm)}, caring for Pip ${secsB117r(s.ranchCare||0)}, training ${secsB117r(s.ranchTrain)}`};
