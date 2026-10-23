
// B172 Highest wave per run, linked to its session. Every run end (fall, complete or heading home) sends
// run/wave-reached/rank-X/stage-S/W, where W is the wave within the stage (wave-1..3), "boss" when the run ended
// during the stage's boss fight, or "cleared" when it ended at the stage break (heading home).
// GoatCounter only keeps per-path counts, so a run can't be tied to a session after the fact. Each page load gets a
// random id (memory only, never stored, no personal data); every run end also sends
// od76/sess/<id>/run-N/rank-X/stage-S/W, and the session opens with od76/sess/<id>/start/<new|returning>/<device>.
const sessIdB172=Math.random().toString(36).slice(2,8);let sessRunsB172=0;
(function sessStartB172(){
 const s=(analyticsLogB136.find(p=>p.startsWith('od76/session/start/'))||'').split('/'); // B136 session/start/<who>/<device>/…
 trackB136(['sess',sessIdB172,'start',s[3]||'x',s[4]||'x'],'Session');
})();
function stageSpotB172(){return S?.stagePending?'cleared':S?.bossActive?'boss':`wave-${Math.max(1,S?.stageWaveCount||1)}`}
function waveReachedB172(){
 const rank=`rank-${rankB136()}`,stage=`stage-${S?.stage||1}`,w=stageSpotB172();
 trackB136(['run','wave-reached',rank,stage,w],'Wave reached');
 trackB136(['sess',sessIdB172,`run-${++sessRunsB172}`,rank,stage,w],'Session run');
}
const runEndBeforeB172=runEndB171;
runEndB171=function(...a){const out=runEndBeforeB172(...a);waveReachedB172();return out};
const finishBeforeB172=finish;
finish=function(...a){const ended=S?.end,out=finishBeforeB172(...a);if(!ended&&S?.end){waveReachedB172();setTimeout(flushAnalyticsB147,0)}return out};
