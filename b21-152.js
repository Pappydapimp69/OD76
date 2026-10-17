
// B134 Skill names on focus. Tiles hide names on phones and truncate long ones on desktop, so the focused tile
// (gamepad cursor, keyboard focus or mouse hover) shows its full name in a small label just below it.
const tileHTMLBeforeB134=b132TileHTML;
b132TileHTML=function(id){return tileHTMLBeforeB134(id)+`<span class="b134Tip">${OVERDRIVE_INFO[id].name}</span>`};
(function styleTipB134(){const s=document.createElement('style');s.textContent=`
.b134Tip{position:absolute;left:50%;top:calc(100% + 6px);transform:translateX(-50%);z-index:6;display:none;white-space:nowrap;padding:4px 9px;border-radius:8px;background:#eef3fb;color:#0b1119;font:800 12px system-ui;box-shadow:0 4px 14px #0008;pointer-events:none}
.b134Tip::before{content:"";position:absolute;left:50%;top:-5px;margin-left:-5px;border:5px solid transparent;border-top:0;border-bottom-color:#eef3fb}
.b132Tile.gamepad-focus .b134Tip,.b132Tile:focus-visible .b134Tip{display:block}
@media(hover:hover){.b132Tile:hover .b134Tip{display:block}}
.b132Tile.gamepad-focus{outline:3px solid #7ed8ff;outline-offset:2px}`;document.head.appendChild(s)})();
