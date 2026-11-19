"""
SQLite storage for the Factory Inventory Management System.

The database file is created and seeded from the JSON files in data/ the first
time the server starts. After that the data is read from SQLite. To rebuild the
database from the JSON files (for example after running generate_data.py), run:

    uv run python db.py --reset
"""

import json
import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.environ.get('FACTORY_DB_PATH', os.path.join(DATA_DIR, 'factory.db'))

# table -> (source JSON file, [(column, SQLite type)])
# `id` columns are not primary keys: orders.json repeats a few ids, so every
# table uses an autoincrement row_id to keep the original file order.
TABLES = {
    'inventory': ('inventory.json', [
        ('id', 'TEXT'), ('sku', 'TEXT'), ('name', 'TEXT'), ('category', 'TEXT'),
        ('warehouse', 'TEXT'), ('quantity_on_hand', 'INTEGER'), ('reorder_point', 'INTEGER'),
        ('unit_cost', 'REAL'), ('location', 'TEXT'), ('last_updated', 'TEXT'),
    ]),
    'orders': ('orders.json', [
        ('id', 'TEXT'), ('order_number', 'TEXT'), ('customer', 'TEXT'), ('items', 'TEXT'),
        ('status', 'TEXT'), ('warehouse', 'TEXT'), ('category', 'TEXT'), ('order_date', 'TEXT'),
        ('expected_delivery', 'TEXT'), ('total_value', 'REAL'), ('actual_delivery', 'TEXT'),
    ]),
    'shipments': ('shipments.json', [
        ('id', 'TEXT'), ('shipment_number', 'TEXT'), ('order_id', 'TEXT'), ('order_number', 'TEXT'),
        ('order_date', 'TEXT'), ('customer', 'TEXT'), ('carrier', 'TEXT'), ('tracking_number', 'TEXT'),
        ('status', 'TEXT'), ('warehouse', 'TEXT'), ('category', 'TEXT'), ('destination', 'TEXT'),
        ('packages', 'INTEGER'), ('weight_kg', 'REAL'), ('ship_date', 'TEXT'),
        ('estimated_delivery', 'TEXT'), ('actual_delivery', 'TEXT'),
    ]),
    'demand_forecasts': ('demand_forecasts.json', [
        ('id', 'TEXT'), ('item_sku', 'TEXT'), ('item_name', 'TEXT'), ('current_demand', 'INTEGER'),
        ('forecasted_demand', 'INTEGER'), ('trend', 'TEXT'), ('period', 'TEXT'),
    ]),
    'backlog_items': ('backlog_items.json', [
        ('id', 'TEXT'), ('order_id', 'TEXT'), ('item_sku', 'TEXT'), ('item_name', 'TEXT'),
        ('quantity_needed', 'INTEGER'), ('quantity_available', 'INTEGER'),
        ('days_delayed', 'INTEGER'), ('priority', 'TEXT'),
    ]),
    'purchase_orders': ('purchase_orders.json', [
        ('id', 'TEXT'), ('backlog_item_id', 'TEXT'), ('supplier_name', 'TEXT'), ('quantity', 'INTEGER'),
        ('unit_cost', 'REAL'), ('expected_delivery_date', 'TEXT'), ('status', 'TEXT'),
        ('created_date', 'TEXT'), ('notes', 'TEXT'),
    ]),
    'transactions': ('transactions.json', [
        ('id', 'TEXT'), ('date', 'TEXT'), ('description', 'TEXT'), ('category', 'TEXT'),
        ('warehouse', 'TEXT'), ('amount', 'REAL'), ('vendor', 'TEXT'), ('type', 'TEXT'),
    ]),
    'spending_summary': ('spending.json:spending_summary', [
        ('total_procurement_cost', 'REAL'), ('total_operational_cost', 'REAL'),
        ('total_labor_cost', 'REAL'), ('total_overhead', 'REAL'), ('procurement_change', 'REAL'),
        ('operational_change', 'REAL'), ('labor_change', 'REAL'), ('overhead_change', 'REAL'),
    ]),
    'monthly_spending': ('spending.json:monthly_spending', [
        ('month', 'TEXT'), ('procurement', 'REAL'), ('operational', 'REAL'),
        ('labor', 'REAL'), ('overhead', 'REAL'),
    ]),
    'category_spending': ('spending.json:category_spending', [
        ('category', 'TEXT'), ('amount', 'REAL'), ('percentage', 'REAL'), ('change', 'REAL'),
    ]),
}

# Columns holding nested JSON, stored as text
JSON_COLUMNS = {'orders': {'items'}}

# Lookup/filter columns worth indexing
INDEXES = {
    'inventory': ['warehouse', 'category'],
    'orders': ['id', 'warehouse', 'category', 'status', 'order_date'],
    'shipments': ['id', 'warehouse', 'category', 'status', 'order_date'],
}


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _load_source(source):
    """Load a table's rows from its JSON file ('file.json' or 'file.json:key')."""
    filename, _, key = source.partition(':')
    with open(os.path.join(DATA_DIR, filename), 'r') as f:
        data = json.load(f)
    if key:
        data = data[key]
    return data if isinstance(data, list) else [data]


def create_schema(conn):
    for table, (_, columns) in TABLES.items():
        cols = ', '.join(f'{name} {sqltype}' for name, sqltype in columns)
        conn.execute(f'CREATE TABLE IF NOT EXISTS {table} (row_id INTEGER PRIMARY KEY AUTOINCREMENT, {cols})')
        for col in INDEXES.get(table, []):
            conn.execute(f'CREATE INDEX IF NOT EXISTS idx_{table}_{col} ON {table}({col})')


def seed(conn):
    """Insert the JSON data into any table that is empty."""
    for table, (source, columns) in TABLES.items():
        if conn.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0]:
            continue
        names = [name for name, _ in columns]
        json_cols = JSON_COLUMNS.get(table, set())
        rows = [
            tuple(json.dumps(r.get(n)) if n in json_cols else r.get(n) for n in names)
            for r in _load_source(source)
        ]
        placeholders = ', '.join('?' for _ in names)
        conn.executemany(f'INSERT INTO {table} ({", ".join(names)}) VALUES ({placeholders})', rows)


def init_db(reset=False):
    """Create the database and seed it from the JSON files if needed."""
    if reset and os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    with connect() as conn:
        create_schema(conn)
        seed(conn)


def _select(table, where='', params=(), limit=None):
    """Run a SELECT on a table and return rows as dicts, in insertion order."""
    columns = [name for name, _ in TABLES[table][1]]
    json_cols = JSON_COLUMNS.get(table, set())
    sql = f'SELECT {", ".join(columns)} FROM {table}'
    if where:
        sql += f' WHERE {where}'
    sql += ' ORDER BY row_id'
    if limit:
        sql += f' LIMIT {int(limit)}'
    with connect() as conn:
        rows = conn.execute(sql, params).fetchall()
    return [
        {c: (json.loads(row[c]) if c in json_cols else row[c]) for c in columns}
        for row in rows
    ]


def fetch_all(table):
    """Return every row of a table as a list of dicts, in insertion order."""
    return _select(table)


def query_orders(warehouse=None, category=None, status=None, month_patterns=None):
    """Return orders matching the filters, queried from SQLite.

    Matching mirrors the API's in-memory filters: warehouse is an exact match,
    category and status are case-insensitive, and month_patterns is a list of
    strings of which an order_date must contain at least one. A falsy filter
    means "don't filter on this".
    """
    clauses, params = [], []
    if warehouse:
        clauses.append('warehouse = ?')
        params.append(warehouse)
    if category:
        clauses.append('LOWER(category) = LOWER(?)')
        params.append(category)
    if status:
        clauses.append('LOWER(status) = LOWER(?)')
        params.append(status)
    if month_patterns:
        clauses.append('(' + ' OR '.join('INSTR(order_date, ?) > 0' for _ in month_patterns) + ')')
        params.extend(month_patterns)
    return _select('orders', ' AND '.join(clauses), params)


def get_order(order_id):
    """Return the first order with this id (ids repeat in the sample data), or None."""
    rows = _select('orders', 'id = ?', (order_id,), limit=1)
    return rows[0] if rows else None


if __name__ == '__main__':
    import sys
    init_db(reset='--reset' in sys.argv)
    with connect() as conn:
        for table in TABLES:
            print(f'{table}: {conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]} rows')
    print(f'Database: {DB_PATH}')
