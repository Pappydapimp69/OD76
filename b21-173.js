
// B161 The Bag scrolls with a gamepad. Its item list scrolled only by touch, so on a landscape phone with a controller
// the rows below the fold (most of the bag) could never be seen. Now d-pad/stick down scrolls the list a row at a time
// until it reaches the end, then moves to the buttons; up from the first button scrolls back. Any ranch sheet also
// keeps the focused button in view, and on short landscape screens sheets and the bag list use more of the height.
function bagListB161(){const l=$('ranchSheetB100')?.querySelector('#bagListB143');return l&&l.scrollHeight>l.clientHeight+1?l:null}
function bagStepB161(l){return Math.max(40,(l.querySelector('li')?.offsetHeight||56)+6)}
const focusSheetBeforeB161=focusSheetB100;
focusSheetB100=function(i,...a){
 const w=ranchWorldB100,cur=w.sheet?.focus,l=w.sheet?bagListB161():null;
 if(l&&Number.isFinite(cur)){
  const dir=Math.sign(i-cur),max=l.scrollHeight-l.clientHeight;
  if(dir>0&&l.scrollTop<max-1){l.scrollTop=Math.min(max,l.scrollTop+bagStepB161(l));return}
  if(dir<0&&cur===0&&l.scrollTop>1){l.scrollTop=Math.max(0,l.scrollTop-bagStepB161(l));return}
 }
 const out=focusSheetBeforeB161(i,...a);
 $('ranchSheetB100')?.querySelector('button.focus')?.scrollIntoView?.({block:'nearest'});
 return out;
};
(function styleB161(){const s=document.createElement('style');s.textContent=`
@media (orientation:landscape) and (max-height:600px){#ranchSheetB100{max-height:calc(100dvh - 24px);bottom:12px}#bagListB143{max-height:calc(100dvh - 190px)}}`;document.head.appendChild(s)})();
