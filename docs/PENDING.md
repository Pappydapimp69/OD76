# Pending builds

## B118 proposals (feedback session — build on go)

### 1. Guardian level tiers (Beam/Storm pattern)
Current: 25% HEAT to start, drains 22 energy/s while held. Absorbs 2+2×Lv hits (12 at Lv5), refills all shields on start, knockback pulse every 0.7s.

- Lv1: Absorbs 2 hits, small knockback pulse.
- Lv2: 3 hits, wider pulse.
- Lv3: NEW: Reflect. Each blocked hit fires a bolt back at the attacker.
- Lv4: 4 hits, wider pulse, stronger reflect.
- Lv5: SPECIAL: Shield regen. Restores shields while held, 2 at most per activation.

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

Pip-linked bonuses off while Guardian is active: Shield Chime (plush) invuln on shield regen, all Pip music/resonance effects, Pip Catch.

Sim (Pip 170px/s, reserve 110/115/120, drain 22/s; first block time after press / blocks by HEAT):
- Lv1 (20%/s): Pip near 0.40s; 250px 1.87s; 500px 3.34s. 25% HEAT = 1 block; 50%+ = 2.
- Lv2 (19%/s): near 0.36s; 250px 1.83s; 500px 3.30s. 25% = 1; 50% = 2-3; 100% = 3.
- Lv3 (18%/s): near 0.32s; 250px 1.79s; 500px 3.27s. 25% = 1-2; 50% = 2-3; 100% = 3.
- Full bar empties in 5.0-5.5s holding (6-8s with Pip far). Current Guardian at Lv3: 8 instant blocks + full shield refill.

Open: when blocks run out — Guardian breaks (auto-ends, keep HEAT) and/or a penalty (Pip stunned). Awaiting call.
