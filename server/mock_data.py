"""
Data access for the Factory Inventory Management System.
Data lives in a SQLite database (see db.py) that is created and seeded from the
JSON files in data/ on first start. This module reads the tables into the lists
and dicts the API endpoints filter in memory.
"""

import db

db.init_db()

inventory_items = db.fetch_all('inventory')
orders = db.fetch_all('orders')
demand_forecasts = db.fetch_all('demand_forecasts')
backlog_items = db.fetch_all('backlog_items')
purchase_orders = db.fetch_all('purchase_orders')
shipments = db.fetch_all('shipments')

# Spending data
spending_summary = db.fetch_all('spending_summary')[0]
monthly_spending = db.fetch_all('monthly_spending')
category_spending = db.fetch_all('category_spending')
recent_transactions = db.fetch_all('transactions')
