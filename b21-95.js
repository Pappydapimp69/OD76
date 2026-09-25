
// B107 Refinery on the stage-end gate: while choosing Next stage or Return to ranch,
// a live line shows what the Heart Refinery is doing back home.
function refineryGateTextB107(now=Date.now()){
 tickRefineryB102(now);
 const f=ranchB99.refinery,T=refineSecondsB102(f.level)*1000;
 const tray=f.trayStones||f.trayDust?`Tray ready: ◆ ${f.trayStones}${f.trayDust?` · ✧ ${f.trayDust}`:""}.`:"";
 if(!f.queue)return tray?`Heart Refinery: idle. ${tray}`:"";
 const next=refineLeftB102(now),all=next+(f.queue-1)*T;
 return`Heart Refinery: next ◆ in ${clockB102(next)}${f.queue>1?` · ${f.queue} batches, all done in ${clockB102(all)}`:""}.${tray?" "+tray:""}`;
}
(function installGateRefineryB107(){
 const text=$("ranchGateTextB99");if(!text)return;
 const line=document.createElement("p");line.id="ranchGateRefineB107";line.className="small";line.style.cssText="color:#ffd8e6;margin-top:-4px";
 text.insertAdjacentElement("afterend",line);
})();
function renderGateRefineryB107(){
 const line=$("ranchGateRefineB107");if(!line)return;
 const open=!$("stageUp")?.classList.contains("hidden")&&!$("ranchGateStepB99")?.classList.contains("stagehidden");
 if(!open)return;
 const t=refineryGateTextB107();line.textContent=t;line.style.display=t?"":"none";
}
const gateBeforeB107=openRanchGateB99;
openRanchGateB99=function(){gateBeforeB107();renderGateRefineryB107()};
setInterval(renderGateRefineryB107,500);
