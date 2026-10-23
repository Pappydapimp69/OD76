# Playtest notes (B170 Colosseum Sound, Nick) — item 1 shipped in B173

1. **Refinery opening tap presses a button** — shipped in B173 (`b21-185.js`).

2. **Star Dust fuses as one load, one timer** (pending build):
   - Fusing ✧50 starts ★10 at once under a single timer, not ten 15-minute timers back to back.
   - Works like a heart load: load the dust, one countdown, all the Star Stones land together.
   - Current B156 behaviour: each ★1 lands 15 min after the last, so Fuse all on ✧50 takes 150 min and reads as "took my dust, gave nothing".

3. **Heart refining batches into slots** (pending build):
   - A heart load fills a slot as one batch with one timer (Lv 1: 15 min, the refinery's stone time); every stone in the batch lands together.
   - Slot capacity: ♥300 at Lv 1, doubling each refinery level (600, 1200, 2400, 4800, 9600 at Lv 6).
   - Example: ♥300 at Lv 1 = one full slot = ◆6 in 15 min.
   - Slots: 2 at Lv 1-2, then +1 at Lv 3, 4 and 5 (5 slots at Lv 5-6).
   - A slot always finishes what's in it in one refine time (Lv 1: 15 min); stones drip out evenly. ♥100 = ◆2 → one ◆ every 7.5 min.
   - Topping up restarts the slot's timer on what's left: halfway through ♥100 (♥50 left), add ♥100 → ♥150 left = ◆3 over 15 min → one ◆ every 5 min.
   - Loading is per slot: tap a slot to load it (Min or Max), replacing the Refine buttons in the card below. The player picks what goes where.
   - Min = the B155 level minimum (♥50 at Lv 1, ♥100 at Lv 2, doubling). Max = slot capacity or what the player holds, whichever is less.
   - Star Dust loads into a slot the same way (one batch, one timer, stones drip evenly); this replaces item 2's separate fuser.
   - Dust slot: capacity ✧30 at Lv 1 (★6), doubling per level like hearts; min ✧5 at every level; same refine time (15 min at Lv 1). A slot holds hearts or dust, never both.
   - Refinery sheet: the wallet row (♥ ◆ ✧ ★ inventory) is repurposed to show the slots (fill and timer each).

# Playtest notes (post-B115) — item 1 shipped as a B115 fix; items 2-7 shipped in B116

B114 feedback shipped in B115; see README.

1. **HEAT regen too fast** (B115 is 2.5%/s):
   - Regen = 1 HEAT point every 3 seconds.
   - Regen only fills up to a ceiling: 20% of the meter, +1% per Constellation level (replaces the +1% regen speed per level). Combo and pickups can still push past the ceiling.
   - Regen pauses while a skill is held or charging, and for 3 seconds after any skill is used.

2. **Thunderstorm levels** (pending build):
   - Lv 1: 1 cloud. Lv 2: 2 clouds.
   - Lv 3: adds a chain; each strike jumps to 1 nearby enemy within a short range.
   - Lv 4: 3 clouds. Lv 5: 4 clouds.
   - Charge delay: 2.2s for the first cloud, 1.8s for each one after.
   - Lv 5: all clouds charge 25% faster (1.65s, then 1.35s each).
   - Quick tap: charges exactly 1 cloud with the normal delay, then strikes; no need to hold.
   - Each cloud still costs 8% HEAT.
   - The Lv 3 chain replaces the old ricochet from the Constellation boss power.

3. **Skill button** (pending build):
   - Below the activation threshold: dim, and the fill shows progress toward the threshold (e.g. 12.5% HEAT with a 25% threshold = half full).
   - At or above the threshold: solid, full brightness, full.

4. **Beam** (pending build):
   - Can't trigger without an enemy in range (no HEAT spent with no effect).
   - Smaller at Lv 1, growing with each level (currently overpowered at Lv 1).
   - Size/power by level: Lv 1 single narrow stream at 60% of the current damage; each level wider and stronger; Lv 3 = today's 3-way spread; Lv 5 wider spread at ~1.25x today's damage.

5. **Boss dash freeze** (new mechanic, pending build):
   - Bosses with a telegraphed dash: when the path turns yellow, a player standing inside the path is frozen in place for 2.2s.
   - While frozen: movement, auto-fire, dash and skills are all locked. Pip keeps acting normally.
   - HEAT regen pauses during the freeze.
   - Any skill being held or charged is cancelled and its HEAT is lost (no refund).

6. **Food/cleanliness per stage** (pending build; replaces 3 + ceil(stage/2) for both):
   - Food: 2 + max(1, 0.5 × stage#) + 1 per 25% HEAT spent in the stage.
   - Cleanliness: 2 + 1 per 15 kills + 1 per hit taken + 3 on boss stages.

7. **Ranch QoL** (pending build):
   - Shop: after a purchase, keep the cursor on the same item. If it was a one-time buy (now gone), move to the next item; if there's no next item, the previous one.
   - Shop: consumables show how many you own (e.g. "×3"); show nothing at 0.
   - Sound effects: axe chop and sickle cut; an eating sound when feeding Pip; a happy jingle when washing.
   - Feeding and washing each take 3s; no actions or movement until done.
