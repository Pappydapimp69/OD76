# B109 — Pip actions on X

## Problem

A did everything on the ranch, and tool jobs finished instantly from a menu. The player should be able to tell information from action, and see Pip actually doing the work.

## Change

- **A** = information and menus (unchanged). **X** = tell Pip to do the job at hand. Input: keyboard X, gamepad button 2 (X/Square) or a green touch button beside A.
- **When X is offered:** only if Pip can act. The right tool is owned, Pip is under 70 fatigue (harvest needs neither), and the target needs the job. The prompt shows `X · Chop` above `A · Tree`, and the A button reads Info. Otherwise only A shows, and its sheet explains what's missing.
- **Jobs:** chop tree 3 s, cut shrub 2 s, till 2 s, water 1.2 s, harvest 1 s.
- **How a job plays out:** Pip first walks beside the target (up to 1.5 s), then works. The effect (clearing, fatigue, crop) applies when the job finishes, so the tree keeps blocking until it falls.
- **Animation:**
  - Pip tilts and hops with each swing, and the tool icon arcs.
  - A tree jolts on each strike and leans further as the chop goes on. Chips or soil fly, and a progress ring fills.
  - A felled tree topples and fades. Cut shrubs burst into leaves. Watering shows droplets.
- Nothing else is interactable while Pip works. Leaving the ranch mid-job completes it.
- Sheet options for these jobs (Let Pip chop, Till, Water, Harvest) play the same animation.

## Verified

233 full-bundle checks pass across 97 modules. A browser run pressed X at a tree: Pip walked over, swung for 3 seconds with the tree shaking and chips flying, the tree toppled, and fatigue rose by 15. No errors.
