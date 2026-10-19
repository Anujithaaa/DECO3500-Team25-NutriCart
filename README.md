# NutriCart

DECO3500 Social & Mobile Computing · Semester 2, 2026 · Team 25

NutriCart Hub is a shared food system for student share houses. Housemates plan together at the **Home Dock** in the kitchen. Whoever goes shopping takes the detachable **Cart Unit** to the grocery store with the shared list, budget, requests and an optional price comparison, and the shop comes back to the household (including who owes what) when they re-dock. The full story is in the [Design Process Overview](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/Design-Process-Overview).

## Quick links

| | |
|---|---|
| **Prototype** | Runs on a laptop and phones, no hosting and no login. See [Try the prototype](#try-the-prototype) |
| **Poster** | [NutriCart_Poster_A2.pdf](documents/promo/NutriCart_Poster_A2.pdf) |
| **Pitch script** | [pitch-script.md](documents/promo/pitch-script.md) |
| **Try-it card (stall)** | [NutriCart_Try-it_card_A5.pdf](documents/promo/NutriCart_Try-it_card_A5.pdf) |
| **Task board** | [GitHub Projects](https://github.com/users/MaxCoder07/projects/1) |
| **Earlier prototype (v2 HTML Hub)** | https://jarxto.github.io/DECO3500_New_Prototype/Nutricart_Hub/ |

## Key documentation

- [Design Process Overview](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/Design-Process-Overview) · [Ethical Considerations](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/Ethical-Considerations): submitted as PDF
- [User Research](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/User-Research) · [Evaluation Plan](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/Evaluation-Plan)
- [Week 9 Stand-up](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/Week-9-Stand-up) · [Stand-up Records](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/Stand-up-Records)
- [Research](documents/research) · [Interview records (de-identified)](documents/research/interviews) · [Evaluation](documents/evaluation) · [Design](documents/design) · [Standups](documents/standups) · [Team](documents/team) · [Promo](documents/promo)

## Try the prototype

 One server = one household.

| Screen | Runs on | Used for |
|---|---|---|
| **Home Dock** `/dock` | a tablet or laptop (in a kitchen stand) | plan together, leave requests, see who is shopping, answer questions, settle up |
| **Web Cart Unit** `/cart` | any phone browser, no install (in a basket or trolley mount) | list, running budget, Ask home, Split Shop, finish the shop |
| **Expo Cart Unit** `prototype/cart-expo` | a phone with Expo Go | the same, plus camera barcode scanning for the optional compare |

| # | Group moment | Try it |
|---|---|---|
| G1 | Plan together | Dock: tap your token, vote on the meal board, *Add what's missing*. Items already at home are skipped. |
| G2 | Leave a request | Add an item *for* yourself with a note ("the cheap one please"). |
| G3 | Hand over the baton | Cart Unit: pick your token, *Start shop*. The Dock shows "Jay is shopping now". |
| G4 | One quick question home | Cart Unit → *Ask home*. One-tap answers on the Dock buzz back to the shopper. |
| G5 | Split Shop | A second phone *Join*s and taps *Split the list*. Ticks sync live. |
| G6 | Return and settle | Cart Unit → *Finish*. The Dock shows the total against the budget and who owes the shopper what. |

### Run it on a laptop

Requires Python 3.10+.

```bash
cd prototype/backend
python3 -m pip install -r requirements.txt
python3 run.py
```

On Windows, run `prototype/backend/run_windows.bat`. Open the printed **Dock** address on the laptop or tablet and the **Cart Unit** address on one or two phones. Then *Testing mode → Reset to demo house*.

> Uni Wi-Fi often stops devices from seeing each other. Use a **phone hotspot** or the hosted link. If the live connection drops, screens refresh every 4 seconds instead.

**Host it online:** `render.yaml` is ready for [Render](https://render.com) (*New → Blueprint*). Free hosting usually sleeps when idle and resets data on redeploy, so open the link a couple of minutes early and press *Reset*.

**Expo Cart Unit:** `cd prototype/cart-expo && cp .env.example .env` (set `EXPO_PUBLIC_API_URL` to the server address), then `npm install && npx expo start`. If Expo Go needs a different SDK version, run `npx expo install --fix`. Demo barcodes: `9300000000019`, `9300000000026`, `9300000000033`, `9300000000040`.

### app-v2: the redesigned Hub and Expo Cart Unit (the version we tested)

`prototype/app-v2` is the redesigned Home Hub and Cart Unit. It needs **Python 3.10+**, **Node.js 20.19 or newer** and the **Expo Go** app on a phone. The phone and the computer must be on the same network (on uni Wi-Fi, use a phone hotspot).

**Terminal 1 (backend)**

```bash
cd prototype/app-v2/backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python3 run.py
```

Open `http://localhost:8000/hub` on the computer and note the **Phone API** address it prints.

**Terminal 2 (Cart Unit)**

```bash
cd prototype/app-v2/cart-expo
echo "EXPO_PUBLIC_API_URL=http://<Phone API address>" > .env
npm install
npx expo login                   # your own free Expo account, the same one you use in Expo Go
npx expo start --clear
```

Scan the QR code with Expo Go. Demo barcodes: `9300000000019`, `9300000000026`, `9300000000033`, `9300000000040`.

app-v2 has the shared list, requests, barcode Compare, the budget, Already at home, meal ideas and a one-phone Split Shop. Ask home, "shopping now", two-phone Split Shop and the cost split are in v0.3 (above). To reset app-v2, stop the backend, delete `prototype/app-v2/backend/nutricart.db` and start it again.

### Real vs simulated

| Real | Simulated or simplified |
|---|---|
| Live shared state across a Dock and several Cart Units | One household per server; tokens tapped on screen (keys 1–4 also work, for a hidden keypad or Makey Makey) |
| Requests, Ask home, Split Shop, cost split, already-at-home, meal board | "Already at home" only knows what passed through NutriCart or was added by hand |
| Barcode scanning (Expo), Open Food Facts product lookup | Shelf prices entered by the team in the Product library; nothing is scraped from any retailer |
| Running budget | Deal alerts and store location detection not built (the shopper picks the store) |

## Repository structure

```
├── README.md
├── prototype/              prototype source code
│   ├── backend/            FastAPI server + Home Dock (/dock) + web Cart Unit (/cart)
│   ├── app-v2/             redesigned Home Hub + Expo Cart Unit (the version we tested in Week 12)
│   └── cart-expo/          Expo (React Native) Cart Unit with barcode scanning
├── documents/
│   ├── research/           literature review, interview protocols, de-identified interview records, shadowing, brainstorms, peer feedback
│   ├── evaluation/         prototype testing synthesis and analysis; group test records G-01, G-02
│   ├── design/             storyboards, concepts, mock-ups
│   ├── standups/           Week 5 and Week 9 materials
│   ├── team/               team charter, plan of work, studio updates
│   ├── promo/              poster content, pitch script
│   └── wiki/               a copy of the WIKI pages (the WIKI itself is the live version)
├── scripts/                create the task board issues, publish the WIKI
└── render.yaml             optional hosting config
```

## Use of AI

Every team member used Claude (Anthropic) and ChatGPT (OpenAI) as assistants during the project: to help de-identify research records, organise synthesis notes, draft and edit documentation (WIKI pages, poster content, pitch script), and write and debug parts of the prototype code. Every AI-assisted output was reviewed and edited by a team member and checked against our own research records, notes and running code. The research sessions, design decisions and testing were done by the team.

## Data and privacy

Interview participants are referred to by participant code (for example R1-P03). Recordings and full transcripts are held privately by the team and not shared outside it, as participants were told; this repo only holds [de-identified records](documents/research/interviews). The prototype stores only aliases, list items, prices, questions, past shops and scans, until the next *Reset*. Database files are git-ignored.

## Version history

| Version | What changed |
|---|---|
| v1 | App probe: friend recommendations, group goals, shopping checklist |
| v2 | Cardboard Home Dock + Cart Unit, and an HTML Hub (link above) |
| v0.1–v0.2 code | James Olbes: FastAPI backend, Home Hub page, Expo Cart Unit with camera scanning, product library and compare |
| v0.3 code | Household layer: tokens, requests, shopping-now, Ask home, Split Shop, cost split, meal board, already-at-home, reset, web Cart Unit (written with AI assistance; see below) |
| app-v2 | Kenan Chu: redesigned Home Hub and Expo Cart Unit (new UI), the version tested in Week 12 |

## Team

- James Olbes, Design & Prototyping Lead
- Kenan Chu, Documentation & Theory Lead
- Aman Kushwaha, Project Management Lead
- Anujitha Fernando, Technical & Dev Lead

## AI use

See [Use of AI](#use-of-ai) above.
