# B169 Colosseum sheet you can read at a glance

## Problem

B163, B167 and B168 each appended to one paragraph on the Colosseum sheet: controls, costs, prizes, trophies and every perk percentage. The owner, playing on a TV, called it a block of text that means nothing.

## Change

At this moment the player picks a bracket, so the sheet answers only that (ZaneGPT):

- **Lead line:** "Eight Pips, knockout bracket. Win three fights to be champion."
- **Rows:**
  - **Cost:** fatigue per fight, plus Pip's current fatigue.
  - **Prize:** ◆ 1 · 2 · 4 per win, × rank.
  - **Coach:** the device's own buttons.
- **Pip's edge here**, as a 2×2 grid of tiles:
  - **Guard:** a bar and shrubs cut.
  - **Ascension:** a bar and trees felled.
  - **Arena skills:** Ascended skills, or how to get them.
  - **Trophies.**
- **Bracket buttons:** "Rank E · prizes ×1 · best: 1 win" or "· 🏆 ×2" (was "best QF win").
- **Exact percentages** stay on each tree's and shrub's sheet and in the tutorial.
- **Short screens:** under 600 px tall, tile hints and the lead line hide, so every button fits on a 960×540 TV-style screen.

## Verified

- `tests/b169-focused-checks.js` (4); older checks updated from the paragraph to the rows. All focused suites pass.
- Chromium at 960×540 and 390×780, with no errors.
