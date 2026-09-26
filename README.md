# OVERDRIVE 76

[Play OD76](https://pappydapimp69.github.io/OD76/)

## B116: Playtest pass two

- **Thunderstorm:**
  - Clouds by level: Lv 1 has 1, Lv 2 and Lv 3 have 2, Lv 4 has 3, Lv 5 has 4.
  - Each cloud charges on a delay: 2.2 s for the first and 1.8 s for each one after. At Lv 5 they charge 25% faster.
  - A quick tap charges one cloud, which strikes by itself. A charged cloud with no target waits beside you until an enemy appears. Clouds keep charging and waiting through the breaks between waves.
  - From Lv 3, each strike chains to one nearby enemy. This replaces the old Constellation ricochet.
  - Each cloud still costs 8% HEAT.
- **Skill button:** below the ignition line the button is dim and fills toward that line. At or above it, the button is solid and full.
- **Beam:**
  - It won't fire without an enemy in reach, and a refused press costs nothing.
  - It grows with level: one narrow stream at 0.6x damage at Lv 1, today's 3-way spread at Lv 3, and a 5-way spread at 1.25x at Lv 5.
- **Boss freeze:** standing in Fang's dash lane when it turns yellow freezes you for 2.2 s. Everything but Pip is locked, HEAT regen pauses, and any held or charging skill is lost with no refund.
- **Stage costs:**
  - Food per stage: 2 + half the stage number (at least 1) + 1 per 25% HEAT spent.
  - Cleanliness per stage: 2 + 1 per 15 kills + 1 per hit taken, plus 3 on boss stages.
  - The gate says why.
- **Ranch:**
  - The shop cursor stays put after a purchase.
  - Consumables show how many you own.
  - Chopping, cutting, feeding and washing have their own sounds.
  - Feeding and washing each take 3 s.

## B115: Playtest pass

- **Spawns:** past stage 3, enemy spawn pressure climbs half as fast as before. Stages 1–3 are unchanged.
- **HEAT:** HEAT refills on its own at 1 point every 3 s, but only up to 20% of the meter; each Constellation level past the first raises that limit by 1%. Regen pauses while a skill is held or charging and for 3 s after any skill is used. Kills no longer feed HEAT. Basic auto-fire kills start a combo chain that breaks after 1.2 s without one. Each kill adds HEAT equal to the chain's tier: 1x for kills 1–10, 2x for 11–20, and so on up to 5x. The chain shows on the right side of the screen.
- **Stage toll:** each stage clear adds fatigue (4 + stage number + 1 per 6 s Pip spent away from you, at most 25) and costs a little hunger and cleanliness. The stage-end gate shows all three meters. At 100 fatigue Pip must return to the ranch.
- **Need debuffs:**
  - Hunger slows HEAT regen.
  - Fatigue of 60 or more slows attacks and movement.
  - Low cleanliness weakens Guardian Glow.
  - Hunger and cleanliness never block sleep or the arena.
- **Sleep:** each sleep costs 15 hunger and 15 cleanliness, never going below 0.
- **Drill sets:** each station trains 10 times per level. The station upgrade unlocks once the set is done and starts a fresh set of 10. Stations no longer stop at Lv 3.

## B114: Rested for battle

Pip can't enter the arena while his fatigue is over 60. The Arena gate says so and shows his fatigue; rest him at his bed (a Berry Bun helps a little) and try again.

## Spent hearts still go home

This reverses B101: every heart Pip banks during a battle test goes home to the ranch, even hearts spent on upgrades between stages. Returning home banks all of them; falling in battle banks half. The stage-end gate shows the total collected.

## B113: No cap on ranch training

Ranch drills can now raise Heart Sense, Swift Pip, Star Power and Guardian Glow with no level limit, matching in-run upgrades. Drill station upgrades (★) still add +2 points per drill; there is no longer a cap for them to raise. Drill costs keep rising by one Heart Stone every three levels.

## Swift: +5 to Lv 10, then +1%

Swift Pip now adds +5 flight speed for each of levels 1–10, then +1% of current speed for every level after: 170 at Lv 0, 220 at Lv 10, 243 at Lv 20, 268 at Lv 30. This is the new default "tiered" pattern in Settings; the older flat and alternating patterns are still selectable. Saves still on the old +34 flat default switch over; custom settings are kept. The Settings preview now shows levels up to 30.

## B112: No cap on heart skills

Swift Pip, Star Power and Guardian Glow can now be bought at every stage with no level cap, like Heart Sense. Swift keeps adding its increase every level. Star Power keeps adding damage. Guardian Glow keeps speeding up shield recovery past its old floor with diminishing returns: past Lv 12, each level makes recovery about 5% faster than at Lv 12, down to a 0.25 s minimum.

## Pip starting speed 170

Pip's default flight speed drops from 285 to 170, a bit slower than you (205), so Swift upgrades and ranch Sky Laps training matter. Each Swift level still adds +34. Saves still on the old 285 default follow the new one; a custom speed set in Settings is kept.

## B111 follow-up: Thicker overgrowth

Each drill site now has a second, outer ring of 14 trees and shrubs (22 in all), offset from the inner ring so you have to cut a path through both. Site names draw on top of the growth, and you start a little north of the plaza.

## B111: Start at the ranch

The splash screen's Start (A / Cross) now takes you straight to the ranch; battle tests start from the Arena gate. The separate Pip Ranch button on the splash screen is gone.

## B110: Bag on Select

On a controller, the Select / View / Share button opens the ranch bag and closes it again. The Bag button reads "Bag · Select" while a controller is connected.

## B109: Pip actions on X

On the ranch, **A** is for information and menus, and **X** tells Pip to do the work. Stand by a tree with an axe and the prompt shows **X · Chop**; without one, only **A** shows and explains what you need. Pip walks over and works it out on screen: chopping takes 3 seconds of swings, with the tree jolting, chips flying and the tree toppling; cutting shrubs, tilling, watering and harvesting have their own shorter animations. Keyboard X, gamepad X/Square, or the green on-screen button on touch.

## B108: Stage curve and arena ranks

Difficulty after stage 3 now follows the stage number instead of hearts collected: it climbs steadily through stage 10 (tier ~2.3 to 10), then keeps rising more slowly (tier ~11 at stage 11, ~17 at stage 20). Hearts collected since stage 4 only nudge it, by at most 15%, so greedy runs feel hotter without hitting a wall. Stages 1–3 are unchanged at rank E.

Pick an **arena rank** at the Arena gate: E, D, C, B, A or S. Each rank adds 0, 2, 4, 6, 8 or 10 difficulty tiers from stage 1 and multiplies the hearts and Heart Stones banked at the ranch by ×1.0 to ×2.0. Clear stage 5 at your highest rank to unlock the next. The difficulty pill shows the tier, rank and heart nudge. See [the B108 blueprint](docs/B108-stage-curve-ranks.md).

## B107: Refinery timer at the stage gate

When a stage ends and you choose Next stage or Return to ranch, a live line shows the Heart Refinery back home: time to the next stone, how many batches are queued and when they will all be done, plus anything waiting in the tray.

## B106: Overgrowth and arena Heart Stones

Each drill site starts ringed by trees and shrubs you can't walk through; clear enough of them to open a path. Only Pip uses tools: he chops trees with an axe (♥ 50, +15 fatigue), cuts shrubs with a sickle (♥ 25, +8), tills (+8) and waters (+4). A Pip at 70+ fatigue won't do tool work, so each week's progress is limited. Heart Stones now fall in the arena too: a 10% roll at each 30-kill checkpoint and one from every boss. They bank like hearts: all of them when you go home, half after a fall. See [the B106 blueprint](docs/B106-overgrowth.md).

## B104–B105: Pip's needs and the ranch farm

Pip now has **hunger** and **hygiene** alongside fatigue. Every ranch week (a drill, a rest or a battle test) makes him hungrier and messier. Buy Pip Pellets, Berry Buns and Bubble Soap at the **food stall**, wash him at the **wash tub**, and press A at Pip to pet or feed him. A hungry or grubby Pip trains worse; a starving or filthy one starts battle tests with lower abilities.

Unlock new areas: the **Garden** (◆ 2) with six plots, the **Kitchen** (◆ 3) and the **Orchard** (★ 1). Buy a hoe, watering can and seeds at the stall, then till, plant and water. Watered crops grow one stage per ranch week: carrots (2 weeks), strawberries (3) and pumpkins (4). The orchard fruits every two weeks. Sell spare crops for hearts, or cook meals in the kitchen. Battle meals buff the next test (+20 max HP, 50% starting HEAT, Swift +1); ranch meals boost the next three drills. See [the B104](docs/B104-pip-needs.md) and [B105](docs/B105-ranch-farm.md) blueprints.

## B103: Ranch music

The ranch has its own soft, slow soundtrack: a 66 bpm loop in F major with warm pads, a gentle music-box arpeggio, a light bass and a simple melody every other pass. It plays on its own clock with a warmer, slightly echoey mix, and hands back to the arena music when a battle test starts. Mute still silences it. See [the B103 blueprint](docs/B103-ranch-music.md).

## B102: Heart Refinery

A Heart Refinery now stands on the ranch. Load hearts from battle tests: every 50 hearts refine into one Heart Stone on the real clock, 15 minutes each at refinery Lv 1 down to 10 seconds at Lv 10, even while you play the arena or are away. Each refining task has a 10% chance to add star dust; fuse 5 star dust into a Star Stone. Collect finished stones from the tray. Drills now cost Heart Stones. Star Stones upgrade the refinery (faster refining) and drill stations (+2 points per drill and +1 ranch cap per level, up to Lv 3). See [the B102 blueprint](docs/B102-heart-refinery.md).

## B101: Unspent hearts go home

Only hearts left unspent after in-run upgrades reach the ranch. The stage-end gate shows what Pip is carrying and what went into upgrades, and the ability shop reminds you that unspent hearts go home. Falling in battle still banks half of what is unspent. See [the B101 blueprint](docs/B101-unspent-hearts.md).

## B100: Ranch world

The ranch is now a pastel place you walk around. Walk up to a station and press A: Pip's bed to rest, the Arena gate for a battle test, or one of four drill stations. Pip drills solo (10 points on success, 5 on a stumble; tired Pips stumble more) or you train together in a short mini-game (15 points for a win, 5 for a loss). Ten points is one ranch level. Stand still near Pip to pet him. See [the B100 blueprint](docs/B100-ranch-world.md).

## B99: Pip Ranch

Raise Pip between runs. At the ranch, drills spend ranch hearts to raise the level Pip starts every run at for Heart Sense, Swift Pip, Star Power and Guardian Glow; each drill tires him and resting recovers. Battle test starts a run. After each stage's growth steps, choose Next stage or Return to ranch: going home banks every heart collected that test, falling in battle banks half and leaves Pip worn out. See [the B99 blueprint](docs/B99-pip-ranch.md).

## B98: Storm cloud cost

Each Thunderstorm cloud costs 8% of maximum HEAT; gathering pauses below 8%. Starting, each cloud and a full charge now flash and ring on screen, and the sky darkens as clouds gather. See [the B98 blueprint](docs/B98-storm-cloud-cost.md).

## B97: Sound Lab wallet home

The Notes / Sound Choices / Mix Choices row stays pinned while scrolling down, and returns to its home position whenever the top row of Pip Sounds is selected or scrolled back into. See [the B97 blueprint](docs/B97-sound-lab-wallet-home.md).

## B95: Heat readout

The skill button reads HEAT against the meter's maximum and fills with the whole meter. The top HEAT bar is a clear full-width gauge with a mark at the equipped skill's ignition point. See [the B95 blueprint](docs/B95-heat-readout.md).

## B94: Hold contract

Every skill ignites at 25% HEAT; Ascended Pip at 70%. Press fires, release ends, and a held skill keeps going below 25%. Beam and Guardian drain while held. Thunderstorm, Nova and Gravity Well charge while held, stop draining once full and strike only on release. Sound Lab audition buttons no longer show as blank white boxes. See [the B94 blueprint](docs/B94-hold-contract.md).

## B76: Pip notices

Pip learns within each run. Safe deliveries build confidence and commitment to fuller loads; rough trips create caution, favor safer heart sources and can lead to earlier returns. After a rough reunion he stays close briefly. Approach a burdened Pip steadily and he can recognize you coming, stop gathering and meet you with his cargo. Repeated halfway reunions make recognition faster.

His intentions appear beside him and his experiences are described in the existing pause view. Loving Rally and Supportive emergencies take priority. No new controls are required. ZaneGPT shaped this local emotional decision system; the game does not call a live language model. See [the B76 blueprint](docs/B76-pip-notices.md).

## B75: Immediate launch

The opening screen now keeps Start and Settings visible without scrolling at phone and desktop sizes. The goal and three controls are reduced to scan-level language while the original pointer, keyboard and controller routes remain unchanged. See [the B75 blueprint](docs/B75-launch-screen.md).

## B74: Heartfield

Ordinary enemies now drop zero to three heart value while preserving their previous average rewards. Two- and three-heart drops appear as layered clusters. After 2.25 seconds, nearby ordinary drops spiral into heart nodes holding up to eight hearts. Boss rewards remain individual hearts.

Pip picks up singles immediately and mines clusters or nodes one heart at a time. He chooses sources using value, distance and expiration pressure, keeps the existing one-heart cargo overflow, and banks each reunion as one clear delivery. Rally, Supportive emergency return, Ascended Pip, Gravity, Heart Relay, difficulty tiers and protected recovery caches share the same conserved heart accounting.

Open **Advanced Heartfield tuning** in Game Settings or pause Settings to change node radius, settle delay, node capacity and mining interval, or load Sparse, Balanced and Dense presets. See [the B74 blueprint](docs/B74-heartfield.md).

## B63: Partnership survival

Compassion adds 0.5 seconds of heart-meter duration per level instead of reducing
shield recharge delay. Supportive Pip drops cargo and immediately flies back
when shields fall below 2, using learned Pip attacks at orbit strength during
the return. He stays with you until shields recover to 2. Dropped hearts can be
recovered; they are not banked automatically. The 10% empty-heart speed penalty remains.

Stages 1–3 keep opening difficulty. Stages 4–10 gain one difficulty tier per
20 difficulty hearts, capped at tier 10. On entering stage 4, hearts banked in
stages 1–3 count at one-third value; subsequent hearts count normally. Spending hearts does not reduce
difficulty, and unbanked cargo does not increase it. Stage 11 onward resumes
the original stage/wave/boss scaling. See [the B63 blueprint](docs/B63-partnership-difficulty.md).

## B62: Lonely Pip

When Pip's heart meter is empty, he moves 10% slower after cargo slowdown.
The penalty applies while gathering and returning, and disappears as soon as
the meter has charge again. For example, 35% full-load speed becomes 31.5%
while lonely. Your saved movement settings remain in effect.

## B61: Movement settings

Open **Game settings** on the main screen or **Settings** in the Pip pause menu.
Adjust Pip's starting speed, Swift's flat and percentage increases and upgrade
pattern, the speed remaining at full cargo, and the player's normal top speed.
The table previews every Swift level before you press **Apply settings**.
Changes apply to the current run and save on this browser/device.

Use the **140 / +10 / 1% / 35% preset** to try alternating Swift growth, or
**Load B60 defaults** to restore the original movement. Press Apply after either.
With a controller, Y/Triangle opens main-screen settings; up/down selects controls,
left/right adjusts values, A selects buttons, and B/Start closes the menu.
See [the B61 blueprint](docs/B61-settings.md).

## B60: Heart transport

Pip carries hearts home in a loose cluster. Each heart weighs 3; starting
capacity is 10, and the last pickup may go slightly over. Full cargo halves
his flight speed. Move within 30px of Pip to bank his hearts early.

Heart Sense adds 2 capacity each level. Its range grows by 8px per level through
level 10, then 2px per level, capped at 200px. Swift Pip controls flight speed.
Heart Relay now lasts 0.5 seconds plus 0.1 per extra level, with an eight-second
trigger cooldown and a real delivery required.

Spend multiple Prism Seeds before choosing Continue. Sound Lab mixes now have
distinct recurring music parts in waves and boss fights, with free auditions.
Mix purchases automatically audition the changed part when audio is enabled.
See [the B60 blueprint](docs/B60-heart-transport.md).

## B59: Pip partnership

Raise Pip's emotional traits with Prism Seeds to develop three combat instincts:

- **Loving / Rally:** Pip returns as your bond weakens and briefly keeps it steady.
- **Compassionate / Cover:** nearby Pip intercepts a hit when you're vulnerable,
  then recharges. Watch the small blue recovery arc around Pip.
- **Supportive / Setup:** Pip prepares a gold diamond. Dash through it to finish
  a joint strike. Against Velvet Fang, Pip can draw its pounce; against Static
  Bloom, the diamond opens a passage through the petals.

Grump Star commits to aimed volleys, Velvet Fang stalks and pounces, and Static
Bloom fires petal patterns with visible gaps. Each develops a second phase.
Traits combine, and Ascended Pip amplifies the strongest learned instinct.

Move with WASD/arrows, the floating touch stick, or a controller. Dash with
Space, DASH, two taps/clicks toward a point, or the existing controller bindings.
Open the Pip pause view to inspect your learned instincts.

## Development

Requires Node 22 or newer.

```sh
npm ci
npm test
npm run build
npm run dev
```

Open `http://127.0.0.1:8176/` for the assembled game. `/qa` adds local-only boss,
trait and input fixtures, plus the same checks used by CI. QA controls are never
included in the deployed site.

The Pages workflow assembles the numbered `b21-*.js` modules in order. B59 adds
`b21-46.js` (Pip decisions), `b21-47.js` (bosses) and `b21-48.js` (presentation and
the final simulation guard). See [the blueprint](docs/B59-partnership.md).
