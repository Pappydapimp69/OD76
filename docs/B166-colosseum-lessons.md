# B166 Colosseum tutorial: rules, not just buttons

## Problem

B164's tutorial taught the three buttons and nothing else. The owner found it not detailed enough. ZaneGPT's check: it never explained what the bars mean, how HEAT fills, that Guard drains and breaks, that Focus is wasted on a guard, how a fight is won, how stats counter each other, or how brackets, fatigue and prizes work.

## Change

The tutorial is now a list of twelve lessons (`B164_STEPS` in `b21-176.js`):

| # | Lesson | Kind | Finishes when |
|---|---|---|---|
| 1 | Welcome: you coach, Pip fights with his ranch stats | card | A |
| 2 | Read the plates: HP, HEAT and the 70% notch, Guard stamina, clock (plates stay lit and outlined) | card | A |
| 3 | Focus: 3 homing, undodgeable shots, +15%, 4 s recharge | drill | Pip uses Focus |
| 4 | Don't Focus into a Guard (a quarter damage) | card | A |
| 5 | Ascend: how HEAT fills; burst that pierces half the armour | drill | Pip Ascends |
| 6 | Guard against Sprout's Ascension | drill | Pip guards an Ascended hit for 0.5 s |
| 7 | Guard breaks: hold until it breaks, 3 s lockout | drill | Pip's guard breaks |
| 8 | Strike the broken guard: wait for Sprout's guard to break, then Focus | drill | Pip Focuses while Sprout's guard is broken |
| 9 | How a fight is won: knockout, or more HP share at time, then hits | card | A |
| 10 | Training matters: Star Power > Guardian Glow > Swift > Star Power; Heart Sense heals | card | A |
| 11 | Finish it: knock Sprout out | drill | Sprout's HP reaches 0 |
| 12 | Brackets: three fights, fatigue, heal or breather, Heart Stones, pause | card | A |

- **Cards** freeze the fight; A (or the ▶ NEXT touch button) continues after 0.35 s, so a held or double press can't skip a card.
- **Drills** finish only on Pip's own state or commands (Brain: entity-pinned onboarding), never by waiting.
- **Button names** follow the last device (pad / keyboard / touch).
- Still skippable, replayable from the Colosseum ("Practise with Sprout"), and leaveable from the pause menu.
- Measured length: about 52 s in a bot run with 1.2 s per card; expect 1.5–2 minutes for a first-time reader.

## Verified

- One lesson driver completes all twelve lessons through the keyboard, touch and gamepad paths.
- Cards freeze the fight, and the Focus drill doesn't finish by waiting.
- The lesson text covers every rule term.
- All focused suites pass.
- Chromium at desktop and phone size, driven by a stubbed pad, with no errors.
