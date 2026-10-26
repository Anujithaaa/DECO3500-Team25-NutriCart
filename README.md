# NutriCart

DECO3500 Social & Mobile Computing · Semester 2, 2026 · Team 25

NutriCart is a shared household shopping system designed for student share houses. The current iteration combines a **Home Dock** used for planning at home with a detachable **Cart Unit** used while shopping.

The project has moved away from the earlier idea of making grocery shopping “more social” through extra social features. The current direction focuses on supporting the coordination that already happens between housemates: deciding what is needed, planning meals, managing a shared list and budget, checking what is already at home, comparing products, and dividing shopping responsibilities.

The Home Dock and Cart Unit are intended to work as one shared process rather than as two separate apps. The full design history is documented in the [Design Process Overview](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/Design-Process-Overview).

---

## Current iteration

The newest tested version is **app-v2**, located in:

```text
prototype/app-v2/
```

This iteration was tested in Week 12 using:

- a laptop as the Home Hub
- an Expo Go phone as the Cart Unit
- two-housemate test sessions
- role swapping between Home Hub and Cart Unit in G-01
- an in-home kitchen test in G-02

The current iteration includes:

- shared shopping list
- household requests
- Already at Home
- meal ideas
- running budget
- barcode scanning
- product comparison
- editable shelf prices
- Split Shop concept
- shared state between the Home Hub and Cart Unit

This is still an evolving prototype. Some parts of the wider NutriCart concept, including stronger two-phone coordination, Ask Home, cost splitting and more complete re-docking behaviour, exist in other prototype versions or remain areas for further iteration.

---

## What the latest testing showed

Two group test sessions were used to evaluate app-v2.

### G-01

G-01 involved two housemates using the Home Hub and Cart Unit, then swapping roles.

The strongest issues were:

- navigation felt confusing for first-time users
- some features felt like extra steps compared with Notes or a group chat
- Housemate Requests and Already at Home were not seen as useful enough by both participants
- Split Shop was not immediately clear
- the social purpose of the system was questioned
- LED notifications were not considered useful

However, there were still features participants valued:

- the shared shopping list was useful for group shopping
- Product Compare was liked
- the remaining budget was strongly valued
- meal ideas were useful when housemates were indecisive
- deal information was useful, although location information was requested

The main lesson from G-01 was that NutriCart cannot justify itself only by combining features that already exist elsewhere. It needs to reduce effort and make coordination easier than the tools people already use.

### G-02

G-02 involved two housemates using the system in their own shared kitchen.

This session was more positive about the core concept.

Participants liked:

- Product Compare
- seeing prices in one place
- household communication
- meal and recipe suggestions
- avoiding duplicate purchases
- offers and budget information
- Split Shop

The main criticism was again first-time usability. Both participants found the interface a little dull and difficult to understand at first.

Both also said the system would be worth trying if it could save a meaningful amount of **time and money**, which reinforces the importance of budget, comparison and reducing duplicated purchases.

---

## How this feedback shapes the current direction

The latest iteration is therefore focused less on adding features and more on making the existing workflow easier to understand.

| Feedback | Current design response |
|---|---|
| Too many steps | Reduce unnecessary screens and make the main shopping flow more direct |
| Navigation unclear | Improve labels, screen hierarchy and first-time guidance |
| Requests feel like another group chat | Keep requests lightweight and tied directly to shopping items |
| Already at Home may become tedious | Treat it as supporting information rather than something users must constantly maintain |
| Compare was useful | Keep Product Compare as one of the main Cart Unit features |
| Budget was highly valued | Keep the running budget visible during the shop |
| Meal ideas were useful | Keep meal planning connected directly to the shared list |
| Split Shop was confusing | Make the two-person purpose and device relationship clearer |
| LED feedback was not valued | Do not treat LED notifications as a central interaction |
| Users already rely on Notes and group chats | NutriCart must provide value through connected household state, not simply repeat messaging features |

The key design question for the next iteration is:

> Does NutriCart reduce the effort of coordinating a shared shop enough to justify using it instead of a group chat, Notes app or existing grocery app?

---

## Quick links

| | |
|---|---|
| **Prototype** | Runs on a laptop and phones. See [Requirements](#requirements) and the run steps below |
| **Poster** | [NutriCart_Poster_A2.pdf](documents/promo/NutriCart_Poster_A2.pdf) |
| **Submitted PDF** | [NutriCartHub_3DesignPrototype.pdf](documents/promo/NutriCartHub_3DesignPrototype.pdf) (Design Process Overview + Ethical Considerations) |
| **Tradeshow feedback** | [tradeshow-feedback.md](documents/evaluation/tradeshow-feedback.md) |
| **Iteration evaluation** | [current-iteration-evaluation.md](documents/evaluation/current-iteration-evaluation.md) (what testing and the tradeshow mean for the next version) |
| **Promo Video** | [NutriCart_Showcase_Loop.mp4](documents/promo/NutriCart_Showcase_Loop.mp4) |
| **Pitch script** | [pitch-script.md](documents/promo/pitch-script.md) |
| **Try-it card (stall)** | [NutriCart_Try-it_card_A5.pdf](documents/promo/NutriCart_Try-it_card_A5.pdf) |
| **Task board** | [GitHub Projects](https://github.com/users/MaxCoder07/projects/1) |
| **Earlier prototype (v2 HTML Hub)** | https://jarxto.github.io/DECO3500_New_Prototype/Nutricart_Hub/ |

---

## Key documentation

- [Design Process Overview](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/Design-Process-Overview)
- [Ethical Considerations](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/Ethical-Considerations)
- [User Research](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/User-Research)
- [Evaluation Plan](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/Evaluation-Plan)
- [Week 9 Stand-up](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/Week-9-Stand-up)
- [Stand-up Records](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/Stand-up-Records)

Repository folders:

- [Research](documents/research)
- [Interview records (de-identified)](documents/research/interviews)
- [Evaluation](documents/evaluation)
- [Design](documents/design)
- [Standups](documents/standups)
- [Team](documents/team)
- [Promo](documents/promo)

---

# Try the prototype

One server represents one household.

## Main prototype screens

| Screen | Runs on | Used for |
|---|---|---|
| **Home Dock** | Laptop or tablet in the home | Meal planning, shared list, household requests, Already at Home and shopping preparation |
| **Expo Cart Unit** | Phone with Expo Go | Shopping list, running budget, barcode scanning, Compare and shopping-related household information |
| **Web Cart Unit** | Phone browser in the wider prototype | Shared list, budget, Ask Home, Split Shop and finishing the shop |

---

## Main household flow

A typical NutriCart journey is:

1. **Plan at home**  
   Housemates use the Home Dock to check the list, discuss a meal and see what is already available.

2. **Prepare the shared list**  
   Items can be added by different housemates, including quantities, requests or exact products where needed.

3. **Take the Cart Unit shopping**  
   The shopper uses the shared list and running budget while in the supermarket.

4. **Compare when needed**  
   Two products can be scanned and compared by price and available product information.

5. **Coordinate with another shopper**  
   Split Shop can divide shopping responsibilities when two people are involved.

6. **Return to the household**  
   Updated shopping information should return to the shared household state.

The goal is not to force every household to shop socially. Close friends may use NutriCart while planning meals and shopping together, while less familiar housemates may mainly use it for low-pressure practical coordination.

---

# Running app-v2

`prototype/app-v2` is the redesigned Home Hub and Expo Cart Unit used in the Week 12 testing.

## Requirements

Install:

- **Python 3.12**
- **Node.js 20.19 or newer**
- **Expo Go** on the phone

The computer and phone must be connected to the same network.

A phone hotspot is recommended if university Wi-Fi prevents devices from communicating.

---

## Terminal 1 - backend

Open a terminal in:

```text
prototype/app-v2/backend
```

### Windows

Create the virtual environment:

```powershell
py -3.12 -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install requirements:

```powershell
pip install -r requirements.txt
```

Start the backend:

```powershell
python run.py
```

Open:

```text
http://localhost:8000/hub
```

The backend should also provide the local network address needed by the phone.

---

## Terminal 2 - Expo Cart Unit

Open another terminal in:

```text
prototype/app-v2/cart-expo
```

Create or update the `.env` file:

```text
EXPO_PUBLIC_API_URL=http://YOUR-COMPUTER-IP:8000
```

Example:

```text
EXPO_PUBLIC_API_URL=http://192.168.0.24:8000
```

Do not use `localhost` for the phone because `localhost` on the phone refers to the phone itself.

Install the packages:

```powershell
npm.cmd install
```

Start Expo:

```powershell
npx.cmd expo start --clear
```

Scan the QR code with Expo Go.

Demo barcodes:

```text
9300000000019
9300000000026
9300000000033
9300000000040
```

If Expo package versions do not match the installed SDK, run:

```powershell
npx.cmd expo install --fix
```

---

## Resetting app-v2

To reset the local app-v2 database:

1. Stop the backend.
2. Delete:

```text
prototype/app-v2/backend/nutricart.db
```

3. Start the backend again.

Only do this when you intentionally want to reset the prototype data.

---

# Wider prototype

The repository also contains the wider v0.3 prototype under:

```text
prototype/backend
```

This version includes additional household coordination features such as:

- household tokens
- shopping-now status
- Ask Home
- multi-device Split Shop
- cost splitting
- meal board
- Already at Home
- reset tools
- web Cart Unit

These features represent a broader version of the design direction, while **app-v2 is the redesigned version used in the Week 12 evaluation sessions**.

---

## Real vs simulated

| Real | Simulated or simplified |
|---|---|
| Shared state between the Home Hub and Cart Unit | One household is represented by one server |
| Shared shopping list and household information | Some household information must still be entered manually |
| Expo barcode scanning | Scanner reliability depends on camera, lighting and barcode quality |
| Open Food Facts product lookup | Product data may be incomplete |
| Running shopping budget | Shelf prices can be entered manually |
| Product comparison | Retail prices are not automatically scraped from Woolworths or Coles |
| Household coordination features | Not every feature has been tested equally across multiple devices |

The prototype should not present simulated or manually entered information as live retailer data.

---

## Current limitations

The latest testing identified several important limitations.

### First-time usability

Both G-01 and G-02 found navigation difficult in places. The next iteration should make the main path through the system clearer without requiring explanation from a facilitator.

### Effort compared with existing tools

G-01 questioned whether the system was easier than a group chat, Notes or an existing grocery app.

This is one of the most important findings. NutriCart needs to reduce duplicated effort rather than simply place existing tasks into another interface.

### Household maintenance

Features such as Already at Home can become tedious if users are expected to constantly update them.

The system should minimise manual maintenance where possible.

### Social value

Split Shop and household requests support coordination, but they do not automatically create meaningful social interaction.

The system should support existing relationships and practical cooperation without claiming that the technology itself makes housemates closer.

### Data reliability

Open Food Facts is community-contributed, so nutritional data may be incomplete or incorrect.

Missing values should be shown as unavailable rather than estimated.

### Price information

Saved prices are reference values and may not match current supermarket prices.

Current shelf prices can be entered during shopping when required.

### Privacy

Housemates may not want personal food preferences, spending or purchases visible to everyone.

The prototype should avoid requiring unnecessary personal information.

---

## Next iteration priorities

Based on the Week 12 testing, the next iteration should focus on:

1. simplifying first-time navigation
2. reducing the number of steps for common actions
3. keeping Product Compare, price and budget information prominent
4. connecting meal planning more directly to the shopping list
5. clarifying how Split Shop works across two people and devices
6. reducing manual maintenance for Already at Home
7. keeping requests short and shopping-specific rather than recreating a group chat
8. testing the complete Home Dock → supermarket → Home Dock journey
9. comparing NutriCart directly against the tools housemates already use
10. measuring whether the system actually saves time or reduces duplicated purchases

---

## Repository structure

```text
├── README.md
├── prototype/
│   ├── backend/            FastAPI server + wider Home Dock and web Cart Unit prototype
│   ├── app-v2/             redesigned Home Hub + Expo Cart Unit tested in Week 12
│   └── cart-expo/          Expo Cart Unit used by the wider prototype
├── documents/
│   ├── research/           literature review, interview protocols and de-identified research
│   ├── evaluation/         prototype testing, G-01 and G-02 records and analysis
│   ├── design/             storyboards, concepts and mock-ups
│   ├── standups/           stand-up materials
│   ├── team/               team charter and project planning
│   ├── promo/              poster, pitch and showcase material
│   └── wiki/               repository copy of Wiki material
├── scripts/
└── render.yaml
```

---

## Evaluation records

The current evaluation includes two Week 12 group sessions:

### G-01

- two housemates
- Home Hub and Cart Unit
- roles swapped between rounds
- facilitator notes
- no names, faces or recordings stored in the repository record

### G-02

- two housemates
- tested in their own shared kitchen
- screen-based Home Hub and Cart Unit
- facilitator notes written after the session
- no names or faces stored in the repository record

### Tradeshow (20 and 22 Oct)

- visitors used the physical Dock and two Cart Units in pairs
- peer-feedback cards from five teams on the course Miro board
- summary by theme: [tradeshow-feedback.md](documents/evaluation/tradeshow-feedback.md)

### Iteration evaluation

- [current-iteration-evaluation.md](documents/evaluation/current-iteration-evaluation.md): what G-01, G-02 and the tradeshow mean for the next version, and the next test to run

These sessions provide evidence about usability and perceived value, but they are small prototype evaluations rather than proof that NutriCart works for all share houses.

---

## Data and privacy

Interview and evaluation participants are referred to using participant codes.

The repository contains de-identified research records only. Full recordings or identifying research material are not publicly shared.

The prototype stores household information such as:

- aliases
- shopping-list items
- requests
- prices
- questions
- shopping state
- scans

Database files are git-ignored.

The design should avoid collecting information that is not necessary for the household shopping task.

---

## Use of AI

Team members used Claude (Anthropic) and ChatGPT (OpenAI) as assistants during parts of the project, including:

- organising research notes
- de-identifying records
- drafting and editing documentation
- supporting prototype coding and debugging

AI-assisted material was reviewed and edited by team members against the team's research records, design decisions and running prototype.

Research sessions, participant feedback, design decisions and evaluation activities were carried out by the team.

---

## Version history

| Version | What changed |
|---|---|
| **v1** | App probe with friend recommendations, group goals and shopping checklist |
| **v2** | Cardboard Home Dock + Cart Unit and HTML Hub |
| **v0.1-v0.2 code** | FastAPI backend, Home Hub, Expo Cart Unit, scanning, product library and comparison |
| **v0.3 code** | Household layer including tokens, requests, shopping-now, Ask Home, Split Shop, cost split, meal board and Already at Home |
| **app-v2** | Redesigned Home Hub and Expo Cart Unit used in the Week 12 G-01 and G-02 evaluations |
| **Current iteration direction** | Simplify navigation and reduce effort while keeping the strongest features: shared list, meal planning, budget, product comparison and household coordination |

---

## Team

- James Olbes - Design & Prototyping Lead
- Kenan Chu - Documentation & Theory Lead
- Aman Kushwaha - Project Management Lead
- Anujitha Fernando - Technical & Dev Lead
