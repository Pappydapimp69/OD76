// B175 Between stages, a page with nothing to buy is skipped (Traits, Hearts, Sound Lab, Overdrive, Merchant; Boss Bond is a
// free pick and always shows). The step counter counts only pages that show, a shown page says what was skipped, and
// Head out lists every skipped page under "Saving up for": its cheapest next cost, a progress bar, how much more is
// needed and a Peek button. Peek opens the page look-only (its Continue hidden); "Back to Head out" is a plain tap.
const B175_PAGES={
 emotionStep:{name:'Traits',go:()=>skipPipUpgrade(),render:()=>renderEmotionButtons(),
  goal:()=>{const open=['upLove','upCompassion','upSupport'].some(id=>$(id)&&!/MAX/.test($(id).textContent));return open?{icon:'◆',have:S.prismSeeds||0,cost:pipPrismCost()}:null}},
 abilityStep:{name:'Hearts',go:()=>openPipSoundStepB26(),render:()=>renderAbilityShop(),
  goal:()=>{const ids={range:'abilityRange',speed:'abilitySpeed',power:'abilityPower',guard:'abilityGuard'},c=Object.keys(ids).filter(k=>$(ids[k])&&!/MAX/.test($(ids[k]).textContent)).map(k=>pipAbilityCost(k));return c.length?{icon:'♥',have:S.heartCurrency||0,cost:Math.min(...c)}:null}},
 pipSoundStep:{name:'Sound Lab',go:()=>continueSoundLabB41(),render:()=>renderPipSoundStepB26(),
  goal:()=>({icon:'♪',have:S.musicNotes||0,text:'notes come as Pip levels up'})},
 overdriveStep:{name:'Overdrive',go:()=>continueOverdriveChoice(),render:()=>renderOverdriveStep(),
  goal:()=>{const c=OVER_ORDER.map(id=>{if(!S.overUnlocked.has(id))return OVERDRIVE_INFO[id].unlock;const m=masteryB131(id);if(!m)return overLevel(id)<5?overUpgradeCost(id):Infinity;const n=nextStepB131(id);return n.kind==='done'?Infinity:n.stars}).filter(Number.isFinite);return c.length?{icon:'★',have:S.starPoints||0,cost:Math.min(...c)}:null}},
 arenaMerchantB118:{name:'Merchant',go:()=>resolveMerchantB118(false),render:()=>renderMerchantB118(),
  out:()=>(S.heartCurrency||0)<merchantPriceB175(),goal:()=>({icon:'♥',have:S.heartCurrency||0,cost:merchantPriceB175()})}
};
function merchantPriceB175(){const snack=(S?.b118SnackBought||0)<B118_SNACK_PRICES.length?snackPriceB118():Infinity;return Math.min(snack,B126_DUST_PRICE)}
function skipStateB175(){if(!S)return null;if(!S.b175||S.b175.stage!==S.stage)S.b175={stage:S.stage,skipped:[],peek:null};return S.b175}
function skipEmptyB175(){
 const st=skipStateB175();if(!st||!S.stagePending||st.peek||$('stageUp')?.classList.contains('hidden'))return;
 for(const [id,p] of Object.entries(B175_PAGES)){
  const el=$(id);if(!el||el.classList.contains('stagehidden'))continue;
  if(!(p.out?p.out():stepOutOfOptionsB149(id)))return;
  if(!st.skipped.includes(id))st.skipped.push(id);
  p.go();return; // the next page's class change wakes the observer again
 }
}
const observerB175=new MutationObserver(()=>{try{skipEmptyB175();decorateSkipsB175()}catch(_){}});
for(const id of [...Object.keys(B175_PAGES),'ranchGateStepB99','stageUp'])if($(id))observerB175.observe($(id),{attributes:true,attributeFilter:['class']});
const openStageBeforeB175=openStageUpgrade;
openStageUpgrade=function(...a){if(S)S.b175=null;skipStateB175();return openStageBeforeB175(...a)};

// Step counter: pages already skipped drop out of the count.
const stepsBeforeB175=stepsB136;
stepsB136=function(...a){const gone=(skipStateB175()?.skipped||[]).map(id=>B175_PAGES[id].name);return stepsBeforeB175(...a).filter(n=>!gone.includes(n))};

function goalTextB175(id){
 const p=B175_PAGES[id],g=p.goal();if(!g)return{need:'All bought',pct:1};
 if(g.text)return{need:`${g.icon} ${g.have} · ${g.text}`,pct:null};
 return{need:`${g.icon} ${g.cost} · ${Math.max(0,g.cost-g.have)} more`,pct:clamp(g.have/g.cost,0,1)};
}
function decorateSkipsB175(){
 const st=skipStateB175();if(!st||$('stageUp')?.classList.contains('hidden'))return;
 const names=st.skipped.map(id=>B175_PAGES[id].name),list=names.length>1?names.slice(0,-1).join(', ')+' and '+names.at(-1):names[0];
 // a page that shows says what was skipped
 for(const id of [...Object.keys(B175_PAGES),'bossRewardStep']){
  const el=$(id);if(!el)continue;let note=el.querySelector(':scope > .b175Note');
  const on=!!names.length&&!el.classList.contains('stagehidden')&&!st.peek;
  if(on&&!note){note=document.createElement('div');note.className='b175Note';el.querySelector(':scope > h2, :scope > h3')?.insertAdjacentElement('afterend',note)||el.prepend(note)}
  if(note){const t=on?`Skipped ${list}, nothing to buy yet. They're listed on Head out.`:'';if(note.textContent!==t)note.textContent=t;note.style.display=on?'':'none'}
 }
 // Head out: Saving up for
 const gate=$('ranchGateStepB99');if(!gate)return;
 let box=$('b175Saving');
 if(!box){box=document.createElement('div');box.id='b175Saving';(gate.querySelector('#ranchGateMetersB115')||gate.querySelector('.b99Actions'))?.insertAdjacentElement(gate.querySelector('#ranchGateMetersB115')?'afterend':'beforebegin',box)}
 box.style.display=names.length?'':'none';
 const sig=st.skipped.map(id=>id+JSON.stringify(goalTextB175(id))).join('|');
 if(box.dataset.sig===sig)return;box.dataset.sig=sig;
 box.innerHTML=`<div class="b175Head"><span>Saving up for</span><span>${names.length} page${names.length===1?'':'s'} skipped</span></div>`+st.skipped.map(id=>{const g=goalTextB175(id);
  return`<div class="b175Row"><div class="b175Info"><div class="b175Line"><b>${B175_PAGES[id].name}</b><span>${g.need}</span></div>${g.pct===null?'':`<div class="b175Bar"><i style="width:${Math.round(g.pct*100)}%"></i></div>`}</div><button type="button" class="b175Peek" data-page="${id}">Peek</button></div>`}).join('');
 for(const b of box.querySelectorAll('.b175Peek'))b.addEventListener('click',()=>peekB175(b.dataset.page));
}
function peekB175(id){
 const st=skipStateB175(),el=$(id),gate=$('ranchGateStepB99');if(!st||!el||!gate||!S.stagePending)return;
 st.peek=id;gate.classList.add('stagehidden');el.classList.remove('stagehidden');el.classList.add('b175Peeking');
 try{B175_PAGES[id].render()}catch(_){}
 let back=$('b175Back');if(!back){back=document.createElement('button');back.type='button';back.id='b175Back';back.className='primary';back.textContent='Back to Head out';back.addEventListener('click',unpeekB175)}
 el.appendChild(back);back.style.display='';focusGamepadButtonB35?.(back);decorateSkipsB175();
}
function unpeekB175(){
 const st=skipStateB175();if(!st?.peek)return;const el=$(st.peek);
 el?.classList.add('stagehidden');el?.classList.remove('b175Peeking');$('b175Back')?.remove();
 $('ranchGateStepB99')?.classList.remove('stagehidden');st.peek=null;decorateSkipsB175();
 const n=$('nextStageB99');if(n&&!n.disabled)focusGamepadButtonB35?.(n);
}
setInterval(decorateSkipsB175,250);
(function styleB175(){const s=document.createElement('style');s.textContent=`
.b175Note{margin:6px 0 8px;padding:8px 10px;border-radius:12px;border:1px solid #7ed8ff33;background:#0a2532;color:#9ddfff;font-size:12px}
#b175Saving{margin:10px 0 6px;padding:10px 12px;border:1px solid var(--line);border-radius:14px;background:#ffffff06}
.b175Head{display:flex;justify-content:space-between;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#b9c7ef;margin-bottom:6px}.b175Head span+span{letter-spacing:0;text-transform:none;color:var(--muted)}
.b175Row{display:flex;align-items:center;gap:10px;margin-top:8px}.b175Info{flex:1;min-width:0}
.b175Line{display:flex;justify-content:space-between;gap:8px;font-size:13px}.b175Line span{color:#ff9fba;white-space:nowrap}
.b175Bar{height:5px;border-radius:999px;background:#ffffff10;overflow:hidden;margin-top:5px}.b175Bar i{display:block;height:100%;background:linear-gradient(90deg,var(--gold),var(--hot))}
.b175Peek{min-width:60px;min-height:44px;border:1px solid var(--line);border-radius:12px;background:#ffffff06;color:#c9f3ff;font-weight:850;font-size:12px;cursor:pointer}
.b175Peeking #skipPipUpgrade,.b175Peeking #continueAbilities,.b175Peeking #continuePipSounds,.b175Peeking #continueSoundLabB41,.b175Peeking #continueOverdrive,.b175Peeking #enterMerchantB126,.b175Peeking #leaveMerchantB118,.b175Peeking .b149Banner{display:none!important}
.b175Peeking .upgradegrid,.b175Peeking .abilitygrid,.b175Peeking #pipSoundGrid,.b175Peeking #b132Detail{pointer-events:none}
#b175Back{margin-top:10px}`;document.head.appendChild(s)})();
