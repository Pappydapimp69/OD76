# B100 — Ranch world

## Problem

B99's ranch was a menu. The ranch should be a place: pastel, separate from the neon arena, where you walk around and deal with Pip directly.

## Change

- **Walkable ranch** (1800×1200, camera follows you) in a pastel palette, with a fence, trees, paths and a plaza. Same movement controls as the arena: touch stick anywhere, WASD/arrows, gamepad. The arena HUD is hidden while you're there; a ranch HUD shows week, ranch hearts and fatigue.
- **Stations:** Pip's bed (rest), Arena gate (battle test), Scent Hunt field (Heart Sense), Sky Laps track (Swift Pip), Star Target range (Star Power), Glow Pond (Guardian Glow). Walk up and press A (Space/Enter/E, gamepad A, or the on-screen button) for its sheet; B/Esc closes it.
- **Pip** follows you, sleeps at the bed, runs to stations to drill and droops when tired. Stand still near him to pet him (no stat effect).
- **Drill points:** ranch levels now fill from points, 10 per level. A drill is worth 10 points.
  - **Solo:** Pip succeeds for 10, or fails for 5. Success chance is 85% rested, dropping with fatigue (min 35%).
  - **Together (mini-game):** win for 15, fail for 5.
  - Scent Hunt: walk over 4 of 5 scent sparkles in 12s (Pip helps). Sky Laps and Star Target: press A in the moving target zone, 3 of 4. Glow Pond: hold A, release inside the band, 2 of 3; holding too long is a miss.
- Cost, fatigue and week per drill are unchanged from B99. Old saves convert levels to points.

## Unchanged

Ranch hearts, banking, the stage-end gate and death penalty from B99.

## Verified

197 full-bundle checks pass across 89 modules. Desktop and 390×780 touch browser runs walked the ranch, opened a station sheet with the touch button, played Star Target and saw the result, with no errors.
