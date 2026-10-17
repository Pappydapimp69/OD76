
// B158 Refinery makeover. The Heart Refinery sheet was one long paragraph above a stack of long buttons. It now shows a
// header (level, speed per stone), what you hold, and one card per job: Tray, Hearts → Heart Stones, Star Dust → Star
// Stones and Upgrade. Each card carries its own buttons, a live progress bar and the reason when nothing can start. The
// timers tick while the sheet is open, and it redraws itself (keeping the focused button) when a stone or star lands.
// The old paragraph stays in the DOM, hidden, so earlier text hooks keep working; option labels are unchanged.
const B158_SECTIONS=[['tray',/^Collect /],['refine',/^Refine /],['fuse',/^Fuse /],['upgrade',/^Upgrade refinery/]];
const B158_ORDER=['tray','refine','fuse','upgrade','foot'];
function refineSectionB158(label){for(const [k,re] of B158_SECTIONS)if(re.test(label||''))return k;return 'foot'}
function refineryOpenB158(){const el=$('ranchSheetB100');return !!(ranchWorldB100?.sheet&&el?.classList.contains('b158'))}
function refineSignB158(){const r=ranchB99,f=r.refinery,u=fuseStateB156();return [f.level,f.queue,f.trayStones,f.trayDust,f.upgradeTo,u.queue,r.hearts,r.dust,r.starStones].join('|')}
function shortLabelB158(label){
 return label.replace(/^Collect .*/,'Collect').replace(/ · takes \d+ min$/,'').replace(/ · \d+ min each$/,'')
  .replace(/^Upgrade refinery → Lv (\d+) · ★ (\d+) .*/,'Upgrade → Lv $1 · ★ $2');
}
(function installRefineryStyleB158(){
 const s=document.createElement('style');s.textContent=`
#ranchSheetB100.b158{width:min(460px,94vw);padding:14px}
#ranchSheetB100.b158>p{display:none}
.b158top{display:flex;align-items:center;gap:8px;margin-bottom:8px}.b158top h3{margin:0!important;flex:1}
.b158badge{padding:3px 9px;border-radius:999px;background:#efe7ff;color:#6a54c9;font:800 12px system-ui;white-space:nowrap}
.b158wallet{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px}
.b158coin{padding:5px 4px;border-radius:12px;background:#fff;border:1.5px solid #efe6f7;text-align:center;font:800 14px system-ui;color:#4b4470}
.b158coin small{display:block;font:600 10px system-ui;color:#9a9cb5;margin-top:1px}
.b158card{padding:10px 12px;border-radius:16px;background:#fff;border:1.5px solid #efe6f7;margin-bottom:8px}
.b158card.tray{background:#fff4d6;border-color:#ffd98a}
.b158card .hd{display:flex;align-items:baseline;gap:8px;font:800 14px system-ui;color:#4b4470}
.b158card .hd span{margin-left:auto;font:700 12px system-ui;color:#8c8fab;white-space:nowrap}
.b158card .sub{font:12px/1.35 system-ui;color:#8c8fab;margin-top:2px}
.b158bar{height:10px;border-radius:99px;background:#f1ecfa;margin:8px 0 4px;overflow:hidden}
.b158bar i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,#ffb7cf,#ff8fb6)}
.b158card.fuse .b158bar i{background:linear-gradient(90deg,#cfc2ff,#9f86ff)}
.b158card.upgrade .b158bar i{background:linear-gradient(90deg,#bfe9d2,#6fcf9f)}
.b158row{display:flex;justify-content:space-between;gap:8px;font:700 12px system-ui;color:#5a5d78}
.b158need{margin-top:6px;padding:6px 9px;border-radius:10px;background:#fff0f3;color:#c0567a;font:700 12px system-ui}
.b158cmp{display:grid;grid-template-columns:auto 1fr auto 1fr;gap:2px 8px;margin-top:6px;font:12px system-ui;color:#8c8fab}
.b158cmp b{color:#4b4470}.b158cmp em{font-style:normal;color:#3d9a6c;font-weight:800}
.b158btns{display:flex;flex-wrap:wrap;gap:6px}.b158btns button{flex:1 1 140px;margin-top:8px!important;padding:9px 8px!important;font-size:13px!important}
.b158foot button{margin-top:6px!important}`;
 document.head.appendChild(s);
})();
const openSheetBeforeB158=openSheetB100;
openSheetB100=function(...a){$('ranchSheetB100')?.classList.remove('b158');return openSheetBeforeB158(...a)}; // the card layout is the refinery's only
const refinerySheetBeforeB158=refinerySheetB102;
refinerySheetB102=function(...a){
 const open=openSheetB100;
 openSheetB100=function(title,text,options,...rest){
  if(title==='Heart Refinery'&&Array.isArray(options))options=options.map((o,i)=>[o,i]).sort((x,y)=>B158_ORDER.indexOf(refineSectionB158(x[0].label))-B158_ORDER.indexOf(refineSectionB158(y[0].label))||x[1]-y[1]).map(x=>x[0]);
  return open(title,text,options,...rest);
 };
 let r;try{r=refinerySheetBeforeB158(...a)}finally{openSheetB100=open}
 decorateRefineryB158();
 return r;
};
function decorateRefineryB158(){
 const el=$('ranchSheetB100'),w=ranchWorldB100,h=el?.querySelector('h3');
 if(!el||!w?.sheet||h?.textContent!=='Heart Refinery'||el.classList.contains('b158'))return;
 el.classList.add('b158');
 const top=document.createElement('div');top.className='b158top';h.before(top);top.append(h);
 const badge=document.createElement('span');badge.className='b158badge';top.append(badge);
 const wallet=document.createElement('div');wallet.className='b158wallet';top.after(wallet);
 const cards={},titles={tray:'Ready to collect',refine:'Hearts → Heart Stones',fuse:'Star Dust → Star Stones',upgrade:'Upgrade'};
 let after=wallet;
 for(const k of B158_ORDER){
  const c=document.createElement('div');c.className=k==='foot'?'b158foot':`b158card ${k}`;
  if(k!=='foot')c.innerHTML=`<div class="hd">${titles[k]}<span></span></div><div class="sub"></div><div class="b158bar"><i></i></div><div class="b158row"><span></span><span></span></div><div class="b158need"></div><div class="b158cmp"></div><div class="b158btns"></div>`;
  after.after(c);after=c;cards[k]=c;
 }
 [...el.querySelectorAll(':scope > button')].forEach((b,i)=>{const o=w.sheet.options[i],k=refineSectionB158(o?.label);
  if(k!=='foot'){b.textContent=shortLabelB158(o.label);cards[k].querySelector('.b158btns').append(b)}else cards.foot.append(b)});
 w.b158Sign=refineSignB158();
 updateRefineryB158();
}
function showB158(n,on){if(n)n.style.display=on?'':'none'}
function updateRefineryB158(now=Date.now()){
 const el=$('ranchSheetB100');if(!refineryOpenB158())return;
 const r=ranchB99,f=r.refinery,u=fuseStateB156(),lv=f.level,T=refineSecondsB102(lv)*1000,max=B102_REFINERY_MAX;
 const q=s=>el.querySelector(s),set=(n,t)=>{if(n&&n.textContent!==t)n.textContent=t},card=k=>q(`.b158card.${k}`);
 set(q('.b158badge'),`Lv ${lv}/${max} · ${refineLabelB102(lv)}/stone`);
 const wallet=q('.b158wallet');if(wallet){const html=[['♥',r.hearts,'Hearts'],['◆',r.stones,'Heart Stones'],['✧',r.dust,'Star Dust'],['★',r.starStones,'Star Stones']].map(([i,n,t])=>`<div class="b158coin">${i} ${n}<small>${t}</small></div>`).join('');if(wallet.innerHTML!==html)wallet.innerHTML=html}
 const fill=(c,p,on)=>{const b=c.querySelector('.b158bar');showB158(b,on);if(on)b.firstChild.style.width=`${Math.round(clamp(p,0,1)*100)}%`};
 const row=(c,l,rt)=>{const s=c.querySelectorAll('.b158row span');showB158(c.querySelector('.b158row'),!!(l||rt));set(s[0],l||'');set(s[1],rt||'')};
 const need=(c,t)=>{const n=c.querySelector('.b158need');showB158(n,!!t);set(n,t||'')};
 const btns=c=>c.querySelectorAll('.b158btns button').length;
 for(const c of el.querySelectorAll('.b158card'))showB158(c.querySelector('.b158cmp'),false);
 // tray
 const tray=card('tray');if(tray){const has=f.trayStones||f.trayDust;showB158(tray,has||btns(tray));
  set(tray.querySelector('.sub'),`◆ ${f.trayStones} Heart Stone${f.trayStones===1?'':'s'}${f.trayDust?` · ✧ ${f.trayDust} Star Dust`:''}`);fill(tray,0,false);row(tray);need(tray)}
 // refine
 const ref=card('refine');if(ref){const min=refineMinBatchesB155(lv),k=refinerySlotsB117f(lv);
  set(ref.querySelector('.hd span'),f.queue?`${f.queue} in the machine`:'Idle');
  set(ref.querySelector('.sub'),`♥ ${B102_HEARTS_PER_STONE} per stone · ${refineLabelB102(lv)} each · ${k} at a time · ${Math.round(B102_DUST_CHANCE*100)}% chance of ✧`);
  const left=refineLeftB102(now);fill(ref,1-left/T,f.queue>0);
  row(ref,f.queue?`Next ◆ in ${clockB102(left)}`:'',f.queue>1?`All done in ${clockB102(refineAllLeftB117f(now))}`:'');
  need(ref,btns(ref)?'':`${f.queue?'To load more: n':'N'}eeds ♥ ${min*B102_HEARTS_PER_STONE} · you have ♥ ${r.hearts}. Battle tests earn hearts.`)}
 // fuse
 const fu=card('fuse');if(fu){const per=B156_FUSE_SECONDS*1000,left=u.queue?Math.max(0,u.startedAt+per-now):0;
  set(fu.querySelector('.hd span'),u.queue?`${u.queue} fusing`:'Idle');
  set(fu.querySelector('.sub'),`✧ ${B102_DUST_PER_STAR} → ★ 1 · ${B156_FUSE_SECONDS/60} min each · you start it`);
  fill(fu,1-left/per,u.queue>0);row(fu,u.queue?`Next ★ in ${clockB102(left)}`:'',u.queue>1?`All done in ${clockB102(left+(u.queue-1)*per)}`:'');
  need(fu,btns(fu)||u.queue?'':`Needs ✧ ${B102_DUST_PER_STAR} · you have ✧ ${r.dust}. Refining sometimes drops ✧.`)}
 // upgrade
 const up=card('upgrade');if(up){const busy=refineryUpgradingB151(f),cmp=up.querySelector('.b158cmp');
  if(busy){const tot=upgradeSecondsB151(f.upgradeTo)*1000,left=Math.max(0,f.upgradeUntil-now);
   set(up.querySelector('.hd span'),`→ Lv ${f.upgradeTo}`);set(up.querySelector('.sub'),`Still refining at ${refineLabelB102(lv)}/stone meanwhile.`);
   fill(up,1-left/tot,true);row(up,`Ready in ${clockB102(left)}`,'');need(up)}
  else if(lv>=max){set(up.querySelector('.hd span'),'Max level');set(up.querySelector('.sub'),`Lv ${max} is the top for now.`);fill(up,0,false);row(up);need(up)}
  else{const to=lv+1,cost=refineryUpgradeCostB102(lv),a=refineMinHeartsB155(lv),b=refineMinHeartsB155(to),s0=refinerySlotsB117f(lv),s1=refinerySlotsB117f(to);
   set(up.querySelector('.hd span'),`Lv ${lv} → Lv ${to}`);set(up.querySelector('.sub'),`★ ${cost} · takes ${upgradeLabelB151(to)} · keeps refining while it builds`);
   fill(up,0,false);row(up);
   const html=`<span>Speed</span><b>${refineLabelB102(lv)}</b><span>→</span><em>${refineLabelB102(to)}/stone</em><span>Starts at</span><b>♥ ${a}</b><span>→</span><b>♥ ${b}</b>${s1>s0?`<span>At a time</span><b>${s0}</b><span>→</span><em>${s1}</em>`:''}`;
   if(cmp.innerHTML!==html)cmp.innerHTML=html;showB158(cmp,true);
   need(up,btns(up)?'':`Needs ★ ${cost} · you have ★ ${r.starStones}. Fuse Star Dust into ★.`)}}
}
const updateRanchBeforeB158=updateRanchB100;
updateRanchB100=function(dt,...a){
 const out=updateRanchBeforeB158(dt,...a),w=ranchWorldB100;
 if(w?.active&&refineryOpenB158()&&(w.b158T=(w.b158T||0)+dt)>.25){w.b158T=0;
  tickRefineryB102();
  if(refineSignB158()!==w.b158Sign){const i=w.sheet.focus;refinerySheetB102();if(ranchWorldB100.sheet)focusSheetB100(i)}
  else updateRefineryB158();
 }
 return out;
};
const focusSheetBeforeB158=focusSheetB100;
focusSheetB100=function(...a){const out=focusSheetBeforeB158(...a);if(refineryOpenB158())$('ranchSheetB100').querySelector('button.focus')?.scrollIntoView?.({block:'nearest'});return out}; // gamepad focus can sit below the fold on phones
