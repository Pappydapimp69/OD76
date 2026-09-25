
// B99 Pip Ranch: raise Pip between battle tests. Ranch drills set the ability
// levels Pip starts every run with; stage clears can end the run at the ranch.
const B99_RANCH_KEY="overdrive76_ranch_v1";
const B99_DRILLS={
 range:{name:"Scent Hunt",stat:"Heart Sense",icon:"♥",cap:10,base:6,growth:3},
 speed:{name:"Sky Laps",stat:"Swift Pip",icon:"➜",cap:4,base:8,growth:4},
 power:{name:"Star Target",stat:"Star Power",icon:"✦",cap:5,base:10,growth:5},
 guard:{name:"Glow Meditation",stat:"Guardian Glow",icon:"◇",cap:4,base:8,growth:4}
};
const B99_DRILL_FATIGUE=30,B99_TIRED=70,B99_REST=60,B99_DEATH_FATIGUE=60;
function ranchDefaultB99(){return{week:1,hearts:0,fatigue:0,tests:0,stats:{range:0,speed:0,power:0,guard:0},report:""}}
function loadRanchB99(){
 const r=ranchDefaultB99();
 try{
   const v=JSON.parse(localStorage.getItem(B99_RANCH_KEY)||"null");
   if(v&&typeof v==="object"){
     const n=(x,lo,hi)=>Number.isFinite(x)?Math.min(hi,Math.max(lo,Math.floor(x))):lo;
     r.week=n(v.week,1,1e6);r.hearts=n(v.hearts,0,1e9);r.fatigue=n(v.fatigue,0,100);r.tests=n(v.tests,0,1e6);
     for(const k in B99_DRILLS)r.stats[k]=n(v.stats?.[k],0,B99_DRILLS[k].cap);
     r.report=typeof v.report==="string"?v.report.slice(0,240):"";
   }
 }catch(_){}
 return r;
}
function saveRanchB99(){try{localStorage.setItem(B99_RANCH_KEY,JSON.stringify(ranchB99))}catch(_){}}
let ranchB99=loadRanchB99();

function drillCostB99(kind){const d=B99_DRILLS[kind];return d.base+ranchB99.stats[kind]*d.growth}
function drillBlockB99(kind){
 const d=B99_DRILLS[kind];if(!d)return"unknown";
 if(ranchB99.stats[kind]>=d.cap)return"capped";
 if(ranchB99.fatigue>=B99_TIRED)return"tired";
 if(ranchB99.hearts<drillCostB99(kind))return"hearts";
 return"";
}
function trainB99(kind){
 const block=drillBlockB99(kind);
 if(block){ranchNoteB99(block==="tired"?"Pip is too tired to train. Let him rest this week.":block==="capped"?`${B99_DRILLS[kind].stat} is as high as ranch training can take it.`:`Not enough ranch hearts for ${B99_DRILLS[kind].name}.`);renderRanchB99();return false}
 ranchB99.hearts-=drillCostB99(kind);ranchB99.stats[kind]++;
 ranchB99.fatigue=Math.min(100,ranchB99.fatigue+B99_DRILL_FATIGUE);ranchB99.week++;saveRanchB99();
 ranchNoteB99(`${B99_DRILLS[kind].name} done. ${B99_DRILLS[kind].stat} is now Lv ${ranchB99.stats[kind]} for every battle test.`);
 renderRanchB99();return true;
}
function restB99(){
 ranchB99.fatigue=Math.max(0,ranchB99.fatigue-B99_REST);ranchB99.week++;saveRanchB99();
 ranchNoteB99("Pip napped in the sun all week. He feels lighter.");
 renderRanchB99();
}

// Ranch levels are Pip's starting abilities each run; in-run purchases stack on top
// and are priced from the ranch level, so training never makes the stage shop dearer.
function applyRanchB99(){
 if(!S)return;
 S.b99Base={...ranchB99.stats};
 S.pipRangeLv=ranchB99.stats.range;S.pipSpeedLv=ranchB99.stats.speed;S.pipPowerLv=ranchB99.stats.power;S.pipGuardLv=ranchB99.stats.guard;
 S.b99Onward=false;S.b99Banked=false;
 applyPipPower();
}
pipAbilityCost=function(kind){
 const lv=Math.max(0,pipAbilityLevel(kind)-(S?.b99Base?.[kind]||0));
 const base=kind==="range"?5:kind==="speed"?6:8;
 const growth=kind==="range"?2:kind==="speed"?3:4;
 return base+lv*growth;
};

function unspentHeartsB99(){return Math.max(0,Math.floor(S?.heartCurrency||0))}
function bankRunB99(dead){
 if(!S||S.b99Banked)return 0;
 S.b99Banked=true;
 // Only hearts left unspent after in-run upgrades go home to the ranch.
 const unspent=unspentHeartsB99(),earned=dead?Math.floor(unspent/2):unspent;
 ranchB99.hearts+=earned;ranchB99.tests++;
 if(dead)ranchB99.fatigue=Math.max(ranchB99.fatigue,B99_DEATH_FATIGUE);
 ranchB99.report=dead
   ?`Battle test ${ranchB99.tests}: fell on stage ${S.stage}. Pip brought home ♥ ${earned} of ♥ ${unspent} unspent and came back worn out.`
   :`Battle test ${ranchB99.tests}: came home after clearing stage ${S.stage}. Pip brought home all ♥ ${earned} unspent.`;
 saveRanchB99();
 return earned;
}

(function installRanchB99(){
 const style=document.createElement("style");
 style.id="ranchStyleB99";
 style.textContent=`#ranchB99 .card{width:min(640px,94vw);max-height:calc(100dvh - 24px);overflow:auto}
#ranchB99 .b99Status{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;align-items:center;margin:10px 0;font-size:13px}
#ranchB99 .b99Fatigue{height:8px;border-radius:999px;background:#ffffff14;overflow:hidden}
#ranchB99 .b99Fatigue i{display:block;height:100%;background:linear-gradient(90deg,var(--green),var(--gold),var(--hot));transition:width .2s}
#ranchB99 .b99Note{min-height:1.4em;color:#ffe7a3;font-size:12px;margin:8px 0}
#ranchB99 .b99Report{color:var(--muted);font-size:12px;margin:0 0 8px}
#ranchB99 .b99Actions,#ranchGateStepB99 .b99Actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
#ranchB99 button.gamepad-focus{outline:3px solid #7ed8ff;outline-offset:3px;box-shadow:0 0 0 5px #7ed8ff18,0 0 24px #7ed8ff44}
#openRanchB99{width:100%;margin-top:8px}
@media(max-width:560px){#ranchB99 .b99Actions,#ranchGateStepB99 .b99Actions{grid-template-columns:1fr}}`;
 document.head.appendChild(style);

 const modal=document.createElement("div");modal.id="ranchB99";modal.className="modal hidden";
 modal.innerHTML=`<div class="card"><div class="kicker" id="ranchWeekB99">PIP RANCH · WEEK 1</div><h2>Pip's ranch</h2>
<p class="b99Report" id="ranchReportB99"></p>
<div class="b99Status"><b>Ranch hearts</b><span id="ranchHeartsB99">♥ 0</span><b>Fatigue</b><div class="b99Fatigue"><i id="ranchFatigueB99" style="width:0%"></i></div></div>
<div class="abilitygrid">${Object.keys(B99_DRILLS).map(k=>`<button id="drillB99_${k}" class="upgrade" type="button"></button>`).join("")}</div>
<div class="b99Note" id="ranchNoteB99"></div>
<div class="b99Actions"><button id="ranchRestB99" class="primary" type="button">Rest a week</button><button id="ranchBattleB99" class="startBtn" type="button">Battle test</button></div></div>`;
 document.getElementById("app").appendChild(modal);
 for(const k in B99_DRILLS)$("drillB99_"+k).addEventListener("click",()=>trainB99(k));
 $("ranchRestB99").addEventListener("click",restB99);
 $("ranchBattleB99").addEventListener("click",startBattleTestB99);

 const gate=document.createElement("div");gate.id="ranchGateStepB99";gate.className="stagehidden";
 gate.innerHTML=`<h2>Keep going or head home?</h2><p id="ranchGateTextB99"></p><div class="b99Actions"><button id="nextStageB99" class="startBtn" type="button">Next stage</button><button id="returnRanchB99" class="primary" type="button">Return to ranch</button></div>`;
 $("stageUp").querySelector(".card").appendChild(gate);
 $("nextStageB99").addEventListener("click",continueStageB99);
 $("returnRanchB99").addEventListener("click",returnToRanchB99);

 const open=document.createElement("button");open.id="openRanchB99";open.className="primary";open.type="button";open.textContent="Pip Ranch";
 const actions=$("start").querySelector(".b75LaunchActions")||$("begin");
 actions.insertAdjacentElement("afterend",open);
 open.addEventListener("click",openRanchB99);

 const home=document.createElement("button");home.id="endRanchB99";home.className="primary";home.type="button";home.textContent="Pip Ranch";
 $("again").insertAdjacentElement("afterend",home);
 home.addEventListener("click",openRanchB99);
})();

function ranchNoteB99(text){const el=$("ranchNoteB99");if(el)el.textContent=text||""}
function ranchMoodB99(){
 if(ranchB99.fatigue>=B99_TIRED)return"Pip is curled up and exhausted.";
 if(ranchB99.fatigue>=40)return"Pip is tired but game.";
 return"Pip is bouncing around the ranch.";
}
function renderRanchB99(){
 $("ranchWeekB99").textContent=`PIP RANCH · WEEK ${ranchB99.week}`;
 $("ranchHeartsB99").textContent=`♥ ${ranchB99.hearts}`;
 $("ranchFatigueB99").style.width=ranchB99.fatigue+"%";
 $("ranchReportB99").textContent=(ranchB99.report?ranchB99.report+" ":"")+ranchMoodB99();
 for(const k in B99_DRILLS){
   const d=B99_DRILLS[k],lv=ranchB99.stats[k],btn=$("drillB99_"+k),block=drillBlockB99(k);
   const tail=block==="capped"?"MAX":`→ ${lv+1} · ♥ ${drillCostB99(k)}`;
   btn.innerHTML=`<div class="heart">${d.icon}</div><b>${d.name} · ${d.stat} Lv ${lv} ${tail}</b><span class="small">${block==="tired"?"Too tired to train.":`Starts every test at this level. +${B99_DRILL_FATIGUE} fatigue.`}</span>`;
   btn.disabled=!!block;btn.classList.toggle("ready",!block);
 }
}
function openRanchB99(){
 $("start").classList.add("hidden");$("end").classList.add("hidden");$("stageUp").classList.add("hidden");
 ranchNoteB99("");renderRanchB99();
 $("ranchB99").classList.remove("hidden");
}
function startBattleTestB99(){
 $("ranchB99").classList.add("hidden");
 reset();
 $("begin").click();
}

function stageStepsB99(){return["overdriveStep","bossRewardStep","emotionStep","abilityStep","audioStep","pipSoundStep"].map(id=>$(id)).filter(Boolean)}
function openRanchGateB99(){
 for(const el of stageStepsB99())el.classList.add("stagehidden");
 const kicker=$("stageUp").querySelector(".kicker");if(kicker)kicker.textContent=`STAGE ${S.stage} CLEAR · BATTLE TEST`;
 const n=unspentHeartsB99(),spent=Math.max(0,Math.floor(S.runHearts||0)-n);
 $("ranchGateTextB99").textContent=`Pip is carrying ♥ ${n} unspent${spent?` (♥ ${spent} went into upgrades)`:""}. Go home now and the ranch banks all of it. Fall in battle and it banks half.`;
 $("ranchGateStepB99").classList.remove("stagehidden");
 $("stageUp").classList.remove("hidden");
}
function closeRanchGateB99(){
 $("ranchGateStepB99").classList.add("stagehidden");$("stageUp").classList.add("hidden");
 $("emotionStep")?.classList.remove("stagehidden");
}
function continueStageB99(){
 if(!S?.stagePending)return;
 closeRanchGateB99();
 S.b99Onward=true;advanceToNextStage();
}
function returnToRanchB99(){
 if(!S?.stagePending)return;
 closeRanchGateB99();
 bankRunB99(false);
 S.stagePending=false;S.end=true;S.run=false;
 openRanchB99();
}

const renderAbilityShopBeforeB99=renderAbilityShop;
renderAbilityShop=function(){renderAbilityShopBeforeB99();const el=$("abilityBalance");if(el&&el.textContent.includes("Heart Bits"))el.textContent+=" · unspent hearts go home to the ranch"};

const advanceBeforeB99=advanceToNextStage;
advanceToNextStage=function(){
 if(S?.stagePending&&!S.b99Onward&&!S.end){openRanchGateB99();return}
 if(S)S.b99Onward=false;
 return advanceBeforeB99();
};

const finishBeforeB99=finish;
finish=function(dead){
 const ended=S?.end;
 finishBeforeB99(dead);
 if(ended||!dead)return;
 const earned=bankRunB99(true),el=$("endText");
 if(el)el.textContent+=` The ranch banked ♥ ${earned} (half of this test), and Pip comes home worn out.`;
};

const resetBeforeB99=reset;
reset=function(){resetBeforeB99();$("ranchB99")?.classList.add("hidden");applyRanchB99();updateUI()};
applyRanchB99();

// Controller navigation covers the ranch the same way it covers stage screens.
const stageUpgradeVisibleBeforeB99=stageUpgradeVisibleB35;
stageUpgradeVisibleB35=function(){return ranchVisibleB99()||stageUpgradeVisibleBeforeB99()};
const gamepadMenuButtonsBeforeB99=gamepadMenuButtonsB35;
gamepadMenuButtonsB35=function(){
 if(!ranchVisibleB99())return gamepadMenuButtonsBeforeB99();
 return[...$("ranchB99").querySelectorAll("button")].filter(b=>!b.disabled);
};
function ranchVisibleB99(){return !!($("ranchB99")&&!$("ranchB99").classList.contains("hidden"))}
