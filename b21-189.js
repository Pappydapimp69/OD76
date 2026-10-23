// B177 Full upgrade text between stages. Trait, Heart and Boss Bond cards clamp their effect to 2 lines (B135/B136); a
// detail line under each grid now shows the whole effect of the card last touched, focused (keyboard / gamepad) or
// hovered, starting with the first card. Reading never buys: a touch only starts the usual hold.
const B177_GRIDS={emotionStep:'.upgradegrid',abilityStep:'.abilitygrid',bossRewardStep:'.bossgrid'};
function detailCardB177(card){
 const step=card?.closest?.('#emotionStep,#abilityStep,#bossRewardStep'),line=step?.querySelector('.b177Detail');if(!line||!card.matches('.upgrade'))return;
 const name=card.querySelector('b')?.textContent.trim()||'',meta=card.querySelector('.b117meta')?.textContent.trim()||'',body=card.querySelector('.small')?.textContent.trim()||'';
 const t=[name,meta].filter(Boolean).join(' · ');line.dataset.card=card.id||'';
 const b=line.querySelector('b'),s=line.querySelector('span');if(b.textContent!==t)b.textContent=t;if(s.textContent!==body)s.textContent=body;
}
function decorateDetailB177(){
 for(const [id,sel] of Object.entries(B177_GRIDS)){
  const step=$(id),grid=step?.querySelector(sel);if(!grid)continue;
  let line=step.querySelector('.b177Detail');
  if(!line){line=document.createElement('div');line.className='b177Detail';line.setAttribute('aria-live','polite');line.innerHTML='<b></b><span></span>';grid.insertAdjacentElement('afterend',line);
   for(const ev of ['pointerdown','focusin','mouseover'])grid.addEventListener(ev,e=>detailCardB177(e.target.closest?.('.upgrade')),true)}
  if(step.classList.contains('stagehidden'))continue;
  const cards=[...grid.querySelectorAll('.upgrade')].filter(c=>c.style.display!=='none');
  const cur=cards.find(c=>c.id&&c.id===line.dataset.card)||cards[0];
  if(cur)detailCardB177(cur); // re-read: levels and costs change after a buy
 }
}
const focusPadBeforeB177=focusGamepadButtonB35;
focusGamepadButtonB35=function(btn,...a){const r=focusPadBeforeB177(btn,...a);detailCardB177(btn);return r};
setInterval(decorateDetailB177,200);
const openStageBeforeB177=openStageUpgrade;
openStageUpgrade=function(...a){const r=openStageBeforeB177(...a);for(const l of document.querySelectorAll('.b177Detail'))l.dataset.card='';decorateDetailB177();return r};
(function styleB177(){const s=document.createElement('style');s.textContent=`
.b177Detail{margin:-4px 0 10px;padding:8px 11px;border:1px solid var(--line);border-radius:12px;background:#ffffff06;font-size:12.5px;line-height:1.35;color:#cdd5e0}
.b177Detail b{display:block;font-size:12px;color:#ffe7a3;margin-bottom:2px}
.b175Peeking .b177Detail{display:block}`;document.head.appendChild(s)})();
