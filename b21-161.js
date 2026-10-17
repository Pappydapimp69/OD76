
// B144 Tools wear out. The axe and the sickle are each good for 5 clears; the fifth breaks the tool and it's
// discarded (buy another at the stall). Uses left are saved with the ranch (missing/invalid → full) and shown in the
// bag. Garden tools don't wear.
const B144_WEAR_TOOLS=['axe','sickle'],B144_TOOL_USES=5;
function rawRanchB144(){try{const v=JSON.parse(localStorage.getItem(B99_RANCH_KEY)||'null');return v&&typeof v==='object'?v:null}catch(_){return null}}
function toolWearFieldsB144(r,raw){
 r.toolUses={};
 for(const k of B144_WEAR_TOOLS){const n=Math.floor(Number(raw?.toolUses?.[k]));r.toolUses[k]=r.tools?.[k]?(n>=1&&n<=B144_TOOL_USES?n:B144_TOOL_USES):0}
 return r;
}
const ranchDefaultBeforeB144=ranchDefaultB99;
ranchDefaultB99=function(...a){return toolWearFieldsB144(ranchDefaultBeforeB144(...a),null)};
const loadRanchBeforeB144=loadRanchB99;
loadRanchB99=function(...a){return toolWearFieldsB144(loadRanchBeforeB144(...a),rawRanchB144())};
toolWearFieldsB144(ranchB99,rawRanchB144());
function toolUsesB144(k){return B144_WEAR_TOOLS.includes(k)?(ranchB99.tools?.[k]?(ranchB99.toolUses?.[k]||B144_TOOL_USES):0):null}

const buyToolBeforeB144=buyToolB105;
buyToolB105=function(id,...a){const ok=buyToolBeforeB144(id,...a);if(ok&&B144_WEAR_TOOLS.includes(id)){ranchB99.toolUses=ranchB99.toolUses||{};ranchB99.toolUses[id]=B144_TOOL_USES;saveRanchB99()}return ok};

const clearObstacleBeforeB144=clearObstacleB106;
clearObstacleB106=function(id,...a){
 const o=obstacleB106(id),tool=o?(o.tree?'axe':'sickle'):null,ok=clearObstacleBeforeB144(id,...a);
 if(ok&&tool&&ranchB99.tools[tool]){
  ranchB99.toolUses=ranchB99.toolUses||{};const left=Math.max(0,(ranchB99.toolUses[tool]||B144_TOOL_USES)-1);ranchB99.toolUses[tool]=left;
  const name=B105_TOOLS[tool]?.name||tool;
  if(left<=0){ranchB99.tools[tool]=false;ranchToastB100?.(`The ${name.toLowerCase()} broke and was tossed. Buy a new one at the stall.`,2.4)}
  else if(left===1)ranchToastB100?.(`The ${name.toLowerCase()} is nearly worn out · 1 use left.`,1.8);
  saveRanchB99();
 }
 return ok;
};

const bagRowsBeforeB144=bagRowsB143;
bagRowsB143=function(...a){
 const rows=bagRowsBeforeB144(...a);
 for(const r of rows){if(!r.tool)continue;const k=Object.keys(B105_TOOLS).find(k=>B105_TOOLS[k].name===r.name);const n=toolUsesB144(k);if(n!=null){r.count=null;r.uses=`${n}/${B144_TOOL_USES}`;r.what+=` · ${n} use${n===1?'':'s'} left`}}
 return rows;
};
const renderBagBeforeB144=renderBagListB143;
renderBagListB143=function(...a){
 const rows=bagRowsB143(),r=renderBagBeforeB144(...a);
 const lis=[...document.querySelectorAll('#bagListB143 li.tool')];rows.filter(x=>x.tool).forEach((x,i)=>{if(x.uses&&lis[i])lis[i].querySelector('.ct').textContent=x.uses});
 return r;
};
