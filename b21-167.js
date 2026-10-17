
// B150 Purchase feedback in the shops. Buying at the ranch stall (food, soap, tools) or from the Arena Merchant (snacks,
// Star Dust) now plays a soft two-note chime and pops a "+1 icon name" badge that floats up and fades over the shop,
// with a brief gold flash on the shop panel. Silent when sound is off; the pop still shows.
function purchaseFxB150(icon,label,anchor){
 if(!S||S.audioEnabled!==false){try{tone(880,.07,.02,'triangle');setTimeout(()=>tone(1320,.1,.018,'triangle'),70)}catch(_){}}
 const host=anchor&&anchor.isConnected&&getComputedStyle(anchor).display!=='none'&&!anchor.closest('.hidden,.stagehidden')?anchor:document.body;
 const pop=document.createElement('div');pop.className='b150Pop';pop.textContent=`+ ${icon} ${label}`;
 if(host===document.body){pop.style.position='fixed';pop.style.left='50%';pop.style.top='45%'}
 else{const cs=getComputedStyle(host);if(cs.position==='static')host.style.position='relative'}
 host.appendChild(pop);setTimeout(()=>pop.remove(),1100);
 if(host!==document.body){host.classList.remove('b150Flash');void host.offsetWidth;host.classList.add('b150Flash');setTimeout(()=>host.classList.remove('b150Flash'),500)}
}
const buyItemBeforeB150=buyItemB104;
buyItemB104=function(id,n=1,...a){const ok=buyItemBeforeB150(id,n,...a);if(ok){const it=itemInfoB104(id)||{};purchaseFxB150(it.icon||'•',`${n>1?n+' × ':''}${it.name||id}`,$('ranchSheetB100'))}return ok};
const buyToolBeforeB150=buyToolB105;
buyToolB105=function(id,...a){const ok=buyToolBeforeB150(id,...a);if(ok){const t=B105_TOOLS[id]||{};purchaseFxB150(t.icon||'🛠',t.name||id,$('ranchSheetB100'))}return ok};
const buySnackBeforeB150=buySnackB118;
buySnackB118=function(...a){const ok=buySnackBeforeB150(...a);if(ok)purchaseFxB150('🍪','Arena snack',$('arenaMerchantB118'));return ok};
const buyDustBeforeB150=buyArenaDustB126;
buyArenaDustB126=function(...a){const ok=buyDustBeforeB150(...a);if(ok)purchaseFxB150('✧','Star Dust',$('arenaMerchantB118'));return ok};
(function styleB150(){const s=document.createElement('style');s.textContent=`
.b150Pop{position:absolute;left:50%;top:38%;transform:translate(-50%,0);z-index:30;pointer-events:none;white-space:nowrap;padding:7px 14px;border-radius:999px;background:#ffd36f;color:#3a2a00;font:900 15px system-ui;box-shadow:0 6px 20px #0005;animation:b150Rise 1.05s ease-out forwards}
@keyframes b150Rise{0%{opacity:0;transform:translate(-50%,10px) scale(.8)}15%{opacity:1;transform:translate(-50%,0) scale(1.08)}30%{transform:translate(-50%,-6px) scale(1)}100%{opacity:0;transform:translate(-50%,-46px) scale(1)}}
.b150Flash{animation:b150Flash .5s ease-out}
@keyframes b150Flash{0%{box-shadow:0 0 0 0 #ffd36fcc}100%{box-shadow:0 0 0 14px #ffd36f00}}
#arenaMerchantB118 #enterMerchantB126::after,#arenaMerchantB118 #leaveMerchantB118::after,#arenaMerchantB118 #exitMerchantB126::after{content:'HOLD TO CONFIRM';display:block} /* B138 made these holds again */`;document.head.appendChild(s)})();
