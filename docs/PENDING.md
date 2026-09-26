# Pending builds

## B118 proposals (feedback session — build on go)

### 1. Guardian level tiers (Beam/Storm pattern) — APPLIED as a B117 fix (`b21-114.js`)
Current: 25% HEAT to start, drains 22 energy/s while held. Absorbs 2+2×Lv hits (12 at Lv5), refills all shields on start, knockback pulse every 0.7s.

- Lv1: 2 blocks, small knockback pulse.
- Lv2: 3 blocks, wider pulse.
- Lv3: 3 blocks + Reflect (each blocked hit fires a bolt back at the attacker).
- Lv4: 4 blocks, wider pulse, stronger reflect.
- Lv5: 4 blocks + shield regen, 2 at most per activation.

Knockback pulse: no longer every 0.7s. Fires once, when the last block breaks or on release.
Hold only (no tap/quick-fire): HEAT drains the whole time held.
After Guardian breaks: hits land on the player's shields/health; losing or regaining shields triggers no shield-linked bonuses (music etc.) while Guardian is active.

Pip is the Guardian:
- On activation Pip drops whatever it's doing (gathering, carrying) and flies to orbit the player.
- While Guardian is active Pip cannot collect resources or use any Pip skill.
- On release Pip resumes normal behavior.

Charge-up (Pip's return is the wind-up):
- Holding sends Pip to the player; Pip's flight time is the variable delay.
- Once Pip is in orbit, the first block is ready after 0.4s. Further blocks 1.2s each.
- Pip already with the player: only the 0.4s.
- HEAT drains from the press, including while Pip is flying back, capped at 10% HEAT until Pip arrives.
- Guardian levels and Guardian Glow shorten the post-orbit delays.

Pip fully off while Guardian is active: no music/resonance skills (incl. Shield Chime invuln), no heart pickup, no auto-fire, no heart skills (rally, damage boost, Pip firing with player), no Pip Catch. Pip heart meter hides; Pip never counts as with the player.

Sim (Pip 170px/s, reserve 110/115/120, drain 22/s; first block time after press / blocks by HEAT):
- Lv1 (20%/s): Pip near 0.40s; 250px 1.87s; 500px 3.34s. 25% HEAT = 1 block; 50%+ = 2.
- Lv2 (19%/s): near 0.36s; 250px 1.83s; 500px 3.30s. 25% = 1; 50% = 2-3; 100% = 3.
- Lv3 (18%/s): near 0.32s; 250px 1.79s; 500px 3.27s. 25% = 1-2; 50% = 2-3; 100% = 3.
- Full bar empties in 5.0-5.5s holding (6-8s with Pip far). Current Guardian at Lv3: 8 instant blocks + full shield refill.

Break ends Guardian: pulse fires, HEAT drain stops. Holding past the break does nothing.
- Broken by hits: Pip stunned 1.8s (can't move or use skills), with a stun animation around Pip (e.g. circling stars) and a cartoon stun sound (chirping birds).
- Released before the break: Pip resumes duties and all skills immediately.
- Pulse visuals differ, power/range identical: release = strong, clean, intentional ring; break = fractured, broken, incomplete-looking ring.

### 2. Tier the remaining Overdrive skills (Beam/Storm/Guardian pattern)
Give Nova, Gravity Well and Ascended Pip the same 5-level shape: Lv1-2 grow the base, Lv3 adds a new mechanic, Lv4 grows it, Lv5 adds a special. Per-level design to be proposed skill by skill, as Guardian was.

### 3. Rank-up exams
Ranks stop unlocking on their own. At the arena gate, once Pip qualifies, the next rank offers an exam: a boss fight at that rank. Winning unlocks the rank; losing costs the usual fatigue but nothing else. Details (qualify rule, exam boss per rank, rewards) to be proposed.
