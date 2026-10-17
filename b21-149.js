
// B131 Overdrive mastery. Each basic skill (Beam, Thunderstorm, Guardian, Nova, Gravity Well) has a level 1-5 and
// five mastery tiers per level. A tier needs cumulative uses of the skill this level (ignitions while equipped) AND
// stars; a level-up needs all five tiers and ★10, and restarts the uses. Level 1's tiers unlock the old Lv 1-5 kit
// (S.overLevels now holds that "feature level", so every older skill module keeps reading it). Levels 2-5 add power
// (+10% at T1 and T4), reach (+7.5% at T2), a visual step (T3, T5) and a signature bump (T5). Power starts at 60%
// and reach at 85% of the old numbers. Each level lowers that skill's ignition by 1% (25 -> 21); every tier 3
// reached speeds HEAT regen by 0.1s per point. Pip Ascendant keeps its old unlock/upgrade path.
const B131_TIER_USES=[1,2,5,7,10],B131_TIER_STARS=[2,2,5,3,3],B131_LEVEL_STARS=10,B131_MAX_LEVEL=5;
const B131_POWER_BASE=.6,B131_POWER_STEP=.1,B131_REACH_BASE=.85,B131_REACH_STEP=.075;
const B131_REGEN_STEP=.1,B131_REGEN_MIN=.1,B131_SIG_REFLECT=.25,B131_SIG_MASS=5;
const B131_COLOR={beam:'#fff0a8',storm:'#9ee7ff',guardian:'#bfe9ff',nova:'#ff9fba',gravity:'#d7b2ff'};

function masteryOnB131(id){return B38_BASIC_OVERDRIVES.includes(id)}
function masteryB131(id){
 if(!S||!masteryOnB131(id)||!S.overUnlocked?.has(id))return null;
 S.b131=S.b131||{};return S.b131[id]||(S.b131[id]={lv:1,t:0,u:0});
}
function featureLevelB131(m){return m.lv>=2?5:clamp(m.t,1,5)}
// Bonus counts from levels 2+ (a finished level 2..lv-1 gives every tier; the current level gives what's reached).
function bonusB131(id){
 const m=masteryB131(id);if(!m)return {power:0,reach:0,flair:0,sig:0};
 const full=Math.max(0,m.lv-2),cur=m.lv>=2?m.t:0;
 return {power:2*full+(cur>=1)+(cur>=4),reach:full+(cur>=2),flair:2*full+(cur>=3)+(cur>=5),sig:full+(cur>=5)};
}
function powerMultB131(id){return masteryB131(id)?B131_POWER_BASE+B131_POWER_STEP*bonusB131(id).power:1}
function reachMultB131(id){return masteryB131(id)?B131_REACH_BASE+B131_REACH_STEP*bonusB131(id).reach:1}
function tierUsesB131(t){return B131_TIER_USES[t]}
function nextStepB131(id){
 const m=masteryB131(id);if(!m)return null;
 if(m.t<5)return {kind:'tier',tier:m.t+1,uses:tierUsesB131(m.t),stars:B131_TIER_STARS[m.t]};
 if(m.lv<B131_MAX_LEVEL)return {kind:'level',level:m.lv+1,stars:B131_LEVEL_STARS};
 return {kind:'done'};
}
function tierThreesB131(){
 let n=0;for(const id of B38_BASIC_OVERDRIVES){const m=masteryB131(id);if(m)n+=(m.lv-1)+(m.t>=3)}
 return n;
}
function igniteThresholdB131(id=S?.overType){
 if(id==='pip')return B94_PIP_IGNITION_PERCENT;
 const m=masteryB131(id);return B94_IGNITION_PERCENT-(m?m.lv-1:0);
}

// ---- tables the older modules read at fire time (rebuilt from their base copies on every mastery change) ----
const B131_BASE={pulse:B117G_PULSE.map(p=>({...p})),reflect:[...B117G_REFLECT]};
function applyMasteryB131(){
 if(!S)return;
 for(const id of B38_BASIC_OVERDRIVES){const m=masteryB131(id);if(m)S.overLevels[id]=featureLevelB131(m)}
 const reach=reachMultB131('guardian'),sig=bonusB131('guardian').sig;
 B117G_PULSE.forEach((p,i)=>{p.r=B131_BASE.pulse[i].r*reach});
 B117G_REFLECT.forEach((_,i)=>{B117G_REFLECT[i]=B131_BASE.reflect[i]*(1+B131_SIG_REFLECT*sig)});
 S.heatMax=heatCapacityB38();
}

// ---- uses: every new ignition of the equipped basic skill (S.overdrives counts them all) ----
function creditUsesB131(){
 if(!S)return;const n=S.overdrives||0,seen=S.b131Seen??n;S.b131Seen=n;
 if(n<=seen)return;const m=masteryB131(S.overType);if(!m)return;
 m.u+=n-seen;
 if(S.overType==='storm'&&typeof skillB117==='function')skillB117('storm').n+=n-seen; // B117 stats never saw Storm
}
const updateBeforeB131=update;
update=function(dt){creditUsesB131();const r=updateBeforeB131(dt);creditUsesB131();return r};
const resetBeforeB131=reset;
reset=function(...a){const r=resetBeforeB131(...a);if(S){S.b131={};S.b131Seen=S.overdrives||0;masteryB131('beam');applyMasteryB131()}return r};

// ---- HEAT: per-skill ignition and tier-3 regen ----
skillGateB116b=function(id=S?.overType){return igniteThresholdB131(id)};
heatRegenRateB115=function(){
 const secs=Math.max(B131_REGEN_MIN,B115_HEAT_REGEN_SECONDS-B131_REGEN_STEP*tierThreesB131());
 return 100/heatCapacityB38()/secs*heatRegenNeedB115b();
};

// ---- power, visual steps ----
const hitEnemyBeforeB131=hitEnemy;
hitEnemy=function(e,power=1,source='player'){
 const id=S?.overType,skill=masteryOnB131(id)&&(source==='overdrive'||(source==='player'&&id==='beam'&&S.over>0));
 if(!skill)return hitEnemyBeforeB131(e,power,source);
 const flair=bonusB131(id).flair,out=hitEnemyBeforeB131(e,power*powerMultB131(id),source);
 if(flair>0&&e)particle(e.x,e.y,B131_COLOR[id],Math.min(8,flair),70+flair*12);
 return out;
};

// ---- reach + signature, per skill ----
const attackBeforeB131=attack;
attack=function(){
 if(!(S?.over>0&&S.overType==='beam'))return attackBeforeB131();
 const start=shots.length,out=attackBeforeB131(),reach=reachMultB131('beam'),sig=bonusB131('beam').sig;
 for(let i=start;i<shots.length;i++){shots[i].life*=reach;shots[i].pierce=(shots[i].pierce||1)+sig}
 return out;
};
const zapRangeBeforeB131=zapRangeB122;
zapRangeB122=function(lv){return zapRangeBeforeB131(lv)*reachMultB131('storm')};
const stormStrikeBeforeB131=stormStrikeB116a;
stormStrikeB116a=function(first,level,damage,origin=null){
 const hits=stormStrikeBeforeB131(first,level,damage,origin),sig=bonusB131('storm').sig;
 if(!sig||level<B116A_CHAIN_LEVEL||!first)return hits;
 const struck=new Set([first]);let from=first,extra=0;
 for(let k=0;k<sig+1;k++){ // the older strike already arced once; find that target first, then go further
  let best=null,bd=B116A_CHAIN_RANGE+B116A_EPS;
  for(const e of enemies){if(!e||e.dead||struck.has(e))continue;const d=hyp(e.x-from.x,e.y-from.y);if(d<=bd){best=e;bd=d}}
  if(!best)break;struck.add(best);
  if(k>0){addLightningB93(from.x,from.y,best.x,best.y,'#fff0a8',.28);hitEnemy(best,damage*B116A_CHAIN_DAMAGE,'overdrive');extra++}
  from=best;
 }
 return hits+extra;
};
const releaseNovaBeforeB131=releaseNovaB94;
releaseNovaB94=function(frac,lv){
 releaseNovaBeforeB131(frac,lv);
 const w=S?.b94NovaWaves;if(!w?.length)return;
 const feat=Math.max(1,overLevel('nova')),reach=reachMultB131('nova'),sig=bonusB131('nova').sig;
 if(feat<3)w.length=1;                          // L1 tier 3 unlocks the extra waves
 if(feat<5)for(const x of w)x.screen=false;     // L1 tier 5 unlocks the full-charge screen hit
 for(const x of w)x.radius*=reach;
 if(frac>=.999&&feat>=3)for(let i=0;i<sig;i++){const last=w[w.length-1];w.push({...last,delay:last.delay+B94_NOVA_WAVE_GAP,radius:last.radius*1.12})}
};
const releaseGravityBeforeB131=releaseGravityB94;
releaseGravityB94=function(frac,lv){releaseGravityBeforeB131(frac,lv);if(S?.b94Well)S.b94Well.radius*=reachMultB131('gravity')};
function gravityMassCapB131(){return 20+B131_SIG_MASS*bonusB131('gravity').sig}

// ---- buying tiers and levels at the boss reward ----
function masteryStepB131(id){
 const m=masteryB131(id),info=OVERDRIVE_INFO[id],next=nextStepB131(id);
 if(!m||!next||next.kind==='done'){showPipMessage(`${info.name} is fully mastered.`,true);return false}
 if(next.kind==='tier'&&m.u<next.uses){const need=next.uses-m.u;showPipMessage(`use ${info.name} ${need} more time${need===1?'':'s'} to reach tier ${next.tier}.`,true);return false}
 if(S.starPoints<next.stars){const need=next.stars-S.starPoints;showPipMessage(`we need ${need} more Run Star${need===1?'':'s'}.`,true);return false}
 const before=heatCapacityB38();S.starPoints-=next.stars;
 if(next.kind==='tier'){m.t++;showPipMessage(`${info.name} tier ${m.t} mastered ✦`,true)}
 else{m.lv++;m.t=0;m.u=0;showPipMessage(`${info.name} is level ${m.lv}. mastery starts over ✦`,true)}
 applyMasteryB131();const gain=S.heatMax-before;if(gain>0)popup(P.x,P.y-28,`HEAT CAP +${gain}`,'#ffd36f',true,1.0);
 if(navigator.vibrate)try{navigator.vibrate(35)}catch(_){}
 return true;
}
const completeOverdriveHoldBeforeB131=completeOverdriveHoldAction;
completeOverdriveHoldAction=function(id,...a){
 if(!S?.stagePending||!S.bossRewardPending)return false;
 if(!masteryB131(id)){const r=completeOverdriveHoldBeforeB131(id,...a);if(r&&masteryB131(id))applyMasteryB131();return r}
 const r=masteryStepB131(id);repeatKeyB117q=r?'o:'+id:null;return r;
};

// ---- interim readout on the current Overdrive cards (the page itself is redesigned in B132) ----
function masteryActionB131(id){
 const m=masteryB131(id),next=nextStepB131(id);if(!m)return '';
 if(next.kind==='done')return 'FULLY MASTERED';
 if(next.kind==='level')return S.starPoints>=next.stars?`HOLD · LEVEL UP TO ${next.level} · ★${next.stars}`:`LEVEL UP NEEDS ★${next.stars}`;
 if(m.u<next.uses)return `TIER ${next.tier}: USE IT ${next.uses-m.u} MORE · ${m.u}/${next.uses} USES THIS LEVEL`;
 return S.starPoints>=next.stars?`HOLD · UNLOCK TIER ${next.tier} · ★${next.stars}`:`TIER ${next.tier} NEEDS ★${next.stars}`;
}
const renderOverdriveStepBeforeB131=renderOverdriveStep;
renderOverdriveStep=function(...a){
 const r=renderOverdriveStepBeforeB131(...a);
 OVER_ORDER.forEach((id,i)=>{
  const m=masteryB131(id),btn=$('overChoice'+i);if(!m||!btn)return;
  const b=btn.querySelector('b'),strong=btn.querySelector('strong');
  if(b)b.textContent=`${OVERDRIVE_INFO[id].name} · Lv ${m.lv} · Tier ${m.t}/5`;
  if(strong)strong.textContent=`${S.overType===id?'SELECTED':'TAP TO SELECT'} · ${masteryActionB131(id)}`;
 });
 if($('starBalance'))$('starBalance').textContent=`★ ${S.starPoints} Run Stars · HEAT ${Math.round(heatEnergyB38())}/${heatCapacityB38()} · ${OVERDRIVE_INFO[S.overType]?.name||''} ignites at ${igniteThresholdB131()}%`;
 return r;
};
if(S){S.b131=S.b131||{};S.b131Seen=S.overdrives||0;masteryB131('beam');applyMasteryB131()}
if(overdriveHelpB94)overdriveHelpB94.textContent=`Only one skill is equipped. Skills ignite at ${B94_IGNITION_PERCENT}% HEAT, 1% less per skill level, and keep going while held. Using the equipped skill earns mastery uses; each tier needs uses and stars, and a level-up needs all five tiers. Ascended Pip needs ${B94_PIP_IGNITION_PERCENT}% HEAT; tap once and it drains automatically.`;
