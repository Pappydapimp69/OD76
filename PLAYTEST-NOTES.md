# Playtest notes (post-B115) — pending build

B114 feedback shipped in B115; see README.

1. **HEAT regen too fast** (B115 is 2.5%/s):
   - Regen = 1 HEAT point every 3 seconds.
   - Regen only fills up to a ceiling: 20% of the meter, +1% per Constellation level (replaces the +1% regen speed per level). Combo and pickups can still push past the ceiling.
   - Regen pauses while a skill is held or charging, and for 3 seconds after any skill is used.
