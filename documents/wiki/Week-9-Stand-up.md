# Week 9 Stand-up

> **Note on timing.** The brief asked for this page before the Week 9 stand-up. We presented in our Week 9 studio on `[date, confirm: Tue 22 or Thu 24 Sep 2026]` but did not post the page beforehand. It was written up on 13 October 2026 from our stand-up script, team notes and the feedback we received. Nothing below was added with hindsight except section 5, which is marked as such.

## 1. Where we were

**The question had changed.** We started with *how might context-aware mobile technology and social features support UQ students in making healthier food choices while grocery shopping?* Research pushed us to: *how might we support students' real grocery decisions around price, time, personal priorities and household needs, without adding effort, judgement or another unnecessary app?*

**Research done by Week 9**
- Round 1 exploratory interviews with UQ students who shop near St Lucia. Themes: price first, time pressure, routine, trust-based social influence. See [User Research](User-Research).
- Literature review: individual focus of food-choice tools (Marshall et al., 2022); inspiration vs action from social media food content (Wang et al., 2024); in-store support without a social dimension (Strecker et al., 2024, ShoppingCoach); social nudges tested online (Di Cosola & Neff, 2022).
- Prototype interviews using **v1, an app probe** (friend recommendations, group goals, recipes, shopping checklist).
- Thematic synthesis and divergent ideation of non-app concepts (budget device, shopping traffic light, shared list device, trolley-based support).
- Prototype interviews with **v2, NutriCart Hub**: a Home Dock and a detachable Cart Unit, about half with a physical cardboard Cart Unit and half with an HTML walkthrough of both units, one participant at a time.
- An attempt at shadowing shoppers in store: one session completed, several people declined.

**Experience requirements we had settled on**
1. Low effort: no constant logging in store.
2. Price aware: budget and price visible when they matter.
3. User-defined priorities: no universal "healthy" verdict.
4. Optional, trusted social input: no public comparison.
5. Fits existing lists and household coordination.
6. Right moment: planning at home, quick decisions in store.
7. Works for solo and shared shopping.
8. Doesn't create another phone task.

**Evaluation findings presented**
- **Keep:** shared list, running budget, trusted housemate and friend recommendations, neutral compare, minimal in-store interaction.
- **Change:** a smaller Cart Unit that works on baskets as well as trolleys; list as the default screen; budget most prominent; compare optional; rare alerts (deals and already-at-home only); faster Dock input; off-list items addable in store; group goals optional.
- **Method lesson:** shadowing raised privacy, self-consciousness, time burden and observer effects. The low participation was itself a finding.

**Functional prototype progress:** the v2 HTML Hub (Home Dock and Cart Unit screens, no shared state between devices) and cardboard units. No multi-device version yet.

## 2. Plan presented

Run lower-burden field testing: participants shop normally with a simplified prototype, then do a short retrospective interview using the list or receipt as a prompt. Build the multi-user version for the tradeshow.

## 3. Feedback we received

| From | Feedback |
|---|---|
| Tutor | Surprised we hadn't tested with the physical prototype. (In the v2 round, about half the sessions used a physical Cart Unit and half an HTML walkthrough; the Home Dock was only ever on screen, and sessions were one-on-one, not with groups.) |
| Tutor | A better outcome if the app supports a **physical instantiation** that people actually use. |
| Tutor | If people don't understand it, work out why, then build. |
| Ben (via tutor) | The **social aspect is weak**: what is the point? Apps are individual by nature. How could a *group* use a physical device? |
| Tutor | Keep it location-based and social; stay within the social/mobile literature. |

## 4. Outcomes and next steps (agreed after the stand-up)

- Redesign around **group interaction moments** where more than one housemate uses the Hub (G1–G6, see [Design Process Overview](Design-Process-Overview)).
- Build v3 as **physical units with live-synced screens** so several people can use them at once.
- Evaluate **with groups, in context**: housemates at their own kitchen bench, and pairs shopping.
- Fix data inconsistencies before anything is published (participant counts and IDs).

## 5. What happened next (added 13 Oct, after the fact)

- Post-stand-up direction document circulated during the mid-semester break (3 Oct).
- James built a working backend with a Home Hub page and an Expo Cart Unit with barcode scanning (files dated 8 Oct, shared with the team 13 Oct, as v0.1 and v0.2).
- v0.3 added the household layer (G1–G6) on top of James's code (13 Oct).
