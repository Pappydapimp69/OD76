# B102 — Heart Refinery

## Problem

Hearts brought home bought drills directly. The ranch needed an economy: a machine that refines hearts into a separate currency, with a rarer by-product for upgrades.

## Change

- **Heart Refinery** station on the ranch (east of the pond).
- **Refining:** load hearts in batches of 50 (one batch, or all you can afford). The machine refines one batch at a time on the real clock and keeps going while you're in the arena or away. Time per batch by refinery level: 15 min, 10, 8, 5, 4, 3, 2, 1 min, 30 s, 10 s (Lv 1–10).
- **Output:** each batch makes one Heart Stone and has a 10% chance of one star dust. Finished output waits in the tray until you collect it.
- **Star Stones:** fuse 5 star dust into 1 Star Stone.
- **Drills cost Heart Stones:** 1 stone, +1 per 3 ranch levels of that ability. Hearts no longer buy drills.
- **Refinery upgrades** cost Star Stones: ceil(level / 3), so 1,1,1,2,2,2,3,3,3 for Lv 2–10. Finished batches are counted at the old speed first.
- **Drill station upgrades** cost 1, 2, 3 Star Stones (max Lv 3). Each level adds 2 points per drill and raises that ability's ranch cap by 1. Upgrade from the station's sheet.
- Ranch HUD shows ♥ hearts, ◆ Heart Stones, ✧ star dust and ★ Star Stones.
- Quick key taps (A, B, menu arrows) are latched so they're never lost between frames.

## Verified

205 full-bundle checks pass across 90 modules, including refine timing, dust rolls, fusing, upgrades, stone-priced drills, raised caps across reloads and corrupt-save recovery. Desktop and 390×780 touch browser runs opened the refinery, loaded hearts and showed the countdown, with no errors.
