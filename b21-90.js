
// B102 Heart Refinery: banked hearts refine into Heart Stones on the real clock.
// Stones buy drills; star dust fuses into Star Stones, which upgrade the refinery and drill stations.
const B102_HEARTS_PER_STONE=50,B102_DUST_CHANCE=.1,B102_DUST_PER_STAR=5,B102_REFINERY_MAX=10,B102_STATION_MAX=3,B102_STATION_POINTS=2;
const B102_REFINE_SECONDS=[900,600,480,300,240,180,120,60,30,10]; // refinery level 1..10
const B102_BASE_CAPS=Object.fromEntries(Object.keys(B99_DRILLS).map(k=>[k,B99_DRILLS[k].cap]));
function refineSecondsB102(lv){return B102_REFINE_SECONDS[clamp(Math.floor(lv)||1,1,B102_REFINERY_MAX)-1]}
function refineryUpgradeCostB102(lv){return Math.ceil(lv/3)}
function stationUpgradeCostB102(lv){return lv+1}

function sanitizeEconomyB102(r,raw){
 const n=(x,lo,hi)=>Number.isFinite(x)?Math.min(hi,Math.max(lo,Math.floor(x))):lo;
 r.stones=n(raw?.stones,0,1e9);r.dust=n(raw?.dust,0,1e9);r.starStones=n(raw?.starStones,0,1e9);
 const f=raw?.refinery||{};
 r.refinery={level:n(f.level??1,1,B102_REFINERY_MAX),queue:n(f.queue,0,1e7),startedAt:Number.isFinite(f.startedAt)?Math.max(0,f.startedAt):0,trayStones:n(f.trayStones,0,1e9),trayDust:n(f.trayDust,0,1e9)};
 if(r.refinery.queue&&!r.refinery.startedAt)r.refinery.startedAt=Date.now();
 r.stations={};for(const k in B99_DRILLS)r.stations[k]=n(raw?.stations?.[k],0,B102_STATION_MAX);
 return r;
}
// Station upgrades raise that ability's ranch cap, so caps follow the loaded save.
function syncCapsB102(stations=ranchB99?.stations){for(const k in B99_DRILLS)B99_DRILLS[k].cap=B102_BASE_CAPS[k]+(stations?.[k]||0)}
const loadRanchBeforeB102=loadRanchB99;
loadRanchB99=function(){
 let raw=null;try{raw=JSON.parse(localStorage.getItem(B99_RANCH_KEY)||"null")}catch(_){}
 const st={};for(const k in B99_DRILLS){const v=raw?.stations?.[k];st[k]=Number.isFinite(v)?clamp(Math.floor(v),0,B102_STATION_MAX):0}
 syncCapsB102(st);
 return sanitizeEconomyB102(loadRanchBeforeB102(),raw);
};
const ranchDefaultBeforeB102=ranchDefaultB99;
ranchDefaultB99=function(){return sanitizeEconomyB102(ranchDefaultBeforeB102(),null)}; // callers sync caps; the loader reuses this mid-load
ranchB99=loadRanchB99();syncCapsB102();

// ---- refinery ----
function tickRefineryB102(now=Date.now(),roll=Math.random){
 const f=ranchB99.refinery;let done=0;
 if(f.startedAt>now)f.startedAt=now;
 while(f.queue>0){const T=refineSecondsB102(f.level)*1000;if(now<f.startedAt+T)break;f.queue--;f.trayStones++;if(roll()<B102_DUST_CHANCE)f.trayDust++;f.startedAt+=T;done++}
 if(!f.queue)f.startedAt=0;
 if(done)saveRanchB99();
 return done;
}
function refineLeftB102(now=Date.now()){const f=ranchB99.refinery;return f.queue?Math.max(0,f.startedAt+refineSecondsB102(f.level)*1000-now):0}
function loadHeartsB102(batches,now=Date.now()){
 tickRefineryB102(now);
 const n=Math.min(Math.max(0,Math.floor(batches)),Math.floor(ranchB99.hearts/B102_HEARTS_PER_STONE));
 if(!n)return 0;
 const f=ranchB99.refinery;ranchB99.hearts-=n*B102_HEARTS_PER_STONE;if(!f.queue)f.startedAt=now;f.queue+=n;saveRanchB99();
 return n;
}
function collectTrayB102(now=Date.now()){
 tickRefineryB102(now);
 const f=ranchB99.refinery,got={stones:f.trayStones,dust:f.trayDust};
 ranchB99.stones+=got.stones;ranchB99.dust+=got.dust;f.trayStones=0;f.trayDust=0;saveRanchB99();
 return got;
}
function fuseStarB102(){if(ranchB99.dust<B102_DUST_PER_STAR)return false;ranchB99.dust-=B102_DUST_PER_STAR;ranchB99.starStones++;saveRanchB99();return true}
function upgradeRefineryB102(now=Date.now()){
 tickRefineryB102(now); // finished batches count at the old speed
 const f=ranchB99.refinery,cost=refineryUpgradeCostB102(f.level);
 if(f.level>=B102_REFINERY_MAX||ranchB99.starStones<cost)return false;
 ranchB99.starStones-=cost;f.level++;saveRanchB99();return true;
}
function upgradeStationB102(kind){
 const lv=ranchB99.stations[kind],cost=stationUpgradeCostB102(lv);
 if(lv>=B102_STATION_MAX||ranchB99.starStones<cost)return false;
 ranchB99.starStones-=cost;ranchB99.stations[kind]++;syncCapsB102();saveRanchB99();return true;
}
function clockB102(ms){const s=Math.ceil(ms/1000),m=Math.floor(s/60);return m?`${m}:${String(s%60).padStart(2,"0")}`:`${s}s`}
function refineLabelB102(lv){const s=refineSecondsB102(lv);return s>=60?`${s/60} min`:`${s} sec`}

// ---- drills cost Heart Stones ----
drillCostB99=function(kind){return 1+Math.floor(ranchB99.stats[kind]/3)};
drillBlockB99=function(kind){
 const d=B99_DRILLS[kind];if(!d)return"unknown";
 if(ranchB99.points[kind]>=d.cap*B100_POINTS_PER_LEVEL)return"capped";
 if(ranchB99.fatigue>=B99_TIRED)return"tired";
 if(ranchB99.stones<drillCostB99(kind))return"stones";
 return"";
};
payDrillB100=function(kind){
 if(drillBlockB99(kind))return false;
 ranchB99.stones-=drillCostB99(kind);ranchB99.fatigue=Math.min(100,ranchB99.fatigue+B99_DRILL_FATIGUE);ranchB99.week++;saveRanchB99();
 return true;
};
function drillBaseB102(kind){return B100_BASE+(ranchB99.stations[kind]||0)*B102_STATION_POINTS}
awardDrillB100=function(kind,bonus){
 const cap=B99_DRILLS[kind].cap*B100_POINTS_PER_LEVEL,before=ranchB99.stats[kind],gain=drillBaseB102(kind)+bonus*B100_BONUS;
 ranchB99.points[kind]=Math.min(cap,ranchB99.points[kind]+gain);
 ranchB99.stats[kind]=Math.floor(ranchB99.points[kind]/B100_POINTS_PER_LEVEL);
 saveRanchB99();
 return{gain,levelUp:ranchB99.stats[kind]>before};
};

// ---- world ----
B100_STATIONS.push({id:"refinery",x:1190,y:600,name:"Heart Refinery",r:100});
{const i=B100_TREES.findIndex(([x,y])=>x===1160&&y===560);if(i>=0)B100_TREES.splice(i,1)}
const nearestBeforeB102=nearestInteractB100;
nearestInteractB100=function(){const n=nearestBeforeB102();if(n?.st?.id==="refinery")n.label="Refine";return n};

(function installEconomyHudB102(){
 const heart=$("ranchHeartB100");if(!heart)return;
 const spans=[["ranchStoneB102","Heart Stones"],["ranchDustB102","Star dust"],["ranchStarB102","Star Stones"]].map(([id,title])=>{const s=document.createElement("span");s.id=id;s.title=title;return s});
 heart.after(...spans);
 const style=document.createElement("style");style.textContent=`#ranchHudB100{flex-wrap:wrap;justify-content:center;max-width:94vw;row-gap:4px}@media(max-width:560px){#ranchHudB100{gap:8px;font-size:11px}#ranchHudB100 .fat{width:48px}}`;document.head.appendChild(style);
})();
const hudBeforeB102=renderRanchHudB100;
renderRanchHudB100=function(){hudBeforeB102();$("ranchStoneB102").textContent=`◆ ${ranchB99.stones}`;$("ranchDustB102").textContent=`✧ ${ranchB99.dust}`;$("ranchStarB102").textContent=`★ ${ranchB99.starStones}`};

function refinerySheetB102(){
 tickRefineryB102();
 const f=ranchB99.refinery,st=stationB100("refinery"),can=Math.floor(ranchB99.hearts/B102_HEARTS_PER_STONE),up=refineryUpgradeCostB102(f.level);
 const lines=[`Level ${f.level}: ♥ ${B102_HEARTS_PER_STONE} → ◆ 1 every ${refineLabelB102(f.level)}, with a ${Math.round(B102_DUST_CHANCE*100)}% chance of star dust.`];
 lines.push(f.queue?`Refining ${f.queue} batch${f.queue===1?"":"es"}; next stone in ${clockB102(refineLeftB102())}.`:"The machine is idle.");
 if(f.trayStones||f.trayDust)lines.push(`Tray: ◆ ${f.trayStones}${f.trayDust?` · ✧ ${f.trayDust}`:""}.`);
 lines.push(`You have ♥ ${ranchB99.hearts} · ✧ ${ranchB99.dust} · ★ ${ranchB99.starStones}.`);
 const opts=[];
 if(f.trayStones||f.trayDust)opts.push({label:`Collect ◆ ${f.trayStones}${f.trayDust?` · ✧ ${f.trayDust}`:""}`,run:()=>{const g=collectTrayB102();renderRanchHudB100();burstHeartsB100(st.x,st.y-40,3);ranchToastB100(`Collected ◆ ${g.stones}${g.dust?` and ✧ ${g.dust} star dust!`:"."}`)}});
 if(can>=1)opts.push({label:`Refine ♥ ${B102_HEARTS_PER_STONE} → ◆ 1`,run:()=>{loadHeartsB102(1);renderRanchHudB100();ranchToastB100(`Loaded ♥ ${B102_HEARTS_PER_STONE}. Ready in ${refineLabelB102(f.level)}.`)}});
 if(can>=2)opts.push({label:`Refine all · ♥ ${can*B102_HEARTS_PER_STONE} → ◆ ${can}`,run:()=>{const n=loadHeartsB102(can);renderRanchHudB100();ranchToastB100(`Loaded ${n} batches. The refinery hums along.`)}});
 if(ranchB99.dust>=B102_DUST_PER_STAR)opts.push({label:`Fuse ✧ ${B102_DUST_PER_STAR} → ★ 1 Star Stone`,run:()=>{fuseStarB102();renderRanchHudB100();burstHeartsB100(st.x,st.y-40,5);ranchToastB100("Star dust fused into a Star Stone ★")}});
 if(f.level<B102_REFINERY_MAX&&ranchB99.starStones>=up)opts.push({label:`Upgrade refinery → Lv ${f.level+1} (${refineLabelB102(f.level+1)}) · ★ ${up}`,run:()=>{upgradeRefineryB102();renderRanchHudB100();ranchToastB100(`Refinery Lv ${f.level}! A stone now takes ${refineLabelB102(f.level)}.`)}});
 else if(f.level<B102_REFINERY_MAX)lines.push(`Next upgrade: ★ ${up} for ${refineLabelB102(f.level+1)} per stone.`);
 if(!opts.length&&!can)lines.push(`Bring home ♥ ${B102_HEARTS_PER_STONE} from battle tests to refine.`);
 opts.push({label:"Not now",quiet:true});
 openSheetB100("Heart Refinery",lines.join(" "),opts);
}
function drillSheetB102(st){
 const kind=st.id,d=B99_DRILLS[kind],g=B100_GAMES[kind],block=drillBlockB99(kind),slv=ranchB99.stations[kind],up=stationUpgradeCostB102(slv),cost=drillCostB99(kind),base=drillBaseB102(kind);
 const head=`${g.title} · ${levelLineB100(kind)}`,opts=[];
 let text;
 if(block){
   text=block==="tired"?"Pip is too tired to train. Let him rest at his bed.":block==="capped"?`${d.stat} is as high as this station can train it. Upgrading the station raises the cap.`:`Needs ◆ ${cost} Heart Stone${cost===1?"":"s"}. You have ◆ ${ranchB99.stones}. Refine hearts at the Heart Refinery.`;
 }else{
   const pct=Math.round(soloChanceB100()*100);
   text=`Costs ◆ ${cost}, +${B99_DRILL_FATIGUE} fatigue and a week. Worth ${base} points; win together for +${B100_BONUS}, fail for −${B100_BONUS}. Solo, Pip succeeds about ${pct}% of the time.`;
   opts.push({label:`Let Pip train solo · ◆ ${cost}`,run:()=>{const r=soloDrillB100(kind);if(!r)return;pipDoB100("drill",st,2.4,kind);renderRanchHudB100();ranchToastB100(r.ok?`Pip nailed ${g.title}! +${r.gain} ${d.stat} points${r.levelUp?` · Lv ${ranchB99.stats[kind]}!`:""}`:`Pip stumbled in ${g.title}. Only +${r.gain} points${r.levelUp?` · Lv ${ranchB99.stats[kind]}`:""}.`,4)}});
   opts.push({label:`Train together · ◆ ${cost}`,run:()=>startGameB100(kind)});
 }
 text+=` Station Lv ${slv}/${B102_STATION_MAX}.`;
 if(slv<B102_STATION_MAX){
   if(ranchB99.starStones>=up)opts.push({label:`Upgrade station · ★ ${up} (+${B102_STATION_POINTS} points, cap +1)`,run:()=>{upgradeStationB102(kind);renderRanchHudB100();burstHeartsB100(st.x,st.y-30,5);ranchToastB100(`${g.title} station Lv ${ranchB99.stations[kind]}! Drills are worth ${drillBaseB102(kind)} and ${d.stat} can reach Lv ${d.cap}.`)}});
   else text+=` Upgrade: ★ ${up}.`;
 }
 opts.push({label:block?"OK":"Not now",quiet:true});
 openSheetB100(head,text,opts);
}
const interactBeforeB102=interactStationB100;
interactStationB100=function(st){
 if(st.id==="refinery")return refinerySheetB102();
 if(B99_DRILLS[st.id])return drillSheetB102(st);
 return interactBeforeB102(st);
};

const drawStationBeforeB102=drawStationB100;
drawStationB100=function(st,t){
 drawStationBeforeB102(st,t);
 if(B99_DRILLS[st.id]&&ranchB99.stations[st.id]){const n=ranchB99.stations[st.id];X.fillStyle="#f2b84b";X.font="bold 13px system-ui";X.textAlign="center";X.fillText("★".repeat(n),st.x,st.y-(st.id==="speed"?110:st.id==="guard"?95:st.id==="range"?90:70)+32)}
 if(st.id!=="refinery")return;
 const c=B100_PASTEL,x=st.x,y=st.y,f=ranchB99.refinery,busy=f.queue>0;
 X.fillStyle=c.lilac;roundRectB100(x-60,y-70,120,90,16);X.fill();
 X.fillStyle=c.pink;X.beginPath();X.moveTo(x-40,y-70);X.lineTo(x-24,y-100);X.lineTo(x+4,y-100);X.lineTo(x+14,y-70);X.closePath();X.fill();
 X.fillStyle="#e9d5c3";X.fillRect(x+28,y-108,14,40);
 if(busy)for(let i=0;i<3;i++){const k=(t*.6+i/3)%1;X.fillStyle=`rgba(255,255,255,${.8*(1-k)})`;X.beginPath();X.arc(x+35+Math.sin(k*6)*6,y-112-k*40,6+k*8,0,Math.PI*2);X.fill()}
 X.fillStyle="#fffaf3";roundRectB100(x-44,y-50,88,30,10);X.fill();
 if(busy){const p=1-refineLeftB102()/(refineSecondsB102(f.level)*1000);X.fillStyle="#ffb7cf";roundRectB100(x-40,y-46,Math.max(6,80*clamp(p,0,1)),22,8);X.fill()}
 X.fillStyle="#b39cf0";X.font="bold 16px system-ui";X.textAlign="center";X.fillText(f.trayStones?`◆${f.trayStones}`:"♥→◆",x,y-29);
 X.fillStyle=c.butter;roundRectB100(x-30,y+4,60,14,6);X.fill();
 const sub=busy?`◆ in ${clockB102(refineLeftB102())} · ${f.queue} queued`:(f.trayStones||f.trayDust)?"Tray ready!":`Idle · Lv ${f.level}`;
 labelB100(x,y-122,"Heart Refinery",sub);
};

let refineClockB102=0;
const updateRanchBeforeB102=updateRanchB100;
updateRanchB100=function(dt){
 refineClockB102-=dt;if(refineClockB102<=0){refineClockB102=1;if(tickRefineryB102())ranchToastB100("The Heart Refinery finished a stone. Collect it from the tray.",3)}
 updateRanchBeforeB102(dt);
};
const enterRanchBeforeB102=enterRanchB100;
enterRanchB100=function(){
 const done=tickRefineryB102();
 enterRanchBeforeB102();
 if(done)ranchToastB100(`While you were away, the refinery made ◆ ${done}. Collect it from the tray.`,5);
};
openRanchB99=enterRanchB100;
for(const id of ["openRanchB99","endRanchB99"]){const old=$(id);if(!old)continue;const b=old.cloneNode(true);old.replaceWith(b);b.addEventListener("click",enterRanchB100)}

// Quick key taps can start and end between frames; latch them like touch taps.
window.addEventListener("keydown",e=>{
 const w=ranchWorldB100;if(!w.active||e.repeat)return;
 if([" ","Enter","e","E"].includes(e.key))w.touchTap=true;
 else if(e.key==="Escape"||e.key==="Backspace")w.backTap=true;
 else if(["ArrowUp","w","W"].includes(e.key))w.navTap=-1;
 else if(["ArrowDown","s","S"].includes(e.key))w.navTap=1;
});
const ranchInputBeforeB102=ranchInputB100;
ranchInputB100=function(){
 const w=ranchWorldB100,r=ranchInputBeforeB102();
 if(w.backTap)r.backPressed=true;if(w.navTap&&!r.navPressed)r.navPressed=w.navTap;
 w.backTap=false;w.navTap=0;return r;
};
{const s=document.createElement("style");s.textContent=`@media(max-width:560px){#ranchToastB100{top:calc(max(10px,env(safe-area-inset-top)) + 84px)}}`;document.head.appendChild(s)}
