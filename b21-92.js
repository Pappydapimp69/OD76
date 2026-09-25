
// B104 Pip's needs: hunger and hygiene join fatigue. A food stall, a wash tub, a bag,
// and Pip's care menu. Each ranch week (drill, rest or battle test) makes Pip hungrier and messier.
const B104_START_NEED=80,B104_LOW=40,B104_STARVING=20;
const B104_WEEK_HUNGER=12,B104_WEEK_DIRT={drill:14,rest:6,battle:20};
const B104_ITEMS={
 pellets:{name:"Pip Pellets",icon:"🥣",food:25,price:15,sell:0},
 bun:{name:"Berry Bun",icon:"🥯",food:40,fatigue:5,price:30,sell:0},
 soap:{name:"Bubble Soap",icon:"🫧",price:10,sell:0}
};
const B104_WEEK_HOOKS=[],B104_RUN_HOOKS=[];

function needsDefaultsB104(r,raw){
 const n=(x,lo,hi,d)=>Number.isFinite(x)?Math.min(hi,Math.max(lo,Math.floor(x))):d;
 r.hunger=n(raw?.hunger,0,100,B104_START_NEED);r.hygiene=n(raw?.hygiene,0,100,B104_START_NEED);
 r.items={};const it=raw?.items&&typeof raw.items==="object"?raw.items:{};
 for(const k in it)if(/^[a-z_]{1,24}$/.test(k))r.items[k]=n(it[k],0,9999,0);
 return r;
}
const loadRanchBeforeB104=loadRanchB99;
loadRanchB99=function(){let raw=null;try{raw=JSON.parse(localStorage.getItem(B99_RANCH_KEY)||"null")}catch(_){}return needsDefaultsB104(loadRanchBeforeB104(),raw)};
const ranchDefaultBeforeB104=ranchDefaultB99;
ranchDefaultB99=function(){return needsDefaultsB104(ranchDefaultBeforeB104(),null)};
ranchB99=loadRanchB99();syncCapsB102();

function itemCountB104(id){return ranchB99.items[id]||0}
function addItemB104(id,n=1){ranchB99.items[id]=Math.max(0,itemCountB104(id)+n);if(!ranchB99.items[id])delete ranchB99.items[id]}
function itemInfoB104(id){return B104_ITEMS[id]}
function buyItemB104(id,n=1){const it=itemInfoB104(id);if(!it?.price||ranchB99.hearts<it.price*n)return false;ranchB99.hearts-=it.price*n;addItemB104(id,n);saveRanchB99();return true}
function sellItemB104(id,n=1){const it=itemInfoB104(id);if(!it?.sell||itemCountB104(id)<n)return false;addItemB104(id,-n);ranchB99.hearts+=it.sell*n;saveRanchB99();return true}
function feedB104(id){
 const it=itemInfoB104(id);if(!it?.food||itemCountB104(id)<1)return null;
 addItemB104(id,-1);ranchB99.hunger=Math.min(100,ranchB99.hunger+it.food);
 if(it.fatigue)ranchB99.fatigue=Math.max(0,ranchB99.fatigue-it.fatigue);
 if(it.onEat)it.onEat();
 saveRanchB99();return it;
}
function washB104(){if(itemCountB104("soap")<1)return false;addItemB104("soap",-1);ranchB99.hygiene=Math.min(100,ranchB99.hygiene+50);saveRanchB99();return true}

// ---- weeks ----
function weekPassedB104(kind){
 ranchB99.hunger=Math.max(0,ranchB99.hunger-B104_WEEK_HUNGER);
 ranchB99.hygiene=Math.max(0,ranchB99.hygiene-(B104_WEEK_DIRT[kind]||6));
 for(const h of B104_WEEK_HOOKS)h(kind);
 saveRanchB99();
}
const payDrillBeforeB104=payDrillB100;
payDrillB100=function(kind){
 const hungry=ranchB99.hunger<B104_LOW;
 if(!payDrillBeforeB104(kind))return false;
 if(hungry)ranchB99.fatigue=Math.min(100,ranchB99.fatigue+10);
 weekPassedB104("drill");return true;
};
const restBeforeB104=restB99;
restB99=function(){restBeforeB104();weekPassedB104("rest")};
const bankBeforeB104=bankRunB99;
bankRunB99=function(dead){
 const tests=ranchB99.tests,earned=bankBeforeB104(dead);
 if(ranchB99.tests>tests){ranchB99.week++;weekPassedB104("battle")}
 return earned;
};
// Hungry or grubby Pips train worse.
function needPenaltyB104(){return(ranchB99.hunger<B104_LOW?.15:0)+(ranchB99.hygiene<B104_LOW?.10:0)}
const soloChanceBeforeB104=soloChanceB100;
soloChanceB100=function(){return Math.max(.2,soloChanceBeforeB104()-needPenaltyB104())};

// A starving or filthy Pip carries a penalty into the battle test; run hooks (meals) apply here too.
function runStartB104(){
 if(!S||S.b104Started)return;S.b104Started=true;
 const notes=[];
 const drop=(k,prop)=>{if(S[prop]>0){S[prop]--;if(S.b99Base)S.b99Base[k]=Math.max(0,(S.b99Base[k]||0)-1)}};
 if(ranchB99.hunger<B104_STARVING){drop("speed","pipSpeedLv");drop("power","pipPowerLv");notes.push("Pip is starving: Swift and Star Power −1")}
 if(ranchB99.hygiene<B104_STARVING){drop("range","pipRangeLv");drop("guard","pipGuardLv");notes.push("Pip is filthy: Heart Sense and Guardian Glow −1")}
 for(const h of B104_RUN_HOOKS){const n=h();if(n)notes.push(n)}
 applyPipPower();
 if(notes.length&&$("pipMood"))$("pipMood").textContent="✦ "+notes.join(" · ");
 S.b104Notes=notes;
}
const startWaveBeforeB104=startWave;
startWave=function(n){if(n===1&&S?.run)runStartB104();return startWaveBeforeB104(n)};

// ---- world: stall and wash tub ----
B100_STATIONS.push({id:"stall",x:640,y:540,name:"Food stall",r:80},{id:"tub",x:640,y:230,name:"Wash tub",r:70});
const nearestBeforeB104=nearestInteractB100;
nearestInteractB100=function(){
 const n=nearestBeforeB104();
 if(n?.st?.id==="stall")n.label="Shop";
 if(n?.st?.id==="tub")n.label="Wash";
 if(n?.kind==="pip")n.label="Pip";
 return n;
};
function bagLinesB104(){return Object.keys(ranchB99.items).filter(k=>itemCountB104(k)>0).map(k=>`${itemInfoB104(k)?.icon||"•"} ${itemInfoB104(k)?.name||k} ×${itemCountB104(k)}`)}
function stallSheetB104(){
 const opts=[];
 for(const id of ["pellets","bun","soap"]){const it=B104_ITEMS[id];opts.push({label:`${it.icon} ${it.name} · ♥ ${it.price}${it.food?` · food +${it.food}`:" · washes Pip"}`,run:()=>{if(buyItemB104(id)){renderRanchHudB100();ranchToastB100(`Bought ${it.name}.`)}else ranchToastB100(`Need ♥ ${it.price}.`);stallSheetB104()}})}
 for(const o of B104_STALL_EXTRA)o(opts);
 opts.push({label:"Done",quiet:true});
 openSheetB100("Food stall",`You have ♥ ${ranchB99.hearts}. Buy food and supplies for Pip.`,opts);
}
const B104_STALL_EXTRA=[];
function tubSheetB104(){
 openSheetB100("Wash tub",`Hygiene ${ranchB99.hygiene}/100. A wash uses one Bubble Soap (♥ ${B104_ITEMS.soap.price} at the stall) and adds 50 hygiene. You have ${itemCountB104("soap")} soap.`,[
  ...(itemCountB104("soap")?[{label:"Wash Pip",run:()=>{washB104();pipDoB100("drill",stationB100("tub"),2,null);burstHeartsB100(stationB100("tub").x,stationB100("tub").y-20,4);renderRanchHudB100();ranchToastB100("Splish splash! Pip is squeaky clean.")}}]:[]),
  {label:"Not now",quiet:true}]);
}
function pipSheetB104(){
 const opts=[{label:"Pet Pip",run:()=>petPipBeforeB104()}];
 for(const id of Object.keys(ranchB99.items)){const it=itemInfoB104(id);if(!it?.food||!itemCountB104(id))continue;opts.push({label:`Feed ${it.icon} ${it.name} ×${itemCountB104(id)} · food +${it.food}${it.desc?` · ${it.desc}`:""}`,run:()=>{feedB104(id);ranchWorldB100.pip.happy=2;burstHeartsB100(ranchWorldB100.pip.x,ranchWorldB100.pip.y,4);renderRanchHudB100();ranchToastB100(`Pip munched the ${it.name}. Yum!${it.buffNote?" "+it.buffNote:""}`)}})}
 opts.push({label:"Close",quiet:true});
 const mood=ranchB99.hunger<B104_STARVING?"Pip's tummy is rumbling loudly.":ranchB99.hunger<B104_LOW?"Pip keeps glancing at the food stall.":ranchB99.hygiene<B104_LOW?"Pip is a bit grubby.":"Pip looks happy.";
 openSheetB100("Pip",`${mood} Food ${ranchB99.hunger} · Clean ${ranchB99.hygiene} · Tired ${ranchB99.fatigue}.${opts.length===2?" Buy food at the stall.":""}`,opts);
}
function bagSheetB104(){const lines=bagLinesB104();openSheetB100("Bag",lines.length?lines.join(" · "):"Empty. Buy food at the stall.",[{label:"Close",quiet:true}])}
const interactBeforeB104=interactStationB100;
interactStationB100=function(st){if(st.id==="stall")return stallSheetB104();if(st.id==="tub")return tubSheetB104();return interactBeforeB104(st)};
// Pressing A at Pip opens his care menu; petting is its first option.
const petPipBeforeB104=petPipB100;
petPipB100=function(){pipSheetB104()};

// ---- HUD ----
(function installNeedsHudB104(){
 const hud=$("ranchHudB100");if(!hud)return;
 const fat=hud.querySelector(".fat"),tired=fat?.previousElementSibling;
 const label=(el,word,icon)=>{el.className="needLabel";el.innerHTML=`<span class="w">${word}</span><span class="i">${icon}</span>`};
 if(tired)label(tired,"Tired","😴");
 const add=(id,word,icon)=>{const s=document.createElement("span");label(s,word,icon);const d=document.createElement("div");d.className="fat need";d.innerHTML=`<i id="${id}"></i>`;hud.append(s,d)};
 add("ranchHungerB104","Food","🍽");add("ranchHygieneB104","Clean","🫧");

 const bag=document.createElement("button");bag.id="ranchBagB104";bag.type="button";bag.textContent="🎒 Bag";document.getElementById("app").appendChild(bag);
 bag.addEventListener("click",()=>{if(ranchWorldB100.active&&!ranchWorldB100.sheet&&!ranchWorldB100.game)bagSheetB104()});
 const style=document.createElement("style");style.textContent=`#ranchHudB100{width:max-content;max-width:94vw}#ranchHudB100 .need i{background:linear-gradient(90deg,#ff9fb7,#ffe08a,#9fe3c1)}#ranchHudB100 .fat{width:54px}#ranchHudB100 .needLabel .i{display:none}
#ranchBagB104{position:absolute;z-index:12;left:max(14px,env(safe-area-inset-left));bottom:max(22px,env(safe-area-inset-bottom));display:none;border:3px solid #fff;border-radius:999px;padding:10px 16px;background:#cdbbff;color:#4b4470;font:800 14px system-ui;box-shadow:0 8px 22px #6b5b9a40;cursor:pointer}
body.ranchB100 #ranchBagB104{display:block}#ranchSheetB100{max-height:min(64vh,560px);overflow:auto}
@media(max-width:700px){#ranchHudB100{gap:6px;padding:6px 10px;font-size:11px}#ranchHudB100 .needLabel .w{display:none}#ranchHudB100 .needLabel .i{display:inline}#ranchHudB100 .fat{width:34px}}`;document.head.appendChild(style);
})();
const hudBeforeB104=renderRanchHudB100;
renderRanchHudB100=function(){hudBeforeB104();if(W<700)$("ranchWeekB100").textContent=`WK ${ranchB99.week}`;$("ranchHungerB104").style.width=ranchB99.hunger+"%";$("ranchHygieneB104").style.width=ranchB99.hygiene+"%"};

const drawStationBeforeB104=drawStationB100;
drawStationB100=function(st,t){
 drawStationBeforeB104(st,t);
 const c=B100_PASTEL,x=st.x,y=st.y;
 if(st.id==="stall"){X.fillStyle="#e9d5c3";X.fillRect(x-56,y-40,8,60);X.fillRect(x+48,y-40,8,60);for(let i=0;i<6;i++){X.fillStyle=i%2?"#fff":c.pink;X.fillRect(x-60+i*20,y-62,20,24)}X.fillStyle=c.peach;roundRectB100(x-58,y-6,116,30,8);X.fill();X.font="18px system-ui";X.textAlign="center";X.fillText("🥣🥯🫧",x,y+15);labelB100(x,y-78,"Food stall","Food · soap · seeds")}
 if(st.id==="tub"){X.fillStyle="#bfe4f6";X.beginPath();X.ellipse(x,y,46,22,0,0,Math.PI*2);X.fill();X.strokeStyle="#e9d5c3";X.lineWidth=6;X.stroke();X.fillStyle="#ffffffcc";for(let i=0;i<5;i++){const b=Math.sin(t*2+i)*3;X.beginPath();X.arc(x-28+i*14,y-12+b,6+(i%2)*3,0,Math.PI*2);X.fill()}labelB100(x,y-44,"Wash tub",`Clean ${ranchB99.hygiene}`)}
};
// Pip visibly droops when hungry and gets smudges when grubby.
const drawPipBeforeB104=drawPipB100;
drawPipB100=function(t){
 drawPipBeforeB104(t);const p=ranchWorldB100.pip;
 if(ranchB99.hygiene<B104_LOW){X.fillStyle="#b89a8a99";X.beginPath();X.arc(p.x+5,p.y+5,2.5,0,Math.PI*2);X.arc(p.x-7,p.y-3,2,0,Math.PI*2);X.fill()}
 if(ranchB99.hunger<B104_LOW){X.fillStyle="#8c8fab";X.font="bold 11px system-ui";X.textAlign="center";X.fillText("🍽",p.x-16,p.y-18)}
};
