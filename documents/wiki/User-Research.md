# User Research

This page synthesises our research: methods, who took part, what we found, and how each finding changed the design. Every session has a **de-identified record** with a participant code in [`documents/research/interviews`](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/tree/main/documents/research/interviews). Original recordings and transcripts stay in the team's private OneDrive.

## 1. Methods at a glance

| Round | Method | Purpose | Run by | Participants | Prototype shown |
|---|---|---|---|---|---|
| R1 | Semi-structured interviews (5 story-based questions: last trip, someone who changed what you bought, social media, healthy vs cheap, hardest part) | Understand how UQ students actually shop, and where social influence shows up | Aman 2, Anujitha 2, James 1, Kenan 2 | **7** (R1-P01–P07) | none |
| Lit | Literature review | Position the gap | All | 8 unique papers (10 entries across members; two overlap) | – |
| AP | Think-aloud with the **v1 app probe**, then follow-up questions (in person or by screen share) | React to something concrete: friend recommendations, group goals, recipes, checklist | Aman 5, Kenan 3, Anujitha 1, James 1 | **10 sessions** (AP-P01–P10); AP-P08 may be R1-P06 again | v1 app |
| HP | Think-aloud with the **v2 NutriCart Hub** physical Cart Unit (three screens: list, alerts and suggestions, compare) | Test the reframed household concept | Kenan | **3 sessions** (HP-P01–P03), all with people interviewed before | v2 Hub (physical) |
| SH | Shadowing in store (accompany a shop, then post-shop questions) | See behaviour rather than recalled behaviour | James (1 completed), others declined | **1** (SH-P01, same person as R1-P05) | none |
| ST | Studio peer interviews (8 Sep) plus proposal Q&A, studio reviews and peer comments | Critique from staff and other teams | Team | Teams 16, 3 and two others (ST-2026-09-08); **not target users** | slides, v1, v2 |
| G | **Rapid group sessions** (one plans at the Hub, one shops with the Cart Unit, then they swap or answer questions) | Does a household coordinate through it, and would they use it? | Kenan 1, Aman 1 | **2 groups, 4 participants** (G01-P1/P2, G02-P1/P2); see [Evaluation Plan](Evaluation-Plan) | app-v2 |

> **Counting rule.** Each **session** has one code. Some people took part more than once (noted under *Linked records* in each record), so sessions ≠ people. Across R1, AP and HP we ran **20 sessions** with UQ students, plus one shadowing session and **2 group sessions** (4 participants) in Week 12: **23 sessions** in all. Counts on the poster and in the Design Process Overview come only from the register in section 6.
>
> **Note:** an earlier internal analysis said some app-probe sessions used the HTML Hub. The transcripts show all of Aman's five sessions used the v1 app.

## 2. Who we spoke to

UQ students aged roughly 18–25 who shop in person near St Lucia (IGA Hawken Drive, Chai Supermarket, Woolworths Toowong and Indooroopilly, Coles). They are budget-conscious, juggle study and work, and live in share houses, student accommodation or on their own. Most shop **alone**, even when they live with others.

### Published data

- **Budget pressure is common.** 41.9% of students surveyed at one Australian university were food insecure (Kent et al., 2022). This matches what our participants told us about money: "budget is tight" ([R1-P02](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/R1-P02.md)).
- **Share houses are a distinct household type.** Group households made up 3.9% of Australian households in the 2021 Census (AHURI, 2022). Food apps are built for individuals or families, not for this kind of household (Marshall et al., 2022).

## 3. What we found

### Price structures the shop
> "I ended up choosing the unhealthier option because of the price. Since I'm an international student, budget is tight." When asked how often: "99 out of 100 times." ([R1-P02](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/R1-P02.md))

> "Nine times out of ten I'm going to go for the product on sale." ([R1-P06](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/R1-P06.md))

### Plans give way to time, mood and routine
> "I don't really depend on my list at all. I just depend on my mood." ([R1-P01](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/R1-P01.md))

People rush between classes and grab what's closest, buy the same few things, and only compare when something is unfamiliar or the price changes.

### "Healthy" means different things to different people
Participants judged food by protein, sugar, fat, sodium, freshness, whether it "wasn't deep fried", or simply didn't prioritise health. **No single "healthy" score could serve them all.**

### Social influence is real, but it runs on trust and timing
> "My housemates are quite good at finding cheap alternatives and more affordable options. Every time we share the milk, or toilet roll, or whatever, we try to look for the cheapest alternative." ([R1-P07](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/R1-P07.md))

> "Without social media I probably wouldn't know what to cook." ([R1-P07](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/R1-P07.md))

Recipes from a trusted friend or partner, or a reel seen just before going out, led to purchases. Generic content mostly didn't.

### Social comparison divides people
> "It's a pretty good thing if two people have the same goal, but sometimes it could be stressful for one person because if he's getting less pay." ([AP-P05](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/AP-P05.md))

> "It's essentially telling me that I'm fat… if anything, it could cause body dysmorphia." ([AP-P09](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/AP-P09.md)), reacting to the group dinner goal

### Coordination beats a feed
> "I don't have to remember what my roommate texted me a few days ago." ([HP-P02](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/HP-P02.md))

> "I don't really care about Sarah's [a persona in the prototype] chicken burrito bowl, to be honest… I'd rather see like, oh, like a protein powder is on sale." ([AP-P09](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/AP-P09.md))

Shared lists, housemate requests, knowing what's already at home and who's buying what were consistently useful. Friend feeds were not.

### In store, less is more
> "If every second aisle my cart is buzzing with a housemate's opinion, that's going to feel like noise, not help, and I'll start ignoring it entirely." ([HP-P02](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/HP-P02.md))

> "Sometimes I forget my budget so seeing what's remaining will really help." ([HP-P01](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/HP-P01.md))

### Effort is the barrier
> "Adding the ingredients and suggestions to the home unit will be a pain to do for me and my housemates." ([HP-P01](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/HP-P01.md))

> "If there was a sale on avocados will it let me add them or have to add to home dock to work?" ([HP-P02](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/HP-P02.md))

### Being watched changes shopping
Shadowing had low uptake. People cited privacy, feeling self-conscious and time. The method itself was evidence: in-store support has to work **without** an observer, and our evaluation had to lower the burden on participants.

## 4. From findings to design

| Finding | Design response | Where in v3 |
|---|---|---|
| Price structures the shop | Budget is the most prominent element in store | Cart Unit header: money left, progress bar |
| "Healthy" differs by person | Compare shows facts in the order **the shopper** picks; no verdict, no score | Compare: Price / Protein / Less sugar |
| Comparison can hurt (pay, body image) | Group health goals left out of v3; leaderboard-style comparison never built | – (left out) |
| Trust and coordination beat feeds | Household requests with notes instead of a friend feed | Dock list: "for Jay · *the cheap one please*" |
| Most people shop alone, but others shape the shop | Solo shopping works fully; others take part through the Dock | G2 requests, G3 "Jay is shopping now", G4 Ask home |
| Alerts become noise | No push alerts from housemates; one deliberate question at a time, answered with a tap | G4 Ask home |
| Off-list buys happen | Add items in store | Cart Unit: "Not on the list?" |
| People forget what's at home | "Already at home" list fed automatically by each shop | Dock pantry, badges on the list |
| Data entry is "a pain" | Quick-add chips, a meal → missing-ingredients button, prices optional | Dock quick-add, meal board |
| Another app is unwanted | A dedicated household object: Dock in the kitchen, Cart Unit on the basket | Physical Dock stand and Cart Unit mount (built) |
| Shopping together means splitting up in store | Split the list across two Cart Units | G5 Split Shop |
| Shared costs cause friction | A neutral cost split after the shop | G6 return summary |

### Requirements and how they changed

We set experience requirements before the Week 9 stand-up (see [Week 9 Stand-up](Week-9-Stand-up)) and checked them again after the Week 12 group tests.

| Requirement | Came from | After Week 12 testing |
|---|---|---|
| Price and budget visible when they matter | R1 (price first) | **Confirmed:** all four named the budget, Compare or deals as the best part (F1) |
| No universal "healthy" verdict | R1, AP-P09 | Kept; nobody asked for a health score |
| No public comparison; trusted input is optional | AP-P05, AP-P09 | Kept |
| Low effort: no constant logging | HP-P01 ("a pain") | **Not yet met:** "too many steps", "super tedious" (F5) → one-line quick-add; the finished shop updates what's at home |
| Fits the coordination a house already does | HP-P02 | **Revised:** work alongside the group chat instead of replacing it (F3) |
| Right moment: plan at home, quick decisions in store | Location framework, R1 | **Refined:** the social value is the live in-store moment (F4) |
| Rare, deliberate alerts | HP-P02 ("noise, not help") | Kept; lights replaced by a chime (F6) |
| Works for solo and shared shopping | R1 (most shop alone) | Kept |
| Usable unassisted the first time | Brief; G-01, G-02 | **New:** first use was hard for all four (F2) → a 3-step guide on first open and at our stall |

## 5. Limitations

- Samples are small and qualitative; we report patterns, not percentages.
- Some early prototype questions were leading, or explained a feature's benefit before the participant had reacted.
- Not everyone saw the same prototype version, so we don't compare versions as if they were conditions.
- AP and HP sessions were one participant at a time, which can't show household dynamics that unfold over days (Grudin). The two Week 12 group sessions address this only partly.
- People who agreed to take part may be more interested in food and shopping than those who declined.
- Studio peer feedback is critique, not user evidence, and is labelled as such.

## 6. Evidence register

Every finding on the poster or in the overview traces back to a row here. Codes only, never names.

| Code | Study | Run by | Prototype | Record | Used for |
|---|---|---|---|---|---|
| R1-P01 | R1 | Aman | – | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/R1-P01.md) | Plans give way to mood (§3) |
| R1-P02 | R1 | Aman | – | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/R1-P02.md) | Price first, "99 out of 100 times" (§3, overview §1, poster) |
| R1-P03 | R1 | Anujitha | – | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/R1-P03.md) | Round 1 synthesis |
| R1-P04 | R1 | Anujitha | – | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/R1-P04.md) | Round 1 synthesis |
| R1-P05 | R1 | James | – (also SH-P01) | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/R1-P05.md) | Round 1 synthesis; later shadowed (SH-P01) |
| R1-P06 | R1 | Kenan | – | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/R1-P06.md) | Price first: buys what is on sale (§3) |
| R1-P07 | R1 | Kenan | – | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/R1-P07.md) | Social influence runs on trust (§3) |
| AP-P01 | AP | Aman | v1 app | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/AP-P01.md) | v1 probe synthesis |
| AP-P02 | AP | Aman | v1 app | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/AP-P02.md) | v1 probe synthesis |
| AP-P03 | AP | Aman | v1 app | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/AP-P03.md) | v1 probe synthesis |
| AP-P04 | AP | Aman | v1 app | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/AP-P04.md) | v1 probe synthesis |
| AP-P05 | AP | Aman | v1 app | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/AP-P05.md) | Comparison divides people, "getting less pay" (§3, overview §2, Ethics E1) |
| AP-P06 | AP | Anujitha | v1 app | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/AP-P06.md) | v1 probe synthesis |
| AP-P07 | AP | James | v1 app | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/AP-P07.md) | v1 probe synthesis |
| AP-P08 | AP | Kenan | v1 app | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/AP-P08.md) | v1 probe synthesis |
| AP-P09 | AP | Kenan | v1 app | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/AP-P09.md) | "Telling me that I'm fat"; friend feed unwanted (§3, overview §2, Ethics E2, poster) |
| AP-P10 | AP | Kenan | v1 app | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/AP-P10.md) | v1 probe synthesis |
| HP-P01 | HP | Kenan | v2 Hub (physical) | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/HP-P01.md) | Budget remaining; data entry "a pain" (§3, overview §3) |
| HP-P02 | HP | Kenan | v2 Hub (physical) | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/HP-P02.md) | "Texted me a few days ago"; "noise, not help" (§3, overview §3, poster) |
| HP-P03 | HP | Kenan | v2 Hub (physical) | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/HP-P03.md) | v2 Hub synthesis |
| SH-P01 | SH | James | – (in store) | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/shadowing/SH-P01.md) | Being watched changes shopping (§3, Ethics E10) |
| ST-2026-09-08 | ST | Team | v1 app (peers) | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/research/interviews/ST-2026-09-08.md) | Studio critique (not user evidence) |
| G01-P1 | Eval R1 | Kenan | app-v2 | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/evaluation/G-01.md) | Findings F2–F6 |
| G01-P2 | Eval R1 | Kenan | app-v2 | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/evaluation/G-01.md) | Findings F1–F6 |
| G02-P1 | Eval R1 | Aman | app-v2 | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/evaluation/G-02.md) | Findings F1–F3 |
| G02-P2 | Eval R1 | Aman | app-v2 | [record](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/blob/main/documents/evaluation/G-02.md) | Findings F1–F3 |

## References

- AHURI. (2022, July 26). *Census reveals changes in the makeup of households 2011 to 2021*. Australian Housing and Urban Research Institute. https://www.ahuri.edu.au/analysis/brief/census-reveals-changes-makeup-households-2011-2021
- Bomfim, M. C. C., Nacke, L. E., Kirkpatrick, S. I., & Wallace, J. R. (2020). Food literacy while shopping: Motivating informed food purchasing behaviour with a situated gameful app. In *Proceedings of the 2020 CHI Conference on Human Factors in Computing Systems*. ACM. https://doi.org/10.1145/3313831.3376801
- Bomfim, M. C. C., Wong, E., Liang, P., & Wallace, J. R. (2022). Design and evaluation of technologies for informed food choices. *ACM Transactions on Computer-Human Interaction*. https://doi.org/10.1145/3565482
- Di Cosola III, B. M., & Neff, G. (2022). Nudging behavior change: Using in-group and out-group social comparisons to encourage healthier choices. In *Proceedings of the 2022 CHI Conference on Human Factors in Computing Systems*. ACM.
- Grudin, J. (1994). Groupware and social dynamics: Eight challenges for developers. *Communications of the ACM, 37*(1), 92–105.
- Houde, S., & Hill, C. (1997). What do prototypes prototype? In M. Helander, T. Landauer & P. Prabhu (Eds.), *Handbook of Human-Computer Interaction* (2nd ed., pp. 367–381). Elsevier.
- Kent, K., Visentin, D., Peterson, C., Ayre, I., Elliott, C., Primo, C., & Murray, S. (2022). Severity of food insecurity among Australian university students, professional and academic staff. *Nutrients, 14*(19), 3956. https://doi.org/10.3390/nu14193956
- Marshall, J., Jimenez-Pazmino, P., Metoyer, R., & Chawla, N. V. (2022). A survey on healthy food decision influences through technological innovations. *ACM Transactions on Computing for Healthcare, 3*(2), Article 25. https://doi.org/10.1145/3494580
- Strecker, J., Wu, J., Bektaş, K., Vaslin, C., & Mayer, S. (2024). ShoppingCoach: Using diminished reality to prevent unhealthy food choices in an offline supermarket scenario. In *Extended Abstracts of the CHI Conference on Human Factors in Computing Systems (CHI EA '24)* (pp. 1–8). ACM. https://doi.org/10.1145/3613905.3650795
- Wang, C.-H. A., Sher, S. T.-H., & Chung, C.-F. (2024). From viral content to real-life cuisine and beyond: Examining teenagers' interactions with TikTok food videos and the influence on their food practices. *Proceedings of the ACM on Human-Computer Interaction, 8*(CSCW2), Article 389. https://doi.org/10.1145/3686928
- Wongprawmas, R., Sogari, G., Menozzi, D., & Mora, C. (2022). Strategies to promote healthy eating among university students: A qualitative study using the nominal group technique. *Frontiers in Nutrition, 9*, Article 821016. https://doi.org/10.3389/fnut.2022.821016
- *Healthy Eating, Identities, and Design Opportunities in Social Media Spaces* (reviewed by James).
