<template>
  <div class="orders">
    <div class="page-header">
      <h2>{{ t('orders.title') }}</h2>
      <p>{{ t('orders.description') }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="stats-grid">
        <div class="stat-card success">
          <div class="stat-label">{{ t('status.delivered') }}</div>
          <div class="stat-value">{{ getOrdersByStatus('Delivered').length }}</div>
        </div>
        <div class="stat-card info">
          <div class="stat-label">{{ t('status.shipped') }}</div>
          <div class="stat-value">{{ getOrdersByStatus('Shipped').length }}</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">{{ t('status.processing') }}</div>
          <div class="stat-value">{{ getOrdersByStatus('Processing').length }}</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-label">{{ t('status.backordered') }}</div>
          <div class="stat-value">{{ getOrdersByStatus('Backordered').length }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('orders.allOrders') }} ({{ orders.length }})</h3>
        </div>
        <div class="table-container">
          <table class="orders-table">
            <thead>
              <tr>
                <th class="col-order-number">{{ t('orders.table.orderNumber') }}</th>
                <th class="col-customer">{{ t('orders.table.customer') }}</th>
                <th class="col-items">{{ t('orders.table.items') }}</th>
                <th class="col-status">{{ t('orders.table.status') }}</th>
                <th class="col-date">{{ t('orders.table.orderDate') }}</th>
                <th class="col-date">{{ t('orders.table.expectedDelivery') }}</th>
                <th class="col-value">{{ t('orders.table.totalValue') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td class="col-order-number"><strong>{{ order.order_number }}</strong></td>
                <td class="col-customer">{{ translateCustomerName(order.customer) }}</td>
                <td class="col-items">
                  <details class="items-details">
                    <summary class="items-summary">
                      {{ t('orders.itemsCount', { count: order.items.length }) }}
                    </summary>
                    <div class="items-dropdown">
                      <div v-for="(item, idx) in order.items" :key="idx" class="item-entry">
                        <span class="item-name">{{ translateProductName(item.name) }}</span>
                        <span class="item-meta">{{ t('orders.quantity') }}: {{ item.quantity }} @ {{ currencySymbol }}{{ item.unit_price }}</span>
                      </div>
                    </div>
                  </details>
                </td>
                <td class="col-status">
                  <span :class="['badge', getOrderStatusClass(order.status)]">
                    {{ t(`status.${order.status.toLowerCase()}`) }}
                  </span>
                </td>
                <td class="col-date">{{ formatDate(order.order_date) }}</td>
                <td class="col-date">{{ formatDate(order.expected_delivery) }}</td>
                <td class="col-value"><strong>{{ currencySymbol }}{{ order.total_value.toLocaleString() }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card cache-section">
      <div class="card-header cache-header">
        <div>
          <h3 class="card-title">{{ t('ordersCache.title') }}</h3>
          <p class="cache-desc">{{ t('ordersCache.description') }}</p>
        </div>
        <div class="cache-actions">
          <button type="button" class="cache-btn" :disabled="cacheListing || cacheClearing" @click="listCache">
            {{ cacheListing ? t('ordersCache.listing') : t('ordersCache.list') }}
          </button>
          <button
            v-if="!confirmingClear"
            type="button"
            class="cache-btn cache-btn-danger"
            :disabled="cacheListing || cacheClearing"
            @click="confirmingClear = true"
          >
            {{ cacheClearing ? t('ordersCache.clearing') : t('ordersCache.clear') }}
          </button>
          <template v-else>
            <span class="cache-confirm-text">{{ t('ordersCache.confirm') }}</span>
            <button type="button" class="cache-btn cache-btn-danger" :disabled="cacheClearing" @click="clearCache">
              {{ t('ordersCache.confirmYes') }}
            </button>
            <button type="button" class="cache-btn" :disabled="cacheClearing" @click="confirmingClear = false">
              {{ t('common.cancel') }}
            </button>
          </template>
        </div>
      </div>

      <div v-if="cacheMessage" :class="['cache-message', cacheMessage.type]" role="status">{{ cacheMessage.text }}</div>

      <div v-if="cacheLoaded && cacheAvailable">
        <div class="cache-count">{{ t('ordersCache.count', { count: cacheEntries.length }) }}</div>
        <div v-if="cacheEntries.length === 0" class="cache-empty">{{ t('ordersCache.empty') }}</div>
        <div v-else class="table-container">
          <table class="cache-table">
            <thead>
              <tr>
                <th>{{ t('ordersCache.entry') }}</th>
                <th class="cache-col-ttl">{{ t('ordersCache.expires') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in cacheEntries" :key="entry.key">
                <td :title="entry.key">{{ describeKey(entry.key) }}</td>
                <td class="cache-col-ttl">{{ entry.ttl_seconds == null ? t('ordersCache.noExpiry') : entry.ttl_seconds }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'

export default {
  name: 'Orders',
  setup() {
    const { t, currentCurrency, translateProductName, translateCustomerName } = useI18n()

    const currencySymbol = computed(() => {
      return ['JPY', 'CNY'].includes(currentCurrency.value) ? '¥' : '$'
    })
    const loading = ref(true)
    const error = ref(null)
    const orders = ref([])

    // Use shared filters
    const {
      selectedPeriod,
      selectedLocation,
      selectedCategory,
      selectedStatus,
      getCurrentFilters
    } = useFilters()

    const loadOrders = async () => {
      try {
        loading.value = true
        const filters = getCurrentFilters()
        const fetchedOrders = await api.getOrders(filters)

        // Sort orders by order_date (earliest first)
        orders.value = fetchedOrders.sort((a, b) => {
          const dateA = new Date(a.order_date)
          const dateB = new Date(b.order_date)
          return dateA - dateB
        })
      } catch (err) {
        error.value = 'Failed to load orders: ' + err.message
      } finally {
        loading.value = false
      }
    }

    // Watch for filter changes and reload data
    watch([selectedPeriod, selectedLocation, selectedCategory, selectedStatus], () => {
      loadOrders()
    })

    const getOrdersByStatus = (status) => {
      return orders.value.filter(order => order.status === status)
    }

    const getOrderStatusClass = (status) => {
      const statusMap = {
        'Delivered': 'success',
        'Shipped': 'info',
        'Processing': 'warning',
        'Backordered': 'danger'
      }
      return statusMap[status] || 'info'
    }

    const formatDate = (dateString) => {
      const { currentLocale } = useI18n()
      const locale = currentLocale.value === 'ja' ? 'ja-JP' : currentLocale.value === 'zh' ? 'zh-CN' : 'en-US'
      return new Date(dateString).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // Order cache section (independent of orders loading state)
    const cacheListing = ref(false)
    const cacheClearing = ref(false)
    const confirmingClear = ref(false)
    const cacheLoaded = ref(false)
    const cacheAvailable = ref(true)
    const cacheEntries = ref([])
    const cacheMessage = ref(null)

    const describeKey = (key) => {
      if (typeof key !== 'string') return String(key)
      if (key.startsWith('order:')) {
        return t('ordersCache.order', { id: key.slice(6) })
      }
      if (key.startsWith('orders:')) {
        try {
          const parsed = JSON.parse(key.slice(7))
          if (Array.isArray(parsed)) {
            const labels = ['warehouse', 'category', 'status', 'month']
            const parts = labels
              .map((label, i) => (parsed[i] != null ? `${t('ordersCache.' + label)}: ${parsed[i]}` : null))
              .filter(Boolean)
            return parts.length ? parts.join(', ') : t('ordersCache.allOrders')
          }
        } catch (e) {
          // fall through to raw key
        }
      }
      return key
    }

    const applyCacheResponse = (data) => {
      cacheAvailable.value = !!data.available
      cacheEntries.value = Array.isArray(data.entries) ? data.entries : []
      cacheLoaded.value = true
    }

    const fetchCache = async () => {
      const data = await api.getOrdersCache()
      applyCacheResponse(data)
      return data
    }

    const listCache = async () => {
      cacheListing.value = true
      confirmingClear.value = false
      cacheMessage.value = null
      try {
        const data = await fetchCache()
        if (!data.available) {
          cacheMessage.value = { type: 'warning', text: t('ordersCache.unavailable') }
        }
      } catch (err) {
        console.error('Cache list error:', err)
        cacheMessage.value = { type: 'danger', text: t('ordersCache.listError') }
      } finally {
        cacheListing.value = false
      }
    }

    const clearCache = async () => {
      cacheClearing.value = true
      confirmingClear.value = false
      cacheMessage.value = null
      try {
        const result = await api.clearOrdersCache()
        if (!result.available) {
          cacheAvailable.value = false
          cacheEntries.value = []
          cacheLoaded.value = true
          cacheMessage.value = { type: 'warning', text: t('ordersCache.unavailable') }
        } else {
          const message = { type: 'success', text: t('ordersCache.cleared', { count: result.deleted }) }
          try {
            await fetchCache()
          } catch (err) {
            console.error('Cache refresh error:', err)
          }
          cacheMessage.value = message
        }
      } catch (err) {
        console.error('Cache clear error:', err)
        cacheMessage.value = { type: 'danger', text: t('ordersCache.clearError') }
      } finally {
        cacheClearing.value = false
      }
    }

    onMounted(loadOrders)

    return {
      t,
      loading,
      error,
      orders,
      getOrdersByStatus,
      getOrderStatusClass,
      formatDate,
      currencySymbol,
      translateProductName,
      translateCustomerName,
      cacheListing,
      cacheClearing,
      confirmingClear,
      cacheLoaded,
      cacheAvailable,
      cacheEntries,
      cacheMessage,
      describeKey,
      listCache,
      clearCache
    }
  }
}
</script>

<style scoped>
/* Fixed table layout to prevent column shifting */
.orders-table {
  table-layout: fixed;
  width: 100%;
}

/* Column widths */
.col-order-number {
  width: 130px;
}

.col-customer {
  width: 180px;
}

.col-items {
  width: 200px;
}

.col-status {
  width: 130px;
}

.col-date {
  width: 140px;
}

.col-value {
  width: 120px;
}

/* Items details styling */
.items-details {
  position: relative;
}

.items-summary {
  cursor: pointer;
  color: var(--ac-3b82f6);
  font-weight: 500;
  list-style: none;
  user-select: none;
  display: inline-block;
}

.items-summary::-webkit-details-marker {
  display: none;
}

.items-summary::before {
  content: '▶';
  display: inline-block;
  margin-right: 0.375rem;
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.items-details[open] .items-summary::before {
  transform: rotate(90deg);
}

.items-summary:hover {
  color: var(--ac-2563eb);
  text-decoration: underline;
}

/* Dropdown container */
.items-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 0.75rem;
  z-index: 10;
  min-width: 300px;
  max-width: 400px;
}

.item-entry {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--surface-2);
}

.item-entry:last-child {
  border-bottom: none;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-strong);
}

.item-meta {
  font-size: 0.813rem;
  color: var(--text-muted);
}
/* Order cache section */
.cache-section {
  margin-top: 1.25rem;
}

.cache-header {
  flex-wrap: wrap;
  gap: 0.75rem;
}

.cache-desc {
  margin-top: 0.25rem;
  font-size: 0.813rem;
  color: var(--text-muted);
}

.cache-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.cache-btn {
  padding: 0.375rem 0.875rem;
  font-size: 0.813rem;
  font-weight: 600;
  font-family: inherit;
  color: var(--text-2);
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.cache-btn:hover:not(:disabled) {
  border-color: var(--ac-2563eb);
  color: var(--ac-2563eb);
}

.cache-btn-danger {
  color: var(--ac-dc2626);
}

.cache-btn-danger:hover:not(:disabled) {
  border-color: var(--ac-dc2626);
  color: var(--ac-dc2626);
}

.cache-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.cache-btn:focus-visible {
  outline: 2px solid var(--ac-2563eb);
  outline-offset: 2px;
}

.cache-confirm-text {
  font-size: 0.813rem;
  color: var(--text-3);
}

.cache-message {
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 500;
}

.cache-message.success {
  background: var(--tint-d1fae5);
  color: var(--ac-065f46);
}

.cache-message.warning {
  background: var(--tint-fed7aa);
  color: var(--ac-92400e);
}

.cache-message.danger {
  background: var(--tint-fecaca);
  color: var(--ac-991b1b);
}

.cache-count {
  margin-bottom: 0.5rem;
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--text-3);
}

.cache-empty {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.cache-table td:first-child {
  overflow-wrap: anywhere;
}

.cache-col-ttl {
  width: 160px;
  text-align: right;
}
</style>
