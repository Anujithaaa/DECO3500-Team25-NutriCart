# Design Process Overview

**Poster:** `[link]` · **Promo video:** `[link, optional]` · **Prototype:** `[hosted link]/dock` and `/cart`, with run instructions in the [README](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart). There is no login: each device picks a housemate token. · **Team 25:** Aman Kushwaha, James Olbes, Anujitha Fernando, Kenan Chu

## Summary

We investigated how students living together near UQ St Lucia plan, coordinate and make grocery decisions, and how technology aware of the people and the moment could support them. Price decides most purchases, and “healthy” means something different to everyone. Most of our participants shopped alone, yet their shopping overlapped through shared staples, fridge space and lists sent to whoever was going. The useful social influence isn’t a feed of friends’ meals. It’s the everyday coordination of a student household: who needs what, who’s going, what’s already in the fridge, and who pays.

NutriCart Hub is our response. Housemates plan together at the kitchen Home Dock, and whoever shops takes the Cart Unit with the household's list, requests and budget. On re-docking, the shop returns with a cost split. The social computing sits in six moments where several housemates take part (G1–G6).

## Process

### 1. Understanding the domain (Weeks 3–6)
Our first domain statement was about "enhancing healthy food choices". Round 1 interviews asked for **stories** not opinions, and showed **price first** ("99 out of 100 times"), plans that give way to time and mood, and social influence that works through **trust and timing**: a housemate who finds the cheap milk, a reel seen right before going out. The literature showed food-choice tools are mostly individual (Marshall et al., 2022), and that social media inspiration rarely carries into the store (Wang et al., 2024). Proposal feedback asked: whose definition of healthy? Why an app?

`![Domain statement versions v1 to v4](images/domain-statements.png)`
*Our domain statement went through four versions, from "healthy choices" and "social media" to household coordination.*

### 2. An app as a probe, not a product (Weeks 6–7)
**v1** was a social shopping app with friend recommendations, group goals, recipes and a checklist. It was used as a **design probe** and reactions exposed our assumptions. People wanted **prices**, not friends' recipes. Group goals divided them: one participant worried about shared goals for someone "getting less pay", and another read a healthy-dinner goal as "essentially telling me that I'm fat". One asked why they'd use another app when the supermarket already has one. 

### 3. Reframing and divergence (Weeks 7–8)
Thematic synthesis reframed the problem: *support real grocery decisions around price, time, personal priorities and household needs, without adding effort, judgement or another app.* We explored non-app concepts (a budget buzzer, a "shopping traffic light", a two-person shopping pole, a fridge-to-trolley "grocery baton") and combined the strongest into **v2**: a cardboard Home Dock and detachable Cart Unit, tested using Wizard of Oz. Testing kept the **shared list, running budget and neutral compare**. It told us to shrink the Cart Unit, keep alerts rare ("noise, not help"), allow off-list items, and cut data entry ("will be a pain"). Shadowing had low uptake, so support has to work without an observer. This gave us four experience requirements: the Hub should inform without judging, put price first, add no extra effort, and support coordination the household already does.

`![Storyboard](images/storyboard.png)` *Storyboard: Jay forgets what's at home and buys doubles; with the Hub, the household's needs travel with him.*
`![v2 cardboard prototype](images/v2-cardboard.jpg)` *v2: cardboard Dock and Cart Unit.*

### 4. "What's the point of the social part?" (Week 9 Stand-up)
Staff said the social aspect was weak: apps are individual by nature, so we redesigned around **six group moments** and placed them on the time–space matrix:

| | Same time | Different time |
|---|---|---|
| **Same place** | G1 plan together at the Dock · G5 Split Shop in store | G2 leave a request · G3 hand over the baton (then travels with the shopper) · G6 return and settle |
| **Different place** | G4 one quick question home | – |

The Hub now **facilitates** coordination households already do (Olsson et al., 2020), uses visible traces rather than notifications (Schmidt, 2002) and gives every housemate something back (Grudin, 1994).

### 5. v3: multi-user and live, going physical (Weeks 10–11)
v3 is an **integration prototype** (Houde & Hill, 1997): its real where the social experience depends on it. James built a live sync backend and an Expo Cart Unit with **barcode scanning**. v0.3 added housemate tokens, requests, "Jay is shopping now", Ask home, Split Shop across two phones, a meal board that skips what's already at home, and a cost-split summary. Screens sit in **physical housings** `[update when built, with photos]`. Prices are entered by hand, and compare orders products by **the shopper's** priority, never "healthier".

![Home Dock during a shop](images/v3-dock-live.png)
*v3 Home Dock: Jay and Sam are shopping (live budget). Jay's question from the store waits for a one-tap answer.*

![Cart Units](images/v3-cart-units.png)
*v3 Cart Units: Split Shop ("My half"), Ask home, neutral compare and the return summary.*

### 6. Evaluating with groups, in context (Week 11)
`[Write after R4: who took part (IDs), where, what happened for each question Q1–Q8, the 3–5 most important findings with evidence, and what changed in response.]`

### 7. Tradeshow (Week 12)
`[What visitors did in pairs, notable reactions, any last changes.]`

### Limitations
Our samples were small, qualitative and mostly people we knew. Early questions were sometimes leading and framed around "healthier" vs "cheaper". In testing, we explained screens before asking for first impressions, so our results show usability more than choices. Sessions were mostly one-on-one, so household moments were role-played and couldn't show how a household behaves over days (Grudin, 1994). Shadowing had low uptake, so we relied on what participants told us. v2 was run as Wizard of Oz, and v3 supports one household per server and assumes housemates keep recording what they buy. 

## Who did what

| Member | Main contributions |
|---|---|
| Aman Kushwaha | Plan, charter, task board and stand-up records; synthesis; post-stand-up direction; evaluation plan; pitch `[confirm/extend]` |
| James Olbes | shadowing session; physical prototypes; backend and Expo Cart Unit (v0.1–v0.2); poster `[confirm/extend]` |
| Anujitha Fernando | Set up GitHub repo; integration, hosting and multi-device testing of v3 `[confirm/extend]` |
| Kenan Chu | Physical prototypes; interview protocol synthesis; personas and user scenarios; organised the research archive and README on GitHub; theory links; WIKI and final PDF `[confirm/extend]` |

Interviews and testing were shared across the team (21 sessions in total). See [evidence register](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/User-Research#6-evidence-register) on user Research for who ran each session.

`[AI use statement per course policy]`

## References

Grudin, J. (1994). Groupware and social dynamics: Eight challenges for developers. *Communications of the ACM, 37*(1), 92–105.
Houde, S., & Hill, C. (1997). What do prototypes prototype? In M. Helander, T. Landauer & P. Prabhu (Eds.), *Handbook of Human-Computer Interaction* (2nd ed., pp. 367–381). Elsevier.
Marshall et al. (2022). `[full citation]`
Olsson, T., Jarusriboonchai, P., Woźniak, P., Paasovaara, S., Väänänen, K., & Lucero, A. (2020). Technologies for enhancing collocated social interaction: Review of design solutions and approaches. *Computer Supported Cooperative Work, 29*, 29–83.
Schmidt, K. (2002). The problem with "awareness". *Computer Supported Cooperative Work, 11*(3–4), 285–298.
Wang et al. (2024). `[full citation]`
