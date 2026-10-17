
// B141 Ranch "tired" is 70% of Pip's fatigue max, not a flat 70. Every ranch check that used B99_TIRED (drills
// refused, tools refused, tired mood, lines and sprite) now reads tiredLineB141(): 70 at max 100, 98 at max 140.
function tiredLineB141(){return Math.ceil(B99_TIRED*fatigueMaxB118()/100-1e-9)}
