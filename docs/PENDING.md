# Pending builds

## B125 quick fixes (build on go)

### 1. Chopping drops fatigue snacks (10%)
- Each tree chopped or shrub cut (`b21-94.js`, obstacle clear) has a 10% chance to drop a unique bag item:
  - Tree → **Sunny Acorn** 🌰: −10 fatigue.
  - Shrub → **Dewberry** 🫐: −5 fatigue.
- Goes into Pip's bag (B104 items); feed it from the bag like other food. No food value, can't be bought or sold.
- Toast on drop: "Found a Sunny Acorn! (−10 fatigue)".

### 2. Scent Hunt (train together) gets harder every level
- Today: 5 sparkles, need 4, 12s, 110–230px out, static, every level (`b21-89.js` collect game).
- Scale by Heart Sense level:
| Sense Lv | Sparkles (need) | Time | Max spread | Twist |
|---|---|---|---|---|
| 0–2 | 5 (4) | 12s | 230px | — |
| 3–5 | 6 (5) | 12s | 280px | sparkles drift slowly |
| 6–8 | 7 (6) | 13s | 330px | an unclaimed sparkle fades after 4s and reappears elsewhere |
| 9–11 | 8 (7) | 13s | 380px | 2 grey decoys: touching one costs 1.5s |
| 12+ | 9 (8) | 14s | 430px | faster drift, 3 decoys |
- How-to text and HUD show the tier's numbers. Pip's helper speed unchanged.

## B124 quick fixes — SHIPPED (B124, `b21-130.js`)

### 1. Thunderstorm follow-cloud zap range ×3
- `B122_ZAP_RANGE` (`b21-128.js`): 110/110/110/140/140 → 330/330/330/420/420 px. Dashed range ring follows.

### 2. Boss dash freeze: warning before it hits
- Today the freeze lands the instant the dash lane turns yellow with the player in it (`b21-110.js`).
- New: the lane turns yellow, then the player has 0.6s to step out; the freeze only lands if they are still in the lane when that window ends. The lane flashes during the window.
- Freeze length (2.2s) and what it locks are unchanged.

### 3. Nova: full charge hits the whole screen
- Nova is already hold-to-charge (1s, 20% HEAT). Partial charges keep today's radius and waves.
- A full charge hits every enemy on screen (visible area), with a screen-wide ring.

### 4. Enemy HP grows every wave
- Today HP is flat (chaser 2, charger 3, core 1) until stage 5 (`b21-05.js` spawn), so most basic shots one-shot.
- New: spawn HP × (1 + 0.12 per wave cleared this run), and never less than 2 basic shots at the player's current weapon power.
- Bosses unchanged.

### 5. Arena Merchant screen follows the theme
- The second button ("Continue without buying", `#leaveMerchantB118` in `b21-124.js`) renders as a pale bar with unreadable light text; the buy button doesn't match the stage-up buttons either.
- Style both like the other stage-up choices: themed dark card buttons, readable label, same focus ring. Leave button reads "Continue without buying".
- Both merchant buttons (`buySnackB118`, `leaveMerchantB118`) join the B117 hold-to-confirm set (`B117H_IDS`, `b21-116.js`): press and hold, early release cancels, tap shows the hint.

### 6. Arena hold-to-confirm twice as fast
- Between-stage hold confirms (boss rewards, Pip traits, heart skills, merchant) hold 0.9s instead of 1.8s (`B117H_MS`).
- Skill-select (Overdrive) and Sound Lab holds keep 1.8s.

### 7. One word: Fatigue
- The stage gate meter says "Tired 100 (+3)" while snacks, the gate warning and the HUD say fatigue.
- Rename the meter label to "Fatigue" everywhere it shows: stage gate bars (`b21-107.js`, `b21-124.js`), QA panel row. Status words like "Pip is exhausted" stay.

## B123 quick fixes — SHIPPED (B123, `b21-129.js`)

### 1. Slower basic auto-attack, tuned for mobile
- Basic shots fly at 600px/s for 0.55s (`b21-06.js` attack) whatever the screen; reach is 55% of the short side (up to 430px), so big screens target enemies the shot can't reach and phones see shots cross the reach in ~0.35s.
- New: shot speed = current reach ÷ 0.5s, clamped 360–600px/s. Phone (390px short side, ~215px reach) ≈ 430px/s; big screens stay near today's speed.
- Shot lifetime = reach ÷ speed + 10%, so a shot always reaches what it targets.
- Beam and Pip shots unchanged.

### 2. Player range −10%
- Auto-target reach ×0.9: `S.attackRange` (`b21-01.js`, cap 430 → 387) and the no-Pip base range in `getAutoTarget` (`b21-05.js`, 185–270 → 167–243).
- Beam's reach follows (it mirrors auto-target range). Item 1's shot speed is tied to reach, so basic shots also fly ~10% slower on the same screen.

## B122 quick fixes — SHIPPED (B122, `b21-128.js`)

### 1. Ranch HUD: remove "Arena max" (also restores Heart Stones)
- Bug: the B118 override writes into `spans[2]`, which since B102 is the Heart Stones span (◆), not the Fatigue label. Heart Stones vanish from the HUD; the save is intact.
- Top bar on the ranch reads "Tired · Arena max N" (`b21-124.js:130`). Drop the override; the fatigue bar keeps only its 😴 (no word). Refinery sheet now lists ◆ Heart Stones too (tester report).

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
- Beam drain in % of the HEAT meter: 26%/s (was 26 energy/s, so it got cheaper as the meter grew). Nova (20%) and Storm were already %.
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
