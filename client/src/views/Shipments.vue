<template>
  <div class="shipments">
    <div class="page-header">
      <h2>{{ t('shipments.title') }}</h2>
      <p>{{ t('shipments.description') }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ t('shipments.total') }}</div>
          <div class="stat-value">{{ shipments.length }}</div>
        </div>
        <div class="stat-card info">
          <div class="stat-label">{{ t('shipments.inTransit') }}</div>
          <div class="stat-value">{{ inTransitCount }}</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-label">{{ t('shipments.delayed') }}</div>
          <div class="stat-value">{{ delayedCount }}</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">{{ t('shipments.onTime') }}</div>
          <div class="stat-value">{{ onTimeRate === null ? '-' : onTimeRate + '%' }}</div>
          <div v-if="onTimeRate !== null" class="stat-note">
            {{ t('shipments.onTimeNote', { count: onTimeCount, total: deliveredCount }) }}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('shipments.all') }} ({{ shipments.length }})</h3>
        </div>
        <div v-if="shipments.length === 0" class="empty">{{ t('shipments.empty') }}</div>
        <div v-else class="table-container">
          <table class="shipments-table">
            <thead>
              <tr>
                <th>{{ t('shipments.table.shipmentNumber') }}</th>
                <th>{{ t('shipments.table.orderNumber') }}</th>
                <th>{{ t('shipments.table.customer') }}</th>
                <th>{{ t('shipments.table.carrier') }}</th>
                <th>{{ t('shipments.table.trackingNumber') }}</th>
                <th>{{ t('shipments.table.destination') }}</th>
                <th>{{ t('shipments.table.status') }}</th>
                <th>{{ t('shipments.table.shipDate') }}</th>
                <th>{{ t('shipments.table.delivery') }}</th>
                <th class="num">{{ t('shipments.table.packages') }}</th>
                <th class="num">{{ t('shipments.table.weight') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="shipment in shipments" :key="shipment.id">
                <td class="nowrap"><strong>{{ shipment.shipment_number }}</strong></td>
                <td class="nowrap">{{ shipment.order_number }}</td>
                <td>{{ translateCustomerName(shipment.customer) }}</td>
                <td>{{ shipment.carrier }}</td>
                <td class="nowrap mono">{{ shipment.tracking_number }}</td>
                <td>{{ shipment.destination }}</td>
                <td>
                  <span :class="['badge', getStatusClass(shipment.status)]">
                    {{ statusLabel(shipment.status) }}
                  </span>
                </td>
                <td class="nowrap">{{ shipment.ship_date ? formatDate(shipment.ship_date) : t('shipments.pending') }}</td>
                <td class="nowrap">
                  <template v-if="shipment.actual_delivery">{{ formatDate(shipment.actual_delivery) }}</template>
                  <template v-else>{{ t('shipments.etaPrefix') }} {{ formatDate(shipment.estimated_delivery) }}</template>
                </td>
                <td class="num">{{ shipment.packages }}</td>
                <td class="num nowrap">{{ formatWeight(shipment.weight_kg) }} {{ t('shipments.kg') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'

const STATUS_KEYS = {
  'Preparing': 'preparing',
  'In Transit': 'inTransit',
  'Out for Delivery': 'outForDelivery',
  'Delivered': 'delivered',
  'Delayed': 'delayed'
}

const STATUS_CLASSES = {
  'Delivered': 'success',
  'In Transit': 'info',
  'Out for Delivery': 'info',
  'Preparing': 'warning',
  'Delayed': 'danger'
}

const parseDate = (value) => {
  if (!value) return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

export default {
  name: 'Shipments',
  setup() {
    const { t, currentLocale, translateCustomerName } = useI18n()

    const loading = ref(true)
    const error = ref(null)
    const shipments = ref([])

    const { selectedPeriod, selectedLocation, selectedCategory, selectedStatus, getCurrentFilters } = useFilters()

    const loadShipments = async () => {
      try {
        loading.value = true
        error.value = null
        const fetched = await api.getShipments(getCurrentFilters())
        // Sort by ship date, unshipped (no date) last
        shipments.value = [...fetched].sort((a, b) => {
          const da = parseDate(a.ship_date)
          const db = parseDate(b.ship_date)
          if (!da && !db) return 0
          if (!da) return 1
          if (!db) return -1
          return da - db
        })
      } catch (err) {
        error.value = t('shipments.loadError') + ': ' + err.message
      } finally {
        loading.value = false
      }
    }

    watch([selectedPeriod, selectedLocation, selectedCategory, selectedStatus], loadShipments)

    const countByStatus = (status) => shipments.value.filter(s => s.status === status).length
    const inTransitCount = computed(() => countByStatus('In Transit') + countByStatus('Out for Delivery'))
    const delayedCount = computed(() => countByStatus('Delayed'))
    const deliveredCount = computed(() => countByStatus('Delivered'))

    // Delivered shipments whose actual delivery is on or before the estimate
    const onTimeCount = computed(() => shipments.value.filter(s => {
      if (s.status !== 'Delivered') return false
      const actual = parseDate(s.actual_delivery)
      const eta = parseDate(s.estimated_delivery)
      return actual && eta && actual <= eta
    }).length)

    const onTimeRate = computed(() => {
      if (deliveredCount.value === 0) return null
      return Math.round((onTimeCount.value / deliveredCount.value) * 100)
    })

    const getStatusClass = (status) => STATUS_CLASSES[status] || 'info'
    const statusLabel = (status) => STATUS_KEYS[status] ? t(`shipments.status.${STATUS_KEYS[status]}`) : status

    const localeTag = computed(() => {
      const map = { ja: 'ja-JP', zh: 'zh-CN', pt_BR: 'pt-BR' }
      return map[currentLocale.value] || 'en-US'
    })

    const formatDate = (dateString) => {
      const d = parseDate(dateString)
      if (!d) return '-'
      return d.toLocaleDateString(localeTag.value, { year: 'numeric', month: 'short', day: 'numeric' })
    }

    const formatWeight = (kg) => {
      if (typeof kg !== 'number' || isNaN(kg)) return '-'
      return kg.toLocaleString(localeTag.value, { maximumFractionDigits: 1 })
    }

    onMounted(loadShipments)

    return {
      t,
      loading,
      error,
      shipments,
      inTransitCount,
      delayedCount,
      deliveredCount,
      onTimeCount,
      onTimeRate,
      getStatusClass,
      statusLabel,
      formatDate,
      formatWeight,
      translateCustomerName
    }
  }
}
</script>

<style scoped>
.shipments-table {
  width: 100%;
}

.shipments-table th,
.shipments-table td {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.shipments-table td {
  font-size: 0.813rem;
}

.shipments-table th,
.shipments-table .badge {
  white-space: nowrap;
}

.nowrap {
  white-space: nowrap;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.813rem;
}

.num {
  text-align: right;
}

.stat-note {
  margin-top: 0.375rem;
  font-size: 0.813rem;
  color: var(--text-muted);
}

.empty {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.938rem;
}
</style>
