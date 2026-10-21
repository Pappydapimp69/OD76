# B167 Arena Ascensions strengthen Pip in the Colosseum

## Problem

Ascending a skill in the arena (B133) did nothing in the Colosseum. The owner asked for arena Ascensions to strengthen Pip there.

## Design (ZaneGPT + Brain)

- **Matching moves, not raw power.** Rivals have no Ascensions, so a flat power bump would hit the open tier-ceiling tension: in testing, two Ascensions in every skill as a flat boost already won 100%. Each skill instead strengthens the move it resembles:

| Arena skill | Ring perk | Per Ascension level |
|---|---|---|
| Beam | Focus | +0.8% Focus damage, recharges 0.06 s sooner |
| Thunderstorm | Chain | 0.6% of landed hits arc for +35% |
| Guardian | Guard | drains 10% slower; blocked hits hurt 12% less |
| Nova | Ascension | +0.4% Ascended damage |
| Gravity Well | HEAT | +0.7% HEAT gain |

- **Measured against an equal rival** (seeded sweeps, AI-quality coaching): no perks ≈ 48%; one skill at 5 ≈ 56–62% (each about equal); two in every skill ≈ 68%; all 25 Ascensions ≈ 90%. Strengths live in `B167_K`.
- **Shown, not hidden.** The Colosseum sheet lists each perk with its real numbers, or says how to get them. The intro card names Pip's perks, a Chain arc draws as lightning, and the tutorial's "Training matters" card mentions it.
- With no Ascensions a fight is identical to before; the Chain roll touches the fight's random stream only when Thunderstorm > 0.

## Verified

- `tests/b167-focused-checks.js` (6), and all focused suites pass.
- Chromium at desktop and phone size, with no errors.
