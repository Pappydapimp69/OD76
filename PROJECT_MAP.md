# OD76 Project Map

Development index only. This file is not loaded by the game.

## Start here

- Current release: `B143-BAG-LIST`.
- Next numbered runtime file: `b21-161.js`.
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
| Current focused runner | `tests/verify-b129-focused.cjs` | Runs only `tests/b129-focused-checks.js`. |
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
