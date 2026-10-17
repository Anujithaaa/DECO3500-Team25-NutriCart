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

USER_AGENT = os.getenv(
    "NUTRICART_USER_AGENT",
    "NutriCartHub-Prototype/0.3 (university prototype)"
)

app = FastAPI(
    title="NutriCart Hub Prototype",
    version="0.3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/static",
    StaticFiles(directory=STATIC_DIR),
    name="static"
)


# ---------------------------------------------------------
# DATABASE
# ---------------------------------------------------------

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

            CREATE TABLE IF NOT EXISTS hub_settings (
                key TEXT PRIMARY KEY,
                value_json TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS meals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                suggested_by TEXT NOT NULL DEFAULT 'Household',
                cost REAL,
                prep_minutes INTEGER,
                servings INTEGER,
                selected INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS meal_ingredients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                meal_id INTEGER NOT NULL,
                name TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS household_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                person TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS inventory_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                quantity TEXT,
                note TEXT,
                updated_by TEXT NOT NULL DEFAULT 'Household',
                created_at TEXT NOT NULL
            );
            """
        )

        # -------------------------------------------------
        # DEFAULT HUB SETTINGS
        # -------------------------------------------------

        defaults = {
            "budget": 60,
            "household_name": "NutriCart Household",
            "shopping_active": False,
        }

        for key, value in defaults.items():

            conn.execute(
                """
                INSERT OR IGNORE INTO hub_settings(
                    key,
                    value_json
                )
                VALUES(?,?)
                """,
                (
                    key,
                    json.dumps(value)
                )
            )

        # -------------------------------------------------
        # DEMO PRODUCTS
        # -------------------------------------------------

        count = conn.execute(
            "SELECT COUNT(*) AS c FROM products"
        ).fetchone()["c"]

        if count == 0:

            demos = [
                (
                    "9300000000019",
                    "Demo Greek Yoghurt",
                    "NutriCart Demo",
                    "900 g",
                    "yoghurt",
                    None,
                    {
                        "energy_kj_100g": 420,
                        "protein_100g": 9.5,
                        "sugars_100g": 4.8,
                        "fat_100g": 3.2
                    },
                    "demo"
                ),
                (
                    "9300000000026",
                    "Demo Natural Yoghurt",
                    "NutriCart Demo",
                    "1 kg",
                    "yoghurt",
                    None,
                    {
                        "energy_kj_100g": 360,
                        "protein_100g": 5.8,
                        "sugars_100g": 4.2,
                        "fat_100g": 2.8
                    },
                    "demo"
                ),
                (
                    "9300000000033",
                    "Demo High Protein Yoghurt",
                    "NutriCart Demo",
                    "700 g",
                    "yoghurt",
                    None,
                    {
                        "energy_kj_100g": 390,
                        "protein_100g": 12.0,
                        "sugars_100g": 3.7,
                        "fat_100g": 1.5
                    },
                    "demo"
                ),
                (
                    "9300000000040",
                    "Demo Wholemeal Bread",
                    "NutriCart Demo",
                    "700 g",
                    "bread",
                    None,
                    {
                        "energy_kj_100g": 980,
                        "protein_100g": 9.0,
                        "sugars_100g": 3.4,
                        "fat_100g": 3.5
                    },
                    "demo"
                ),
            ]

            for (
                barcode,
                name,
                brand,
                quantity,
                category,
                image_url,
                nutrition,
                source
            ) in demos:

                conn.execute(
                    """
                    INSERT INTO products
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        barcode,
                        name,
                        brand,
                        quantity,
                        category,
                        image_url,
                        json.dumps(nutrition),
                        source,
                        now_iso()
                    )
                )

            prices = [
                (
                    "9300000000019",
                    "Woolworths",
                    6.50,
                    "$0.72 / 100g"
                ),
                (
                    "9300000000026",
                    "Woolworths",
                    4.80,
                    "$0.48 / 100g"
                ),
                (
                    "9300000000033",
                    "Woolworths",
                    7.00,
                    "$1.00 / 100g"
                ),
                (
                    "9300000000040",
                    "Woolworths",
                    4.20,
                    "$0.60 / 100g"
                ),
            ]

            for barcode, store, price, unit_price in prices:

                conn.execute(
                    """
                    INSERT INTO prices(
                        barcode,
                        store,
                        price,
                        unit_price,
                        source,
                        observed_at
                    )
                    VALUES (?, ?, ?, ?, 'demo', ?)
                    """,
                    (
                        barcode,
                        store,
                        price,
                        unit_price,
                        now_iso()
                    )
                )

        # -------------------------------------------------
        # DEFAULT MEALS
        # -------------------------------------------------

        meal_count = conn.execute(
            "SELECT COUNT(*) AS c FROM meals"
        ).fetchone()["c"]

        if meal_count == 0:

            seeded_meals = [
                (
                    "Chicken Stir Fry",
                    "Jess",
                    15,
                    20,
                    3,
                    1,
                    [
                        "Chicken",
                        "Rice",
                        "Capsicum",
                        "Broccoli",
                        "Soy sauce"
                    ]
                ),
                (
                    "Pasta",
                    "Alex",
                    10,
                    15,
                    4,
                    0,
                    [
                        "Pasta",
                        "Pasta sauce",
                        "Cheese"
                    ]
                ),
                (
                    "Burrito Bowls",
                    "Jack",
                    18,
                    25,
                    3,
                    0,
                    [
                        "Rice",
                        "Chicken",
                        "Beans",
                        "Capsicum"
                    ]
                ),
            ]

            for (
                name,
                person,
                cost,
                mins,
                servings,
                selected,
                ingredients
            ) in seeded_meals:

                cur = conn.execute(
                    """
                    INSERT INTO meals(
                        name,
                        suggested_by,
                        cost,
                        prep_minutes,
                        servings,
                        selected,
                        created_at
                    )
                    VALUES(?,?,?,?,?,?,?)
                    """,
                    (
                        name,
                        person,
                        cost,
                        mins,
                        servings,
                        selected,
                        now_iso()
                    )
                )

                for ingredient in ingredients:

                    conn.execute(
                        """
                        INSERT INTO meal_ingredients(
                            meal_id,
                            name
                        )
                        VALUES(?,?)
                        """,
                        (
                            cur.lastrowid,
                            ingredient
                        )
                    )

        # -------------------------------------------------
        # DEFAULT REQUESTS
        # -------------------------------------------------

        request_count = conn.execute(
            "SELECT COUNT(*) AS c FROM household_requests"
        ).fetchone()["c"]

        if request_count == 0:

            requests = [
                (
                    "Jess",
                    "If you see the cheap Greek yoghurt, grab one."
                ),
                (
                    "Alex",
                    "We still have rice, don’t buy more."
                ),
                (
                    "Jack",
                    "Need something quick for lunch."
                ),
            ]

            for person, message in requests:

                conn.execute(
                    """
                    INSERT INTO household_requests(
                        person,
                        message,
                        created_at
                    )
                    VALUES(?,?,?)
                    """,
                    (
                        person,
                        message,
                        now_iso()
                    )
                )

        # -------------------------------------------------
        # DEFAULT ITEMS ALREADY AT HOME
        # -------------------------------------------------

        inventory_count = conn.execute(
            "SELECT COUNT(*) AS c FROM inventory_items"
        ).fetchone()["c"]

        if inventory_count == 0:

            inventory = [
                (
                    "Rice",
                    "about half a bag",
                    "Enough for one more meal",
                    "Alex"
                ),
                (
                    "Soy sauce",
                    "1 bottle",
                    "Still plenty left",
                    "Jess"
                ),
            ]

            for (
                name,
                quantity,
                note,
                person
            ) in inventory:

                conn.execute(
                    """
                    INSERT INTO inventory_items(
                        name,
                        quantity,
                        note,
                        updated_by,
                        created_at
                    )
                    VALUES(?,?,?,?,?)
                    """,
                    (
                        name,
                        quantity,
                        note,
                        person,
                        now_iso()
                    )
                )


# ---------------------------------------------------------
# REQUEST MODELS
# ---------------------------------------------------------

class ProductUpsert(BaseModel):

    name: str
    brand: str | None = None
    quantity: str | None = None
    category: str | None = None
    image_url: str | None = None

    nutrition: dict[str, Any] = Field(
        default_factory=dict
    )

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

    name: str | None = None
    barcode: str | None = None
    quantity: int | None = None
    added_by: str | None = None
    status: str | None = None


class HubSettingsPatch(BaseModel):

    budget: float | None = None
    household_name: str | None = None
    shopping_active: bool | None = None


class MealCreate(BaseModel):

    name: str
    suggested_by: str = "Household"

    cost: float | None = None
    prep_minutes: int | None = None
    servings: int | None = None

    ingredients: list[str] = Field(
        default_factory=list
    )


class MealPatch(BaseModel):

    name: str | None = None
    suggested_by: str | None = None

    cost: float | None = None
    prep_minutes: int | None = None
    servings: int | None = None

    ingredients: list[str] | None = None


class RequestCreate(BaseModel):

    person: str
    message: str


class RequestPatch(BaseModel):

    person: str | None = None
    message: str | None = None


class InventoryCreate(BaseModel):

    name: str
    quantity: str | None = None
    note: str | None = None
    updated_by: str = "Household"


class InventoryPatch(BaseModel):

    name: str | None = None
    quantity: str | None = None
    note: str | None = None
    updated_by: str | None = None


# ---------------------------------------------------------
# WEBSOCKETS
# ---------------------------------------------------------

class ConnectionManager:

    def __init__(self):

        self.connections: set[WebSocket] = set()


    async def connect(
        self,
        ws: WebSocket
    ):

        await ws.accept()

        self.connections.add(ws)


    def disconnect(
        self,
        ws: WebSocket
    ):

        self.connections.discard(ws)


    async def broadcast(
        self,
        payload: dict[str, Any]
    ):

        stale: list[WebSocket] = []

        for ws in list(self.connections):

            try:

                await ws.send_json(payload)

            except Exception:

                stale.append(ws)

        for ws in stale:

            self.disconnect(ws)


manager = ConnectionManager()


# ---------------------------------------------------------
# STARTUP
# ---------------------------------------------------------

@app.on_event("startup")
def startup():

    init_db()


# ---------------------------------------------------------
# PAGES
# ---------------------------------------------------------

@app.get("/")
def root():

    return FileResponse(
        STATIC_DIR / "hub.html"
    )


@app.get("/hub")
def hub():

    return FileResponse(
        STATIC_DIR / "hub.html"
    )


@app.get("/api/health")
def health():

    return {
        "ok": True,
        "name": "NutriCart Hub",
        "version": "0.3.0"
    }


# ---------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------

def get_settings(
    conn: sqlite3.Connection
) -> dict[str, Any]:

    result: dict[str, Any] = {}

    rows = conn.execute(
        """
        SELECT
            key,
            value_json
        FROM hub_settings
        """
    ).fetchall()

    for row in rows:

        try:

            result[row["key"]] = json.loads(
                row["value_json"]
            )

        except Exception:

            result[row["key"]] = row["value_json"]

    return result


def meal_dict(
    conn: sqlite3.Connection,
    row: sqlite3.Row
) -> dict[str, Any]:

    meal = dict(row)

    meal["selected"] = bool(
        meal["selected"]
    )

    meal["ingredients"] = [
        r["name"]
        for r in conn.execute(
            """
            SELECT name
            FROM meal_ingredients
            WHERE meal_id=?
            ORDER BY id
            """,
            (
                meal["id"],
            )
        ).fetchall()
    ]

    return meal


def get_meals(
    conn: sqlite3.Connection
) -> list[dict[str, Any]]:

    rows = conn.execute(
        """
        SELECT *
        FROM meals
        ORDER BY
            selected DESC,
            id DESC
        """
    ).fetchall()

    return [
        meal_dict(
            conn,
            row
        )
        for row in rows
    ]


def row_product(
    row: sqlite3.Row
) -> dict[str, Any]:

    return {
        "barcode": row["barcode"],
        "name": row["name"],
        "brand": row["brand"],
        "quantity": row["quantity"],
        "category": row["category"],
        "image_url": row["image_url"],
        "nutrition": json.loads(
            row["nutrition_json"] or "{}"
        ),
        "source": row["source"],
        "updated_at": row["updated_at"],
    }


def get_local_product(
    barcode: str
) -> dict[str, Any] | None:

    with db() as conn:

        row = conn.execute(
            """
            SELECT *
            FROM products
            WHERE barcode = ?
            """,
            (
                barcode,
            )
        ).fetchone()

        if not row:

            return None

        product = row_product(row)

        product["prices"] = [
            dict(r)
            for r in conn.execute(
                """
                SELECT
                    store,
                    price,
                    unit_price,
                    source,
                    observed_at
                FROM prices
                WHERE barcode = ?
                ORDER BY observed_at DESC
                """,
                (
                    barcode,
                )
            ).fetchall()
        ]

        return product


async def fetch_open_food_facts(
    barcode: str
) -> dict[str, Any] | None:

    fields = (
        "code,"
        "product_name,"
        "brands,"
        "quantity,"
        "categories_tags,"
        "image_front_small_url,"
        "nutriments"
    )

    url = (
        f"{OFF_BASE}/"
        f"{barcode}.json?"
        f"fields={fields}"
    )

    try:

        async with httpx.AsyncClient(
            timeout=5.0,
            headers={
                "User-Agent": USER_AGENT
            }
        ) as client:

            r = await client.get(url)

            if r.status_code != 200:

                return None

            data = r.json()

    except Exception:

        return None

    if (
        data.get("status") != 1
        or not data.get("product")
    ):

        return None

    p = data["product"]

    n = p.get("nutriments") or {}

    nutrition = {
        "energy_kj_100g":
            n.get("energy-kj_100g"),
        "protein_100g":
            n.get("proteins_100g"),
        "sugars_100g":
            n.get("sugars_100g"),
        "fat_100g":
            n.get("fat_100g"),
        "salt_100g":
            n.get("salt_100g"),
    }

    categories = (
        p.get("categories_tags")
        or []
    )

    category = (
        categories[0]
        .split(":", 1)[-1]
        .replace("-", " ")
        if categories
        else None
    )

    product = {
        "barcode": barcode,
        "name":
            p.get("product_name")
            or f"Product {barcode}",
        "brand":
            p.get("brands"),
        "quantity":
            p.get("quantity"),
        "category":
            category,
        "image_url":
            p.get("image_front_small_url"),
        "nutrition":
            nutrition,
        "source":
            "Open Food Facts",
    }

    with db() as conn:

        conn.execute(
            """
            INSERT INTO products(
                barcode,
                name,
                brand,
                quantity,
                category,
                image_url,
                nutrition_json,
                source,
                updated_at
            )
            VALUES(?,?,?,?,?,?,?,?,?)

            ON CONFLICT(barcode)
            DO UPDATE SET

                name=excluded.name,
                brand=excluded.brand,
                quantity=excluded.quantity,

                category=COALESCE(
                    products.category,
                    excluded.category
                ),

                image_url=excluded.image_url,
                nutrition_json=excluded.nutrition_json,
                source=excluded.source,
                updated_at=excluded.updated_at
            """,
            (
                barcode,
                product["name"],
                product["brand"],
                product["quantity"],
                product["category"],
                product["image_url"],
                json.dumps(
                    product["nutrition"]
                ),
                product["source"],
                now_iso()
            )
        )

    product["prices"] = []

    return product


async def resolve_product(
    barcode: str
) -> dict[str, Any]:

    barcode = "".join(
        ch
        for ch in barcode
        if ch.isdigit()
    )

    if not barcode:

        raise HTTPException(
            400,
            "Barcode must contain digits"
        )

    local = get_local_product(
        barcode
    )

    if local:

        return local

    off = await fetch_open_food_facts(
        barcode
    )

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


def score_alternative(
    product: dict[str, Any],
    price: float | None
) -> dict[str, Any]:

    n = (
        product.get("nutrition")
        or {}
    )

    protein = n.get(
        "protein_100g"
    )

    sugar = n.get(
        "sugars_100g"
    )

    out = {
        "price": price,
        "protein_per_dollar": None,
        "sugar_100g": sugar
    }

    if (
        price
        and isinstance(
            protein,
            (int, float)
        )
    ):

        out[
            "protein_per_dollar"
        ] = round(
            protein / price,
            2
        )

    return out


# ---------------------------------------------------------
# PRODUCTS
# ---------------------------------------------------------

@app.get("/api/products")
def products():

    with db() as conn:

        rows = conn.execute(
            """
            SELECT *
            FROM products
            ORDER BY updated_at DESC
            """
        ).fetchall()

        result = []

        for row in rows:

            p = row_product(row)

            p["prices"] = [
                dict(r)
                for r in conn.execute(
                    """
                    SELECT
                        store,
                        price,
                        unit_price,
                        source,
                        observed_at
                    FROM prices
                    WHERE barcode = ?
                    ORDER BY observed_at DESC
                    """,
                    (
                        p["barcode"],
                    )
                ).fetchall()
            ]

            result.append(p)

    return result


@app.get("/api/products/{barcode}")
async def product_lookup(
    barcode: str
):

    return await resolve_product(
        barcode
    )


@app.post("/api/products/{barcode}")
async def product_upsert(
    barcode: str,
    body: ProductUpsert
):

    barcode = "".join(
        ch
        for ch in barcode
        if ch.isdigit()
    )

    if not barcode:

        raise HTTPException(
            400,
            "Barcode must contain digits"
        )

    with db() as conn:

        conn.execute(
            """
            INSERT INTO products(
                barcode,
                name,
                brand,
                quantity,
                category,
                image_url,
                nutrition_json,
                source,
                updated_at
            )
            VALUES(
                ?,?,?,?,?,?,?,
                'manual',
                ?
            )

            ON CONFLICT(barcode)
            DO UPDATE SET

                name=excluded.name,
                brand=excluded.brand,
                quantity=excluded.quantity,
                category=excluded.category,
                image_url=excluded.image_url,
                nutrition_json=excluded.nutrition_json,
                source='manual',
                updated_at=excluded.updated_at
            """,
            (
                barcode,
                body.name,
                body.brand,
                body.quantity,
                body.category,
                body.image_url,
                json.dumps(
                    body.nutrition
                ),
                now_iso()
            )
        )

        if (
            body.store
            and body.price is not None
        ):

            conn.execute(
                """
                INSERT INTO prices(
                    barcode,
                    store,
                    price,
                    unit_price,
                    source,
                    observed_at
                )
                VALUES(
                    ?,?,?,?,
                    'manual',
                    ?
                )

                ON CONFLICT(
                    barcode,
                    store
                )
                DO UPDATE SET

                    price=excluded.price,
                    unit_price=excluded.unit_price,
                    source='manual',
                    observed_at=excluded.observed_at
                """,
                (
                    barcode,
                    body.store,
                    body.price,
                    body.unit_price,
                    now_iso()
                )
            )

    product = get_local_product(
        barcode
    )

    await manager.broadcast(
        {
            "type":
                "product_updated",
            "product":
                product
        }
    )

    return product


@app.delete("/api/products/{barcode}")
async def product_delete(
    barcode: str
):

    with db() as conn:

        conn.execute(
            """
            DELETE FROM prices
            WHERE barcode=?
            """,
            (
                barcode,
            )
        )

        cur = conn.execute(
            """
            DELETE FROM products
            WHERE barcode=?
            """,
            (
                barcode,
            )
        )

        if cur.rowcount == 0:

            raise HTTPException(
                404,
                "Product not found"
            )

    await manager.broadcast(
        {
            "type":
                "product_updated"
        }
    )

    return {
        "ok": True
    }


@app.put("/api/products/{barcode}/price")
async def product_price(
    barcode: str,
    body: PriceUpsert
):

    product = await resolve_product(
        barcode
    )

    if (
        product["name"]
        == "Unknown product"
    ):

        raise HTTPException(
            404,
            (
                "Product is unknown. "
                "Add its product details "
                "first from the Hub."
            )
        )

    with db() as conn:

        conn.execute(
            """
            INSERT INTO prices(
                barcode,
                store,
                price,
                unit_price,
                source,
                observed_at
            )
            VALUES(
                ?,?,?,?,
                'manual',
                ?
            )

            ON CONFLICT(
                barcode,
                store
            )
            DO UPDATE SET

                price=excluded.price,
                unit_price=excluded.unit_price,
                source='manual',
                observed_at=excluded.observed_at
            """,
            (
                product["barcode"],
                body.store,
                body.price,
                body.unit_price,
                now_iso()
            )
        )

    product = get_local_product(
        product["barcode"]
    )

    await manager.broadcast(
        {
            "type":
                "product_updated",
            "product":
                product
        }
    )

    return product


@app.get("/api/compare/{barcode}")
async def compare(
    barcode: str,
    store: str = "Woolworths"
):

    target = await resolve_product(
        barcode
    )

    if not target.get("category"):

        return {
            "target":
                target,
            "alternatives":
                [],
            "note":
                "Add a category to compare this product."
        }

    with db() as conn:

        rows = conn.execute(
            """
            SELECT *
            FROM products
            WHERE
                category = ?
                AND barcode != ?
            """,
            (
                target["category"],
                target["barcode"]
            )
        ).fetchall()

        alts = []

        for row in rows:

            p = row_product(row)

            price_row = conn.execute(
                """
                SELECT
                    price,
                    unit_price,
                    store
                FROM prices
                WHERE barcode = ?
                ORDER BY
                    CASE
                        WHEN store = ?
                        THEN 0
                        ELSE 1
                    END,
                    observed_at DESC
                LIMIT 1
                """,
                (
                    p["barcode"],
                    store
                )
            ).fetchone()

            price = (
                price_row["price"]
                if price_row
                else None
            )

            p["best_price"] = (
                dict(price_row)
                if price_row
                else None
            )

            p["comparison"] = (
                score_alternative(
                    p,
                    price
                )
            )

            alts.append(p)

    alts.sort(
        key=lambda x: (
            x["best_price"] is None,
            (
                x["best_price"]["price"]
                if x["best_price"]
                else 999999
            )
        )
    )

    return {
        "target":
            target,
        "alternatives":
            alts[:8]
    }


# ---------------------------------------------------------
# BARCODE SCANNING
# ---------------------------------------------------------

@app.post("/api/scan")
async def scan(
    body: ScanRequest
):

    product = await resolve_product(
        body.barcode
    )

    with db() as conn:

        conn.execute(
            """
            INSERT INTO scans(
                barcode,
                device,
                store,
                scanned_at
            )
            VALUES(?,?,?,?)
            """,
            (
                product["barcode"],
                body.device,
                body.store,
                now_iso()
            )
        )

    comparison = await compare(
        product["barcode"],
        body.store or "Woolworths"
    )

    payload = {
        "type":
            "scan",
        "device":
            body.device,
        "store":
            body.store,
        "product":
            product,
        "comparison":
            comparison,
    }

    await manager.broadcast(
        payload
    )

    return payload


# ---------------------------------------------------------
# SHARED STATE
# ---------------------------------------------------------

@app.get("/api/state")
def state():

    with db() as conn:

        items = [
            dict(r)
            for r in conn.execute(
                """
                SELECT *
                FROM shopping_items
                ORDER BY
                    status,
                    id DESC
                """
            ).fetchall()
        ]

        scans = [
            dict(r)
            for r in conn.execute(
                """
                SELECT *
                FROM scans
                ORDER BY id DESC
                LIMIT 10
                """
            ).fetchall()
        ]

        meals = get_meals(
            conn
        )

        selected_meal = next(
            (
                m
                for m in meals
                if m["selected"]
            ),
            None
        )

        requests = [
            dict(r)
            for r in conn.execute(
                """
                SELECT *
                FROM household_requests
                ORDER BY id DESC
                """
            ).fetchall()
        ]

        inventory = [
            dict(r)
            for r in conn.execute(
                """
                SELECT *
                FROM inventory_items
                ORDER BY id DESC
                """
            ).fetchall()
        ]

        settings = get_settings(
            conn
        )

    return {
        "shopping_items":
            items,

        "recent_scans":
            scans,

        "settings":
            settings,

        "meals":
            meals,

        "selected_meal":
            selected_meal,

        "household_requests":
            requests,

        "inventory":
            inventory,
    }


# ---------------------------------------------------------
# HUB SETTINGS
# ---------------------------------------------------------

@app.patch("/api/settings")
async def patch_settings(
    body: HubSettingsPatch
):

    changes = body.model_dump(
        exclude_none=True
    )

    with db() as conn:

        for key, value in changes.items():

            conn.execute(
                """
                INSERT INTO hub_settings(
                    key,
                    value_json
                )
                VALUES(?,?)

                ON CONFLICT(key)
                DO UPDATE SET
                    value_json=excluded.value_json
                """,
                (
                    key,
                    json.dumps(value)
                )
            )

        settings = get_settings(
            conn
        )

    await manager.broadcast(
        {
            "type":
                "settings_updated",
            "settings":
                settings
        }
    )

    return settings


# ---------------------------------------------------------
# SHOPPING LIST
# ---------------------------------------------------------

@app.post("/api/list")
async def add_list_item(
    body: ShoppingItemCreate
):

    with db() as conn:

        cur = conn.execute(
            """
            INSERT INTO shopping_items(
                name,
                barcode,
                quantity,
                added_by,
                status,
                created_at
            )
            VALUES(
                ?,?,?,?,
                'needed',
                ?
            )
            """,
            (
                body.name,
                body.barcode,
                body.quantity,
                body.added_by,
                now_iso()
            )
        )

        item = dict(
            conn.execute(
                """
                SELECT *
                FROM shopping_items
                WHERE id = ?
                """,
                (
                    cur.lastrowid,
                )
            ).fetchone()
        )

    await manager.broadcast(
        {
            "type":
                "list_updated",
            "item":
                item
        }
    )

    return item


@app.patch("/api/list/{item_id}")
async def patch_list_item(
    item_id: int,
    body: ShoppingItemPatch
):

    with db() as conn:

        row = conn.execute(
            """
            SELECT *
            FROM shopping_items
            WHERE id = ?
            """,
            (
                item_id,
            )
        ).fetchone()

        if not row:

            raise HTTPException(
                404,
                "Item not found"
            )

        data = dict(row)

        changes = body.model_dump(
            exclude_none=True
        )

        data.update(
            changes
        )

        conn.execute(
            """
            UPDATE shopping_items
            SET
                name=?,
                barcode=?,
                quantity=?,
                added_by=?,
                status=?
            WHERE id=?
            """,
            (
                data["name"],
                data["barcode"],
                data["quantity"],
                data["added_by"],
                data["status"],
                item_id
            )
        )

        item = dict(
            conn.execute(
                """
                SELECT *
                FROM shopping_items
                WHERE id = ?
                """,
                (
                    item_id,
                )
            ).fetchone()
        )

    await manager.broadcast(
        {
            "type":
                "list_updated",
            "item":
                item
        }
    )

    return item


@app.delete("/api/list/{item_id}")
async def delete_list_item(
    item_id: int
):

    with db() as conn:

        cur = conn.execute(
            """
            DELETE FROM shopping_items
            WHERE id=?
            """,
            (
                item_id,
            )
        )

        if cur.rowcount == 0:

            raise HTTPException(
                404,
                "Item not found"
            )

    await manager.broadcast(
        {
            "type":
                "list_updated",
            "deleted_id":
                item_id
        }
    )

    return {
        "ok": True
    }


# ---------------------------------------------------------
# MEALS
# ---------------------------------------------------------

@app.get("/api/meals")
def meals():

    with db() as conn:

        return get_meals(
            conn
        )


@app.post("/api/meals")
async def create_meal(
    body: MealCreate
):

    with db() as conn:

        cur = conn.execute(
            """
            INSERT INTO meals(
                name,
                suggested_by,
                cost,
                prep_minutes,
                servings,
                selected,
                created_at
            )
            VALUES(
                ?,?,?,?,?,
                0,
                ?
            )
            """,
            (
                body.name,
                body.suggested_by,
                body.cost,
                body.prep_minutes,
                body.servings,
                now_iso()
            )
        )

        meal_id = cur.lastrowid

        for ingredient in body.ingredients:

            name = ingredient.strip()

            if name:

                conn.execute(
                    """
                    INSERT INTO meal_ingredients(
                        meal_id,
                        name
                    )
                    VALUES(?,?)
                    """,
                    (
                        meal_id,
                        name
                    )
                )

        meal = meal_dict(
            conn,
            conn.execute(
                """
                SELECT *
                FROM meals
                WHERE id=?
                """,
                (
                    meal_id,
                )
            ).fetchone()
        )

    await manager.broadcast(
        {
            "type":
                "meals_updated",
            "meal":
                meal
        }
    )

    return meal


@app.patch("/api/meals/{meal_id}")
async def patch_meal(
    meal_id: int,
    body: MealPatch
):

    with db() as conn:

        row = conn.execute(
            """
            SELECT *
            FROM meals
            WHERE id=?
            """,
            (
                meal_id,
            )
        ).fetchone()

        if not row:

            raise HTTPException(
                404,
                "Meal not found"
            )

        data = dict(row)

        changes = body.model_dump(
            exclude_none=True
        )

        ingredients = changes.pop(
            "ingredients",
            None
        )

        data.update(
            changes
        )

        conn.execute(
            """
            UPDATE meals
            SET
                name=?,
                suggested_by=?,
                cost=?,
                prep_minutes=?,
                servings=?
            WHERE id=?
            """,
            (
                data["name"],
                data["suggested_by"],
                data["cost"],
                data["prep_minutes"],
                data["servings"],
                meal_id
            )
        )

        if ingredients is not None:

            conn.execute(
                """
                DELETE FROM meal_ingredients
                WHERE meal_id=?
                """,
                (
                    meal_id,
                )
            )

            for ingredient in ingredients:

                name = ingredient.strip()

                if name:

                    conn.execute(
                        """
                        INSERT INTO meal_ingredients(
                            meal_id,
                            name
                        )
                        VALUES(?,?)
                        """,
                        (
                            meal_id,
                            name
                        )
                    )

        meal = meal_dict(
            conn,
            conn.execute(
                """
                SELECT *
                FROM meals
                WHERE id=?
                """,
                (
                    meal_id,
                )
            ).fetchone()
        )

    await manager.broadcast(
        {
            "type":
                "meals_updated",
            "meal":
                meal
        }
    )

    return meal


@app.post("/api/meals/{meal_id}/select")
async def select_meal(
    meal_id: int
):

    with db() as conn:

        row = conn.execute(
            """
            SELECT *
            FROM meals
            WHERE id=?
            """,
            (
                meal_id,
            )
        ).fetchone()

        if not row:

            raise HTTPException(
                404,
                "Meal not found"
            )

        conn.execute(
            """
            UPDATE meals
            SET selected=0
            """
        )

        conn.execute(
            """
            UPDATE meals
            SET selected=1
            WHERE id=?
            """,
            (
                meal_id,
            )
        )

        meal = meal_dict(
            conn,
            conn.execute(
                """
                SELECT *
                FROM meals
                WHERE id=?
                """,
                (
                    meal_id,
                )
            ).fetchone()
        )

    await manager.broadcast(
        {
            "type":
                "meals_updated",
            "selected_meal":
                meal
        }
    )

    return meal


@app.delete("/api/meals/{meal_id}")
async def delete_meal(
    meal_id: int
):

    with db() as conn:

        conn.execute(
            """
            DELETE FROM meal_ingredients
            WHERE meal_id=?
            """,
            (
                meal_id,
            )
        )

        cur = conn.execute(
            """
            DELETE FROM meals
            WHERE id=?
            """,
            (
                meal_id,
            )
        )

        if cur.rowcount == 0:

            raise HTTPException(
                404,
                "Meal not found"
            )

    await manager.broadcast(
        {
            "type":
                "meals_updated",
            "deleted_id":
                meal_id
        }
    )

    return {
        "ok": True
    }


@app.post("/api/meals/{meal_id}/add-to-list")
async def meal_to_list(
    meal_id: int
):

    with db() as conn:

        meal_row = conn.execute(
            """
            SELECT *
            FROM meals
            WHERE id=?
            """,
            (
                meal_id,
            )
        ).fetchone()

        if not meal_row:

            raise HTTPException(
                404,
                "Meal not found"
            )

        ingredients = [
            r["name"]
            for r in conn.execute(
                """
                SELECT name
                FROM meal_ingredients
                WHERE meal_id=?
                """,
                (
                    meal_id,
                )
            ).fetchall()
        ]

        inventory_names = {
            r["name"]
            .strip()
            .lower()

            for r in conn.execute(
                """
                SELECT name
                FROM inventory_items
                """
            ).fetchall()
        }

        existing_needed = {
            r["name"]
            .strip()
            .lower()

            for r in conn.execute(
                """
                SELECT name
                FROM shopping_items
                WHERE status='needed'
                """
            ).fetchall()
        }

        added = []

        for ingredient in ingredients:

            key = (
                ingredient
                .strip()
                .lower()
            )

            if (
                not key
                or key in inventory_names
                or key in existing_needed
            ):

                continue

            cur = conn.execute(
                """
                INSERT INTO shopping_items(
                    name,
                    quantity,
                    added_by,
                    status,
                    created_at
                )
                VALUES(
                    ?,
                    1,
                    'Recipe',
                    'needed',
                    ?
                )
                """,
                (
                    ingredient.strip(),
                    now_iso()
                )
            )

            added.append(
                dict(
                    conn.execute(
                        """
                        SELECT *
                        FROM shopping_items
                        WHERE id=?
                        """,
                        (
                            cur.lastrowid,
                        )
                    ).fetchone()
                )
            )

    await manager.broadcast(
        {
            "type":
                "list_updated",
            "added":
                added
        }
    )

    return {
        "ok":
            True,
        "added":
            added
    }


# ---------------------------------------------------------
# HOUSEHOLD REQUESTS
# ---------------------------------------------------------

@app.get("/api/requests")
def requests():

    with db() as conn:

        return [
            dict(r)

            for r in conn.execute(
                """
                SELECT *
                FROM household_requests
                ORDER BY id DESC
                """
            ).fetchall()
        ]


@app.post("/api/requests")
async def create_request(
    body: RequestCreate
):

    with db() as conn:

        cur = conn.execute(
            """
            INSERT INTO household_requests(
                person,
                message,
                created_at
            )
            VALUES(?,?,?)
            """,
            (
                body.person,
                body.message,
                now_iso()
            )
        )

        item = dict(
            conn.execute(
                """
                SELECT *
                FROM household_requests
                WHERE id=?
                """,
                (
                    cur.lastrowid,
                )
            ).fetchone()
        )

    await manager.broadcast(
        {
            "type":
                "requests_updated",
            "request":
                item
        }
    )

    return item


@app.patch("/api/requests/{request_id}")
async def patch_request(
    request_id: int,
    body: RequestPatch
):

    with db() as conn:

        row = conn.execute(
            """
            SELECT *
            FROM household_requests
            WHERE id=?
            """,
            (
                request_id,
            )
        ).fetchone()

        if not row:

            raise HTTPException(
                404,
                "Request not found"
            )

        data = dict(row)

        data.update(
            body.model_dump(
                exclude_none=True
            )
        )

        conn.execute(
            """
            UPDATE household_requests
            SET
                person=?,
                message=?
            WHERE id=?
            """,
            (
                data["person"],
                data["message"],
                request_id
            )
        )

        item = dict(
            conn.execute(
                """
                SELECT *
                FROM household_requests
                WHERE id=?
                """,
                (
                    request_id,
                )
            ).fetchone()
        )

    await manager.broadcast(
        {
            "type":
                "requests_updated",
            "request":
                item
        }
    )

    return item


@app.delete("/api/requests/{request_id}")
async def delete_request(
    request_id: int
):

    with db() as conn:

        cur = conn.execute(
            """
            DELETE FROM household_requests
            WHERE id=?
            """,
            (
                request_id,
            )
        )

        if cur.rowcount == 0:

            raise HTTPException(
                404,
                "Request not found"
            )

    await manager.broadcast(
        {
            "type":
                "requests_updated",
            "deleted_id":
                request_id
        }
    )

    return {
        "ok": True
    }


# ---------------------------------------------------------
# ALREADY AT HOME
# ---------------------------------------------------------

@app.get("/api/inventory")
def inventory():

    with db() as conn:

        return [
            dict(r)

            for r in conn.execute(
                """
                SELECT *
                FROM inventory_items
                ORDER BY id DESC
                """
            ).fetchall()
        ]


@app.post("/api/inventory")
async def create_inventory(
    body: InventoryCreate
):

    with db() as conn:

        cur = conn.execute(
            """
            INSERT INTO inventory_items(
                name,
                quantity,
                note,
                updated_by,
                created_at
            )
            VALUES(?,?,?,?,?)
            """,
            (
                body.name,
                body.quantity,
                body.note,
                body.updated_by,
                now_iso()
            )
        )

        item = dict(
            conn.execute(
                """
                SELECT *
                FROM inventory_items
                WHERE id=?
                """,
                (
                    cur.lastrowid,
                )
            ).fetchone()
        )

    await manager.broadcast(
        {
            "type":
                "inventory_updated",
            "item":
                item
        }
    )

    return item


@app.patch("/api/inventory/{item_id}")
async def patch_inventory(
    item_id: int,
    body: InventoryPatch
):

    with db() as conn:

        row = conn.execute(
            """
            SELECT *
            FROM inventory_items
            WHERE id=?
            """,
            (
                item_id,
            )
        ).fetchone()

        if not row:

            raise HTTPException(
                404,
                "Inventory item not found"
            )

        data = dict(row)

        data.update(
            body.model_dump(
                exclude_none=True
            )
        )

        conn.execute(
            """
            UPDATE inventory_items
            SET
                name=?,
                quantity=?,
                note=?,
                updated_by=?
            WHERE id=?
            """,
            (
                data["name"],
                data["quantity"],
                data["note"],
                data["updated_by"],
                item_id
            )
        )

        item = dict(
            conn.execute(
                """
                SELECT *
                FROM inventory_items
                WHERE id=?
                """,
                (
                    item_id,
                )
            ).fetchone()
        )

    await manager.broadcast(
        {
            "type":
                "inventory_updated",
            "item":
                item
        }
    )

    return item


@app.delete("/api/inventory/{item_id}")
async def delete_inventory(
    item_id: int
):

    with db() as conn:

        cur = conn.execute(
            """
            DELETE FROM inventory_items
            WHERE id=?
            """,
            (
                item_id,
            )
        )

        if cur.rowcount == 0:

            raise HTTPException(
                404,
                "Inventory item not found"
            )

    await manager.broadcast(
        {
            "type":
                "inventory_updated",
            "deleted_id":
                item_id
        }
    )

    return {
        "ok": True
    }


# ---------------------------------------------------------
# WEBSOCKET
# ---------------------------------------------------------

@app.websocket("/ws")
async def websocket_endpoint(
    ws: WebSocket
):

    await manager.connect(ws)

    try:

        while True:

            await ws.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(ws)

    except Exception:

        manager.disconnect(ws)