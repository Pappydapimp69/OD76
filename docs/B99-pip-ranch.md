# B99 — Pip Ranch

## Problem

OD76's core change is Monster Rancher-style raising: raise Pip at a ranch, train him, then battle test him in the OD75 shooter. Since B26, Pip's combat growth reset every run, so there was nothing lasting to raise.

## Change

- **Ranch save** (`overdrive76_ranch_v1`): week, ranch hearts, fatigue (0–100), tests run, ranch levels for the four Pip abilities and the last test report.
- **Drills** cost ranch hearts, raise one ability's ranch level by 1, add 30 fatigue and take a week. Scent Hunt → Heart Sense (cap 10, ♥ 6 +3/lv), Sky Laps → Swift Pip (cap 4, ♥ 8 +4/lv), Star Target → Star Power (cap 5, ♥ 10 +5/lv), Glow Meditation → Guardian Glow (cap 4, ♥ 8 +4/lv). No drills at 70+ fatigue.
- **Rest** removes 60 fatigue and takes a week.
- **Battle test** starts a fresh run with Pip's abilities at their ranch levels. In-run ability purchases stack on top and are priced from the ranch level, so training never makes the stage shop dearer.
- **Stage end:** after the growth steps, the stage panel asks **Next stage** or **Return to ranch**. Returning ends the run and banks every heart collected that test.
- **Falling in battle** banks half the hearts and leaves Pip at least 60 fatigue. The end screen gets a Pip Ranch button.
- The start screen gets a Pip Ranch button. Ranch and gate buttons are controller navigable.

## Unchanged

The shooter, stage growth steps, in-run economy and difficulty. Lifespan, stress, feeding and errantries are later builds.

## Verified

190 full-bundle checks pass across 88 modules. Desktop and 390×700 browser runs opened the ranch from the start screen, started a battle test, showed the stage-end gate and returned home with the hearts banked, with no errors.
