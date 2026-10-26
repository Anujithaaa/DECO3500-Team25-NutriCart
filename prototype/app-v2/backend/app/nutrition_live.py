
'''Barcode-driven real nutrition for NutriCart. Open Food Facts primary, cached offline fallback.

No inferred / generated macro values. Local cache is invisible to the user.
'''
from __future__ import annotations

import json
import re
from datetime import datetime, timezone, timedelta
from typing import Any

import httpx
from fastapi import HTTPException

V3_URL = 'https://world.openfoodfacts.org/api/v3/product'
V2_URL = 'https://world.openfoodfacts.org/api/v2/product'
FIELDS = ','.join((
    'code','product_name','product_name_en','brands','quantity','categories',
    'categories_tags','image_front_small_url','image_front_url','nutriments',
    'ingredients_text','allergens_tags','nutriscore_grade','nutrition_grades',
    'nova_group','serving_size'
))
CACHE_DAYS = 14


def numeric(value):
    if value is None or isinstance(value, bool):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if number != number or number in (float('inf'), float('-inf')):
        return None
    return round(number, 3)


def normalize(barcode: str, product: dict[str, Any]):
    n = product.get('nutriments') or {}
    energy_kj = numeric(n.get('energy-kj_100g'))
    energy_kcal = numeric(n.get('energy-kcal_100g'))
    if energy_kj is None and energy_kcal is not None:
        energy_kj = round(energy_kcal * 4.184, 1)
    if energy_kcal is None and energy_kj is not None:
        energy_kcal = round(energy_kj / 4.184, 1)
    tags = product.get('categories_tags') or []
    category = product.get('categories') or (tags[0].split(':')[-1].replace('-', ' ') if tags else None)
    raw_allergens = product.get('allergens_tags') or []
    allergens = [str(v).split(':')[-1].replace('-', ' ') for v in raw_allergens]
    name = (product.get('product_name') or product.get('product_name_en') or '').strip()
    if not name:
        return None
    return {
        'barcode': barcode,
        'name': name,
        'brand': product.get('brands') or None,
        'quantity': product.get('quantity') or None,
        'category': category,
        'image_url': product.get('image_front_url') or product.get('image_front_small_url'),
        'source': 'Open Food Facts',
        'source_url': 'https://world.openfoodfacts.org/product/' + barcode,
        'nutrition': {
            'energy_kj_100g': energy_kj,
            'energy_kcal_100g': energy_kcal,
            'protein_100g': numeric(n.get('proteins_100g')),
            'carbohydrates_100g': numeric(n.get('carbohydrates_100g')),
            'fat_100g': numeric(n.get('fat_100g')),
            'saturated_fat_100g': numeric(n.get('saturated-fat_100g')),
            'sugars_100g': numeric(n.get('sugars_100g')),
            'fiber_100g': numeric(n.get('fiber_100g')),
            'salt_100g': numeric(n.get('salt_100g')),
            'sodium_100g': numeric(n.get('sodium_100g')),
        },
        'ingredients_text': product.get('ingredients_text') or '',
        'allergens': allergens,
        'nutriscore_grade': product.get('nutriscore_grade') or product.get('nutrition_grades'),
        'nova_group': product.get('nova_group'),
        'serving_size': product.get('serving_size'),
        'prices': [],
    }


def add_source_data(product):
    '''Expose attribution for old cached products too.'''
    if not product:
        return None
    p = dict(product)
    if p.get('source') == 'Open Food Facts':
        p['source_url'] = 'https://world.openfoodfacts.org/product/' + str(p['barcode'])
        extra = (p.get('nutrition') or {}).get('_source_details') or {}
        if isinstance(extra, dict):
            p.update(extra)
    return p


def freshness(local):
    if not local or local.get('source') != 'Open Food Facts':
        return False
    try:
        when = datetime.fromisoformat(str(local.get('updated_at', '')).replace('Z', '+00:00'))
        if when.tzinfo is None:
            when = when.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) - when < timedelta(days=CACHE_DAYS)
    except (ValueError, TypeError):
        return False


async def live_lookup(*, barcode, db, get_local_product, now_iso, user_agent):
    barcode = str(barcode).strip()
    if not re.fullmatch(r'\d{8,14}', barcode):
        raise HTTPException(400, 'Enter a valid 8–14 digit EAN, UPC or product barcode')

    local = get_local_product(barcode)
    # Only products with an external source or manually verified fields may
    # be used as authoritative. Ignore seeded demonstration products.
    if local and local.get('source') == 'manual':
        return add_source_data(local)
    if freshness(local):
        return add_source_data(local)

    fetched = None
    async with httpx.AsyncClient(timeout=8, follow_redirects=True,
                                 headers={'User-Agent': user_agent}) as client:
        for api_url in (V3_URL, V2_URL):
            try:
                response = await client.get(f'{api_url}/{barcode}', params={'fields': FIELDS, 'lc':'en', 'cc':'au'})
                if response.status_code != 200:
                    continue
                data = response.json()
                raw = data.get('product')
                if raw and isinstance(raw, dict):
                    fetched = normalize(barcode, raw)
                    if fetched:
                        break
            except (httpx.HTTPError, ValueError):
                continue

    if fetched:
        # Persist a transparent cache, not a manually managed product library.
        with db() as conn:
            saved_nutrition = dict(fetched['nutrition'])
            saved_nutrition['_source_details'] = {
                k: fetched.get(k) for k in (
                    'ingredients_text', 'allergens', 'nutriscore_grade',
                    'nova_group', 'serving_size'
                )
            }
            conn.execute('''
                INSERT INTO products(barcode,name,brand,quantity,category,image_url,
                                     nutrition_json,source,updated_at)
                VALUES(?,?,?,?,?,?,?,?,?)
                ON CONFLICT(barcode) DO UPDATE SET
                    name=excluded.name, brand=excluded.brand,
                    quantity=excluded.quantity,category=excluded.category,
                    image_url=excluded.image_url,
                    nutrition_json=excluded.nutrition_json,
                    source=excluded.source,updated_at=excluded.updated_at
            ''', (barcode, fetched['name'], fetched['brand'], fetched['quantity'],
                  fetched['category'], fetched['image_url'],
                  json.dumps(saved_nutrition), fetched['source'], now_iso()))
        return fetched

    if local and local.get('source') == 'Open Food Facts':
        result = add_source_data(local)
        result['cached_offline'] = True
        return result

    return {
        'barcode': barcode, 'name': 'Unknown product', 'brand': None,
        'quantity': None, 'category': None, 'image_url': None,
        'nutrition': {}, 'source': 'unmatched', 'prices': [],
    }
