
// B111 Start at the ranch: the splash screen's Start (A / Cross) opens the ranch; runs begin
// only from the Arena gate. The separate Pip Ranch button on the splash screen is gone.
let battleLaunchB111=false;
$("openRanchB99")?.remove();
$("begin").textContent="START · A / CROSS";
$("begin").addEventListener("click",e=>{
 if(battleLaunchB111)return;
 e.stopImmediatePropagation();e.preventDefault();
 unlockAudioFromGesture();enterRanchB100();
},true);
startBattleTestB99=function(){
 $("ranchB99")?.classList.add("hidden");
 reset();
 battleLaunchB111=true;try{$("begin").click()}finally{battleLaunchB111=false}
};
