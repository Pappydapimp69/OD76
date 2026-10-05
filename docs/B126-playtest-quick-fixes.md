# B126 Playtest quick fixes

This patch addresses the issues reported in Nick's B119 and B125 playtests.

- Stage upgrade boundaries clear keyboard, touch, gamepad and velocity state so movement cannot remain latched.
- Gameplay suppresses iOS double-tap zoom, callouts and text selection while survey text fields remain selectable.
- Every ranch sheet exposes a visible **Back / Exit** action.
- Farm sheets state that only tilling adds fatigue; planting and watering are free.
- The Arena Merchant starts with **Enter shop** or **Skip shop**. Inside, the player can repeatedly buy arena snacks or one Star Dust for 50 hearts, see the remaining heart balance, and leave when finished.
- Leaving the arena reaches black before the ranch is shown, then reveals the normal **Week N** transition from black.
- Survey reports include current Hearts, Heart Stones, Star Dust and Star Stones, plus tracked Star Dust and Star Stones earned.

## Validation

- The 142 numbered modules assemble in numeric order and parse as one script.
- Six focused checks cover the playtest fixes.
- Survey checks cover currency reporting, dust production, Star Stone fusion and persistence.
