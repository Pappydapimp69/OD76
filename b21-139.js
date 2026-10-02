
// B125 patch 9: chopping counts as clearing however it's done. Pip's chop/cut from the obstacle's menu (a
// "drill"-state job aimed at the obstacle) now logs to clearing time, not training, and every obstacle cleared
// (menu or X job) adds one to a cleared count shown in the playtest stats.
const pipDoBeforeB133=pipDoB100;
pipDoB100=function(state,st,...a){const out=pipDoBeforeB133(state,st,...a);ranchWorldB100.pip.b133Clear=!!(state==='drill'&&st&&(st.obstacle||B106_OBSTACLES.includes(st)));return out};
const ranchBucketBeforeB133=ranchBucketB117r;
ranchBucketB117r=function(w=ranchWorldB100){
  if(!w.game&&w.pip?.state==='drill'&&w.pip.b133Clear)return 'ranchClear';
  return ranchBucketBeforeB133(w);
};
const statsDefaultBeforeB133=statsDefaultB117;
statsDefaultB117=function(){const s=statsDefaultBeforeB133();s.clears=0;return s};
statsB117=loadStatsB117();
const clearObstacleBeforeB133=clearObstacleB106;
clearObstacleB106=function(id){const ok=clearObstacleBeforeB133(id);if(ok){statsB117.clears=(statsB117.clears||0)+1;saveStatsB117()}return ok};
const statsTextBeforeB133=statsTextB117;
statsTextB117=function(){return statsTextBeforeB133().replace(/Ranch time: idle/,`Obstacles cleared: ${statsB117.clears||0}\nRanch time: idle`)};
