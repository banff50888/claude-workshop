"""
Optional Redis cache for the Factory Inventory Management System.

The cache is best effort: if Redis is not installed, not running, or fails
mid-request, every function here quietly does nothing and the API falls back to
querying SQLite. After a failure the connection is retried every
RETRY_SECONDS, not on every request.

Environment variables:
    REDIS_URL           connection URL (default redis://localhost:6379/0)
    CACHE_TTL_SECONDS   lifetime of a cached entry (default 60)
    CACHE_ENABLED       set to 0 to turn the cache off
"""

import json
import logging
import os
import time

logger = logging.getLogger(__name__)

REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CACHE_TTL = int(os.environ.get('CACHE_TTL_SECONDS', '60'))
CACHE_ENABLED = os.environ.get('CACHE_ENABLED', '1') != '0'
KEY_PREFIX = 'factory:'
RETRY_SECONDS = 30

_client = None
_retry_at = 0.0


def set_client(client):
    """Use a specific client (or None to reset). Intended for tests."""
    global _client, _retry_at
    _client = client
    _retry_at = 0.0


def _disable(reason):
    global _client, _retry_at
    if _client is not None or _retry_at == 0.0:
        logger.warning('Redis cache unavailable (%s); serving from SQLite', reason)
    _client = None
    _retry_at = time.monotonic() + RETRY_SECONDS


def _get_client():
    if not CACHE_ENABLED:
        return None
    if _client is not None:
        return _client
    if time.monotonic() < _retry_at:
        return None
    try:
        import redis
        client = redis.Redis.from_url(
            REDIS_URL, socket_connect_timeout=0.2, socket_timeout=0.2, decode_responses=True
        )
        client.ping()
    except Exception as exc:
        _disable(exc)
        return None
    set_client(client)
    logger.info('Redis cache connected at %s', REDIS_URL)
    return _client


def get_json(key):
    """Return the cached value for key, or None on a miss or any cache error."""
    client = _get_client()
    if client is None:
        return None
    try:
        raw = client.get(KEY_PREFIX + key)
    except Exception as exc:
        _disable(exc)
        return None
    return None if raw is None else json.loads(raw)


def set_json(key, value, ttl=None):
    """Cache a JSON-serializable value. Errors are swallowed."""
    client = _get_client()
    if client is None:
        return
    try:
        client.setex(KEY_PREFIX + key, ttl or CACHE_TTL, json.dumps(value))
    except Exception as exc:
        _disable(exc)


def is_available():
    """True if a Redis connection is currently usable."""
    return _get_client() is not None


def list_keys(prefix=''):
    """Return [{'key', 'ttl_seconds'}] for cached keys starting with prefix, sorted by key."""
    client = _get_client()
    if client is None:
        return []
    entries = []
    try:
        for full_key in client.scan_iter(match=f'{KEY_PREFIX}{prefix}*'):
            ttl = client.ttl(full_key)
            if ttl == -2:  # expired between the scan and the TTL lookup
                continue
            entries.append({'key': full_key[len(KEY_PREFIX):], 'ttl_seconds': None if ttl == -1 else ttl})
    except Exception as exc:
        _disable(exc)
        return []
    return sorted(entries, key=lambda e: e['key'])


def delete_prefix(prefix):
    """Delete every cached key that starts with prefix and return how many were removed."""
    client = _get_client()
    if client is None:
        return 0
    deleted = 0
    try:
        for key in client.scan_iter(match=f'{KEY_PREFIX}{prefix}*'):
            deleted += client.delete(key) or 0
    except Exception as exc:
        _disable(exc)
    return deleted
