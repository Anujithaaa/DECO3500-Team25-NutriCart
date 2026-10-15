# Ethical Considerations

We assessed NutriCart Hub with the **Ethical Disclaimer** from the Ethics for Designers toolkit (Gispen, 2017). We used the Ethical Disclaimer (Gispen, 2017) because it asks designers to state who is affected, what could go wrong and what they take responsibility for, which suits a tool that sits inside a shared home.The disclaimer asks a team to describe the situation, list everyone affected, state its intentions, imagine how the design could cause unethical outcomes for each stakeholder, and decide openly which of those outcomes the team takes responsibility for. Following the course's emphasis on ethical design thinking throughout a project (Loke & Matthews, 2020), this is a **living page**: we revisit it at each milestone (section 6).

## 1. The current situation

Students in share houses near UQ St Lucia coordinate groceries informally: group chats, remembered requests, a list on someone's phone. Our research found price dominates their choices, "healthy" means different things to different people, and most people shop alone even when they live with others. Coordination problems are real (doubles, forgotten requests, awkward cost sharing), but so is sensitivity around money, food and bodies.

## 2. Who has a stake

| Direct | Indirect |
|---|---|
| The housemate who shops (uses the Cart Unit) | Partners, guests and visitors who see the Dock in the kitchen |
| Housemates at home (use the Dock) | Supermarket staff and other shoppers (in-store use and testing) |
| A housemate on a tighter budget | Retailers whose prices appear in the product library |
| A housemate who doesn't share food or doesn't want to take part | Open Food Facts (receives barcode lookups) |
| Housemates with dietary, cultural, religious or allergy needs | The hosting provider (stores the prototype database) |
| Someone with a difficult relationship with food or their body | Research participants and the team |

## 3. Our intentions

NutriCart Hub is for **student share houses**. It is used **at the kitchen bench and in the supermarket aisle**. Its purpose is to **make the coordination housemates already do easier and fairer**: who needs what, who is shopping, what's already at home, and how to split the cost. It is not meant to change what anyone eats or to rate their choices.

## 4. Imagining how it could go wrong

| # | Stakeholder | How the design could harm them | What we changed or decided | Status |
|---|---|---|---|---|
| E1 | Housemate on a tighter budget | The **cost split** and running total make income differences visible and turn shared shopping into a tally of debts. One participant said shared goals could be "stressful for one person because if he's getting less pay." | Shared staples are split evenly by default; personal requests are charged to whoever asked. Prices are optional, and unpriced items are left "to settle by hand". The summary can be dismissed without settling. *Next:* soften "owes" wording; let a household choose "don't split" | Partly addressed; testing in R4 (Q7) |
| E2 | Someone with a difficult relationship with food or their body | Group health goals and comparison can feel like judgement. A participant reacted to a dinner goal with: "It's essentially telling me that I'm fat… if anything, it could cause body dysmorphia." (Others found goals motivating, so reactions were mixed.) | v3 has **no group health goals, leaderboards, calories or health scores**. Compare is optional, shows facts only, and is ordered by the shopper's chosen priority. It never says "healthier". | Addressed by design |
| E3 | Every housemate | **Awareness becomes monitoring** (Schmidt). Showing who added what, who is shopping and what they bought could feel like surveillance inside the home. | The Dock shows that someone is shopping and the store they chose. There is no live location tracking. Aliases are fine. **Honest limit:** past shops, their cost splits and barcode scans (with the shopper's alias) stay on the server until the next reset. *Next:* auto-delete past shops and scans after settling. *Next:* ask in R4 what people didn't want others to see (Q8). | Partly addressed |
| E4 | The housemate who ends up maintaining the Dock | **Unequal work**: one person does the adding and organising while everyone benefits (Grudin's work vs benefit disparity), and this invisible labour often falls on the same person. | Quick-add chips, a meal → "Add what's missing" button, requests that take one tap. R4 counts items added **per person** (Q3). | Testing in R4 |
| E5 | Housemates who don't share food, or don't want to take part | The design's **script** (Akrich) assumes a cooperative household; non-participants may feel pressured to join or be left out. **In v3, items marked "for the household" are split across every token, so a housemate who never uses NutriCart still appears as owing a share.** | Everything works for one person, and personal requests are only charged to whoever asked. *Next:* let a housemate opt out of shared costs, and remove unused tokens. | Partly addressed |
| E6 | Housemates with dietary, cultural, religious or allergy needs | A product library and meal board built by our team reflect **our** food habits. | Products are editable in the Product library; compare shows the shopper's priority, not ours. Meals are currently fixed demo meals. *Next:* add and edit meals. *Next:* allergy and dietary notes per housemate visible on requests. | Open |
| E7 | Housemates with low vision or colour-vision differences | Colour-only tokens exclude some users. | Tokens carry a **number and a name** as well as a colour; large touch targets. *Next:* contrast check. | Partly addressed |
| E8 | Retailers, the household | **Commercial capture**: a compare screen is an obvious place to sell rankings to brands. Scraping prices could breach retailer terms. | Ordering is only by the shopper's chosen priority; no sponsored ordering, ever. Prices are entered by hand (currently four demo products; real shelf prices will be observed and entered by the team); **nothing is scraped**. | Decided |
| E9 | Everyone using it | **Data**: shopping lists reveal diet, budget and routines. Barcode lookups go to Open Food Facts; a hosted demo puts the database on a third-party server. | No accounts, no analytics, aliases only. The server stores list items, past shops with their cost splits, questions and barcode scans until the next reset. The demo database is reset between sessions. Database files are git-ignored. | Addressed for the prototype |
| E10 | Other shoppers, store staff, research participants | **Research harms**: shadowing felt intrusive; filming in store captures bystanders. | Moved from shadowing to lower-burden sessions; consent script; manager permission in store, or a simulated shop; no faces or bystanders; recordings and transcripts kept off public GitHub, deleted at semester end. | Addressed |
| E11 | The shopper | **Dependence**: if the server or connection fails mid-shop, the list disappears. | Automatic fallback from live connection to polling; hotspot setup. *Next:* keep a cached copy on the Cart Unit. | Partly addressed |

## 5. What we take responsibility for, and what we don't

**We take responsibility for:** E1–E11 as far as the design can reach. These are consequences of choices we made (what's shown, to whom, how costs are split, what's stored, how we ran research). Winner (1980) reminds us that a detail like "split shared items evenly" quietly settles a social question for the household. So the split rule is visible and explained, not hidden, and making it optional is our next step (E1).

**Outside our control, but named:** existing conflict between housemates (the Dock can surface it but not resolve it); retailer pricing accuracy; a household choosing to use the cost split to pressure someone. We can't prevent these, so we don't design features that amplify them, such as rankings, reminders to pay, or debt history.

## 6. Revision log

| Date | Milestone | What changed on this page |
|---|---|---|
| Wk 5 | Proposal Q&A and peer comments | Q&A raised: what is "healthy" for everyone; dietary, religious and cultural needs; eating disorders. Peer comments raised privacy and user control. |
| Wk 7–8 | Prototype interviews (v1, v2) | Evidence for E1 (pay) and E2 (body image) → group goals made optional; later left out of v3 |
| Wk 8 | Shadowing attempt | E10: method changed |
| 13 Oct | v3 build | E3, E8, E9, E11 added; first full disclaimer |
| 14 Oct | Research archive | Transcripts removed from the repo and its history; all sessions re-published as de-identified records; raw files kept privately on OneDrive (E10). Lesson: de-identify before anything leaves the private folder. |
| `[date]` | R4 evaluation | `[update E1, E3, E4, E5 with evidence]` |
| `[date]` | Tradeshow | `[visitor reactions]` |

## References

- Akrich, M. (1992). The de-scription of technical objects. In W. E. Bijker & J. Law (Eds.), *Shaping technology/building society* (pp. 205–224). MIT Press.
- Gispen, J. (2017). *Ethics for Designers* toolkit: Ethical Disclaimer. ethicsfordesigners.com
- Grudin, J. (1994). Groupware and social dynamics: Eight challenges for developers. *Communications of the ACM, 37*(1), 92–105.
- Loke, L., & Matthews, B. (2020). Scaffolding of interaction design education towards ethical design thinking. In G. Melles (Ed.), *Design thinking in higher education* (pp. 165–181). Springer. https://doi.org/10.1007/978-981-15-5780-4_8
- Schmidt, K. (2002). The problem with "awareness". *Computer Supported Cooperative Work, 11*(3–4), 285–298.
- Winner, L. (1980). Do artifacts have politics? *Daedalus, 109*(1), 121–136.
