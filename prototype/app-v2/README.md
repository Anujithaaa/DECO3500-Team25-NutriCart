# NutriCart Hub + Expo Go Cart Unit

This bundle gives you a working prototype architecture for your DECO3500 project:

- **Computer / laptop:** FastAPI backend + Home Hub web interface
- **Phone:** React Native Cart Unit running in **Expo Go**
- **Barcode scanning:** `expo-camera` reads EAN/UPC barcodes directly on the phone
- **Shared state:** Home Hub and Cart Unit use the same SQLite database and WebSocket updates
- **Product compare:** Scan a barcode, identify the product, save a Woolworths shelf price for the prototype, and compare products in the same category

## 1. Start the Home Hub backend

Open a terminal in `backend`.

### Windows

```bat
run_windows.bat
```

Or manually:

```bash
pip install -r requirements.txt
python run.py
```

### macOS / Linux

```bash
./run_mac_linux.sh
```

The terminal prints two addresses. Example:

```text
Home Hub: http://localhost:8000/hub
Phone API: http://192.168.1.20:8000
```

Open the Home Hub on the computer:

```text
http://localhost:8000/hub
```

Leave this backend terminal running.

## 2. Point the Expo app at your computer

The phone **cannot use `localhost`**, because on the phone `localhost` means the phone itself.

Copy `cart-expo/.env.example` to `cart-expo/.env` and replace the example IP with the **Phone API** address printed by `run.py`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.20:8000
```

Expo automatically makes `EXPO_PUBLIC_...` variables available to the app.

## 3. Run the Cart Unit in Expo Go

Open a second terminal in `cart-expo`:

```bash
npm install
npx expo start
```

Then open the project in Expo Go.

For the simplest local setup:

- phone and computer should be on the **same Wi-Fi**
- if Expo itself cannot connect, `npx expo start --tunnel` can help Expo Go load the JavaScript bundle
- **important:** Expo's tunnel only helps the Expo development server. Your FastAPI backend is still at your computer's local IP unless you separately tunnel/deploy the backend

On a physical iPhone, Expo may require the Expo CLI and Expo Go to be signed into the same Expo account.

## 4. Camera + barcode scanning

This app uses Expo's `CameraView` and `onBarcodeScanned` support from `expo-camera`.

Supported grocery formats in the prototype include:

- EAN-13
- EAN-8
- UPC-A
- UPC-E
- Code 128

Tap **Scan** in the bottom navigation and point the camera at a product barcode.

For immediate testing, the backend also contains these demo barcodes:

```text
9300000000019
9300000000026
9300000000033
9300000000040
```

You can type one manually from the Scan screen.

## 5. Real Woolworths products

A supermarket barcode identifies a product; it does **not** directly contain the Woolworths shelf price.

The prototype flow is:

1. Scan a real product barcode on the Cart Unit.
2. Backend checks its local database.
3. If unknown locally, it tries Open Food Facts for product identity/nutrition.
4. If a Woolworths price is missing, type the shelf price shown in-store and save it.
5. If product name/category is incomplete, use **Product library** on the Home Hub to add/edit it.
6. Products in the same `category` can then appear in Product Compare.

For a controlled university test, preparing 20-40 real products and their observed shelf prices will make the demo much more reliable than depending on live retailer data.

## 6. Test that the phone can reach the backend

On the phone's Safari/Chrome, open:

```text
http://YOUR-COMPUTER-IP:8000/api/health
```

You should see JSON similar to:

```json
{"ok":true,"name":"NutriCart Hub","version":"0.2.0"}
```

If that does not open:

- make sure the backend is running
- confirm both devices are on the same Wi-Fi
- use the computer's **LAN IPv4** address, not `127.0.0.1` or `localhost`
- allow Python through Windows Defender Firewall if prompted
- some university/guest Wi-Fi networks isolate devices from each other; use a phone hotspot/home network or separately tunnel the backend if necessary

## 7. Suggested demonstration

1. On the **Home Hub**, add Milk, Yoghurt and Bread to the shared list.
2. Open the **Cart Unit** in Expo Go.
3. Confirm the shared list appears on the phone.
4. Scan a yoghurt barcode.
5. Save the observed Woolworths shelf price if NutriCart does not know it.
6. Show cheaper / more-protein / less-sugar alternatives.
7. Mark the item as bought on the phone.
8. Watch the Home Hub update.
9. While the shopper is using the Cart Unit, add another item from the Home Hub and observe it appear on the phone.

That makes the project's social and mobile computing story visible: shared household state is created at home, travels with the shopper, and remains connected between people across locations.

## UI refresh (original NutriCart style)
The current UI has been restyled to match the visual language of the original NutriCart mock-up:
- light grey background
- green, orange and lime feature cards
- simple square-ish buttons and cards
- black/dark text and simple icons
- bottom navigation on the Cart Unit
- less dashboard-style decoration and no gradients

Main files to edit:
- `cart-expo/App.js` - Expo Go Cart Unit UI
- `backend/app/static/hub.html` - Home Hub layout
- `backend/app/static/styles.css` - Home Hub styling

The barcode, shared-list, product-library and comparison backend logic is unchanged.

## UI reference used in this version
This build follows the **NutriCart Hub Combined Prototype Concept** rather than the older Social Shopping Companion mock-up. The Home Dock mirrors the concept's Household Home, Meal Ideas, Shared List, Housemate Requests and Ready to Shop structure. The Expo Cart Unit mirrors Today's Shop, Product Comparison, Housemate Requests and Already-at-Home screens. The styling intentionally stays simple and prototype-like: off-white background, thin black borders, plain typography and minimal decoration.
