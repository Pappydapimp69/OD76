
// B172 Highest wave per run. Every run end (fall, complete or heading home) also sends run/wave-reached/wave-N,
// where N is the run's overall wave number (S.wave), so the dashboard shows how far each run got wave by wave.
function waveReachedB172(){trackB136(['run','wave-reached',`wave-${S?.wave||1}`],'Wave reached')}
const runEndBeforeB172=runEndB171;
runEndB171=function(...a){const out=runEndBeforeB172(...a);waveReachedB172();return out};
const finishBeforeB172=finish;
finish=function(...a){const ended=S?.end,out=finishBeforeB172(...a);if(!ended&&S?.end){waveReachedB172();setTimeout(flushAnalyticsB147,0)}return out};
