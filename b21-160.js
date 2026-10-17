
// B143 The bag is a list. Instead of one "icon name ×n · …" text line, the Bag sheet shows one row per thing you
// own: icon, name, count, and what it does (food, fatigue, washing, or the tool's job). Tools come first. The sheet's
// buttons (Close, survey, etc.) are unchanged.
function bagRowsB143(){
 const rows=[];
 for(const [k,t] of Object.entries(B105_TOOLS))if(ranchB99.tools?.[k])rows.push({icon:t.icon,name:t.name,count:null,what:t.use?t.use[0].toUpperCase()+t.use.slice(1):'Tool',tool:true});
 for(const k of Object.keys(ranchB99.items||{})){const n=itemCountB104(k);if(n<=0)continue;const it=itemInfoB104(k)||{};
  const what=[it.food?`Food +${it.food}`:'',it.fatigue?`−${it.fatigue} fatigue`:'',k==='soap'?'Washes Pip':'',it.desc||''].filter(Boolean).join(' · ')||(it.crop||it.seed?'Crop':'Item');
  rows.push({icon:it.icon||'•',name:it.name||k,count:n,what});
 }
 return rows;
}
function renderBagListB143(){
 const el=$('ranchSheetB100');if(!el||el.querySelector('h3')?.textContent!=='Bag')return;
 const p=el.querySelector('p'),rows=bagRowsB143();if(!p)return;
 const list=document.createElement('ul');list.id='bagListB143';
 if(!rows.length){const li=document.createElement('li');li.className='empty';li.textContent='Empty. Buy food at the stall.';list.appendChild(li)}
 for(const r of rows){const li=document.createElement('li');if(r.tool)li.className='tool';
  li.innerHTML=`<span class="ic"></span><span class="nm"></span><span class="ct"></span><span class="wh"></span>`;
  li.querySelector('.ic').textContent=r.icon;li.querySelector('.nm').textContent=r.name;li.querySelector('.ct').textContent=r.count==null?'Tool':`×${r.count}`;li.querySelector('.wh').textContent=r.what;
  list.appendChild(li)}
 p.replaceWith(list);
}
const bagSheetBeforeB143=bagSheetB104;
bagSheetB104=function(...a){const r=bagSheetBeforeB143(...a);renderBagListB143();return r};
(function styleBagB143(){const s=document.createElement('style');s.textContent=`
#bagListB143{list-style:none;margin:6px 0 10px;padding:0;display:grid;gap:6px;max-height:min(46vh,360px);overflow:auto}
#bagListB143 li{display:grid;grid-template-columns:32px 1fr auto;grid-template-rows:auto auto;column-gap:10px;align-items:center;padding:7px 10px;border-radius:12px;background:#ffffffb3;border:1px solid #e5dcfb;text-align:left}
#bagListB143 li.tool{background:#f3eeff}
#bagListB143 .ic{grid-row:1/3;font-size:22px;text-align:center}
#bagListB143 .nm{font-weight:800;font-size:14px;color:#4b4470}
#bagListB143 .ct{grid-row:1/3;grid-column:3;font-weight:900;font-size:15px;color:#7a5fd6}
#bagListB143 li.tool .ct{font-size:11px;letter-spacing:.06em;color:#9a8fc4}
#bagListB143 .wh{grid-column:2;font-size:12px;color:#7d7698}
#bagListB143 li.empty{display:block;color:#7d7698;font-size:13px}`;document.head.appendChild(s)})();
