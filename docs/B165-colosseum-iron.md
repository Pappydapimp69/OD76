# B165 Colosseum look and gamepad pass

## Problem

The arena is neon and the ranch is pastel; the Colosseum reused the ranch's soft look and felt like a ranch mini-game. The owner wanted it to feel like a different game: more serious, more intense. The owner also doubted gamepad support.

## Change: "iron and ember"

- **Scene:** a torchlit stone bowl at dusk. Tiered stands of silhouette crowds bob harder as the crowd roars (Ascension, low HP, knockout). Four torches throw light and drifting embers onto a raked sand floor inside a bronze-trimmed wall, under a dark vignette.
- **Fighters:** heavy ink outlines, brows set for a fight, and ground shadows. Ascension is a fire aura, Guard a bronze shield arc, Focus three bronze pips. Rival colours avoid Pip's yellow. On screen the rival always circles opposite Pip (drawing only; the sim is unchanged).
- **Impact:** shots are ember streaks, gold when homing and white-hot when Ascended; hits throw sparks. Big hits and the knockout shake the screen briefly (none under the device's reduced-motion setting); Ascension and the knockout flash.
- **HUD:** iron plates with bronze borders for HP (crimson), HEAT (ember, with the 70% notch) and Guard (steel); a bronze medallion clock; serif small caps; italic gold announcer lines. Intro, VICTORY/DEFEAT and PAUSED cards match.
- **Chrome:** the pastel ranch HUD and toasts hide in the ring. Touch buttons become iron discs (◎ FOCUS, ✦ ASCEND glowing when ready, ⛨ GUARD). Colosseum sheets (station, between rounds, pause) get the iron style.
- **Music:** war drums at 96 bpm over a low D drone with a brass stab every fourth bar replace the ranch tune while the Colosseum is active.

## Gamepad

Audit of every gamepad reader during a fight:
- **Select** opened the Bag mid-fight and froze the fight behind the sheet. Now suppressed while the Colosseum is active.
- **Start** did nothing. It now pauses (Resume / Leave), as do P on keyboard and a ❚❚ touch button. The fight clock is frozen while paused. B or Start resumes. Leaving a bracket counts as a loss; leaving the tutorial doesn't mark it done.
- **Pad A/X/B** reach Pip's Focus/Ascend/Guard. The d-pad and A drive every Colosseum sheet, including between rounds. The tutorial completes on a pad.
- **Prompts** name the last device's buttons (pad A/X/B/Start, keyboard Space/X/B/P, touch FOCUS/ASCEND/GUARD/❚❚) in the tutorial, intro and sheets. Detection runs on all ranch input.

## Verified

- `tests/b165-focused-checks.js` (9): stubbed standard-mapping pad for every command, Select, Start pause/resume, d-pad menus, the tutorial, the station, prompts per device, drawing every phase, and music.
- All focused suites: 135 pass.
- Chromium at 1280×800 and at 390×780 with touch, driven by a stubbed pad, with no errors.
