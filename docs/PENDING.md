# Pending builds

## B122 quick fixes (build on go)

### 1. Ranch HUD: remove "Arena max" (also restores Heart Stones)
- Bug: the B118 override writes into `spans[2]`, which since B102 is the Heart Stones span (◆), not the Fatigue label. Heart Stones vanish from the HUD; the save is intact.
- Top bar on the ranch reads "Tired · Arena max N" (`b21-124.js:130`). Drop the B118 override so the label is back to the original "Fatigue".

### 2. Thunderstorm rework: follow cloud
Why: Beam pays off instantly; Storm waits 2.2s charge + travel and does ~1.6-2.3x less damage per HEAT. Give Storm its own role (lasting, safe, ranged) instead of a slower Beam.

Controls (one button):
- No follow cloud up: press charges 2.2s, then summons the follow cloud. Costs 25% HEAT. Only one at a time.
- Follow cloud up, quick tap (under 0.18s): fires a bolt from the follow cloud at the nearest enemy. Costs 1s of follow-cloud time, no HEAT. 0.25s cooldown between bolts. Capture taps at press time so fast taps never drop.
- Follow cloud up, hold (past 0.18s): charges seeking clouds that hunt enemies and strike (chain from Lv3). Each costs 8% HEAT, none of the follow-cloud time. Charge 1.1s first, 0.9s each after (Lv5 25% faster). No HEAT is spent inside the tap window.

Follow cloud:
- Lasts 12s. Each bolt takes 1s off. More tapping = shorter, burstier cloud.
- Floats over the player and auto-zaps any enemy in range (keeps zapping while the player stands still).
- When it runs out, the next press summons a new one (2.2s charge again).

Levels (replace "more clouds per level"):
| Lv | Seeking clouds max | Auto-zap | Range | Extra |
|---|---|---|---|---|
| 1 | 1 | every 0.8s | 110px | follow cloud + bolts |
| 2 | 2 | every 0.7s | 110px | |
| 3 | 2 | every 0.7s | 110px | chain on every strike |
| 4 | 3 | every 0.6s | 140px | |
| 5 | 4 | every 0.5s | 140px | seeking clouds charge 25% faster |

Damage (all × weapon power, like Beam):
- Seeking cloud: Lv1-5 = 2.6 / 3.4 / 4.4 / 6.2 / 8.6. Chain hit 60%.
- Bolt: 60% of a seeking cloud.
- Auto-zap: 50% of a seeking cloud.
- Target: Storm lands ~85-100% of Beam's damage per HEAT, paid for in startup time.

Beam: unchanged.

### 3. Skill balance: Beam / Nova / Storm
- Nova and Storm damage × weapon power (Beam already does; `S.weaponPower` in `b21-01.js`).
- Beam overdrive power 1.5 + 0.20×Lv (was 0.33×Lv; `b21-06.js` attack). Lv1 −7%, Lv5 −21%.
- Costs in % of the HEAT meter, not fixed energy: Beam drain 26%/s (was 26 energy/s), Nova full charge 20% (was 20 energy). Storm already %.
- Target per 8% HEAT, single target: Beam 2.8/7.0/12.8 · Nova 3.3/6.2/9.2 per enemy in range · Storm 2.6/4.4/8.6 (+chain) at Lv1/3/5.

## B121 quick fixes — SHIPPED (B121)

### 1. Heart Sense carry capacity
- Starts at 3. +3 per Sense level through Lv 10 (Lv 10 = 33). After Lv 10, +1 per level.
- Never decreases on upgrade. Hearts still weigh 3.
- Upgrade preview and Pip's capacity line show the new numbers.
- Dirt (hygiene) does not touch capacity; dirt effects unchanged.

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
