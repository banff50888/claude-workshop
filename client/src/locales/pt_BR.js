export default {
  // Navigation
  nav: {
    overview: 'Visão Geral',
    inventory: 'Estoque',
    orders: 'Pedidos',
    shipments: 'Remessas',
    finance: 'Finanças',
    demandForecast: 'Previsão de Demanda',
    companyName: 'Catalyst Components',
    subtitle: 'Sistema de Gestão de Estoque'
  },

  // Dashboard
  dashboard: {
    title: 'Visão Geral',
    kpi: {
      title: 'Indicadores-Chave de Desempenho',
      inventoryTurnover: 'Giro de Estoque',
      ordersFulfilled: 'Pedidos Atendidos',
      orderFillRate: 'Taxa de Atendimento',
      revenue: 'Receita (Pedidos)',
      revenueYTD: 'Receita (Pedidos) Ano Atual',
      revenueMTD: 'Receita (Pedidos) Mês Atual',
      avgProcessingTime: 'Tempo Médio de Processamento (Dias)',
      goal: 'Meta'
    },
    summary: {
      title: 'Resumo'
    },
    orderHealth: {
      title: 'Saúde dos Pedidos',
      totalOrders: 'Total de Pedidos',
      revenue: 'Receita',
      avgOrderValue: 'Valor Médio do Pedido',
      onTimeRate: 'Taxa de Entrega no Prazo',
      avgFulfillmentDays: 'Atendimento Médio (Dias)',
      total: 'Total'
    },
    ordersByMonth: {
      title: 'Pedidos por Mês'
    },
    inventoryValue: {
      title: 'Valor do Estoque por Categoria'
    },
    inventoryShortages: {
      title: 'Faltas de Estoque',
      noShortages: 'Sem faltas de estoque - todos os pedidos podem ser atendidos!',
      noData: 'Sem dados para os filtros selecionados',
      orderId: 'ID do Pedido',
      sku: 'SKU',
      itemName: 'Nome do Item',
      quantityNeeded: 'Quantidade Necessária',
      quantityAvailable: 'Quantidade Disponível',
      shortage: 'Falta',
      daysDelayed: 'Dias de Atraso',
      priority: 'Prioridade',
      unitsShort: 'unidades em falta',
      days: 'dias'
    },
    topProducts: {
      title: 'Principais Produtos por Receita',
      sku: 'SKU',
      product: 'Produto',
      category: 'Categoria',
      warehouse: 'Armazém',
      stockStatus: 'Status do Estoque',
      revenue: 'Receita',
      unitsOrdered: 'Unidades Pedidas',
      firstOrder: 'Primeiro Pedido',
      inStock: 'Em Estoque',
      lowStock: 'Estoque Baixo'
    }
  },

  // Inventory
  inventory: {
    title: 'Estoque',
    description: 'Rastrear e gerenciar todos os itens do estoque',
    stockLevels: 'Níveis de Estoque',
    skus: 'SKUs',
    searchPlaceholder: 'Pesquisar por nome do item...',
    clearSearch: 'Limpar pesquisa',
    totalItems: 'Total de Itens',
    totalValue: 'Valor Total',
    lowStockItems: 'Itens com Estoque Baixo',
    warehouses: 'Armazéns',
    table: {
      sku: 'SKU',
      itemName: 'Nome do Item',
      name: 'Nome',
      category: 'Categoria',
      warehouse: 'Armazém',
      quantity: 'Quantidade',
      quantityOnHand: 'Quantidade em Mãos',
      reorderPoint: 'Ponto de Reposição',
      unitCost: 'Custo Unitário',
      unitPrice: 'Preço Unitário',
      totalValue: 'Valor Total',
      location: 'Localização',
      status: 'Status'
    }
  },

  // Orders
  orders: {
    title: 'Pedidos',
    description: 'Visualizar e gerenciar pedidos de clientes',
    allOrders: 'Todos os Pedidos',
    totalOrders: 'Total de Pedidos',
    totalRevenue: 'Receita Total',
    avgOrderValue: 'Valor Médio do Pedido',
    onTimeDelivery: 'Entrega no Prazo',
    itemsCount: '{count} itens',
    quantity: 'Qtd',
    table: {
      orderNumber: 'Número do Pedido',
      orderId: 'ID do Pedido',
      orderDate: 'Data do Pedido',
      date: 'Data',
      customer: 'Cliente',
      category: 'Categoria',
      warehouse: 'Armazém',
      items: 'Itens',
      value: 'Valor',
      totalValue: 'Valor Total',
      status: 'Status',
      expectedDelivery: 'Entrega Prevista',
      actualDelivery: 'Entrega Realizada'
    }
  },

  ordersCache: {
    title: 'Cache de Pedidos',
    description: 'Inspecionar ou limpar dados de pedidos em cache (Redis)',
    list: 'Listar cache',
    clear: 'Limpar cache',
    listing: 'Carregando...',
    clearing: 'Limpando...',
    count: '{count} entradas',
    unavailable: 'O cache Redis não está disponível; os pedidos são servidos diretamente do banco de dados',
    empty: 'O cache está vazio',
    cleared: '{count} entradas removidas',
    listError: 'Falha ao carregar as entradas do cache',
    clearError: 'Falha ao limpar o cache',
    confirm: 'Limpar todas as entradas de pedidos em cache?',
    confirmYes: 'Confirmar',
    entry: 'Entrada',
    expires: 'Expira (s)',
    noExpiry: 'Sem expiração',
    order: 'Pedido #{id}',
    orderList: 'Lista de pedidos',
    warehouse: 'Armazém',
    category: 'Categoria',
    status: 'Status',
    month: 'Mês',
    allOrders: 'Todos os pedidos',
    seconds: '{n}s'
  },

  shipments: {
    title: 'Remessas',
    description: 'Acompanhe as remessas e o desempenho de entrega',
    total: 'Total de Remessas',
    inTransit: 'Em Trânsito',
    delayed: 'Atrasadas',
    onTime: 'Taxa de Entrega no Prazo',
    onTimeNote: '{count} de {total} entregues no prazo',
    all: 'Todas as Remessas',
    empty: 'Nenhuma remessa corresponde aos filtros atuais',
    loadError: 'Falha ao carregar as remessas',
    etaPrefix: 'Prev.',
    pending: 'Não enviada',
    kg: 'kg',
    table: {
      shipmentNumber: 'Remessa',
      orderNumber: 'Pedido',
      customer: 'Cliente',
      carrier: 'Transportadora',
      trackingNumber: 'Código de Rastreio',
      destination: 'Destino',
      status: 'Status',
      shipDate: 'Data de Envio',
      delivery: 'Entrega (Prevista / Real)',
      packages: 'Volumes',
      weight: 'Peso'
    },
    status: {
      preparing: 'Preparando',
      inTransit: 'Em Trânsito',
      outForDelivery: 'Saiu para Entrega',
      delivered: 'Entregue',
      delayed: 'Atrasada'
    }
  },

  // Finance/Spending
  finance: {
    title: 'Painel Financeiro',
    description: 'Acompanhar receita, custos e desempenho financeiro',
    totalRevenue: 'Receita Total',
    totalCosts: 'Custos Totais',
    netProfit: 'Lucro Líquido',
    avgOrderValue: 'Valor Médio do Pedido',
    fromOrders: 'De {count} pedidos',
    costBreakdown: 'Aquisição + Operacional + Mão de Obra + Overhead',
    margin: 'margem',
    perOrderRevenue: 'Receita por pedido',
    revenueVsCosts: {
      title: 'Receita vs Custos Mensais',
      revenue: 'Receita',
      costs: 'Custos Totais'
    },
    monthlyCostFlow: {
      title: 'Fluxo de Custos Mensal',
      procurement: 'Aquisição',
      operational: 'Operacional',
      labor: 'Mão de Obra',
      overhead: 'Overhead'
    },
    categorySpending: {
      title: 'Gastos por Categoria',
      ofTotal: 'do total'
    },
    transactions: {
      title: 'Transações Recentes',
      id: 'ID',
      description: 'Descrição',
      vendor: 'Fornecedor',
      date: 'Data',
      amount: 'Valor'
    }
  },

  // Demand Forecast
  demand: {
    title: 'Previsão de Demanda',
    description: 'Analisar tendências e previsões de demanda',
    increasingDemand: 'Demanda Crescente',
    stableDemand: 'Demanda Estável',
    decreasingDemand: 'Demanda Decrescente',
    itemsCount: '{count} itens',
    more: 'mais...',
    demandForecasts: 'Previsões de Demanda',
    table: {
      sku: 'SKU',
      itemName: 'Nome do Item',
      currentDemand: 'Demanda Atual',
      forecastedDemand: 'Demanda Prevista',
      change: 'Variação',
      trend: 'Tendência',
      period: 'Período'
    }
  },

  // Filters
  filters: {
    timePeriod: 'Período',
    location: 'Localização',
    category: 'Categoria',
    orderStatus: 'Status do Pedido',
    all: 'Todos',
    allMonths: 'Todos os Meses'
  },

  // Statuses
  status: {
    delivered: 'Entregue',
    shipped: 'Enviado',
    processing: 'Em Processamento',
    backordered: 'Em Atraso',
    inStock: 'Em Estoque',
    lowStock: 'Estoque Baixo',
    adequate: 'Adequado'
  },

  // Trends
  trends: {
    increasing: 'crescente',
    stable: 'estável',
    decreasing: 'decrescente'
  },

  // Priority
  priority: {
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa'
  },

  // Categories
  categories: {
    circuitBoards: 'Placas de Circuito',
    sensors: 'Sensores',
    actuators: 'Atuadores',
    controllers: 'Controladores',
    powerSupplies: 'Fontes de Alimentação'
  },

  // Spending Categories
  spendingCategories: {
    rawMaterials: 'Matérias-primas',
    components: 'Componentes',
    equipment: 'Equipamentos',
    consumables: 'Consumíveis'
  },

  // Warehouses
  warehouses: {
    sanFrancisco: 'San Francisco',
    london: 'Londres',
    tokyo: 'Tóquio'
  },

  // Months
  months: {
    jan: 'Jan',
    feb: 'Fev',
    mar: 'Mar',
    apr: 'Abr',
    may: 'Mai',
    jun: 'Jun',
    jul: 'Jul',
    aug: 'Ago',
    sep: 'Set',
    oct: 'Out',
    nov: 'Nov',
    dec: 'Dez',
    january: 'Janeiro',
    february: 'Fevereiro',
    march: 'Março',
    april: 'Abril',
    june: 'Junho',
    july: 'Julho',
    august: 'Agosto',
    september: 'Setembro',
    october: 'Outubro',
    november: 'Novembro',
    december: 'Dezembro'
  },

  // Profile Menu
  profile: {
    profileDetails: 'Detalhes do Perfil',
    myTasks: 'Minhas Tarefas',
    logout: 'Sair'
  },

  // Profile Details Modal
  profileDetails: {
    title: 'Detalhes do Perfil',
    email: 'Email',
    department: 'Departamento',
    location: 'Localização',
    phone: 'Telefone',
    joinDate: 'Data de Admissão',
    employeeId: 'ID do Funcionário',
    close: 'Fechar'
  },

  // Tasks Modal
  tasks: {
    title: 'Minhas Tarefas',
    taskTitle: 'Título da Tarefa',
    taskTitlePlaceholder: 'Digite o título da tarefa...',
    priority: 'Prioridade',
    dueDate: 'Prazo',
    addTask: 'Adicionar Tarefa',
    noTasks: 'Nenhuma tarefa ainda. Adicione sua primeira tarefa acima!'
  },

  // Theme
  theme: {
    label: 'Tema',
    light: 'Claro',
    dark: 'Escuro'
  },

  // Language
  language: {
    english: 'Inglês',
    japanese: 'Japonês',
    portuguese: 'Português (Brasil)',
    selectLanguage: 'Selecionar Idioma'
  },

  // Common
  common: {
    loading: 'Carregando...',
    error: 'Erro',
    noData: 'Sem dados disponíveis',
    viewDetails: 'Ver Detalhes',
    close: 'Fechar',
    save: 'Salvar',
    cancel: 'Cancelar',
    search: 'Pesquisar',
    filter: 'Filtrar',
    export: 'Exportar',
    items: 'itens'
  }
}
