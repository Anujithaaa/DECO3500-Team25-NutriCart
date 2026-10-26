# NutriCart

DECO3500 Social & Mobile Computing · Semester 2, 2026 · Team 25

NutriCart is a shared-household shopping prototype designed for students living in share houses. It connects a **Home Dock (Home Hub)** for meal planning and household coordination with **detachable Cart Units** used while shopping. The current implementation combines a browser-based Hub, an Expo/React Native phone app, a FastAPI backend and optional Raspberry Pi Pico LED feedback.

The focus is not to make shopping social for its own sake. Instead, NutriCart aims to reduce the practical work of sharing a grocery list, choosing exact products, avoiding duplicate purchases, comparing prices and coordinating a shop between housemates.

The software is designed to keep the Hub and Cart Units connected to one household's shared state. The physical prototype explores a home docking setup with detachable phone holders for supermarket trolleys. See the [Design Process Overview](https://github.com/Anujithaaa/DECO3500-Team25-NutriCart/wiki/Design-Process-Overview) for the broader design history.

---

## Current iteration

The actively developed prototype is **`prototype/app-v2/`**, built around a Home Hub and an Expo Cart Unit. Only the lasted code (pico-cart and prototype folders) of the project is there all the other documentation is still located in the main branch.

**Current development features**

- **Shared shopping list:** add items from the Hub or Cart Unit, update quantities and bought/needed states, and clear a completed list.
- **Exact product selection:** scan a barcode to replace a generic list entry (such as "milk") with a specific product, or scan an unlisted item to add it directly. The Hub's shopping-list scanner returns to the list after a successful save.
- **Camera-based scanning:** Home Hub **Scan & Nutrition** and **Shopping List** use the laptop camera; the phone uses Expo Camera. The intended viewfinder is a clear central rectangle with translucent grey shading and no animated green scan line. Phone camera facing can be configured in the Expo component.
- **Product lookup:** scan a barcode to retrieve available product information and nutrition from **Open Food Facts**; missing data should be shown as unavailable rather than estimated. Recently scanned products may be cached locally.
- **Nutrition and macros:** display available energy, protein, carbohydrates, fat, sugars and other supported nutrition fields, generally per 100 g / 100 ml. The prototype is not a personal daily-macro tracker.
- **Regular and shelf prices:** save a user-entered regular Woolworths price against a barcode. Compare can prefill the saved reference price, while still allowing the shopper to enter a different current shelf or special price without overwriting the regular price.
- **Product Compare:** scan two products, compare available nutritional information and prices, and decide which to choose.
- **Household coordination:** meal ideas, requests, Already at Home, shared shopping state and a running budget.
- **Split Shop:** support two Cart Units dividing shopping responsibilities, with an end-split confirmation flow in the expanded app-v2 prototype.
- **Shopping controls:** end-shopping/idle behaviour and a **Hard Reset** action for the current session.
- **Optional physical feedback:** a USB-connected Raspberry Pi Pico and RGB LED, with green indicating a recognised product and red indicating an unrecognised scan.

**Development status:** These post-Week 12 additions were iterated on after the evaluation sessions. They should be treated as **prototype capabilities**, not as features fully validated during G-01 and G-02. Camera access, two-phone coordination, API coverage and Pico serial communication require testing on the actual devices.

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
| Navigation unclear | Use clearer navigation and consistent neutral scanner viewfinders across Hub and phone |
| Requests feel like another group chat | Keep requests lightweight and tied directly to shopping items |
| Already at Home may become tedious | Treat it as supporting information rather than something users must constantly maintain |
| Compare was useful | Keep Product Compare central, with scanned product information and editable sale prices |
| Budget was highly valued | Keep the running budget visible during the shop |
| Meal ideas were useful | Keep meal planning connected directly to the shared list |
| Split Shop was confusing | Develop the two-Cart-Unit assignment and end-split flow, and explain it more clearly |
| LED feedback was not valued | Restrict LED feedback to short, functional barcode-validity cues rather than constant notifications |
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

| Interface | Runs on | Main purpose |
|---|---|---|
| **Home Hub (app-v2)** | Laptop or tablet browser | Shared list, Scan & Nutrition, meal planning, household requests, Already at Home, regular prices and session controls |
| **Cart Unit (app-v2)** | Phone running Expo Go | Shared shopping list, budget, barcode scanning, Product Compare, editable shelf prices and shopping status |
| **Second Cart Unit** | Second Expo phone | Separate tasks during Split Shop; coordination depends on both phones reaching the same backend |
| **Pico LED (optional)** | Pico connected to the Hub computer over USB | Green/red scan-result feedback, with a Windows Python bridge relaying backend events |
| **Web Cart Unit (older/wider prototype)** | Phone browser | Earlier household-coordination implementation, including Ask Home and cost splitting |

## Main household flow

1. **Plan at home.** Housemates review meal ideas, requests, items already available and the shared list on the Home Hub.
2. **Choose products when needed.** Add a general list item manually, or scan a barcode to specify the exact product. If a barcode identifies an item not yet listed, add it as a new entry.
3. **Check product details.** Use Scan & Nutrition to view information returned by Open Food Facts. If the product is unknown, the UI should say so rather than create believable but invented nutrition values.
4. **Record a reference price.** Where useful, save the product's regular supermarket price on the Hub. This is a household reference, **not an automatically verified live retailer price**.
5. **Shop with a Cart Unit.** Follow the shared list and budget. Compare two scanned products; use the saved regular price as a starting value and change the shelf price if a special is displayed.
6. **Split the shop if two people are involved.** Two Cart Units can divide work and later confirm that their split session has ended.
7. **Finish or reset.** End shopping to return the Cart Unit to its idle state. Use the session Hard Reset only when intentionally clearing the current list and split session.

The goal is practical coordination, whether housemates shop together or at different times. NutriCart does not require every household to be socially close.

---

# Running app-v2

The current app-v2 prototype uses one FastAPI server for one household. Run the backend on the laptop used as the Home Hub. Both Cart Unit phones should connect to that computer over the same local network.

## Requirements

- **Python 3.12** (recommended project baseline; a compatible newer version may also work)
- **Node.js 20.19+** and npm
- **Expo Go** on the phone(s)
- **Laptop webcam** and browser camera permission for Hub scanning
- **Internet access** for online product lookups and any CDN-hosted scanner library
- **Optional LED:** Raspberry Pi Pico, RGB LED with current-limiting resistors, USB cable and `pyserial` on Windows

The computer and phone(s) must be on the same Wi-Fi or hotspot. University Wi-Fi may isolate connected devices, so a personal hotspot may be simpler.

## Terminal 1 — FastAPI backend

Open `prototype/app-v2/backend` in a terminal.

**Windows PowerShell:**

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python run.py
```

If an environment already exists, activate it rather than creating a second one. Keep this terminal open.

Open the Home Hub on the laptop at:

```text
http://localhost:8000/hub
```

`http://127.0.0.1:8000/hub` also refers to the same local server. Using `localhost` on the laptop helps browsers recognise the Hub as a secure-enough context for webcam permissions. Enable **Camera** access for the site in Edge/Chrome and in Windows privacy settings.

The backend must listen on a network-accessible address (typically `0.0.0.0`) for phones to connect; `localhost` on a phone refers to the phone itself.

## Terminal 2 — Expo Cart Unit

Open `prototype/app-v2/cart-expo` in a second terminal. Configure `.env` with the **laptop's IPv4 address**:

```dotenv
EXPO_PUBLIC_API_URL=http://YOUR-COMPUTER-IP:8000
```

For example:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.0.24:8000
```

On Windows, `ipconfig` can show the laptop's Wi-Fi IPv4 address. Use your real address, not the example above. Do **not** use `127.0.0.1` or `localhost` for the phone API URL.

```powershell
npm.cmd install
npx.cmd expo start --clear
```

Open the displayed Expo QR code using Expo Go. For Split Shop, open the Cart Unit app on **two phones**, both pointed at the same backend. If the installed Expo packages are incompatible with the project SDK, try `npx.cmd expo install --fix` and restart Expo.

**Phone camera:** Grant Expo Go camera permission in iOS/Android settings. The prototype supports EAN/UPC and Code 128 formats. Camera availability and autofocus depend on device capabilities. The phone-camera facing choice is set in `cart-expo/src/NutriCartStableCamera.js` when that optional component is installed (`facing="front"` or `facing="back"`).

## Scanning on the Home Hub

The Hub provides two barcode workflows:

- **Scan & Nutrition:** start the laptop webcam, align a barcode in the centre guide, and display the returned food details and any recorded regular price.
- **Shopping List → Scan & add / Scan exact:** scan a new item into the household list or scan beside an existing generic entry to make its name specific. A successful save can automatically close the shopping-list scanner.

The scanners aim for a consistent **transparent centre with greyed-out surroundings**. The previous green scanning line, animated indicator and visible mirror toggle are not part of the intended final viewfinder. Mirroring, when enabled, affects the webcam preview rather than the decoded barcode value.

Barcode recognition and food identification are separate: a readable code can still return **product not found** if the API has no matching information.

## Regular prices and product comparison

NutriCart maintains optional store-specific prices in its local `prices` database table. For a recognised product:

1. Scan it at the Hub and review any existing **regular price**.
2. If no price is available, enter the regular Woolworths shelf price manually and save it for future scans.
3. On the phone, scan Product A or B in **Compare**. When a saved regular price exists, the shelf-price input can be prefilled.
4. Edit the input to reflect an in-store special. The override is used for the current comparison; it should **not overwrite the stored regular price**.

**Prices are not live supermarket feeds.** Open Food Facts supplies product/nutrition information, not dependable current Woolworths shelf prices. Price data requires manual entry or a separately verified source.

## Optional Terminal 3 — Raspberry Pi Pico LED

The LED hardware is **optional**; the Hub and phone apps can run without it. The newer local prototype uses files such as:

```text
pico_nutricart/
  pico_main.py     # MicroPython firmware source; save to Pico as main.py
  bridge.py        # Windows USB serial-to-backend bridge
```

Use Thonny to save `pico_main.py` to the Pico as `main.py`. **Close Thonny completely** before starting the bridge; two programs cannot use the same COM port simultaneously. Install `pyserial` and list available serial ports:

```powershell
py -3 -m pip install pyserial
py -3 pico_nutricart/bridge.py --ports
```

Test the correct port (replace `COM8` as necessary):

```powershell
py -3 pico_nutricart/bridge.py --port COM8 --demo
```

Then run the bridge while the backend is active:

```powershell
py -3 pico_nutricart/bridge.py --port COM8 --url http://127.0.0.1:8000
```

The bridge reads scan results from the backend and sends commands to the Pico. A recognised product flashes **green**; an unknown product flashes **red**. The LED returns to its normal state afterward. The provided Pico code assumes a **common-anode RGB LED** with red on **GP13**, green on **GP12**, blue on **GP11**, and a separate resistor for each colour. Check the actual wired prototype before powering it.

If the bridge reports `PermissionError(13)` or **Access is denied** on a COM port, close Thonny/other serial monitors and confirm the correct port in Device Manager. If no Pico `ACK` is received, confirm the firmware and USB connection.

## Resets and stored data

**Hard Reset in the Home Hub** is a *shopping-session reset*: it is intended to clear the current shopping list, scan history and active Split Shop pairing, and return shopping state to idle. It should preserve saved products/prices, meal ideas, requests and other household records. The exact reset effect depends on which local upgrade is installed.

**Full database reset** is different and deletes stored prototype data:

1. Stop the backend.
2. Back up the SQLite database if you want to keep any saved products or prices.
3. Delete the database file used by the backend (normally `prototype/app-v2/backend/nutricart.db`, unless `NUTRICART_DB` points elsewhere).
4. Restart the backend so it can reinitialise its tables.

Do not delete the database for a normal shopping-session reset.

## Troubleshooting

| Problem | What to check |
|---|---|
| Hub camera has permission but stays blank | Use `http://localhost:8000/hub`, close other webcam apps and check browser console or scanner-library loading |
| Phone camera appears black | Expo Go camera permission, camera component mounting, selected facing mode, and SDK/package compatibility |
| Phone cannot connect | Both devices on the same network; correct `EXPO_PUBLIC_API_URL`; backend bound to a reachable address |
| Barcode is read but product not found | Open Food Facts coverage, barcode format and internet access; do not fill nutrition with guessed values |
| Saved price is not displayed | Confirm the regular price was recorded for the same barcode and store; restart/refresh the relevant app |
| Pico bridge gives COM-port access denied | Close Thonny and serial monitors, or check for a changed COM port |
| LED does not change colour | Pico `main.py`, pin wiring, correct common-anode LED type, and bridge `ACK` messages |

The older test barcodes `9300000000019`, `9300000000026`, `9300000000033` and `9300000000040` may refer to seeded prototype products. They are not evidence that arbitrary supermarket items will be recognised by an external nutrition API.

---

# Wider prototype

The repository also contains an earlier, broader household prototype under:

```text
prototype/backend/
```

That implementation explores household tokens, Ask Home, cost splitting, a web Cart Unit and related coordination features. It is useful as a design reference but should **not be confused with the current `prototype/app-v2/` runtime**.

Some ideas that started in the wider prototype—particularly Split Shop—have since been expanded in the local app-v2 code. The current README therefore distinguishes features in the app-v2 development build from functionality that only exists in older versions.

---

## Real vs simulated

| Real / implemented in the development prototype | Limitations / simplifications |
|---|---|
| FastAPI-backed shared shopping list and household state | One local server models one household; this is not a hosted multi-household service |
| Laptop and phone barcode capture | Reliability depends on camera access, autofocus, lighting and barcode type |
| Product lookup via Open Food Facts | Community data may be incomplete or out of date; missing nutrition should be unavailable |
| Exact-product names and barcode-linked shopping-list items | Unknown API products still require manual review or entry |
| Saved regular prices and editable Compare shelf prices | Prices are manually recorded references, not automatic live Woolworths prices |
| Two-phone Split Shop workflow | Pairing, synchronization and end-split behaviour require more real-device evaluation |
| USB Pico RGB LED event feedback | Depends on separate firmware, a running bridge and correctly wired hardware |
| Home Hub Hard Reset | Resets a local shopping session, not a household account or every saved record |

The prototype should never present user-recorded prices, manually entered household information or missing nutrient values as independently verified live information.

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

Saved standard prices are reference values and may not match current supermarket prices. A temporary shelf-price override in Compare helps represent specials without changing the recorded regular price. NutriCart does not currently have an authorised, reliable live Woolworths price feed.

### Barcode cameras and API coverage

A barcode being decoded does not guarantee that Open Food Facts has the corresponding product or nutrition information. The Hub camera and Expo phone camera have different focus and permission behaviour; the selfie camera may be less effective with small, close-up barcodes than a rear camera. The neutral viewfinder is a visual guide, not a guarantee of scanning accuracy.

### Two-phone and physical setup

Two Cart Units, session pairing and return-to-idle workflows need further testing outside controlled demonstrations. The Pico LED and wooden physical dock are supporting hardware concepts and are not required to run the software. The LCD, RFID reader and other optional electronics should not be described as functional in the latest app-v2 build unless separately verified.

### Privacy

Housemates may not want personal food preferences, spending or purchases visible to everyone.

The prototype should avoid requiring unnecessary personal information.

---

## Next iteration priorities

The Week 12 findings remain relevant, even after the newest technical upgrades. Next steps are to:

1. Re-test first-time navigation without a facilitator.
2. Compare the directness of the current shared-list workflow against Notes and group chats.
3. Validate exact-product scanning and automatic list updates using real supermarket barcodes.
4. Test nutritional lookup failures without falling back to generated values.
5. Check reference-price entry and temporary sale-price overrides in realistic shopping scenarios.
6. Test Split Shop end-to-end with two physical phones and a Home Hub.
7. Reduce the maintenance burden of Already at Home and household requests.
8. Measure whether NutriCart saves time or avoids duplicate purchases.
9. Assess whether the Pico LED adds useful feedback rather than notification noise.
10. Test the complete Home Dock → trolley → Home Dock experience.

---

## Repository structure

```text
├── README.md
├── prototype/
│   ├── backend/                 earlier FastAPI Home Dock and web Cart Unit
│   ├── app-v2/
│   │   ├── backend/
│   │   │   ├── app/
│   │   │   │   ├── main.py      FastAPI routes and shared SQLite data
│   │   │   │   ├── nutrition_live.py     live nutrition lookup extension*
│   │   │   │   ├── split_cart.py        Split Shop extension*
│   │   │   │   ├── led_scan_events.py   Pico LED event extension*
│   │   │   │   └── static/
│   │   │   │       ├── hub.html
│   │   │   │       ├── list_scanner.js   shared-list camera scanner*
│   │   │   │       ├── scanner_unified.js neutral viewfinder styling*
│   │   │   │       └── standard_prices.js regular-price Hub UI*
│   │   │   └── run.py
│   │   └── cart-expo/
│   │       ├── App.js
│   │       ├── src/
│   │       │   ├── api.js
│   │       │   ├── CartUpgradeScreens.js*
│   │       │   └── NutriCartStableCamera.js*
│   │       └── package.json
│   └── cart-expo/               older Expo Cart Unit
├── pico_nutricart/             optional Pico scripts and Windows bridge*
├── documents/
│   ├── research/
│   ├── evaluation/
│   ├── design/
│   ├── standups/
│   ├── team/
│   ├── promo/
│   └── wiki/
├── scripts/
└── render.yaml
```

`*` Newer local upgrade files; verify they have been added to the intended Git branch. They may not be present in the original `ui-redesign` remote branch. The price add-on in particular may be absent if its installer has not been run.

---

## Evaluation records

The current evaluation includes two Week 12 group sessions:

### Group 1

- two housemates
- Home Hub and Cart Unit
- roles swapped between rounds
- facilitator notes
- no names, faces or recordings stored in the repository record

### Group 2

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

SQLite databases, `.env` files containing local configuration, Python virtual environments, `node_modules`, installer-generated `.bak`/`.backup_...` files and local credentials should not be committed. Check `git status` before pushing.

No continuous recording of barcode camera previews is required for product lookup; camera frames are used for live scanning. Treat all shared household information as data accessible to the local prototype's users, not as private per-person records.

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

| Version / stage | What changed |
|---|---|
| **v1** | Early application probe with friend recommendations, group goals and a shopping checklist |
| **v2 physical concept** | Cardboard Home Dock, detachable Cart Unit concept and HTML Hub |
| **v0.1–v0.2 code** | FastAPI backend, Home Hub, Expo Cart Unit, scanning, product records and comparison |
| **v0.3 code** | Expanded household layer: tokens, requests, shopping-now, Ask Home, Split Shop, cost split, meal board and Already at Home |
| **app-v2 (Week 12 tested)** | Redesigned Home Hub and Expo Cart Unit used in G-01 and G-02 |
| **app-v2 subsequent development** | Live product/nutrition lookup, matching neutral barcode scanners, exact-product shared-list scanning, two-phone Split Shop extension, current-session reset, optional Pico scan feedback, and saved regular prices with editable Compare shelf prices |

The development of the latest prototype was carried out with AI assistance where needed, particularly when working through more difficult coding problems, troubleshooting errors and checking for bugs. AI was used to suggest solutions, explain issues and help refine parts of the implementation. These suggestions were then reviewed, adjusted and tested as part of the development process.

---

## Team

- James Olbes - Design & Prototyping Lead
- Kenan Chu - Documentation & Theory Lead
- Aman Kushwaha - Project Management Lead
- Anujitha Fernando - Technical & Dev Lead
