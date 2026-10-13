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

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DB_PATH = Path(os.getenv("NUTRICART_DB", BASE_DIR.parent / "nutricart.db"))
OFF_BASE = "https://world.openfoodfacts.org/api/v2/product"
USER_AGENT = os.getenv("NUTRICART_USER_AGENT", "NutriCartHub-Prototype/0.2 (university prototype)")

app = FastAPI(title="NutriCart Hub Prototype", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


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


def init_db():
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
            """
        )
        count = conn.execute("SELECT COUNT(*) AS c FROM products").fetchone()["c"]
        if count == 0:
            demos = [
                ("9300000000019", "Demo Greek Yoghurt", "NutriCart Demo", "900 g", "yoghurt", None,
                 {"energy_kj_100g": 420, "protein_100g": 9.5, "sugars_100g": 4.8, "fat_100g": 3.2}, "demo"),
                ("9300000000026", "Demo Natural Yoghurt", "NutriCart Demo", "1 kg", "yoghurt", None,
                 {"energy_kj_100g": 360, "protein_100g": 5.8, "sugars_100g": 4.2, "fat_100g": 2.8}, "demo"),
                ("9300000000033", "Demo High Protein Yoghurt", "NutriCart Demo", "700 g", "yoghurt", None,
                 {"energy_kj_100g": 390, "protein_100g": 12.0, "sugars_100g": 3.7, "fat_100g": 1.5}, "demo"),
                ("9300000000040", "Demo Wholemeal Bread", "NutriCart Demo", "700 g", "bread", None,
                 {"energy_kj_100g": 980, "protein_100g": 9.0, "sugars_100g": 3.4, "fat_100g": 3.5}, "demo"),
            ]
            for barcode, name, brand, quantity, category, image_url, nutrition, source in demos:
                conn.execute(
                    "INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (barcode, name, brand, quantity, category, image_url, json.dumps(nutrition), source, now_iso()),
                )
            prices = [
                ("9300000000019", "Woolworths", 6.50, "$0.72 / 100g"),
                ("9300000000026", "Woolworths", 4.80, "$0.48 / 100g"),
                ("9300000000033", "Woolworths", 7.00, "$1.00 / 100g"),
                ("9300000000040", "Woolworths", 4.20, "$0.60 / 100g"),
            ]
            for barcode, store, price, unit_price in prices:
                conn.execute(
                    "INSERT INTO prices(barcode, store, price, unit_price, source, observed_at) VALUES (?, ?, ?, ?, 'demo', ?)",
                    (barcode, store, price, unit_price, now_iso()),
                )


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


class ShoppingItemCreate(BaseModel):
    name: str
    barcode: str | None = None
    quantity: int = 1
    added_by: str = "household"


class ShoppingItemPatch(BaseModel):
    status: str | None = None
    quantity: int | None = None


class ConnectionManager:
    def __init__(self):
        self.connections: set[WebSocket] = set()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.add(ws)

    def disconnect(self, ws: WebSocket):
        self.connections.discard(ws)

    async def broadcast(self, payload: dict[str, Any]):
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
def startup():
    init_db()


@app.get("/")
def root():
    return FileResponse(STATIC_DIR / "hub.html")


@app.get("/hub")
def hub():
    return FileResponse(STATIC_DIR / "hub.html")


@app.get("/api/health")
def health():
    return {"ok": True, "name": "NutriCart Hub", "version": "0.2.0"}


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
            (barcode, product["name"], product["brand"], product["quantity"], product["category"], product["image_url"], json.dumps(product["nutrition"]), product["source"], now_iso()),
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
        "barcode": barcode,
        "name": "Unknown product",
        "brand": None,
        "quantity": None,
        "category": None,
        "image_url": None,
        "nutrition": {},
        "source": "unmatched",
        "prices": [],
    }


def score_alternative(product: dict[str, Any], price: float | None) -> dict[str, Any]:
    n = product.get("nutrition") or {}
    protein = n.get("protein_100g")
    sugar = n.get("sugars_100g")
    out = {"price": price, "protein_per_dollar": None, "sugar_100g": sugar}
    if price and isinstance(protein, (int, float)):
        out["protein_per_dollar"] = round(protein / price, 2)
    return out


@app.get("/api/products")
def products():
    with db() as conn:
        rows = conn.execute("SELECT * FROM products ORDER BY updated_at DESC").fetchall()
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
    await manager.broadcast({"type": "product_updated", "product": product})
    return product


@app.put("/api/products/{barcode}/price")
async def product_price(barcode: str, body: PriceUpsert):
    product = await resolve_product(barcode)
    if product["name"] == "Unknown product":
        raise HTTPException(404, "Product is unknown. Add its product details first from the Hub.")
    with db() as conn:
        conn.execute(
            """INSERT INTO prices(barcode,store,price,unit_price,source,observed_at)
               VALUES(?,?,?,?, 'manual', ?)
               ON CONFLICT(barcode,store) DO UPDATE SET price=excluded.price,
               unit_price=excluded.unit_price, source='manual', observed_at=excluded.observed_at""",
            (product["barcode"], body.store, body.price, body.unit_price, now_iso()),
        )
    product = get_local_product(product["barcode"])
    await manager.broadcast({"type": "product_updated", "product": product})
    return product


@app.get("/api/compare/{barcode}")
async def compare(barcode: str, store: str = "Woolworths"):
    target = await resolve_product(barcode)
    if not target.get("category"):
        return {"target": target, "alternatives": [], "note": "Add a category to compare this product."}

    with db() as conn:
        rows = conn.execute("SELECT * FROM products WHERE category = ? AND barcode != ?", (target["category"], target["barcode"])).fetchall()
        alts = []
        for row in rows:
            p = row_product(row)
            price_row = conn.execute(
                "SELECT price, unit_price, store FROM prices WHERE barcode = ? ORDER BY CASE WHEN store = ? THEN 0 ELSE 1 END, observed_at DESC LIMIT 1",
                (p["barcode"], store),
            ).fetchone()
            price = price_row["price"] if price_row else None
            p["best_price"] = dict(price_row) if price_row else None
            p["comparison"] = score_alternative(p, price)
            alts.append(p)
    alts.sort(key=lambda x: (x["best_price"] is None, x["best_price"]["price"] if x["best_price"] else 999999))
    return {"target": target, "alternatives": alts[:8]}


@app.post("/api/scan")
async def scan(body: ScanRequest):
    product = await resolve_product(body.barcode)
    with db() as conn:
        conn.execute(
            "INSERT INTO scans(barcode,device,store,scanned_at) VALUES(?,?,?,?)",
            (product["barcode"], body.device, body.store, now_iso()),
        )
    comparison = await compare(product["barcode"], body.store or "Woolworths")
    payload = {
        "type": "scan",
        "device": body.device,
        "store": body.store,
        "product": product,
        "comparison": comparison,
    }
    await manager.broadcast(payload)
    return payload


@app.get("/api/state")
def state():
    with db() as conn:
        items = [dict(r) for r in conn.execute("SELECT * FROM shopping_items ORDER BY status, id DESC").fetchall()]
        scans = [dict(r) for r in conn.execute("SELECT * FROM scans ORDER BY id DESC LIMIT 10").fetchall()]
    return {"shopping_items": items, "recent_scans": scans}


@app.post("/api/list")
async def add_list_item(body: ShoppingItemCreate):
    with db() as conn:
        cur = conn.execute(
            "INSERT INTO shopping_items(name,barcode,quantity,added_by,status,created_at) VALUES(?,?,?,?, 'needed', ?)",
            (body.name, body.barcode, body.quantity, body.added_by, now_iso()),
        )
        item = dict(conn.execute("SELECT * FROM shopping_items WHERE id = ?", (cur.lastrowid,)).fetchone())
    await manager.broadcast({"type": "list_updated", "item": item})
    return item


@app.patch("/api/list/{item_id}")
async def patch_list_item(item_id: int, body: ShoppingItemPatch):
    with db() as conn:
        row = conn.execute("SELECT * FROM shopping_items WHERE id = ?", (item_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Item not found")
        status = body.status if body.status is not None else row["status"]
        quantity = body.quantity if body.quantity is not None else row["quantity"]
        conn.execute("UPDATE shopping_items SET status=?, quantity=? WHERE id=?", (status, quantity, item_id))
        item = dict(conn.execute("SELECT * FROM shopping_items WHERE id = ?", (item_id,)).fetchone())
    await manager.broadcast({"type": "list_updated", "item": item})
    return item


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception:
        manager.disconnect(ws)
