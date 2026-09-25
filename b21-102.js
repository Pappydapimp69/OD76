
// B114 Rested for battle: Pip can't enter the arena while his fatigue is over 60.
const B114_ARENA_MAX_FATIGUE=60;
function arenaReadyB114(){return ranchB99.fatigue<=B114_ARENA_MAX_FATIGUE}
const interactBeforeB114=interactStationB100;
interactStationB100=function(st){
 if(st.id!=="gate"||arenaReadyB114())return interactBeforeB114(st);
 openSheetB100("Arena gate",`Pip is too tired to battle (fatigue ${ranchB99.fatigue}; he needs ${B114_ARENA_MAX_FATIGUE} or less). Let him rest at his bed; a Berry Bun also takes a little fatigue off.`,[{label:"OK",quiet:true}]);
};
const startBattleBeforeB114=startBattleTestB99;
startBattleTestB99=function(){if(!arenaReadyB114()){ranchToastB100?.("Pip is too tired to battle. Let him rest first.");return false}return startBattleBeforeB114()};
const drawStationBeforeB114=drawStationB100;
drawStationB100=function(st,t){
 drawStationBeforeB114(st,t);
 if(st.id==="gate"&&!arenaReadyB114())labelB100(st.x,st.y+44,"Pip too tired",`Fatigue ${ranchB99.fatigue} · needs ${B114_ARENA_MAX_FATIGUE} or less`);
};
