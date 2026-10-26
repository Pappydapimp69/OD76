// B182 The B173 tap guard now works on real touchscreens. A Brain audit drove real touch taps (Chromium touch input):
// the opening tap's retargeted click arrives with event.detail 0, which B173 let through as a keyboard/gamepad click,
// so the guard never fired. Now the deciding signal is the last input: a trusted click inside a ranch sheet is blocked
// when the last input was a pointer that went down before the sheet opened. Key presses (Enter/Space on a focused
// button) and code clicks (gamepad, scripts: untrusted) still pass.
let lastInputB182='pointer';
addEventListener('pointerdown',()=>{lastInputB182='pointer'},true);
addEventListener('keydown',()=>{lastInputB182='key'},true);
function staleTapB182(e){return e.isTrusted&&lastInputB182==='pointer'&&tapGuardB173.down<=tapGuardB173.opened}
addEventListener('click',e=>{if(e.target?.closest?.('#ranchSheetB100')&&staleTapB182(e)){e.stopImmediatePropagation();e.preventDefault()}},true);
