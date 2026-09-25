
// B100 Ranch world: the ranch is a pastel place you walk around, not a menu.
// Stations run drills; Pip trains solo or with you in a mini-game for a bonus.
const B100_BASE=10,B100_BONUS=5,B100_POINTS_PER_LEVEL=10;
const B100_WORLD={w:1800,h:1200};
const B100_PASTEL={grass:"#d9f2dd",grass2:"#cbeccf",path:"#f7ecd6",pathEdge:"#ecdcbc",fence:"#c9b8f0",ink:"#5a5d78",soft:"#8c8fab",pink:"#ffc4dd",peach:"#ffd8c7",lilac:"#cdbbff",sky:"#bfe4f6",mint:"#b9ecd4",butter:"#fff1b3",white:"#fffaf3"};
const B100_STATIONS=[
 {id:"home",x:420,y:360,name:"Pip's bed",r:90},
 {id:"gate",x:900,y:150,name:"Arena gate",r:90},
 {id:"range",x:1380,y:380,name:"Scent Hunt field",r:110},
 {id:"speed",x:1380,y:880,name:"Sky Laps track",r:120},
 {id:"power",x:420,y:880,name:"Star Target range",r:110},
 {id:"guard",x:900,y:680,name:"Glow Pond",r:120}
];
const B100_GAMES={
 range:{type:"collect",title:"Scent Hunt",how:"Walk over the scent sparkles with Pip. Get 4 of 5 before time runs out."},
 speed:{type:"timing",title:"Sky Laps",how:"Press A as Pip passes through the lit ring. Hit 3 of 4.",rate:3.3},
 power:{type:"timing",title:"Star Target",how:"Press A when the star crosses the target. Hit 3 of 4.",rate:2.6},
 guard:{type:"hold",title:"Glow Pond",how:"Hold A to gather glow, release inside the band. Land 2 of 3."}
};
const B100_TREES=[[180,160],[260,620],[150,1010],[640,120],[1180,150],[1640,160],[1700,620],[1650,1060],[1080,1100],[700,1090],[120,420],[1560,560],[640,560],[1160,560]];

let ranchWorldB100={active:false,px:900,py:470,pip:{x:860,y:430,state:"follow",t:0,tx:0,ty:0,happy:0,face:1},cam:{x:900,y:470},
 sheet:null,game:null,toast:"",toastT:0,hearts:[],prevAct:false,prevBack:false,prevNav:0,idle:0,stick:{id:null,ox:0,oy:0,dx:0,dy:0},touchAct:false};

// Points give drills partial progress: 10 points is one ranch level.
function ensurePointsB100(r){
 const raw=r.points&&typeof r.points==="object"?r.points:{};
 r.points={};
 for(const k in B99_DRILLS){
   const cap=B99_DRILLS[k].cap*B100_POINTS_PER_LEVEL,lo=r.stats[k]*B100_POINTS_PER_LEVEL;
   const v=Number.isFinite(raw[k])?Math.floor(raw[k]):lo;
   r.points[k]=Math.min(cap,Math.max(lo,Math.min(lo+B100_POINTS_PER_LEVEL-1,v)));
 }
 return r;
}
const loadRanchBeforeB100=loadRanchB99;
loadRanchB99=function(){
 const r=loadRanchBeforeB100();
 try{const v=JSON.parse(localStorage.getItem(B99_RANCH_KEY)||"null");if(v&&v.points)r.points=v.points}catch(_){}
 return ensurePointsB100(r);
};
ensurePointsB100(ranchB99);
const ranchDefaultBeforeB100=ranchDefaultB99;
ranchDefaultB99=function(){return ensurePointsB100(ranchDefaultBeforeB100())};

drillBlockB99=function(kind){
 const d=B99_DRILLS[kind];if(!d)return"unknown";
 if(!ranchB99.points)ensurePointsB100(ranchB99);
 if(ranchB99.points[kind]>=d.cap*B100_POINTS_PER_LEVEL)return"capped";
 if(ranchB99.fatigue>=B99_TIRED)return"tired";
 if(ranchB99.hearts<drillCostB99(kind))return"hearts";
 return"";
};
function soloChanceB100(){return clamp(.85-ranchB99.fatigue/200,.35,.85)}
function payDrillB100(kind){
 if(drillBlockB99(kind))return false;
 ranchB99.hearts-=drillCostB99(kind);ranchB99.fatigue=Math.min(100,ranchB99.fatigue+B99_DRILL_FATIGUE);ranchB99.week++;saveRanchB99();
 return true;
}
function awardDrillB100(kind,bonus){
 const d=B99_DRILLS[kind],cap=d.cap*B100_POINTS_PER_LEVEL,before=ranchB99.stats[kind];
 const gain=B100_BASE+bonus*B100_BONUS;
 ranchB99.points[kind]=Math.min(cap,ranchB99.points[kind]+gain);
 ranchB99.stats[kind]=Math.floor(ranchB99.points[kind]/B100_POINTS_PER_LEVEL);
 saveRanchB99();
 return{gain,levelUp:ranchB99.stats[kind]>before};
}
// Solo drill: Pip succeeds more often when rested. roll is injectable for tests.
function soloDrillB100(kind,roll=Math.random()){
 const chance=soloChanceB100();
 if(!payDrillB100(kind))return null;
 const ok=roll<chance;
 return{ok,...awardDrillB100(kind,ok?0:-1)};
}

function ranchActiveB100(){return ranchWorldB100.active}
function stationB100(id){return B100_STATIONS.find(s=>s.id===id)}

(function installRanchWorldB100(){
 const style=document.createElement("style");style.id="ranchWorldStyleB100";
 style.textContent=`body.ranchB100 #app>*:not(canvas):not(.modal):not([id^=ranch]){display:none!important}
#ranchHudB100{position:absolute;z-index:12;left:50%;top:max(10px,env(safe-area-inset-top));transform:translateX(-50%);display:none;align-items:center;gap:12px;padding:8px 14px;border-radius:999px;background:#fffaf3ee;color:#5a5d78;font:700 12px system-ui;box-shadow:0 6px 20px #6b5b9a26;white-space:nowrap}
body.ranchB100 #ranchHudB100{display:flex}
#ranchHudB100 .fat{width:70px;height:8px;border-radius:999px;background:#e7e1f5;overflow:hidden}#ranchHudB100 .fat i{display:block;height:100%;background:linear-gradient(90deg,#9fe3c1,#ffe08a,#ff9fb7)}
#ranchToastB100{position:absolute;z-index:12;left:50%;top:calc(max(10px,env(safe-area-inset-top)) + 46px);transform:translateX(-50%);max-width:min(520px,90vw);padding:8px 14px;border-radius:14px;background:#fffaf3ee;color:#5a5d78;font:600 13px/1.35 system-ui;text-align:center;box-shadow:0 6px 20px #6b5b9a26;opacity:0;transition:opacity .25s;pointer-events:none}
#ranchToastB100.on{opacity:1}
#ranchActB100{position:absolute;z-index:12;right:max(18px,env(safe-area-inset-right));bottom:max(22px,env(safe-area-inset-bottom));width:84px;height:84px;border-radius:50%;border:3px solid #fff;background:#cdbbff;color:#4b4470;font:800 13px system-ui;box-shadow:0 8px 22px #6b5b9a40;display:none;touch-action:none}
body.ranchB100 #ranchActB100.on{display:block}#ranchActB100:active{transform:scale(.95)}
#ranchSheetB100{position:absolute;z-index:13;left:50%;bottom:max(18px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(440px,92vw);padding:16px;border-radius:20px;background:#fffaf3;color:#5a5d78;font:14px/1.4 system-ui;box-shadow:0 10px 30px #6b5b9a40;display:none}
#ranchSheetB100.on{display:block}#ranchSheetB100 h3{margin:0 0 4px;font-size:17px;color:#4b4470}#ranchSheetB100 p{margin:0 0 10px;font-size:13px}
#ranchSheetB100 button{display:block;width:100%;margin-top:8px;padding:11px;border-radius:14px;border:2px solid #e5dcfb;background:#f3eeff;color:#4b4470;font:700 14px system-ui;cursor:pointer}
#ranchSheetB100 button.focus{border-color:#a98cf5;background:#e6dcff;box-shadow:0 0 0 3px #cdbbff66}
#ranchSheetB100 button.quiet{background:#fff;color:#8c8fab}`;
 document.head.appendChild(style);
 const app=document.getElementById("app");
 const hud=document.createElement("div");hud.id="ranchHudB100";hud.innerHTML=`<span id="ranchWeekB100">WEEK 1</span><span id="ranchHeartB100">♥ 0</span><span>Fatigue</span><div class="fat"><i id="ranchFatB100"></i></div>`;app.appendChild(hud);
 const toast=document.createElement("div");toast.id="ranchToastB100";app.appendChild(toast);
 const act=document.createElement("button");act.id="ranchActB100";act.type="button";act.textContent="A";app.appendChild(act);
 act.addEventListener("pointerdown",e=>{e.preventDefault();ranchWorldB100.touchAct=true;ranchWorldB100.touchTap=true;try{act.setPointerCapture(e.pointerId)}catch(_){}});
 const up=e=>{ranchWorldB100.touchAct=false};act.addEventListener("pointerup",up);act.addEventListener("pointercancel",up);
 const sheet=document.createElement("div");sheet.id="ranchSheetB100";app.appendChild(sheet);
 C.addEventListener("pointerdown",e=>{if(!ranchWorldB100.active||ranchWorldB100.sheet)return;const s=ranchWorldB100.stick;s.id=e.pointerId;s.ox=e.clientX;s.oy=e.clientY;s.dx=0;s.dy=0;try{C.setPointerCapture(e.pointerId)}catch(_){}});
 C.addEventListener("pointermove",e=>{const s=ranchWorldB100.stick;if(!ranchWorldB100.active||s.id!==e.pointerId)return;let dx=e.clientX-s.ox,dy=e.clientY-s.oy;const m=hyp(dx,dy);if(m>60){dx=dx/m*60;dy=dy/m*60}s.dx=dx/60;s.dy=dy/60});
 const end=e=>{const s=ranchWorldB100.stick;if(s.id!==e.pointerId)return;s.id=null;s.dx=0;s.dy=0};
 C.addEventListener("pointerup",end);C.addEventListener("pointercancel",end);
})();

function ranchToastB100(text,sec=3.2){ranchWorldB100.toast=text;ranchWorldB100.toastT=sec;const el=$("ranchToastB100");el.textContent=text;el.classList.add("on")}
function renderRanchHudB100(){
 $("ranchWeekB100").textContent=`PIP RANCH · WEEK ${ranchB99.week}`;
 $("ranchHeartB100").textContent=`♥ ${ranchB99.hearts}`;
 $("ranchFatB100").style.width=ranchB99.fatigue+"%";
}

function enterRanchB100(){
 const w=ranchWorldB100;
 for(const id of ["start","end","stageUp","ranchB99"])$(id)?.classList.add("hidden");
 w.active=true;w.px=900;w.py=470;w.cam={x:900,y:470};w.sheet=null;w.game=null;w.hearts=[];w.idle=0;
 w.pip={x:860,y:430,state:"follow",t:0,tx:0,ty:0,happy:0,face:1};
 w.prevAct=true;w.prevBack=true;w.touchTap=false;w.touchAct=false;
 closeSheetB100();
 document.body.classList.add("ranchB100");
 renderRanchHudB100();
 ranchToastB100(ranchB99.report?ranchB99.report:"Welcome to the ranch. Walk up to a station and press A.",5);
}
function leaveRanchB100(){
 ranchWorldB100.active=false;ranchWorldB100.game=null;closeSheetB100();
 document.body.classList.remove("ranchB100");$("ranchActB100").classList.remove("on");$("ranchToastB100").classList.remove("on");
}
openRanchB99=enterRanchB100;
// B99 bound its Pip Ranch buttons to the old menu; rebind them to the world.
for(const id of ["openRanchB99","endRanchB99"]){const old=$(id);if(!old)continue;const b=old.cloneNode(true);old.replaceWith(b);b.addEventListener("click",enterRanchB100)}
const resetBeforeB100=reset;
reset=function(){leaveRanchB100();resetBeforeB100()};

// ---- sheet (station menu) ----
function openSheetB100(title,text,options){
 const w=ranchWorldB100;w.sheet={options,focus:0};
 const el=$("ranchSheetB100");
 el.innerHTML=`<h3></h3><p></p>`;el.querySelector("h3").textContent=title;el.querySelector("p").textContent=text;
 options.forEach((o,i)=>{const b=document.createElement("button");b.type="button";b.textContent=o.label;if(o.quiet)b.className="quiet";b.addEventListener("click",()=>chooseSheetB100(i));el.appendChild(b)});
 el.classList.add("on");focusSheetB100(0);
 w.stick.id=null;w.stick.dx=0;w.stick.dy=0;
}
function focusSheetB100(i){const w=ranchWorldB100;if(!w.sheet)return;const n=w.sheet.options.length;w.sheet.focus=(i+n)%n;[...$("ranchSheetB100").querySelectorAll("button")].forEach((b,j)=>b.classList.toggle("focus",j===w.sheet.focus))}
function closeSheetB100(){ranchWorldB100.sheet=null;const el=$("ranchSheetB100");if(el){el.classList.remove("on");el.innerHTML=""}}
function chooseSheetB100(i){const w=ranchWorldB100;const o=w.sheet?.options[i];closeSheetB100();w.prevAct=true;if(o&&o.run)o.run()}

function levelLineB100(kind){const d=B99_DRILLS[kind],p=ranchB99.points[kind];return`${d.stat} Lv ${ranchB99.stats[kind]}/${d.cap} · ${p%B100_POINTS_PER_LEVEL}/${B100_POINTS_PER_LEVEL} to next`}
function interactStationB100(st){
 if(st.id==="home"){
   openSheetB100("Pip's bed",`Fatigue ${ranchB99.fatigue}/100. Resting takes a week and removes ${B99_REST} fatigue.`,[
     {label:"Rest a week",run:()=>{restB99();pipDoB100("sleep",st,2.2);renderRanchHudB100();ranchToastB100("Pip curls up and naps all week. zZ")}},
     {label:"Not now",quiet:true}]);return;
 }
 if(st.id==="gate"){
   const s=ranchB99.stats;
   openSheetB100("Arena gate",`Battle test. Pip starts at Heart Sense ${s.range}, Swift ${s.speed}, Star Power ${s.power}, Guardian Glow ${s.guard}.${ranchB99.fatigue>=B99_TIRED?" He's tired, but ready.":""}`,[
     {label:"Enter the arena",run:()=>startBattleTestB99()},{label:"Not yet",quiet:true}]);return;
 }
 const kind=st.id,d=B99_DRILLS[kind],g=B100_GAMES[kind],block=drillBlockB99(kind);
 const head=`${g.title} · ${levelLineB100(kind)}`;
 if(block){
   const why=block==="tired"?"Pip is too tired to train. Let him rest at his bed.":block==="capped"?`${d.stat} is as high as ranch training goes.`:`Needs ♥ ${drillCostB99(kind)}. You have ♥ ${ranchB99.hearts}. Battle tests earn hearts.`;
   openSheetB100(head,why,[{label:"OK",quiet:true}]);return;
 }
 const pct=Math.round((soloChanceB100())*100);
 openSheetB100(head,`Costs ♥ ${drillCostB99(kind)}, +${B99_DRILL_FATIGUE} fatigue and a week. Worth ${B100_BASE} points; win together for +${B100_BONUS}, fail for −${B100_BONUS}. Solo, Pip succeeds about ${pct}% of the time.`,[
   {label:`Let Pip train solo · ♥ ${drillCostB99(kind)}`,run:()=>{const r=soloDrillB100(kind);if(!r)return;pipDoB100("drill",st,2.4,kind);renderRanchHudB100();ranchToastB100(r.ok?`Pip nailed ${g.title}! +${r.gain} ${d.stat} points${r.levelUp?` · Lv ${ranchB99.stats[kind]}!`:""}`:`Pip stumbled in ${g.title}. Only +${r.gain} points${r.levelUp?` · Lv ${ranchB99.stats[kind]}`:""}.`,4)}},
   {label:`Train together · ♥ ${drillCostB99(kind)}`,run:()=>startGameB100(kind)},
   {label:"Not now",quiet:true}]);
}

// ---- mini-games ----
function startGameB100(kind){
 if(!payDrillB100(kind))return false;
 const st=stationB100(kind),def=B100_GAMES[kind],w=ranchWorldB100;
 const g={kind,type:def.type,t:0,hits:0,attempts:0,cool:0,flash:0,flashOk:false,done:false};
 if(def.type==="timing"){g.total=4;g.need=3;g.phase=Math.random()*6;g.zone=.2+Math.random()*.6;g.width=.18}
 if(def.type==="hold"){g.total=3;g.need=2;g.fill=0;g.holding=false;g.lo=.58+Math.random()*.16;g.width=.16}
 if(def.type==="collect"){g.total=5;g.need=4;g.time=12;g.sparks=[];for(let i=0;i<5;i++){const a=i/5*Math.PI*2+Math.random()*.8,d=110+Math.random()*120;g.sparks.push({x:clamp(st.x+Math.cos(a)*d,60,B100_WORLD.w-60),y:clamp(st.y+Math.sin(a)*d,60,B100_WORLD.h-60),got:false})}}
 w.game=g;pipDoB100("drill",st,999,kind);renderRanchHudB100();
 ranchToastB100(def.how,4.5);
 return true;
}
function finishGameB100(){
 const w=ranchWorldB100,g=w.game;if(!g||g.done)return;g.done=true;
 const win=g.hits>=g.need,def=B100_GAMES[g.kind],d=B99_DRILLS[g.kind];
 const r=awardDrillB100(g.kind,win?1:-1);
 w.game=null;w.pip.state="follow";w.prevAct=true;
 if(win){w.pip.happy=2.5;burstHeartsB100(w.pip.x,w.pip.y,6)}
 renderRanchHudB100();
 ranchToastB100(win?`${def.title} together: ${g.hits}/${g.total}! +${r.gain} ${d.stat} points${r.levelUp?` · Lv ${ranchB99.stats[g.kind]}!`:""}`:`${def.title}: ${g.hits}/${g.total}. The bonus slipped away. +${r.gain} points${r.levelUp?` · Lv ${ranchB99.stats[g.kind]}`:""}.`,4.5);
}
function gameInputB100(g,dt,actPressed,actHeld){
 g.t+=dt;g.cool=Math.max(0,g.cool-dt);g.flash=Math.max(0,g.flash-dt);
 const def=B100_GAMES[g.kind];
 if(g.type==="timing"){
   g.phase+=dt*def.rate;
   if(actPressed&&g.cool<=0){const pos=.5-.5*Math.cos(g.phase),ok=Math.abs(pos-g.zone)<=g.width/2;g.attempts++;if(ok)g.hits++;g.flash=.45;g.flashOk=ok;g.cool=.35;g.zone=.2+Math.random()*.6;if(g.attempts>=g.total)finishGameB100()}
 }else if(g.type==="hold"){
   if(actHeld&&g.cool<=0){g.holding=true;g.fill+=dt/1.3;if(g.fill>1.02){g.attempts++;g.flash=.45;g.flashOk=false;g.cool=.4;g.fill=0;g.holding=false;g.lo=.58+Math.random()*.16;if(g.attempts>=g.total)finishGameB100()}}
   else if(g.holding){const ok=g.fill>=g.lo&&g.fill<=g.lo+g.width;g.attempts++;if(ok)g.hits++;g.flash=.45;g.flashOk=ok;g.cool=.4;g.fill=0;g.holding=false;g.lo=.58+Math.random()*.16;if(g.attempts>=g.total)finishGameB100()}
 }else if(g.type==="collect"){
   g.time-=dt;const w=ranchWorldB100;
   for(const s of g.sparks)if(!s.got&&(hyp(s.x-w.px,s.y-w.py)<30||hyp(s.x-w.pip.x,s.y-w.pip.y)<22)){s.got=true;g.hits++;burstHeartsB100(s.x,s.y,2)}
   g.attempts=g.hits;
   if(g.hits>=g.total||g.time<=0)finishGameB100();
 }
}

// ---- Pip ----
function pipDoB100(state,st,dur,kind){const p=ranchWorldB100.pip;p.state=state;p.t=dur;p.kind=kind||null;p.tx=st.x+(state==="sleep"?0:30);p.ty=st.y+(state==="sleep"?30:10)}
function burstHeartsB100(x,y,n){for(let i=0;i<n;i++)ranchWorldB100.hearts.push({x:x+rr(-10,10),y:y-8,vx:rr(-25,25),vy:rr(-70,-40),t:1.1})}
function petPipB100(){
 const w=ranchWorldB100,p=w.pip;p.happy=2.2;burstHeartsB100(p.x,p.y,5);
 const lines=ranchB99.fatigue>=B99_TIRED?["mm... sleepy... but I like this.","can we nap soon? stay close."]:ranchB99.fatigue>=40?["that feels nice after all that training.","I'm a little tired, but happy you're here."]:["hehe! again!","I love the ranch with you.","I'm ready for anything today."];
 ranchToastB100("Pip: "+lines[Math.floor(Math.random()*lines.length)],2.6);
}
function updatePipB100(dt){
 const w=ranchWorldB100,p=w.pip;p.happy=Math.max(0,p.happy-dt);
 const tired=ranchB99.fatigue>=B99_TIRED;
 let tx=w.px-46*(p.face||1),ty=w.py-10,speed=tired?120:200;
 if(p.state==="drill"||p.state==="sleep"){p.t-=dt;tx=p.tx;ty=p.ty;speed=240;if(p.t<=0)p.state="follow"}
 if(w.game&&w.game.type==="collect"){const s=w.game.sparks.find(q=>!q.got);if(s){tx=s.x;ty=s.y;speed=tired?60:90}}
 const dx=tx-p.x,dy=ty-p.y,d=hyp(dx,dy);
 if(d>4){const m=Math.min(d,speed*dt);p.x+=dx/d*m;p.y+=dy/d*m;if(Math.abs(dx)>2)p.face=dx>0?1:-1}
}

// ---- input + update ----
function ranchInputB100(){
 const w=ranchWorldB100;
 let act=keys.has(" ")||keys.has("Enter")||keys.has("e")||w.touchAct,back=keys.has("Escape")||keys.has("Backspace"),nav=0;
 const pads=navigator.getGamepads?navigator.getGamepads():[];
 for(const pad of pads){if(!pad||!pad.connected)continue;const pr=i=>!!(pad.buttons&&pad.buttons[i]&&(pad.buttons[i].pressed||pad.buttons[i].value>.5));act=act||pr(0);back=back||pr(1);if(pr(12))nav=-1;if(pr(13))nav=1;const ay=(pad.axes&&pad.axes[1])||0;if(!nav&&Math.abs(ay)>.6)nav=Math.sign(ay);break}
 if(keys.has("ArrowUp")||keys.has("w"))nav=-1;if(keys.has("ArrowDown")||keys.has("s"))nav=1;
 // A quick tap can start and end between frames, so taps latch until read.
 const r={act,actPressed:(act&&!w.prevAct)||!!w.touchTap,backPressed:back&&!w.prevBack,navPressed:nav&&nav!==w.prevNav?nav:0};
 w.prevAct=act||!!w.touchTap;w.touchTap=false;w.prevBack=back;w.prevNav=nav;
 return r;
}
function nearestInteractB100(){
 const w=ranchWorldB100;let best=null,bd=Infinity;
 for(const st of B100_STATIONS){const d=hyp(st.x-w.px,st.y-w.py);if(d<st.r&&d<bd){bd=d;best={kind:"station",st,label:st.id==="home"?"Rest":st.id==="gate"?"Arena":"Train"}}}
 // Pip follows closely, so petting only offers itself once you stand still near him.
 if(!best&&w.idle>.6&&hyp(w.pip.x-w.px,w.pip.y-w.py)<64)best={kind:"pip",label:"Pet"};
 return best;
}
function updateRanchB100(dt){
 const w=ranchWorldB100,inp=ranchInputB100();
 if(w.toastT>0){w.toastT-=dt;if(w.toastT<=0)$("ranchToastB100").classList.remove("on")}
 for(const h of w.hearts){h.t-=dt;h.x+=h.vx*dt;h.y+=h.vy*dt;h.vy+=30*dt}w.hearts=w.hearts.filter(h=>h.t>0);
 if(w.sheet){
   if(inp.navPressed)focusSheetB100(w.sheet.focus+inp.navPressed);
   if(inp.actPressed)chooseSheetB100(w.sheet.focus);
   else if(inp.backPressed){closeSheetB100()}
   $("ranchActB100").classList.remove("on");updatePipB100(dt);updateCamB100(dt);return;
 }
 const g=w.game,canMove=!g||g.type==="collect";
 if(canMove){
   let dx=gamepad.dx+w.stick.dx,dy=gamepad.dy+w.stick.dy;
   if(keys.has("ArrowLeft")||keys.has("a"))dx-=1;if(keys.has("ArrowRight")||keys.has("d"))dx+=1;if(keys.has("ArrowUp")||keys.has("w"))dy-=1;if(keys.has("ArrowDown")||keys.has("s"))dy+=1;
   const l=hyp(dx,dy);if(l>.12){const s=Math.min(1,l)*240/l;w.px=clamp(w.px+dx*s*dt,40,B100_WORLD.w-40);w.py=clamp(w.py+dy*s*dt,40,B100_WORLD.h-40);w.idle=0}else w.idle+=dt;
 }
 const actBtn=$("ranchActB100");
 if(g){
   gameInputB100(g,dt,inp.actPressed,inp.act);
   actBtn.textContent=g.type==="hold"?"HOLD":g.type==="collect"?"GO":"A";actBtn.classList.toggle("on",g.type!=="collect");
 }else{
   const near=nearestInteractB100();
   actBtn.classList.toggle("on",!!near);if(near)actBtn.textContent=near.label;
   if(inp.actPressed&&near){if(near.kind==="pip")petPipB100();else interactStationB100(near.st)}
 }
 updatePipB100(dt);updateCamB100(dt);
}
function updateCamB100(dt){
 const w=ranchWorldB100,k=Math.min(1,dt*6);
 w.cam.x+=(w.px-w.cam.x)*k;w.cam.y+=(w.py-w.cam.y)*k;
 w.cam.x=B100_WORLD.w<=W?B100_WORLD.w/2:clamp(w.cam.x,W/2,B100_WORLD.w-W/2);
 w.cam.y=B100_WORLD.h<=H?B100_WORLD.h/2:clamp(w.cam.y,H/2,B100_WORLD.h-H/2);
}

// ---- drawing ----
function drawRanchB100(){
 const w=ranchWorldB100,c=B100_PASTEL,t=performance.now()/1000;
 X.save();X.fillStyle="#efe6ff";X.fillRect(0,0,W,H);
 X.translate(Math.round(W/2-w.cam.x),Math.round(H/2-w.cam.y));
 X.fillStyle=c.grass;X.fillRect(0,0,B100_WORLD.w,B100_WORLD.h);
 X.fillStyle=c.grass2;for(let i=0;i<220;i++){const x=(i*397)%B100_WORLD.w,y=(i*733)%B100_WORLD.h;X.beginPath();X.ellipse(x,y,9,4,0,0,Math.PI*2);X.fill()}
 // paths to the plaza
 X.lineCap="round";const plaza={x:900,y:470};
 for(const st of B100_STATIONS){X.strokeStyle=c.pathEdge;X.lineWidth=44;X.beginPath();X.moveTo(plaza.x,plaza.y);X.lineTo(st.x,st.y);X.stroke();X.strokeStyle=c.path;X.lineWidth=36;X.beginPath();X.moveTo(plaza.x,plaza.y);X.lineTo(st.x,st.y);X.stroke()}
 X.fillStyle=c.path;X.beginPath();X.arc(plaza.x,plaza.y,70,0,Math.PI*2);X.fill();
 // fence
 X.strokeStyle=c.fence;X.lineWidth=6;X.strokeRect(20,20,B100_WORLD.w-40,B100_WORLD.h-40);
 X.fillStyle=c.fence;for(let x=20;x<=B100_WORLD.w-20;x+=60){X.fillRect(x-4,12,8,18);X.fillRect(x-4,B100_WORLD.h-30,8,18)}for(let y=20;y<=B100_WORLD.h-20;y+=60){X.fillRect(12,y-4,18,8);X.fillRect(B100_WORLD.w-30,y-4,18,8)}
 for(const [x,y] of B100_TREES){X.fillStyle="#e9d5c3";X.fillRect(x-5,y,10,26);X.fillStyle=(x+y)%3?c.pink:c.mint;X.beginPath();X.arc(x,y-4,30,0,Math.PI*2);X.fill();X.fillStyle="#ffffff55";X.beginPath();X.arc(x-9,y-14,10,0,Math.PI*2);X.fill()}
 for(const st of B100_STATIONS)drawStationB100(st,t);
 const g=w.game;
 if(g&&g.type==="collect")for(const s of g.sparks){if(s.got)continue;const b=Math.sin(t*5+s.x)*3;X.fillStyle=c.butter;X.beginPath();X.arc(s.x,s.y+b,11,0,Math.PI*2);X.fill();X.fillStyle="#ffb7cf";X.font="bold 14px system-ui";X.textAlign="center";X.fillText("✿",s.x,s.y+b+5)}
 drawPipB100(t);drawFarmerB100(t);
 for(const h of w.hearts){X.globalAlpha=clamp(h.t,0,1);X.fillStyle="#ff8fb3";X.font="bold 15px system-ui";X.textAlign="center";X.fillText("♥",h.x,h.y);X.globalAlpha=1}
 const near=!w.sheet&&!g&&nearestInteractB100();
 if(near){const x=w.px,y=w.py-34;bubbleB100(x,y,`A · ${near.kind==="pip"?"Pet Pip":near.st.name}`)}
 X.restore();
 if(g&&g.type!=="collect")drawGamePanelB100(g,t);
 if(g&&g.type==="collect")drawCollectHudB100(g);
 X.textAlign="start";
}
function bubbleB100(x,y,text){X.font="700 13px system-ui";const tw=X.measureText(text).width+20;X.fillStyle="#fffaf3";X.strokeStyle="#cdbbff";X.lineWidth=2;roundRectB100(x-tw/2,y-26,tw,26,13);X.fill();X.stroke();X.fillStyle="#4b4470";X.textAlign="center";X.fillText(text,x,y-8)}
function roundRectB100(x,y,w,h,r){X.beginPath();X.moveTo(x+r,y);X.arcTo(x+w,y,x+w,y+h,r);X.arcTo(x+w,y+h,x,y+h,r);X.arcTo(x,y+h,x,y,r);X.arcTo(x,y,x+w,y,r);X.closePath()}
function labelB100(x,y,text,sub){X.textAlign="center";X.font="800 14px system-ui";X.fillStyle="#fffaf3cc";const tw=Math.max(X.measureText(text).width,sub?X.measureText(sub).width:0)+18;roundRectB100(x-tw/2,y-16,tw,sub?36:22,10);X.fill();X.fillStyle="#4b4470";X.fillText(text,x,y);if(sub){X.font="600 11px system-ui";X.fillStyle="#8c8fab";X.fillText(sub,x,y+15)}}
function drawStationB100(st,t){
 const c=B100_PASTEL,x=st.x,y=st.y;
 if(st.id==="home"){X.fillStyle=c.peach;X.fillRect(x-70,y-90,140,90);X.fillStyle=c.lilac;X.beginPath();X.moveTo(x-86,y-88);X.lineTo(x,y-150);X.lineTo(x+86,y-88);X.closePath();X.fill();X.fillStyle="#fff";X.fillRect(x-16,y-48,32,48);X.fillStyle=c.pink;roundRectB100(x-40,y+10,80,34,14);X.fill();X.fillStyle="#fff";roundRectB100(x-34,y+14,26,16,8);X.fill();labelB100(x,y-160,"Pip's bed","Rest")}
 if(st.id==="gate"){X.fillStyle=c.pink;X.fillRect(x-70,y-60,18,80);X.fillRect(x+52,y-60,18,80);X.beginPath();X.arc(x,y-60,70,Math.PI,0);X.lineWidth=18;X.strokeStyle=c.pink;X.stroke();const gl=.5+.5*Math.sin(t*2);X.fillStyle=`rgba(126,216,255,${.25+.2*gl})`;X.beginPath();X.arc(x,y-50,52,Math.PI,0);X.lineTo(x+52,y+20);X.lineTo(x-52,y+20);X.closePath();X.fill();labelB100(x,y-140,"Arena gate","Battle test")}
 const lv=B99_DRILLS[st.id]?`${B99_DRILLS[st.id].stat} Lv ${ranchB99.stats[st.id]}`:"";
 if(st.id==="range"){for(let i=0;i<14;i++){const a=i*2.4,d=20+(i*17)%70;X.fillStyle=i%2?c.pink:c.butter;X.beginPath();X.arc(x+Math.cos(a)*d,y+Math.sin(a)*d*.6,9,0,Math.PI*2);X.fill()}labelB100(x,y-90,"Scent Hunt",lv)}
 if(st.id==="speed"){X.strokeStyle=c.path;X.lineWidth=22;X.beginPath();X.ellipse(x,y,150,80,0,0,Math.PI*2);X.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2;X.strokeStyle=c.lilac;X.lineWidth=5;X.beginPath();X.arc(x+Math.cos(a)*150,y+Math.sin(a)*80,16,0,Math.PI*2);X.stroke()}labelB100(x,y-110,"Sky Laps",lv)}
 if(st.id==="power"){for(let i=0;i<3;i++){const tx=x-70+i*70,ty=y-10;for(let r=3;r>0;r--){X.fillStyle=r%2?c.pink:"#fff";X.beginPath();X.arc(tx,ty,r*9,0,Math.PI*2);X.fill()}X.fillStyle="#e9d5c3";X.fillRect(tx-3,ty+27,6,22)}labelB100(x,y-70,"Star Target",lv)}
 if(st.id==="guard"){X.fillStyle=c.sky;X.beginPath();X.ellipse(x,y,120,70,0,0,Math.PI*2);X.fill();X.fillStyle="#ffffff66";X.beginPath();X.ellipse(x-30,y-18,40,12,0,0,Math.PI*2);X.fill();X.fillStyle=c.mint;for(const [a,b] of [[-60,20],[50,-20],[70,30]]){X.beginPath();X.arc(x+a,y+b,12,.3,Math.PI*2-.3);X.lineTo(x+a,y+b);X.fill()}labelB100(x,y-95,"Glow Pond",lv)}
}
function drawFarmerB100(t){
 const w=ranchWorldB100,x=w.px,y=w.py,b=w.idle>0?Math.sin(t*2)*1.2:Math.sin(t*12)*2;
 X.fillStyle="#00000014";X.beginPath();X.ellipse(x,y+16,14,5,0,0,Math.PI*2);X.fill();
 X.fillStyle="#9fd3ff";roundRectB100(x-10,y-6+b,20,22,9);X.fill();
 X.fillStyle="#ffe1cf";X.beginPath();X.arc(x,y-14+b,10,0,Math.PI*2);X.fill();
 X.fillStyle="#fff1b3";X.beginPath();X.ellipse(x,y-21+b,15,5,0,0,Math.PI*2);X.fill();X.beginPath();X.arc(x,y-24+b,8,Math.PI,0);X.fill();
 X.fillStyle="#5a5d78";X.fillRect(x-4,y-15+b,2,3);X.fillRect(x+3,y-15+b,2,3);
}
function drawPipB100(t){
 const w=ranchWorldB100,p=w.pip,tired=ranchB99.fatigue>=B99_TIRED,sleeping=p.state==="sleep";
 const bob=sleeping?0:Math.sin(t*(p.happy>0?10:4))*(p.happy>0?5:3),x=p.x,y=p.y+bob;
 X.fillStyle="#00000012";X.beginPath();X.ellipse(p.x,p.y+16,11,4,0,0,Math.PI*2);X.fill();
 const glow=X.createRadialGradient(x,y,2,x,y,24);glow.addColorStop(0,"#fff6c8");glow.addColorStop(1,"#fff6c800");X.fillStyle=glow;X.beginPath();X.arc(x,y,24,0,Math.PI*2);X.fill();
 X.fillStyle="#ffe58f";X.beginPath();X.arc(x,y,12,0,Math.PI*2);X.fill();
 X.fillStyle="#ffb3c7";X.beginPath();X.arc(x-6,y+3,2.5,0,Math.PI*2);X.arc(x+6,y+3,2.5,0,Math.PI*2);X.fill();
 X.strokeStyle="#5a5d78";X.lineWidth=2;
 if(sleeping||tired){X.beginPath();X.moveTo(x-6,y-2);X.lineTo(x-2,y-2);X.moveTo(x+2,y-2);X.lineTo(x+6,y-2);X.stroke()}
 else{X.fillStyle="#5a5d78";X.beginPath();X.arc(x-4+p.face,y-2,1.9,0,Math.PI*2);X.arc(x+4+p.face,y-2,1.9,0,Math.PI*2);X.fill()}
 X.strokeStyle="#ffd36f";X.beginPath();X.moveTo(x,y-12);X.quadraticCurveTo(x+4,y-20,x+2,y-24);X.stroke();X.fillStyle="#ffc4dd";X.beginPath();X.arc(x+2,y-25,3,0,Math.PI*2);X.fill();
 if(sleeping||(tired&&w.idle>1)){X.fillStyle="#8c8fab";X.font="bold 12px system-ui";X.textAlign="center";X.fillText("z",x+14,y-16-(t*8)%10);X.fillText("Z",x+20,y-28-(t*8)%10)}
 if(p.state==="drill"&&!w.game){X.fillStyle="#ffd36f";X.font="bold 14px system-ui";X.textAlign="center";X.fillText("✦",x+Math.cos(t*9)*18,y+Math.sin(t*9)*18)}
}
function drawGamePanelB100(g,t){
 const def=B100_GAMES[g.kind],pw=Math.min(440,W-32),px=(W-pw)/2,py=H-(W<700?250:150); // clear the touch A button on phones
 X.fillStyle="#fffaf3f0";roundRectB100(px,py,pw,118,18);X.fill();
 X.fillStyle="#4b4470";X.font="800 15px system-ui";X.textAlign="left";X.fillText(def.title+" · together",px+16,py+26);
 X.textAlign="right";X.font="700 13px system-ui";X.fillText(`${g.hits} hit · ${g.attempts}/${g.total} · need ${g.need}`,px+pw-16,py+26);
 const bx=px+16,bw=pw-32,by=py+46,bh=26;
 X.fillStyle="#efe8ff";roundRectB100(bx,by,bw,bh,13);X.fill();
 if(g.type==="timing"){
   X.fillStyle="#b9ecd4";roundRectB100(bx+bw*(g.zone-g.width/2),by,bw*g.width,bh,10);X.fill();
   const pos=.5-.5*Math.cos(g.phase);X.fillStyle="#ff9fb7";X.font="bold 22px system-ui";X.textAlign="center";X.fillText(g.kind==="speed"?"●":"★",bx+bw*pos,by+bh/2+8);
 }else{
   X.fillStyle="#b9ecd4";roundRectB100(bx+bw*g.lo,by,bw*g.width,bh,10);X.fill();
   X.fillStyle="#9fd3ff";roundRectB100(bx,by+6,Math.max(0,Math.min(1,g.fill))*bw,bh-12,7);X.fill();
 }
 X.fillStyle="#8c8fab";X.font="600 12px system-ui";X.textAlign="center";
 X.fillText(g.flash>0?(g.flashOk?"Nice!":"Missed"):def.how,W/2,py+98);
 if(g.flash>0){X.fillStyle=g.flashOk?"#9fe3c1":"#ff9fb7";X.globalAlpha=g.flash;roundRectB100(bx,by,bw,bh,13);X.fill();X.globalAlpha=1}
}
function drawCollectHudB100(g){
 const pw=240,px=(W-pw)/2,py=H-70;
 X.fillStyle="#fffaf3f0";roundRectB100(px,py,pw,44,16);X.fill();
 X.fillStyle="#4b4470";X.font="800 14px system-ui";X.textAlign="center";X.fillText(`Scent Hunt · ${g.hits}/${g.total} · ${Math.max(0,g.time).toFixed(1)}s`,W/2,py+27);
}

const updateBeforeB100=update;
update=function(dt){if(ranchWorldB100.active){updateRanchB100(dt);return}updateBeforeB100(dt)};
const drawBeforeB100=draw;
draw=function(){if(ranchWorldB100.active){drawRanchB100();return}drawBeforeB100()};
