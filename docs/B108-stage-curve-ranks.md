# B108 — Stage curve and arena ranks

## Problem

From stage 4, difficulty rose one tier per 20 hearts banked. The ranch now pays in hearts, so players chase every heart, and that made difficulty climb sharply. Stage 11+ switched to separate legacy formulas. Ranch training also makes Pip stronger over time, so a single fixed curve drifts easy.

## Change

- **Stage curve** (difficulty value D from the real stage number s):
  - Stages 1–3: D = 1 (unchanged).
  - Stages 4–10: D = 1 + (s − 3) × 9/7, a steady climb from 2.3 to 10.
  - Stage 11 and up: D = 10 + (9/7) × 4 × (√(1 + (s − 10)/2) − 1). It joins at the same slope, then flattens: 11.2 at stage 11, 13.8 at 14, 17.5 at 20, 21.9 at 30.
- **Heart nudge** (stages 4+): D × (1 + 0.15 × min(1, difficulty hearts / (30 × (s − 3)))). Difficulty hearts keep B63's one-third discount for stages 1–3. The nudge never exceeds 15%.
- **Arena ranks** E/D/C/B/A/S add +0/2/4/6/8/10 to D from stage 1 and multiply hearts and Heart Stones banked at the ranch by ×1.0/1.2/1.4/1.6/1.8/2.0.
  - Clearing stage 5 at your highest unlocked rank unlocks the next (once per run).
  - Choose the rank at the Arena gate. Title-screen runs use the selected rank.
- **Tier = floor(D).** Virtual wave = 1 + 3 × (tier − 1), boss threat = floor((tier − 1)/3), kill target = min(16, 8 + floor((tier − 1) × 2/3)) at every stage. Existing caps (speed, HP tier, enemy cap) limit very high tiers.
- **Difficulty pill:** `DIFF · T7 · RANK C · ♥+12%`. The tier-up pulse now also fires past stage 10.

## Supersedes

B63's 20-heart tiers for stages 4–10 and the stage-11 legacy formulas. Their tests were rewritten to the new contract, including a no-cliff check (at most +2 tiers per stage from 1 to 40, even with maximum hearts).

## Verified

229 full-bundle checks pass across 96 modules. A 390×780 browser run showed the gate rank choices and the arena pill `DIFF · T3 · RANK D`, with no errors.
