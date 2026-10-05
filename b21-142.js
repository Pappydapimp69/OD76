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

const B126_DUST_PRICE=50;
let merchantShopOpenB126=false;
(function installMerchantShopB126(){
 const merchant=$('arenaMerchantB118'),snack=$('buySnackB118'),skip=$('leaveMerchantB118');if(!merchant||!snack||!skip)return;
 const enter=document.createElement('button');enter.id='enterMerchantB126';enter.className='primary';enter.type='button';enter.textContent='Enter shop';snack.insertAdjacentElement('beforebegin',enter);
 const dust=document.createElement('button');dust.id='buyDustB126';dust.type='button';
 const exit=document.createElement('button');exit.id='exitMerchantB126';exit.type='button';exit.textContent='Leave shop';merchant.append(dust,exit);
 enter.addEventListener('click',enterArenaShopB126);dust.addEventListener('click',buyArenaDustB126);exit.addEventListener('click',exitArenaShopB126);
 skip.textContent='Skip shop';B117H_IDS.push('enterMerchantB126','buyDustB126','exitMerchantB126');
 const style=document.createElement('style');style.textContent='#arenaMerchantB118 #buyDustB126{border-color:#c9a7ff88;background:#b77cff14;color:#e9d8ff}#arenaMerchantB118 #enterMerchantB126{border-color:#ffd36f88;background:#ffd36f14;color:#ffe7a3}';document.head.appendChild(style);
})();
function merchantVisibleB126(el,show){el?.classList.toggle('stagehidden',!show)}
const renderMerchantBeforeB126=renderMerchantB118;
renderMerchantB118=function(...a){
 const r=renderMerchantBeforeB126(...a),hearts=Math.max(0,S?.heartCurrency||0),bought=S?.b118SnackBought||0,left=Math.max(0,3-bought),price=snackPriceB118();
 const text=$('merchantTextB118'),enter=$('enterMerchantB126'),snack=$('buySnackB118'),skip=$('leaveMerchantB118'),dust=$('buyDustB126'),exit=$('exitMerchantB126');
 if(text)text.textContent=merchantShopOpenB126?`♥ ${hearts} available to spend · ✧ ${ranchB99.dust||0} Star Dust owned.`:`The Arena Merchant has supplies for this test. ♥ ${hearts} available to spend.`;
 if(snack){snack.textContent=left?`Buy arena snack · ♥ ${price} · ${left} left`:'Arena snacks · SOLD OUT';snack.disabled=!left||hearts<price}
 if(dust){dust.textContent=`Buy 1 Star Dust · ♥ ${B126_DUST_PRICE}`;dust.disabled=hearts<B126_DUST_PRICE}
 merchantVisibleB126(enter,!merchantShopOpenB126);merchantVisibleB126(skip,!merchantShopOpenB126);merchantVisibleB126(snack,merchantShopOpenB126);merchantVisibleB126(dust,merchantShopOpenB126);merchantVisibleB126(exit,merchantShopOpenB126);
 return r;
};
const openMerchantBeforeB126=openMerchantB118;
openMerchantB118=function(...a){merchantShopOpenB126=false;return openMerchantBeforeB126(...a)};
const resolveMerchantBeforeB126=resolveMerchantB118;
resolveMerchantB118=function(buy){
 if(!buy){merchantShopOpenB126=false;return resolveMerchantBeforeB126(false)}
 if(!merchantShopOpenB126||!buySnackB118())return false;renderMerchantB118();return true;
};
function enterArenaShopB126(){if(!S?.stagePending)return false;merchantShopOpenB126=true;renderMerchantB118();return true}
function buyArenaDustB126(){
 if(!S?.stagePending||!merchantShopOpenB126||S.heartCurrency<B126_DUST_PRICE)return false;
 S.heartCurrency-=B126_DUST_PRICE;ranchB99.dust=(ranchB99.dust||0)+1;saveRanchB99();bumpB117('dustEarned');updateUI();renderMerchantB118();return true;
}
function exitArenaShopB126(){
 if(!S?.stagePending||!merchantShopOpenB126)return false;merchantShopOpenB126=false;$('arenaMerchantB118').classList.add('stagehidden');openRanchGateB99();return true;
}

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
