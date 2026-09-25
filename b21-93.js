
// B105 Ranch areas: unlock a garden, kitchen and orchard. Grow crops by the ranch week,
// cook meals from what you grow and buy, and feed them to Pip for battle and ranch buffs.
Object.assign(B104_ITEMS,{
 carrot:{name:"Carrot",icon:"🥕",food:15,sell:8},
 strawberry:{name:"Strawberry",icon:"🍓",food:10,sell:12},
 pumpkin:{name:"Pumpkin",icon:"🎃",food:30,sell:40},
 apple:{name:"Apple",icon:"🍎",food:15,sell:8},
 seed_carrot:{name:"Carrot seeds",icon:"🌱",price:10,crop:"carrot"},
 seed_strawberry:{name:"Strawberry seeds",icon:"🌱",price:20,crop:"strawberry"},
 seed_pumpkin:{name:"Pumpkin seeds",icon:"🌱",price:25,crop:"pumpkin"}
});
const B105_CROPS={carrot:{weeks:2,yield:2},strawberry:{weeks:3,yield:3},pumpkin:{weeks:4,yield:1}};
const B105_TOOLS={hoe:{name:"Hoe",icon:"⛏",price:80,use:"till garden plots"},can:{name:"Watering can",icon:"🚿",price:60,use:"water crops"}};
const B105_AREAS={garden:{name:"Garden",cost:{stones:2},what:"six plots to grow your own food"},kitchen:{name:"Kitchen",cost:{stones:3},what:"combine food into meals with bonuses"},orchard:{name:"Orchard",cost:{star:1},what:"three apple trees that fruit every two weeks"}};
const B105_PLOTS=6,B105_ORCHARD_APPLES=6,B105_ORCHARD_MAX=12;
const B105_MEALS={
 stew:{name:"Carrot Stew",icon:"🍲",food:60,needs:{carrot:2,pumpkin:1},battle:"stew",desc:"next battle test: +20 max HP"},
 bowl:{name:"Harvest Bowl",icon:"🥗",food:50,needs:{carrot:1,strawberry:1,apple:1},battle:"bowl",desc:"next battle test: start at 50% HEAT"},
 crisp:{name:"Apple Crisp",icon:"🥧",food:40,needs:{apple:2,pellets:1},battle:"crisp",desc:"next battle test: Swift +1"},
 tart:{name:"Berry Tart",icon:"🍰",food:45,needs:{strawberry:2,bun:1},ranch:"tart",desc:"next 3 drills: +3 points"},
 pie:{name:"Pumpkin Pie",icon:"🥮",food:55,needs:{pumpkin:1,apple:1,bun:1},ranch:"pie",desc:"next 3 drills: −15 fatigue"}
};
for(const [id,m] of Object.entries(B105_MEALS))B104_ITEMS["meal_"+id]={name:m.name,icon:m.icon,food:m.food,desc:m.desc,onEat:()=>eatMealBuffB105(id)};

function farmDefaultsB105(r,raw){
 const n=(x,lo,hi,d=lo)=>Number.isFinite(x)?Math.min(hi,Math.max(lo,Math.floor(x))):d;
 r.tools={};for(const k in B105_TOOLS)r.tools[k]=!!raw?.tools?.[k];
 r.areas={};for(const k in B105_AREAS)r.areas[k]=!!raw?.areas?.[k];
 r.plots=[];for(let i=0;i<B105_PLOTS;i++){const p=raw?.plots?.[i]||{};const crop=B105_CROPS[p.crop]?p.crop:null;r.plots.push({tilled:!!p.tilled||!!crop,crop,stage:crop?n(p.stage,0,B105_CROPS[crop].weeks):0,watered:!!crop&&!!p.watered})}
 r.orchard={weeks:n(raw?.orchard?.weeks,0,1),apples:n(raw?.orchard?.apples,0,B105_ORCHARD_MAX)};
 const b=raw?.buffs||{};r.buffs={battle:["stew","bowl","crisp"].includes(b.battle)?b.battle:null,ranch:["tart","pie"].includes(b.ranch?.id)?{id:b.ranch.id,drills:n(b.ranch.drills,0,3)}:null};
 if(r.buffs.ranch&&!r.buffs.ranch.drills)r.buffs.ranch=null;
 return r;
}
const loadRanchBeforeB105=loadRanchB99;
loadRanchB99=function(){let raw=null;try{raw=JSON.parse(localStorage.getItem(B99_RANCH_KEY)||"null")}catch(_){}return farmDefaultsB105(loadRanchBeforeB105(),raw)};
const ranchDefaultBeforeB105=ranchDefaultB99;
ranchDefaultB99=function(){return farmDefaultsB105(ranchDefaultBeforeB105(),null)};
ranchB99=loadRanchB99();syncCapsB102();

// ---- unlocks and tools ----
function areaCostTextB105(id){const c=B105_AREAS[id].cost;return c.star?`★ ${c.star}`:`◆ ${c.stones}`}
function unlockAreaB105(id){
 const a=B105_AREAS[id];if(!a||ranchB99.areas[id])return false;
 if(a.cost.star){if(ranchB99.starStones<a.cost.star)return false;ranchB99.starStones-=a.cost.star}
 else{if(ranchB99.stones<a.cost.stones)return false;ranchB99.stones-=a.cost.stones}
 ranchB99.areas[id]=true;saveRanchB99();return true;
}
function buyToolB105(id){const t=B105_TOOLS[id];if(!t||ranchB99.tools[id]||ranchB99.hearts<t.price)return false;ranchB99.hearts-=t.price;ranchB99.tools[id]=true;saveRanchB99();return true}

// ---- garden ----
function plotB105(i){return ranchB99.plots[i]}
function plotRipeB105(p){return !!p.crop&&p.stage>=B105_CROPS[p.crop].weeks}
function tillB105(i){const p=plotB105(i);if(!ranchB99.areas.garden||!ranchB99.tools.hoe||p.tilled)return false;p.tilled=true;saveRanchB99();return true}
function plantB105(i,crop){const p=plotB105(i),seed="seed_"+crop;if(!ranchB99.areas.garden||!p.tilled||p.crop||!B105_CROPS[crop]||itemCountB104(seed)<1)return false;addItemB104(seed,-1);p.crop=crop;p.stage=0;p.watered=false;saveRanchB99();return true}
function waterB105(i){const p=plotB105(i);if(!ranchB99.tools.can||!p.crop||p.watered||plotRipeB105(p))return false;p.watered=true;saveRanchB99();return true}
function waterAllB105(){let n=0;for(let i=0;i<B105_PLOTS;i++)if(waterB105(i))n++;return n}
function harvestB105(i){const p=plotB105(i);if(!plotRipeB105(p))return null;const crop=p.crop,n=B105_CROPS[crop].yield;addItemB104(crop,n);p.crop=null;p.stage=0;p.watered=false;saveRanchB99();return{crop,n}}
function harvestAllB105(){const got=[];for(let i=0;i<B105_PLOTS;i++){const h=harvestB105(i);if(h)got.push(h)}return got}
function pickApplesB105(){const n=ranchB99.orchard.apples;if(!n)return 0;addItemB104("apple",n);ranchB99.orchard.apples=0;saveRanchB99();return n}
// Watered crops grow one stage per ranch week; the orchard fruits every second week.
B104_WEEK_HOOKS.push(()=>{
 for(const p of ranchB99.plots){if(p.crop&&p.watered&&!plotRipeB105(p))p.stage++;p.watered=false}
 if(ranchB99.areas.orchard){ranchB99.orchard.weeks++;if(ranchB99.orchard.weeks>=2){ranchB99.orchard.weeks=0;ranchB99.orchard.apples=Math.min(B105_ORCHARD_MAX,ranchB99.orchard.apples+B105_ORCHARD_APPLES)}}
});

// ---- kitchen and meals ----
function canCookB105(id){const m=B105_MEALS[id];return !!(m&&ranchB99.areas.kitchen&&Object.entries(m.needs).every(([k,n])=>itemCountB104(k)>=n))}
function cookB105(id){if(!canCookB105(id))return false;for(const [k,n] of Object.entries(B105_MEALS[id].needs))addItemB104(k,-n);addItemB104("meal_"+id,1);saveRanchB99();return true}
function eatMealBuffB105(id){const m=B105_MEALS[id];if(m.battle)ranchB99.buffs.battle=m.battle;if(m.ranch)ranchB99.buffs.ranch={id:m.ranch,drills:3}}
const payDrillBeforeB105=payDrillB100;
payDrillB100=function(kind){
 if(!payDrillBeforeB105(kind))return false;
 const b=ranchB99.buffs.ranch;
 if(b?.id==="pie"){ranchB99.fatigue=Math.max(0,ranchB99.fatigue-15);if(--b.drills<=0)ranchB99.buffs.ranch=null;saveRanchB99()}
 return true;
};
const awardBeforeB105=awardDrillB100;
awardDrillB100=function(kind,bonus){
 const b=ranchB99.buffs.ranch;
 if(b?.id!=="tart")return awardBeforeB105(kind,bonus);
 const r=awardBeforeB105(kind,bonus),cap=B99_DRILLS[kind].cap*B100_POINTS_PER_LEVEL,before=ranchB99.stats[kind];
 ranchB99.points[kind]=Math.min(cap,ranchB99.points[kind]+3);ranchB99.stats[kind]=Math.floor(ranchB99.points[kind]/B100_POINTS_PER_LEVEL);
 if(--b.drills<=0)ranchB99.buffs.ranch=null;saveRanchB99();
 return{gain:r.gain+3,levelUp:r.levelUp||ranchB99.stats[kind]>before};
};
B104_RUN_HOOKS.push(()=>{
 const id=ranchB99.buffs.battle;if(!id)return"";
 ranchB99.buffs.battle=null;saveRanchB99();
 if(id==="stew"){S.maxHealth+=20;S.health+=20;return"Carrot Stew: +20 max HP"}
 if(id==="bowl"){S.heat=Math.max(S.heat||0,Math.round(heatCapacityB38()*.5));return"Harvest Bowl: 50% HEAT"}
 if(id==="crisp"){S.pipSpeedLv++;if(S.b99Base)S.b99Base.speed=(S.b99Base.speed||0)+1;return"Apple Crisp: Swift +1"}
 return"";
});

// ---- world ----
B100_WORLD.w=2400;B100_WORLD.h=1600;
B100_TREES.push([2300,200],[2320,800],[2250,1480],[1820,1480],[600,1460],[160,1400],[2330,1180]);
{const i=B100_TREES.findIndex(([x,y])=>x===640&&y===560);if(i>=0)B100_TREES.splice(i,1)}
const B105_PLOT_POS=[];for(let i=0;i<B105_PLOTS;i++)B105_PLOT_POS.push({x:1860+(i%3)*100,y:430+Math.floor(i/3)*100});
B100_STATIONS.push({id:"garden",x:1760,y:330,name:"Garden",r:70},{id:"kitchen",x:2050,y:1050,name:"Kitchen",r:100},{id:"orchard",x:1300,y:1380,name:"Orchard",r:150});
B105_PLOT_POS.forEach((q,i)=>B100_STATIONS.push({id:"plot"+i,plot:i,x:q.x,y:q.y,name:"Plot "+(i+1),noPath:true,get r(){return ranchB99.areas.garden?42:0}}));
const nearestBeforeB105=nearestInteractB100;
nearestInteractB100=function(){
 const n=nearestBeforeB105();const id=n?.st?.id;
 if(id==="garden")n.label=ranchB99.areas.garden?"Garden":"Unlock";
 if(id==="kitchen")n.label=ranchB99.areas.kitchen?"Cook":"Unlock";
 if(id==="orchard")n.label=ranchB99.areas.orchard?"Pick":"Unlock";
 if(n?.st?.plot!=null)n.label="Farm";
 return n;
};
function unlockSheetB105(id){
 const a=B105_AREAS[id],c=a.cost,have=c.star?ranchB99.starStones>=c.star:ranchB99.stones>=c.stones;
 openSheetB100(`${a.name} · locked`,`Unlock for ${areaCostTextB105(id)}: ${a.what}. You have ◆ ${ranchB99.stones} · ★ ${ranchB99.starStones}.`,[
  ...(have?[{label:`Unlock ${a.name} · ${areaCostTextB105(id)}`,run:()=>{unlockAreaB105(id);renderRanchHudB100();burstHeartsB100(stationB100(id).x,stationB100(id).y-40,8);ranchToastB100(`${a.name} unlocked!${id==="garden"?" Buy a hoe, watering can and seeds at the stall.":""}`,4)}}]:[]),
  {label:"Not now",quiet:true}]);
}
function gardenSheetB105(){
 if(!ranchB99.areas.garden)return unlockSheetB105("garden");
 const ripe=ranchB99.plots.filter(plotRipeB105).length,thirsty=ranchB99.plots.filter(p=>p.crop&&!p.watered&&!plotRipeB105(p)).length;
 const tools=Object.entries(B105_TOOLS).map(([k,t])=>`${t.name}: ${ranchB99.tools[k]?"yes":"buy at stall"}`).join(" · ");
 const opts=[];
 if(ripe)opts.push({label:`Harvest all ripe (${ripe})`,run:()=>{const g=harvestAllB105();ranchToastB100("Harvested "+g.map(h=>`${B104_ITEMS[h.crop].icon}×${h.n}`).join(" "))}});
 if(thirsty&&ranchB99.tools.can)opts.push({label:`Water all (${thirsty})`,run:()=>{const n=waterAllB105();ranchToastB100(`Watered ${n} plot${n===1?"":"s"}. They grow when the week passes.`)}});
 opts.push({label:"Close",quiet:true});
 openSheetB100("Garden",`Walk to a plot to till, plant, water or harvest. Watered crops grow one stage each ranch week. ${tools}.`,opts);
}
function plotSheetB105(i){
 const p=plotB105(i),opts=[];let text;
 if(!p.tilled){text=ranchB99.tools.hoe?"Wild grass. Till it to plant.":"Wild grass. You need a hoe (stall) to till it.";if(ranchB99.tools.hoe)opts.push({label:"Till with hoe",run:()=>{tillB105(i);plotSheetB105(i)}})}
 else if(!p.crop){
   const seeds=Object.keys(B105_CROPS).filter(c=>itemCountB104("seed_"+c));
   text=seeds.length?"Tilled soil, ready to plant.":"Tilled soil. Buy seeds at the stall.";
   for(const c of seeds){const cr=B105_CROPS[c];opts.push({label:`Plant ${B104_ITEMS[c].icon} ${B104_ITEMS[c].name} ×${itemCountB104("seed_"+c)} · ${cr.weeks} weeks · yields ${cr.yield}`,run:()=>{plantB105(i,c);if(ranchB99.tools.can)waterB105(i);ranchToastB100(`Planted ${B104_ITEMS[c].name}${p.watered?" and watered it":""}.`)}})}
 }else if(plotRipeB105(p)){text=`${B104_ITEMS[p.crop].name} is ripe!`;opts.push({label:`Harvest ${B104_ITEMS[p.crop].icon}`,run:()=>{const h=harvestB105(i);ranchToastB100(`Harvested ${B104_ITEMS[h.crop].icon} ×${h.n}`)}})}
 else{const cr=B105_CROPS[p.crop];text=`${B104_ITEMS[p.crop].name}: week ${p.stage}/${cr.weeks}. ${p.watered?"Watered this week.":"Needs water to grow this week."}`;if(!p.watered&&ranchB99.tools.can)opts.push({label:"Water",run:()=>{waterB105(i);ranchToastB100("Watered. It grows when the week passes.")}});if(!ranchB99.tools.can&&!p.watered)text+=" Buy a watering can at the stall."}
 opts.push({label:"Close",quiet:true});
 openSheetB100(`Plot ${i+1}`,text,opts);
}
function kitchenSheetB105(){
 if(!ranchB99.areas.kitchen)return unlockSheetB105("kitchen");
 const opts=[],lines=[];
 for(const [id,m] of Object.entries(B105_MEALS)){
   const need=Object.entries(m.needs).map(([k,n])=>`${B104_ITEMS[k].icon}${n}`).join(" ");
   if(canCookB105(id))opts.push({label:`Cook ${m.icon} ${m.name} (${need}) · ${m.desc}`,run:()=>{cookB105(id);ranchToastB100(`Cooked ${m.name}! Feed it to Pip from his menu.`);kitchenSheetB105()}});
   else lines.push(`${m.icon} ${m.name}: ${need}`);
 }
 opts.push({label:"Close",quiet:true});
 openSheetB100("Kitchen",`Combine food into meals. Meals feed more and give bonuses.${lines.length?" Missing ingredients: "+lines.join(" · ")+".":""}`,opts);
}
function orchardSheetB105(){
 if(!ranchB99.areas.orchard)return unlockSheetB105("orchard");
 const n=ranchB99.orchard.apples;
 openSheetB100("Orchard",n?`${n} apples are ready.`:`No apples yet. The trees fruit every two ranch weeks (next in ${2-ranchB99.orchard.weeks}).`,[...(n?[{label:`Pick 🍎 ×${n}`,run:()=>{pickApplesB105();ranchToastB100(`Picked 🍎 ×${n}.`)}}]:[]),{label:"Close",quiet:true}]);
}
const interactBeforeB105=interactStationB100;
interactStationB100=function(st){
 if(st.id==="garden")return gardenSheetB105();
 if(st.id==="kitchen")return kitchenSheetB105();
 if(st.id==="orchard")return orchardSheetB105();
 if(st.plot!=null)return plotSheetB105(st.plot);
 return interactBeforeB105(st);
};
// The stall gains tools, seeds and a crop buyer once there is a garden.
B104_STALL_EXTRA.push(opts=>{
 if(!ranchB99.areas.garden&&!ranchB99.areas.orchard)return;
 for(const [k,t] of Object.entries(B105_TOOLS))if(!ranchB99.tools[k])opts.push({label:`${t.icon} ${t.name} · ♥ ${t.price} · ${t.use}`,run:()=>{if(buyToolB105(k)){renderRanchHudB100();ranchToastB100(`Bought a ${t.name}!`)}else ranchToastB100(`Need ♥ ${t.price}.`);stallSheetB104()}});
 if(ranchB99.areas.garden)for(const c of Object.keys(B105_CROPS)){const s=B104_ITEMS["seed_"+c];opts.push({label:`${s.icon} ${s.name} · ♥ ${s.price}`,run:()=>{if(buyItemB104("seed_"+c)){renderRanchHudB100();ranchToastB100(`Bought ${s.name}.`)}else ranchToastB100(`Need ♥ ${s.price}.`);stallSheetB104()}})}
 const sellable=["carrot","strawberry","pumpkin","apple"].filter(k=>itemCountB104(k));
 if(sellable.length)opts.push({label:"Sell crops…",run:()=>sellSheetB105()});
});
function sellSheetB105(){
 const opts=["carrot","strawberry","pumpkin","apple"].filter(k=>itemCountB104(k)).map(k=>{const it=B104_ITEMS[k];return{label:`Sell ${it.icon} ${it.name} ×${itemCountB104(k)} · ♥ ${it.sell} each`,run:()=>{sellItemB104(k);renderRanchHudB100();ranchToastB100(`Sold a ${it.name} for ♥ ${it.sell}.`);sellSheetB105()}}});
 opts.push({label:"Back",run:()=>stallSheetB104()},{label:"Done",quiet:true});
 openSheetB100("Sell crops",`You have ♥ ${ranchB99.hearts}.`,opts);
}

const drawStationBeforeB105=drawStationB100;
drawStationB100=function(st,t){
 drawStationBeforeB105(st,t);
 const c=B100_PASTEL,x=st.x,y=st.y,lock=id=>!ranchB99.areas[id];
 if(st.id==="garden"){
   X.globalAlpha=lock("garden")?.45:1;
   X.strokeStyle=c.fence;X.lineWidth=5;X.strokeRect(1800,370,320,220);
   for(let i=0;i<B105_PLOTS;i++){const q=B105_PLOT_POS[i],p=plotB105(i);
     X.fillStyle=!p.tilled?"#c2e5c6":p.watered?"#b8977a":"#dcbfa0";roundRectB100(q.x-34,q.y-34,68,68,10);X.fill();
     if(!p.tilled){X.fillStyle="#a9d8ae";for(let k=0;k<4;k++){X.beginPath();X.ellipse(q.x-18+k*12,q.y+((k%2)*10-4),6,3,0,0,Math.PI*2);X.fill()}}
     if(p.crop){const cr=B105_CROPS[p.crop],ripe=plotRipeB105(p);if(ripe){X.font="28px system-ui";X.textAlign="center";X.fillText(B104_ITEMS[p.crop].icon,q.x,q.y+10)}else{const s=6+p.stage/cr.weeks*14;X.fillStyle="#7cc98a";X.beginPath();X.ellipse(q.x-5,q.y,s*.5,s,-.5,0,Math.PI*2);X.ellipse(q.x+5,q.y,s*.5,s,.5,0,Math.PI*2);X.fill()}}
   }
   X.globalAlpha=1;
   X.fillStyle="#e9d5c3";X.fillRect(x-4,y,8,30);X.fillStyle=c.butter;roundRectB100(x-36,y-24,72,28,8);X.fill();X.fillStyle="#4b4470";X.font="bold 13px system-ui";X.textAlign="center";X.fillText(lock("garden")?"🔒 "+areaCostTextB105("garden"):"🌱",x,y-5);
   labelB100(x+200,300,"Garden",lock("garden")?"Locked":`${ranchB99.plots.filter(plotRipeB105).length} ripe`);
 }
 if(st.id==="kitchen"){
   X.globalAlpha=lock("kitchen")?.5:1;
   X.fillStyle=c.butter;X.fillRect(x-80,y-80,160,100);X.fillStyle=c.pink;X.beginPath();X.moveTo(x-96,y-78);X.lineTo(x,y-140);X.lineTo(x+96,y-78);X.closePath();X.fill();
   X.fillStyle="#e9d5c3";X.fillRect(x+40,y-150,18,50);X.fillStyle="#fff";X.fillRect(x-18,y-40,36,60);X.fillStyle="#bfe4f6";X.fillRect(x-66,y-58,34,26);X.fillRect(x+32,y-58,34,26);
   X.globalAlpha=1;labelB100(x,y-156,"Kitchen",lock("kitchen")?`🔒 ${areaCostTextB105("kitchen")}`:"Cook meals");
 }
 if(st.id==="orchard"){
   const trees=[[-100,20],[0,-30],[100,20]];
   for(const [dx,dy] of trees){X.globalAlpha=lock("orchard")?.45:1;X.fillStyle="#e9d5c3";X.fillRect(x+dx-6,y+dy,12,34);X.fillStyle=c.mint;X.beginPath();X.arc(x+dx,y+dy-8,40,0,Math.PI*2);X.fill();
     if(!lock("orchard")&&ranchB99.orchard.apples){X.fillStyle="#ff8a9a";for(let k=0;k<Math.min(4,Math.ceil(ranchB99.orchard.apples/3));k++){X.beginPath();X.arc(x+dx-18+k*12,y+dy-10+(k%2)*14,6,0,Math.PI*2);X.fill()}}}
   X.globalAlpha=1;labelB100(x,y-100,"Orchard",lock("orchard")?`🔒 ${areaCostTextB105("orchard")}`:ranchB99.orchard.apples?`${ranchB99.orchard.apples} apples`:"Growing");
 }
};
