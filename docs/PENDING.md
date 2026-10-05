# Pending builds

## B127 skill refinements and ranch clarity

### 1. Gravity Well refinement: Event Horizon
- Preserve hold-to-charge and release-at-target behavior.
- Enemies orbit the well; kills inside add Mass, strengthening pull and pulse damage.
- Loose hearts spiral into the well.
- Tapping again collapses it early, damaging trapped enemies and sending collected hearts toward Pip; natural expiration triggers a weaker collapse.
- Levels: Singularity, Heart Orbit, Growing Mass, Tidal Force, Event Horizon.

### 2. Pip Ascendant refinement: Ascendant Symphony
- Preserve 70% ignition and automatic HEAT drain.
- Unlocked arena skills fire as clear Echoes in sequence: Beam, Storm, Guardian, Nova, Gravity.
- Different Echo hits build Harmony, strengthening Pip and the player.
- Pip's strongest bond becomes the active Crown: Loving boosts damage/Nova, Compassionate boosts shields/rescue, Supportive boosts speed/rapid fire.
- HEAT expiration triggers an Ascendant Finale combining every unlocked Echo.
- Levels: Twin Stars, Resonant Echoes, Crowned Instinct, Perfect Harmony, Ascendant Finale.

### 3. Ranch food tiers
- Keep Pip Pellets at +25 Food for ♥ 15.
- Berry Bun restores +50 Food for ♥ 60.
- Harvest Feast restores +100 Food for ♥ 240.

### 4. Stage-gate meter effect chips
- Put one short effect chip beside each meter instead of adding explanatory paragraphs.
- Tired: `Move + attack 90%`, `80%`, or `Normal`.
- Food: `HEAT refill 75%`, `50%`, `25%`, or `Normal`.
- Clean: `Guardian Glow 85%`, `70%`, `55%`, or `Normal`.
- Show `Normal` in muted text; highlight only active penalties. Keep the existing exhaustion warning separate.

### 5. Shared rare-drop checkpoint
- Exploration loot, Heart Stones and Star Dust each roll independently at the active 15-kill checkpoint.
- Preserve possible outcomes of zero, one, two or all three drops.

## B126 quick fixes — SHIPPED as a B125 patch (`b21-132.js`, B125-LOOKS-2)

### 1. Arena looks: stronger, more distinct maps
- B125 maps read too alike (C/B both "dark blue", S "dark brown"): features were capped at 25% to protect contrast.
- Identity through shape and hue, not brightness: full-strength dark silhouettes (crystal spires, garden treeline, mountain ridge, forge towers), a ground pattern per map replacing the grid (sand ripples, moss tiles, frost, ember cracks), more saturated per-map hue at the same darkness (C teal, B indigo-violet, A green-cyan, S red-gold), one large signature motion per map (fireflies, sky-wide aurora, rising embers).
- Contrast test still gates the build.

### 2. Sprite upgrades on the same ladder
| Look | Player + Pip | Enemies | Shots + pickups |
|---|---|---|---|
| E | today's circles | today's circles | dots, text ♥ |
| D | outline, shading, eyes that track movement | distinct silhouettes: chaser blob with eyes, charger horned diamond, core orb with spinning ring | short shot tail, drawn heart icon |
| C | squash/stretch on move, highlights | idle bob, attack wind-up pose, squash on hit | glowing shot core, hearts bob + sparkle |
| B | player scarf trail, Pip wing flutter | map-tinted colours, ground shadow | impact stars |
| A | rim light in the map's light colour | death pops into pieces | |
| S | full detail, light from player and skills | each boss gets a unique drawn look | |
- Each enemy type keeps its outline and colour family at every tier; on-screen size within today's; hitboxes unchanged.
- Canvas-drawn and blended with the look value like the maps; contrast test extended to sprites; contact sheet before ship.

## B125 quick fixes — SHIPPED (B125, `b21-131.js`)

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

### 3. Ranch Pip shows his trained levels
- Today ranch Pip follows at a flat 200px/s (120 tired) and looks the same at any level (`updatePipB100`, `b21-89.js`).
- Swift Pip: follow speed 200 + 8/Lv (cap 360); Scent Hunt helper speed 90 + 4/Lv. Tired = 60% of that.
- Heart Sense: Scent Hunt pickup radius 22 + 2px/Lv (cap 50); antenna glow brightens with level.
- Star Power: sparkle trail behind Pip, bigger with level.
- Guardian Glow: soft aura around Pip, brighter with level.
- Reads the permanent ranch stats (`ranchB99.stats`).

### 4. Arena visuals improve stage by stage, faster at higher ranks
- Brain kernel: ideas `RPG / progression / world-facets-as-reward / diegetic-restore`.
- Looks: E (today's arena) → D Dusk Hills → C Crystal Shore → B Night Garden → A Aurora Fields → S Starforge. Every run starts on the E look; nothing ever looks worse than today.
- "toward X" = a small step every stage across that window; every visual blends (map palette/backdrop/ground, hit sparks, star density + parallax, glow, trails, bloom, light, aurora) — no pops.
| Rank | 2–9 | 10 | 11–19 | 20 | 21–29 | 30 | after |
|---|---|---|---|---|---|---|---|
| E | E | E, starts toward D (TESTING; real: window 20–29) | toward D | **D** | D | D | toward C 40–49 → **C** at 50; toward B 60–69 → **B** at 70; toward A 80–89 → **A** at 90; toward S 100–109 → **S** at 110 |
| D | toward D | **D** | D | D | D | starts toward C | **C** at 40 |
| C | toward D | **D** | toward C | **C** | toward B | **B** | toward A, **A** at 40 |
| B | toward D | **D** | toward C | **C** at 15 → toward B | **B** at 20 → toward A | **A** at 30 | |
| A | **D** by 5, **C** by 10 | C | toward B | **B** at 15 → **A** at 20 | toward S | **S** at 30 | |
| S | **C** by 5, **B** by 10 | B | toward A | **A** at 15 → **S** at 20 | S | S | |
- E, D, C rows are the user's spec; B, A, S filled in on the same pattern (adjust later).
- E's early start at stage 10 is for testing; move it to stage 20 after playtesting.
- Arena only (ranch, menus, HUD untouched); a setting can force the top look.
- Readability (hard rule): player, Pip, enemies, boss, enemy shots, hearts, Heart Stones and pickups stay readable on every look and every in-between.
  - Draw order: backdrop → ground → ambient effects (stars, aurora, weather, fireflies) → gameplay sprites → hit FX → HUD. Nothing ambient draws over a sprite.
  - Backdrop and ground stay in a mid-dark luminance band on every look; the band never overlaps the sprite colours.
  - Gameplay sprites get a thin dark outline + soft light rim that strengthens automatically when contrast is low.
  - Bloom and glow never brighten the backdrop near a sprite past the band; ambient alpha is capped.
  - Test: for each look and each midpoint, sample backdrop/ground luminance and assert contrast >= 3:1 against every gameplay colour (player, Pip, each enemy type, enemy shots, hearts, Heart Stones, pickups). Build fails otherwise.
  - Contact sheet of every look + midpoints with live enemies, Pip, shots and pickups on screen, sent for review before ship.

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
