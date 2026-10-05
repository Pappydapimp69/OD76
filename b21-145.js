// B128 ranch polish: input release, transitions, kitchen launch set, softer tree audio,
// and a gentler opening cadence for the higher arena ranks.

// Glow Pond cannot consume the same held press that selected Train together.
const startGameBeforeB128=startGameB100;
startGameB100=function(kind,...args){
 const ok=startGameBeforeB128(kind,...args),g=ranchWorldB100.game;
 if(ok&&g?.type==='hold')g.b128AwaitRelease=true;
 return ok;
};
const gameInputBeforeB128=gameInputB100;
gameInputB100=function(g,dt,actPressed,actHeld){
 if(g?.type==='hold'&&g.b128AwaitRelease){
  if(actHeld)return;
  g.b128AwaitRelease=false;return gameInputBeforeB128(g,dt,false,false);
 }
 return gameInputBeforeB128(g,dt,actPressed,actHeld);
};

// Rest changes the meters only after the week transition reaches full black.
let restPendingB128=false,restTimerB128=0,restClearB128=0;
const restBeforeB128=restB99;
function finishRestB128(){
 if(!restPendingB128)return false;
 restPendingB128=false;clearTimeout(restTimerB128);restTimerB128=0;
 weekFadeB119.holdForGame=true;try{restBeforeB128()}finally{weekFadeB119.holdForGame=false}
 const f=weekFadeB119.pending,el=ensureWeekFadeB119();
 if(f){el.querySelector('b').textContent=`Week ${f.week}`;el.querySelector('span').textContent=f.text;weekFadeB119.last={...f,shownAt:Date.now()};weekFadeB119.pending=null}
 return true;
}
restB99=function(){
 if(restPendingB128)return false;
 restPendingB128=true;const f={week:ranchB99.week+1,kind:'rest',report:{grew:0,half:0,stalled:0,withered:[]},text:'Pip rested.'};
 playWeekFadeB119(f);const el=ensureWeekFadeB119();el.classList.add('b128-resting');clearTimeout(restClearB128);restClearB128=setTimeout(()=>el.classList.remove('b128-resting'),(B119_FADE_IN+B119_TEXT_IN+B119_FADE_HOLD+B119_FADE_OUT)*1000);restTimerB128=setTimeout(finishRestB128,B119_FADE_IN*1000);return true;
};

// Fade fully to black before replacing the ranch with the arena.
let arenaEntryPendingB128=false,arenaEntryTimerB128=0,arenaEntryClearB128=0;
const startBattleBeforeB128=startBattleTestB99;
function finishArenaEntryB128(){
 if(!arenaEntryPendingB128)return false;
 arenaEntryPendingB128=false;clearTimeout(arenaEntryTimerB128);arenaEntryTimerB128=0;
 const el=ensureWeekFadeB119(),ok=startBattleBeforeB128();
 if(ok===false){el.classList.remove('b128-arena-out');return false}
 el.classList.remove('b128-arena-out');void el.offsetWidth;el.classList.add('b128-arena-in');
 clearTimeout(arenaEntryClearB128);arenaEntryClearB128=setTimeout(()=>el.classList.remove('b128-arena-in'),650);return true;
}
startBattleTestB99=function(){
 if(arenaEntryPendingB128)return false;
 if(typeof arenaReadyB114==='function'&&!arenaReadyB114())return startBattleBeforeB128();
 arenaEntryPendingB128=true;const el=ensureWeekFadeB119();el.querySelector('b').textContent='';el.querySelector('span').textContent='';
 el.classList.remove('on','b126-preblack','b126-fromblack','b128-arena-in','b128-arena-out');void el.offsetWidth;el.classList.add('b128-arena-out');
 arenaEntryTimerB128=setTimeout(finishArenaEntryB128,600);return true;
};

// A rounded wooden knock while chopping, followed by a warm low thump when the tree falls.
sfxChopB116e=function(fell){
 if(!ensureAudio()||!sfxGateB42(audioEngine,fell?'b116eFell':'b116eChop',.12))return false;
 const e=audioEngine,t=audioCtx.currentTime+.01,p=rr(-.16,.16);
 if(fell){e.voice(112,t,.18,.026,'triangle',p,620,.006,.15,-18,e.sfx);e.voice(74,t+.16,.34,.032,'sine',0,420,.008,.28,-8,e.sfx)}
 else{e.voice(132,t,.09,.018,'triangle',p,760,.004,.07,-8,e.sfx);e.voice(88,t+.018,.13,.014,'sine',p,520,.005,.1,-5,e.sfx)}
 return true;
};

// Launch the kitchen with the first three recipes only; later recipes remain save-compatible.
const B128_KITCHEN_RECIPES=['stew','bowl','crisp'];
kitchenSheetB105=function(){
 if(!ranchB99.areas.kitchen)return unlockSheetB105('kitchen');
 const opts=[],lines=[];
 for(const id of B128_KITCHEN_RECIPES){const m=B105_MEALS[id],need=Object.entries(m.needs).map(([k,n])=>`${B104_ITEMS[k].icon}${n}`).join(' ');
  if(canCookB105(id))opts.push({label:`Cook ${m.icon} ${m.name} (${need}) · ${m.desc}`,run:()=>{cookB105(id);ranchToastB100(`Cooked ${m.name}! Feed it to Pip from his menu.`);kitchenSheetB105()}});
  else lines.push(`${m.icon} ${m.name}: ${need}`)
 }
 opts.push({label:'Close',quiet:true});openSheetB100('Kitchen',`Combine food into meals. Meals feed more and give bonuses.${lines.length?' Missing ingredients: '+lines.join(' · ')+'.':''}`,opts);
};

// Ranks D-S get a small stage-by-stage opening reduction; goals and enemy caps are unchanged.
function earlySpawnScaleB128(stage=S?.stage,rank=runRankB108().id){return rank!=='E'&&stage>=1&&stage<=3?[1.15,1.10,1.05][stage-1]:1}
const spawnLogicBeforeB128=spawnLogic;
spawnLogic=function(dt){
 const scale=earlySpawnScaleB128();if(scale===1)return spawnLogicBeforeB128(dt);
 if(S.waveState!=='active'||S.bossActive||S.waveKills>=S.waveGoal)return;
 S.spawn-=dt;if(S.spawn>0)return;
 if(enemies.filter(e=>!e.dead).length>=enemyCap()){S.spawn=.18;return}
 const d=difficulty();S.spawn=clamp(.68/d,.24,.74)*scale*rr(.82,1.12);spawnEnemy(chooseSpawn());
 if(rnd()<.075*d&&enemies.filter(e=>!e.dead).length<enemyCap())spawnEnemy(rnd()<.64?'chaser':'charger');
};

(function installB128TransitionStyles(){
 const style=document.createElement('style');style.id='b128TransitionStyle';style.textContent='#weekFadeB119.b128-resting{pointer-events:auto}#weekFadeB119.b128-arena-out{opacity:1;pointer-events:auto;transition:opacity .6s linear}#weekFadeB119.b128-arena-in{pointer-events:auto;animation:b128ArenaIn .6s linear forwards}@keyframes b128ArenaIn{from{opacity:1}to{opacity:0}}';document.head.appendChild(style);
})();
