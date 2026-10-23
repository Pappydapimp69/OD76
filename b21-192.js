// B180 Colosseum trophies speed up Overdrive mastery. Every bracket win (colSaveB163.wins, which already counts each
// championship) is a trophy for that rank. In an arena run at that rank, the Overdrive page offers "Use a trophy":
// +5 uses on the selected skill's current tier, and the trophy is spent. Trophies never grant tiers or levels; the
// skill must be unlocked and every tier, level-up and Ascend is still paid in ★. Spent counts live under their own key.
const B180_KEY='od76-trophy-spent-b180',B180_USES=5;
function loadSpentB180(){const s={};for(const k of B108_RANKS)s[k.id]=0;try{const v=JSON.parse(localStorage.getItem(B180_KEY)||'null');for(const k in s){const n=Math.floor(Number(v?.spent?.[k]));if(Number.isFinite(n))s[k]=clamp(n,0,1e6)}}catch(_){}return s}
let spentB180=loadSpentB180();
function saveSpentB180(){try{localStorage.setItem(B180_KEY,JSON.stringify({v:1,spent:spentB180}))}catch(_){}}
function trophiesLeftB180(rank=runRankB108().id){return Math.max(0,(colSaveB163.wins[rank]||0)-(spentB180[rank]||0))}
function trophyTargetB180(id){ // the skill can take uses now: unlocked, mastered skill, on a tier step
 if(!S||!S.overUnlocked?.has(id))return false;const m=masteryB131(id),n=m&&nextStepB131(id);return !!(n&&n.kind==='tier')}
function spendTrophyB180(id){
 if(!S?.stagePending||!trophyTargetB180(id)||trophiesLeftB180()<1)return false;
 const r=runRankB108().id;masteryB131(id).u+=B180_USES;spentB180[r]=(spentB180[r]||0)+1;saveSpentB180();
 if(typeof trackB136==='function')trackB136(['colosseum','trophy-spent',`rank-${r}`,id]);
 return true;
}
B117H_IDS.push('b180Trophy');
const renderB132BeforeB180=renderB132;
renderB132=function(...a){
 const r=renderB132BeforeB180(...a),id=typeof b132Sel==='function'?b132Sel():null,left=trophiesLeftB180(),rk=runRankB108().id;
 const d=$('b132Detail');if(!d||!id||!trophyTargetB180(id)||left<1)return r;
 const b=document.createElement('button');b.type='button';b.id='b180Trophy';b.innerHTML=`🏆 Use a rank ${rk} trophy · +${B180_USES} uses<small>${left} left · still pay ★ for the tier</small>`;
 b.addEventListener('click',()=>{if(spendTrophyB180(id)){showPipMessage?.(`trophy spent. +${B180_USES} uses on ${OVERDRIVE_INFO[id].name}.`,true);renderOverdriveStep()}});
 (d.querySelector('.b132Acts')||d).insertAdjacentElement(d.querySelector('.b132Acts')?'beforebegin':'beforeend',b);
 return r;
};
// B175 must not skip the Overdrive page while a trophy could be spent there.
const outOfOptionsBeforeB180=stepOutOfOptionsB149;
stepOutOfOptionsB149=function(step,...a){if(step==='overdriveStep'&&S&&trophiesLeftB180()>0&&[...(S.overUnlocked||[])].some(trophyTargetB180))return false;return outOfOptionsBeforeB180(step,...a)};
(function styleB180(){const s=document.createElement('style');s.textContent=`
#b132 #b180Trophy{width:100%;min-height:48px;margin:0 0 10px;border:1px solid #ffd36f88;background:#ffd36f14;color:#ffe7a3;border-radius:12px;font-weight:850;cursor:pointer}
#b180Trophy small{display:block;font-weight:600;font-size:11.5px;opacity:.8;margin-top:2px}`;document.head.appendChild(s)})();
