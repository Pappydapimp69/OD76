# B164 Colosseum building and tutorial

## Problem

B163 put the Colosseum in the Arena gate menu, and the owner couldn't find it. Brain: a system nothing on screen points at scores the same as one that doesn't exist. ZaneGPT: an unlock is a good goal only if the player can see what they're working toward.

## Change

- **Building:** the Colosseum is its own station on the ranch, south-west of Pip's bed (`x 480, y 1270`), with a path from the plaza. The Arena gate goes back to battle tests only.
- **Locked from the start, and visible:** boarded gate, a "Rank D" sign, and the label "Opens at rank D". Its sheet says how: clear stage 5 at rank E in a battle test.
- **Reveal, once:** the first ranch frame after rank D unlocks plays a glow, hearts, a cheer and the toast "The Colosseum is open!". Players already past rank D see it on their next ranch visit.
- **Tutorial:** first visit offers a sparring match with Sprout (Start / Skip / Not now). It has three steps, each shown as a prompt with its touch button pulsing:
  1. A Focus.
  2. X Ascend (Pip's HEAT is topped past 70%).
  3. Hold B Guard while Sprout Ascends (held 0.5 s).
  Steps are marked done only by Pip's own commands (`f.a.cmdUse` / `f.a.guarding`), never Sprout's (Brain: entity-pinned onboarding). Nobody falls and the clock doesn't run out during the lesson. No fatigue, no prize. Afterwards the bracket sheet opens; "Practise with Sprout" stays on it.
- **Flags:** `tutorial` and `revealed` live in the Colosseum save (`od76-colosseum-b163`), not a loose key.

## Fixed in B163

A Focus or Ascend press on a frame that ran no fixed sim step was dropped (seen as a flaky stuck tutorial in browser runs). Presses now latch until a sim step consumes them.

## Acceptance

- The building doesn't overlap stations or trees and sits inside the fence.
- The Arena gate lists no Colosseum option.
- Locked below rank D, and the sheet names the unlock; it reveals once on opening.
- The tutorial completes through real keyboard input and through the touch buttons; waiting without input doesn't advance it.
- The tutorial costs no fatigue and pays nothing; flags save with the Colosseum save.
- A press on a zero-step frame is not lost.

Verified: `tests/b164-focused-checks.js` (9) and all focused suites (126 pass); desktop and phone Chromium runs, six of six, with instant key presses.
