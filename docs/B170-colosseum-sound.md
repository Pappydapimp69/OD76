# B170 Colosseum sound from the sound engine

## Problem

The Colosseum looked like its own game (B165) but sounded thin: war drums plus a few `tone()` blips for the crowd. The owner asked to bring in the `sound-engine` repo and enhance the Colosseum's sound.

## How the engine comes in

`Pappydapimp69/sound-engine` is an ES-module engine with AudioWorklet DSP; OD76 is one concatenated classic script with its own mixer. So:

- **Vendoring:** `scripts/vendor-sound-engine.mjs <sound-engine checkout>` generates `b21-181.js`.
  - It takes the engine's pure DSP classes (`src/dsp`, MIT) and gives each file its own scope; imports become lookups on the dependency's exports.
  - Everything is exposed as `SoundEngineDSP`, and the header records the source commit.
  - Don't edit it by hand: change sound-engine and re-run the script.
- **Rendering (`b21-182.js`):** the Colosseum synthesizes its sounds once, offline, from those classes. It renders in slices of a few hundred samples within a 6 ms per-frame budget, starting when the Colosseum sheet, a bracket or the tutorial first opens.
  - In Chromium the whole bank renders in about 1 s with no long tasks.
  - Until a sound is ready, the B163–B165 tones stand in.

## The sounds

| Sound | Engine part | Use |
|---|---|---|
| Stone-bowl reverb | 8-line FDN (`size 1.6, T60 2.2 s low / 1.1 s high`), rendered to an impulse response, used as a ConvolverNode | War drums and every ring sound send into it |
| Crowd bed | 12 creature voices with their own tract sizes, pans and call timing, plus a murmur; a 6 s seamless loop | Level follows the crowd's roar; quiet when paused |
| Cheer / gasp | 16 / 12 voices, rising / falling pitch | Fight start, Ascend, the knockout / low HP, a broken guard |
| Pip and rival cries | Creature voice: Pip a small bright tract, rivals deeper and rougher | Ascend; a falling cry at the knockout |
| Sand thuds and footsteps | Hertz-contact footstep model on sand: light, heavy (Ascended or big hits) and a soft pad | Every landed hit, panned to the fighter; footsteps as they circle |

Everything routes through OD76's own sfx chain and master, so the mute and limiter still apply. Sound never touches the fight sim.

## Verified

- `tests/b170-focused-checks.js` (4); all focused suites pass.
- In Chromium with audio running: all 12 sounds render with zero long tasks, the bed and the music send run during a fight, and nothing errors.
