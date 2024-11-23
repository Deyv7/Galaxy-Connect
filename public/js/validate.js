// Seleciona o formulário
document.querySelector('.formLogin').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita o recarregamento da página

    // Captura os valores dos campos do formulário
    const usuario = document.querySelector('#usuario').value;
    const email = document.querySelector('#email').value;
    const senha = document.querySelector('#senha').value;
    const senhaConfirm = document.querySelector('#senha-confirm').value;

    // Validação de senha no frontend
    if (senha !== senhaConfirm) {
        alert('As senhas não coincidem!');
        return;
    }

    // Envia os dados para o backend via fetch
    try {
        const response = await fetch('/api/validation/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, email, senha }), // Dados enviados ao servidor
        });

        const data = await response.json(); // Processa a resposta do servidor

        if (response.ok) {
            alert('Registro realizado com sucesso!');
            window.location.href = 'login.html'; // Redireciona para a página de login
        } else {
            alert(`Erro no registro: ${data.message}`);
        }
    } catch (err) {
        console.error('Erro ao conectar com o servidor:', err);
        alert('Erro ao tentar registrar. Tente novamente mais tarde.');
    }
});
