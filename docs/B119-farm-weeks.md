# B119 Farm Weeks

## Problem

Watering cost Pip 4 fatigue per plot and was blocked when he was tired, so farming competed with training and the arena. A week that ended without water simply paused a crop, with no risk, and weeks passed silently, so players couldn't tell a drill or rest had changed the world.

## Change

- The player waters: free, and allowed even when Pip is tired. Pip's X job no longer waters (he still tills, harvests and clears growth).
- Growth per ranch week: watered +1; first dry week in a row +0.5; second +0; third withers the crop and leaves tilled soil.
- Half-week growth and the dry-week count persist in the ranch save.
- Every week that ends (drill, rest, battle test) fades the screen to "Week N" with a one-line crop summary. Battle-test weeks show when the ranch next opens. A rest plays a short twinkle as the screen returns.
- Plots show 💧 when unwatered and a pulsing 🥀 when a third dry week would wither them; plot and garden sheets explain the rule.

## Preserved

Crop lengths and yields, seeds, tools, meals, the orchard, hunger, hygiene, fatigue costs for tilling and clearing, and the arena are unchanged.

## Acceptance

- Watering never changes fatigue and works at any fatigue.
- Growth follows 1 / 0.5 / 0 / wither exactly and a watered week resets the dry count.
- Reloading keeps half-weeks and dry counts.
- Rest, drill and battle-test weeks each produce a Week N fade; the battle one waits for the ranch.
