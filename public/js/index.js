document.querySelector('.formLogin').addEventListener('submit', async function (e) {
  e.preventDefault(); // Previne envio padrão do formulário

  // Captura os dados do formulário
  const usuario = document.getElementById('usuario').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const senhaConfirm = document.getElementById('senha-confirm').value;

  try {
      // Fazendo a requisição POST para o backend
      const response = await fetch('/api/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario, email, senha, senhaConfirm }),
      });

      const data = await response.json();

      if (response.ok) {
          alert(data.message); // Dados válidos
      } else {
          alert('Erros:\n' + data.errors.join('\n')); // Exibir erros
      }
  } catch (err) {
      alert('Erro ao conectar ao servidor.');
      console.error(err);
  }
});
