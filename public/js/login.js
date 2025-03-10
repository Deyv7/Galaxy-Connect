document.addEventListener("DOMContentLoaded", function () {
    console.log("🟢 O DOM foi carregado!");

    const form = document.getElementById('Formlogin');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (!form) {
        console.error("❌ Formulário não encontrado! Verifique o HTML.");
        return;
    }

    if (!emailInput || !passwordInput) {
        console.error("❌ Campos de e-mail e senha não encontrados! Verifique os IDs no HTML.");
        return;
    }

    console.log("🟢 Formulário e campos de input encontrados!");

    form.addEventListener('submit', function (event) {
        event.preventDefault();  // Evita o envio padrão do formulário
        console.log("🔵 Evento de submit ativado!");

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        console.log("📩 Email:", email);
        console.log("🔑 Password:", password);

        if (!email || !password) {
            alert('Todos os campos são obrigatórios!');
            return;
        }

        console.log('🔵 JSON enviado:', JSON.stringify({ email, password }));

        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Dados da resposta:', data);
            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.href = '/dashboard';
            } else {
                alert('Erro: ' + (data.message || 'Falha ao fazer login.'));
            }
        })
        .catch(error => {
            console.error('Erro ao fazer login:', error);
            alert('Erro ao tentar fazer login.');
        });
    });
});
