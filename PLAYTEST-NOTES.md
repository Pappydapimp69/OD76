# Playtest notes (B170 Colosseum Sound, Nick) — item 1 shipped in B173; items 2-3 in B174, 5 in B175, 4 and 6 in B176, 8 in B177, 7 in B178, 9 in B180

1. **Refinery opening tap presses a button** — shipped in B173 (`b21-185.js`).

2. **Star Dust fuses as one load, one timer** (shipped in B174, as dust slots):
   - Fusing ✧50 starts ★10 at once under a single timer, not ten 15-minute timers back to back.
   - Works like a heart load: load the dust, one countdown, all the Star Stones land together.
   - Current B156 behaviour: each ★1 lands 15 min after the last, so Fuse all on ✧50 takes 150 min and reads as "took my dust, gave nothing".

3. **Heart refining batches into slots** (shipped in B174):
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

4. **Survey: fatigue as a percentage** (shipped in B176):
   - The survey still says "Gate stops at 100 fatigue" (`b21-113.js` lines 94 and 102). Arena fatigue is a % of `fatigueMaxB118()` (100 + 4 per endurance), so 100 is no longer the cap.
   - Reword to "Gate stops at 100% fatigue"; count stays `exhaustedB115()` (already the real max).

5. **Skip between-stage pages with nothing to buy** (shipped in B175):
   - Traits / Hearts / Sound Lab / Overdrive / Boss Bond / Merchant: a page with nothing affordable is skipped; the step counter counts only shown pages.
   - A page that is shown notes what was skipped ("Skipped Traits and Sound Lab, nothing to buy yet").
   - Head out keeps Pip's Tired (%) / Food / Clean meters and adds "Saving up for": each skipped page with its cheapest cost, a progress bar, how much more is needed, and a Peek button.
   - Peek opens the page look-only; Back to Head out is a plain tap.
   - Mockups: https://claude.ai/artifact/CuuhSQTmN2eJuwEucrSh2w

6. **Shorter holds** (shipped in B176):
   - Continue / Next stage / page moves: 0.4 s (B124 is 0.9 s).
   - Regular buys: 0.6 s (Overdrive and Sound Lab are 1.8 s).
   - Big one-way buys (Ascend): keep 1.8 s.

7. **Colosseum too easy: rework** (shipped in B178):
   - Sim (both sides on AI): Pip at a rank's average rival total wins ~80% per fight; at 1.25x it wins 93-100%. Rival totals are fixed per rank (B163_BUDGET up to 84) while ranch training is uncapped (B113), and Pip's trophy/Ascension/labour bonuses stack with no rival equivalent.
   - Rivals scale off Pip's stat total but trail it (sublinear), so training still pays and the final stays close.
   - Rivals with tricks that need coaching (e.g. a feint that baits Guard, punishing a badly timed Ascend): difficulty from decisions, not stats.
   - Tune with the seeded simulator to a target: good coaching wins ~70% QF / ~55% SF / ~45% final (about a 1-in-5 bracket win); no coaching loses most finals.

8. **Upgrade text cut off between stages** (shipped in B177):
   - Trait / Heart / Boss Bond cards clamp their effect to 2 lines (B135/B136), so the effect reads "...".
   - Show the full effect of the focused or last-touched card in a detail line under the grid (touch, gamepad focus or hover), so reading never starts a buy.

9. **Colosseum trophies speed up Overdrive mastery** (shipped in B180):
   - Every Colosseum bracket win earns one trophy for that rank (a spendable count, separate from the B163 "won this rank" trophies that set Pip's ring Ascension).
   - Trophies are rank locked: rank D trophies can only be spent in rank D arena runs.
   - Spending one adds 5 skill uses to any unlocked Overdrive skill's current tier progress; it is used up.
   - The player still unlocks skills and pays ★ for every tier, level-up and Ascend; trophies never grant tiers or levels by themselves.

10. **New ranch areas** (Old Quarry shipped in B183; Meadow and Training Yard pending; Riverbank and Deep Grove parked until they have a purpose):
   - Travel: a signpost path at the ranch edge; walk up and pick an area. Each area is its own map with Pip and the HUD.
   - Unlock like Garden/Orchard: Riverbank ◆3, Sunny Meadow ◆3, Deep Grove ★1, Old Quarry ★2, Training Yard at Colosseum rank D.
   - Riverbank: wash for a bigger Clean boost; fishing (a timing minigame) for food.
   - Sunny Meadow: resting here clears fatigue faster; gather wild herbs (food).
   - Deep Grove: more trees to fell (counts toward Colosseum Ascension like B168) and mushrooms to forage.
   - Old Quarry: rocks to break; small chance of ✧ Star Dust or ◆ Heart Stones; rocks cleared add Colosseum Power.
   - Training Yard: free Colosseum practice against Breaker and Feint dummies (no fatigue, no prize).

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
