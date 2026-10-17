
// B160 Between-stage screens fill landscape phones and tablets. The stage card was capped at 930px and its normal text
// size, so a wide touch screen showed a small card floating in empty space. On a landscape touch screen the card now
// uses the full width and zooms up (to 1.6×) to the largest size where the whole step still fits, re-fitting when the step or the screen changes.
const B160_MAX_ZOOM=1.6;
function fitStageCardB160(){
 const up=$('stageUp'),card=up?.querySelector(':scope > .card');if(!card)return;
 const touch=typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches,W=innerWidth,H=innerHeight;
 const steps=[...card.querySelectorAll(':scope > [id]')].filter(e=>!e.classList.contains('stagehidden')).map(e=>e.id).join(',');
 const key=up.classList.contains('hidden')||!touch||W<=H?'off':`${W}x${H}|${steps}|${card.querySelectorAll('button').length}`;
 if(key===card.dataset.b160Key)return;card.dataset.b160Key=key;
 card.style.zoom='';card.style.width='';card.style.maxWidth='';
 if(key==='off')return;
 for(let z=B160_MAX_ZOOM;z>.999;z-=.05){
  card.style.zoom=String(z);card.style.width=`${Math.floor(W*.94/z)}px`;card.style.maxWidth='none';
  if(card.scrollHeight*z<=H*.95||z<1.04)return; // a step too tall even at 1× still gets the full width (it scrolls less)
 }
}
setInterval(fitStageCardB160,250);
addEventListener('resize',()=>{const c=$('stageUp')?.querySelector(':scope > .card');if(c)delete c.dataset.b160Key;fitStageCardB160()});
const openStageBeforeB160=openStageUpgrade;
openStageUpgrade=function(...a){const r=openStageBeforeB160(...a);fitStageCardB160();return r};
