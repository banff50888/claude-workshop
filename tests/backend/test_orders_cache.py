"""
Tests for the SQLite-backed orders endpoints and the optional Redis cache.
A fake Redis client is used, so no Redis server is needed.
"""
import fnmatch

import pytest

import cache
import db
import main
from mock_data import orders as all_orders


class FakeRedis:
    """Minimal in-memory stand-in for the redis client methods cache.py uses."""

    def __init__(self, fail=False):
        self.store = {}
        self.fail = fail
        self.setex_calls = []

    def _check(self):
        if self.fail:
            raise ConnectionError("redis is down")

    def ping(self):
        self._check()
        return True

    def get(self, key):
        self._check()
        return self.store.get(key)

    def setex(self, key, ttl, value):
        self._check()
        self.setex_calls.append((key, ttl))
        self.store[key] = value

    def scan_iter(self, match="*"):
        self._check()
        return [k for k in list(self.store) if fnmatch.fnmatch(k, match)]

    def delete(self, key):
        self._check()
        return 1 if self.store.pop(key, None) is not None else 0

    def ttl(self, key):
        self._check()
        return 60 if key in self.store else -2


@pytest.fixture
def fake_redis():
    client = FakeRedis()
    cache.set_client(client)
    yield client
    cache.set_client(None)


@pytest.fixture
def no_cache(monkeypatch):
    """Run with the cache switched off, so only SQLite is exercised."""
    monkeypatch.setattr(cache, "CACHE_ENABLED", False)
    cache.set_client(None)


@pytest.fixture
def query_counter(monkeypatch):
    """Count how many times the orders endpoint goes to SQLite."""
    calls = []
    real = db.query_orders

    def counting(*args, **kwargs):
        calls.append((args, kwargs))
        return real(*args, **kwargs)

    monkeypatch.setattr(db, "query_orders", counting)
    return calls


class TestOrdersFromSqlite:
    """The SQL queries must return exactly what the old in-memory filters did."""

    @pytest.mark.parametrize("query", [
        "",
        "?warehouse=Tokyo",
        "?category=sensors",
        "?status=delivered",
        "?month=2025-03",
        "?month=Q2-2025",
        "?month=Q9-2025",
        "?month=all&warehouse=all",
        "?warehouse=London&category=Power Supplies&status=Shipped&month=Q3-2025",
        "?warehouse=Atlantis",
    ])
    def test_matches_in_memory_filtering(self, client, no_cache, query):
        params = dict(p.split("=") for p in query.lstrip("?").split("&") if p)
        expected = main.apply_filters(
            all_orders, params.get("warehouse"), params.get("category"), params.get("status")
        )
        expected = main.filter_by_month(expected, params.get("month"))

        response = client.get(f"/api/orders{query}")
        assert response.status_code == 200
        assert response.json() == expected

    def test_get_order_by_id_matches_first_in_memory_match(self, client, no_cache):
        # Some ids repeat in the sample data; the first one must win
        for order_id in ("1", "10", "250"):
            expected = next(o for o in all_orders if o["id"] == order_id)
            response = client.get(f"/api/orders/{order_id}")
            assert response.status_code == 200
            assert response.json() == expected

    def test_get_nonexistent_order(self, client, no_cache):
        response = client.get("/api/orders/nonexistent-order-999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestOrdersCache:
    """Test suite for the Redis cache in front of the orders endpoints."""

    def test_second_request_is_served_from_cache(self, client, fake_redis, query_counter):
        first = client.get("/api/orders?warehouse=Tokyo")
        second = client.get("/api/orders?warehouse=Tokyo")

        assert first.status_code == second.status_code == 200
        assert first.json() == second.json()
        assert len(query_counter) == 1
        assert len(fake_redis.store) == 1

    def test_different_filters_use_different_keys(self, client, fake_redis, query_counter):
        client.get("/api/orders?warehouse=Tokyo")
        client.get("/api/orders?warehouse=London")

        assert len(query_counter) == 2
        assert len(fake_redis.store) == 2

    def test_all_and_missing_filters_share_a_key(self, client, fake_redis, query_counter):
        client.get("/api/orders")
        client.get("/api/orders?warehouse=all&category=all&status=all&month=all")

        assert len(query_counter) == 1

    def test_entries_are_stored_with_a_ttl(self, client, fake_redis):
        client.get("/api/orders")

        assert fake_redis.setex_calls
        key, ttl = fake_redis.setex_calls[0]
        assert key.startswith(cache.KEY_PREFIX + "orders:")
        assert ttl == cache.CACHE_TTL

    def test_single_order_is_cached(self, client, fake_redis, monkeypatch):
        calls = []
        real = db.get_order
        monkeypatch.setattr(db, "get_order", lambda oid: calls.append(oid) or real(oid))

        first = client.get("/api/orders/5")
        second = client.get("/api/orders/5")

        assert first.json() == second.json()
        assert calls == ["5"]

    def test_empty_result_is_cached(self, client, fake_redis, query_counter):
        client.get("/api/orders?warehouse=Atlantis")
        response = client.get("/api/orders?warehouse=Atlantis")

        assert response.json() == []
        assert len(query_counter) == 1

    def test_delete_prefix_clears_cached_orders(self, client, fake_redis, query_counter):
        client.get("/api/orders")
        cache.delete_prefix("orders:")
        client.get("/api/orders")

        assert len(query_counter) == 2


class TestCacheFallback:
    """The API must keep working when Redis is missing or fails."""

    def test_works_when_redis_is_down(self, client, query_counter):
        cache.set_client(FakeRedis(fail=True))
        try:
            first = client.get("/api/orders?warehouse=Tokyo")
            second = client.get("/api/orders?warehouse=Tokyo")
        finally:
            cache.set_client(None)

        assert first.status_code == second.status_code == 200
        assert first.json() == second.json()
        assert len(first.json()) > 0

    def test_cache_disabled_never_calls_redis(self, client, monkeypatch):
        spy = FakeRedis()
        monkeypatch.setattr(cache, "CACHE_ENABLED", False)
        cache.set_client(spy)
        try:
            response = client.get("/api/orders")
        finally:
            cache.set_client(None)

        assert response.status_code == 200
        assert spy.store == {}


class TestOrdersCacheEndpoints:
    """Test suite for the endpoints that list and clear the orders cache."""

    def test_list_empty_cache(self, client, fake_redis):
        response = client.get("/api/cache/orders")
        assert response.status_code == 200

        data = response.json()
        assert data == {"available": True, "count": 0, "entries": []}

    def test_list_shows_cached_orders(self, client, fake_redis):
        client.get("/api/orders?warehouse=Tokyo")
        client.get("/api/orders/5")

        data = client.get("/api/cache/orders").json()
        assert data["available"] is True
        assert data["count"] == 2
        keys = [e["key"] for e in data["entries"]]
        assert "order:5" in keys
        assert any(k.startswith("orders:") and "Tokyo" in k for k in keys)
        for entry in data["entries"]:
            assert isinstance(entry["ttl_seconds"], int)

    def test_list_ignores_non_order_keys(self, client, fake_redis):
        fake_redis.store[cache.KEY_PREFIX + "inventory:all"] = "[]"
        client.get("/api/orders")

        data = client.get("/api/cache/orders").json()
        assert all(e["key"].startswith("order") for e in data["entries"])

    def test_clear_removes_cached_orders(self, client, fake_redis, query_counter):
        client.get("/api/orders?warehouse=Tokyo")
        client.get("/api/orders/5")
        fake_redis.store[cache.KEY_PREFIX + "inventory:all"] = "[]"

        response = client.delete("/api/cache/orders")
        assert response.status_code == 200
        assert response.json() == {"available": True, "deleted": 2}

        assert client.get("/api/cache/orders").json()["count"] == 0
        assert cache.KEY_PREFIX + "inventory:all" in fake_redis.store

        client.get("/api/orders?warehouse=Tokyo")
        assert len(query_counter) == 2

    def test_clear_empty_cache(self, client, fake_redis):
        response = client.delete("/api/cache/orders")
        assert response.status_code == 200
        assert response.json()["deleted"] == 0

    def test_endpoints_report_unavailable_redis(self, client, no_cache):
        listed = client.get("/api/cache/orders")
        assert listed.status_code == 200
        assert listed.json() == {"available": False, "count": 0, "entries": []}

        cleared = client.delete("/api/cache/orders")
        assert cleared.status_code == 200
        assert cleared.json() == {"available": False, "deleted": 0}

    def test_endpoints_survive_redis_failure(self, client):
        cache.set_client(FakeRedis(fail=True))
        try:
            assert client.get("/api/cache/orders").status_code == 200
            assert client.delete("/api/cache/orders").status_code == 200
        finally:
            cache.set_client(None)
