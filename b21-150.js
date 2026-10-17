
// B132 Overdrive page redesign. The boss-reward Overdrive step becomes a tile strip (one per skill: level, tier
// segments, "!" when something is affordable now, a top bar on the equipped skill) over one detail panel for the
// selected skill: summary + More, the level's tier track, a card for the next step only, one state-driven main
// button (hold to confirm through B117h; when the step isn't affordable it stays pressable and says why), Equip,
// and a fixed Continue. The long rules move behind "?". Pip Ascendant shows its Echoes and keeps its old upgrade.
// Gamepad: stick/d-pad moves, LB/RB switch skill, A presses/holds, B closes More/rules, Start continues, Select = rules.
const B132_SUMMARY={
 beam:'Hold to fire rapid piercing starfire while HEAT lasts.',
 storm:'Press to form a storm cloud that zaps enemies; hold to charge seeking clouds.',
 guardian:'Hold: Pip shields you with charged blocks; release for a knockback pulse.',
 nova:'Hold to charge, release a shockwave that links struck enemies into stars.',
 gravity:'Hold to charge an orbiting singularity; release to collapse it.',
 pip:'Pip becomes the super, cycling Echoes of your skills.'
};
const B132_KIT={
 beam:['1 bolt','2 bolts','3 bolts, pierce 2','Wider spread, faster fire','5 bolts, pierce 3'],
 storm:['Storm cloud, 1 seeker','2 seekers, faster zaps','Chain lightning','Longer range, 3 seekers','4 seekers, faster charge'],
 guardian:['2 blocks and a pulse','3 blocks, bigger pulse','Blocks reflect shots','4 blocks','Mends shields'],
 nova:['Shockwave','More star links','Extra waves on charge','More star links','Full charge hits the whole screen'],
 gravity:['Singularity','Pulls hearts','Mass: kills grow it','Stronger against bosses','Full collapse hits the whole screen']
};
const B132_SIG={beam:'+1 pierce',storm:'Chain hits +1 enemy',guardian:'Reflect +25%',nova:'+1 wave on full charge',gravity:'Mass cap +5'};
const b132={sel:null,more:false,help:false,pad:{}};

function b132Visible(){return !!(stageUpgradeVisibleB35()&&$('overdriveStep')&&!$('overdriveStep').classList.contains('stagehidden'))}
function b132Sel(){if(!b132.sel||!OVERDRIVE_INFO[b132.sel])b132.sel=S?.overType||'beam';return b132.sel}
function b132Tier(id,lv,t){ // the bonus of reaching tier t (1-5) at level lv
 if(lv<=1)return {name:B132_KIT[id][t-1],desc:`Kit part ${t} of 5${t===3?' · HEAT refills 0.1s faster':''}`};
 return [{name:'Stronger',desc:'+10% damage'},{name:'Reach',desc:'+7.5% range'},{name:'Brighter',desc:'Bigger, brighter hits · HEAT refills 0.1s faster'},{name:'Stronger',desc:'+10% damage'},{name:B132_SIG[id],desc:'Signature bump · brighter hits'}][t-1];
}
function b132Afford(id){
 const info=OVERDRIVE_INFO[id];if(!S.overUnlocked.has(id))return S.starPoints>=info.unlock;
 const m=masteryB131(id);
 if(!m)return overLevel(id)<5&&S.starPoints>=overUpgradeCost(id);
 const n=nextStepB131(id);if(n.kind==='b132Done')return false;
 return S.starPoints>=n.stars&&(n.kind!=='tier'||m.u>=n.uses);
}
// The one next step for the selected skill: {label, sub, hold, why}
function b132Step(id){
 const info=OVERDRIVE_INFO[id],left=c=>`★ ${c} · ${S.starPoints-c} left after`,need=c=>({label:`Need ${c-S.starPoints} more ★`,sub:`Costs ★ ${c} · you have ★ ${S.starPoints}`,hold:false});
 if(!S.overUnlocked.has(id))return S.starPoints>=info.unlock?{label:'HOLD · Unlock',sub:left(info.unlock),hold:true}:need(info.unlock);
 const m=masteryB131(id);
 if(!m){const lv=overLevel(id);if(lv>=5)return null;const c=overUpgradeCost(id);return S.starPoints>=c?{label:`HOLD · Upgrade to Lv ${lv+1}`,sub:left(c),hold:true}:need(c)}
 const n=nextStepB131(id);if(n.kind==='b132Done')return null;
 if(n.kind==='tier'&&m.u<n.uses){const k=n.uses-m.u;return {label:`Use ${info.name} ${k} more time${k===1?'':'s'}`,sub:S.overType===id?'Earn uses in the next stage':'Equip it to earn uses',hold:false}}
 if(S.starPoints<n.stars)return need(n.stars);
 return {label:n.kind==='tier'?`HOLD · Unlock Tier ${n.tier}`:`HOLD · Level up to ${n.level}`,sub:left(n.stars),hold:true};
}

// ---- markup ----
(function installB132(){
 const step=$('overdriveStep');if(!step)return;step.classList.add('b132');
 const ui=document.createElement('div');ui.id='b132';
 ui.innerHTML=`<div class="b132Head"><h2>Overdrive</h2><span class="b132Sp"></span><span class="b132Stars" id="b132Stars"></span><button id="b132Help" class="b132HelpBtn" type="button" aria-label="Rules">?</button></div>
<div class="b132Strip" id="b132Strip">${OVER_ORDER.map(id=>`<button type="button" class="b132Tile" data-id="${id}"></button>`).join('')}</div>
<div class="b132Detail" id="b132Detail"></div>
<div class="b132Foot"><span class="b132Hint">LB / RB switch skill · hold A to confirm</span></div>
<div class="b132Rules hidden" id="b132Rules"><div><h3>How Overdrive works</h3><p id="b132RulesText"></p><button type="button" id="b132RulesClose" class="primary">Got it</button></div></div>`;
 step.appendChild(ui);
 const cont=$('continueOverdrive');if(cont){cont.classList.add('b132Cont');ui.querySelector('.b132Foot').appendChild(cont)}
 ui.querySelector('#b132Strip').addEventListener('click',e=>{const t=e.target.closest('.b132Tile');if(t){b132.sel=t.dataset.id;b132.more=false;renderOverdriveStep()}});
 $('b132Help').addEventListener('click',()=>{b132.help=true;b132RenderRules()});
 $('b132RulesClose').addEventListener('click',()=>{b132.help=false;b132RenderRules()});
 B117H_IDS.push('b132Main');
 const s=document.createElement('style');s.textContent=`
#overdriveStep.b132>h2,#overdriveStep.b132>p,#overdriveStep.b132>#starBalance,#overdriveStep.b132>.overgrid{display:none}
#b132{display:grid;gap:12px;text-align:left}
.b132Head{display:flex;align-items:center;gap:12px}.b132Sp{flex:1}
.b132Kick{font-size:11px;letter-spacing:.16em;color:var(--muted,#9aa6b8);text-transform:uppercase}
#b132 h2{margin:0;font-size:clamp(21px,2.6vw,28px)}
.b132Stars{font-weight:800;font-size:18px;color:#ffd36f}
.b132HelpBtn{width:44px;height:44px;border-radius:50%;border:1px solid #ffffff30;background:none;color:#cfd8e6;font:700 16px system-ui;padding:0}
.b132Strip{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
.b132Tile{position:relative;border:1px solid #ffffff1c;border-radius:12px;padding:10px 9px 9px;background:#ffffff04;display:grid;gap:6px;align-content:start;min-height:74px;text-align:left;color:inherit;font:inherit}
.b132Tile .b132Top{display:flex;align-items:center;gap:7px;padding-right:15px;min-width:0}
.b132Ic{font-size:18px;width:20px;text-align:center;flex:none}
.b132Nm{font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.b132Lv{font-size:11px;font-weight:800;color:#7ed8ff;letter-spacing:.04em}
.b132Lock{font-size:12px;font-weight:700;color:#9aa6b8}
.b132Segs{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;width:100%}
.b132Segs i{height:5px;border-radius:2px;background:#ffffff1a}.b132Segs i.b132On{background:#8fe3b8}.b132Segs i.b132Rd{background:#ffd36f}
.b132Tile.b132Locked{background:none;border-style:dashed}.b132Tile.b132Locked .b132Ic,.b132Tile.b132Locked .b132Nm{opacity:.6}
.b132Tile.b132Selected{background:#7ed8ff14;border-color:#7ed8ff66}
.b132Tile.b132Eq::after{content:"";position:absolute;left:12px;right:12px;top:-1px;height:3px;border-radius:0 0 3px 3px;background:#eef3fb}
.b132Bang{position:absolute;top:6px;right:6px;width:16px;height:16px;border-radius:50%;background:#ffd36f;color:#1a1300;font:900 11px/16px system-ui;text-align:center}
.b132Detail{border:1px solid #ffffff1c;border-radius:14px;padding:14px 16px;display:grid;gap:11px;background:#ffffff03}
.b132Dh{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.b132Dh .b132Ic{font-size:24px;width:28px}
.b132Dh h3{margin:0;font-size:21px}.b132Dh .b132Lv{font-size:14px}
#b132 .b132Sum{margin:0;color:#9aa6b8;font-size:13.5px;line-height:1.35}
.b132More{display:inline-block;color:#7ed8ff;font-weight:700;padding:6px 8px;margin:-6px 0 -6px 2px;border:0;background:none;font-size:13px;min-height:0}
.b132Ml{font-size:11px;letter-spacing:.14em;color:#9aa6b8;text-transform:uppercase}
.b132Track{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.b132T{height:28px;border-radius:8px;display:grid;place-items:center;font:800 12px system-ui;border:1.5px solid #ffffff26;color:#5b6575}
.b132T.b132Done{background:#8fe3b8;border-color:#8fe3b8;color:#062016}.b132T.b132Rd{border-color:#ffd36f;color:#ffd36f;box-shadow:0 0 0 3px #ffd36f22,0 0 14px #ffd36f55}.b132T.b132Wait{border:1.5px dashed #ffd36f88;color:#ffd36faa}
.b132Next{border:1px solid #ffffff30;background:#ffffff06;border-radius:12px;padding:10px 13px;display:grid;grid-template-columns:1fr auto;gap:2px 14px;align-items:center}
.b132Next:not(:has(.b132Req)){grid-template-columns:1fr}.b132Next.b132Gold{border-color:#ffd36f66;background:#ffd36f0c}
.b132Next .b132K{font-size:11px;letter-spacing:.14em;color:#ffd36f;font-weight:800}.b132Next.b132Plain .b132K{color:#9aa6b8}
.b132Next .b132B{font-size:15.5px;font-weight:800}.b132Next .b132S{font-size:12.5px;color:#9aa6b8}
.b132Next .b132Req{grid-row:1/4;grid-column:2;text-align:right;font-size:13px;font-weight:700;white-space:nowrap}.b132Next .b132Ok{color:#8fe3b8}.b132Next .b132Short{color:#ffd36f}
.b132Acts{display:grid;grid-template-columns:2fr 1fr;gap:10px}.b132Acts.one{grid-template-columns:1fr}
#b132 .b132Acts button{min-height:52px;margin:0}
#b132Main small,#b132Why small,#b132Equip small{display:block;font-weight:600;font-size:11.5px;opacity:.8;margin-top:2px}
#b132Why{background:#ffffff08;border:1px solid #ffffff30;color:#eef3fb}
#b132Equip{background:none;border:1px solid #ffffff66;color:#eef3fb}#b132Equip:disabled{border-color:#ffffff30;color:#9aa6b8;opacity:1}
.b132Echo{display:grid;gap:6px}.b132Er{display:grid;grid-template-columns:22px 1fr auto 100px;gap:10px;align-items:center;font-size:13px}.b132Er .b132M{color:#9aa6b8;font-size:12px;text-align:right}.b132Er.b132Off{opacity:.45}
.b132Foot{display:flex;align-items:center;gap:12px;border-top:1px solid #ffffff1c;padding-top:10px}.b132Hint{color:#5b6575;font-size:12px;flex:1}
#b132 .b132Cont{margin:0;width:auto;min-height:46px;padding:10px 20px}
.b132Rules{position:absolute;inset:0;z-index:5;display:grid;place-items:center;background:#05070bdd;border-radius:inherit;padding:16px}.b132Rules.hidden{display:none}
.b132Rules>div{max-width:520px;background:#0b1119;border:1px solid #ffffff30;border-radius:14px;padding:16px 18px;display:grid;gap:10px}.b132Rules h3{margin:0}
#stageUp .card:has(#overdriveStep.b132:not(.stagehidden)){position:relative}
@media(max-width:560px){
 #b132{gap:9px}.b132Kick,.b132Hint{display:none}.b132Strip{gap:5px}
 .b132Tile{padding:8px 3px 7px;justify-items:center;min-height:60px;gap:5px}.b132Tile .b132Top{padding-right:0;justify-content:center}.b132Nm{display:none}
 .b132Tile.b132Eq::after{left:8px;right:8px}.b132Bang{top:3px;right:3px;width:14px;height:14px;font-size:9px;line-height:14px}.b132Lock{font-size:11px}
 .b132Detail{padding:11px 11px;gap:9px}.b132Dh h3{font-size:18px}.b132Acts{grid-template-columns:1fr;gap:8px}#b132 .b132Acts button{min-height:48px}
 #b132 .b132Cont{flex:1}.b132Er{grid-template-columns:20px 1fr 80px}.b132Er .b132M{display:none}
}`;
 document.head.appendChild(s);
})();

function b132RenderRules(){
 const r=$('b132Rules');if(!r)return;r.classList.toggle('hidden',!b132.help);
 $('b132RulesText').textContent=$('overdriveStep')?.querySelector(':scope>p')?.textContent||'';
}
function b132TileHTML(id){
 const info=OVERDRIVE_INFO[id],m=masteryB131(id),unlocked=S.overUnlocked.has(id);
 let body;
 if(!unlocked)body=`<span class="b132Lock">🔒 ★${info.unlock}</span>`;
 else if(!m)body=`<span class="b132Lv">LV ${overLevel(id)}</span><span class="b132Lock" style="font-size:11px">ECHOES</span>`;
 else{const n=nextStepB131(id),rd=n.kind==='tier'&&m.u>=n.uses;body=`<span class="b132Lv">LV ${m.lv}</span><span class="b132Segs">${[0,1,2,3,4].map(i=>`<i class="${i<m.t?'b132On':i===m.t&&rd?'b132Rd':''}"></i>`).join('')}</span>`}
 return `<span class="b132Top"><span class="b132Ic">${info.icon}</span><span class="b132Nm">${info.name}</span></span>${body}${b132Afford(id)?'<span class="b132Bang">!</span>':''}`;
}
function b132DetailHTML(id){
 const info=OVERDRIVE_INFO[id],m=masteryB131(id),unlocked=S.overUnlocked.has(id),eq=S.overType===id,step=b132Step(id);
 const lvTag=!unlocked?'<span class="b132Lock">LOCKED</span>':`<span class="b132Lv">LV ${m?m.lv:overLevel(id)}</span>`;
 const sum=b132.more?(id==='pip'?`${info.desc} Ignites at ${B94_PIP_IGNITION_PERCENT}% HEAT; tap once and it drains automatically.`:`${info.desc} Ignites at ${igniteThresholdB131(id)}% HEAT.`):B132_SUMMARY[id];
 let mid='';
 if(!unlocked)mid=`<div class="b132Next b132Plain"><span class="b132K">LOCKED</span><span class="b132B">Unlock ${info.name}</span><span class="b132S">${m===null&&id!=='pip'?'Starts at Lv 1. Tier 1 needs 1 use.':'Joins Pip\'s Echoes once unlocked.'}</span></div>`;
 else if(!m){
  const rows=B38_BASIC_OVERDRIVES.map(o=>{const on=S.overUnlocked.has(o),lv=on?overLevel(o):0;return `<div class="b132Er ${on?'':'b132Off'}"><span class="b132Ic">${OVERDRIVE_INFO[o].icon}</span><span>${OVERDRIVE_INFO[o].name}</span><span class="b132M">${on?'Echo Lv '+lv:'not unlocked'}</span><span class="b132Segs">${[0,1,2,3,4].map(i=>`<i class="${i<lv?'b132On':''}"></i>`).join('')}</span></div>`}).join('');
  mid=`<div class="b132Ml">Pip's Echoes</div><div class="b132Echo">${rows}</div>`;
 }else{
  const n=nextStepB131(id),track=`<div class="b132Ml">LV ${m.lv} · Tiers</div><div class="b132Track">${[1,2,3,4,5].map(i=>{const c=i<=m.t?'b132Done':i===m.t+1&&n.kind==='tier'?(m.u>=n.uses?'b132Rd':'b132Wait'):'';return `<span class="b132T ${c}">${i<=m.t?'✓':i}</span>`}).join('')}</div>`;
  if(n.kind==='b132Done')mid=`${track}<div class="b132Next b132Gold"><span class="b132K">MASTERED</span><span class="b132B">Level 5 fully mastered</span><span class="b132S">Nothing left to master this run.</span></div>`;
  else if(n.kind==='level')mid=`${track}<div class="b132Next b132Gold"><span class="b132K">LEVEL ${n.level} READY</span><span class="b132B">Level up</span><span class="b132S">Ignites at ${igniteThresholdB131(id)-1}% · mastery uses start over</span></div>`;
  else{const b=b132Tier(id,m.lv,n.tier),ok=m.u>=n.uses,short=!ok||S.starPoints<n.stars;
   mid=`${track}<div class="b132Next ${short?'b132Plain':'b132Gold'}"><span class="b132K">TIER ${n.tier} · ${!ok?'NEEDS USES':S.starPoints<n.stars?'NEEDS STARS':'READY'}</span><span class="b132B">${b.name}</span><span class="b132S">${b.desc}</span><span class="b132Req ${ok?'b132Ok':'b132Short'}">${ok?'✓ ':''}${Math.min(m.u,n.uses)}/${n.uses} uses this level</span></div>`}
 }
 const main=step?`<button type="button" id="${step.hold?'b132Main':'b132Why'}" class="${step.hold?'primary':''}">${step.label}<small>${step.sub}</small></button>`:'';
 const equip=unlocked?(eq?`<button type="button" id="b132Equip" disabled>Equipped</button>`:`<button type="button" id="b132Equip">Equip<small>${m?'earns uses':'use it next charge'}</small></button>`):'';
 return `<div class="b132Dh"><span class="b132Ic">${info.icon}</span><h3>${info.name}</h3>${lvTag}</div><p class="b132Sum">${sum}<button type="button" class="b132More" id="b132More">${b132.more?'Less':'More'}</button></p>${mid}${main||equip?`<div class="b132Acts ${main&&equip?'':'one'}">${main}${equip}</div>`:''}`;
}
function renderB132(){
 if(!$('b132')||!S)return;const id=b132Sel();
 $('b132Stars').textContent=`★ ${S.starPoints}`;
 for(const t of $('b132Strip').children){const tid=t.dataset.id;t.innerHTML=b132TileHTML(tid);t.classList.toggle('b132Selected',tid===id);t.classList.toggle('b132Eq',tid===S.overType);t.classList.toggle('b132Locked',!S.overUnlocked.has(tid))}
 const focusId=gamepadMenuB35.focus?.id;
 $('b132Detail').innerHTML=b132DetailHTML(id);
 $('b132More').onclick=()=>{b132.more=!b132.more;renderOverdriveStep()};
 const main=$('b132Main');if(main)main.onclick=()=>{completeOverdriveHoldAction(id);renderOverdriveStep()};
 const why=$('b132Why');if(why)why.onclick=()=>{const s=b132Step(id);showPipMessage(`${s.label.toLowerCase()}. ${s.sub.toLowerCase()}.`,true)};
 const eqb=$('b132Equip');if(eqb&&!eqb.disabled)eqb.onclick=()=>{chooseOverdrive(id);renderOverdriveStep()};
 const cont=$('continueOverdrive');if(cont)cont.innerHTML='Continue ›';
 const keep=focusId&&$(focusId)&&!$(focusId).disabled?$(focusId):focusId?($('b132Main')||$('b132Why')||$('continueOverdrive')):null;
 if(keep&&b132Visible())focusGamepadButtonB35(keep); // re-render keeps the pad cursor, or lands on the main button
 b132RenderRules();
}
const renderOverdriveStepBeforeB132=renderOverdriveStep;
renderOverdriveStep=function(...a){const r=renderOverdriveStepBeforeB132(...a);renderB132();return r};
const openOverdriveStepBeforeB132=openOverdriveStep;
openOverdriveStep=function(...a){b132.sel=S?.overType||'beam';b132.more=false;b132.help=false;const r=openOverdriveStepBeforeB132(...a);
 const first=$('b132Main')||$('b132Why')||$('continueOverdrive');if(first&&b132Visible())focusGamepadButtonB35(first);return r};

// ---- keyboard / gamepad extras: switch skill, Start, Select, Back ----
function b132Cycle(d){const i=OVER_ORDER.indexOf(b132Sel());b132.sel=OVER_ORDER[(i+d+OVER_ORDER.length)%OVER_ORDER.length];b132.more=false;renderOverdriveStep()}
const updateGamepadMenuBeforeB132=updateGamepadMenuB35;
updateGamepadMenuB35=function(...a){
 const r=updateGamepadMenuBeforeB132(...a);if(!b132Visible())return r;
 const pads=navigator.getGamepads?navigator.getGamepads():[];const pad=[...pads].find(p=>p&&p.connected);if(!pad)return r;
 const edge=(i,fn)=>{const on=!!(pad.buttons?.[i]?.pressed);if(on&&!b132.pad[i])fn();b132.pad[i]=on};
 edge(4,()=>b132Cycle(-1));edge(5,()=>b132Cycle(1));
 edge(8,()=>{b132.help=!b132.help;b132RenderRules()});
 edge(9,()=>{if(!b132.help)$('continueOverdrive')?.click()});
 return r;
};
const gamepadBackBeforeB132=gamepadBackActionB35;
gamepadBackActionB35=function(...a){
 if(b132Visible()&&(b132.help||b132.more)){b132.help=false;b132.more=false;renderOverdriveStep();return true}
 return gamepadBackBeforeB132(...a);
};
window.addEventListener('keydown',e=>{
 if(!b132Visible()||e.repeat)return;
 if(e.key==='['||e.key==='q'||e.key==='Q'){b132Cycle(-1);e.preventDefault()}
 else if(e.key===']'||e.key==='e'||e.key==='E'){b132Cycle(1);e.preventDefault()}
 else if(e.key==='Escape'&&(b132.help||b132.more)){b132.help=false;b132.more=false;renderOverdriveStep();e.preventDefault()}
});
