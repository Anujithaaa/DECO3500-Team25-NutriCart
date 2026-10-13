"""NutriCart Hub prototype backend (v0.3).

One FastAPI process serves:
  * the Home Dock (kitchen screen)        -> /dock   (also /hub and /)
  * the web Cart Unit (phone in a mount)  -> /cart
  * the JSON + WebSocket API used by both and by the Expo Cart Unit -> /api/*, /ws

v0.2 (James Olbes) built the shared list, barcode lookup, product library and
live sync. v0.3 adds the household layer from our design work: housemate
tokens, requests, "X is shopping now", Ask home, Split Shop, a return summary
with a cost split, a meal board, "already at home" and a demo reset.

Everything is one household per server. Prices are entered or pre-loaded by
the team; nothing is scraped from any retailer.
"""
from __future__ import annotations

import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

VERSION = "0.3.0"
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DB_PATH = Path(os.getenv("NUTRICART_DB", BASE_DIR.parent / "nutricart.db"))
OFF_BASE = "https://world.openfoodfacts.org/api/v2/product"
USER_AGENT = os.getenv("NUTRICART_USER_AGENT", f"NutriCartHub-Prototype/{VERSION} (university prototype)")
HOUSEHOLD = "Household"  # requester name for shared items, split evenly

app = FastAPI(title="NutriCart Hub Prototype", version=VERSION)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# --------------------------------------------------------------------------- db
@contextmanager
def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def ensure_column(conn: sqlite3.Connection, table: str, column: str, ddl: str) -> None:
    """Add a column to an existing table (keeps databases made with v0.2 working)."""
    cols = {r["name"] for r in conn.execute(f"PRAGMA table_info({table})").fetchall()}
    if column not in cols:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}")


DEFAULT_MEMBERS = [
    ("Alex", "#D1495B", "red"),
    ("Jay", "#2E86AB", "blue"),
    ("Sam", "#3BA55C", "green"),
    ("Priya", "#E0A526", "yellow"),
]

DEFAULT_MEALS = [
    # name, suggested_by, approx cost, minutes, serves, ingredients
    ("Chicken stir fry", "Sam", 14.0, 25, 4, ["Chicken thigh", "Rice", "Frozen veg", "Soy sauce"]),
    ("Pasta bake", "Alex", 11.0, 40, 4, ["Pasta", "Pasta sauce", "Cheese", "Spinach"]),
    ("Egg fried rice", "Priya", 7.0, 15, 3, ["Rice", "Eggs", "Frozen veg", "Spring onion"]),
    ("Chickpea curry", "Jay", 9.0, 30, 4, ["Chickpeas", "Coconut milk", "Curry paste", "Rice"]),
]

DEFAULT_SETTINGS = {"budget": "60", "store": "Woolworths Toowong"}


def init_db() -> None:
    with db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS products (
                barcode TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                brand TEXT,
                quantity TEXT,
                category TEXT,
                image_url TEXT,
                nutrition_json TEXT,
                source TEXT,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS prices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                barcode TEXT NOT NULL,
                store TEXT NOT NULL,
                price REAL NOT NULL,
                unit_price TEXT,
                source TEXT NOT NULL DEFAULT 'manual',
                observed_at TEXT NOT NULL,
                UNIQUE(barcode, store)
            );
            CREATE TABLE IF NOT EXISTS shopping_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                barcode TEXT,
                quantity INTEGER NOT NULL DEFAULT 1,
                added_by TEXT NOT NULL DEFAULT 'household',
                status TEXT NOT NULL DEFAULT 'needed',
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                barcode TEXT NOT NULL,
                device TEXT NOT NULL,
                store TEXT,
                scanned_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                colour TEXT NOT NULL,
                token TEXT NOT NULL,
                position INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS shops (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shopper TEXT NOT NULL,
                helpers_json TEXT NOT NULL DEFAULT '[]',
                store TEXT,
                budget REAL,
                status TEXT NOT NULL DEFAULT 'active',
                started_at TEXT NOT NULL,
                finished_at TEXT,
                summary_json TEXT,
                dismissed INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shop_id INTEGER,
                asked_by TEXT NOT NULL,
                text TEXT NOT NULL,
                options_json TEXT NOT NULL DEFAULT '[]',
                item_id INTEGER,
                answer TEXT,
                answered_by TEXT,
                created_at TEXT NOT NULL,
                answered_at TEXT
            );
            CREATE TABLE IF NOT EXISTS pantry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE COLLATE NOCASE,
                added_by TEXT,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS meals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                suggested_by TEXT,
                cost REAL,
                minutes INTEGER,
                serves INTEGER,
                ingredients_json TEXT NOT NULL DEFAULT '[]',
                votes_json TEXT NOT NULL DEFAULT '[]'
            );
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            );
            """
        )
        # v0.3 columns on James's v0.2 shopping list table
        ensure_column(conn, "shopping_items", "note", "TEXT")
        ensure_column(conn, "shopping_items", "claimed_by", "TEXT")
        ensure_column(conn, "shopping_items", "price_paid", "REAL")
        ensure_column(conn, "shopping_items", "bought_by", "TEXT")
        ensure_column(conn, "shopping_items", "source", "TEXT NOT NULL DEFAULT 'dock'")
        ensure_column(conn, "shopping_items", "shop_id", "INTEGER")
        ensure_column(conn, "shopping_items", "bought_at", "TEXT")

        if conn.execute("SELECT COUNT(*) AS c FROM members").fetchone()["c"] == 0:
            seed_members(conn)
        if conn.execute("SELECT COUNT(*) AS c FROM meals").fetchone()["c"] == 0:
            seed_meals(conn)
        for key, value in DEFAULT_SETTINGS.items():
            conn.execute("INSERT OR IGNORE INTO settings(key, value) VALUES (?, ?)", (key, value))

        if conn.execute("SELECT COUNT(*) AS c FROM products").fetchone()["c"] == 0:
            seed_products(conn)


def seed_members(conn: sqlite3.Connection) -> None:
    conn.execute("DELETE FROM members")
    conn.execute("DELETE FROM sqlite_sequence WHERE name = 'members'")
    for i, (name, colour, token) in enumerate(DEFAULT_MEMBERS):
        conn.execute("INSERT INTO members(name, colour, token, position) VALUES (?,?,?,?)", (name, colour, token, i))


def seed_meals(conn: sqlite3.Connection) -> None:
    conn.execute("DELETE FROM meals")
    conn.execute("DELETE FROM sqlite_sequence WHERE name = 'meals'")
    for name, by, cost, minutes, serves, ingredients in DEFAULT_MEALS:
        conn.execute(
            "INSERT INTO meals(name, suggested_by, cost, minutes, serves, ingredients_json) VALUES (?,?,?,?,?,?)",
            (name, by, cost, minutes, serves, json.dumps(ingredients)),
        )


def seed_products(conn: sqlite3.Connection) -> None:
    """Generic demo products (James's v0.2 set). Replace with the team's real
    shelf prices via the Product library, or load data/products.csv."""
    demos = [
        ("9300000000019", "Demo Greek Yoghurt", "NutriCart Demo", "900 g", "yoghurt",
         {"energy_kj_100g": 420, "protein_100g": 9.5, "sugars_100g": 4.8, "fat_100g": 3.2}, 6.50, "$0.72 / 100g"),
        ("9300000000026", "Demo Natural Yoghurt", "NutriCart Demo", "1 kg", "yoghurt",
         {"energy_kj_100g": 360, "protein_100g": 5.8, "sugars_100g": 4.2, "fat_100g": 2.8}, 4.80, "$0.48 / 100g"),
        ("9300000000033", "Demo High Protein Yoghurt", "NutriCart Demo", "700 g", "yoghurt",
         {"energy_kj_100g": 390, "protein_100g": 12.0, "sugars_100g": 3.7, "fat_100g": 1.5}, 7.00, "$1.00 / 100g"),
        ("9300000000040", "Demo Wholemeal Bread", "NutriCart Demo", "700 g", "bread",
         {"energy_kj_100g": 980, "protein_100g": 9.0, "sugars_100g": 3.4, "fat_100g": 3.5}, 4.20, "$0.60 / 100g"),
    ]
    for barcode, name, brand, quantity, category, nutrition, price, unit in demos:
        conn.execute(
            "INSERT OR REPLACE INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (barcode, name, brand, quantity, category, None, json.dumps(nutrition), "demo", now_iso()),
        )
        conn.execute(
            "INSERT OR REPLACE INTO prices(barcode, store, price, unit_price, source, observed_at) VALUES (?, 'Woolworths', ?, ?, 'demo', ?)",
            (barcode, price, unit, now_iso()),
        )


# ------------------------------------------------------------------- live sync
class ConnectionManager:
    def __init__(self) -> None:
        self.connections: set[WebSocket] = set()

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.connections.add(ws)

    def disconnect(self, ws: WebSocket) -> None:
        self.connections.discard(ws)

    async def broadcast(self, payload: dict[str, Any]) -> None:
        stale: list[WebSocket] = []
        for ws in list(self.connections):
            try:
                await ws.send_json(payload)
            except Exception:
                stale.append(ws)
        for ws in stale:
            self.disconnect(ws)


manager = ConnectionManager()


@app.on_event("startup")
def startup() -> None:
    init_db()


# ---------------------------------------------------------------------- pages
@app.get("/")
def root():
    return FileResponse(STATIC_DIR / "dock.html")


@app.get("/dock")
def dock():
    return FileResponse(STATIC_DIR / "dock.html")


@app.get("/hub")
def hub():
    return FileResponse(STATIC_DIR / "dock.html")


@app.get("/cart")
def cart():
    return FileResponse(STATIC_DIR / "cart.html")


@app.get("/api/health")
def health():
    return {"ok": True, "name": "NutriCart Hub", "version": VERSION}


# ---------------------------------------------------------------- read models
def row_product(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "barcode": row["barcode"],
        "name": row["name"],
        "brand": row["brand"],
        "quantity": row["quantity"],
        "category": row["category"],
        "image_url": row["image_url"],
        "nutrition": json.loads(row["nutrition_json"] or "{}"),
        "source": row["source"],
        "updated_at": row["updated_at"],
    }


def members(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    return [dict(r) for r in conn.execute("SELECT * FROM members ORDER BY position, id").fetchall()]


def member_names(conn: sqlite3.Connection) -> list[str]:
    return [m["name"] for m in members(conn)]


def settings(conn: sqlite3.Connection) -> dict[str, str]:
    return {r["key"]: r["value"] for r in conn.execute("SELECT key, value FROM settings").fetchall()}


def shop_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if not row:
        return None
    d = dict(row)
    d["helpers"] = json.loads(d.pop("helpers_json") or "[]")
    d["summary"] = json.loads(d.pop("summary_json")) if d.get("summary_json") else None
    d["shoppers"] = [d["shopper"], *d["helpers"]]
    return d


def active_shop(conn: sqlite3.Connection) -> dict[str, Any] | None:
    return shop_dict(conn.execute("SELECT * FROM shops WHERE status='active' ORDER BY id DESC LIMIT 1").fetchone())


def item_rows(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    pantry_names = {r["name"].lower() for r in conn.execute("SELECT name FROM pantry").fetchall()}
    rows = conn.execute(
        "SELECT * FROM shopping_items WHERE status != 'archived' "
        "ORDER BY CASE status WHEN 'needed' THEN 0 WHEN 'bought' THEN 1 ELSE 2 END, id DESC"
    ).fetchall()
    items = []
    for r in rows:
        d = dict(r)
        d["requested_by"] = d.get("added_by")
        d["at_home"] = d["name"].strip().lower() in pantry_names and d["status"] == "needed"
        items.append(d)
    return items


def question_rows(conn: sqlite3.Connection, shop_id: int | None) -> list[dict[str, Any]]:
    if shop_id is None:
        return []
    out = []
    for r in conn.execute("SELECT * FROM questions WHERE shop_id = ? ORDER BY id DESC", (shop_id,)).fetchall():
        d = dict(r)
        d["options"] = json.loads(d.pop("options_json") or "[]")
        out.append(d)
    return out


def meal_rows(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    out = []
    for r in conn.execute("SELECT * FROM meals ORDER BY id").fetchall():
        d = dict(r)
        d["ingredients"] = json.loads(d.pop("ingredients_json") or "[]")
        d["votes"] = json.loads(d.pop("votes_json") or "[]")
        out.append(d)
    return out


def full_state(conn: sqlite3.Connection) -> dict[str, Any]:
    shop = active_shop(conn)
    last = shop_dict(
        conn.execute("SELECT * FROM shops WHERE status='done' AND dismissed=0 ORDER BY id DESC LIMIT 1").fetchone()
    )
    return {
        "members": members(conn),
        "shopping_items": item_rows(conn),
        "shop": shop,
        "last_shop": last,
        "questions": question_rows(conn, shop["id"] if shop else None),
        "pantry": [dict(r) for r in conn.execute("SELECT * FROM pantry ORDER BY name").fetchall()],
        "meals": meal_rows(conn),
        "settings": settings(conn),
        "recent_scans": [dict(r) for r in conn.execute("SELECT * FROM scans ORDER BY id DESC LIMIT 10").fetchall()],
    }


@app.get("/api/state")
def state():
    with db() as conn:
        return full_state(conn)


async def changed(kind: str, **extra: Any) -> None:
    """Tell every Dock and Cart Unit that shared state changed."""
    await manager.broadcast({"type": kind, **extra})


# ------------------------------------------------------------------ products
def get_local_product(barcode: str) -> dict[str, Any] | None:
    with db() as conn:
        row = conn.execute("SELECT * FROM products WHERE barcode = ?", (barcode,)).fetchone()
        if not row:
            return None
        product = row_product(row)
        product["prices"] = [dict(r) for r in conn.execute(
            "SELECT store, price, unit_price, source, observed_at FROM prices WHERE barcode = ? ORDER BY observed_at DESC",
            (barcode,),
        ).fetchall()]
        return product


async def fetch_open_food_facts(barcode: str) -> dict[str, Any] | None:
    fields = "code,product_name,brands,quantity,categories_tags,image_front_small_url,nutriments"
    url = f"{OFF_BASE}/{barcode}.json?fields={fields}"
    try:
        async with httpx.AsyncClient(timeout=5.0, headers={"User-Agent": USER_AGENT}) as client:
            r = await client.get(url)
            if r.status_code != 200:
                return None
            data = r.json()
    except Exception:
        return None
    if data.get("status") != 1 or not data.get("product"):
        return None

    p = data["product"]
    n = p.get("nutriments") or {}
    nutrition = {
        "energy_kj_100g": n.get("energy-kj_100g"),
        "protein_100g": n.get("proteins_100g"),
        "sugars_100g": n.get("sugars_100g"),
        "fat_100g": n.get("fat_100g"),
        "salt_100g": n.get("salt_100g"),
    }
    categories = p.get("categories_tags") or []
    category = categories[0].split(":", 1)[-1].replace("-", " ") if categories else None
    product = {
        "barcode": barcode,
        "name": p.get("product_name") or f"Product {barcode}",
        "brand": p.get("brands"),
        "quantity": p.get("quantity"),
        "category": category,
        "image_url": p.get("image_front_small_url"),
        "nutrition": nutrition,
        "source": "Open Food Facts",
    }
    with db() as conn:
        conn.execute(
            """INSERT INTO products(barcode,name,brand,quantity,category,image_url,nutrition_json,source,updated_at)
               VALUES(?,?,?,?,?,?,?,?,?)
               ON CONFLICT(barcode) DO UPDATE SET
               name=excluded.name, brand=excluded.brand, quantity=excluded.quantity,
               category=COALESCE(products.category, excluded.category), image_url=excluded.image_url,
               nutrition_json=excluded.nutrition_json, source=excluded.source, updated_at=excluded.updated_at""",
            (barcode, product["name"], product["brand"], product["quantity"], product["category"], product["image_url"],
             json.dumps(product["nutrition"]), product["source"], now_iso()),
        )
    product["prices"] = []
    return product


async def resolve_product(barcode: str) -> dict[str, Any]:
    barcode = "".join(ch for ch in barcode if ch.isdigit())
    if not barcode:
        raise HTTPException(400, "Barcode must contain digits")
    local = get_local_product(barcode)
    if local:
        return local
    off = await fetch_open_food_facts(barcode)
    if off:
        return off
    return {
        "barcode": barcode, "name": "Unknown product", "brand": None, "quantity": None, "category": None,
        "image_url": None, "nutrition": {}, "source": "unmatched", "prices": [],
    }


class ProductUpsert(BaseModel):
    name: str
    brand: str | None = None
    quantity: str | None = None
    category: str | None = None
    image_url: str | None = None
    nutrition: dict[str, Any] = Field(default_factory=dict)
    store: str | None = None
    price: float | None = None
    unit_price: str | None = None


class PriceUpsert(BaseModel):
    store: str = "Woolworths"
    price: float
    unit_price: str | None = None


class ScanRequest(BaseModel):
    barcode: str
    device: str = "Cart Unit"
    store: str | None = "Woolworths"
    priority: str = "price"


@app.get("/api/products")
def products():
    with db() as conn:
        rows = conn.execute("SELECT * FROM products ORDER BY category, name").fetchall()
        result = []
        for row in rows:
            p = row_product(row)
            p["prices"] = [dict(r) for r in conn.execute(
                "SELECT store, price, unit_price, source, observed_at FROM prices WHERE barcode = ? ORDER BY observed_at DESC",
                (p["barcode"],),
            ).fetchall()]
            result.append(p)
    return result


@app.get("/api/products/{barcode}")
async def product_lookup(barcode: str):
    return await resolve_product(barcode)


@app.post("/api/products/{barcode}")
async def product_upsert(barcode: str, body: ProductUpsert):
    barcode = "".join(ch for ch in barcode if ch.isdigit())
    if not barcode:
        raise HTTPException(400, "Barcode must contain digits")
    with db() as conn:
        conn.execute(
            """INSERT INTO products(barcode,name,brand,quantity,category,image_url,nutrition_json,source,updated_at)
               VALUES(?,?,?,?,?,?,?,'manual',?)
               ON CONFLICT(barcode) DO UPDATE SET
               name=excluded.name, brand=excluded.brand, quantity=excluded.quantity,
               category=excluded.category, image_url=excluded.image_url,
               nutrition_json=excluded.nutrition_json, source='manual', updated_at=excluded.updated_at""",
            (barcode, body.name, body.brand, body.quantity, body.category, body.image_url, json.dumps(body.nutrition), now_iso()),
        )
        if body.store and body.price is not None:
            conn.execute(
                """INSERT INTO prices(barcode,store,price,unit_price,source,observed_at)
                   VALUES(?,?,?,?, 'manual', ?)
                   ON CONFLICT(barcode,store) DO UPDATE SET price=excluded.price,
                   unit_price=excluded.unit_price, source='manual', observed_at=excluded.observed_at""",
                (barcode, body.store, body.price, body.unit_price, now_iso()),
            )
    product = get_local_product(barcode)
    await changed("product_updated", product=product)
    return product


@app.put("/api/products/{barcode}/price")
async def product_price(barcode: str, body: PriceUpsert):
    product = await resolve_product(barcode)
    if product["name"] == "Unknown product":
        raise HTTPException(404, "Product is unknown. Add its product details first from the Dock.")
    with db() as conn:
        conn.execute(
            """INSERT INTO prices(barcode,store,price,unit_price,source,observed_at)
               VALUES(?,?,?,?, 'manual', ?)
               ON CONFLICT(barcode,store) DO UPDATE SET price=excluded.price,
               unit_price=excluded.unit_price, source='manual', observed_at=excluded.observed_at""",
            (product["barcode"], body.store, body.price, body.unit_price, now_iso()),
        )
    product = get_local_product(product["barcode"])
    await changed("product_updated", product=product)
    return product


PRIORITIES = {"price", "protein", "sugar"}


def priority_key(p: dict[str, Any], priority: str):
    """Sort key for the comparison. The shopper picks what matters; we never
    rank products as 'healthier'. Missing values sort last."""
    price = p["best_price"]["price"] if p.get("best_price") else None
    n = p.get("nutrition") or {}
    if priority == "protein":
        v = n.get("protein_100g")
        return (v is None, -(v or 0))
    if priority == "sugar":
        v = n.get("sugars_100g")
        return (v is None, v or 0)
    return (price is None, price or 0)


@app.get("/api/compare/{barcode}")
async def compare(barcode: str, store: str = "Woolworths", priority: str = "price"):
    priority = priority if priority in PRIORITIES else "price"
    target = await resolve_product(barcode)
    if not target.get("category"):
        return {"target": target, "alternatives": [], "priority": priority, "note": "Add a category to compare this product."}

    with db() as conn:
        rows = conn.execute("SELECT * FROM products WHERE category = ? AND barcode != ?", (target["category"], target["barcode"])).fetchall()
        alts = []
        for row in rows:
            p = row_product(row)
            price_row = conn.execute(
                "SELECT price, unit_price, store FROM prices WHERE barcode = ? ORDER BY CASE WHEN store = ? THEN 0 ELSE 1 END, observed_at DESC LIMIT 1",
                (p["barcode"], store),
            ).fetchone()
            p["best_price"] = dict(price_row) if price_row else None
            alts.append(p)
    alts.sort(key=lambda x: priority_key(x, priority))
    return {"target": target, "alternatives": alts[:8], "priority": priority}


@app.post("/api/scan")
async def scan(body: ScanRequest):
    product = await resolve_product(body.barcode)
    with db() as conn:
        conn.execute(
            "INSERT INTO scans(barcode,device,store,scanned_at) VALUES(?,?,?,?)",
            (product["barcode"], body.device, body.store, now_iso()),
        )
    comparison = await compare(product["barcode"], body.store or "Woolworths", body.priority)
    payload = {"type": "scan", "device": body.device, "store": body.store, "product": product, "comparison": comparison}
    await manager.broadcast(payload)
    return payload


# ------------------------------------------------------------ household list
class ShoppingItemCreate(BaseModel):
    name: str
    barcode: str | None = None
    quantity: int = 1
    added_by: str = HOUSEHOLD          # who it is for (a housemate's name or "Household")
    note: str | None = None            # a request, e.g. "the cheap Greek yoghurt please"
    source: str = "dock"               # "dock" or "cart" (off-list item added in store)


class ShoppingItemPatch(BaseModel):
    status: str | None = None          # needed | bought | skipped
    quantity: int | None = None
    price_paid: float | None = None
    bought_by: str | None = None
    claimed_by: str | None = None      # Split Shop: which shopper covers it ("" clears)
    note: str | None = None


def product_price_for(conn: sqlite3.Connection, barcode: str | None) -> float | None:
    if not barcode:
        return None
    r = conn.execute("SELECT price FROM prices WHERE barcode = ? ORDER BY observed_at DESC LIMIT 1", (barcode,)).fetchone()
    return r["price"] if r else None


@app.post("/api/list")
async def add_list_item(body: ShoppingItemCreate):
    name = body.name.strip()
    if not name:
        raise HTTPException(400, "Item name is required")
    with db() as conn:
        shop = active_shop(conn)
        source = "off-list" if body.source == "cart" and shop else "dock"
        cur = conn.execute(
            "INSERT INTO shopping_items(name,barcode,quantity,added_by,status,created_at,note,source,shop_id) "
            "VALUES(?,?,?,?, 'needed', ?, ?, ?, ?)",
            (name, body.barcode, max(1, body.quantity), body.added_by or HOUSEHOLD, now_iso(), body.note,
             source, shop["id"] if shop and source == "off-list" else None),
        )
        item = dict(conn.execute("SELECT * FROM shopping_items WHERE id = ?", (cur.lastrowid,)).fetchone())
        at_home = conn.execute("SELECT 1 FROM pantry WHERE name = ? COLLATE NOCASE", (name,)).fetchone() is not None
    item["at_home"] = at_home
    await changed("list_updated", item=item)
    return item


@app.patch("/api/list/{item_id}")
async def patch_list_item(item_id: int, body: ShoppingItemPatch):
    with db() as conn:
        row = conn.execute("SELECT * FROM shopping_items WHERE id = ?", (item_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Item not found")
        d = dict(row)
        if body.status is not None:
            if body.status not in {"needed", "bought", "skipped"}:
                raise HTTPException(400, "status must be needed, bought or skipped")
            d["status"] = body.status
            shop = active_shop(conn)
            if body.status == "bought":
                d["bought_at"] = now_iso()
                d["shop_id"] = shop["id"] if shop else d.get("shop_id")
                d["bought_by"] = body.bought_by or d.get("bought_by") or (shop["shopper"] if shop else None)
                if body.price_paid is None and d.get("price_paid") is None:
                    d["price_paid"] = product_price_for(conn, d.get("barcode"))
            elif body.status == "needed":
                d["bought_at"] = None
                d["bought_by"] = None
                d["price_paid"] = None
        if body.quantity is not None:
            d["quantity"] = max(1, body.quantity)
        if body.price_paid is not None:
            d["price_paid"] = round(body.price_paid, 2)
        if body.claimed_by is not None:
            d["claimed_by"] = body.claimed_by or None
        if body.note is not None:
            d["note"] = body.note or None
        conn.execute(
            "UPDATE shopping_items SET status=?, quantity=?, price_paid=?, bought_by=?, claimed_by=?, note=?, "
            "shop_id=?, bought_at=? WHERE id=?",
            (d["status"], d["quantity"], d.get("price_paid"), d.get("bought_by"), d.get("claimed_by"), d.get("note"),
             d.get("shop_id"), d.get("bought_at"), item_id),
        )
        item = dict(conn.execute("SELECT * FROM shopping_items WHERE id = ?", (item_id,)).fetchone())
    await changed("list_updated", item=item)
    return item


@app.delete("/api/list/{item_id}")
async def delete_list_item(item_id: int):
    with db() as conn:
        conn.execute("DELETE FROM shopping_items WHERE id = ?", (item_id,))
    await changed("list_updated", deleted=item_id)
    return {"ok": True}


# --------------------------------------------------------------- housemates
class MemberPatch(BaseModel):
    name: str


@app.post("/api/members/{member_id}")
async def rename_member(member_id: int, body: MemberPatch):
    name = body.name.strip()[:20]
    if not name:
        raise HTTPException(400, "Name is required")
    with db() as conn:
        row = conn.execute("SELECT * FROM members WHERE id = ?", (member_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Housemate not found")
        old = row["name"]
        conn.execute("UPDATE members SET name = ? WHERE id = ?", (name, member_id))
        conn.execute("UPDATE shopping_items SET added_by = ? WHERE added_by = ?", (name, old))
        conn.execute("UPDATE shopping_items SET claimed_by = ? WHERE claimed_by = ?", (name, old))
    await changed("members_updated")
    return {"ok": True}


# ---------------------------------------------------------------- the shop
class ShopStart(BaseModel):
    shopper: str
    store: str | None = None
    budget: float | None = None


class ShopJoin(BaseModel):
    shopper: str


@app.post("/api/shop/start")
async def start_shop(body: ShopStart):
    """G3 hand over the baton: the Dock shows '<shopper> is shopping now'."""
    with db() as conn:
        if active_shop(conn):
            raise HTTPException(409, "A shop is already in progress. Join it as a second shopper instead.")
        st = settings(conn)
        budget = body.budget if body.budget is not None else float(st.get("budget", 60))
        store = body.store or st.get("store")
        conn.execute("UPDATE shops SET dismissed = 1 WHERE status = 'done'")
        conn.execute(
            "INSERT INTO shops(shopper, helpers_json, store, budget, status, started_at) VALUES (?, '[]', ?, ?, 'active', ?)",
            (body.shopper, store, budget, now_iso()),
        )
        conn.execute("INSERT OR REPLACE INTO settings(key, value) VALUES ('budget', ?)", (str(budget),))
        shop = active_shop(conn)
    await changed("shop_started", shop=shop)
    return shop


@app.post("/api/shop/join")
async def join_shop(body: ShopJoin):
    """G5 Split Shop: a second Cart Unit joins the same shop."""
    with db() as conn:
        shop = active_shop(conn)
        if not shop:
            raise HTTPException(409, "No shop in progress. Start one first.")
        if body.shopper not in shop["shoppers"]:
            helpers = [*shop["helpers"], body.shopper]
            conn.execute("UPDATE shops SET helpers_json = ? WHERE id = ?", (json.dumps(helpers), shop["id"]))
        shop = active_shop(conn)
    await changed("shop_updated", shop=shop)
    return shop


@app.post("/api/shop/split")
async def split_shop():
    """Divide the unclaimed list between everyone currently shopping."""
    with db() as conn:
        shop = active_shop(conn)
        if not shop:
            raise HTTPException(409, "No shop in progress.")
        shoppers = shop["shoppers"]
        rows = conn.execute(
            "SELECT id FROM shopping_items WHERE status = 'needed' AND (claimed_by IS NULL OR claimed_by = '') ORDER BY id"
        ).fetchall()
        for i, r in enumerate(rows):
            conn.execute("UPDATE shopping_items SET claimed_by = ? WHERE id = ?", (shoppers[i % len(shoppers)], r["id"]))
    await changed("list_updated")
    return {"ok": True, "assigned": len(rows)}


def build_summary(conn: sqlite3.Connection, shop: dict[str, Any]) -> dict[str, Any]:
    """G6 return and settle: what was bought, what it cost, who owes what.

    Items requested by one housemate are that person's cost. Items for the
    "Household" are shared evenly by everyone in the house. Unpriced items are
    listed so the household can settle them by hand."""
    names = member_names(conn)
    bought = [dict(r) for r in conn.execute(
        "SELECT * FROM shopping_items WHERE status = 'bought' AND shop_id = ? ORDER BY id", (shop["id"],)
    ).fetchall()]
    shares = {n: 0.0 for n in names}
    total = 0.0
    unpriced = []
    for it in bought:
        price = it.get("price_paid")
        if price is None:
            unpriced.append(it["name"])
            continue
        total += price
        who = it.get("added_by")
        if who in shares:
            shares[who] += price
        else:  # Household or a name no longer in the house: split evenly
            for n in names:
                shares[n] += price / max(1, len(names))
    payer = shop["shopper"]
    owes = [{"from": n, "to": payer, "amount": round(v, 2)} for n, v in shares.items() if n != payer and round(v, 2) > 0]
    still_needed = [r["name"] for r in conn.execute("SELECT name FROM shopping_items WHERE status = 'needed'").fetchall()]
    return {
        "shopper": payer,
        "helpers": shop["helpers"],
        "store": shop.get("store"),
        "budget": shop.get("budget"),
        "total": round(total, 2),
        "under_budget": None if shop.get("budget") is None else round(shop["budget"] - total, 2),
        "bought": [{"name": it["name"], "price": it.get("price_paid"), "for": it.get("added_by"),
                    "off_list": it.get("source") == "off-list"} for it in bought],
        "unpriced": unpriced,
        "shares": {n: round(v, 2) for n, v in shares.items()},
        "owes": owes,
        "still_needed": still_needed,
        "questions_asked": conn.execute("SELECT COUNT(*) AS c FROM questions WHERE shop_id = ?", (shop["id"],)).fetchone()["c"],
    }


@app.post("/api/shop/finish")
async def finish_shop():
    with db() as conn:
        shop = active_shop(conn)
        if not shop:
            raise HTTPException(409, "No shop in progress.")
        summary = build_summary(conn, shop)
        # bought items are now at home; clear them from the active list
        for it in summary["bought"]:
            conn.execute(
                "INSERT INTO pantry(name, added_by, updated_at) VALUES (?, ?, ?) "
                "ON CONFLICT(name) DO UPDATE SET updated_at = excluded.updated_at",
                (it["name"], shop["shopper"], now_iso()),
            )
        conn.execute("UPDATE shopping_items SET status = 'archived' WHERE status IN ('bought', 'skipped')")
        conn.execute("UPDATE shopping_items SET claimed_by = NULL WHERE status = 'needed'")
        conn.execute(
            "UPDATE shops SET status = 'done', finished_at = ?, summary_json = ? WHERE id = ?",
            (now_iso(), json.dumps(summary), shop["id"]),
        )
    await changed("shop_finished", summary=summary)
    return summary


@app.post("/api/shop/dismiss")
async def dismiss_summary():
    with db() as conn:
        conn.execute("UPDATE shops SET dismissed = 1 WHERE status = 'done'")
    await changed("shop_updated")
    return {"ok": True}


# ---------------------------------------------------------------- Ask home
class QuestionCreate(BaseModel):
    asked_by: str
    text: str
    options: list[str] = Field(default_factory=lambda: ["Yes", "No"])
    item_id: int | None = None


class QuestionAnswer(BaseModel):
    answer: str
    answered_by: str


@app.post("/api/questions")
async def ask_home(body: QuestionCreate):
    """G4 one quick question home, answered with a tap on the Dock."""
    text = body.text.strip()
    if not text:
        raise HTTPException(400, "Question text is required")
    options = [o.strip() for o in body.options if o.strip()][:4] or ["Yes", "No"]
    with db() as conn:
        shop = active_shop(conn)
        if not shop:
            raise HTTPException(409, "Ask home works during a shop.")
        cur = conn.execute(
            "INSERT INTO questions(shop_id, asked_by, text, options_json, item_id, created_at) VALUES (?,?,?,?,?,?)",
            (shop["id"], body.asked_by, text[:140], json.dumps(options), body.item_id, now_iso()),
        )
        q = dict(conn.execute("SELECT * FROM questions WHERE id = ?", (cur.lastrowid,)).fetchone())
    q["options"] = options
    await changed("question", question=q)
    return q


@app.post("/api/questions/{question_id}/answer")
async def answer_question(question_id: int, body: QuestionAnswer):
    with db() as conn:
        row = conn.execute("SELECT * FROM questions WHERE id = ?", (question_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Question not found")
        conn.execute(
            "UPDATE questions SET answer = ?, answered_by = ?, answered_at = ? WHERE id = ?",
            (body.answer[:80], body.answered_by, now_iso(), question_id),
        )
        q = dict(conn.execute("SELECT * FROM questions WHERE id = ?", (question_id,)).fetchone())
    await changed("question_answered", question=q)
    return q


# ------------------------------------------------------- already at home
class PantryCreate(BaseModel):
    name: str
    added_by: str | None = None


@app.post("/api/pantry")
async def add_pantry(body: PantryCreate):
    name = body.name.strip()
    if not name:
        raise HTTPException(400, "Name is required")
    with db() as conn:
        conn.execute(
            "INSERT INTO pantry(name, added_by, updated_at) VALUES (?,?,?) "
            "ON CONFLICT(name) DO UPDATE SET updated_at = excluded.updated_at",
            (name, body.added_by, now_iso()),
        )
    await changed("pantry_updated")
    return {"ok": True}


@app.delete("/api/pantry/{pantry_id}")
async def remove_pantry(pantry_id: int):
    with db() as conn:
        conn.execute("DELETE FROM pantry WHERE id = ?", (pantry_id,))
    await changed("pantry_updated")
    return {"ok": True}


# ---------------------------------------------------------------- meal board
class MealVote(BaseModel):
    member: str


class MealAdd(BaseModel):
    added_by: str = HOUSEHOLD


@app.post("/api/meals/{meal_id}/vote")
async def vote_meal(meal_id: int, body: MealVote):
    """G1 plan together: housemates tap their token to vote for this week's meals."""
    with db() as conn:
        row = conn.execute("SELECT votes_json FROM meals WHERE id = ?", (meal_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Meal not found")
        votes = json.loads(row["votes_json"] or "[]")
        votes = [v for v in votes if v != body.member] if body.member in votes else [*votes, body.member]
        conn.execute("UPDATE meals SET votes_json = ? WHERE id = ?", (json.dumps(votes), meal_id))
    await changed("meals_updated")
    return {"ok": True, "votes": votes}


@app.post("/api/meals/{meal_id}/add")
async def add_meal_ingredients(meal_id: int, body: MealAdd):
    """Turn a meal into list items, skipping what is already at home or already on the list."""
    with db() as conn:
        row = conn.execute("SELECT * FROM meals WHERE id = ?", (meal_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Meal not found")
        added, skipped_home, skipped_listed = [], [], []
        for ing in json.loads(row["ingredients_json"] or "[]"):
            if conn.execute("SELECT 1 FROM pantry WHERE name = ? COLLATE NOCASE", (ing,)).fetchone():
                skipped_home.append(ing)
                continue
            if conn.execute("SELECT 1 FROM shopping_items WHERE name = ? COLLATE NOCASE AND status = 'needed'", (ing,)).fetchone():
                skipped_listed.append(ing)
                continue
            conn.execute(
                "INSERT INTO shopping_items(name, quantity, added_by, status, created_at, note, source) "
                "VALUES (?, 1, ?, 'needed', ?, ?, 'dock')",
                (ing, body.added_by or HOUSEHOLD, now_iso(), f"for {row['name']}"),
            )
            added.append(ing)
    await changed("list_updated")
    return {"added": added, "already_at_home": skipped_home, "already_on_list": skipped_listed}


# ------------------------------------------------------------- settings/reset
class SettingsPatch(BaseModel):
    budget: float | None = None
    store: str | None = None


@app.post("/api/settings")
async def update_settings(body: SettingsPatch):
    with db() as conn:
        if body.budget is not None:
            conn.execute("INSERT OR REPLACE INTO settings(key, value) VALUES ('budget', ?)", (str(body.budget),))
            conn.execute("UPDATE shops SET budget = ? WHERE status = 'active'", (body.budget,))
        if body.store:
            conn.execute("INSERT OR REPLACE INTO settings(key, value) VALUES ('store', ?)", (body.store,))
    await changed("settings_updated")
    return {"ok": True}


class ResetRequest(BaseModel):
    scenario: str = "demo"   # "demo" = a few requests + pantry items; "empty" = blank house


@app.post("/api/reset")
async def reset(body: ResetRequest):
    """Start every evaluation session / tradeshow visitor from the same state.
    Keeps the product library and prices."""
    with db() as conn:
        for table in ("shopping_items", "shops", "questions", "pantry", "scans"):
            conn.execute(f"DELETE FROM {table}")
        seed_members(conn)
        seed_meals(conn)
        for key, value in DEFAULT_SETTINGS.items():
            conn.execute("INSERT OR REPLACE INTO settings(key, value) VALUES (?, ?)", (key, value))
        if body.scenario == "demo":
            t = now_iso()
            for name, who, note in [
                ("Milk", HOUSEHOLD, None),
                ("Greek yoghurt", "Jay", "the cheap one please"),
                ("Bananas", "Priya", None),
                ("Toilet paper", HOUSEHOLD, "we're on the last roll"),
                ("Oats", "Alex", None),
            ]:
                conn.execute(
                    "INSERT INTO shopping_items(name, quantity, added_by, status, created_at, note, source) "
                    "VALUES (?, 1, ?, 'needed', ?, ?, 'dock')",
                    (name, who, t, note),
                )
            for name in ("Rice", "Soy sauce", "Eggs"):
                conn.execute("INSERT INTO pantry(name, added_by, updated_at) VALUES (?, ?, ?)", (name, HOUSEHOLD, t))
            # link the demo yoghurt request to a product so its price fills in automatically
            conn.execute("UPDATE shopping_items SET barcode = '9300000000019' WHERE name = 'Greek yoghurt'")
    await changed("reset")
    return {"ok": True, "scenario": body.scenario}


# --------------------------------------------------------------- websocket
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()   # clients send "ping" to keep the connection alive
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception:
        manager.disconnect(ws)
