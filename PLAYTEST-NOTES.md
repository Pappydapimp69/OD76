# Playtest notes (post-B115) — item 1 shipped as a B115 fix; item 2 pending

B114 feedback shipped in B115; see README.

1. **HEAT regen too fast** (B115 is 2.5%/s):
   - Regen = 1 HEAT point every 3 seconds.
   - Regen only fills up to a ceiling: 20% of the meter, +1% per Constellation level (replaces the +1% regen speed per level). Combo and pickups can still push past the ceiling.
   - Regen pauses while a skill is held or charging, and for 3 seconds after any skill is used.

2. **Thunderstorm levels** (pending build):
   - Lv 1: 1 cloud. Lv 2: 2 clouds.
   - Lv 3: adds a chain; each strike jumps to 1 nearby enemy within a short range.
   - Lv 4: 3 clouds. Lv 5: 4 clouds.
   - Charge delay: 2.2s for the first cloud, 1.8s for each one after.
   - Lv 5: all clouds charge 25% faster (1.65s, then 1.35s each).
   - Quick tap: charges exactly 1 cloud with the normal delay, then strikes; no need to hold.
   - Each cloud still costs 8% HEAT.
   - The Lv 3 chain replaces the old ricochet from the Constellation boss power.

3. **Skill button** (pending build):
   - Below the activation threshold: dim, and the fill shows progress toward the threshold (e.g. 12.5% HEAT with a 25% threshold = half full).
   - At or above the threshold: solid, full brightness, full.

4. **Beam** (pending build):
   - Can't trigger without an enemy in range (no HEAT spent with no effect).
   - Smaller at Lv 1, growing with each level (currently overpowered at Lv 1).
