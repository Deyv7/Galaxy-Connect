// Função para lidar com o envio do formulário de login
console.log('Requisição recebida:', req.body);

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();  // Evita o envio padrão do formulário

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log("Email:", email);
    console.log("Password:", password);

    // Verifica se os campos estão preenchidos
    if (!email || !password) {
        alert('Todos os campos são obrigatórios!');
        return;
    }

    // Log da requisição que será enviada
    console.log('Enviando requisição para login:', {
        email,
        password
    });

    // Fazendo a requisição para o backend
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    })
        .then(response => {
            console.log('Resposta recebida:', response);
            return response.json();
        })
        .then(data => {
            console.log('Dados da resposta:', data);
            if (data.token) {
                localStorage.setItem('token', data.token);  // Salva o token no localStorage
                window.location.href = '/dashboard';  // Redireciona para a dashboard
            } else {
                alert('Erro: ' + (data.message || 'Falha ao fazer login.'));
            }
        })
        .catch(error => {
            console.error('Erro ao fazer login:', error);
            alert('Erro ao tentar fazer login.');
        });
});
