
// B162 Erase all progress from the launch screen. A quiet button under Start and Settings; the first tap arms it ("Tap again to erase
// everything", 4 s), the second wipes every OD76 save on this device (Pip, ranch, hearts, echoes, ascension, playtest
// notes) and reloads. Control settings (movement, heartfield) stay. Only this game's keys are touched, since every
// github.io project of the same owner shares one localStorage.
const B162_KEEP=['od76_movement_settings_v1','od76_heartfield_settings_v1'];
function eraseProgressB162(){
 // Pages save on pagehide (ranch, playtest stats); from here on this page writes no OD76 keys, so the reload starts clean.
 const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(this===localStorage&&/^(overdrive76|od76)/.test(k)&&!B162_KEEP.includes(k))return;return set.call(this,k,v)};
 const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^(overdrive76|od76)/.test(k)&&!B162_KEEP.includes(k))keys.push(k)}
 for(const k of keys)localStorage.removeItem(k);
 return keys.length;
}
(function installEraseB162(){
 const begin=$('begin');if(!begin)return;
 const b=document.createElement('button');b.id='eraseB162';b.type='button';b.textContent='Erase all progress';
 (begin.closest('.b75LaunchActions')||begin).insertAdjacentElement('afterend',b); // under the Start/Settings pair, not inside it
 let armed=0;
 b.addEventListener('click',e=>{
  e.stopPropagation();
  if(!armed){armed=setTimeout(()=>{armed=0;b.textContent='Erase all progress';b.classList.remove('armed')},4000);b.textContent='Tap again to erase everything';b.classList.add('armed');return}
  clearTimeout(armed);armed=0;eraseProgressB162();b.textContent='Erased · restarting…';location.reload();
 });
 const s=document.createElement('style');s.textContent=`#eraseB162{display:block;margin:10px auto 0;padding:8px 14px;border-radius:999px;border:1px solid #ffffff2e;background:transparent;color:#9aa6b8;font:700 12px system-ui;cursor:pointer}
#eraseB162.armed{border-color:#ff7a8a;color:#ff9aa6;background:#ff7a8a1a}`;document.head.appendChild(s);
})();
