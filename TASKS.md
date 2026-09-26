# OD76 Active State

## Ready

- Brain installed and linked in full mode.
- Brain stance set to brief.
- `AGENTS.md` and `HANDOFF.md` cover both Codex and Claude Code; work moved to Claude Code at B84.
- Canonical OD76 `main` imported at B74 commit `4ff9a11`.
- B75 Immediate Launch published and verified at `457fb14`.
- Fifteen additional ZaneGPT loops are publicly verified through B91 Wave Closeout.
- B93 Thunderstorm Charge is publicly verified as a direct user-requested build.
- B94 Hold Contract is a direct user-requested build: 25% ignition, 70% Ascended Pip, charged Nova/Gravity, Sound Lab audition buttons styled. Deployed to Pages.
- B95 Heat Readout is a direct user-requested build: button reads HEAT / max and fills with the whole meter; prominent top HEAT bar with ignition mark. Deployed to Pages.
- B96 Sound Lab Scroll is a direct user-requested build: the wallet row scrolls with the Sound Lab instead of sticking. Deployed.
- B97 Sound Lab Wallet Home: the wallet row pins while scrolling down and returns home when the top Pip Sounds row is selected or scrolled back into. Deployed.
- B98 Storm Cloud Cost: each cloud costs 8% HEAT, gathering pauses below 8%, start/full flashes and storm visuals.
- B99 Pip Ranch: OD76's Monster Rancher core. Ranch drills/rest, battle tests, Return to ranch after stage clears, half-bank on death.
- B100 Ranch world: walkable pastel ranch, stations, solo drills or together mini-games (±5 bonus), petting Pip.
- B101 Unspent hearts: only hearts not spent on in-run upgrades bank at the ranch.
- B102 Heart Refinery: hearts → Heart Stones on the real clock, star dust → Star Stones, drills cost stones, refinery and station upgrades.
- B103 Ranch music: soft 66 bpm F-major loop while at the ranch.
- B104 Pip needs: hunger and hygiene, food stall, wash tub, bag, Pip care menu, battle-test week.
- B105 Ranch farm: garden/kitchen/orchard unlocks, tools, seeds, crops by ranch week, meals with battle and ranch buffs.
- B106 Overgrowth: obstacle rings around drill sites, Pip-only tool work with fatigue, arena Heart Stone drops.
- B107 Gate refinery timer: live refinery status on the stage-end gate.
- B108 Stage curve and ranks: stage-driven difficulty curve (sublinear past 10), ≤15% heart nudge, arena ranks E–S with reward multipliers.
- B109 Pip actions: X runs Pip jobs (chop 3s, cut, till, water, harvest) with animation; A is info.
- B110 Bag on Select: controller Select toggles the ranch bag.
- B111 Start at the ranch: splash Start opens the ranch; runs start at the Arena gate.
- Thicker overgrowth: 22 obstacles per drill site (outer ring of 14).
- Pip default starting speed 170 (was 285); old-default saves migrate.
- B112 Uncapped heart skills: Swift, Star Power and Guardian Glow have no level cap.
- Modules now assemble in numeric order (b21-99 before b21-100) in build, tests and workflow.
- Swift default: +5 per level for Lv 1–10, then +1% per level (tiered pattern).
- B113 Uncapped ranch training: no level cap on ranch drills; station upgrades add points only.
- B101 reversed: all hearts collected in a test bank at the ranch, spent or not.
- B114 Rested for battle: the Arena gate refuses Pip above 60 fatigue.
- B115 Playtest pass (`b21-103`–`b21-107`): softer spawn ramp after stage 3; HEAT auto-regen plus a basic-attack combo chain (tiers 1x–5x); per-stage fatigue, hunger and cleanliness toll with gate meters; themed need debuffs; sleep costs 15/15; drill sets of 10 with uncapped station upgrades.
- B115 fix: HEAT regen is 1 point every 3 s up to 20% of the meter (+1% per Constellation level) and pauses 3 s after any skill.
- B116 Playtest pass two (`b21-108`–`b21-112`): Thunderstorm levels and per-cloud charge with a Lv 3 chain; skill button fills toward the ignition line; Beam needs a target and scales with level; Fang's dash freeze; food follows HEAT spent and cleanliness follows kills, hits and bosses; shop cursor, owned counts, ranch sounds, timed feeding and washing.
- B117 Playtest survey (`b21-113`): in-game survey from the ranch Bag, stats tracked automatically, copy or share the answers.
- B117 Guardian fix (`b21-114`, no new build number): Pip is the Guardian — tiered blocks, 10% return cap, break stun, release/break pulses.
- B117 Storm fix (`b21-115`): no instant strike; clouds drift to targets at half player speed.
- B117 Hold fix (`b21-116`): boss rewards, Pip traits and heart skills buy on a completed hold.
- B117 Input guard fix (`b21-117`): 0.7s of ignored input when a stage ends.
- B117 Needs fix (`b21-118`): a ranch week that starts at 0 food or 0 clean adds +10 fatigue each.
- B117 Survey fix (`b21-119`): ranch time split into idle, clearing obstacles, farming and training; solo vs together counts per drill station.
- B117 Pet fix (`b21-120`): petting Pip can give a Star Stone, +1% per 15 arena min and per 500 kills since the last one.
- B117 Refinery fix (`b21-121`): 2 refining slots at Lv1, 3 at Lv5, 4 at Lv10.
- B117 Setup paused (`b21-122`): More Supportive no longer prepares openings; switch back on with `pipSetupOnB117u=true` when reintroduced.
- 342 automated checks pass across all 122 ordered modules.
- Browser checks cover full cloud gathering and chained strike scenes at desktop and mobile sizes.

## Next

1. Continue the authorized **50 additional ZaneGPT build loops**. `docs/AUTONOMOUS-BUILDS.md` is the progress authority; 15 of 50 loops are verified.
2. Select loop 16 / B99 from the B98 baseline. No gameplay implementation is currently unfinished.
3. The continuation heartbeat is `od76-finish-50-zanegpt-build-loops`; pause it after 50 verified loops. Do not add controls, persistent affection scores or a live model without further design discussion.

## Constraints

- Keep replies brief unless the task requires detail.
- Do not read Brain repos directly.
- Do not edit `CLAUDE.md`; Brain manages it.
- Do not run broad scans before source exists.

## Brain Follow-Up

OpenAI-owned Brain proposals fixed this session:
- `2026-08-15__concise-direct-conversation-default.md`
- `2026-08-19__game-build-loop-closes-on-public-state.md`

Latest validation state: both were no longer held and were waiting on the steward.
