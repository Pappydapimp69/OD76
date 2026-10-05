# OD76 Project Map

Development index only. This file is not loaded by the game.

## Start here

- Current release: `B127-SKILL-REFINEMENTS`.
- Next numbered runtime file: `b21-145.js`.
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
| Current release layer | `b21-144.js` | Meteor checkpoint hotfix; `b21-143.js` owns Gravity Well, Pip Ascendant and stage-gate effect chips. |
| Current focused runner | `tests/verify-b127-focused.cjs` | Runs only `tests/b127-focused-checks.js`. |
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
| Difficulty and spawns | `b21-96.js`, `b21-103.js`, `b21-130.js` | Rank curve, eased spawn pressure and final enemy-HP curve. | `tests/b115-spawn-checks.js`, `tests/b124-checks.js` |
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
| Farm and kitchen | `b21-93.js`, then `b21-125.js` | Crops/meals plus player watering and week timing. | `tests/b119-farm-week-checks.js` |
| Farm fatigue copy | `b21-142.js` | Only tilling adds fatigue. | `tests/b126-quick-fixes-checks.js` |
| Survey and telemetry | `b21-113.js`, `b21-119.js`, `b21-142.js` | Core survey, ranch detail, currency/drop tracking. | `tests/b117-survey-checks.js` |

## Presentation and input

| System | Current authority | Focused coverage |
|---|---|---|
| Arena/ranch look ladder | `b21-131.js`, `b21-132.js`, `b21-133.js` | `tests/b125-checks.js` |
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
