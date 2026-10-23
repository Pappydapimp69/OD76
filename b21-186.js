// B174 Refinery slots. Hearts and Star Dust load into slots the player taps: each slot holds one load (hearts OR dust,
// never both) under one timer, the refinery's stone time (15 min at Lv 1), and its stones or stars drip out evenly
// across it (♥100 = ◆2 → one every 7.5 min). Topping a slot up restarts its timer on everything left. Capacity is
// ♥300 / ✧30 at Lv 1, doubling each level; Min is the B155 level minimum (✧5 for dust at every level), Max is the
// space left or what the player holds, whichever is less. Slots: 2 at Lv 1-2, then 3/4/5 at Lv 3/4/5. The slot tiles
// take the wallet row's place on the refinery sheet. Stones land in the tray (10% chance of ✧ each, as before); stars
// land straight in the wallet. Old queued hearts (B117 slots) and queued fuses (B156) are refunded once on load.
function slotCountB174(lv=ranchB99.refinery.level){const l=clamp(Math.floor(lv)||1,1,B102_REFINERY_MAX);return l>=5?5:l>=3?l:2}
const B174_KIND={
 heart:{unit:B102_HEARTS_PER_STONE,cap:300,icon:'♥',out:'◆',noun:'Heart Stone',min:lv=>refineMinHeartsB155(lv),have:()=>ranchB99.hearts,pay:n=>{ranchB99.hearts-=n}},
 dust:{unit:B102_DUST_PER_STAR,cap:30,icon:'✧',out:'★',noun:'Star Stone',min:()=>B102_DUST_PER_STAR,have:()=>ranchB99.dust,pay:n=>{ranchB99.dust-=n}}
};
function slotCapB174(kind,lv=ranchB99.refinery.level){return B174_KIND[kind].cap*2**(clamp(Math.floor(lv)||1,1,B102_REFINERY_MAX)-1)}
function emptySlotB174(){return{kind:'',n:0,made:0,start:0,dur:0}}
function slotsFieldsB174(r,raw){
 const list=Array.isArray(raw?.slots)?raw.slots:[];r.slots=[];
 for(let i=0;i<5;i++){const s=list[i],n=Math.floor(Number(s?.n)),made=Math.floor(Number(s?.made)),start=Number(s?.start),dur=Number(s?.dur);
  r.slots.push(B174_KIND[s?.kind]&&n>0&&made>=0&&made<n&&start>0&&dur>0?{kind:s.kind,n:Math.min(n,1e6),made,start:Math.min(start,Date.now()),dur:Math.min(dur,86400e3)}:emptySlotB174())}
 // one-time refund of the old queues: nothing is lost in the switch
 const f=r.refinery;if(f?.queue>0){r.hearts+=f.queue*B102_HEARTS_PER_STONE;f.queue=0;f.lag=[];f.startedAt=0}
 if(r.fuse?.queue>0){r.dust+=r.fuse.queue*B102_DUST_PER_STAR;r.fuse.queue=0;r.fuse.startedAt=0}
 return r;
}
function rawSlotsB174(){try{return JSON.parse(localStorage.getItem(B99_RANCH_KEY)||'null')}catch(_){return null}}
const loadRanchBeforeB174=loadRanchB99;
loadRanchB99=function(...a){return slotsFieldsB174(loadRanchBeforeB174(...a),rawSlotsB174())};
const ranchDefaultBeforeB174=ranchDefaultB99;
ranchDefaultB99=function(...a){return slotsFieldsB174(ranchDefaultBeforeB174(...a),null)};
slotsFieldsB174(ranchB99,rawSlotsB174());saveRanchB99();
refinerySlotsB117f=function(lv){return slotCountB174(lv)};

function slotsB174(){const r=ranchB99;if(!Array.isArray(r.slots))slotsFieldsB174(r,null);while(r.slots.length<5)r.slots.push(emptySlotB174());return r.slots}
function slotLeftB174(s){return s.kind?s.n-s.made:0}
function slotNextB174(s,now=Date.now()){return s.kind?Math.max(0,s.start+(s.made+1)*s.dur/s.n-now):0}
function slotDoneB174(s,now=Date.now()){return s.kind?Math.max(0,s.start+s.dur-now):0}
function tickSlotsB174(now=Date.now(),roll=Math.random){
 let stones=0,stars=0,dust=0;
 for(const s of slotsB174()){
  if(!s.kind)continue;
  const due=Math.min(s.n,Math.floor((now-s.start)*s.n/s.dur+1e-9));
  while(s.made<due){s.made++;
   if(s.kind==='heart'){ranchB99.refinery.trayStones++;stones++;if(roll()<B102_DUST_CHANCE){ranchB99.refinery.trayDust++;dust++}}
   else{ranchB99.dust+=B102_DUST_PER_STAR;fuseStarB102();stars++} // fuseStarB102 keeps the stats/analytics hooks
  }
  if(s.made>=s.n)Object.assign(s,emptySlotB174());
 }
 if(stones||stars){saveRanchB99();if(dust&&typeof bumpB117==='function')bumpB117('dustEarned',dust)}
 if(stars&&ranchWorldB100?.active){renderRanchHudB100?.();ranchToastB100?.(`Star Dust fused · ★${stars} Star Stone${stars===1?'':'s'}.`,2)}
 return stones+stars;
}
const tickRefineryBeforeB174=tickRefineryB102;
tickRefineryB102=function(now=Date.now(),roll=Math.random,...a){const done=tickRefineryBeforeB174(now,roll,...a);return done+tickSlotsB174(now,roll)};
const updateRanchBeforeB174=updateRanchB100;
updateRanchB100=function(dt,...a){if(ranchWorldB100.active&&(ranchWorldB100.b174T=(ranchWorldB100.b174T||0)+dt)>1){ranchWorldB100.b174T=0;tickSlotsB174()}return updateRanchBeforeB174(dt,...a)};

// What a slot can take right now: {min,max} in hearts or dust (0 when it can't).
function slotRoomB174(i,kind,lv=ranchB99.refinery.level){
 const s=slotsB174()[i],K=B174_KIND[kind];if(!s||i>=slotCountB174(lv)||(s.kind&&s.kind!==kind))return{min:0,max:0};
 const space=slotCapB174(kind,lv)-slotLeftB174(s)*K.unit,have=Math.floor(K.have()/K.unit)*K.unit,max=Math.max(0,Math.min(space,have)),min=K.min(lv);
 return max>=min?{min,max}:{min:0,max:0,need:min,space};
}
function loadSlotB174(i,kind,amount,now=Date.now()){
 tickRefineryB102(now);
 const room=slotRoomB174(i,kind),K=B174_KIND[kind],amt=Math.floor(amount/K.unit)*K.unit;
 if(!room.max||amt<room.min||amt>room.max)return 0;
 const s=slotsB174()[i],left=slotLeftB174(s),units=amt/K.unit;
 K.pay(amt);Object.assign(s,{kind,n:left+units,made:0,start:now,dur:refineSecondsB102(ranchB99.refinery.level)*1000}); // a top-up restarts the timer on everything left
 saveRanchB99();
 if(typeof trackB136==='function')trackB136(['refinery',kind==='heart'?'load':'fuse',bucketB136(units,[1,3,5,10,20])]);
 return units;
}
// The old entry points load the first slot that fits (code and older checks still call them).
function firstSlotB174(kind,amount){const k=slotCountB174();for(let pass=0;pass<2;pass++)for(let i=0;i<k;i++){const s=slotsB174()[i],r=slotRoomB174(i,kind);if((pass?true:!s.kind)&&r.max>=amount&&amount>=r.min)return i}return -1}
loadHeartsB102=function(batches,now=Date.now()){const amt=Math.floor(batches)*B102_HEARTS_PER_STONE,i=firstSlotB174('heart',amt);return i<0?0:loadSlotB174(i,'heart',amt,now)};
startFuseB156=function(n=1,now=Date.now()){const amt=Math.floor(n)*B102_DUST_PER_STAR,i=firstSlotB174('dust',amt);return i<0?0:loadSlotB174(i,'dust',amt,now)};

// ---- the slot sheet: tap a slot, pick Min or Max ----
function slotStateTextB174(s,now=Date.now()){
 if(!s.kind)return'Empty';const K=B174_KIND[s.kind],left=slotLeftB174(s);
 return`${K.icon} ${left*K.unit} → ${K.out} ${left} · next ${clockB102(slotNextB174(s,now))}`;
}
function openSlotSheetB174(i){
 tickRefineryB102();
 const s=slotsB174()[i],lv=ranchB99.refinery.level,T=refineLabelB102(lv),st=stationB100('refinery'),opts=[];
 let text=`Holds up to ♥ ${slotCapB174('heart',lv)} or ✧ ${slotCapB174('dust',lv)} at Lv ${lv}, never both. A load takes ${T}; its stones come out evenly.`;
 if(s.kind){const K=B174_KIND[s.kind],left=slotLeftB174(s);text=`Refining ${K.icon} ${left*K.unit} → ${K.out} ${left} · next in ${clockB102(slotNextB174(s))} · all done in ${clockB102(slotDoneB174(s))}. Adding more restarts the ${T} timer on everything left.`}
 for(const kind of ['heart','dust']){
  const K=B174_KIND[kind],r=slotRoomB174(i,kind),name=kind==='heart'?'Hearts':'Star Dust';
  if(s.kind&&s.kind!==kind)continue;
  const go=amt=>()=>{const n=loadSlotB174(i,kind,amt);if(n){renderRanchHudB100();burstHeartsB100(st.x,st.y-40,3);ranchToastB100(`Slot ${i+1}: ${K.icon} ${amt} loaded · ${K.out} ${slotLeftB174(slotsB174()[i])} in ${T}.`,2.4)}refinerySheetB102()};
  if(r.max){opts.push({label:`${name} · Min ${K.icon} ${r.min} → ${K.out} ${r.min/K.unit}`,run:go(r.min)});if(r.max>r.min)opts.push({label:`${name} · Max ${K.icon} ${r.max} → ${K.out} ${r.max/K.unit}`,run:go(r.max)})}
  else text+=r.space<=0&&r.space!==undefined?` ${name}: this slot is full.`:` ${name}: needs ${K.icon} ${K.min(lv)} · you have ${K.icon} ${K.have()}.`;
 }
 opts.push({label:'Back',quiet:true}); // B126 names it Back / Exit; choosing it returns to the refinery
 openSheetB100(`Refinery · Slot ${i+1}`,text,opts);
 if(ranchWorldB100.sheet)ranchWorldB100.sheet.b174Slot=true;
}
const chooseSheetBeforeB174=chooseSheetB100;
chooseSheetB100=function(i,...a){const sh=ranchWorldB100.sheet,o=sh?.options[i],r=chooseSheetBeforeB174(i,...a);if(sh?.b174Slot&&o&&!o.run)refinerySheetB102();return r};

// ---- the refinery sheet: slot tiles replace the wallet row; the old Refine / Fuse cards go ----
const openSheetBeforeB174=openSheetB100;
openSheetB100=function(...a){$('ranchSheetB100')?.classList.remove('b174');return openSheetBeforeB174(...a)};
const refinerySheetBeforeB174=refinerySheetB102;
refinerySheetB102=function(...a){
 const open=openSheetB100;
 openSheetB100=function(title,text,options,...rest){
  if(title==='Heart Refinery'&&Array.isArray(options)){
   options=options.filter(o=>!/^(Refine |Fuse )/.test(o.label));
   const k=slotCountB174(),now=Date.now();
   options.unshift(...slotsB174().slice(0,k).map((s,i)=>({label:`Slot ${i+1} · ${slotStateTextB174(s,now)}`,run:()=>openSlotSheetB174(i)})));
  }
  return open(title,text,options,...rest);
 };
 let r;try{r=refinerySheetBeforeB174(...a)}finally{openSheetB100=open}
 decorateSlotsB174();
 return r;
};
function decorateSlotsB174(){
 const el=$('ranchSheetB100');if(!refineryOpenB158()||el.querySelector('.b174slots'))return;
 el.classList.add('b174');
 const grid=document.createElement('div');grid.className='b174slots';
 (el.querySelector('.b158wallet')||el.querySelector('.b158top')).after(grid);
 for(const b of el.querySelectorAll('button'))if(/^Slot \d/.test(b.textContent)){b.classList.add('b174slot');grid.append(b)}
 updateSlotsB174();
}
function updateSlotsB174(now=Date.now()){
 const el=$('ranchSheetB100');if(!el?.classList.contains('b174'))return;
 const lv=ranchB99.refinery.level;
 [...el.querySelectorAll('.b174slot')].forEach((b,i)=>{
  const s=slotsB174()[i];if(!s)return;const K=B174_KIND[s.kind],left=slotLeftB174(s);
  const p=s.kind?clamp(1-slotDoneB174(s,now)/s.dur,0,1):0;
  const html=s.kind?`<b>Slot ${i+1}<span>${K.icon}</span></b><big>${K.out} ${left}</big><i><u style="width:${Math.round(p*100)}%"></u></i><small>next ${clockB102(slotNextB174(s,now))} · done ${clockB102(slotDoneB174(s,now))}</small>`
   :`<b>Slot ${i+1}</b><big>Empty</big><i><u style="width:0"></u></i><small>Tap to load · ♥ ${slotCapB174('heart',lv)} / ✧ ${slotCapB174('dust',lv)}</small>`;
  if(b.innerHTML!==html)b.innerHTML=html;b.classList.toggle('busy',!!s.kind);b.classList.toggle('dust',s.kind==='dust');
 });
}
const updateRefineryBeforeB174=updateRefineryB158;
updateRefineryB158=function(...a){
 const out=updateRefineryBeforeB174(...a),el=$('ranchSheetB100');
 updateSlotsB174();
 const cmp=el?.querySelector('.b158card.upgrade .b158cmp');
 if(cmp&&cmp.style.display!=='none'&&!cmp.querySelector('.b174cap')){const lv=ranchB99.refinery.level;
  cmp.innerHTML=cmp.innerHTML.replace('At a time','Slots')+`<span class="b174cap">Slot holds</span><b>♥ ${slotCapB174('heart',lv)}</b><span>→</span><em>♥ ${slotCapB174('heart',lv+1)}</em>`}
 return out;
};
const refineSignBeforeB174=refineSignB158;
refineSignB158=function(){return refineSignBeforeB174()+'|'+slotsB174().map(s=>s.kind+s.n+'.'+s.made).join(',')+'|'+slotCountB174()};

// The stage-end gate line reads the slots.
refineryGateTextB107=function(now=Date.now()){
 tickRefineryB102(now);
 const f=ranchB99.refinery,tray=f.trayStones||f.trayDust?`Tray ready: ◆ ${f.trayStones}${f.trayDust?` · ✧ ${f.trayDust}`:''}.`:'';
 const busy=slotsB174().slice(0,slotCountB174()).filter(s=>s.kind);
 if(!busy.length)return tray?`Heart Refinery: idle. ${tray}`:'';
 const next=k=>{const t=busy.filter(s=>s.kind===k).map(s=>slotNextB174(s,now));return t.length?Math.min(...t):-1},h=next('heart'),d=next('dust');
 return`Heart Refinery: ${busy.length}/${slotCountB174()} slots busy${h>=0?` · next ◆ in ${clockB102(h)}`:''}${d>=0?` · next ★ in ${clockB102(d)}`:''}.${tray?' '+tray:''}`;
};

(function installSlotStyleB174(){
 const s=document.createElement('style');s.textContent=`
#ranchSheetB100.b174 .b158wallet,#ranchSheetB100.b174 .b158card.refine,#ranchSheetB100.b174 .b158card.fuse{display:none!important}
.b174slots{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:6px;margin-bottom:10px}
#ranchSheetB100 .b174slot{margin:0!important;padding:8px!important;border-radius:14px!important;background:#fff!important;border:1.5px dashed #d9cfee!important;text-align:left;display:flex;flex-direction:column;gap:3px;min-height:86px;color:#4b4470}
#ranchSheetB100 .b174slot.busy{border-style:solid!important;border-color:#ffc4d8!important}
#ranchSheetB100 .b174slot.busy.dust{border-color:#cfc2ff!important}
#ranchSheetB100 .b174slot.focus{box-shadow:0 0 0 3px #8f7bff66}
.b174slot b{display:flex;justify-content:space-between;font:800 11px system-ui;color:#8c8fab}
.b174slot big{font:800 16px system-ui;color:#4b4470}
.b174slot i{display:block;height:6px;border-radius:99px;background:#f1ecfa;overflow:hidden}
.b174slot u{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#ffb7cf,#ff8fb6);text-decoration:none}
.b174slot.dust u{background:linear-gradient(90deg,#cfc2ff,#9f86ff)}
.b174slot small{font:600 10px system-ui;color:#8c8fab}`;
 document.head.appendChild(s);
})();
