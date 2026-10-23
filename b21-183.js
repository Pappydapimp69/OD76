
// B171 Analytics that match play. Heading home from the stage break banks the run without calling finish(), so
// those runs never sent run/end or their skill-uses; now they do, as run/end/home. run/start drops its skill:
// every run opens on the default skill and the real choice is made later (skill/equip, run/skill-uses). Pending
// events also go out when the page is hidden or closed instead of being dropped.
function runEndB171(outcome){
 const st=S?.stage||1,mins=(Date.now()-(runB136.t||Date.now()))/60000;
 trackB136(['run','end',outcome,`stage-${st}`,`rank-${rankB136()}`,skillB136()],'Run end');
 trackB136(['run','pip-level',`lv-${S?.pipLevel||1}`]);trackB136(['run','minutes',bucketB136(mins,[2,5,10,15,20,30,45,60])]);
 trackB136(['run','score',bucketB136(S?.score,[1e3,1e4,5e4,1e5,2e5,5e5])]);
 const now=snapSkillsB136();for(const id in now){const d=now[id]-(runB136.skills[id]||0);if(d>0)trackB136(['run','skill-uses',id,bucketB136(d,[1,5,10,20,40,80])])}
}
const bankBeforeB171=bankRunB99;
bankRunB99=function(dead,...a){const home=!dead&&S&&!S.end,out=bankBeforeB171(dead,...a);if(home){runEndB171('home');setTimeout(flushAnalyticsB147,0)}return out};
const trackBeforeB171=trackB136;
trackB136=function(parts,title){return trackBeforeB171(parts[0]==='run'&&parts[1]==='start'?parts.slice(0,3):parts,title)};
window.addEventListener('pagehide',()=>flushAnalyticsB147());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushAnalyticsB147()});
