
// B108 Stage curve and arena ranks. Stage number drives difficulty on a steady-then-sublinear
// curve; hearts only nudge it (≤15%); the arena rank chosen at the gate offsets it and pays more.
const B108_HEART_NUDGE=.15,B108_HEARTS_PER_STAGE=30,B108_RANK_UNLOCK_STAGE=5;
const B108_RANKS=[{id:"E",offset:0,reward:1},{id:"D",offset:2,reward:1.2},{id:"C",offset:4,reward:1.4},{id:"B",offset:6,reward:1.6},{id:"A",offset:8,reward:1.8},{id:"S",offset:10,reward:2}];
function stageCurveB108(stage){
 if(stage<=3)return 1;
 if(stage<=10)return 1+(stage-3)*9/7;
 return 10+9/7*4*(Math.sqrt(1+(stage-10)/2)-1); // same slope as stages 4–10 at the join, then flattening
}
function heartNudgeB108(){if(!S||S.stage<=3)return 0;return B108_HEART_NUDGE*clamp(difficultyHeartsB63()/(B108_HEARTS_PER_STAGE*(S.stage-3)),0,1)}
function runRankB108(){return B108_RANKS[clamp(S?.b108Rank??ranchB99.rank??0,0,B108_RANKS.length-1)]}
function difficultyValueB108(){if(!S)return 1;const base=stageCurveB108(S.stage)+runRankB108().offset;return S.stage<=3?base:base*(1+heartNudgeB108())}
difficultyStageB63=function(){return Math.max(1,Math.floor(difficultyValueB108()+1e-9))};
difficultyWaveB63=function(){return 1+(difficultyStageB63()-1)*3};
difficultyBossCountB63=function(){return Math.floor((difficultyStageB63()-1)/3)};
waveGoalFor=function(n){return Math.min(16,8+Math.floor((difficultyStageB63()-1)*2/3))};

// ---- ranks in the ranch save ----
function rankDefaultsB108(r,raw){
 const n=(x,d=0)=>Number.isFinite(x)?clamp(Math.floor(x),0,B108_RANKS.length-1):d;
 r.rankUnlocked=n(raw?.rankUnlocked);r.rank=Math.min(n(raw?.rank),r.rankUnlocked);return r;
}
const loadRanchBeforeB108=loadRanchB99;
loadRanchB99=function(){let raw=null;try{raw=JSON.parse(localStorage.getItem(B99_RANCH_KEY)||"null")}catch(_){}return rankDefaultsB108(loadRanchBeforeB108(),raw)};
const ranchDefaultBeforeB108=ranchDefaultB99;
ranchDefaultB99=function(){return rankDefaultsB108(ranchDefaultBeforeB108(),null)};
ranchB99=loadRanchB99();syncCapsB102();
function selectRankB108(i){if(i<0||i>ranchB99.rankUnlocked)return false;ranchB99.rank=i;saveRanchB99();return true}

const resetBeforeB108=reset;
reset=function(){resetBeforeB108();if(S){S.b108Rank=ranchB99.rank;S.b108Unlocked=false}updateUI()};
if(S)S.b108Rank=ranchB99.rank;

// Clearing the unlock stage at your highest rank opens the next one.
const openStageBeforeB108=openStageUpgrade;
openStageUpgrade=function(){
 const r=openStageBeforeB108();
 if(S&&!S.b108Unlocked&&S.stage>=B108_RANK_UNLOCK_STAGE&&S.b108Rank===ranchB99.rankUnlocked&&ranchB99.rankUnlocked<B108_RANKS.length-1){
   S.b108Unlocked=true;ranchB99.rankUnlocked++;saveRanchB99();
   announce(`RANK ${B108_RANKS[ranchB99.rankUnlocked].id} UNLOCKED`,1400);
 }
 return r;
};
// Higher ranks pay more hearts and stones at the ranch.
const bankBeforeB108=bankRunB99;
bankRunB99=function(dead){
 const tests=ranchB99.tests,h=ranchB99.hearts,st=ranchB99.stones,rank=runRankB108(),earned=bankBeforeB108(dead);
 if(ranchB99.tests>tests&&rank.reward>1){
   const bh=Math.floor((ranchB99.hearts-h)*(rank.reward-1)+1e-9),bs=Math.floor((ranchB99.stones-st)*(rank.reward-1)+1e-9);
   ranchB99.hearts+=bh;ranchB99.stones+=bs;
   ranchB99.report+=` Rank ${rank.id} bonus ×${rank.reward}: +♥ ${bh}${bs?` +◆ ${bs}`:""}.`;saveRanchB99();
   return earned+bh;
 }
 return earned;
};
const gateTextBeforeB108=openRanchGateB99;
openRanchGateB99=function(){gateTextBeforeB108();const r=runRankB108();if(r.reward>1)$("ranchGateTextB99").textContent+=` Rank ${r.id} pays ×${r.reward} at the ranch.`};

// ---- Arena gate: choose a rank ----
const interactBeforeB108=interactStationB100;
interactStationB100=function(st){
 if(st.id!=="gate")return interactBeforeB108(st);
 const s=ranchB99.stats,cur=ranchB99.rank,opts=[];
 const line=i=>{const r=B108_RANKS[i];return`Rank ${r.id}${r.offset?` · +${r.offset} difficulty`:" · standard"} · rewards ×${r.reward}`};
 opts.push({label:`Enter at ${line(cur)}`,run:()=>startBattleTestB99()});
 for(let i=ranchB99.rankUnlocked;i>=0;i--)if(i!==cur)opts.push({label:`Switch to ${line(i)}`,run:()=>{selectRankB108(i);interactStationB100(st)}});
 opts.push({label:"Not yet",quiet:true});
 const next=ranchB99.rankUnlocked<B108_RANKS.length-1?` Clear stage ${B108_RANK_UNLOCK_STAGE} at rank ${B108_RANKS[ranchB99.rankUnlocked].id} to unlock rank ${B108_RANKS[ranchB99.rankUnlocked+1].id}.`:" Every rank is open.";
 openSheetB100("Arena gate",`Battle test at rank ${B108_RANKS[cur].id}. Pip starts at Heart Sense ${s.range}, Swift ${s.speed}, Star Power ${s.power}, Guardian Glow ${s.guard}.${next}`,opts);
};

// ---- HUD and tier cue ----
difficultyHudTextB65=function(){
 const r=runRankB108(),tier=difficultyStageB63(),rank=r.id!=="E"?` · RANK ${r.id}`:"";
 if(S.stage<=3&&!r.offset)return{short:"DIFF · OPENING",long:"Opening difficulty is fixed through stage 3."};
 const pct=Math.round(heartNudgeB108()*100);
 return{short:`DIFF · T${tier}${rank}${pct?` · ♥+${pct}%`:""}`,long:`Difficulty tier ${tier} from stage ${S.stage}${rank?`, rank ${r.id} (+${r.offset})`:""}. Hearts this run add ${pct}% (max ${Math.round(B108_HEART_NUDGE*100)}%).${rosterNoteB108()}`};
};
function rosterNoteB108(){const roster=enemyRosterB82();return roster?` ${roster.name} rotation; enemy cap ${H>W?roster.portrait:roster.landscape}.`:""}
// B73 pulsed only in stages 4–10; hearts can now lift the tier at any stage from 4.
function pulseTierB108(fn){return function(...a){const late=!!S&&S.stage>10,before=late?difficultyStageB63():0;const r=fn.apply(this,a);if(late){const after=difficultyStageB63();if(after>before){S.b73DifficultyPulse=B73_DIFFICULTY_PULSE_SECONDS;S.b73DifficultyTier=after}}return r}}
collectHeartBit=pulseTierB108(collectHeartBit);
deliverCargoB60=pulseTierB108(deliverCargoB60);
