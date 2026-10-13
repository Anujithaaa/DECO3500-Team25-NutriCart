# A2 poster: content and layout

**Format:** A2 portrait (420 × 594 mm), close-read conference poster. Body text at least 24 pt, headings 40–60 pt, title around 110 pt. Margins 15 mm, 3-column grid with 10 mm gutters. Use the prototype's colours: ink `#183229`, green `#1F6B4F`, lime `#CDE37E`, background `#F3F4EF`. Token colours: red `#D1495B`, blue `#2E86AB`, green `#3BA55C`, yellow `#E0A526`.

The poster has to stand on its own when nobody is there to explain it. Every number must come from the evidence register.

```
┌──────────────────────────────────────────────────────┐
│ TITLE BAND (full width, ~90 mm)                      │
│ NutriCart Hub                                        │
│ Grocery coordination for student share houses,       │
│ from the kitchen to the aisle                        │
│ Team 25 · DECO3500 · names            [QR → repo]    │
├──────────────────┬───────────────────────────────────┤
│ 1 THE PROBLEM    │ HERO PHOTO (2 cols, ~170 mm)      │
│ (1 col)          │ Dock on a kitchen bench, tokens,  │
│                  │ Cart Unit on a basket, caption    │
├──────────────────┼─────────────────┬─────────────────┤
│ 2 WHAT WE        │ 3 HOW IT        │ 4 THE SIX GROUP │
│ LEARNED          │ CHANGED         │ MOMENTS         │
│ quotes + counts  │ v1 → v2 → v3    │ time–space grid │
│                  │ thumbnails      │                 │
├──────────────────┴─────────────────┼─────────────────┤
│ 5 TRY IT: Dock + Cart screens      │ 6 WHAT TESTING  │
│ (2 cols, screenshots + callouts)   │ SHOWED (R4)     │
├────────────────────────────────────┼─────────────────┤
│ 7 ETHICS IN THE DESIGN             │ 8 NEXT STEPS +  │
│                                    │ refs, credits   │
└────────────────────────────────────┴─────────────────┘
```

---

## Title band
**NutriCart Hub**
*Grocery coordination for student share houses, from the kitchen to the aisle*
Aman Kushwaha · James Olbes · Anujitha Fernando · Kenan Chu. DECO3500 Social & Mobile Computing, UQ, 2026. `[QR code to the repo]`

## 1. The problem (~70 words)
Students in share houses near UQ St Lucia coordinate groceries through group chats and memory. Requests get buried, things get bought twice, and splitting the cost is awkward. Tools for "healthier choices" focus on the individual and tell people what to eat. We asked: **how might social and contextual computing help a household plan, coordinate and shop together, without adding effort or judgement?**

## 2. What we learned (~90 words + 3 quotes)
7 interviews, 13 prototype sessions (10 app probe, 3 physical Hub), 1 completed shadowing session (several declined), `[n]` papers `[confirm all counts from the register]`.
- **Price decides.** *"99 out of 100 times."*
- **"Healthy" is personal**: protein, sugar, fresh, or not a priority at all.
- **Comparison can hurt.** *"It's essentially telling me that I'm fat."*
- **Coordination beats a feed.** *"I don't have to remember what my roommate texted me a few days ago."*
- **In store, less is more.** Alerts become "noise, not help".

## 3. How it changed (thumbnails with one-line captions)
**v1 app probe** (friend recipes, group goals): exposed our assumptions → **v2 cardboard Dock + Cart Unit**: a household object, not an app → **v3 live and multi-user, in physical housings** `[once built]`: six group moments.
Caption: *"Every change traces to something participants said or did."*

## 4. The six group moments (2×2 time–space grid)
| | Same time | Different time |
|---|---|---|
| **Same place** | **G1** Plan together at the Dock · **G5** Split Shop in store | **G2** Leave a request · **G3** Hand over the baton · **G6** Re-dock and settle |
| **Different place** | **G4** One quick question home | – |

One line under it: *The Hub facilitates coordination a household already does, using visible traces in a shared space rather than notifications.*

## 5. Try it (screenshots with numbered callouts)
Dock: tokens ①, "Jay and Sam are shopping now" with live budget ②, question from the store with one-tap answers ③. Cart Units: "My half" Split Shop ④, Ask home ⑤, compare in *your* priority order ⑥, return summary and cost split ⑦.
Small print: *Real: live sync across devices, barcode scanning, requests, Split Shop, cost split. Simulated: prices entered by the team, store detection.*

## 6. What testing showed (R4, write after the sessions, ~80 words)
`[3–4 findings, each with evidence (count or quote) and the change it led to. If printing before R4 finishes, replace this panel with "How we test it": households at their own bench and pairs in store, the 8 evaluation questions, and say "results at our stand".]`

## 7. Ethics in the design (~70 words)
- No health scores, calories or leaderboards: participants told us comparison could hurt.
- Compare shows facts in **your** order, never a verdict.
- The cost split is visible and explained (an opt-out is next). A design detail can settle a social question (Winner).
- Shows that someone is shopping and which store, never a live location. Aliases only, nothing scraped.
- Everyone gets something back for adding (Grudin).

## 8. Next steps + references
Allergy and diet notes per housemate; offline list on the Cart Unit; a longer in-home study over several weeks.
Short refs: Grudin 1994 · Houde & Hill 1997 · Olsson et al. 2020 · Schmidt 2002 · Winner 1980 · Marshall et al. 2022 · Wang et al. 2024.

---

### Before sending to print
- [ ] Every number matches the evidence register.
- [ ] No participant names or faces without consent.
- [ ] QR code scanned and tested.
- [ ] Printed at A4 first to check text is readable at ~30% scale.
- [ ] Exported as PDF at A2, fonts embedded, images at least 150 dpi at print size.
