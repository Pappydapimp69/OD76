
// B115e Stage toll: each stage clear tires Pip (more the longer he spent away fetching hearts)
// and costs a little food and cleanliness, so banking a test no longer drains them a second time.
// Low meters bite live in the run: hunger slows HEAT regen, fatigue slows the player's attacks
// and movement, grime weakens Guardian Glow. At fatigue 100 Pip can only go home.
const B115_TOLL_CAP=25,B115_AWAY_STEP=6,B115_EXHAUSTED=100;
// [meter at or above, multiplier, word]; the first matching row wins.
const B115_HUNGER=[[60,1,""],[40,.75,"hungry"],[20,.5,"very hungry"],[-Infinity,.25,"starving"]];
const B115_TIRED=[[80,.8,"worn out"],[60,.9,"tired"],[-Infinity,1,""]];
const B115_GRIME=[[60,1,""],[40,.85,"grubby"],[20,.7,"dirty"],[-Infinity,.55,"filthy"]];
const B115_STAT_PROPS={speed:"pipSpeedLv",power:"pipPowerLv",range:"pipRangeLv",guard:"pipGuardLv"};
function tierB115(v,tiers){const t=tiers.find(([min])=>(+v||0)>=min);return{mult:Math.max(.25,t[1]),word:t[2]}}
function hungerHeatMultB115(){return tierB115(ranchB99.hunger,B115_HUNGER).mult}
function tiredMultB115(){return tierB115(ranchB99.fatigue,B115_TIRED).mult}
function grimeGlowMultB115(){return tierB115(ranchB99.hygiene,B115_GRIME).mult}
function exhaustedB115(){return ranchB99.fatigue>=B115_EXHAUSTED}
function needNotesB115(){
 const pct=m=>Math.round(m*100)+"%",h=tierB115(ranchB99.hunger,B115_HUNGER),f=tierB115(ranchB99.fatigue,B115_TIRED),g=tierB115(ranchB99.hygiene,B115_GRIME),out=[];
 if(h.word)out.push(`Pip is ${h.word}: HEAT refills at ${pct(h.mult)} speed`);
 if(f.word)out.push(`Pip is ${f.word}: you attack and move at ${pct(f.mult)} speed`);
 if(g.word)out.push(`Pip is ${g.word}: Guardian Glow at ${pct(g.mult)} strength`);
 return out;
}
// b21-104 declares heatRegenNeedMultB115 (returning 1) and reads it for HEAT regen. The game runs
// under "use strict", so without that module a plain assignment throws; fall back to a global.
try{heatRegenNeedMultB115=hungerHeatMultB115}catch(_){globalThis.heatRegenNeedMultB115=hungerHeatMultB115}

// ---- away time: only live stage play counts (not pause, wave breaks, the gate or a finished run) ----
function awayLiveB115(){return !!(S?.run&&!S.end&&!S.b39Paused&&!S.stagePending&&(S.waveState==="active"||S.waveState==="boss"))}
const updateBeforeB115=update;
update=function(dt){
 if(S&&S.b115Stage!==S.stage){S.b115Stage=S.stage;S.b115Away=0}
 const away=awayLiveB115()&&pipAwayB49();
 updateBeforeB115(dt);
 if(away&&S&&dt>0)S.b115Away+=dt;
};

// ---- the toll, charged once per stage when the stage-end gate opens ----
function tollFatigueB115(stage,away){return Math.min(B115_TOLL_CAP,4+stage+Math.floor(away/B115_AWAY_STEP+1e-9))}
function tollNeedB115(stage){return 3+Math.ceil(stage/2)}
function stageTollB115(){
 if(!S)return null;if(S.b115TollStage===S.stage)return S.b115Toll;
 const r=ranchB99,was={fatigue:r.fatigue,hunger:r.hunger,hygiene:r.hygiene},away=S.b115Stage===S.stage?S.b115Away||0:0,need=tollNeedB115(S.stage);
 r.fatigue=Math.min(100,r.fatigue+tollFatigueB115(S.stage,away));r.hunger=Math.max(0,r.hunger-need);r.hygiene=Math.max(0,r.hygiene-need);saveRanchB99();
 S.b115TollStage=S.stage;S.b115Toll={away,fatigue:r.fatigue-was.fatigue,hunger:r.hunger-was.hunger,hygiene:r.hygiene-was.hygiene};
 applyPipPower();return S.b115Toll;
}
// Stages carry the hunger and grime now: the battle-test week keeps week++ and its hooks but
// gets back exactly what the base week drained.
const weekBeforeB115=weekPassedB104;
weekPassedB104=function(kind){
 if(kind!=="battle")return weekBeforeB115(kind);
 const h=ranchB99.hunger,g=ranchB99.hygiene;weekBeforeB115(kind);
 ranchB99.hunger=Math.min(100,ranchB99.hunger+Math.min(h,B104_WEEK_HUNGER));ranchB99.hygiene=Math.min(100,ranchB99.hygiene+Math.min(g,B104_WEEK_DIRT.battle));saveRanchB99();
};

// ---- gate: meters, debuffs and the exhausted block ----
(function installTollGateB115(){
 const acts=$("ranchGateStepB99")?.querySelector(".b99Actions");if(!acts)return;
 const box=document.createElement("div");box.id="ranchGateMetersB115";
 box.innerHTML=`<div class="b115Meters" id="ranchGateBarsB115"></div><p id="ranchGateDebuffsB115" class="small"></p><p id="ranchGateExhaustB115" role="status"></p>`;
 acts.insertAdjacentElement("beforebegin",box);
 const s=document.createElement("style");s.id="tollStyleB115";
 s.textContent=`#ranchGateMetersB115{margin:8px 0 2px}#ranchGateMetersB115 .b115Meters{display:grid;grid-template-columns:auto 1fr;gap:5px 10px;align-items:center;font-size:14px}@media(max-width:560px){#ranchGateMetersB115 .b115Meters{font-size:12px}}
#ranchGateMetersB115 .b115Bar{height:7px;border-radius:999px;background:#ffffff14;overflow:hidden}#ranchGateMetersB115 .b115Bar i{display:block;height:100%}
#ranchGateMetersB115 .fat i{background:linear-gradient(90deg,var(--green),var(--gold),var(--hot))}#ranchGateMetersB115 .food i{background:linear-gradient(90deg,#ff9fb7,#ffe08a)}#ranchGateMetersB115 .clean i{background:linear-gradient(90deg,#9ee7ff,#9fe3c1)}
#ranchGateExhaustB115{color:var(--hot);font-weight:800}#ranchGateExhaustB115:empty,#ranchGateDebuffsB115:empty{display:none}#nextStageB99:disabled{opacity:.45;cursor:not-allowed}`;
 document.head.appendChild(s);
})();
function renderTollGateB115(){
 const bars=$("ranchGateBarsB115");if(!bars)return;
 const r=ranchB99,t=S?.b115Toll||{},sign=d=>d>0?`+${d}`:d<0?`−${-d}`:"±0";
 const row=(label,v,d,cls)=>`<span>${label} ${v} (${sign(d||0)})</span><div class="b115Bar ${cls}"><i style="width:${clamp(v,0,100)}%;background-size:${10000/Math.max(v,1)}% 100%"></i></div>`;
 bars.innerHTML=row("Tired",r.fatigue,t.fatigue,"fat")+row("Food",r.hunger,t.hunger,"food")+row("Clean",r.hygiene,t.hygiene,"clean");
 const notes=needNotesB115(),away=t.away>=1?`Pip spent ${Math.floor(t.away)}s away fetching hearts this stage. `:"";
 $("ranchGateDebuffsB115").textContent=away+(notes.length?notes.join(". ")+".":"No penalties: Pip feels fine.");
 const done=exhaustedB115();
 $("ranchGateExhaustB115").textContent=done?"Pip is exhausted — return to the ranch.":"";
 $("nextStageB99").disabled=done;
}
const gateBeforeB115=openRanchGateB99;
openRanchGateB99=function(){stageTollB115();gateBeforeB115();renderTollGateB115()};
const continueBeforeB115=continueStageB99;
continueStageB99=function(){if(S?.stagePending&&exhaustedB115()){renderTollGateB115();return false}return continueBeforeB115()};
// Backstop for any path that closes the gate and pushes onward (the button keeps B99's listener).
const advanceBeforeB115=advanceToNextStage;
advanceToNextStage=function(){
 if(S?.stagePending&&S.b99Onward&&!S.end&&exhaustedB115()){S.b99Onward=false;openRanchGateB99();return}
 return advanceBeforeB115();
};

// ---- live debuffs ----
const attackBeforeB115=attack;
attack=function(){const cd=S?.attackCd,out=attackBeforeB115(),m=tiredMultB115();if(S&&m<1&&S.attackCd>cd)S.attackCd/=m;return out};
const playerSpeedBeforeB115=playerSpeedB61;
playerSpeedB61=function(){return playerSpeedBeforeB115()*(S?.run?tiredMultB115():1)};
// Guardian Glow works from a scaled level while it takes effect; the real level is always restored.
function withGlowB115(fn,whole){
 const m=grimeGlowMultB115(),lv=S?.pipGuardLv;
 if(!S||m>=1||!(lv>0))return fn();
 S.pipGuardLv=whole?Math.floor(lv*m):lv*m;
 try{return fn()}finally{S.pipGuardLv=lv}
}
const applyPipPowerBeforeB115=applyPipPower;
applyPipPower=function(){return withGlowB115(applyPipPowerBeforeB115,false)};
const ascendantPulseBeforeB115=ascendantPulse;
ascendantPulse=function(){return withGlowB115(ascendantPulseBeforeB115,true)};

// B104's run-start level drops are gone (the live debuffs replace them); meal hooks and notes stay.
const runStartBeforeB115=runStartB104;
runStartB104=function(){
 if(!S||S.b104Started)return runStartBeforeB115();
 const undo=[...(ranchB99.hunger<B104_STARVING?["speed","power"]:[]),...(ranchB99.hygiene<B104_STARVING?["range","guard"]:[])];
 const lv={},base={...(S.b99Base||{})};for(const k of undo)lv[k]=S[B115_STAT_PROPS[k]];
 runStartBeforeB115();
 for(const k of undo)if(lv[k]>0){S[B115_STAT_PROPS[k]]++;if(S.b99Base&&base[k]>0)S.b99Base[k]++}
 S.b104Notes=[...needNotesB115(),...(S.b104Notes||[]).filter(n=>!/^Pip is (starving|filthy):/.test(n))];
 applyPipPower();
};
// Surface the debuffs (and run notes) in Pip's bubble at each stage start, after the wave greeting.
const startWaveBeforeB115=startWave;
startWave=function(n){
 const out=startWaveBeforeB115(n);
 if(S?.run&&S.stageWaveCount===1){const notes=n===1?S.b104Notes||[]:needNotesB115();if(notes.length&&$("pipMood")){showPipMessage(notes.join(" · "),true);$("pipMood").textContent="✦ "+notes.join(" · ")}}
 return out;
};
