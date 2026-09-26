# Playtest notes (post-B114) — shipped in B115

1. **Wave spawn rate** ramps too fast after wave 3. Soften the spawn-rate curve.
2. **Arena stage costs**: clearing a stage adds fatigue and lowers hunger and cleanliness.
   - Show Pip's meters on the next/return screen.
   - Fatigue at 100% blocks the next stage.
   - Arena entry allowed up to 60 fatigue (keep B114 gate); starting fatigue just limits how many stages.
   - Debuffs = option C (themed): hunger → heat regen −25/−50/−75% (40-59/20-39/<20); fatigue → attack+move −10/−20% (60-79/80-99); cleanliness → Guardian Glow scaling down.
   - Fatigue per stage (proposed): 4 + stage# + 1 per 6s Pip is away from the player (out of orbit, via pipAwayB49), capped at 25 per stage.
3. **Heat rework**: drop the kill-fed heat (slow in stages 1-3, fast in 4+).
   - Heat regenerates on its own over time.
   - Each constellation skill level adds +1% regen.
   - Combo: only basic-attack kills count (not skills). The chain resets after 1.2s with no basic-attack kill.
   - Each chain point is worth +N heat. Show the combo on the right side.
   - Display = tiered multiplier: 1x for counts 1-10, 2x for 11-20 (points worth 2), 3x for 21-30, and so on. Cap at 5x.
4. **Sleep**: lowers hunger and cleanliness by 15% (floor 0). Hunger and cleanliness never block sleep.
   - Hunger and cleanliness never block the arena either, only debuff. Pip must never get soft-locked, since food and soap come from the arena.
5. **Drill sites**: the upgrade is locked until training reaches 10. Upgrading resets training to 0, then 10 more trainings are possible.
