<template>
  <div class="app">
    <header class="top-nav">
      <div class="nav-container">
        <div class="logo">
          <router-link to="/" class="logo-link">
            <img :src="logoUrl" alt="Factory Inventory logo - go to dashboard" class="logo-img" width="36" height="36" />
          </router-link>
          <h1>{{ t('nav.companyName') }}</h1>
          <span class="subtitle">{{ t('nav.subtitle') }}</span>
        </div>
        <nav class="nav-tabs">
          <router-link to="/" :class="{ active: $route.path === '/' }">
            {{ t('nav.overview') }}
          </router-link>
          <router-link to="/inventory" :class="{ active: $route.path === '/inventory' }">
            {{ t('nav.inventory') }}
          </router-link>
          <router-link to="/orders" :class="{ active: $route.path === '/orders' }">
            {{ t('nav.orders') }}
          </router-link>
          <router-link to="/shipments" :class="{ active: $route.path === '/shipments' }">
            {{ t('nav.shipments') }}
          </router-link>
          <router-link to="/spending" :class="{ active: $route.path === '/spending' }">
            {{ t('nav.finance') }}
          </router-link>
          <router-link to="/demand" :class="{ active: $route.path === '/demand' }">
            {{ t('nav.demandForecast') }}
          </router-link>
          <router-link to="/reports" :class="{ active: $route.path === '/reports' }">
            Reports
          </router-link>
        </nav>
        <LanguageSwitcher />
        <div class="theme-switch" role="group" :aria-label="t('theme.label')">
          <button
            type="button"
            class="theme-option"
            :class="{ active: !isDark }"
            :aria-pressed="!isDark"
            @click="setTheme('light')"
          >
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
              <circle cx="10" cy="10" r="3.5" />
              <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4" />
            </svg>
            <span>{{ t('theme.light') }}</span>
          </button>
          <button
            type="button"
            class="theme-option"
            :class="{ active: isDark }"
            :aria-pressed="isDark"
            @click="setTheme('dark')"
          >
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">
              <path d="M16.5 11.5A7 7 0 0 1 8.5 3.5a7 7 0 1 0 8 8z" />
            </svg>
            <span>{{ t('theme.dark') }}</span>
          </button>
        </div>
        <ProfileMenu
          @show-profile-details="showProfileDetails = true"
          @show-tasks="showTasks = true"
        />
      </div>
    </header>
    <FilterBar />
    <main class="main-content">
      <router-view />
    </main>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import { useTheme } from './composables/useTheme'
import logoUrl from './assets/logo.svg'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

export default {
  name: 'App',
  components: {
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const { isDark, setTheme } = useTheme()
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        // Add new task to the beginning of the array
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)

        if (isMockTask) {
          // Remove from mock tasks
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          // Remove from API tasks
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)

        if (mockTask) {
          // Toggle mock task status
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          // Toggle API task
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(loadTasks)

    return {
      t,
      isDark,
      setTheme,
      logoUrl,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask
    }
  }
}
</script>

<style>
:root {
  --bg: #f8fafc;
  --surface: #ffffff;
  --surface-subtle: #f8fafc;
  --surface-2: #f1f5f9;
  --border: #e2e8f0;
  --border-strong: #cbd5e1;
  --text-strong: #0f172a;
  --text: #1e293b;
  --text-2: #334155;
  --text-3: #475569;
  --text-muted: #64748b;
  --text-faint: #94a3b8;
  --overlay: rgba(0, 0, 0, 0.5);
  --tint-eff6ff: #eff6ff; --tint-dbeafe: #dbeafe;
  --tint-fef2f2: #fef2f2; --tint-fee2e2: #fee2e2; --tint-fecaca: #fecaca;
  --tint-fed7aa: #fed7aa; --tint-fffbeb: #fffbeb; --tint-fef3c7: #fef3c7;
  --tint-d1fae5: #d1fae5; --tint-f0fdf4: #f0fdf4; --tint-dcfce7: #dcfce7;
  --tint-e0e7ff: #e0e7ff; --tint-f5f3ff: #f5f3ff;
  --tint-bfdbfe: #bfdbfe; --tint-93c5fd: #93c5fd; --tint-86efac: #86efac;
  --tint-a7f3d0: #a7f3d0; --tint-fcd34d: #fcd34d; --tint-c4b5fd: #c4b5fd;
  --ac-2563eb: #2563eb; --ac-1e40af: #1e40af; --ac-3b82f6: #3b82f6;
  --ac-dc2626: #dc2626; --ac-991b1b: #991b1b; --ac-ef4444: #ef4444;
  --ac-059669: #059669; --ac-065f46: #065f46; --ac-166534: #166534; --ac-16a34a: #16a34a; --ac-10b981: #10b981;
  --ac-ea580c: #ea580c; --ac-92400e: #92400e; --ac-d97706: #d97706; --ac-f59e0b: #f59e0b;
  --ac-3730a3: #3730a3; --ac-8b5cf6: #8b5cf6;
  --shadow-color: rgba(0, 0, 0, 0.06);
  color-scheme: light;
}

[data-theme="dark"] {
  --bg: #0b1220;
  --surface: #111c2f;
  --surface-subtle: #16233a;
  --surface-2: #1c2b45;
  --border: #2b3a52;
  --border-strong: #41536f;
  --text-strong: #f1f5f9;
  --text: #e2e8f0;
  --text-2: #cbd5e1;
  --text-3: #b3bfd0;
  --text-muted: #9aa8bd;
  --text-faint: #8493a9;
  --overlay: rgba(0, 0, 0, 0.7);
  --tint-eff6ff: rgba(59, 130, 246, 0.16); --tint-dbeafe: rgba(59, 130, 246, 0.2);
  --tint-fef2f2: rgba(239, 68, 68, 0.12); --tint-fee2e2: rgba(239, 68, 68, 0.16); --tint-fecaca: rgba(239, 68, 68, 0.22);
  --tint-fed7aa: rgba(249, 115, 22, 0.22); --tint-fffbeb: rgba(245, 158, 11, 0.12); --tint-fef3c7: rgba(245, 158, 11, 0.2);
  --tint-d1fae5: rgba(16, 185, 129, 0.2); --tint-f0fdf4: rgba(16, 185, 129, 0.12); --tint-dcfce7: rgba(16, 185, 129, 0.18);
  --tint-e0e7ff: rgba(99, 102, 241, 0.25); --tint-f5f3ff: rgba(139, 92, 246, 0.15);
  --tint-bfdbfe: rgba(96, 165, 250, 0.4); --tint-93c5fd: rgba(96, 165, 250, 0.5); --tint-86efac: rgba(74, 222, 128, 0.4);
  --tint-a7f3d0: rgba(52, 211, 153, 0.4); --tint-fcd34d: rgba(251, 191, 36, 0.4); --tint-c4b5fd: rgba(167, 139, 250, 0.4);
  --ac-2563eb: #60a5fa; --ac-1e40af: #93c5fd; --ac-3b82f6: #60a5fa;
  --ac-dc2626: #f87171; --ac-991b1b: #fca5a5; --ac-ef4444: #f87171;
  --ac-059669: #34d399; --ac-065f46: #6ee7b7; --ac-166534: #86efac; --ac-16a34a: #4ade80; --ac-10b981: #34d399;
  --ac-ea580c: #fb923c; --ac-92400e: #fcd34d; --ac-d97706: #fbbf24; --ac-f59e0b: #fbbf24;
  --ac-3730a3: #a5b4fc; --ac-8b5cf6: #a78bfa;
  --shadow-color: rgba(0, 0, 0, 0.4);
  color-scheme: dark;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.top-nav {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  height: 70px;
}

.nav-container > .nav-tabs {
  margin-left: auto;
  margin-right: 1rem;
}

.nav-container > .language-switcher {
  margin-right: 1rem;
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.logo-link {
  display: flex;
  align-self: center;
  flex-shrink: 0;
}

.logo-img {
  display: block;
  width: 36px;
  height: 36px;
}

.logo h1 {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-strong);
  letter-spacing: -0.025em;
}

.subtitle {
  font-size: 0.813rem;
  color: var(--text-muted);
  font-weight: 400;
  padding-left: 0.75rem;
  border-left: 1px solid var(--border);
}

.theme-switch {
  display: inline-flex;
  margin-right: 0.75rem;
  padding: 2px;
  gap: 2px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.theme-option {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.813rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.theme-option:hover {
  color: var(--text-strong);
}

.theme-option.active {
  background: var(--surface);
  border-color: var(--ac-2563eb);
  color: var(--ac-2563eb);
  font-weight: 600;
  box-shadow: 0 1px 2px var(--shadow-color);
}

.theme-option:focus-visible {
  outline: 2px solid var(--ac-2563eb);
  outline-offset: 2px;
}

.nav-tabs {
  display: flex;
  gap: 0.25rem;
}

.nav-tabs a {
  padding: 0.625rem 1.25rem;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.938rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-tabs a:hover {
  color: var(--text-strong);
  background: var(--surface-2);
}

.nav-tabs a.active {
  color: var(--ac-2563eb);
  background: var(--tint-eff6ff);
}

.nav-tabs a.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #2563eb;
}

@media (max-width: 1440px) {
  .nav-tabs {
    gap: 0.125rem;
  }

  .nav-tabs a {
    padding: 0.625rem 0.375rem;
  }
}

.main-content {
  flex: 1;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 2rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-strong);
  margin-bottom: 0.375rem;
  letter-spacing: -0.025em;
}

.page-header p {
  color: var(--text-muted);
  font-size: 0.938rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--surface);
  padding: 1.25rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--border-strong);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.625rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-strong);
  letter-spacing: -0.025em;
}

.stat-card.warning .stat-value {
  color: var(--ac-ea580c);
}

.stat-card.success .stat-value {
  color: var(--ac-059669);
}

.stat-card.danger .stat-value {
  color: var(--ac-dc2626);
}

.stat-card.info .stat-value {
  color: var(--ac-2563eb);
}

.card {
  background: var(--surface);
  border-radius: 10px;
  padding: 1.25rem;
  border: 1px solid var(--border);
  margin-bottom: 1.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-strong);
  letter-spacing: -0.025em;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--surface-subtle);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  color: var(--text-3);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--surface-2);
  color: var(--text-2);
  font-size: 0.875rem;
}

tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background: var(--surface-subtle);
}

.badge {
  display: inline-block;
  padding: 0.313rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.success {
  background: var(--tint-d1fae5);
  color: var(--ac-065f46);
}

.badge.warning {
  background: var(--tint-fed7aa);
  color: var(--ac-92400e);
}

.badge.danger {
  background: var(--tint-fecaca);
  color: var(--ac-991b1b);
}

.badge.info {
  background: var(--tint-dbeafe);
  color: var(--ac-1e40af);
}

.badge.increasing {
  background: var(--tint-d1fae5);
  color: var(--ac-065f46);
}

.badge.decreasing {
  background: var(--tint-fecaca);
  color: var(--ac-991b1b);
}

.badge.stable {
  background: var(--tint-e0e7ff);
  color: var(--ac-3730a3);
}

.badge.high {
  background: var(--tint-fecaca);
  color: var(--ac-991b1b);
}

.badge.medium {
  background: var(--tint-fed7aa);
  color: var(--ac-92400e);
}

.badge.low {
  background: var(--tint-dbeafe);
  color: var(--ac-1e40af);
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
  font-size: 0.938rem;
}

.error {
  background: var(--tint-fef2f2);
  border: 1px solid var(--tint-fecaca);
  color: var(--ac-991b1b);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.938rem;
}
</style>
