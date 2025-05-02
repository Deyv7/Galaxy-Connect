document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('Formlogin');
    
    // Verificação segura do formulário
    if (!form) {
        console.error('Formulário de login não encontrado!');
        return;
    }

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Busca o botão de submit de forma mais robusta
    const submitButton = form.querySelector('button[type="submit"]') || 
                        form.querySelector('input[type="submit"]');
    
    if (!submitButton) {
        console.error('Botão de submit não encontrado no formulário!');
        return;
    }

    // Cria elemento de erro se não existir
    let errorElement = document.getElementById('error-message');
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

    const redirectToDashboard = (token) => {
        window.location.href = `/dashboard?token=${encodeURIComponent(token)}`;
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validações melhoradas
        if (!email) {
            return showError('Por favor, informe seu email');
        }
        
        if (!validateEmail(email)) {
            return showError('Email inválido');
        }
        
        if (!password) {
            return showError('Por favor, informe sua senha');
        }
        
        if (password.length < 6) {
            return showError('Senha deve ter 6+ caracteres');
        }

        try {
            // Verificação segura antes de modificar o botão
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.value = 'Autenticando...'; // Para input type="submit"
            }

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
                
                redirectToDashboard(data.token);
            } else {
                throw new Error('Resposta inválida do servidor');
            }

        } catch (error) {
            console.error('Erro no login:', error);
            showError(error.message || 'Falha na conexão');
            localStorage.removeItem('authToken');
        } finally {
            // Verificação segura antes de reabilitar
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.value = 'Acessar'; // Para input type="submit"
            }
        }
    });
});