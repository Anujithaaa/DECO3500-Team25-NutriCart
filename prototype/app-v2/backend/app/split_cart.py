"""NutriCart v2: shared two-phone split, list clearing and shop completion.

Imported by backend/app/main.py through create_cart_router(DB_PATH, manager.broadcast).
"""
import json
import sqlite3
import time

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

CONFIRM_SECONDS = 20

class Phone(BaseModel):
    device_id: str = Field(min_length=8, max_length=120)

class Pair(Phone):
    role: str


def create_cart_router(db_path, broadcast):
    router = APIRouter()

    def connect():
        conn = sqlite3.connect(str(db_path), timeout=10)
        conn.row_factory = sqlite3.Row
        conn.execute('PRAGMA busy_timeout = 10000')
        conn.executescript('''
            CREATE TABLE IF NOT EXISTS cart_split_session (
                id INTEGER PRIMARY KEY CHECK(id=1),
                mode TEXT NOT NULL DEFAULT 'idle',
                primary_id TEXT,
                secondary_id TEXT,
                primary_confirmed REAL,
                secondary_confirmed REAL
            );
            CREATE TABLE IF NOT EXISTS cart_split_assignments (
                item_id INTEGER PRIMARY KEY,
                role TEXT NOT NULL
            );
            INSERT OR IGNORE INTO cart_split_session(id, mode)
            VALUES(1, 'idle');
        ''')
        return conn

    def session(conn):
        return dict(conn.execute('SELECT * FROM cart_split_session WHERE id=1').fetchone())

    def role_for(s, device_id):
        if s['primary_id'] == device_id:
            return 'primary'
        if s['secondary_id'] == device_id:
            return 'secondary'
        return None

    def require_member(s, device_id):
        role = role_for(s, device_id)
        if not role:
            raise HTTPException(403, 'Phone is not part of this pair')
        return role

    def assign_items(conn, s):
        if s['mode'] != 'split':
            return
        known = {r['item_id'] for r in conn.execute('SELECT item_id FROM cart_split_assignments')}
        count = len(known)
        for row in conn.execute("SELECT id FROM shopping_items WHERE status IN ('needed', 'bought') ORDER BY id"):
            if row['id'] not in known:
                role = 'primary' if count % 2 == 0 else 'secondary'
                conn.execute('INSERT INTO cart_split_assignments(item_id, role) VALUES(?, ?)', (row['id'], role))
                count += 1
        conn.execute('DELETE FROM cart_split_assignments WHERE item_id NOT IN (SELECT id FROM shopping_items)')

    def snapshot(conn):
        s = session(conn)
        assign_items(conn, s)
        now = time.time()
        a, b = s['primary_confirmed'], s['secondary_confirmed']
        a_ok = a is not None and 0 <= now - a <= CONFIRM_SECONDS
        b_ok = b is not None and 0 <= now - b <= CONFIRM_SECONDS
        pending = [v for v, ok in ((a, a_ok), (b, b_ok)) if ok]
        remaining = max(0, int(min(pending) + CONFIRM_SECONDS - now + .999)) if pending else 0
        items = []
        if s['mode'] == 'split':
            items = [dict(r) for r in conn.execute('''
                SELECT i.id, i.name, i.quantity, i.status, a.role
                FROM cart_split_assignments a
                JOIN shopping_items i ON a.item_id = i.id
                WHERE i.status IN ('needed', 'bought')
                ORDER BY i.id
            ''')]
        return {
            'mode': s['mode'],
            'primary_id': s['primary_id'],
            'secondary_id': s['secondary_id'],
            'items': items,
            'confirmation': {
                'primary': a_ok, 'secondary': b_ok,
                'seconds_left': remaining,
            },
            'confirm_window_seconds': CONFIRM_SECONDS,
        }

    async def tell(kind):
        await broadcast({'type': kind})

    @router.get('/api/split/state')
    def get_state():
        with connect() as conn:
            return snapshot(conn)

    @router.post('/api/split/pair')
    async def pair_phone(body: Pair):
        if body.role not in ('primary', 'secondary'):
            raise HTTPException(400, 'Invalid phone role')
        with connect() as conn:
            conn.execute('BEGIN IMMEDIATE')
            s = session(conn)
            if body.role == 'primary':
                if s['mode'] == 'idle':
                    conn.execute('''
                        UPDATE cart_split_session SET mode='waiting', primary_id=?,
                          secondary_id=NULL, primary_confirmed=NULL, secondary_confirmed=NULL
                        WHERE id=1
                    ''', (body.device_id,))
                elif s['primary_id'] != body.device_id:
                    raise HTTPException(409, 'A different main phone is already paired')
            else:
                if s['mode'] not in ('waiting', 'paired'):
                    raise HTTPException(409, 'Pair the main phone first')
                if body.device_id == s['primary_id']:
                    raise HTTPException(409, 'Second phone needs a different identity')
                if s['secondary_id'] not in (None, body.device_id):
                    raise HTTPException(409, 'A second phone is already paired')
                conn.execute("UPDATE cart_split_session SET mode='paired', secondary_id=? WHERE id=1", (body.device_id,))
            result = snapshot(conn)
        await tell('split_updated')
        return result

    @router.post('/api/split/start')
    async def start(body: Phone):
        with connect() as conn:
            conn.execute('BEGIN IMMEDIATE')
            s = session(conn)
            if s['mode'] != 'paired' or s['primary_id'] != body.device_id or not s['secondary_id']:
                raise HTTPException(409, 'Both phones must be paired before splitting')
            conn.execute('DELETE FROM cart_split_assignments')
            conn.execute("UPDATE cart_split_session SET mode='split', primary_confirmed=NULL, secondary_confirmed=NULL WHERE id=1")
            result = snapshot(conn)
        await tell('split_updated')
        return result

    @router.post('/api/split/items/{item_id}/toggle')
    async def toggle(item_id: int, body: Phone):
        with connect() as conn:
            conn.execute('BEGIN IMMEDIATE')
            s = session(conn)
            role = require_member(s, body.device_id)
            if s['mode'] != 'split':
                raise HTTPException(409, 'Not currently split')
            assign_items(conn, s)
            row = conn.execute('''
                SELECT a.role, i.status FROM cart_split_assignments a
                JOIN shopping_items i ON i.id=a.item_id WHERE a.item_id=?
            ''', (item_id,)).fetchone()
            if not row or row['role'] != role or row['status'] not in ('needed','bought'):
                raise HTTPException(403, 'This item belongs to the other shopper')
            new_status = 'bought' if row['status'] == 'needed' else 'needed'
            conn.execute('UPDATE shopping_items SET status=? WHERE id=?', (new_status, item_id))
            result = snapshot(conn)
        await tell('list_updated')
        return result

    @router.post('/api/split/items/{item_id}/transfer')
    async def transfer(item_id: int, body: Phone):
        with connect() as conn:
            conn.execute('BEGIN IMMEDIATE')
            s = session(conn)
            role = require_member(s, body.device_id)
            if s['mode'] != 'split':
                raise HTTPException(409, 'Not currently split')
            assign_items(conn, s)
            row = conn.execute('''
                SELECT a.role, i.status FROM cart_split_assignments a
                JOIN shopping_items i ON i.id=a.item_id WHERE a.item_id=?
            ''', (item_id,)).fetchone()
            if not row or row['role'] != role or row['status'] != 'needed':
                raise HTTPException(403, 'Only your uncollected items may be transferred')
            other = 'secondary' if role == 'primary' else 'primary'
            conn.execute('UPDATE cart_split_assignments SET role=? WHERE item_id=?', (other, item_id))
            result = snapshot(conn)
        await tell('split_updated')
        return result

    @router.post('/api/split/end-confirm')
    async def end_confirm(body: Phone):
        with connect() as conn:
            conn.execute('BEGIN IMMEDIATE')
            s = session(conn)
            role = require_member(s, body.device_id)
            if s['mode'] != 'split':
                raise HTTPException(409, 'Not currently split')
            now = time.time()
            a, b = s['primary_confirmed'], s['secondary_confirmed']
            if a is not None and now - a > CONFIRM_SECONDS: a = None
            if b is not None and now - b > CONFIRM_SECONDS: b = None
            if role == 'primary': a = now
            else: b = now
            if a is not None and b is not None and abs(a - b) <= CONFIRM_SECONDS:
                conn.execute("UPDATE cart_split_session SET mode='paired',primary_confirmed=NULL,secondary_confirmed=NULL WHERE id=1")
                conn.execute('DELETE FROM cart_split_assignments')
            else:
                conn.execute('UPDATE cart_split_session SET primary_confirmed=?, secondary_confirmed=? WHERE id=1', (a,b))
            result = snapshot(conn)
        await tell('split_updated')
        return result

    @router.post('/api/split/reset')
    async def reset(body: Phone):
        with connect() as conn:
            conn.execute('BEGIN IMMEDIATE')
            s = session(conn)
            if s['primary_id'] != body.device_id:
                raise HTTPException(403, 'Only main phone can unpair')
            if s['mode'] == 'split':
                raise HTTPException(409, 'Both shoppers must end the split first')
            conn.execute("UPDATE cart_split_session SET mode='idle',primary_id=NULL,secondary_id=NULL,primary_confirmed=NULL,secondary_confirmed=NULL WHERE id=1")
            conn.execute('DELETE FROM cart_split_assignments')
            result = snapshot(conn)
        await tell('split_updated')
        return result

    @router.post('/api/cart/clear-list')
    async def clear_list():
        """Clear both needed and bought shopping items, not the products catalogue."""
        with connect() as conn:
            conn.execute('BEGIN IMMEDIATE')
            if session(conn)['mode'] == 'split':
                raise HTTPException(409, 'End Split Shop before clearing the list')
            count = conn.execute('SELECT COUNT(*) FROM shopping_items').fetchone()[0]
            conn.execute('DELETE FROM shopping_items')
            conn.execute('DELETE FROM cart_split_assignments')
        await tell('list_updated')
        return {'ok': True, 'removed': count}

    @router.post('/api/cart/finish')
    async def finish():
        """Put both units into idle until Start Shopping is pressed at Home Hub."""
        with connect() as conn:
            conn.execute('BEGIN IMMEDIATE')
            if session(conn)['mode'] == 'split':
                raise HTTPException(409, 'End Split Shop on both phones first')
            conn.execute('''
                INSERT INTO hub_settings(key,value_json) VALUES('shopping_active', ?)
                ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json
            ''', (json.dumps(False),))
        await tell('settings_updated')
        return {'ok': True, 'shopping_active': False}

    return router
