// B178 Colosseum rework: rivals keep up with Pip, and some need coaching. A playtest found it too easy: rival stat totals
// were fixed per rank (B163_BUDGET) while ranch training is uncapped (B113), and Pip's trophy Ascension, arena perks
// (B167) and ranch work (B168) stacked with no rival equivalent. Now:
// - Rivals scale off Pip: a bracket's middle rival has max(rank budget, Pip's total × B178.trail) (the B163 spread
//   still runs 1.15-0.85 around it), the same trophy Ascension as Pip, and a share of his perks and ranch work.
//   Stats already pass through sqrt in the ring (B163), so training more still wins more.
// - Tricks that beat a careless coach: strikers are Breakers (a Focus shot into a raised Guard lands in full and cracks it; guard only
//   against Ascension), and sly Pips Feint (every other Ascend wind-up is fake; guard when the flames actually start).
// Tuned by seeded bracket sweeps (tests/b178-focused-checks.js, scripted coaches): once Pip outgrows a rank's budget, a
// good coach wins about 1 bracket in 4 (QF ~100%, SF ~75%, F ~30-50%); no coaching wins none. Early ranks still sit on
// their fixed budgets and are easier. A lopsided build (one stat far behind) struggles against the counter archetypes.
const B178={trail:.88,mirror:.75,crack:.6,bait:1,wind:.8,feintCd:2.5,trickRank:{breaker:1,feint:2}};
const B178_TRICK={striker:'breaker',dart:'feint',seeker:'feint'};
const B178_LINE={breaker:'Focus shots crack a raised Guard, so guard only against Ascension',feint:'fakes every other Ascend wind-up, so guard when the flames really start'};
function spreadStatsB178(arch,budget){
 const w=B163_ARCH.find(a=>a.id===arch).w,wsum=B163_STATS.reduce((s,k)=>s+w[k],0),stats={};let left=budget;
 for(const k of B163_STATS){stats[k]=Math.floor(budget*w[k]/wsum);left-=stats[k]}
 const order=[...B163_STATS].sort((x,y)=>(budget*w[y]/wsum%1)-(budget*w[x]/wsum%1)||w[y]-w[x]);
 for(let i=0;left>0;i++,left--)stats[order[i%4]]++;
 return stats;
}
// Each bracket deals the archetypes out afresh (from its seed), so one bad counter-matchup isn't the same wall every time.
let bracketSeedB178=0;
const bracketBeforeB178=bracketB163;
bracketB163=function(rank,seed,...a){bracketSeedB178=seed>>>0;try{return bracketBeforeB178(rank,seed,...a)}finally{bracketSeedB178=0}};
const rivalBeforeB178=rivalB163;
rivalB163=function(rank,i,...a){
 const r=rivalBeforeB178(rank,i,...a),pip=pipEntrantB163(),mid=Math.max(B163_BUDGET[rank],Math.round(totalB163(pip)*B178.trail));
 if(bracketSeedB178){const arch=B163_ARCH[(i+rank+bracketSeedB178%5)%B163_ARCH.length];Object.assign(r,{arch:arch.id,line:arch.line,ai:arch.ai})}
 r.stats=spreadStatsB178(r.arch,Math.round(mid*B163_SPREAD[i]));
 r.asc=Math.max(r.asc,pip.asc);
 r.perks={};for(const id in pip.perks||{})r.perks[id]=Math.floor((pip.perks[id]||0)*B178.mirror);
 r.labour={tf:(pip.labour?.tf||0)*B178.mirror,sf:(pip.labour?.sf||0)*B178.mirror};
 const t=B178_TRICK[r.arch];if(t&&rank>=B178.trickRank[t]){r.trick=t;r.line=`${r.line}; ${B178_LINE[t]}`}
 return r;
};
// Feint: the rival winds up before every Ascend (a glow ring); every other wind-up is fake, and guarding against a
// fake one flinches the guard (B178.bait glow). Breaker: Focuses straight into a raised guard.
const aiCmdBeforeB178=aiCmdB163;
aiCmdB163=function(me,op,t,...a){
 const c=aiCmdBeforeB178(me,op,t,...a);
 if(me.src.trick==='breaker'&&op.guarding&&me.focusCd<=0)c.focus=true;
 if(me.src.trick!=='feint')return c;
 me.feintCd=Math.max(0,(me.feintCd||0)-B163_DT);
 if(me.windT>0){me.windT-=B163_DT;c.ascend=false;if(me.windT<=0){me.windT=0;if(me.windReal)c.ascend=me.heat>=70&&me.ascT<=0;else{me.feintCd=B178.feintCd;if(op.guarding){op.glow=Math.max(0,op.glow-B178.bait);if(op.glow<=0){op.guarding=false;op.broken=3}}}}}
 else if(me.heat>=70&&me.ascT<=0&&op.ascT<=0&&me.feintCd<=0){c.ascend=false;me.windN=(me.windN||0)+1;me.windReal=me.windN%2===0;me.windT=B178.wind} // winds up as soon as it can, while Pip can still guard
 else if(op.ascT<=0)c.ascend=false; // waiting out a feint's cooldown; an Ascended Pip can't guard, so then it just ascends
 return c;
};
// Breaker: a homing (Focus) shot that lands on a raised Guard hits at full strength and cracks its glow.
const landShotBeforeB178=landShotB163;
landShotB163=function(f,s,...a){
 const att=s.from?f.b:f.a,def=s.from?f.a:f.b,guarded=def.guarding,hp=def.hp,r=landShotBeforeB178(f,s,...a);
 if(s.hit&&s.homing&&guarded&&att.src.trick==='breaker'){def.hp-=3*Math.max(0,hp-def.hp)} // the guard's 75% block doesn't apply
 if(s.hit&&s.homing&&guarded&&att.src.trick==='breaker'&&def.guarding){def.glow=Math.max(0,def.glow-B178.crack);if(def.glow<=0){def.guarding=false;def.broken=3;f.events.push({t:f.t,kind:'break',side:def.side})}}
 return r;
};
// The wind-up is drawn the same for real and fake: a pulsing amber ring and "WIND-UP".
const drawPipBeforeB178=drawPipB165;
drawPipB165=function(fi,p,t,face,...a){
 const r=drawPipBeforeB178(fi,p,t,face,...a);
 if(fi.windT>0){X.save();X.strokeStyle='#ffb347';X.globalAlpha=.55+.4*Math.sin(t*18);X.lineWidth=4;X.beginPath();X.arc(p.x,p.y,24+6*(1-fi.windT/B178.wind),0,Math.PI*2);X.stroke();
  X.globalAlpha=1;X.font=`700 11px ${B165_SERIF}`;X.textAlign='center';X.fillStyle='#ffcf7a';X.fillText('WIND-UP',p.x,p.y-38);X.restore()}
 return r;
};
