// B179 Refinery slots survive a reload. B174 kept the slots inside the ranch save, but older modules save the ranch
// while the page is still loading (before b21-186 adds the slots), so every reload wiped them, along with the hearts
// and dust loaded into them. Slots now also live under their own key, written on every ranch save and read back last.
const B179_KEY='od76-refinery-slots-b179';
function rawSlotsB179(){try{const v=JSON.parse(localStorage.getItem(B179_KEY)||'null');return Array.isArray(v?.slots)?v:null}catch(_){return null}}
const saveRanchBeforeB179=saveRanchB99;
saveRanchB99=function(...a){const r=saveRanchBeforeB179(...a);try{if(Array.isArray(ranchB99?.slots))localStorage.setItem(B179_KEY,JSON.stringify({v:1,slots:ranchB99.slots}))}catch(_){}return r};
const loadRanchBeforeB179=loadRanchB99;
loadRanchB99=function(...a){const r=loadRanchBeforeB179(...a),raw=rawSlotsB179();if(raw)slotsFieldsB174(r,raw);return r};
{const raw=rawSlotsB179();if(raw)slotsFieldsB174(ranchB99,raw);saveRanchB99()}
