
// B172 Highest wave per run. Every run end (fall, complete or heading home) also sends
// run/wave-reached/rank-X/stage-S/wave-W: the rank, the stage, and the wave within that stage (1-3); "boss" when
// the run ended during the stage's boss fight, "cleared" when it ended at the stage break (heading home).
function waveReachedB172(){
 const w=S?.stagePending?'cleared':S?.bossActive?'boss':`wave-${Math.max(1,S?.stageWaveCount||1)}`;
 trackB136(['run','wave-reached',`rank-${rankB136()}`,`stage-${S?.stage||1}`,w],'Wave reached');
}
const runEndBeforeB172=runEndB171;
runEndB171=function(...a){const out=runEndBeforeB172(...a);waveReachedB172();return out};
const finishBeforeB172=finish;
finish=function(...a){const ended=S?.end,out=finishBeforeB172(...a);if(!ended&&S?.end){waveReachedB172();setTimeout(flushAnalyticsB147,0)}return out};
