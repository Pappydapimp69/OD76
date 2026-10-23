// B173 The tap that opens a ranch sheet no longer presses the sheet button under the finger.
// Playtest (B170): opening the Heart Refinery could shut it again or start Fuse all, because the opening
// tap's click landed on whichever button appeared under it. A sheet button now answers a pointer click only
// when that pointer went down after the sheet opened. Keyboard/gamepad and code clicks (detail 0) still pass;
// a sheet that redraws while open (B158 refinery) stays armed.
const tapGuardB173={seq:0,down:0,opened:0};
addEventListener('pointerdown',()=>{tapGuardB173.down=++tapGuardB173.seq},true);
const openSheetBeforeB173=openSheetB100;
openSheetB100=function(...a){
 const fresh=!ranchWorldB100.sheet,out=openSheetBeforeB173(...a);
 if(fresh&&ranchWorldB100.sheet)tapGuardB173.opened=++tapGuardB173.seq;
 return out;
};
(function installTapGuardB173(){
 const el=$('ranchSheetB100');if(!el)return;
 el.addEventListener('click',e=>{if(!e.detail||tapGuardB173.down>tapGuardB173.opened)return;e.stopImmediatePropagation();e.preventDefault()},true);
})();
