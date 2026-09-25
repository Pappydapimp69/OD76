# B103 — Ranch music

## Problem

The ranch was silent: the arena soundtrack only plays during a run.

## Change

- While the ranch is open, the shared audio engine plays a ranch loop instead of the arena arrangement.
- 66 bpm, F major, four bars: Fmaj7 → Am7 → Bbmaj7 → C add9.
  - Slow-attack sine/triangle pads across the stereo field.
  - Soft sine bass on beats 1 and 3.
  - A sparse triangle music-box arpeggio.
  - A simple melody every other pass and a faint bell at each phrase end.
- The loop runs on its own clock, so arena tempo changes never affect it. It restarts from the top on each visit.
- The ranch mix is warmer (music tone 3400 Hz) with a little more echo; arena intensity never brightens it.
- About 70% of the arena music's loudness. Mute and audio unlock work as before.

## Verified

206 full-bundle checks pass across 91 modules, including tempo, volume ceiling, mute and hand-back to the arena. In Chromium the ranch music bus measured RMS 0.0064 / peak 0.028 against the arena's 0.009 / 0.048, with no errors.
