// B126 Playtest quick fixes: release stale stage input, suppress iOS browser gestures, give every
// ranch sheet a visible exit, correct farm fatigue copy, and hide the arena-to-ranch handoff in black.

function releaseMovementB126(){
 keys.clear();gamepad.dx=0;gamepad.dy=0;
 const id=joy.id;joy.active=false;joy.id=null;joy.dx=0;joy.dy=0;
 if(id!=null)try{C.releasePointerCapture(id)}catch(_){}
 if(typeof hideJoyViz==='function')hideJoyViz();if(typeof resetDashTap==='function')resetDashTap();
 if(P){P.vx=0;P.vy=0}
 const w=ranchWorldB100;if(w?.stick){w.stick.id=null;w.stick.dx=0;w.stick.dy=0}
}
const openStageUpgradeBeforeB126=openStageUpgrade;
openStageUpgrade=function(...a){releaseMovementB126();return openStageUpgradeBeforeB126(...a)};
const advanceToNextStageBeforeB126=advanceToNextStage;
advanceToNextStage=function(...a){releaseMovementB126();return advanceToNextStageBeforeB126(...a)};

function textControlB126(el){return !!el?.closest?.('input,textarea,[contenteditable="true"]')}
function stopBrowserGestureB126(e){if(!textControlB126(e.target)&&e.target?.closest?.('#app'))e.preventDefault()}
document.addEventListener('dblclick',stopBrowserGestureB126,{capture:true,passive:false});
document.addEventListener('gesturestart',stopBrowserGestureB126,{capture:true,passive:false});
document.addEventListener('selectstart',stopBrowserGestureB126,{capture:true,passive:false});
(function styleTouchB126(){const s=document.createElement('style');s.id='touchFixStyleB126';s.textContent=`#app{touch-action:manipulation;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}#app button{touch-action:manipulation;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}#ranchSurveyB117 input,#ranchSurveyB117 textarea{touch-action:manipulation;-webkit-user-select:text;user-select:text}`;document.head.appendChild(s)})();

const openSheetBeforeB126=openSheetB100;
openSheetB100=function(title,text,options,...rest){
 const opts=[...(options||[])],close=opts.find(o=>o?.quiet&&!o.run);
 if(close)close.label='Back / Exit';else opts.push({label:'Back / Exit',quiet:true});
 return openSheetBeforeB126(title,text,opts,...rest);
};

function farmFatigueTextB126(){return`Only tilling adds fatigue (+${B106_TOOL_FATIGUE.till}). Planting and watering add no fatigue.`}
const plotSheetBeforeB126=plotSheetB105;
plotSheetB105=function(i){
 const r=plotSheetBeforeB126(i),p=plotB105(i),el=ranchWorldB100.sheet&&$('ranchSheetB100')?.querySelector('p');if(!el)return r;
 if(p?.tilled)el.textContent=el.textContent.replace(' Pip is too tired for tool work; let him rest.','');
 el.textContent+=` ${farmFatigueTextB126()}`;return r;
};
const gardenSheetBeforeB126=gardenSheetB105;
gardenSheetB105=function(){const r=gardenSheetBeforeB126(),el=ranchWorldB100.sheet&&$('ranchSheetB100')?.querySelector('p');if(el&&!el.textContent.includes('Only tilling adds fatigue'))el.textContent+=` ${farmFatigueTextB126()}`;return r};

let arenaReturnDelayB126=600,arenaReturnTimerB126=0;
const playWeekFadeBeforeB126=playWeekFadeB119;
function playArenaWeekFromBlackB126(f){
 const el=ensureWeekFadeB119();el.querySelector('b').textContent=`Week ${f.week}`;el.querySelector('span').textContent=f.text;
 weekFadeB119.last={...f,shownAt:Date.now()};weekFadeB119.pending=null;weekFadeB119.fromArena=false;weekFadeB119.returning=false;
 clearTimeout(weekFadeB119.timer);clearTimeout(weekFadeB119.twinkleTimer);el.classList.remove('on','b126-preblack','b126-fromblack');void el.offsetWidth;el.classList.add('b126-fromblack');
 weekFadeB119.timer=setTimeout(()=>el.classList.remove('b126-fromblack'),7600);return true;
}
playWeekFadeB119=function(f){return weekFadeB119.fromArena&&f.kind==='battle'?playArenaWeekFromBlackB126(f):playWeekFadeBeforeB126(f)};
function finishArenaReturnB126(){
 clearTimeout(arenaReturnTimerB126);arenaReturnTimerB126=0;if(!weekFadeB119.returning)return false;
 const prior=weekFadeB119.last;weekFadeB119.fromArena=true;returnToRanchB99();
 if(weekFadeB119.last===prior||weekFadeB119.last?.kind!=='battle'){weekFadeB119.fromArena=false;weekFadeB119.returning=false;ensureWeekFadeB119().classList.remove('b126-preblack')}
 return true;
}
function returnToRanchWithFadeB126(){
 if(!S?.stagePending||weekFadeB119.returning)return false;releaseMovementB126();weekFadeB119.returning=true;
 const el=ensureWeekFadeB119();el.querySelector('b').textContent='';el.querySelector('span').textContent='';clearTimeout(weekFadeB119.timer);el.classList.remove('on','b126-fromblack','b126-preblack');void el.offsetWidth;el.classList.add('b126-preblack');
 arenaReturnTimerB126=setTimeout(finishArenaReturnB126,arenaReturnDelayB126);return true;
}
(function installArenaReturnB126(){
 const style=document.createElement('style');style.id='arenaReturnStyleB126';style.textContent=`#weekFadeB119.b126-preblack{opacity:1;pointer-events:auto;transition:opacity .6s linear}#weekFadeB119.b126-fromblack{pointer-events:auto;animation:b126WeekShade 7.6s linear}#weekFadeB119.b126-fromblack b,#weekFadeB119.b126-fromblack span{animation:b126WeekText 7.6s linear}@keyframes b126WeekShade{0%,73.684%{opacity:1}100%{opacity:0}}@keyframes b126WeekText{0%{opacity:0}3.947%,69.737%{opacity:.6}73.684%,100%{opacity:0}}`;document.head.appendChild(style);
 const old=$('returnRanchB99');if(!old)return;const b=old.cloneNode(true);old.replaceWith(b);b.addEventListener('click',returnToRanchWithFadeB126);
})();
