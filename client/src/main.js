import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
import Inventory from './views/Inventory.vue'
import Orders from './views/Orders.vue'
import Shipments from './views/Shipments.vue'
import Demand from './views/Demand.vue'
import Spending from './views/Spending.vue'
import Reports from './views/Reports.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Dashboard },
    { path: '/inventory', component: Inventory },
    { path: '/orders', component: Orders },
    { path: '/shipments', component: Shipments },
    { path: '/demand', component: Demand },
    { path: '/spending', component: Spending },
    { path: '/reports', component: Reports }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
