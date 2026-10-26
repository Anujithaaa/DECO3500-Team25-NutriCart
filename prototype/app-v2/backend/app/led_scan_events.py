import sqlite3
from pathlib import Path


def connect(path):
    db = sqlite3.connect(str(path), timeout=8)
    db.row_factory = sqlite3.Row
    db.execute("""CREATE TABLE IF NOT EXISTS scan_led_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode TEXT NOT NULL,
        result TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
    )""")
    return db


def recognised(product):
    name = str((product or {}).get('name') or '').strip().lower()
    source = str((product or {}).get('source') or '').strip().lower()
    return bool(name and name != 'unknown product'
                and source not in ('', 'unmatched'))


def record(path, barcode, product):
    colour = 'green' if recognised(product) else 'red'
    db = connect(path)
    try:
        db.execute('INSERT INTO scan_led_events(barcode,result) VALUES (?,?)',
                   (str(barcode), colour))
        db.execute('DELETE FROM scan_led_events WHERE id NOT IN '
                   '(SELECT id FROM scan_led_events ORDER BY id DESC LIMIT 100)')
        db.commit()
    finally:
        db.close()
    return colour


def latest(path):
    db = connect(path)
    try:
        item = db.execute('SELECT id, barcode, result FROM scan_led_events '
                          'ORDER BY id DESC LIMIT 1').fetchone()
        return dict(item) if item else {'id': 0, 'barcode': None, 'result': None}
    finally:
        db.close()
