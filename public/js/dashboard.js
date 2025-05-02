// Estado global do dashboard
const dashboardState = {
  isLoading: false,
  isAuthenticated: false,
  currentPeriod: 30, // dias
  chartData: {
    energy: null,
    water: null,
    costDistribution: null
  },
  user: null,
  retryCount: 0,
  maxRetries: 3
};

// Elementos do DOM
const DOM = {
  loadingIndicator: document.getElementById('loading-indicator'),
  errorMessage: document.getElementById('error-message'),
  logoutBtn: document.getElementById('logout-btn'),
  periodOptions: document.querySelectorAll('.period-option'),
  currentPeriod: document.getElementById('current-period'),
  chartPeriods: document.querySelectorAll('.chart-period')
};

// Gráficos
let energyChart = null;
let costDistributionChart = null;

// ======================
//  Inicialização
// ======================

document.addEventListener('DOMContentLoaded', function() {
  initializeDashboard();
  setupEventListeners();
});

function setupEventListeners() {
  // Logout
  if (DOM.logoutBtn) {
    DOM.logoutBtn.addEventListener('click', logout);
  }
  
  // Seleção de período
  DOM.periodOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      e.preventDefault();
      const period = parseInt(this.dataset.period);
      changePeriod(period);
    });
  });
  
  // Controle de período dos gráficos
  DOM.chartPeriods.forEach(btn => {
    btn.addEventListener('click', function() {
      DOM.chartPeriods.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      updateEnergyChartPeriod(this.dataset.period);
    });
  });
}

async function initializeDashboard() {
  try {
    setLoadingState(true);
    renderSkeletonUI();
    
    await verifyAuthentication();
    
    if (dashboardState.isAuthenticated) {
      await loadDashboardData();
      showWelcomeMessage();
    }
  } catch (error) {
    console.error('Erro na inicialização:', error);
    handleAuthError(error);
  } finally {
    setLoadingState(false);
  }
}

// ======================
//  Autenticação
// ======================

async function verifyAuthentication() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw { code: 'NO_TOKEN', redirect: true };
    
    // Simulação - substitua pela chamada real à sua API
    const response = await mockApiCall('/validate-token', { token });
    
    if (response.error) {
      throw { 
        message: response.error, 
        code: response.code || 'AUTH_ERROR',
        redirect: response.code === 'TOKEN_EXPIRED'
      };
    }
    
    dashboardState.isAuthenticated = true;
    dashboardState.user = response.user;
    updateUserProfile(response.user);
    
  } catch (error) {
    if (dashboardState.retryCount < dashboardState.maxRetries) {
      dashboardState.retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000 * dashboardState.retryCount));
      return verifyAuthentication();
    }
    throw error;
  }
}

// ======================
//  Carregamento de Dados
// ======================

async function loadDashboardData() {
  try {
    setLoadingState(true);
    
    // Simulação - substitua pela chamada real à sua API
    const response = await mockApiCall('/api/dashboard', {
      period: dashboardState.currentPeriod,
      userId: dashboardState.user?.id
    });
    
    if (response.error) {
      throw { 
        message: response.error, 
        code: response.code || 'DASHBOARD_ERROR',
        redirect: response.code === 'TOKEN_EXPIRED'
      };
    }
    
    dashboardState.chartData = {
      energy: response.energyData,
      water: response.waterData,
      costDistribution: response.costDistribution
    };
    
    renderDashboardData(response);
    initializeCharts();
    
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    throw error;
  } finally {
    setLoadingState(false);
  }
}

function changePeriod(period) {
  dashboardState.currentPeriod = period;
  DOM.currentPeriod.textContent = getPeriodText(period);
  loadDashboardData();
}

function getPeriodText(period) {
  const periods = {
    7: 'Últimos 7 dias',
    30: 'Últimos 30 dias',
    90: 'Últimos 3 meses',
    365: 'Últimos 12 meses'
  };
  return periods[period] || `Últimos ${period} dias`;
}

// ======================
//  Renderização de Dados
// ======================

function renderSkeletonUI() {
  // Adiciona classes de skeleton aos elementos
  const skeletonElements = [
    '#total-energy', '#total-water', '#total-cost',
    '#current-energy', '#current-water',
    '#energy-cost', '#water-cost',
    '#avg-daily-energy', '#avg-daily-water',
    '#avg-energy-price', '#avg-water-price'
  ];
  
  skeletonElements.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) el.classList.add('skeleton-text');
  });
}

function updateUserProfile(user) {
  // Atualiza o nome do usuário onde necessário
  document.querySelectorAll('.user-name').forEach(el => {
    el.textContent = user.name || 'Usuário';
  });
}

function renderDashboardData(data) {
  // Remove classes de skeleton
  document.querySelectorAll('.skeleton-text').forEach(el => {
    el.classList.remove('skeleton-text');
  });
  
  // Atualiza os valores
  updateSummaryCards(data.summary);
  updateDetailCards(data.details);
  updateProgressBars(data.limits);
}

function updateSummaryCards(data) {
  if (data.energy) {
    document.getElementById('total-energy').textContent = `${data.energy.consumo} kWh`;
    updateVariation('energy-variation', data.energy.variation);
  }
  
  if (data.water) {
    document.getElementById('total-water').textContent = `${data.water.consumo} m³`;
    updateVariation('water-variation', data.water.variation);
  }
  
  if (data.total) {
    document.getElementById('total-cost').textContent = formatCurrency(data.total.cost);
    updateVariation('cost-variation', data.total.variation);
  }
}

function updateDetailCards(data) {
  if (data.energy) {
    document.getElementById('current-energy').textContent = `${data.energy.current} kWh`;
    document.getElementById('energy-cost').textContent = formatCurrency(data.energy.cost);
    document.getElementById('avg-daily-energy').textContent = `${data.energy.avgDaily} kWh`;
    document.getElementById('avg-energy-price').textContent = `${formatCurrency(data.energy.avgPrice)}/kWh`;
  }
  
  if (data.water) {
    document.getElementById('current-water').textContent = `${data.water.current} m³`;
    document.getElementById('water-cost').textContent = formatCurrency(data.water.cost);
    document.getElementById('avg-daily-water').textContent = `${data.water.avgDaily} m³`;
    document.getElementById('avg-water-price').textContent = `${formatCurrency(data.water.avgPrice)}/m³`;
  }
}

function updateProgressBars(limits) {
  if (limits.energy) {
    const progress = document.getElementById('energy-progress');
    const percentage = Math.min(100, (limits.energy.current / limits.energy.limit) * 100);
    progress.style.width = `${percentage}%`;
    document.getElementById('energy-limit').textContent = `${limits.energy.limit} kWh`;
    
    if (percentage > 90) {
      progress.classList.add('bg-danger');
      progress.classList.remove('bg-warning', 'bg-primary');
    } else if (percentage > 70) {
      progress.classList.add('bg-warning');
      progress.classList.remove('bg-danger', 'bg-primary');
    }
  }
  
  if (limits.water) {
    const progress = document.getElementById('water-progress');
    const percentage = Math.min(100, (limits.water.current / limits.water.limit) * 100);
    progress.style.width = `${percentage}%`;
    document.getElementById('water-limit').textContent = `${limits.water.limit} m³`;
    
    if (percentage > 90) {
      progress.classList.add('bg-danger');
      progress.classList.remove('bg-warning', 'bg-info');
    } else if (percentage > 70) {
      progress.classList.add('bg-warning');
      progress.classList.remove('bg-danger', 'bg-info');
    }
  }
}

function updateVariation(elementId, value) {
  const element = document.getElementById(elementId);
  if (!element || value === undefined || value === null) return;
  
  element.textContent = `${value > 0 ? '+' : ''}${value}%`;
  
  // Atualiza classes com base no valor
  element.classList.remove('bg-success', 'bg-danger', 'bg-warning');
  
  if (value < 0) {
    element.classList.add('bg-success');
  } else if (value > 10) {
    element.classList.add('bg-danger');
  } else {
    element.classList.add('bg-warning');
  }
}

// ======================
//  Gráficos
// ======================

function initializeCharts() {
  // Destrói gráficos existentes
  if (energyChart) energyChart.destroy();
  if (costDistributionChart) costDistributionChart.destroy();
  
  // Gráfico de energia
  const energyCtx = document.getElementById('energyChart').getContext('2d');
  energyChart = new Chart(energyCtx, {
    type: 'line',
    data: formatEnergyChartData('day'),
    options: getEnergyChartOptions()
  });
  
  // Gráfico de distribuição de custos
  const costCtx = document.getElementById('costDistributionChart').getContext('2d');
  costDistributionChart = new Chart(costCtx, {
    type: 'doughnut',
    data: formatCostDistributionData(),
    options: getCostDistributionOptions()
  });
}

function formatEnergyChartData(period) {
  // Formata os dados para o período selecionado (day, week, month)
  // Esta é uma implementação simulada - adapte para seus dados reais
  const data = dashboardState.chartData.energy || {};
  
  return {
    labels: data.labels || [],
    datasets: [{
      label: 'Consumo de Energia (kWh)',
      data: data.values || [],
      borderColor: 'rgba(98, 0, 238, 1)',
      backgroundColor: 'rgba(98, 0, 238, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      fill: true
    }]
  };
}

function formatCostDistributionData() {
  const data = dashboardState.chartData.costDistribution || {};
  
  return {
    labels: ['Energia', 'Água', 'Outros'],
    datasets: [{
      data: [data.energy || 0, data.water || 0, data.other || 0],
      backgroundColor: [
        'rgba(98, 0, 238, 0.8)',
        'rgba(3, 218, 198, 0.8)',
        'rgba(255, 152, 0, 0.8)'
      ],
      borderColor: [
        'rgba(98, 0, 238, 1)',
        'rgba(3, 218, 198, 1)',
        'rgba(255, 152, 0, 1)'
      ],
      borderWidth: 1
    }]
  };
}

function getEnergyChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };
}

function getCostDistributionOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };
}

function updateEnergyChartPeriod(period) {
  if (!energyChart) return;
  
  energyChart.data = formatEnergyChartData(period);
  energyChart.update();
}

// ======================
//  Utilitários
// ======================

function setLoadingState(isLoading) {
  dashboardState.isLoading = isLoading;
  
  if (DOM.loadingIndicator) {
    DOM.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
  }
  
  // Desabilita controles durante o carregamento
  const controls = document.querySelectorAll('button, a, .dropdown-item');
  controls.forEach(control => {
    if (isLoading && !control.classList.contains('logout-btn')) {
      control.setAttribute('disabled', 'disabled');
    } else {
      control.removeAttribute('disabled');
    }
  });
}

function formatCurrency(value) {
  if (isNaN(value)) return 'R$ --,--';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(value);
}

function showWelcomeMessage() {
  // Exibe um toast de boas-vindas (pode ser implementado)
  console.log(`Bem-vindo, ${dashboardState.user?.name || 'Usuário'}!`);
}

function handleAuthError(error) {
  if (!DOM.errorMessage) return;
  
  const errorMessages = {
    'NO_TOKEN': 'Você precisa fazer login para acessar esta página.',
    'TOKEN_EXPIRED': 'Sua sessão expirou. Redirecionando para login...',
    'AUTH_ERROR': 'Erro de autenticação. Por favor, faça login novamente.',
    'DASHBOARD_ERROR': 'Erro ao carregar os dados do dashboard.'
  };
  
  DOM.errorMessage.textContent = errorMessages[error.code] || error.message || 'Ocorreu um erro desconhecido.';
  DOM.errorMessage.style.display = 'block';
  
  if (error.redirect) {
    setTimeout(logout, 3000);
  } else {
    addRetryButton(DOM.errorMessage);
  }
}

function addRetryButton(container) {
  const existingBtn = container.querySelector('.retry-btn');
  if (existingBtn) return;
  
  const button = document.createElement('button');
  button.className = 'btn btn-primary btn-sm mt-2 retry-btn';
  button.textContent = 'Tentar novamente';
  button.onclick = initializeDashboard;
  container.appendChild(document.createElement('br'));
  container.appendChild(button);
}

function logout() {
  // Limpa os dados de autenticação
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  
  // Redireciona para a página de login
  window.location.href = '/login';
}

// ======================
//  Mock API (para desenvolvimento)
// ======================

async function mockApiCall(endpoint, data) {
  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simula respostas para diferentes endpoints
  switch(endpoint) {
    case '/validate-token':
      if (!data.token) {
        return { error: 'Token inválido', code: 'INVALID_TOKEN' };
      }
      return { 
        user: { 
          id: 'user123', 
          name: 'João Silva', 
          email: 'joao@example.com' 
        } 
      };
      
    case '/api/dashboard':
      const period = data.period || 30;
      return generateMockDashboardData(period);
      
    default:
      return { error: 'Endpoint não encontrado', code: 'NOT_FOUND' };
  }
}

function generateMockDashboardData(period) {
  // Gera dados simulados para o dashboard
  const baseDate = new Date();
  const labels = [];
  const energyValues = [];
  const waterValues = [];
  
  for (let i = period - 1; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('pt-BR'));
    
    // Valores simulados com alguma variação
    energyValues.push(Math.round(10 + Math.random() * 15));
    waterValues.push(Math.round(2 + Math.random() * 5));
  }
  
  const totalEnergy = energyValues.reduce((a, b) => a + b, 0);
  const totalWater = waterValues.reduce((a, b) => a + b, 0);
  const avgDailyEnergy = Math.round(totalEnergy / period * 10) / 10;
  const avgDailyWater = Math.round(totalWater / period * 10) / 10;
  
  return {
    summary: {
      energy: {
        consumo: totalEnergy,
        variation: Math.round((Math.random() - 0.5) * 20)
      },
      water: {
        consumo: totalWater,
        variation: Math.round((Math.random() - 0.5) * 20)
      },
      total: {
        cost: totalEnergy * 0.8 + totalWater * 10,
        variation: Math.round((Math.random() - 0.5) * 15)
      }
    },
    details: {
      energy: {
        current: energyValues[energyValues.length - 1],
        cost: energyValues[energyValues.length - 1] * 0.8,
        avgDaily: avgDailyEnergy,
        avgPrice: 0.8
      },
      water: {
        current: waterValues[waterValues.length - 1],
        cost: waterValues[waterValues.length - 1] * 10,
        avgDaily: avgDailyWater,
        avgPrice: 10
      }
    },
    limits: {
      energy: {
        current: totalEnergy,
        limit: Math.round(totalEnergy * 1.2)
      },
      water: {
        current: totalWater,
        limit: Math.round(totalWater * 1.3)
      }
    },
    energyData: {
      labels,
      values: energyValues
    },
    waterData: {
      labels,
      values: waterValues
    },
    costDistribution: {
      energy: totalEnergy * 0.8,
      water: totalWater * 10,
      other: 50 + Math.round(Math.random() * 50)
    }
  };
}