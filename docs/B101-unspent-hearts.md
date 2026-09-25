# B101 — Unspent hearts go home

## Problem

Heart Bits spent on in-run upgrades (emotion and ability steps) still counted toward what Pip banked at the ranch, because banking used every heart collected in the run.

## Change

- Banking uses `S.heartCurrency`, the hearts left after in-run spending. Returning home banks all of it; falling in battle banks half.
- The stage-end gate shows the unspent amount and how many went into upgrades.
- The ability shop balance adds "unspent hearts go home to the ranch".

Spending now trades ranch growth for in-run power.

## Verified

198 full-bundle checks pass, including buying an ability mid-run and confirming the gate text and the banked amount exclude it.
