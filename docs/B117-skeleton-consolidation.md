# B117 Skeleton 1

## Problem

Complete systems were split across chronological override modules, making current behavior expensive to trace.

## Change

- Thunderstorm authority moves to `b21-108.js`; B93, B98, B116a and B117 travel behavior are one implementation.
- Heart Refinery authority stays in `b21-90.js`; parallel slots and the stage-gate readout are native behavior.
- Playtest survey authority stays in `b21-113.js`; detailed ranch time and drill modes are native telemetry fields.
- Superseded files `b21-82.js`, `b21-87.js`, `b21-95.js`, `b21-115.js`, `b21-119.js` and `b21-121.js` are removed.

## Preserved

Gameplay values, saves, input routes, visual behavior, progression, deployment order and all unapproved systems remain unchanged.

## Acceptance

- The assembled bundle passes syntax validation in numeric order.
- All 344 complete-game regressions pass.
- Thunderstorm, refinery and survey browser fixtures remain available for live verification.
