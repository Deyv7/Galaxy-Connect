const password = document.getElementById('password').value;
const confirmPassword = document.getElementById('confirm-password').value;

if (password !== confirmPassword) {
    alert('As senhas não coincidem!');
} else {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    // Verificar se todos os campos estão preenchidos
    if (!name || !email || !password) {
        alert("Todos os campos são obrigatórios!");
    } else {
        fetch('http://localhost:3000/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            }),
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Erro:', error));
    }
}
