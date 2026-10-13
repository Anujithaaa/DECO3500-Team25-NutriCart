# Design Process Overview

**Poster:** `[link]` · **Promo video:** `[link, optional]` · **Prototype:** `[hosted link]/dock` and `/cart`, with run instructions in the [README](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart). There is no login: each device picks a housemate token. · **Team 25:** Aman Kushwaha, James Olbes, Anujitha Fernando, Kenan Chu

## Summary

We set out to support **healthier grocery choices** for UQ students using social and context-aware technology. Our research showed that this framing missed what students actually struggle with. Price decides most purchases, "healthy" means something different to everyone, and the most useful social influence isn't a feed of friends' meals. It's the everyday coordination of a share house: who needs what, who's going, what's already in the fridge, and who pays.

**NutriCart Hub** is our response: a shared kitchen device for student share houses. Housemates plan together at the **Home Dock**. Whoever goes shopping takes the **Cart Unit** into the store with the household's list, requests and budget. When they re-dock, the shop comes back to the household with a cost split. The social computing is in six moments where more than one housemate takes part, across home and store and across same-time and different-time use (G1–G6 below).

## Process

### 1. Understanding the domain (Weeks 3–6)
Our first domain statement was about "enhancing healthy food choices" with social and contextual computing. In Round 1 interviews we asked for **stories** rather than opinions: the last trip, a time someone changed what you bought, a recipe that made it into a basket. These showed **price first** ("99 out of 100 times"), plans that give way to time and mood, and social influence that works through **trust and timing**: a housemate who finds the cheap milk, a reel seen right before going out. The literature showed food-choice tools are mostly individual (Marshall et al., 2022), and that food content on social media inspires people, but doesn't always carry over into what they buy in store (Wang et al., 2024). Our proposal offered three app concepts. Feedback asked: whose definition of healthy? Why an app? Social *contexts* or social *features*?

`![Domain statement versions v1 to v4](images/domain-statements.png)`
*Our domain statement went through four versions, from "healthy choices" and "social media" to household coordination.*

### 2. An app as a probe, not a product (Weeks 6–7)
We built **v1**, a social shopping app with friend recommendations, group goals, recipes and a checklist. We treated it as a **design probe**: something concrete to react to. Reactions exposed our assumptions. People wanted **prices**, not friends' recipes. Group goals divided them: one participant worried about shared goals for someone "getting less pay", and another read a healthy-dinner goal as "essentially telling me that I'm fat". One asked why they'd use another app when the supermarket already has one. Looking back, some of our questions were leading, and short one-on-one sessions couldn't show how a household behaves over days (Grudin, 1994).

### 3. Reframing and divergence (Weeks 7–8)
A thematic synthesis reframed the problem: *support real grocery decisions around price, time, personal priorities and household needs, without adding effort, judgement or another app.* We diverged into non-app concepts: a budget buzzer, a "shopping traffic light", a two-person shopping pole, a fridge-to-trolley "grocery baton". We then combined the strongest into **NutriCart Hub v2**: a cardboard Home Dock with a detachable Cart Unit, plus an HTML version. Testing kept the **shared list, running budget and neutral compare**. It also told us to shrink the Cart Unit for baskets, keep alerts rare ("noise, not help"), allow off-list items, and cut data entry, which one participant said "will be a pain". An attempt to **shadow** shoppers had low uptake because of privacy, self-consciousness and time. That was a finding in itself: support has to work without an observer.

`![Storyboard](images/storyboard.png)` *Storyboard: Jay forgets what's at home and buys doubles; with the Hub, the household's needs travel with him.*
`![v2 cardboard prototype](images/v2-cardboard.jpg)` *v2: cardboard Dock and Cart Unit.*

### 4. "What's the point of the social part?" (Week 9)
At the stand-up, staff told us the social aspect was weak: apps are individual by nature, so how would a **group** use a physical device? We redesigned around **six group moments** and placed them on the time–space matrix:

| | Same time | Different time |
|---|---|---|
| **Same place** | G1 plan together at the Dock · G5 Split Shop in store | G2 leave a request · G3 hand over the baton (then travels with the shopper) · G6 return and settle |
| **Different place** | G4 one quick question home | – |

The Hub now **facilitates** coordination the household already does (Olsson et al., 2020). It uses visible traces in a shared space rather than notifications (Schmidt, 2002). Every housemate gets something back for taking part (Grudin, 1994).

### 5. v3: multi-user and live, going physical (Weeks 10–11)
Following Houde and Hill (1997), v3 is an **integration prototype**. It is real where the social experience depends on it and simulated where it doesn't. James built a backend with live sync and an Expo Cart Unit with **camera barcode scanning** (v0.1–v0.2). v0.3 added the household layer: housemate tokens, requests with notes, "Jay is shopping now", Ask home, Split Shop across two phones, a meal board that skips what's already at home, and a return summary with a cost split. The screens go into **physical housings**: a kitchen stand with numbered tokens, and a phone mount for a basket or trolley handle `[update when built, with photos]`. Prices are entered by hand (the team pre-loads real shelf prices before testing) and nothing is scraped. Compare orders products by **the shopper's** priority and never says "healthier".

![Home Dock during a shop](images/v3-dock-live.png)
*v3 Home Dock: Jay and Sam are shopping (live budget). Jay's question from the store waits for a one-tap answer.*

![Cart Units](images/v3-cart-units.png)
*v3 Cart Units: Split Shop ("My half"), Ask home, neutral compare and the return summary.*

### 6. Evaluating with groups, in context (Week 11)
`[Write after R4: who took part (IDs), where, what happened for each question Q1–Q8, the 3–5 most important findings with evidence, and what changed in response.]`

### 7. Tradeshow (Week 12)
`[What visitors did in pairs, notable reactions, any last changes.]`

### Limitations
Small, qualitative samples. Earlier sessions were one-on-one and sometimes leading. One household per server. "Already at home" only knows what passed through NutriCart. Deal and location features are simulated.

## Who did what

| Member | Role | Main contributions |
|---|---|---|
| Aman Kushwaha | Project Management Lead | Plan, charter, task board and stand-up records; Round 1 interviews (×2); app-probe sessions (×5); synthesis; post-stand-up direction; evaluation plan; pitch `[confirm/extend]` |
| James Olbes | Design & Prototyping Lead | Round 1 interview (×1); app-probe session (×1); shadowing session; physical prototypes; backend and Expo Cart Unit (v0.1–v0.2); poster `[confirm/extend]` |
| Anujitha Fernando | Technical & Dev Lead | Round 1 interviews (×2); app-probe session (×1); GitHub repo owner; integration, hosting and multi-device testing of v3 `[confirm/extend]` |
| Kenan Chu | Documentation & Theory Lead | Round 1 interviews (×2); app-probe sessions (×3); physical Hub sessions (×3); organised the research archive and README on GitHub; theory links; WIKI and final PDF `[confirm/extend]` |

`[AI use statement per course policy]`

## References

Grudin, J. (1994). Groupware and social dynamics: Eight challenges for developers. *Communications of the ACM, 37*(1), 92–105.
Houde, S., & Hill, C. (1997). What do prototypes prototype? In M. Helander, T. Landauer & P. Prabhu (Eds.), *Handbook of Human-Computer Interaction* (2nd ed., pp. 367–381). Elsevier.
Marshall et al. (2022). `[full citation]`
Olsson, T., Jarusriboonchai, P., Woźniak, P., Paasovaara, S., Väänänen, K., & Lucero, A. (2020). Technologies for enhancing collocated social interaction: Review of design solutions and approaches. *Computer Supported Cooperative Work, 29*, 29–83.
Schmidt, K. (2002). The problem with "awareness". *Computer Supported Cooperative Work, 11*(3–4), 285–298.
Wang et al. (2024). `[full citation]`
