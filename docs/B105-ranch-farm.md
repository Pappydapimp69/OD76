# B105 — Ranch farm

## Problem

The ranch should feel like a small farm (a gentle Stardew Valley): unlock areas, grow food, cook meals.

## Change

- **World** grows to 2400×1600.
- **Unlockable areas:** Garden (◆ 2), Kitchen (◆ 3), Orchard (★ 1). Locked areas show faded with their price, and pressing A shows the unlock sheet.
- **Tools** (appear at the stall after the garden or orchard opens): Hoe (♥ 80), Watering can (♥ 60).
- **Seeds:**
  - Carrot: ♥ 10, 2 weeks, yields 2.
  - Strawberry: ♥ 20, 3 weeks, yields 3.
  - Pumpkin: ♥ 25, 4 weeks, yields 1.
- **Garden:** six plots. Walk to a plot to till, plant (planting auto-waters if you own a can), water or harvest. The garden sign can Water all and Harvest all. Watered crops grow one stage per ranch week; watering resets each week.
- **Orchard:** 6 apples every two ranch weeks, holding up to 12.
- **Selling at the stall:** carrot ♥ 8, strawberry ♥ 12, pumpkin ♥ 40, apple ♥ 8.
- **Kitchen meals** (fed from Pip's menu):
  - Carrot Stew (🥕2 🎃1): food +60, next battle test +20 max HP.
  - Harvest Bowl (🥕🍓🍎): food +50, next battle test starts at 50% HEAT.
  - Apple Crisp (🍎2 🥣1): food +40, next battle test Swift +1.
  - Berry Tart (🍓2 🥯1): food +45, next 3 drills +3 points.
  - Pumpkin Pie (🎃🍎🥯): food +55, next 3 drills −15 fatigue.
  - One battle buff and one ranch buff are held at a time; a new meal replaces the old one.

## Verified

217 full-bundle checks pass across 93 modules, covering needs, stall, washing, penalties, unlocks, the full crop cycle, orchard, cooking, buffs and corrupt-save recovery. Desktop and 390×780 touch browser runs showed the garden, stall and locked kitchen/orchard with no errors.
