// B169 Colosseum sheet you can read at a glance. B163/B167/B168 had grown it into one paragraph of rules and percentages.
// At this moment the player picks a bracket, so the sheet answers only: what a fight costs, what it pays, how to coach,
// and how strong Pip is here. Exact percentages stay on each tree/shrub sheet and in the tutorial.
function rowB169(label,value){return`<div class="b169Row"><span class="b169Label">${label}</span><span class="b169Value">${value}</span></div>`}
function barB169(frac){return`<i class="b169Bar"><b style="width:${Math.round(clamp(frac,0,1)*100)}%"></b></i>`}
function tileB169(label,value,sub){return`<div class="b169Tile"><span class="b169Label">${label}</span><span class="b169Value">${value}</span><small>${sub}</small></div>`}
function colosseumBodyB169(){
 const l=labourB168(),perks=arenaAscB167(),asc=Object.keys(B167_PERKS).filter(id=>perks[id]>0),tro=trophiesB163(),max=fatigueMaxB118();
 return`<span class="b169Lead">Eight Pips, knockout bracket. Win three fights to be champion.</span>`+
  rowB169('Cost',`${fightFatigueB163()} fatigue a fight <small>Pip ${ranchB99.fatigue}/${max}</small>`)+
  rowB169('Prize',`◆ ${B163_PRIZE.join(' · ')} per win <small>× rank</small>`)+
  rowB169('Coach',`${btnB165('focus')} Focus · ${btnB165('ascend')} Ascend · hold ${btnB165('guard')} Guard <small>${btnB165('pause')} pauses</small>`)+
  `<span class="b169Head">Pip's edge here</span><div class="b169Grid">`+
  tileB169('Guard',`${barB169(l.sf)}${l.shrubs}/${l.sTot}`,'shrubs cut')+
  tileB169('Ascension',`${barB169(l.tf)}${l.trees}/${l.tTot}`,'trees felled')+
  tileB169('Arena skills',asc.length?asc.map(id=>`${B167_PERKS[id].skill} ✦${perks[id]}`).join(' · '):'none yet',asc.length?'Ascended in the arena':'Ascend skills in the arena')+
  tileB169('Trophies',`🏆 ${tro}`,'boost Ascension here')+`</div>`;
}
function bracketLabelB169(i){
 const r=B108_RANKS[i],wins=colSaveB163.wins[r.id],best=colSaveB163.best[r.id];
 return`Rank ${r.id} · prizes ×${r.reward}${wins?` · 🏆 ×${wins}`:best?` · best: ${best} win${best>1?'s':''}`:''}`;
}
const openSheetBeforeB169=openSheetB100;
openSheetB100=function(title,text,options,...rest){
 const col=title==='Colosseum ⚔'&&typeof text==='string'&&/single elimination/.test(text);
 if(col&&Array.isArray(options))options=options.map(o=>{const m=/^Rank ([A-Z]) bracket/.exec(o.label||'');if(!m)return o;const i=B108_RANKS.findIndex(r=>r.id===m[1]);return i<0?o:{...o,label:bracketLabelB169(i)}});
 const r=openSheetBeforeB169(title,col?'':text,options,...rest);
 const p=$('ranchSheetB100')?.querySelector('p');
 if(p){p.classList.toggle('b169',col);if(col)p.innerHTML=colosseumBodyB169()}
 return r;
};
(function styleB169(){const s=document.createElement('style');s.textContent=`
#ranchSheetB100 p.b169{display:grid;gap:3px;margin:0 0 4px;font-size:13px;line-height:1.3}
#ranchSheetB100 .b169Lead{color:#eadfc8;font-size:14px;margin-bottom:2px}
#ranchSheetB100 .b169Head{margin-top:5px;color:#e2b866;font-size:11px;letter-spacing:3px;text-transform:uppercase}
#ranchSheetB100 .b169Row{display:grid;grid-template-columns:62px 1fr;gap:8px;align-items:baseline;padding:2px 0;border-top:1px solid #6e553140}
#ranchSheetB100 .b169Label{color:#a8977a;font-size:12px;letter-spacing:.5px}
#ranchSheetB100 .b169Value{color:#eadfc8;font-weight:700}
#ranchSheetB100 .b169Value small,#ranchSheetB100 .b169Tile small{color:#a8977a;font-weight:400;font-size:11px}
#ranchSheetB100 .b169Grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
#ranchSheetB100 .b169Tile{display:grid;gap:1px;padding:4px 6px;border:1px solid #6e553160;background:#00000030}
#ranchSheetB100 .b169Bar{display:inline-block;vertical-align:middle;width:48px;height:7px;margin-right:6px;background:#0b0807;border:1px solid #6e5531}
#ranchSheetB100 .b169Bar b{display:block;height:100%;background:linear-gradient(90deg,#b8863b,#e2b866)}
@media (max-height:600px){#ranchSheetB100 .b169Tile small,#ranchSheetB100 .b169Lead{display:none}#ranchSheetB100 p.b169{font-size:12px}}`;document.head.appendChild(s)})();
