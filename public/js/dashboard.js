async function loadDashboardData() {
  try {
    showLoadingState(true);
    
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/api/dashboard', {
      method: 'GET',
      credentials: 'include', // Para enviar cookies
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Fallback caso cookies não funcionem
      }
    });

    if (response.status === 401) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erro ${response.status}`);
    }

    const data = await response.json();
    updateDashboardUI(data);
      
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showErrorState(error.message);
    
    if (error.message.includes('Sessão expirada')) {
      setTimeout(logout, 2000);
    }
  } finally {
    showLoadingState(false);
  }
}