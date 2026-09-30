
// B119 Farm weeks: you water the crops yourself, free, even when Pip is tired. Every crop needs water each
// ranch week: one dry week grows it half a week, a second dry week in a row grows nothing, a third withers it.
// Every week that ends (rest or battle test) gets a long black transition; training no longer passes time.
const B119_DRY_GROWTH=[1,.5,0],B119_WITHER_WEEKS=3,B119_FADE_IN=2,B119_TEXT_IN=.3,B119_FADE_HOLD=.5,B119_FADE_OUT=2,B119_TEXT_HOLD=5;
const B119_WEEK_WHY={rest:"Pip rested.",battle:"Back from the arena."};

// ---- plot state: half-week growth and consecutive dry weeks survive a reload ----
function farmWeekFieldsB119(r,raw){
 (r.plots||[]).forEach((p,i)=>{
   const q=raw?.plots?.[i]||{},cr=p.crop&&B105_CROPS[p.crop];
   p.dry=cr?Math.max(0,Math.min(B119_WITHER_WEEKS-1,Math.floor(+q.dry||0))):0;
   if(cr&&Number.isFinite(+q.stage))p.stage=Math.max(0,Math.min(cr.weeks,Math.round(+q.stage*2)/2));
 });
 return r;
}
const loadRanchBeforeB119=loadRanchB99;
loadRanchB99=function(){return farmWeekFieldsB119(loadRanchBeforeB119(),rawRanchB118())};
ranchB99=farmWeekFieldsB119(ranchB99,rawRanchB118());

// ---- watering is the player's job: no fatigue, and a tired Pip doesn't stop it ----
waterB105=function(i){
 const p=plotB105(i);
 if(!ranchB99.tools.can||!p?.crop||p.watered||plotRipeB105(p))return false;
 p.watered=true;saveRanchB99();return true;
};
const pipActionBeforeB119=pipActionForB109;
pipActionForB109=function(near){const a=pipActionBeforeB119(near);return a?.kind==="water"?null:a};

// ---- growth when a week ends: watered +1, first dry week +0.5, second +0, third withers ----
function dryTextB119(p){
 if(p.watered)return "Watered this week.";
 if(p.dry>=2)return "Dry for 2 weeks! Water it now or it withers when this week ends.";
 if(p.dry===1)return "Dry last week. Another dry week and it stops growing.";
 return "Not watered yet. A dry week only grows it half as much.";
}
const weekPassedBeforeB119=weekPassedB104;
weekPassedB104=function(kind){
 if(kind==="drill")return;
 const before=ranchB99.plots.map(p=>({crop:p.crop,watered:!!p.watered,ripe:plotRipeB105(p),stage:p.stage}));
 const r=weekPassedBeforeB119(kind),report={grew:0,half:0,stalled:0,withered:[]};
 ranchB99.plots.forEach((p,i)=>{
   const b=before[i];if(!b.crop||b.ripe||p.crop!==b.crop)return;
   if(b.watered){p.dry=0;report.grew++;return}
   p.dry=(p.dry||0)+1;
   if(p.dry>=B119_WITHER_WEEKS){report.withered.push(p.crop);p.crop=null;p.stage=0;p.watered=false;p.dry=0;return}
   const g=B119_DRY_GROWTH[p.dry];p.stage=Math.min(B105_CROPS[p.crop].weeks,b.stage+g);
   if(g>0)report.half++;else report.stalled++;
 });
 saveRanchB99();queueWeekFadeB119(kind,report);
 return r;
};

// ---- the week fade: screen dims to "Week N" and comes back ----
let weekFadeB119={pending:null,last:null,timer:null};
function weekSummaryB119(kind,report){
 const bits=[B119_WEEK_WHY[kind]||"A week passed."];
 if(report.grew)bits.push(`${report.grew} crop${report.grew===1?"":"s"} grew`);
 if(report.half)bits.push(`${report.half} grew half (dry)`);
 if(report.stalled)bits.push(`${report.stalled} stopped growing (dry)`);
 if(report.withered.length)bits.push(`${report.withered.map(c=>B104_ITEMS[c]?.icon||"").join("")} withered`);
 return bits.join(" · ");
}
function ensureWeekFadeB119(){
 let el=$("weekFadeB119");if(el)return el;
 el=document.createElement("div");el.id="weekFadeB119";el.setAttribute("role","status");el.innerHTML="<b></b><span></span>";
 document.body.appendChild(el);
 const style=document.createElement("style");style.id="weekFadeStyleB119";
 style.textContent="#weekFadeB119{position:fixed;inset:0;z-index:60;display:grid;place-content:center;gap:10px;padding:16px;text-align:center;background:#000;color:#fff;opacity:0;pointer-events:none}#weekFadeB119.on{animation:b119Shade 4.8s linear}#weekFadeB119 b,#weekFadeB119 span{opacity:0}#weekFadeB119.on b,#weekFadeB119.on span{animation:b119WeekText 7.6s linear}#weekFadeB119 b{font-size:clamp(34px,9vw,64px);font-weight:950;letter-spacing:-.03em}#weekFadeB119 span{font-size:14px;max-width:min(520px,90vw);margin:0 auto}@keyframes b119Shade{0%{opacity:0}41.667%,58.333%{opacity:1}100%{opacity:0}}@keyframes b119WeekText{0%,26.315%{opacity:0}30.263%,96.052%{opacity:.6}100%{opacity:0}}";
 document.head.appendChild(style);
 return el;
}
function sfxWeekTwinkleB119(){
 if(!ensureAudio()||!sfxGateB42(audioEngine,"b119Twinkle",.5))return false;
 const e=audioEngine,t=audioCtx.currentTime+.02;
 [84,88,91,96].forEach((m,i)=>e.fmBell(MIDI_FREQ(m),t+i*.09,i===3?.5:.24,.018*(1-i*.08),(i-1.5)*.15,e.sfx));
 return true;
}
function playWeekFadeB119(f){
 const el=ensureWeekFadeB119();
 el.querySelector("b").textContent=`Week ${f.week}`;el.querySelector("span").textContent=f.text;
 weekFadeB119.last={...f,shownAt:Date.now()};weekFadeB119.pending=null;
 clearTimeout(weekFadeB119.timer);clearTimeout(weekFadeB119.twinkleTimer);el.classList.remove("on");void el.offsetWidth;el.classList.add("on");
 weekFadeB119.twinkleTimer=setTimeout(()=>{if(f.kind==="rest")weekFadeB119.last.twinkled=sfxWeekTwinkleB119()},(B119_FADE_IN+B119_TEXT_IN+B119_FADE_HOLD+B119_FADE_OUT)*1000);
 weekFadeB119.timer=setTimeout(()=>el.classList.remove("on"),(B119_FADE_IN+B119_TEXT_IN+B119_TEXT_HOLD+B119_TEXT_IN)*1000);
}
function queueWeekFadeB119(kind,report){
 const f={week:ranchB99.week,kind,report,text:weekSummaryB119(kind,report)};
 // Battle weeks show once the ranch opens.
 if(ranchWorldB100.active&&!weekFadeB119.holdForGame)playWeekFadeB119(f);else weekFadeB119.pending=f;
}
const startGameBeforeB119=startGameB100;
startGameB100=function(...a){weekFadeB119.holdForGame=true;try{return startGameBeforeB119(...a)}finally{weekFadeB119.holdForGame=false}};
const finishGameBeforeB119=finishGameB100;
finishGameB100=function(...a){const r=finishGameBeforeB119(...a);if(weekFadeB119.pending&&ranchWorldB100.active&&!ranchWorldB100.game)playWeekFadeB119(weekFadeB119.pending);return r};
const enterRanchBeforeB119=enterRanchB100;
enterRanchB100=function(){enterRanchBeforeB119();if(weekFadeB119.pending)playWeekFadeB119(weekFadeB119.pending)};
openRanchB99=enterRanchB100;
for(const id of ["openRanchB99","endRanchB99"]){const old=$(id);if(!old)continue;const b=old.cloneNode(true);old.replaceWith(b);b.addEventListener("click",enterRanchB100)}

// ---- sheets and plots show the dry state ----
const plotSheetBeforeB119=plotSheetB105;
plotSheetB105=function(i){
 plotSheetBeforeB119(i);
 const p=plotB105(i);if(!p?.crop||plotRipeB105(p))return;
 const el=ranchWorldB100.sheet&&$("ranchSheetB100")?.querySelector("p");if(!el)return;
 el.textContent=`${B104_ITEMS[p.crop].name}: ${p.stage}/${B105_CROPS[p.crop].weeks} weeks grown. ${dryTextB119(p)}${!ranchB99.tools.can&&!p.watered?" Buy a watering can at the stall.":""}`;
};
const gardenSheetBeforeB119=gardenSheetB105;
gardenSheetB105=function(){
 gardenSheetBeforeB119();
 if(!ranchB99.areas.garden)return;
 const el=ranchWorldB100.sheet&&$("ranchSheetB100")?.querySelector("p");if(!el)return;
 const risk=ranchB99.plots.filter(p=>p.crop&&!p.watered&&p.dry>=2&&!plotRipeB105(p)).length;
 el.textContent=el.textContent.replace("Watered crops grow one stage each ranch week.","You water the crops yourself. Each week a crop needs water: dry once grows half, dry twice grows nothing, dry three weeks in a row withers it.")+(risk?` ${risk} plot${risk===1?"":"s"} will wither if this week ends dry!`:"");
};
const drawStationBeforeB119=drawStationB100;
drawStationB100=function(st,t){
 drawStationBeforeB119(st,t);
 if(st.id!=="garden"||!ranchB99.areas.garden)return;
 for(let i=0;i<B105_PLOTS;i++){
   const p=plotB105(i),q=B105_PLOT_POS[i];if(!p.crop||p.watered||plotRipeB105(p))continue;
   X.globalAlpha=p.dry>=2?.55+.45*Math.abs(Math.sin((t||0)*5)):p.dry===1?.9:.6;
   X.font="16px system-ui";X.textAlign="center";X.fillText(p.dry>=2?"🥀":"💧",q.x+22,q.y-18);
   X.globalAlpha=1;
 }
};
