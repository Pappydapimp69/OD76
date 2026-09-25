
// B110 Bag on Select: the controller's Select/View/Share button (8) opens and closes the ranch bag.
const B110_SELECT=8;
const bagSheetBeforeB110=bagSheetB104;
bagSheetB104=function(){bagSheetBeforeB110();if(ranchWorldB100.sheet)ranchWorldB100.sheet.bag=true};
function toggleBagB110(){
 const w=ranchWorldB100;if(!w.active||w.game||w.b109Action)return false;
 if(w.sheet?.bag){closeSheetB100();return true}
 if(w.sheet)return false;
 bagSheetB104();return true;
}
const inputBeforeB110=ranchInputB100;
ranchInputB100=function(){
 const w=ranchWorldB100,r=inputBeforeB110();
 let sel=false,pad=false;for(const p of navigator.getGamepads?navigator.getGamepads():[]){if(!p||!p.connected)continue;pad=true;sel=!!(p.buttons?.[B110_SELECT]?.pressed||p.buttons?.[B110_SELECT]?.value>.5);break}
 if(sel&&!w.b110PrevSelect)toggleBagB110();
 w.b110PrevSelect=sel;
 const bag=$("ranchBagB104");if(bag){const label=pad?"🎒 Bag · Select":"🎒 Bag";if(bag.textContent!==label)bag.textContent=label}
 return r;
};
const enterBeforeB110=enterRanchB100;
enterRanchB100=function(){ranchWorldB100.b110PrevSelect=true;enterBeforeB110()};
openRanchB99=enterRanchB100;
for(const id of ["openRanchB99","endRanchB99"]){const old=$(id);if(!old)continue;const b=old.cloneNode(true);old.replaceWith(b);b.addEventListener("click",enterRanchB100)}
