
// B115c Needs never lock: sleep costs hunger/cleanliness, nothing soft-locks.
// A rest week costs exactly 15 food and 15 clean (floored at 0) in place of the old 12/6 drain; drill and battle weeks keep theirs.
// Hunger and hygiene only slow training down: the bed and the arena gate never check them, so Pip can always sleep.
const B115C_SLEEP_COST=15;
const weekPassedBeforeB115c=weekPassedB104;
weekPassedB104=function(kind){
 if(kind!=="rest")return weekPassedBeforeB115c(kind);
 ranchB99.hunger=Math.max(0,ranchB99.hunger-B115C_SLEEP_COST);ranchB99.hygiene=Math.max(0,ranchB99.hygiene-B115C_SLEEP_COST);
 for(const h of B104_WEEK_HOOKS)h(kind);
 saveRanchB99();
};
const interactBeforeB115c=interactStationB100;
interactStationB100=function(st){
 interactBeforeB115c(st);
 const p=st.id==="home"&&ranchWorldB100.sheet&&$("ranchSheetB100")?.querySelector("p");
 if(p)p.textContent+=` Pip wakes up a little hungry and grubby (−${B115C_SLEEP_COST} food, −${B115C_SLEEP_COST} clean), but he can always sleep.`;
};
