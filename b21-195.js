// B183 Old Quarry, the first ranch area off the main map. Purpose: a steady, active Star Dust source (the B170
// playtest said Star Dust came too slowly). A signpost at the ranch's east edge leads there once it is unlocked for ★2.
// Twelve rocks; Pip breaks one for 10 fatigue (the tool-work gate applies) and it always drops ✧1, with a 25% chance of
// a second ✧ and 10% of a ◆ Heart Stone. A broken rock grows back 20 minutes later on the real clock.
// The area is a map swap: the ranch's own world size, stations, decor and obstacle lists are swapped in place for the
// quarry's and restored on the way out, so movement, Pip, the bag, sheets and the HUD all keep working unchanged.
// Its state lives under its own key (B179: late fields in the ranch save don't survive page load).
const B183_KEY='od76-quarry-b183',B183_COST_STARS=2,B183_FATIGUE=10,B183_REGROW_MS=20*60e3,B183_EXTRA_DUST=.25,B183_STONE=.1;
const B183_WORLD={w:1400,h:1000};
const B183_ROCKS=[[300,260],[520,180],[760,240],[1020,200],[1180,360],[260,520],[560,470],[880,520],[1120,620],[380,780],[700,800],[1000,820]].map(([x,y],i)=>({id:'rock'+i,x,y}));
function loadQuarryB183(){const q={unlocked:false,broken:{},total:0};try{const v=JSON.parse(localStorage.getItem(B183_KEY)||'null');if(v&&typeof v==='object'){q.unlocked=v.unlocked===true;q.total=clamp(Math.floor(Number(v.total))||0,0,1e7);for(const r of B183_ROCKS){const t=Number(v.broken?.[r.id]);if(Number.isFinite(t)&&t>0)q.broken[r.id]=Math.min(t,Date.now())}}}catch(_){}return q}
let quarryB183=loadQuarryB183();
function saveQuarryB183(){try{localStorage.setItem(B183_KEY,JSON.stringify({v:1,...quarryB183}))}catch(_){}}
function rockUpB183(id,now=Date.now()){const t=quarryB183.broken[id];if(t&&now-t>=B183_REGROW_MS){delete quarryB183.broken[id];saveQuarryB183()}return !quarryB183.broken[id]}
function regrowLeftB183(id,now=Date.now()){const t=quarryB183.broken[id];return t?Math.max(0,t+B183_REGROW_MS-now):0}
function breakRockB183(id,roll=Math.random){
 if(!rockUpB183(id)||!toolReadyB106())return null;
 const got={dust:1,stones:0};if(roll()<B183_EXTRA_DUST)got.dust++;if(roll()<B183_STONE)got.stones++;
 ranchB99.dust+=got.dust;ranchB99.stones+=got.stones;ranchB99.fatigue=Math.min(fatigueMaxB118(),ranchB99.fatigue+B183_FATIGUE);
 quarryB183.broken[id]=Date.now();quarryB183.total++;saveQuarryB183();saveRanchB99();
 if(typeof bumpB117==='function')bumpB117('dustEarned',got.dust);
 if(typeof trackB136==='function')trackB136(['quarry','break',got.stones?'stone':got.dust>1?'dust2':'dust1']);
 return got;
}

// ---- the map swap ----
const B183_SIGN={id:'signpost',x:2300,y:640,name:'Signpost',r:80,noPath:true};
B100_STATIONS.push(B183_SIGN);
const B183_QSTATIONS=[{id:'quarryExit',x:120,y:500,name:'Path home',r:80,noPath:true},...B183_ROCKS.map(r=>({id:'q_'+r.id,rock:r.id,x:r.x,y:r.y,name:'Rock',noPath:true,get r(){return rockUpB183(this.rock)?70:46}}))];
const B183_DECOR=[]; // the ranch's round trees don't belong in a quarry
const quarrySaveB183={};
function inQuarryB183(){return !!ranchWorldB100?.b183Quarry}
function swapArrayB183(arr,next){const old=arr.splice(0,arr.length);arr.push(...next);return old}
function enterQuarryB183(){
 if(inQuarryB183()||!quarryB183.unlocked)return false;
 const w=ranchWorldB100;closeSheetB100();
 quarrySaveB183.world={...B100_WORLD};quarrySaveB183.stations=swapArrayB183(B100_STATIONS,B183_QSTATIONS);
 quarrySaveB183.trees=swapArrayB183(B100_TREES,B183_DECOR);quarrySaveB183.obstacles=swapArrayB183(B106_OBSTACLES,[]);
 quarrySaveB183.pos={x:w.px,y:w.py};Object.assign(B100_WORLD,B183_WORLD);
 w.b183Quarry=true;w.px=200;w.py=500;w.pip.x=170;w.pip.y=530;w.cam.x=w.px;w.cam.y=w.py;w.prevAct=true;
 ranchToastB100('The Old Quarry. Pip can break rocks for Star Dust (10 fatigue each); they grow back in 20 min.',4);
 return true;
}
function leaveQuarryB183(toRanchSpot=true){
 if(!inQuarryB183())return false;
 const w=ranchWorldB100;closeSheetB100();
 swapArrayB183(B100_STATIONS,quarrySaveB183.stations);swapArrayB183(B100_TREES,quarrySaveB183.trees);swapArrayB183(B106_OBSTACLES,quarrySaveB183.obstacles);
 Object.assign(B100_WORLD,quarrySaveB183.world);w.b183Quarry=false;
 if(toRanchSpot){w.px=B183_SIGN.x-90;w.py=B183_SIGN.y;w.pip.x=w.px-30;w.pip.y=w.py+20;w.cam.x=w.px;w.cam.y=w.py;w.prevAct=true}
 return true;
}
// Leaving the ranch (arena, Colosseum, reset) from the quarry puts the main map back first.
const leaveRanchBeforeB183=leaveRanchB100;
leaveRanchB100=function(...a){leaveQuarryB183(false);return leaveRanchBeforeB183(...a)};
const enterRanchBeforeB183=enterRanchB100;
enterRanchB100=function(...a){leaveQuarryB183(false);return enterRanchBeforeB183(...a)};
openRanchB99=enterRanchB100;

// ---- interacting ----
const interactBeforeB183=interactStationB100;
interactStationB100=function(st,...a){
 if(st.id==='signpost'){
  const q=quarryB183,opts=[];
  if(q.unlocked)opts.push({label:'Old Quarry · break rocks for Star Dust',run:enterQuarryB183});
  else opts.push({label:`Unlock the Old Quarry · ★ ${B183_COST_STARS}`,run:()=>{if(ranchB99.starStones<B183_COST_STARS){ranchToastB100(`Needs ★ ${B183_COST_STARS} · you have ★ ${ranchB99.starStones}.`);return}ranchB99.starStones-=B183_COST_STARS;q.unlocked=true;saveQuarryB183();saveRanchB99();renderRanchHudB100();if(typeof trackB136==='function')trackB136(['quarry','unlock']);enterQuarryB183()}});
  opts.push({label:'Not now',quiet:true});
  return openSheetB100('Signpost',q.unlocked?'Paths off the ranch.':`Paths off the ranch. The Old Quarry is rich in Star Dust: unlock it for ★ ${B183_COST_STARS} (you have ★ ${ranchB99.starStones}).`,opts);
 }
 if(st.id==='quarryExit')return openSheetB100('Path home','Head back to the ranch?',[{label:'Back to the ranch',run:()=>leaveQuarryB183(true)},{label:'Stay',quiet:true}]);
 if(st.rock){
  if(!rockUpB183(st.rock))return openSheetB100('Rock rubble',`This rock grows back in ${clockB102(regrowLeftB183(st.rock))}.`,[{label:'OK',quiet:true}]);
  if(!toolReadyB106())return openSheetB100('Rock','Pip is too tired to break rocks. Let him rest at his bed.',[{label:'OK',quiet:true}]);
  return openSheetB100('Rock',`Pip breaks it for ${B183_FATIGUE} fatigue (now ${ranchB99.fatigue}/${fatigueMaxB118()}). Always ✧ 1, sometimes a second ✧ or a ◆ Heart Stone. It grows back in 20 min.`,[
   {label:'Break the rock',run:()=>{const g=breakRockB183(st.rock);if(!g)return;pipDoB100?.('drill',st,1.2,'power');burstHeartsB100(st.x,st.y-30,3);renderRanchHudB100();ranchToastB100(`Rock broken: ✧ ${g.dust}${g.stones?` and ◆ ${g.stones}`:''}.`,2.4)}},
   {label:'Not now',quiet:true}]);
 }
 return interactBeforeB183(st,...a);
};
const nearestBeforeB183=nearestInteractB100;
nearestInteractB100=function(...a){const n=nearestBeforeB183(...a);if(n?.st){if(n.st.id==='signpost')n.label='Look';else if(n.st.id==='quarryExit')n.label='Go';else if(n.st.rock)n.label=rockUpB183(n.st.rock)?'Break':'Look'}return n};

// ---- drawing ----
const drawStationBeforeB183=drawStationB100;
drawStationB100=function(st,t,...a){
 const x=st.x,y=st.y;
 if(st.id==='signpost'||st.id==='quarryExit'){
  X.fillStyle='#c9a77c';X.fillRect(x-4,y-50,8,62);X.fillStyle='#e8cfa6';roundRectB100(x-40,y-62,80,24,6);X.fill();
  X.fillStyle='#5a5d78';X.font='800 12px system-ui';X.textAlign='center';X.fillText(st.id==='signpost'?'Quarry →':'← Ranch',x,y-45);
  labelB100(x,y-92,st.id==='signpost'?'Signpost':'Path home',st.id==='signpost'&&!quarryB183.unlocked?`★ ${B183_COST_STARS} to unlock`:'');return;
 }
 if(st.rock){
  const up=rockUpB183(st.rock);
  if(up){X.fillStyle='#b9b2c9';X.beginPath();X.moveTo(x-34,y+16);X.lineTo(x-26,y-18);X.lineTo(x-4,y-30);X.lineTo(x+24,y-20);X.lineTo(x+34,y+14);X.closePath();X.fill();
   X.fillStyle='#d6d0e3';X.beginPath();X.moveTo(x-20,y-14);X.lineTo(x-4,y-24);X.lineTo(x+10,y-16);X.lineTo(x-6,y-6);X.closePath();X.fill();
   const s=.5+.5*Math.sin(t*3+x);X.fillStyle=`rgba(159,134,255,${.4+.5*s})`;X.font='bold 13px system-ui';X.textAlign='center';X.fillText('✧',x+12,y-6)}
  else{X.fillStyle='#cfc8db';for(const [dx,dy,r] of [[-14,8,7],[4,12,6],[16,4,5],[-2,0,4]]){X.beginPath();X.arc(x+dx,y+dy,r,0,Math.PI*2);X.fill()}}
  return;
 }
 return drawStationBeforeB183(st,t,...a);
};
// Quarry ground: dusty stone instead of grass while the swap is in.
const drawRanchBeforeB183=drawRanchB100;
drawRanchB100=function(...a){
 if(!inQuarryB183())return drawRanchBeforeB183(...a);
 const g=B100_PASTEL.grass,g2=B100_PASTEL.grass2;B100_PASTEL.grass='#e8e1d6';B100_PASTEL.grass2='#ddd4c6';
 try{return drawRanchBeforeB183(...a)}finally{B100_PASTEL.grass=g;B100_PASTEL.grass2=g2}
};
// The drill-site labels (B137) look up main-map stations; the quarry has none.
const siteLabelsBeforeB183=drawSiteLabelsB137;
drawSiteLabelsB137=function(...a){if(inQuarryB183())return;return siteLabelsBeforeB183(...a)};
