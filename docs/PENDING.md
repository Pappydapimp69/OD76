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
- HEAT drains from the press, including while Pip is flying back, up to a cap (TBD).
- Guardian levels and Guardian Glow shorten the post-orbit delays.

Open: when blocks run out — Guardian breaks (auto-ends, keep HEAT) and/or a penalty (Pip stunned). Awaiting call.
