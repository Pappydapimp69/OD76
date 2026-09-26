# OD76 Project Map

## Purpose

Standalone OD76 game workspace with Brain/GitHub workflow intact and compact agent context. Built through Codex to B83, worked on in Claude Code from B84.

## Source Map

- `index.html`: base shell and original launch/stage/end markup.
- `b21-*.js`: numerically ordered gameplay modules and late overrides; see `docs/AUTONOMOUS-BUILDS.md` for the active release.
- `scripts/build.mjs`: syntax-checks and assembles `_site/game.js` with the release stamp.
- `tests/verify-b59.cjs`: complete JSDOM regression entrypoint.
- `tests/*-checks.js`: focused gameplay, settings, survival, Heartfield and launch contracts.
- `.github/workflows/pages.yml`: test, assemble and deploy GitHub Pages.
- `docs/`: versioned build blueprints and pending state.
- `AGENTS.md`: agent operating instructions, environment-independent.
- `CLAUDE.md`: Brain-managed pointer created by `brain link`; do not edit manually.
- `TASKS.md`: active state and next work queue.
- `HANDOFF.md`: compact takeover context and the per-environment toolchain.
- `.brain/`: ignored local Brain link/cache.

## Brain State

- Mode: full
- Stance: brief
- Current issue: some global Brain proposals remain in intake/held state. OpenAI-owned fixed proposals are waiting on steward, not held.

## Current Build

B93 adds `b21-82.js`: Thunderstorm now gathers up to five clouds across a one-second hold, spends at most 20% HEAT, launches on release, seeks random targets and ricochets by Constellation level. Quick taps strike once without ricochet; a 1.25-second cooldown prevents spam. Regression and desktop/mobile browser fixtures cover charge, release, chaining, pause and focus loss.

B94 adds `b21-83.js`: every basic skill ignites at 25% HEAT and Ascended Pip at 70%. Beam and Guardian drain while held; Thunderstorm, Nova and Gravity Well charge while held, stop draining when full and strike on release. Sound Lab audition buttons get the game's button style.

B95 adds `b21-84.js`: the skill button reads HEAT against the meter maximum and fills with the whole meter; the top HEAT bar is a prominent gauge with an ignition mark.

B96 adds `b21-85.js`: the Sound Lab wallet row scrolls with the page instead of sticking to the top.

B97 adds `b21-86.js`: the Sound Lab wallet row pins again while scrolling down, and snaps home when the top Pip Sounds row is selected or scrolled back into.

B98 adds `b21-87.js`: Thunderstorm clouds cost 8% HEAT each, gathering pauses below 8%, and charging gets start/cloud/full flashes, a darkening sky and arcing lightning.

B99 adds `b21-88.js`: the Pip Ranch, OD76's core change. Ranch drills set Pip's starting ability levels, stage clears offer Return to ranch, and deaths bank half the run's hearts. `tests/ranch-checks.js` covers it.

B100 adds `b21-89.js`: the ranch becomes a walkable pastel world with stations, Pip following you, drill points, solo drills and together mini-games.

B102 adds `b21-90.js`: the Heart Refinery (real-time hearts → Heart Stones, star dust → Star Stones), stone-priced drills, and refinery/station upgrades.

B103 adds `b21-91.js`: the ranch's own soft music loop on the shared audio engine.

B104 adds `b21-92.js`: hunger and hygiene, the week hook, food stall, wash tub, bag and Pip's care menu.

B105 adds `b21-93.js`: unlockable garden, kitchen and orchard; tools, seeds, crops and meals.

B106 adds `b21-94.js`: overgrowth around drill sites with collision, Pip-only tool fatigue, and arena Heart Stone drops.

B107 adds `b21-95.js`: a live Heart Refinery status line on the stage-end gate.

B108 adds `b21-96.js`: the stage-driven difficulty curve, bounded heart nudge and arena ranks. It supersedes B63's heart tiers and the stage-11 legacy formulas.

B109 adds `b21-97.js`: X-button Pip actions with timed animations; A stays for info.

B110 adds `b21-98.js`: controller Select toggles the ranch bag.

B111 adds `b21-99.js`: splash Start opens the ranch; runs start only from the Arena gate.

B112 adds `b21-100.js`: no level cap on Swift, Star Power or Guardian Glow; Guardian Glow gains diminishing returns past Lv 12. Modules now assemble in numeric order.

B113 adds `b21-101.js`: no level cap on ranch training; station upgrades add +2 points per drill only.

B114 adds `b21-102.js`: Pip can't enter the arena above 60 fatigue.

B115 Playtest pass adds five modules:
- `b21-103.js` (spawn ease): past the opening stages, spawn pressure climbs half as fast.
- `b21-104.js` (heat flow): HEAT regen of 1 point every 3 s up to a 20% ceiling (+1% per Constellation level), a 3 s pause after any skill, and the basic-attack combo chain with tiers 1x–5x.
- `b21-105.js` (needs never lock): sleep costs 15 hunger and 15 cleanliness.
- `b21-106.js` (drill sets): 10 trainings per station level; the upgrade unlocks at 10 and resets the set; station levels are uncapped.
- `b21-107.js` (stage toll): per-stage fatigue, hunger and cleanliness costs, gate meters, a fatigue-100 stop, and themed debuffs.

B116 Playtest pass two adds five modules:
- `b21-108.js` (storm levels): clouds by level, per-cloud charge delay, tap auto-charge, and the Lv 3 chain.
- `b21-109.js` (skill readout and Beam): the threshold readout on the skill button, the Beam target gate, and Beam scaling by level.
- `b21-110.js` (boss dash freeze): Fang's yellow lane freezes the player for 2.2 s.
- `b21-111.js` (stage appetite): food follows HEAT spent; cleanliness follows kills, hits and boss stages.
- `b21-112.js` (ranch comforts): shop cursor, owned counts, ranch sounds, and 3 s feed/wash locks.

B117 adds `b21-113.js`: an in-game playtest survey opened from the ranch Bag. It tracks play stats in localStorage, fills them in automatically, and lets the player copy or share the answers.

The B117 Guardian fix adds `b21-114.js`: Pip becomes the Guardian. Tiered blocks charge after Pip returns, the flight costs at most 10% HEAT, a break stuns Pip 1.8s, and release/break fire distinct pulses.

`b21-115.js` (B117 fix): Thunderstorm clouds always travel to their target at half the player's speed before striking.

`b21-116.js` (B117 fix): hold to confirm for boss rewards, Pip traits and heart skills between stages.

`b21-117.js` (B117 fix): pointer, keyboard and gamepad input is ignored for 0.7s when the stage-end upgrade screen opens.

`b21-118.js` (B117 fix): a ranch week that begins with food or cleanliness at 0 adds +10 fatigue for each.

`b21-119.js` (B117 fix): the playtest survey splits ranch time (idle, clearing obstacles, farming, training) and counts solo vs together trainings per drill station.

## Access Pattern

1. Read `AGENTS.md`, `PROJECT_MAP.md`, `TASKS.md`, and the relevant blueprint.
2. Run one targeted `brain query` for the task.
3. Use `rg` before broad reads.
4. Run `npm test` and `npm run build` before publishing.
