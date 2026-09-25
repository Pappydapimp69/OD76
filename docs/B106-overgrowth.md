# B106 — Overgrowth and arena Heart Stones

## Problem

Every drill site was open from the first minute, and ranch work cost nothing but hearts. Progress on the ranch should take effort and be limited by Pip's energy. Heart Stones should also be findable in the arena.

## Change

- **Overgrowth:** each drill site (Scent Hunt, Sky Laps, Star Target, Glow Pond) starts ringed by 8 obstacles (2 trees, 6 shrubs) at radius 100. Standing obstacles block the player. Clear any of them to open a path. Clearing is saved.
- **Only Pip uses tools**, and each use adds fatigue:
  - Chop a tree (Axe, ♥ 50): +15.
  - Cut a shrub (Sickle, ♥ 25): +8.
  - Till (Hoe): +8.
  - Water (Watering can): +4 per plot.
- **Fatigue cap:** at 70+ fatigue, Pip refuses tool work until he rests.
- **Stall:** sells the axe and sickle from the start. The bag lists owned tools.
- **Arena Heart Stones:**
  - An independent 10% roll at each 30-kill checkpoint (notes and prisms are unchanged).
  - Each boss drops one.
  - They fall with a marker and beacon like prisms, and show as a pink ♦ in the arena currency row.
  - Banked at the ranch like hearts: all on Return to ranch, half after a fall. The stage-end gate and the test report mention them.

## Follow-up: thicker overgrowth

- **Outer ring:** each drill site gains 14 more obstacles (every third a tree) at radius 165, or 145 at the Glow Pond, which sits just below the plaza. That makes 22 per site. The ring is offset from the inner gaps and spaced tightly enough that the player can't squeeze through.
- **Collision:** resolves in up to 4 passes, so being pushed out of one bush can't wedge you into the next.
- **Spawn:** the player now spawns at (900, 420), clear of the pond's outer ring.
- **Labels:** site name labels draw above the growth.
- **Existing saves:** the outer obstacles are new, so they start uncleared.
- **Tests:** a sweep walks at every drill site from 24 directions and never reaches it while fully overgrown.

## Verified

223 full-bundle checks pass across 94 modules: obstacle blocking and cleared gaps, tool requirements and fatigue, tired refusal, early stall tools, stone drops/collection/boss drop/banking, and corrupt-save recovery. A desktop browser run showed an overgrown Star Target site and a falling Heart Stone in the arena, with no errors.
