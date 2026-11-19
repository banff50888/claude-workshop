export default {
  // Navigation
  nav: {
    overview: '概览',
    inventory: '库存',
    orders: '订单',
    shipments: '发货',
    finance: '财务',
    demandForecast: '需求预测',
    companyName: 'Catalyst Components',
    subtitle: '库存管理系统'
  },

  // Dashboard
  dashboard: {
    title: '概览',
    kpi: {
      title: '关键绩效指标',
      inventoryTurnover: '库存周转率',
      ordersFulfilled: '已完成订单',
      orderFillRate: '订单满足率',
      revenue: '收入(订单)',
      revenueYTD: '收入(订单)年初至今',
      revenueMTD: '收入(订单)本月至今',
      avgProcessingTime: '平均处理时间(天)',
      goal: '目标'
    },
    summary: {
      title: '摘要'
    },
    orderHealth: {
      title: '订单健康度',
      totalOrders: '订单总数',
      revenue: '收入',
      avgOrderValue: '平均订单金额',
      onTimeRate: '准时率',
      avgFulfillmentDays: '平均履约时间(天)',
      total: '合计'
    },
    ordersByMonth: {
      title: '按月订单'
    },
    inventoryValue: {
      title: '按类别库存价值'
    },
    inventoryShortages: {
      title: '库存短缺',
      noShortages: '没有库存短缺 - 所有订单均可履行!',
      noData: '所选筛选条件下没有库存数据',
      orderId: '订单编号',
      sku: 'SKU',
      itemName: '商品名称',
      quantityNeeded: '需求数量',
      quantityAvailable: '可用数量',
      shortage: '缺口',
      daysDelayed: '延迟天数',
      priority: '优先级',
      unitsShort: '件缺口',
      days: '天'
    },
    topProducts: {
      title: '收入最高的产品',
      sku: 'SKU',
      product: '产品',
      category: '类别',
      warehouse: '仓库',
      stockStatus: '库存状态',
      revenue: '收入',
      unitsOrdered: '订购数量',
      firstOrder: '首次订单',
      inStock: '有库存',
      lowStock: '库存不足'
    }
  },

  // Inventory
  inventory: {
    title: '库存',
    description: '跟踪和管理所有库存商品',
    stockLevels: '库存水平',
    skus: 'SKU',
    searchPlaceholder: '按商品名称搜索...',
    clearSearch: '清除搜索',
    totalItems: '商品总数',
    totalValue: '总价值',
    lowStockItems: '低库存商品',
    warehouses: '仓库',
    table: {
      sku: 'SKU',
      itemName: '商品名称',
      name: '名称',
      category: '类别',
      warehouse: '仓库',
      quantity: '数量',
      quantityOnHand: '现有库存',
      reorderPoint: '再订货点',
      unitCost: '单位成本',
      unitPrice: '单价',
      totalValue: '总价值',
      location: '位置',
      status: '状态'
    }
  },

  // Orders
  orders: {
    title: '订单',
    description: '查看和管理客户订单',
    allOrders: '所有订单',
    totalOrders: '订单总数',
    totalRevenue: '总收入',
    avgOrderValue: '平均订单金额',
    onTimeDelivery: '准时交付',
    itemsCount: '{count} 件商品',
    quantity: '数量',
    table: {
      orderNumber: '订单号',
      orderId: '订单编号',
      orderDate: '下单日期',
      date: '日期',
      customer: '客户',
      category: '类别',
      warehouse: '仓库',
      items: '商品',
      value: '金额',
      totalValue: '总金额',
      status: '状态',
      expectedDelivery: '预计交付',
      actualDelivery: '实际交付'
    }
  },

  ordersCache: {
    title: '订单缓存',
    description: '查看或清除缓存的订单数据(Redis)',
    list: '列出缓存',
    clear: '清除缓存',
    listing: '加载中...',
    clearing: '清除中...',
    count: '{count} 条',
    unavailable: 'Redis 缓存不可用;订单将直接从数据库提供',
    empty: '缓存为空',
    cleared: '已清除 {count} 条',
    listError: '加载缓存条目失败',
    clearError: '清除缓存失败',
    confirm: '确定清除所有订单缓存吗?',
    confirmYes: '确认',
    entry: '条目',
    expires: '过期时间(秒)',
    noExpiry: '永不过期',
    order: '订单 #{id}',
    orderList: '订单列表',
    warehouse: '仓库',
    category: '类别',
    status: '状态',
    month: '月份',
    allOrders: '所有订单',
    seconds: '{n}秒'
  },

  shipments: {
    title: '发货',
    description: '跟踪出库发货和配送表现',
    total: '发货总数',
    inTransit: '运输中',
    delayed: '延误',
    onTime: '准时送达率',
    onTimeNote: '{total} 笔中有 {count} 笔准时送达',
    all: '所有发货',
    empty: '没有符合当前筛选条件的发货记录',
    loadError: '加载发货数据失败',
    etaPrefix: '预计',
    pending: '未发货',
    kg: '公斤',
    table: {
      shipmentNumber: '发货单号',
      orderNumber: '订单号',
      customer: '客户',
      carrier: '承运商',
      trackingNumber: '运单号',
      destination: '目的地',
      status: '状态',
      shipDate: '发货日期',
      delivery: '送达(预计/实际)',
      packages: '包裹数',
      weight: '重量'
    },
    status: {
      preparing: '准备中',
      inTransit: '运输中',
      outForDelivery: '派送中',
      delivered: '已送达',
      delayed: '延误'
    }
  },

  // Finance/Spending
  finance: {
    title: '财务仪表板',
    description: '跟踪收入、成本和财务表现',
    totalRevenue: '总收入',
    totalCosts: '总成本',
    netProfit: '净利润',
    avgOrderValue: '平均订单金额',
    fromOrders: '来自 {count} 个订单',
    costBreakdown: '采购 + 运营 + 人工 + 管理费用',
    margin: '利润率',
    perOrderRevenue: '每单收入',
    revenueVsCosts: {
      title: '月度收入与成本',
      revenue: '收入',
      costs: '总成本'
    },
    monthlyCostFlow: {
      title: '月度成本流向',
      procurement: '采购',
      operational: '运营',
      labor: '人工',
      overhead: '管理费用'
    },
    categorySpending: {
      title: '按类别支出',
      ofTotal: '占总额'
    },
    transactions: {
      title: '最近交易',
      id: '编号',
      description: '说明',
      vendor: '供应商',
      date: '日期',
      amount: '金额'
    }
  },

  // Demand Forecast
  demand: {
    title: '需求预测',
    description: '分析需求趋势和预测',
    increasingDemand: '需求上升',
    stableDemand: '需求稳定',
    decreasingDemand: '需求下降',
    itemsCount: '{count} 件商品',
    more: '更多...',
    demandForecasts: '需求预测',
    table: {
      sku: 'SKU',
      itemName: '商品名称',
      currentDemand: '当前需求',
      forecastedDemand: '预测需求',
      change: '变化',
      trend: '趋势',
      period: '周期'
    }
  },

  // Filters
  filters: {
    timePeriod: '时间段',
    location: '位置',
    category: '类别',
    orderStatus: '订单状态',
    all: '全部',
    allMonths: '全部月份'
  },

  // Statuses
  status: {
    delivered: '已送达',
    shipped: '已发货',
    processing: '处理中',
    backordered: '缺货待补',
    inStock: '有库存',
    lowStock: '库存不足',
    adequate: '充足'
  },

  // Trends
  trends: {
    increasing: '上升',
    stable: '稳定',
    decreasing: '下降'
  },

  // Priority
  priority: {
    high: '高',
    medium: '中',
    low: '低'
  },

  // Categories
  categories: {
    circuitBoards: '电路板',
    sensors: '传感器',
    actuators: '执行器',
    controllers: '控制器',
    powerSupplies: '电源'
  },

  // Spending Categories
  spendingCategories: {
    rawMaterials: '原材料',
    components: '零部件',
    equipment: '设备',
    consumables: '耗材'
  },

  // Warehouses
  warehouses: {
    sanFrancisco: '旧金山',
    london: '伦敦',
    tokyo: '东京'
  },

  // Months
  months: {
    jan: '1月',
    feb: '2月',
    mar: '3月',
    apr: '4月',
    may: '5月',
    jun: '6月',
    jul: '7月',
    aug: '8月',
    sep: '9月',
    oct: '10月',
    nov: '11月',
    dec: '12月',
    january: '一月',
    february: '二月',
    march: '三月',
    april: '四月',
    june: '六月',
    july: '七月',
    august: '八月',
    september: '九月',
    october: '十月',
    november: '十一月',
    december: '十二月'
  },

  // Profile Menu
  profile: {
    profileDetails: '个人资料',
    myTasks: '我的任务',
    logout: '退出登录'
  },

  // Profile Details Modal
  profileDetails: {
    title: '个人资料',
    email: '电子邮箱',
    department: '部门',
    location: '所在地',
    phone: '电话',
    joinDate: '入职日期',
    employeeId: '员工编号',
    close: '关闭'
  },

  // Tasks Modal
  tasks: {
    title: '我的任务',
    taskTitle: '任务标题',
    taskTitlePlaceholder: '输入任务标题...',
    priority: '优先级',
    dueDate: '截止日期',
    addTask: '添加任务',
    noTasks: '暂无任务。请在上方添加您的第一个任务!'
  },

  // Theme
  theme: {
    label: '主题',
    light: '浅色',
    dark: '深色'
  },

  // Language
  language: {
    english: 'English',
    japanese: '日本語',
    selectLanguage: '选择语言'
  },

  // Common
  common: {
    loading: '加载中...',
    error: '错误',
    noData: '暂无数据',
    viewDetails: '查看详情',
    close: '关闭',
    save: '保存',
    cancel: '取消',
    search: '搜索',
    filter: '筛选',
    export: '导出',
    items: '件'
  },

  // Product Names
  productNames: {
    'Single Layer PCB Assembly': '单层PCB组件',
    'Dual Layer PCB Assembly': '双层PCB组件',
    'Multi Layer PCB Assembly': '多层PCB组件',
    'Temperature Sensor Module': '温度传感器模块',
    'Humidity Sensor Module': '湿度传感器模块',
    'Pressure Sensor Module': '压力传感器模块',
    'Proximity Sensor': '接近传感器',
    'Ultrasonic Distance Sensor': '超声波测距传感器',
    'Micro Servo Motor': '微型伺服电机',
    'Standard Servo Motor': '标准伺服电机',
    'Stepper Motor NEMA 17': '步进电机 NEMA 17',
    '8-bit Microcontroller': '8位微控制器',
    '32-bit ARM Microcontroller': '32位ARM微控制器',
    'Digital Signal Processor': '数字信号处理器',
    '3-Axis Accelerometer': '三轴加速度计',
    'Gyroscope Module': '陀螺仪模块',
    'Light Dependent Resistor': '光敏电阻',
    'Coil Spring Heavy Duty': '重型螺旋弹簧',
    'Compression Spring': '压缩弹簧',
    'PWM Motor Controller': 'PWM电机控制器',
    'H-Bridge Motor Driver': 'H桥电机驱动器',
    'Stepper Motor NEMA 23': '步进电机 NEMA 23',
    'Drive Pulley': '驱动皮带轮',
    'LED Driver IC': 'LED驱动芯片',
    '5V 10A Switching Power Supply': '5V 10A开关电源',
    '12V 5A Power Supply Module': '12V 5A电源模块',
    '24V 3A Industrial Power Supply': '24V 3A工业电源',
    'Dual Output ±15V Power Supply': '双路输出±15V电源',
    '48V DC Power Supply Unit': '48V直流电源单元',
    'USB-C PD 100W Power Supply': 'USB-C PD 100W电源',
    'Battery Backup Power Supply': '电池备用电源',
    'Adjustable Bench Power Supply': '可调台式电源'
  },

  // Customer Names
  customerNames: {
    'MegaCorp Industries': '巨擘工业',
    'Elite Systems Corp': '精英系统公司',
    'Horizon Technologies': '地平线科技',
    'FastAssembly Ltd': '快装有限公司',
    'TechSolutions Group': '科技方案集团',
    'Apex Engineering': '顶点工程',
    'Superior Manufacturing': '卓越制造',
    'Cascade Manufacturing': '瀑布制造',
    'Acme Manufacturing Corp': '顶尖制造公司',
    'TechBuild Industries': '科建工业',
    'Advanced Components Inc': '先进元件公司',
    'Premier Industries': '首选工业',
    'Stellar Components Ltd': '星辰元件有限公司',
    'Dynamic Systems Ltd': '动态系统有限公司'
  }
}
