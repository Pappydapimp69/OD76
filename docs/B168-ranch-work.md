# B168 Ranch work feeds the Colosseum

## Problem

Clearing trees and shrubs only opened the ranch; nothing counted it. The owner asked for chopping to affect Guard and Ascension in the Colosseum, much as fatigue already grows with arena play.

## Change

Clears are permanent (B106), so this is a finite progression: 60 shrubs and 28 trees. Clears made before B168 count.

| Ranch work | Colosseum effect at a full clear (scales with the share cleared) |
|---|---|
| Shrubs cut (steady, repetitive work) | Guard drains 60% slower; blocked hits hurt 60% less |
| Trees felled (heavy axe work) | Ascension lasts 1.2 s longer and hits 6% harder |

- **Measured against an equal rival** (seeded sweeps, AI-quality coaching):
  - No ranch work: ~48%.
  - All shrubs: ~58%.
  - All trees: ~60%.
  - Both: ~78%.
  Strengths are in `B168_K`; rivals have none.
- **Where it shows** (Brain: a system nothing on screen points at doesn't exist):
  - The Colosseum sheet lists both counts with their real effects.
  - The fight intro shows the counts.
  - Every tree's and shrub's sheet says what clearing it does for the Colosseum.
  - The tutorial's "Training matters" card mentions it.
- With nothing cleared, a fight is identical to before.

## Verified

- `tests/b168-focused-checks.js` (6), and all focused suites pass (148).
- Chromium at desktop and phone size, with no errors.
