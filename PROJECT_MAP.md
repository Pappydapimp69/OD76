# OD76 Project Map

Development index only. This file is not loaded by the game.

## Start here

- Current release: `B182-TOUCH-TAP-GUARD`.
- Next numbered runtime file: `b21-195.js`.
- Production assembly: `scripts/build.mjs` concatenates `b21-N.js` files in numeric order, then writes `_site/`.
- Pages deployment: `.github/workflows/pages.yml` calls the same build script.
- Focused checks are the default. Run the complete suite only when the user explicitly requests it.
- `b21-128.qa-controller-local.js` is intentionally excluded by the build filename pattern and is user-owned; do not touch it.

## Authority rule

Later modules win when they reassign a function. Before editing an older definition, search for later assignments:

```text
rg -n "functionName\s*=|function functionName" -g "b21-*.js" .
```

Do not remove historical modules. Add the smallest late override, update this map, and add a focused check. Search a proposed global name before declaring it; concatenated files share one global scope.

## Build and release

| Area | Authority | Notes / checks |
|---|---|---|
| Ordered bundle | `scripts/build.mjs` | Numeric order; syntax-checks the assembled bundle. |
| Pages | `.github/workflows/pages.yml` | Must call the shared build script; do not duplicate build stamps here. |
| Current release layer | `b21-146.js` | Playtest trust pass: stage-summary recovery, fixed-energy skill costs, status refresh, kitchen recipe visibility, late-ranch care relief and soft boss adaptation. |
| Fatigue scale (B130) | `b21-148.js`, caps in `b21-124.js` (B118 endurance) and farm adders in `b21-88/89/90/92/94/118.js` | Farm and arena share one fatigue number capped at `fatigueMaxB118()`; farm bars fill fatigue/max and grow 1% per 15 over 100; chop drops tree 50% / shrub 70%; arena snacks −30; gate label Fatigue. | `tests/b130-focused-checks.js` |
| Overdrive mastery (B131) | `b21-149.js`; ignition gate edited in `b21-83.js`/`b21-84.js`, Gravity mass cap in `b21-143.js` | Basic skills: level 1-5 × 5 mastery tiers (uses + stars), level-up ★10. `S.b131[id]={lv,t,u}`; `S.overLevels` now holds the old-kit feature level (L1 tiers → old Lv1-5). Power/reach/flair/signature from L2+ tiers; ignition 25%−(lv−1); regen 3s −0.1s per tier 3. Pip Ascendant unchanged. Interim card text until B132. | `tests/b131-focused-checks.js` |
| Overdrive page (B132) | `b21-150.js` over `#overdriveStep` (old `overChoice*` cards hidden, still rendered) | Tile strip + one detail panel; main button `#b132Main` joins B117h hold-to-confirm (`#b132Why` when not affordable: plain press explains); Equip, More, ? rules, Continue. Keys [ ] / Q E switch skill, Esc closes; pad LB/RB switch, Start continues, Select rules, B closes. Inner classes are all `b132*` (the game owns `.top`). | `tests/b132-focused-checks.js` |
| Ascension (B133) | `b21-151.js`; Ascend/Ascended UI in `b21-150.js` | Level 5 + 5 tiers → Ascend (★10). Saved in `localStorage['od76-ascension-b133']` = `{v:1,asc:{id:0-5}}`, clamped on load. Each ascension starts the skill unlocked one level higher (`S.b131[id].base`); 5 = starts Ascended, nothing to master. Uses per level by start ascension 10/13-12/14-13/15/30; the asc-4 run doubles tier stars and Ascend (50★). Overrides `nextStepB131`/`masteryStepB131`. | `tests/b133-focused-checks.js` |
| Skill names on focus (B134) | `b21-152.js` over `b132TileHTML` | Each Overdrive tile carries a `.b134Tip` with its full name, shown on gamepad focus, keyboard focus-visible or mouse hover. | `tests/b134-focused-checks.js` |
| Between-stage polish (B135-B136) | `b21-153.js`, `b21-154.js` | Snack feed is a hold; Sound Lab auditions hidden. Traits/Hearts/Boss cards compact (2-line effect); eyebrow = step counter (`stepsB136`); Sound Lab chips in title, folds when nothing affordable; shop enter/skip/exit taps (reverted by B138); gate focus starts on Next stage. Shared UI sounds `uiSoundB136(kind)` with per-kind cooldowns. Decoration runs on a 200ms tick. | `tests/b135-focused-checks.js`, `tests/b136-focused-checks.js` |
| Drill-site labels (B137) | `b21-155.js`; B106 loop in `b21-94.js` now gated by `siteLabelsInWorldB137()` | Site names draw in world space after the ranch (not inside Pip's B109 swing transform); only the chopped site's label jolts. | `tests/b137-focused-checks.js` |
| Hold everywhere (B138) | `b21-156.js` | Every acting button between stages (Continue on each step, Equip, Next stage, Return to ranch, shop Enter/Skip/Exit) joins B117h hold; tile pick, More, ?, Show sounds stay taps. Untrusted (code) clicks on those buttons pass, via `window.event`. | `tests/b138-focused-checks.js` |
| Attacks on screen (B139) | `b21-157.js` | `hitEnemy` ignores player/pip/overdrive/burst/sound hits on enemies with no part in view; `nearestEnemyFrom`/`getAutoTarget` pick only on-screen enemies; player/Pip shots are removed at the screen edge. | `tests/b139-focused-checks.js` |
| Soft chop (B140) | `b21-141.js` clear fx | Felled tree plays two quiet sines (no square wave); shrub rustle halved. | `tests/b140-focused-checks.js` |
| Ranch tired line (B141) | `b21-158.js`; every `B99_TIRED` check in `b21-88/89/90/94/131.js` now calls `tiredLineB141()` | Tired = 70% of `fatigueMaxB118()` (70 at 100, 98 at 140): drills/tools refused, tired mood, lines, sprite. | `tests/b141-focused-checks.js` |
| Scent Hunt sparkles (B142) | `b21-159.js` over `drawRanchB100` | Unclaimed sparkles draw on top of the field: bigger, dark-gold outline, pulsing glow, bold pink ✿; decoys unchanged. | `tests/b142-focused-checks.js` |
| Bag list (B143) | `b21-160.js` over `bagSheetB104` | Bag sheet's text line becomes `#bagListB143`: one row per owned tool (first) and item, with icon, name, count and use. | `tests/b143-focused-checks.js` |
| Tool wear (B144) | `b21-161.js` over `clearObstacleB106`, `buyToolB105`, ranch load/default | Axe and sickle: 5 clears each (`ranchB99.toolUses`), the fifth breaks and discards the tool; buy resets to 5; missing/invalid saved counts load as full; bag shows uses left. | `tests/b144-focused-checks.js` |
| Scent Hunt speed (B145) | `b21-162.js` over `pipHuntSpeedB125`; tired ×0.6 removed from the collect branch in `b21-131.js` | Speed = (90 + 4·Swift) × fatigue (1 → 0.6 at max) × hunger (1 at Food 60+ → 0.6 at 0). | `tests/b145-focused-checks.js` |
| Ranch time split (B146) | `b21-163.js` over `ranchBucketB117r` | B109 jobs decide the bucket before Pip's 'drill' state: chop/cut → clearing, till/water/harvest → farming; feed/wash care → new `ranchCare`. B133's `b133Clear` path never fires (menu chops reroute to B109). | `tests/b146-focused-checks.js` |
| Analytics batching (B147) | `b21-164.js` replaces `trackB136`; `no_onload:true` in `b21-147.js` | GoatCounter events wait in `pendingB147` and are sent only when an arena run ends (`finish` / `bankRunB99`); no page-load hit; events pending at page close are dropped; 600 cap unchanged. | `tests/b147-focused-checks.js` |
| Sound Lab bonuses (B148) | `b21-165.js` CSS over B136 | Pip Sound cards show the mix bonus (`.b58Pairing`, up to 3 lines) instead of the flavour line; Mix Layer cards compact, flavour hidden on phones. | `tests/b148-focused-checks.js` |
| All done here (B149) | `b21-166.js` over `holdButtonB117h`, 200ms decorate tick | Traits/Hearts/Sound Lab/Overdrive with nothing affordable: Continue becomes a tap, 'Nothing left to buy here' banner, cards dimmed, Continue reads 'Tap to continue'. Reverts when something becomes affordable. | `tests/b149-focused-checks.js` |
| Shop feedback (B150) | `b21-167.js` over `buyItemB104`, `buyToolB105`, `buySnackB118`, `buyArenaDustB126` | Successful buys chime (880→1320 Hz) and pop a '+ icon name' badge over the shop with a gold flash. Restores 'HOLD TO CONFIRM' on merchant Enter/Skip/Leave. | `tests/b150-focused-checks.js` |
| Refinery upgrade time (B151) | `b21-168.js`; replaces `upgradeRefineryB102`, wraps tick/sanitize/sheet | Upgrade takes the owner's times (Lv2 15, Lv3 20, Lv4 30, Lv5 40, Lv6 60 min; `B151_UPGRADE_MINUTES`) on the real clock; max refinery level is 6 (`B102_REFINERY_MAX` in `b21-90.js`, B152); refining continues at the old level; at the switch, running batches keep their old end time (start shifted; ticks skip while a shifted start is in the future). Stone times 15 min −2 min/level (`B102_REFINE_SECONDS`, B153). `refinery.upgradeTo/upgradeUntil` saved, capped on load; 'ready' toast waits for the ranch (`upgradeNotice`). | `tests/b151-focused-checks.js` |
| Refine minimum (B155) | `b21-169.js` over `loadHeartsB102` and the refinery sheet | A load must be at least ♥50×2^(level−1) (50/100/200/…/1600); still ♥50 per stone; smaller or unaffordable loads refused; sheet offers the minimum load and Refine all, or says what's needed. | `tests/b155-focused-checks.js` |
| Timed fuse (B156-B157) | `b21-170.js`; `ranchB99.fuse={queue,startedAt}` | Player starts fusing at the refinery (Fuse ✧5 or Fuse all); each ★1 comes 15 min after the last (real clock, catches up while away); dust reserved on start; completion via `fuseStarB102` (stats/analytics). Never automatic. | `tests/b156-focused-checks.js` |
| Refinery cards (B158) | `b21-171.js`; `decorateRefineryB158`, `updateRefineryB158` | Refinery sheet = header (Lv, speed) + wallet + cards (Tray, Hearts → ◆, Dust → ★, Upgrade) holding their own buttons; options sorted by card, labels unchanged, old `<p>` kept hidden. Live bars/timers every 0.25 s; redraws on state change keeping focus. `b158` class removed on every `openSheetB100`. | `tests/b158-focused-checks.js` |
| Sound Lab unfold (B159) | `b21-154.js` `decorateStageB136` | The empty-fold check removes `b136Empty` before measuring (folded cards have no `offsetParent`, so the lab stayed folded all run once folded). | Browser check only (JSDOM has no layout). |
| Stage card fit (B160) | `b21-172.js` `fitStageCardB160` | Landscape + coarse pointer only: stage card takes 94vw and CSS `zoom` up to 1.6× while the step fits in 95% of the height (falls back to 1× full width). Re-fits on step/button-count/viewport change. | Browser check only (JSDOM has no layout). |
| Bag gamepad scroll (B161) | `b21-173.js` `focusSheetB100` wrap | Bag open: nav down scrolls `#bagListB143` a row until the end, then moves focus; nav up on the first button scrolls back. All ranch sheets scroll the focused button into view; short landscape screens get taller sheets/bag list. | Browser check only (JSDOM has no layout). |
| Erase progress (B162) | `b21-174.js` `eraseProgressB162` | Launch screen button under Start, tap twice (arms 4 s). Removes `overdrive76*`/`od76*` keys except movement/heartfield settings, then reloads. | `tests/b162-focused-checks.js` |
| Colosseum (B163) | `b21-175.js`; wraps `interactStationB100` (gate sheet gets a Colosseum option while `arenaReadyB114()`), `update`/`draw` (own loop while `colB163.active`), `reset` | Rival-Pip 8-entrant brackets per unlocked rank, fold seeding (`B163_FOLD`), seeded fight sim on its own sfc32 stream (`rngB163`); coach A Focus / X Ascend / B Guard (`#ranchGuardB163`, id must start with `ranch`). 4% max fatigue per fight; prizes ◆1/2/4 × rank reward; never unlocks ranks. Tuning in `B163_T`. Save `localStorage['od76-colosseum-b163']={v,seed,wins,best}`. | `tests/b163-focused-checks.js` |
| Colosseum building + tutorial (B164) | `b21-176.js`; station `colosseum` pushed to `B100_STATIONS`; wraps `interactStationB100` (strips B163's gate option), `nearestInteractB100`, `updateRanchB100` (one-time reveal), `drawStationB100`, `stepFightB163`/`updateColB163`/`drawColB163`/`roundNameB163` for the tutorial | Locked until `ranchB99.rankUnlocked>=1`. Tutorial vs Sprout: Focus → Ascend → Guard, steps pinned to Pip's own commands; no fatigue or prize. Flags `colSaveB163.tutorial/revealed` in the B163 save. B164 also latches coach presses in `b21-175.js` (`c.pendFocus/pendAscend`). | `tests/b164-focused-checks.js` |
| Colosseum look + gamepad (B165) | `b21-177.js`; replaces `drawColB163`; wraps `updateColB163` (pause phase, button labels), `openSheetB100` (iron style class `b165`, device button names), `toggleBagB110` (off in the ring), `ranchInputB100` (device detection), `PipAudioEngine.prototype.scheduleStep` (war drums while `colB163.active`) | Iron-and-ember renderer with its own fx state (`colB163.fx`); pause via Start / P / `#ranchPauseB165`; prompts from `btnB165()`; shake off under reduced motion. | `tests/b165-focused-checks.js` |
| Colosseum tutorial lessons (B166) | edited in place: `b21-176.js` (`B164_STEPS` lesson data: `kind` card/drill, `say`, `btn`, `enter`/`each`/`sprout`/`done`, `show`; generic `stepFightB163`/`updateColB163` lesson engine) and `b21-177.js` (card and drill plates, `wrapB165`, ▶ NEXT label) | Twelve lessons; cards freeze the fight and need A after 0.35 s; drills finish on Pip's own state. | `tests/b164-focused-checks.js`, `tests/b165-focused-checks.js` |
| Arena Ascension perks (B167) | `b21-178.js`; wraps `pipEntrantB163` (adds `perks` from `ascB133`), `shotDamageB163`, `senseB163`, `landShotB163`, `stepFightB163`, `openSheetB100` (perk list), `drawColB163` (Chain arcs, intro line) | Beam→Focus, Thunderstorm→Chain, Guardian→Guard, Nova→Ascension, Gravity Well→HEAT; strengths in `B167_K`; rivals have none. | `tests/b167-focused-checks.js` |
| Ranch work → Colosseum (B168) | `b21-179.js`; wraps `pipEntrantB163` (adds `labour` {tf,sf} from `ranchB99.cleared`), `shotDamageB163`, `landShotB163`, `stepFightB163`, `openSheetB100` (Colosseum and tree/shrub sheets), `drawColB163` (intro line) | Shrubs cut → Guard (drain, block); trees felled → Ascension (time, damage); scales with share of `B106_OBSTACLES` cleared; strengths in `B168_K`. | `tests/b168-focused-checks.js` |
| Colosseum sheet layout (B169) | `b21-180.js`; outermost `openSheetB100` wrap for the `Colosseum ⚔` bracket sheet: blanks the text, renders `colosseumBodyB169()` rows/tiles into the `<p>` (class `b169`), relabels bracket buttons (`bracketLabelB169`) | Cost / Prize / Coach rows; Pip's edge tiles (Guard, Ascension, Arena skills, Trophies). | `tests/b169-focused-checks.js` |
| Sound engine DSP (B170) | `b21-181.js`, **generated** by `scripts/vendor-sound-engine.mjs <sound-engine checkout>` from `Pappydapimp69/sound-engine` `src/dsp`; exposes `SoundEngineDSP` | Never hand-edit; re-run the script after changing sound-engine. | `tests/b170-focused-checks.js` |
| Colosseum sound (B170) | `b21-182.js`; sliced offline renders (`jobsB170`, `pumpB170`), bus + FDN convolver (`connectBusB170`), `playB170`, crowd bed (`bedB170`), event/hit cues (`colSoundTickB170`); wraps `cheerB163`, `update`, `PipAudioEngine` untouched (music bus gets a reverb send while active) | Starts rendering on the first Colosseum sheet/bracket/tutorial; tones stand in until ready. | `tests/b170-focused-checks.js` |
| Analytics fix (B171) | `b21-183.js`; wraps `bankRunB99` (home bank sends `run/end/home` + `run/skill-uses` via `runEndB171`), `trackB136` (`run/start` drops the skill), flushes `pendingB147` on `pagehide`/hidden | Fall path still reports through the B136 `finish` wrap. | `tests/b171-focused-checks.js` |
| Wave reached (B172) | `b21-184.js`; wraps `runEndB171` and `finish` to send `run/wave-reached/rank-X/stage-S/wave-W` (wave within the stage, `boss`, or `cleared` at the stage break) once per run end, plus `sess/<id>/run-N/...` and `sess/<id>/start/...` with a random per-page-load id (`sessIdB172`, memory only) | Home, fall and complete all report. | `tests/b172-focused-checks.js` |
| Sheet tap guard (B173) | `b21-185.js`; wraps `openSheetB100` (stamps a fresh open), capture `click` on `#ranchSheetB100`, capture `pointerdown` on window | A sheet button ignores a pointer click (detail>0) whose pointer went down before the sheet opened, so the opening tap can't hit Back or Fuse all. Redraws while open stay armed; keyboard/gamepad/code clicks pass. | `tests/b173-focused-checks.js` |
| Refinery slots (B174) | `b21-186.js`; `ranchB99.slots[5]={kind,n,made,start,dur}`; replaces `loadHeartsB102`/`startFuseB156` (first slot that fits), `refinerySlotsB117f`, `refineryGateTextB107`; wraps `tickRefineryB102`, `updateRanchB100`, `refinerySheetB102`, `openSheetB100`, `chooseSheetB100`, `updateRefineryB158`, `refineSignB158` | Hearts or dust per slot, one timer (`refineSecondsB102`) per load, units drip evenly; top-up restarts the timer on what's left. Cap ♥300/✧30 ×2 per level; Min = B155 minimum (✧5); Max = space or holdings. Slots 2/2/3/4/5/5. Tiles replace the B158 wallet; Refine/Fuse cards hidden; tile → `Refinery · Slot N` sheet (Min/Max; Back / Exit returns to the refinery). Old queues refunded once on load. Supersedes the B155/B156/B158 refine/fuse checks (those now fail by design). | `tests/b174-focused-checks.js` |
| Skip empty pages (B175) | `b21-187.js`; `B175_PAGES`, MutationObserver on step classes, `S.b175={stage,skipped,peek}`; wraps `openStageUpgrade`, `stepsB136` | Traits/Hearts/Sound Lab/Overdrive (B149 out-of-options) and Merchant (♥ below cheapest snack/dust) are skipped via their own advance functions; shown pages get a `.b175Note`; Head out gets `#b175Saving` (cheapest cost, bar, Peek). Peek = page look-only + `#b175Back`. Checks set `stageInputLockMsB117i=0`. | `tests/b175-focused-checks.js` |
| Shorter holds + survey (B176) | `b21-188.js`; wraps `beginHoldB117h`, `beginSoundLabHoldB45`, `statsTextB117`, `detailB117` | Nav holds 0.4s, buys 0.6s (Sound Lab too), Ascend (`b132Main` reading Ascend) 1.8s; B117q repeats capped at these. Survey: "100% fatigue". | `tests/b176-focused-checks.js` |
| Full upgrade text (B177) | `b21-189.js`; `.b177Detail` under Traits/Hearts/Boss Bond grids; wraps `focusGamepadButtonB35`, `openStageUpgrade`; 200ms decorate | Shows the full effect of the card last touched / focused / hovered (default first card); re-read every tick so levels and costs stay current. | `tests/b177-focused-checks.js` |
| Colosseum rework (B178) | `b21-190.js`; `B178` tunables; wraps `bracketB163` (archetypes dealt from the bracket seed), `rivalB163` (scaled stats, asc, mirrored perks/labour, `trick`), `aiCmdB163` (Breaker focus-into-guard, Feint wind-up), `landShotB163` (Breaker full damage + crack), `drawPipB165` (wind-up ring) | Middle rival = max(rank budget, Pip total × 0.88); rivals get Pip's trophy Ascension and 75% of his perks/ranch work, so B167/B168 checks asserting bare rivals now fail by design. Feint winds up only while Pip can guard; every other wind-up is fake and breaks a guard raised against it. Sweeps: good scripted coach ~25-37% brackets once scaling applies (QF ~100, SF ~70-75, F ~36-49), none 0%; ranks D/B sit on fixed budgets (~50%). Scripted good vs careless coaches score about the same: tricks need a live playtest. | `tests/b178-focused-checks.js` |
| Slots survive reload (B179) | `b21-191.js`; `localStorage['od76-refinery-slots-b179']={v:1,slots}`; wraps `saveRanchB99`, `loadRanchB99` | Early modules (b21-124 etc.) save the ranch blob during page load before b21-186 adds `slots`, wiping them; slots now also live under their own key, restored last. Lesson: a field added by a late module must not rely on the shared blob surviving page load. | `tests/b179-focused-checks.js` |
| Trophy uses (B180) | `b21-192.js`; `localStorage['od76-trophy-spent-b180']={v,spent:{rank:n}}`; trophies left = `colSaveB163.wins[rank]` − spent; wraps `renderB132` (`#b180Trophy`, B117h hold), `stepOutOfOptionsB149` (Overdrive not skipped while a trophy can be spent) | Rank locked to `runRankB108()`; +5 uses on the selected unlocked skill's current tier; ★ costs unchanged. Existing championships count as trophies. | `tests/b180-focused-checks.js` |
| Trophy counts in the Colosseum (B181) | `b21-193.js`; wraps `colosseumBodyB169` (Trophies tile = spendable total + ranks won), `bracketLabelB169` ('🏆 N won · M to spend'), `endColosseumB163` (champion toast names the new trophy) | B169's label check expecting '🏆 ×N' now fails by design. | `tests/b181-focused-checks.js` |
| Touch tap guard (B182) | `b21-194.js`; window capture `click` + `lastInputB182` (pointerdown/keydown) + `staleTapB182` | Real touch: the opening tap's retargeted click has detail 0, which B173 let through; now a trusted click in `#ranchSheetB100` is blocked when the last input was a pointer that went down before the sheet opened. Keyboard and untrusted (gamepad/code) clicks pass. Found by a Brain audit (od76#E22). | `tests/b182-focused-checks.js`; real-touch `tests/b182-touch-browser.cjs` (Playwright) |
| Current focused runner | `tests/verify-b182-focused.cjs` | Runs only `tests/b182-focused-checks.js`. |
| Complete regression | `tests/verify-b59.cjs` | Prompt-only. |

## Arena authority

| System | Current authority | Earlier layers / caution | Focused coverage |
|---|---|---|---|
| Core state, combat and UI | `b21-01.js`–`b21-10.js` | Foundation only; many entry points are wrapped later. | `tests/partnership-checks.js`, `tests/survival-checks.js` |
| HEAT and Overdrive synthesis | `b21-25.js`, `b21-83.js` | `b21-31.js` and `b21-45.js` control Ascendant ignition/duration. | `tests/b115-heat-checks.js`, `tests/b116-skill-checks.js` |
| Beam | `b21-109.js`, with final balance/reach modifiers in `b21-128.js` and `b21-129.js` | Search `attack` and Beam helpers before changing cadence or range. | `tests/b116-skill-checks.js`, `tests/b122-checks.js`, `tests/b123-checks.js` |
| Thunderstorm | `b21-108.js`, `b21-115.js`, `b21-128.js`, `b21-130.js` | Charge, travel, follow cloud and final zap range are layered. | `tests/b116-skill-checks.js`, `tests/b122-checks.js`, `tests/b124-checks.js` |
| Guardian | `b21-114.js` | Replaces the old Guardian behavior; Guardian Glow affects block charge. | `tests/b117-fix-checks.js` |
| Nova | `b21-83.js`, `b21-126.js`, `b21-130.js`, `b21-135.js` | Release contract, constellations, full-screen charge and star cap. | `tests/b124-checks.js`, `tests/b125-checks.js` |
| Gravity Well | `b21-143.js` | Replaces `updateWellB94`; wraps `releaseGravityB94` from `b21-83.js`. | `tests/b127-focused-checks.js` |
| Pip Ascendant | `b21-143.js` | Replaces `ascendantPulse`; still depends on synthesis helpers in `b21-25.js` and duration in `b21-45.js`. | `tests/b127-focused-checks.js` |
| Difficulty and spawns | `b21-145.js`, with curve/HP authority in `b21-96.js`, `b21-103.js`, `b21-130.js` | B128 eases stages 1-3 at ranks D-S by 15%/10%/5%; goals and caps stay unchanged. | `tests/b128-focused-checks.js` |
| Boss adaptation | `b21-146.js`, over boss behavior from `b21-05.js`, `b21-06.js`, B59/B124 boss layers | B129 reads the tracked top skill and adds a soft pattern tag on stage 7+ bosses; it should not hard-counter favorite skills. | `tests/b129-focused-checks.js` |
| Boss dash freeze | `b21-110.js`, then `b21-130.js` | B124 adds the warning window before the freeze. | `tests/b116-freeze-checks.js`, `tests/b124-checks.js` |
| Arena endurance / merchant | `b21-124.js`, then `b21-142.js` | B126 converts merchant to enter/shop/leave and adds repeat purchases. | `tests/b118-endurance-checks.js`, `tests/b126-quick-fixes-checks.js` |

## Drop authority

| System | Current authority | Critical detail | Focused coverage |
|---|---|---|---|
| Exploration checkpoint | `b21-144.js` | Final authority runs all three independent rolls every 15 actual non-boss kills. | `tests/b127-focused-checks.js` |
| Exploration payload | `b21-16.js` | Independent 10% roll; success selects Note, Music Star or Prism Seed. |
| Heart Stone meteor | `b21-144.js` | Independent 10% checkpoint roll using the spawn and collection behavior from `b21-94.js`; bosses keep their separate guaranteed path. | `tests/ranch-checks.js`, `tests/b127-focused-checks.js` |
| Star Dust meteor | `b21-144.js` | Independent 10% checkpoint roll using the spawn and collection behavior from `b21-142.js`; collected dust banks at run end. | `tests/b126-quick-fixes-checks.js`, `tests/b127-focused-checks.js` |

All three checkpoint rolls are independent, so zero, one, two or all three drops are valid.

## Ranch authority

| System | Current authority | Earlier layers / caution | Focused coverage |
|---|---|---|---|
| Ranch progression | `b21-88.js` | Permanent skill levels and battle-test loop. | `tests/ranch-checks.js` |
| Walkable ranch and sheets | `b21-89.js` | Owns `openSheetB100`, input and station interaction. | `tests/ranch-checks.js` |
| Start at ranch | `b21-99.js` | Splash/start routing. | `tests/launch-checks.js` |
| Food, soap and needs inventory | `b21-92.js` | Current food tiers: 25/50/100 Food for 15/60/240 hearts. `b21-112.js` wraps shop focus and timed care. | `tests/b116-comforts-checks.js`, `tests/b127-focused-checks.js` |
| Live need penalties | `b21-107.js`, `b21-111.js`, `b21-124.js` | Hunger→HEAT, fatigue→move/attack, cleanliness→Guardian Glow. | `tests/b115-needs-checks.js`, `tests/b116-appetite-checks.js` |
| Stage-gate meter display | `b21-143.js` | Final wrapper over `renderTollGateB115` from `b21-124.js`; effect chips are authoritative. | `tests/b127-focused-checks.js` |
| Heart Refinery | `b21-90.js`, then `b21-121.js` | Core economy plus parallel slots. | `tests/ranch-checks.js`, `tests/b117-fix-checks.js` |
| Star Stone petting | `b21-120.js` | +1% per complete 15 arena minutes and +1% per complete 500 kills; each pet rolls; success resets progress. | `tests/b117-fix-checks.js` |
| Drill level gates | `b21-106.js` | Every station level unlocks ten skill levels; obsolete set counters are discarded. | `tests/b115-drills-checks.js` |
| Drill result feedback | `b21-134.js` | Visual/audio success and failure feedback. | `tests/b125-checks.js` |
| Overgrowth and restoration | `b21-94.js`, `b21-140.js`, `b21-141.js` | Obstacles, access blocking and restored-site progress. | `tests/b125-checks.js` |
| Farm and kitchen | `b21-146.js`, with crops/week timing in `b21-93.js`, `b21-125.js` | Kitchen starts with Stew, Bowl and Crisp; orchard restores Tart and Pie ranch-buff recipes. | `tests/b128-focused-checks.js`, `tests/b129-focused-checks.js` |
| Farm fatigue copy | `b21-142.js` | Only tilling adds fatigue. | `tests/b126-quick-fixes-checks.js` |
| Survey and telemetry | `b21-113.js`, `b21-119.js`, `b21-142.js` | Core survey, ranch detail, currency/drop tracking. | `tests/b117-survey-checks.js` |

## Presentation and input

| System | Current authority | Focused coverage |
|---|---|---|
| Arena/ranch look ladder | `b21-131.js`, `b21-132.js`, `b21-133.js` | `tests/b125-checks.js` |
| Ranch drill input, rest/arena transitions and tree audio | `b21-145.js` | Release-gates Glow Pond; applies rest at black; fades into arena; softens tree chopping. | `tests/b128-focused-checks.js` |
| Touch and stage-boundary input release | `b21-117.js`, then `b21-142.js` | `tests/b126-quick-fixes-checks.js` |
| Arena-to-week fade | `b21-142.js` | `tests/b126-quick-fixes-checks.js` |
| Controller run-complete routing | `b21-138.js` | `tests/b125-checks.js` |
| Sound engine | `b21-81.js` | `tests/transport-checks.js`, `tests/audio-qa.js` |

## New-build checklist

1. Read this file, `TASKS.md` if present, and `HANDOFF.md` if present. Missing optional files are not blockers.
2. Search only the listed authority files and the exact function names being changed.
3. Use the next numeric runtime file unless the mapped authority is intentionally edited in place.
4. Before adding a global identifier, search the assembled modules for that exact name.
5. Add or update one focused test and its focused runner.
6. Run focused checks and `scripts/build.mjs`; run the complete regression only by explicit user request.
7. Update this map when authority moves.
