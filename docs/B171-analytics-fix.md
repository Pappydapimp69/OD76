# B171 Analytics that match play

## Problem

GoatCounter showed every run as Beam and had no run-end or skill-use data.

- `run/start` recorded `S.overType` at stage 1 wave 1, which is always the default Beam; skills are swapped later.
- Heading home from the stage break (`returnToRanchB99`) banks the run without calling `finish()`, so the B136 run-end summary (`run/end`, `run/skill-uses`, minutes, score, Pip level) never fired for those runs.
- B147 holds events until a run ends; anything pending when the page closed was dropped.

## Fix (`b21-183.js`)

- A home bank (`bankRunB99(false)` on a live run) sends `run/end/home/...` plus the same summary as a fall.
- `run/start` is now `od76/run/start/rank-X` with no skill. Skill choice lives in `skill/equip` and `run/skill-uses`.
- Pending events flush on `pagehide` and when the page becomes hidden.

Checks: `tests/b171-focused-checks.js`.
