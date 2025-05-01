document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('Formlogin');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = form.querySelector('button[type="submit"]');
    let errorElement = document.getElementById('error-message');

    // Cria elemento de erro se não existir
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'error-message';
        Object.assign(errorElement.style, {
            color: 'red',
            marginTop: '10px',
            display: 'none'
        });
        form.appendChild(errorElement);
    }

    const showError = (message, duration = 5000) => {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => errorElement.style.display = 'none', duration);
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Função para redirecionar com o token
    const redirectToDashboard = (token) => {
        window.location.href = `/dashboard?token=${encodeURIComponent(token)}`;
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validações melhoradas
        if (!validateEmail(email)) return showError('Email inválido');
        if (password.length < 6) return showError('Senha deve ter 6+ caracteres');

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Autenticando...';

            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `Erro ${response.status}`);
            }

            // Armazenamento seguro dos dados
            if (data.token && data.user) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify({
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email
                }));
                
                // Redireciona diretamente com o token na URL
                redirectToDashboard(data.token);
            } else {
                throw new Error('Resposta inválida do servidor');
            }

        } catch (error) {
            console.error('Erro no login:', error);
            showError(error.message || 'Falha na conexão');
            localStorage.removeItem('authToken');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
        }
    });
});