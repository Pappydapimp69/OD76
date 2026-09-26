
// B116e Ranch comforts: shop cursor and owned counts, ranch sounds, timed feeding and washing.
// Care applies its effect up front (item spent, meter filled), then Pip eats or bathes for 3s
// while one gate (input, menus, X jobs, movement) holds everything still.
const B116E_CARE_SEC=3,B116E_PRICED=/ · ♥ \d/;

// ---- sounds: short synthesized cues on the shared engine; silent without running audio ----
function sfxChopB116e(fell){
 if(!ensureAudio()||!sfxGateB42(audioEngine,fell?"b116eFell":"b116eChop",.12))return false;
 const e=audioEngine,t=audioCtx.currentTime+.01,p=rr(-.2,.2);
 if(fell){e.voice(220,t,.28,.02,"sawtooth",p,700,.02,.2,-30,e.sfx);e.voice(70,t+.22,.3,.045,"triangle",0,500,.004,.24,0,e.sfx);e.pop(t+.22,.035,0)}
 else{e.voice(160,t,.07,.03,"square",p,900,.002,.05,0,e.sfx);e.voice(96,t+.012,.12,.028,"triangle",p,600,.003,.08,0,e.sfx);e.pop(t,.03,p)}
 return true;
}
function sfxCutB116e(done){
 if(!ensureAudio()||!sfxGateB42(audioEngine,done?"b116eCleared":"b116eCut",.1))return false;
 const e=audioEngine,t=audioCtx.currentTime+.01,p=rr(-.25,.25);
 if(done)[0,.05,.1].forEach((d,i)=>e.fmBell(1180+i*170,t+d,.12,.012,p,e.sfx));
 else{e.pop(t,.022,p);e.voice(1400,t,.05,.012,"sawtooth",p,4200,.002,.04,0,e.sfx);e.voice(1900,t+.05,.04,.009,"sawtooth",p,4600,.002,.03,0,e.sfx)}
 return true;
}
function sfxEatB116e(){
 if(!ensureAudio()||!sfxGateB42(audioEngine,"b116eEat",.5))return false;
 const e=audioEngine,t=audioCtx.currentTime+.02;
 [0,.34,.68,1.04,1.44,1.86].forEach((d,i)=>{e.pop(t+d,.026,i%2?.12:-.12);e.voice(190-i%3*18,t+d,.08,.018,"triangle",0,900,.004,.05,0,e.sfx)});
 e.fmBell(MIDI_FREQ(76),t+2.4,.18,.014,-.1,e.sfx);e.fmBell(MIDI_FREQ(81),t+2.5,.24,.016,.1,e.sfx);
 return true;
}
function sfxWashB116e(){
 if(!ensureAudio()||!sfxGateB42(audioEngine,"b116eWash",.5))return false;
 const e=audioEngine,t=audioCtx.currentTime+.02;
 for(let i=0;i<7;i++)e.voice(620+i*90+rr(-40,40),t+i*.11,.06,.01,"sine",rr(-.4,.4),3000,.004,.04,0,e.sfx);
 [72,76,79,84,79,84].forEach((m,i)=>e.fmBell(MIDI_FREQ(m),t+.85+i*.13,i===5?.42:.22,.02*(1-i*.06),(i-2.5)*.12,e.sfx));
 return true;
}

// ---- shop: the cursor stays put after buying, and consumables show how many you own ----
let shopKeepB116e=null;
function shopKeyB116e(label){return label.split(" · ")[0]}
const stallSheetBeforeB116e=stallSheetB104;
stallSheetB104=function(){
 stallSheetBeforeB116e();
 const s=ranchWorldB100.sheet;if(!s)return;
 const btns=[...$("ranchSheetB100").querySelectorAll("button")],items=[];
 const ids=Object.fromEntries(Object.entries(B104_ITEMS).map(([id,it])=>[`${it.icon} ${it.name}`,id]));
 s.options.forEach((o,i)=>{
  if(!B116E_PRICED.test(o.label))return;
  const key=shopKeyB116e(o.label),n=ids[key]?itemCountB104(ids[key]):0;
  if(n>0){const parts=o.label.split(" · ");parts.splice(2,0,`×${n}`);o.label=parts.join(" · ");if(btns[i])btns[i].textContent=o.label}
  items.push(i);
  const run=o.run;if(run)o.run=()=>{shopKeepB116e={key,ord:items.indexOf(i)};try{run()}finally{shopKeepB116e=null}};
 });
 // Every re-render inside a purchase keeps the selection: same item, else the next, else the previous.
 const k=shopKeepB116e;if(!k||!items.length)return;
 focusSheetB100(items.find(i=>shopKeyB116e(s.options[i].label)===k.key)??items[Math.min(k.ord,items.length-1)]);
};

// ---- timed care: feeding and washing take 3s ----
let careDoneB116e=null;
const feedBeforeB116e=feedB104;
feedB104=function(id){const it=feedBeforeB116e(id);if(it)careDoneB116e={kind:"feed",icon:it.icon||"🥣"};return it};
const washBeforeB116e=washB104;
washB104=function(){const ok=washBeforeB116e();if(ok)careDoneB116e={kind:"wash",icon:"🫧"};return ok};
function careBusyB116e(){return!!ranchWorldB100.b116eCare}
function startCareB116e(kind,icon){
 const w=ranchWorldB100;if(!w.active||w.game)return false;
 closeSheetB100();w.b116eCare={kind,icon,t:0,dur:B116E_CARE_SEC};
 const p=w.pip,tub=stationB100("tub");
 if(kind==="wash"){p.tx=tub.x+30;p.ty=tub.y+10}else{p.tx=p.x;p.ty=p.y}
 p.state="drill";p.t=B116E_CARE_SEC+.1;p.kind=null;
 w.stick.id=null;w.stick.dx=0;w.stick.dy=0;
 if(kind==="feed")sfxEatB116e();else sfxWashB116e();
 return true;
}
function endCareB116e(){
 const w=ranchWorldB100,c=w.b116eCare;if(!c)return;w.b116eCare=null;
 w.pip.state="follow";w.pip.happy=2;w.prevAct=true;burstHeartsB100(w.pip.x,w.pip.y,3);renderRanchHudB100();
}
// Menu options run their original effect, then start the lock only if the item was really used.
function careOptionsB116e(prefix,kind){
 for(const o of ranchWorldB100.sheet?.options||[])if(o.run&&o.label.startsWith(prefix)){const run=o.run;o.run=()=>{careDoneB116e=null;run();const d=careDoneB116e;careDoneB116e=null;if(d?.kind===kind)startCareB116e(kind,d.icon)}}
}
const pipSheetBeforeB116e=pipSheetB104;
pipSheetB104=function(){pipSheetBeforeB116e();careOptionsB116e("Feed ","feed")};
const tubSheetBeforeB116e=tubSheetB104;
tubSheetB104=function(){tubSheetBeforeB116e();careOptionsB116e("Wash Pip","wash")};

// ---- the one gate: no input, menus, interactions, X jobs or movement while Pip eats or bathes ----
const inputBeforeB116e=ranchInputB100;
ranchInputB100=function(){const w=ranchWorldB100,r=inputBeforeB116e();if(!careBusyB116e())return r;w.b109XPressed=false;w.b109XTap=false;return{act:false,actPressed:false,backPressed:false,navPressed:0,xPressed:false}};
const openSheetBeforeB116e=openSheetB100;
openSheetB100=function(...a){if(careBusyB116e())return;return openSheetBeforeB116e(...a)};
const nearestBeforeB116e=nearestInteractB100;
nearestInteractB100=function(){return careBusyB116e()?null:nearestBeforeB116e()};
const pipActionBeforeB116e=pipActionForB109;
pipActionForB109=function(near){return careBusyB116e()?null:pipActionBeforeB116e(near)};
const startPipActionBeforeB116e=startPipActionB109;
startPipActionB109=function(a){return careBusyB116e()?false:startPipActionBeforeB116e(a)};
const finishPipActionBeforeB116e=finishPipActionB109;
finishPipActionB109=function(){const a=ranchWorldB100.b109Action;finishPipActionBeforeB116e();if(a?.kind==="chop")sfxChopB116e(true);else if(a?.kind==="cut")sfxCutB116e(true)};
const updateRanchBeforeB116e=updateRanchB100;
updateRanchB100=function(dt){
 const w=ranchWorldB100,c=w.b116eCare,px=w.px,py=w.py;
 updateRanchBeforeB116e(dt);
 const a=w.b109Action;
 if(a&&a.phase==="work"&&(a.kind==="chop"||a.kind==="cut")){const beat=Math.floor(a.t*2.5);if(beat!==a.b116eBeat){a.b116eBeat=beat;if(a.kind==="chop")sfxChopB116e();else sfxCutB116e()}}
 if(!c)return;
 w.px=px;w.py=py;
 if(!w.active||w.b116eCare!==c){w.b116eCare=null;return}
 c.t+=dt;if(c.t>=c.dur)endCareB116e();
};
const leaveBeforeB116e=leaveRanchB100;
leaveRanchB100=function(){ranchWorldB100.b116eCare=null;leaveBeforeB116e()};
const enterBeforeB116e=enterRanchB100;
enterRanchB100=function(){ranchWorldB100.b116eCare=null;enterBeforeB116e()};
openRanchB99=enterRanchB100;
for(const id of ["openRanchB99","endRanchB99"]){const old=$(id);if(!old)continue;const b=old.cloneNode(true);old.replaceWith(b);b.addEventListener("click",enterRanchB100)}

// ---- drawing: Pip chews his food, or bathes in bubbles, under a progress ring ----
const drawPipBeforeB116e=drawPipB100;
drawPipB100=function(t){
 drawPipBeforeB116e(t);
 const c=ranchWorldB100.b116eCare;if(!c)return;
 const p=ranchWorldB100.pip,k=Math.min(1,c.t/c.dur),f=p.face||1;
 X.save();X.textAlign="center";
 if(c.kind==="feed"){
  const chew=Math.abs(Math.sin(c.t*9));
  X.globalAlpha=1-k*.75;X.font=`${Math.round(16-7*k)}px system-ui`;X.fillText(c.icon,p.x+f*15,p.y+6-chew*2);
  X.fillStyle="#e9c9a3";for(let i=0;i<4;i++){const q=(c.t*1.6+i/4)%1;X.globalAlpha=1-q;X.beginPath();X.arc(p.x+f*11+(i-1.5)*5,p.y+8+q*14,1.8,0,Math.PI*2);X.fill()}
  X.globalAlpha=1;if(chew>.7){X.fillStyle="#8c8fab";X.font="bold 11px system-ui";X.fillText("nom",p.x-f*16,p.y-18)}
 }else{
  X.lineWidth=1.2;X.strokeStyle="#9fd3ff";X.fillStyle="#ffffffcc";
  for(let i=0;i<9;i++){const q=(c.t*.7+i/9)%1,r=2.5+(i%3)*1.8;X.globalAlpha=(1-q)*.9;X.beginPath();X.arc(p.x+Math.sin(i*2.1+c.t*2.4)*(12+(i%3)*5),p.y+12-q*46,r,0,Math.PI*2);X.fill();X.stroke()}
  X.globalAlpha=.9;X.fillStyle="#ffffff";X.beginPath();X.arc(p.x-6,p.y-11,5,0,Math.PI*2);X.arc(p.x+2,p.y-13,6,0,Math.PI*2);X.arc(p.x+8,p.y-10,4,0,Math.PI*2);X.fill();
 }
 X.globalAlpha=1;X.strokeStyle=c.kind==="feed"?"#ffd36f":"#9fd3ff";X.lineWidth=4;X.beginPath();X.arc(p.x,p.y-40,9,-Math.PI/2,-Math.PI/2+Math.PI*2*k);X.stroke();
 X.restore();
};
