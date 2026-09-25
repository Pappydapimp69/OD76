
// B106 Overgrowth: drill sites start ringed by trees and shrubs you cannot walk through.
// Only Pip uses tools, and every tool use tires him. Heart Stones also fall in the arena.
const B106_TOOL_FATIGUE={chop:15,cut:8,till:8,water:4};
const B106_OBSTACLE_RING=100,B106_OUTER_RING=165,B106_OUTER_COUNT=14,B106_PLAYER_R=14;
Object.assign(B105_TOOLS,{axe:{name:"Axe",icon:"🪓",price:50,use:"Pip chops trees"},sickle:{name:"Sickle",icon:"🌾",price:25,use:"Pip cuts shrubs"}});
const B106_EARLY_TOOLS=["axe","sickle"];
const B106_OBSTACLES=[];
for(const id of ["range","speed","power","guard"]){
 const st=B100_STATIONS.find(s=>s.id===id);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.2,tree=i%4===0;B106_OBSTACLES.push({id:`${id}${i}`,site:id,tree,x:st.x+Math.cos(a)*B106_OBSTACLE_RING,y:st.y+Math.sin(a)*B106_OBSTACLE_RING*(id==="speed"?.9:1),r:tree?34:28})}
 // Outer ring (B106 follow-up): 14 more, offset from the inner gaps, spaced tightly enough that nobody squeezes through.
 const outerR=id==="guard"?145:B106_OUTER_RING; // the pond sits just below the plaza
 for(let i=0;i<B106_OUTER_COUNT;i++){const a=i/B106_OUTER_COUNT*Math.PI*2+.45,tree=i%3===0;B106_OBSTACLES.push({id:`${id}${8+i}`,site:id,tree,x:st.x+Math.cos(a)*outerR,y:st.y+Math.sin(a)*outerR*(id==="speed"?.9:1),r:tree?34:28})}
}

function overgrowthDefaultsB106(r,raw){
 r.cleared={};const c=raw?.cleared&&typeof raw.cleared==="object"?raw.cleared:{};
 for(const o of B106_OBSTACLES)if(c[o.id]===true)r.cleared[o.id]=true;
 for(const k of B106_EARLY_TOOLS)r.tools[k]=!!raw?.tools?.[k];
 return r;
}
const loadRanchBeforeB106=loadRanchB99;
loadRanchB99=function(){let raw=null;try{raw=JSON.parse(localStorage.getItem(B99_RANCH_KEY)||"null")}catch(_){}return overgrowthDefaultsB106(loadRanchBeforeB106(),raw)};
const ranchDefaultBeforeB106=ranchDefaultB99;
ranchDefaultB99=function(){return overgrowthDefaultsB106(ranchDefaultBeforeB106(),null)};
ranchB99=loadRanchB99();syncCapsB102();

function obstacleB106(id){return B106_OBSTACLES.find(o=>o.id===id)}
function obstacleStandingB106(o){return !ranchB99.cleared[o.id]}
function siteOpenB106(site){return B106_OBSTACLES.some(o=>o.site===site&&!obstacleStandingB106(o))}

// ---- Pip's tool work ----
function toolReadyB106(){return ranchB99.fatigue<B99_TIRED}
function tireB106(kind){ranchB99.fatigue=Math.min(100,ranchB99.fatigue+B106_TOOL_FATIGUE[kind])}
function clearObstacleB106(id){
 const o=obstacleB106(id);if(!o||!obstacleStandingB106(o))return false;
 const tool=o.tree?"axe":"sickle";if(!ranchB99.tools[tool]||!toolReadyB106())return false;
 ranchB99.cleared[o.id]=true;tireB106(o.tree?"chop":"cut");saveRanchB99();return true;
}
const tillBeforeB106=tillB105;
tillB105=function(i){if(!toolReadyB106())return false;if(!tillBeforeB106(i))return false;tireB106("till");saveRanchB99();return true};
const waterBeforeB106=waterB105;
waterB105=function(i){if(!toolReadyB106())return false;if(!waterBeforeB106(i))return false;tireB106("water");saveRanchB99();return true};

// ---- collision: standing obstacles block the player ----
function pushOutB106(){
 const w=ranchWorldB100;
 // Several passes so being pushed out of one bush can't leave you wedged inside its neighbour.
 for(let pass=0;pass<4;pass++){let moved=false;
   for(const o of B106_OBSTACLES){if(!obstacleStandingB106(o))continue;const dx=w.px-o.x,dy=w.py-o.y,d=hyp(dx,dy),min=o.r+B106_PLAYER_R;if(d<min){const k=d>.01?min/d:0;w.px=d>.01?o.x+dx*k:o.x+min;w.py=d>.01?o.y+dy*k:w.py;moved=true}}
   if(!moved)break}
}
// Spawn a little north of the plaza centre, clear of the Glow Pond's outer ring.
const enterRanchBeforeB106=enterRanchB100;
enterRanchB100=function(){enterRanchBeforeB106();const w=ranchWorldB100;w.py=420;w.cam.y=420;w.pip.y=390};
const updateRanchBeforeB106=updateRanchB100;
updateRanchB100=function(dt){updateRanchBeforeB106(dt);if(ranchWorldB100.active)pushOutB106()};

// ---- world ----
for(const o of B106_OBSTACLES)B100_STATIONS.push({id:"ob_"+o.id,obstacle:o.id,x:o.x,y:o.y,name:o.tree?"Tree":"Shrub",noPath:true,get r(){return obstacleStandingB106(o)?o.r+34:0}});
const nearestBeforeB106=nearestInteractB100;
nearestInteractB100=function(){const n=nearestBeforeB106();if(n?.st?.obstacle)n.label="Clear";return n};
function obstacleSheetB106(id){
 const o=obstacleB106(id),tool=o.tree?"axe":"sickle",t=B105_TOOLS[tool],cost=B106_TOOL_FATIGUE[o.tree?"chop":"cut"];
 const site=B100_GAMES[o.site]?.title||"a drill site";
 let text=`${o.tree?"A tree":"A shrub"} blocks the way to ${site}. Only Pip can use tools: he ${o.tree?"chops":"cuts"} it for +${cost} fatigue (fatigue ${ranchB99.fatigue}).`;
 const opts=[];
 if(!ranchB99.tools[tool])text+=` He needs a ${t.name} (♥ ${t.price} at the stall).`;
 else if(!toolReadyB106())text+=" He's too tired. Let him rest first.";
 else opts.push({label:`Let Pip ${o.tree?"chop":"cut"} it · +${cost} fatigue`,run:()=>{clearObstacleB106(id);pipDoB100("drill",o,1.6,null);burstHeartsB100(o.x,o.y-10,3);renderRanchHudB100();ranchToastB100(`${o.tree?"Timber!":"Snip snip!"} ${siteOpenB106(o.site)?`The way to ${site} is opening up.`:""}`)}});
 opts.push({label:"Not now",quiet:true});
 openSheetB100(o.tree?"Tree":"Shrub",text,opts);
}
const interactBeforeB106=interactStationB100;
interactStationB100=function(st){if(st.obstacle)return obstacleSheetB106(st.obstacle);return interactBeforeB106(st)};
// Tool warnings in the garden follow Pip's fatigue.
const plotSheetBeforeB106=plotSheetB105;
plotSheetB105=function(i){plotSheetBeforeB106(i);if(!toolReadyB106()){const p=$("ranchSheetB100")?.querySelector("p");if(p)p.textContent+=" Pip is too tired for tool work; let him rest."}};
// Axe and sickle are sold from the start; farm tools once there is somewhere to farm.
B104_STALL_EXTRA.unshift(opts=>{
 if(ranchB99.areas.garden||ranchB99.areas.orchard)return;
 for(const k of B106_EARLY_TOOLS){const t=B105_TOOLS[k];if(ranchB99.tools[k])continue;opts.push({label:`${t.icon} ${t.name} · ♥ ${t.price} · ${t.use}`,run:()=>{if(buyToolB105(k)){renderRanchHudB100();ranchToastB100(`Bought a ${t.name}!`)}else ranchToastB100(`Need ♥ ${t.price}.`);stallSheetB104()}})}
});
const bagLinesBeforeB106=bagLinesB104;
bagLinesB104=function(){return[...Object.entries(B105_TOOLS).filter(([k])=>ranchB99.tools[k]).map(([,t])=>`${t.icon} ${t.name}`),...bagLinesBeforeB106()]};

const drawStationBeforeB106=drawStationB100;
drawStationB100=function(st,t){
 drawStationBeforeB106(st,t);
 if(!st.obstacle)return;
 const o=obstacleB106(st.obstacle),x=o.x,y=o.y;
 if(!obstacleStandingB106(o)){if(o.tree){X.fillStyle="#d9bfa3";X.beginPath();X.ellipse(x,y+8,12,6,0,0,Math.PI*2);X.fill()}return}
 X.fillStyle="#00000014";X.beginPath();X.ellipse(x,y+o.r*.7,o.r*.9,o.r*.3,0,0,Math.PI*2);X.fill();
 if(o.tree){X.fillStyle="#d9bfa3";X.fillRect(x-7,y,14,28);X.fillStyle="#9fd8b4";X.beginPath();X.arc(x,y-10,o.r,0,Math.PI*2);X.fill();X.fillStyle="#b8e6c8";X.beginPath();X.arc(x-10,y-20,o.r*.45,0,Math.PI*2);X.fill()}
 else{X.fillStyle="#a8dcb2";X.beginPath();X.arc(x-10,y,o.r*.62,0,Math.PI*2);X.arc(x+10,y,o.r*.62,0,Math.PI*2);X.arc(x,y-10,o.r*.66,0,Math.PI*2);X.fill();X.fillStyle="#ff9fb7";for(const [a,b] of [[-8,-6],[6,-12],[10,2]]){X.beginPath();X.arc(x+a,y+b,2.6,0,Math.PI*2);X.fill()}}
};
// Overgrowth covers the site art, but the drill site names stay readable on top.
const B106_LABEL_Y={range:90,speed:110,power:70,guard:95};
const drawPipBeforeB106=drawPipB100;
drawPipB100=function(t){
 for(const id in B106_LABEL_Y){if(siteOpenB106(id)&&!B106_OBSTACLES.some(o=>o.site===id&&obstacleStandingB106(o)))continue;const st=stationB100(id);labelB100(st.x,st.y-B106_LABEL_Y[id],B100_GAMES[id].title,`${B99_DRILLS[id].stat} Lv ${ranchB99.stats[id]}`)}
 drawPipBeforeB106(t);
};
// Draw obstacles after the stations they surround so they overlap the site art.
{const obs=B100_STATIONS.filter(s=>s.obstacle);for(const s of obs)B100_STATIONS.splice(B100_STATIONS.indexOf(s),1);B100_STATIONS.push(...obs)}

// ---- Heart Stones fall in the arena ----
const B106_STONE_CHANCE=.10;
let heartStoneDropsB106=[];
function spawnHeartStoneB106(x,y){
 if(heartStoneDropsB106.some(n=>!n.dead&&!n.bossDrop)&&x==null)return false;
 const p=x==null?b26PointOutsideViews():{x,y};
 heartStoneDropsB106.push({x:p.x,y:p.y,r:14,life:x==null?24:45,dead:false,fall:x==null?1.05:.28,fallMax:x==null?1.05:.28,phase:rr(0,6.28),bossDrop:x!=null});
 if(x==null){announce("HEART STONE FALLING",900);showPipMessage("a Heart Stone! that's for the ranch — follow the marker!",true)}
 return true;
}
function collectHeartStoneB106(n){
 if(n.dead)return;n.dead=true;S.runStones=(S.runStones||0)+1;S.score+=800;
 popup(n.x,n.y,"◆ HEART STONE","#ffb7cf",true,1.0);particle(n.x,n.y,"#ff9fb7",20,150);ring(n.x,n.y,"#ffb7cf",86);
 if(ensureAudio())audioEngine.chime([69,76,81],.036);
}
const checkMilestoneBeforeB106=checkKillMilestoneDropB30;
checkKillMilestoneDropB30=function(){
 const before=S?.b30LastKillMilestone||0;checkMilestoneBeforeB106();
 for(let m=before+EXPLORATION_KILL_INTERVAL_B30;m<=(S?.b30LastKillMilestone||0);m+=EXPLORATION_KILL_INTERVAL_B30)if(rnd()<B106_STONE_CHANCE)spawnHeartStoneB106();
};
const dropBossBeforeB106=dropBossExplorationRewardsB30;
dropBossExplorationRewardsB30=function(x,y){dropBossBeforeB106(x,y);spawnHeartStoneB106(x+rr(-24,24),y+rr(-24,24))};
const updateDropsBeforeB106=updateB26Drops;
updateB26Drops=function(dt){
 updateDropsBeforeB106(dt);
 if(!S.run||S.end||S.waveState==="stage")return;
 for(const n of heartStoneDropsB106){if(n.dead)continue;n.life-=dt;n.phase+=dt*5;if(n.fall>0)n.fall=Math.max(0,n.fall-dt);if(n.fall<=0&&hyp(P.x-n.x,P.y-n.y)<P.r+n.r+7)collectHeartStoneB106(n)}
 heartStoneDropsB106=heartStoneDropsB106.filter(n=>!n.dead&&n.life>0);
};
const drawDropsBeforeB106=drawB26Drops;
drawB26Drops=function(){
 drawDropsBeforeB106();
 X.save();X.textAlign="center";
 for(const n of heartStoneDropsB106){
   const sx=worldToScreenX(n.x),sy=worldToScreenY(n.y)-(n.fall>0?(n.fall/(n.fallMax||1))*120:0);
   if(sx>-60&&sx<W+60&&sy>-170&&sy<H+60){drawFallingTrailB26(sx,sy,n.fall,"#ffb7cf");X.save();X.translate(sx,sy);X.rotate(Math.sin(S.t*2+n.phase)*.3);X.fillStyle="#ffb7cf";X.beginPath();X.moveTo(0,-14);X.lineTo(11,-2);X.lineTo(0,14);X.lineTo(-11,-2);X.closePath();X.fill();X.fillStyle="#fff";X.globalAlpha=.7;X.beginPath();X.moveTo(0,-9);X.lineTo(5,-2);X.lineTo(0,2);X.closePath();X.fill();X.restore()}
   drawWaypointB26(n,"#ffb7cf","◆");
 }
 X.restore();
};
const rareTargetsBeforeB106=rareRewardTargetsB48;
rareRewardTargetsB48=function(){
 const out=rareTargetsBeforeB106();if(!S||!P)return out;
 for(const n of heartStoneDropsB106)if(!n.dead&&n.life>0)out.push({x:n.x,y:n.y,icon:"◆",label:"HEART STONE",color:"#ffb7cf",priority:4,d:hyp(n.x-P.x,n.y-P.y)});
 return out.sort((a,b)=>b.priority-a.priority||a.d-b.d);
};
const resetBeforeB106=reset;
reset=function(){heartStoneDropsB106=[];resetBeforeB106();if(S)S.runStones=0};
if(S)S.runStones=0;
// Stones found in the arena bank like hearts: all of them going home, half after a fall.
const bankBeforeB106=bankRunB99;
bankRunB99=function(dead){
 const tests=ranchB99.tests,found=Math.max(0,S?.runStones||0),earned=bankBeforeB106(dead);
 if(ranchB99.tests>tests&&found){const kept=dead?Math.floor(found/2):found;ranchB99.stones+=kept;ranchB99.report+=` Heart Stones found: ◆ ${kept}${dead?` of ${found}`:""}.`;saveRanchB99()}
 return earned;
};
const gateBeforeB106=openRanchGateB99;
openRanchGateB99=function(){gateBeforeB106();const n=S?.runStones||0;if(n)$("ranchGateTextB99").textContent+=` Pip also found ◆ ${n} Heart Stone${n===1?"":"s"}.`};
const currencyBeforeB106=currencyItemsB47;
currencyItemsB47=function(){const items=currencyBeforeB106();if(S?.runStones)items.push({icon:"♦",value:S.runStones,title:"Heart Stones"});return items};
{const s=document.createElement("style");s.textContent=`#currencyHud .b47-currency[title="Heart Stones"] i{color:#ffb7cf}`;document.head.appendChild(s)}
