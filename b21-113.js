
// B117 Playtest survey: an in-game survey at the ranch that fills most answers from tracked play stats.
// Play stats persist in their own versioned save; the survey opens from the ranch bag, blocks the ranch
// while open, and hands answers back as plain text (copy or share). No server.
const B117_KEY="od76-playtest-b117",B117_DRAFT_KEY="od76-playtest-draft-b117",B117_V=1,B117_SAVE_EVERY=5;
const B117_SETS={diff:["Too easy","Just right","Too hard","Didn't reach"],chain:["Got it","Saw it, not sure","Didn't notice"],
 needs:["Fun to manage","Annoying","Didn't notice"],clear:["Clear","Kind of confusing","Didn't notice"],fun:["1","2","3","4","5"],again:["Yes","Maybe","No"]};
const B117_LABELS={name:"Name",diff13:"Stages 1-3",diff46:"Stages 4-6",diff7:"Stage 7+",skillWhy:"Most-used skill and why",chain:"Chain counter",
 needs:"Pip's Tired/Food/Clean meters",gate:"Stage-clear meters",drills:"Drill training",best:"Best moment",worst:"Most frustrating",bugs:"Bugs / confusing",fun:"Fun (1-5)",again:"Play next build"};

// ---- stats: one versioned save, every read and write guarded ----
function statsDefaultB117(){return{v:B117_V,play:0,arena:0,ranch:0,runs:0,stage:0,rank:0,deaths:0,skills:{},chain:0,tier:0,blocks:0,drills:0,upgrades:0,feeds:0,washes:0}}
function loadStatsB117(){
 const s=statsDefaultB117();let raw=null;try{raw=JSON.parse(localStorage.getItem(B117_KEY)||"null")}catch(_){}
 if(!raw||raw.v!==B117_V)return s;
 const n=x=>Number.isFinite(x)&&x>0?x:0;
 for(const k in s)if(typeof s[k]==="number"&&k!=="v")s[k]=n(raw[k]);
 for(const id in raw.skills||{})if(OVERDRIVE_INFO[id])s.skills[id]={n:n(raw.skills[id]?.n),sec:n(raw.skills[id]?.sec)};
 return s;
}
let statsB117=loadStatsB117(),sinceSaveB117=0;
function saveStatsB117(){sinceSaveB117=0;try{localStorage.setItem(B117_KEY,JSON.stringify(statsB117))}catch(_){}}
function resetStatsB117(){statsB117=statsDefaultB117();try{localStorage.removeItem(B117_KEY)}catch(_){}}
function bumpB117(k,by=1){statsB117[k]+=by;saveStatsB117()}
function skillB117(id){return statsB117.skills[id]||(statsB117.skills[id]={n:0,sec:0})}
function rankUnlockedB117(){return Math.max(statsB117.rank,Number.isFinite(ranchB99?.rankUnlocked)?ranchB99.rankUnlocked:0)}
function topSkillB117(){let best=null;for(const[id,k]of Object.entries(statsB117.skills))if(k.n>0&&(!best||k.n>best.n||(k.n===best.n&&k.sec>best.sec)))best={id,name:OVERDRIVE_INFO[id].name,n:k.n,sec:k.sec};return best}
function skillRateB117(){const m=statsB117.arena/60,n=Object.values(statsB117.skills).reduce((a,k)=>a+k.n,0);return m>=1/60?n/m:0}
// Time counts only while the page is visible; arena time only in a live, unpaused run.
function timeB117(where,dt){
 dt=Math.min(1,Math.max(0,Number(dt)||0));if(!dt||document.hidden)return;
 statsB117.play+=dt;statsB117[where]+=dt;if((sinceSaveB117+=dt)>=B117_SAVE_EVERY)saveStatsB117();
}
function arenaLiveB117(){return !!(S?.run&&!S.end&&!S.b39Paused&&!ranchWorldB100.active)}
document.addEventListener("visibilitychange",()=>{if(document.hidden)saveStatsB117()});
window.addEventListener("pagehide",saveStatsB117);

// ---- hooks on the real game calls ----
const updateBeforeB117=update;
update=function(dt){
 const live=arenaLiveB117(),busy=live&&heatSkillBusyB115b(),id=S?.overType,r=updateBeforeB117(dt);
 if(live&&!document.hidden){
  if(S.stage>statsB117.stage)statsB117.stage=S.stage;
  if(busy&&OVERDRIVE_INFO[id])skillB117(id).sec+=Math.min(1,Math.max(0,Number(dt)||0));
  timeB117("arena",dt);
 }
 return r;
};
const startBattleBeforeB117=startBattleTestB99;
startBattleTestB99=function(...a){const r=startBattleBeforeB117(...a);if(r!==false&&S?.run&&!S.end){statsB117.stage=Math.max(statsB117.stage,S.stage||1);bumpB117("runs")}return r};
const triggerBeforeB117=triggerOverdrive;
triggerOverdrive=function(...a){
 const was=heatSkillBusyB115b(),id=S?.overType,ok=triggerBeforeB117(...a);
 if(ok&&!was&&S?.run&&OVERDRIVE_INFO[id]){skillB117(id).n++;saveStatsB117()}
 return ok;
};
const killBeforeB117=kill;
kill=function(...a){
 const r=killBeforeB117(...a),c=S?.b115Combo;
 if(c&&(c.count>statsB117.chain||c.tier>statsB117.tier)){statsB117.chain=Math.max(statsB117.chain,c.count);statsB117.tier=Math.max(statsB117.tier,c.tier);saveStatsB117()}
 return r;
};
const finishBeforeB117=finish;
finish=function(dead,...a){const ended=S?.end,r=finishBeforeB117(dead,...a);if(!ended&&dead&&S?.end)bumpB117("deaths");return r};
const gateBeforeB117=openRanchGateB99;
openRanchGateB99=function(...a){
 const r=gateBeforeB117(...a);
 if(S){if(S.stage>statsB117.stage)statsB117.stage=S.stage;if(exhaustedB115()&&S.b117Blocked!==S.stage){S.b117Blocked=S.stage;statsB117.blocks++}
  statsB117.rank=rankUnlockedB117();saveStatsB117()}
 return r;
};
const payDrillBeforeB117=payDrillB100;
payDrillB100=function(...a){const ok=payDrillBeforeB117(...a);if(ok)bumpB117("drills");return ok};
const upgradeStationBeforeB117=upgradeStationB102;
upgradeStationB102=function(...a){const ok=upgradeStationBeforeB117(...a);if(ok)bumpB117("upgrades");return ok};
const feedBeforeB117=feedB104;
feedB104=function(...a){const it=feedBeforeB117(...a);if(it)bumpB117("feeds");return it};
const washBeforeB117=washB104;
washB104=function(...a){const ok=washBeforeB117(...a);if(ok)bumpB117("washes");return ok};

// ---- words: the auto-filled summary and the plain-text report ----
function minutesB117(sec){return sec<60?"<1 min":`${Math.round(sec/60)} min`}
function stampB117(){return($("od76BuildStamp")?.textContent||"").trim()||"OD76 B117"}
function pluralB117(n,one,many=one+"s"){return`${n} ${n===1?one:many}`}
function summaryB117(){
 const s=statsB117,top=topSkillB117(),rank=B108_RANKS[rankUnlockedB117()]?.id||"E";
 return[`Played ${minutesB117(s.play)} (arena ${minutesB117(s.arena)})`,pluralB117(s.runs,"battle test"),s.stage?`reached stage ${s.stage}`:"no stage reached yet",`rank ${rank} unlocked`,
  top?`most-used skill ${top.name} (${pluralB117(top.n,"use")})`:"no skills used yet",s.chain?`best chain ${s.tier}x ${s.chain}`:"no chain yet"].join(" · ");
}
function detailB117(){
 const s=statsB117;
 return[`${skillRateB117().toFixed(1)} skill uses per arena minute`,pluralB117(s.deaths,"fall"),`stopped by 100 fatigue ${s.blocks}×`,pluralB117(s.drills,"drill training"),
  pluralB117(s.upgrades,"station upgrade"),`fed Pip ${s.feeds}×`,`washed Pip ${s.washes}×`].join(" · ");
}
function statsTextB117(){
 const s=statsB117,top=topSkillB117(),skills=Object.entries(s.skills).filter(([,k])=>k.n>0).sort((a,b)=>b[1].n-a[1].n).map(([id,k])=>`${OVERDRIVE_INFO[id].name} ${k.n} (${Math.round(k.sec)}s)`);
 return[`Time played: ${minutesB117(s.play)} (arena ${minutesB117(s.arena)}, ranch ${minutesB117(s.ranch)})`,`Battle tests: ${s.runs} · falls: ${s.deaths}`,
  `Highest stage: ${s.stage||"-"} · rank unlocked: ${B108_RANKS[rankUnlockedB117()]?.id||"E"}`,`Most-used skill: ${top?`${top.name} (${top.n} uses)`:"none"}`,
  `Skills: ${skills.join(", ")||"none"} · ${skillRateB117().toFixed(1)} uses/arena min`,`Best chain: ${s.chain?`${s.tier}x ${s.chain}`:"none"}`,
  `Gate stops at 100 fatigue: ${s.blocks}`,`Drill trainings: ${s.drills} · station upgrades: ${s.upgrades}`,`Feeds: ${s.feeds} · washes: ${s.washes}`].join("\n");
}
function reportB117(answers=answersB117()){
 const lines=Object.keys(B117_LABELS).filter(k=>answers[k]).map(k=>`${B117_LABELS[k]}: ${answers[k]}`);
 return`OD76 playtest · ${stampB117()}\n-- From play --\n${statsTextB117()}\n-- Answers --\n${lines.join("\n")||"(none yet)"}`;
}

// ---- answers: stat-based pre-selections under a draft of only what the player touched ----
function defaultsB117(){
 const st=statsB117.stage,top=topSkillB117(),d={};
 if(st<1)d.diff13="Didn't reach";if(st<4)d.diff46="Didn't reach";if(st<7)d.diff7="Didn't reach";
 if(statsB117.chain<3)d.chain="Didn't notice";
 if(top)d.skillWhy=`${top.name}, because `;
 return d;
}
function loadDraftB117(){try{const d=JSON.parse(localStorage.getItem(B117_DRAFT_KEY)||"null");return d&&d.v===B117_V&&d.a&&typeof d.a==="object"?d.a:{}}catch(_){return{}}}
function saveDraftB117(a){try{localStorage.setItem(B117_DRAFT_KEY,JSON.stringify({v:B117_V,a}))}catch(_){}}
function clearDraftB117(){try{localStorage.removeItem(B117_DRAFT_KEY)}catch(_){}}
function answersB117(){
 const card=$("ranchSurveyB117"),out={};
 if(!card||card.classList.contains("hidden"))return Object.assign(defaultsB117(),loadDraftB117());
 for(const k in B117_LABELS){const el=card.querySelector(`[name="b117-${k}"]:checked`)||card.querySelector(`input[type=text][name="b117-${k}"],textarea[name="b117-${k}"]`);const v=(el?.value||"").trim();if(v)out[k]=v}
 return out;
}

// ---- the overlay ----
const surveyB117={open:false,pad:{a:true,b:true,nav:0},focus:-1};
function surveyOpenB117(){return surveyB117.open}
(function installSurveyB117(){
 const s=document.createElement("style");s.id="surveyStyleB117";
 s.textContent=`#ranchSurveyB117{z-index:40}#ranchSurveyB117 .card{width:min(600px,96vw);display:grid;gap:12px;padding:18px;background:#0d131df7;overscroll-behavior:contain}
#ranchSurveyB117 .b117Head{display:flex;align-items:start;justify-content:space-between;gap:10px;pointer-events:auto}#ranchSurveyB117 h2{margin:4px 0 0;font-size:clamp(24px,6vw,34px);letter-spacing:-.03em;line-height:1.05}#ranchSurveyB117 h2 b{color:var(--gold)}
#ranchSurveyB117 .x{flex:none;width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:#ffffff08;cursor:pointer;font-size:18px}
#ranchSurveyB117 fieldset{border:1px solid var(--line);border-radius:14px;background:#ffffff05;padding:12px;margin:0;display:grid;gap:10px;min-width:0}#ranchSurveyB117 legend{padding:0 6px;font-weight:850;font-size:14px}
#ranchSurveyB117 .sum{margin:0;font-size:15px;line-height:1.5;color:var(--text)}#ranchSurveyB117 .q{display:block;font-weight:700;font-size:13px;color:#dfe7ff;margin-bottom:6px}
#ranchSurveyB117 .chips{display:flex;flex-wrap:wrap;gap:8px}#ranchSurveyB117 .chips input{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none}
#ranchSurveyB117 .chips label{min-height:44px;display:inline-flex;align-items:center;padding:0 14px;border:1px solid var(--line);border-radius:999px;background:#ffffff08;color:#cdd5e0;font-weight:750;font-size:14px;cursor:pointer}
#ranchSurveyB117 .chips input:checked+label{background:var(--gold);border-color:var(--gold);color:#1b1305}#ranchSurveyB117 .chips input:focus-visible+label,#ranchSurveyB117 .chips input.b117pad+label,#ranchSurveyB117 .b117pad{outline:2px solid var(--cyan);outline-offset:2px}
#ranchSurveyB117 input[type=text],#ranchSurveyB117 textarea{width:100%;font:inherit;font-size:16px;color:var(--text);background:#070a11;border:1px solid var(--line);border-radius:12px;padding:10px 12px}#ranchSurveyB117 textarea{min-height:72px;resize:vertical}
#ranchSurveyB117 .stage{display:grid;grid-template-columns:96px 1fr;gap:8px;align-items:center}#ranchSurveyB117 .stage>span{font-weight:800;font-size:13px;color:var(--cyan)}
#ranchSurveyB117 .acts{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}#ranchSurveyB117 .acts button{min-height:48px;font-weight:850;border-radius:12px;cursor:pointer;border:1px solid var(--line);background:#ffffff08}
#ranchSurveyB117 .acts .primary{border-color:var(--gold);background:var(--gold);color:#1b1305}#ranchSurveyB117 .status{margin:0;font-weight:700;font-size:13px;color:var(--green);min-height:1.2em}
#ranchSurveyB117 .link{justify-self:start;background:none;border:0;color:var(--muted);text-decoration:underline;font-size:12px;padding:8px 0;cursor:pointer}
#ranchSurveyB117 .copyBox{width:100%;min-height:180px;font:12px/1.45 ui-monospace,Menlo,Consolas,monospace;white-space:pre;color:var(--text);background:#070a11;border:1px solid var(--line);border-radius:12px;padding:10px}
@media(max-width:560px){#ranchSurveyB117{padding:8px}#ranchSurveyB117 .card{padding:14px;max-height:96dvh}#ranchSurveyB117 .stage{grid-template-columns:1fr}#ranchSurveyB117 .acts{grid-template-columns:1fr}}`;
 document.head.appendChild(s);
 const m=document.createElement("div");m.id="ranchSurveyB117";m.className="modal hidden";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Playtest survey");
 (document.getElementById("app")||document.body).appendChild(m);
 m.addEventListener("input",e=>saveFieldB117(e.target));m.addEventListener("change",e=>saveFieldB117(e.target));
})();
function escB117(t){return String(t).replace(/[&<>"']/g,c=>`&#${c.charCodeAt(0)};`)}
function chipsB117(name,set){return`<div class="chips" role="radiogroup" aria-label="${escB117(B117_LABELS[name])}">${B117_SETS[set].map((o,i)=>`<input type="radio" name="b117-${name}" id="b117-${name}-${i}" value="${escB117(o)}"><label for="b117-${name}-${i}">${escB117(o)}</label>`).join("")}</div>`}
function askB117(label,body){return`<div><span class="q">${label}</span>${body}</div>`}
function textB117(name,label,area,ph=""){const tag=area?`<textarea name="b117-${name}" id="b117-${name}" placeholder="${escB117(ph)}"></textarea>`:`<input type="text" name="b117-${name}" id="b117-${name}" autocomplete="nickname" placeholder="${escB117(ph)}">`;return`<div><label class="q" for="b117-${name}">${label}</label>${tag}</div>`}
function renderSurveyB117(){
 const m=$("ranchSurveyB117"),top=topSkillB117();
 m.innerHTML=`<div class="card" tabindex="-1">
<div class="b117Head"><div><div class="kicker">Overdrive 76 · playtest · ${escB117(stampB117())}</div><h2>How far did <b>Pip</b> get?</h2></div><button type="button" class="x" data-b117="close" aria-label="Close survey">✕</button></div>
<p>Thanks for playing! This takes about 3 minutes. Skip anything you don't remember.</p>
<fieldset><legend>Auto-filled from your play</legend><p class="sum" id="b117Summary">${escB117(summaryB117())}</p><p class="small" id="b117Detail">${escB117(detailB117())}</p></fieldset>
<fieldset><legend>Your run</legend>${textB117("name","Your name (optional)",false)}${textB117("skillWhy","What was your most used skill, and why did you like it?",true,top?`${top.name}: what made it fun?`:"Which skill, and why?")}</fieldset>
<fieldset><legend>Difficulty</legend><div class="stage"><span>Stages 1–3</span>${chipsB117("diff13","diff")}</div><div class="stage"><span>Stages 4–6</span>${chipsB117("diff46","diff")}</div><div class="stage"><span>Stage 7+</span>${chipsB117("diff7","diff")}</div></fieldset>
<fieldset><legend>HEAT and skills</legend>${askB117(`The chain counter on the right (like "2x 14")…`,chipsB117("chain","chain"))}</fieldset>
<fieldset><legend>Pip and the ranch</legend>${askB117("Pip's Tired, Food and Clean meters felt…",chipsB117("needs","needs"))}${askB117("The meters on the stage-clear screen were…",chipsB117("gate","clear"))}${askB117("Training at the drill sites was…",chipsB117("drills","clear"))}</fieldset>
<fieldset><legend>Big picture</legend>${textB117("best","Best moment",true)}${textB117("worst","Most frustrating moment",true)}${textB117("bugs","Bugs or anything confusing?",true)}${askB117("Overall, how fun was it?",chipsB117("fun","fun"))}${askB117("Would you play the next build?",chipsB117("again","again"))}</fieldset>
<div class="acts"><button type="button" class="primary" data-b117="copy">Copy answers</button>${navigator.share?`<button type="button" data-b117="share">Share</button>`:""}<button type="button" data-b117="close">Close</button></div>
<p class="status" id="b117Status" role="status"></p><textarea class="copyBox" id="b117CopyBox" readonly hidden></textarea>
<button type="button" class="link" data-b117="clear">Clear draft</button></div>`;
 fillSurveyB117(Object.assign(defaultsB117(),loadDraftB117()));
 for(const b of m.querySelectorAll("[data-b117]"))b.addEventListener("click",()=>surveyActionB117(b.dataset.b117));
}
function fillSurveyB117(a){
 const m=$("ranchSurveyB117");
 for(const k in B117_LABELS){const v=a[k];if(v==null)continue;const text=m.querySelector(`#b117-${k}`);if(text){text.value=v;continue}
  for(const r of m.querySelectorAll(`[name="b117-${k}"]`))r.checked=r.value===v}
}
function saveFieldB117(el){
 const k=(el?.name||"").replace(/^b117-/,"");if(!surveyB117.open||!(k in B117_LABELS))return;
 if(el.type==="radio"&&!el.checked)return;
 const d=loadDraftB117();d[k]=el.value;saveDraftB117(d);
}
function statusB117(t){try{const el=$("b117Status");if(el)el.textContent=t}catch(_){}}
function copyFallbackB117(text){
 const box=$("b117CopyBox");if(!box)return;box.hidden=false;box.value=text;
 try{box.focus();box.select()}catch(_){}
 statusB117("Couldn't copy automatically. Your answers are selected below: copy them with your keyboard or long-press.");
}
function copySurveyB117(){
 const text=reportB117();
 try{navigator.clipboard.writeText(text).then(()=>statusB117("Copied. Paste it into a message to the developer. Thanks!"),()=>copyFallbackB117(text))}catch(_){copyFallbackB117(text)}
 return text;
}
function shareSurveyB117(){
 const text=reportB117();if(!navigator.share)return copyFallbackB117(text);
 try{Promise.resolve(navigator.share({title:"OD76 playtest",text})).catch(()=>{})}catch(_){copyFallbackB117(text)}
 return text;
}
function surveyActionB117(a){
 if(a==="close")return closeSurveyB117();
 if(a==="copy")return copySurveyB117();
 if(a==="share")return shareSurveyB117();
 if(a==="clear"){clearDraftB117();renderSurveyB117();statusB117("Draft cleared.");$("ranchSurveyB117").querySelector(".card")?.focus?.()}
}
function openSurveyB117(){
 const w=ranchWorldB100;if(!w.active||w.game||surveyB117.open)return false;
 closeSheetB100();keys.clear();w.stick.id=null;w.stick.dx=0;w.stick.dy=0;w.touchTap=false;w.touchAct=false;w.backTap=false;w.navTap=0;
 statsB117.rank=rankUnlockedB117();saveStatsB117();
 surveyB117.open=true;surveyB117.pad={a:true,b:true,nav:0};surveyB117.focus=-1;
 renderSurveyB117();const m=$("ranchSurveyB117");m.classList.remove("hidden");$("ranchActB100")?.classList.remove("on");
 try{m.querySelector(".card").focus({preventScroll:true})}catch(_){}
 return true;
}
function closeSurveyB117(){
 if(!surveyB117.open)return false;surveyB117.open=false;
 const m=$("ranchSurveyB117");m.classList.add("hidden");m.innerHTML="";
 const w=ranchWorldB100;w.prevAct=true;w.prevBack=true;keys.clear();
 return true;
}
// Keys never reach the game while the survey is open (typing w/a/s/d or space stays in the form); Escape closes it.
window.addEventListener("keydown",e=>{
 if(!surveyB117.open)return;
 e.stopPropagation();
 if(e.key==="Escape"){e.preventDefault();closeSurveyB117()}
},true);
// Controller: B closes; the d-pad or stick moves through the controls, A presses the one in focus.
function surveyPadB117(){
 let a=false,b=false,nav=0;
 for(const p of navigator.getGamepads?navigator.getGamepads():[]){if(!p||!p.connected)continue;const pr=i=>!!(p.buttons?.[i]?.pressed||p.buttons?.[i]?.value>.5);
  a=pr(0);b=pr(1);nav=pr(12)||pr(14)?-1:pr(13)||pr(15)?1:0;const ay=p.axes?.[1]||0;if(!nav&&Math.abs(ay)>.6)nav=Math.sign(ay);break}
 const s=surveyB117,prev=s.pad;s.pad={a,b,nav};
 if(b&&!prev.b)return closeSurveyB117();
 const m=$("ranchSurveyB117"),els=[...m.querySelectorAll("input,textarea:not([hidden]),button")];if(!els.length)return;
 if(nav&&nav!==prev.nav){
  els[s.focus]?.classList.remove("b117pad");s.focus=clamp(s.focus+nav,0,els.length-1);const el=els[s.focus];el.classList.add("b117pad");
  try{el.focus({preventScroll:true})}catch(_){}(el.type==="radio"?el.nextElementSibling:el)?.scrollIntoView?.({block:"nearest"});
 }
 if(a&&!prev.a&&els[s.focus])els[s.focus].click();
}

// ---- the ranch lock: no input, menus, X jobs or movement while the survey is open ----
const inputBeforeB117=ranchInputB100;
ranchInputB100=function(){const w=ranchWorldB100,r=inputBeforeB117();if(!surveyB117.open)return r;w.b109XPressed=false;w.b109XTap=false;return{act:false,actPressed:false,backPressed:false,navPressed:0,xPressed:false}};
const openSheetBeforeB117=openSheetB100;
openSheetB100=function(...a){if(surveyB117.open)return;return openSheetBeforeB117(...a)};
const nearestBeforeB117=nearestInteractB100;
nearestInteractB100=function(){return surveyB117.open?null:nearestBeforeB117()};
const pipActionBeforeB117=pipActionForB109;
pipActionForB109=function(near){return surveyB117.open?null:pipActionBeforeB117(near)};
const startPipActionBeforeB117=startPipActionB109;
startPipActionB109=function(a){return surveyB117.open?false:startPipActionBeforeB117(a)};
const updateRanchBeforeB117=updateRanchB100;
updateRanchB100=function(dt){
 const w=ranchWorldB100,open=surveyB117.open,px=w.px,py=w.py;
 if(w.active)timeB117("ranch",dt);
 updateRanchBeforeB117(dt);
 if(!open)return;
 w.px=px;w.py=py;$("ranchActB100")?.classList.remove("on");
 if(surveyB117.open)surveyPadB117();
};
const leaveBeforeB117=leaveRanchB100;
leaveRanchB100=function(){closeSurveyB117();leaveBeforeB117()};
const enterBeforeB117=enterRanchB100;
enterRanchB100=function(){closeSurveyB117();enterBeforeB117()};
openRanchB99=enterRanchB100;
for(const id of ["openRanchB99","endRanchB99"]){const old=$(id);if(!old)continue;const b=old.cloneNode(true);old.replaceWith(b);b.addEventListener("click",enterRanchB100)}

// ---- entry point: the always-reachable ranch bag (🎒 button, Select, touch) lists the survey ----
const bagSheetBeforeB117=bagSheetB104;
bagSheetB104=function(...a){
 const open=openSheetB100;
 openSheetB100=(title,text,opts,...rest)=>{const o=[...(opts||[])],i=o.findIndex(x=>x.quiet);o.splice(i<0?o.length:i,0,{label:"📝 Playtest survey",run:openSurveyB117});return open(title,text,o,...rest)};
 try{return bagSheetBeforeB117(...a)}finally{openSheetB100=open}
};
