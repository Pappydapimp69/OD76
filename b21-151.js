
// B133 Ascension. A basic skill that reaches level 5 with all five tiers can Ascend (★10). Ascensions are saved
// outside the run (max 5 per skill): each one starts that skill one level higher in every later run, already
// unlocked, with full mastery of the levels below (so their tier-3 regen bonuses count from the start). After 5 the
// skill starts every run Ascended with nothing left to master. Uses per level grow with the ascension count the run
// started with: 10 / 13,13,12,12 / 14,13,13 / 15,15 / 30; the fifth ascension's run costs 50 stars, not 25.
const B133_KEY='od76-ascension-b133',B133_V=1,B133_MAX=5;
const B133_USES=[[10,10,10,10,10],[13,13,12,12],[14,13,13],[15,15],[30]];
const B133_TIER_SHARE=B131_TIER_USES.map(u=>u/B131_TIER_USES[B131_TIER_USES.length-1]);

function blankAscB133(){const a={};for(const id of B38_BASIC_OVERDRIVES)a[id]=0;return a}
function loadAscB133(){
 const a=blankAscB133();
 try{const raw=JSON.parse(localStorage.getItem(B133_KEY)||'null');
  if(raw&&typeof raw==='object'&&raw.asc&&typeof raw.asc==='object')for(const id in a){const n=Math.floor(Number(raw.asc[id]));a[id]=Number.isFinite(n)?clamp(n,0,B133_MAX):0}
 }catch(_){}
 return a;
}
function saveAscB133(){try{localStorage.setItem(B133_KEY,JSON.stringify({v:B133_V,asc:ascB133}))}catch(_){}}
let ascB133=loadAscB133();

function baseAscB133(m){return clamp(Math.floor(m?.base||0),0,B133_MAX)}
function levelUsesB133(m){const row=B133_USES[Math.min(baseAscB133(m),B133_USES.length-1)];return row[clamp(m.lv-(baseAscB133(m)+1),0,row.length-1)]}
function tierUsesAtB133(m,t){ // cumulative uses for tier t+1 this level, scaled from the level-1 shape
 const total=levelUsesB133(m);return t>=4?total:Math.max(t+1,Math.round(B133_TIER_SHARE[t]*total));
}
function starScaleB133(m){return baseAscB133(m)>=4?2:1}

nextStepB131=function(id){
 const m=masteryB131(id);if(!m)return null;
 if(baseAscB133(m)>=B133_MAX||m.ascended)return {kind:'done'};
 if(m.t<5)return {kind:'tier',tier:m.t+1,uses:tierUsesAtB133(m,m.t),stars:B131_TIER_STARS[m.t]*starScaleB133(m)};
 if(m.lv<B131_MAX_LEVEL)return {kind:'level',level:m.lv+1,stars:B131_LEVEL_STARS};
 return {kind:'ascend',stars:B131_LEVEL_STARS*starScaleB133(m),next:ascB133[id]+1};
};
const masteryStepBeforeB133=masteryStepB131;
masteryStepB131=function(id){
 const m=masteryB131(id),next=nextStepB131(id);
 if(next?.kind!=='ascend')return masteryStepBeforeB133(id);
 const info=OVERDRIVE_INFO[id];
 if(S.starPoints<next.stars){const need=next.stars-S.starPoints;showPipMessage(`we need ${need} more Run Star${need===1?'':'s'}.`,true);return false}
 S.starPoints-=next.stars;m.ascended=true;ascB133[id]=clamp(ascB133[id]+1,0,B133_MAX);saveAscB133();
 showPipMessage(ascB133[id]>=B133_MAX?`${info.name} is fully Ascended. it starts every run Ascended ✦`:`${info.name} Ascended. it starts at level ${ascB133[id]+1} from now on ✦`,true);
 if(navigator.vibrate)try{navigator.vibrate([35,40,35])}catch(_){}
 return true;
};

function seedAscendedB133(){
 if(!S)return;
 for(const id of B38_BASIC_OVERDRIVES){
  const a=ascB133[id];if(a<=0)continue;
  S.overUnlocked.add(id);S.b131=S.b131||{};S.b131[id]={lv:Math.min(B131_MAX_LEVEL,a+1),t:a>=B133_MAX?5:0,u:0,base:a};
 }
 applyMasteryB131();
}
const resetBeforeB133=reset;
reset=function(...a){const r=resetBeforeB133(...a);seedAscendedB133();return r};
seedAscendedB133();
