// /routes/validationRoutes.js
const express = require('express');
const router = express.Router();

// Validação simples
router.post('/validate', (req, res) => {
    const { usuario, email, senha, senhaConfirm } = req.body;

    // Armazenar erros
    const errors = [];

    // Validar usuário (não vazio e apenas letras/números)
    if (!/^[A-Za-z0-9]+$/.test(usuario)) {
        errors.push('Usuário deve conter apenas letras e números.');
    }

    // Validar e-mail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Digite um e-mail válido.');
    }

    // Validar senha (8+ caracteres, letra maiúscula, minúscula e número)
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!senhaRegex.test(senha)) {
        errors.push('Senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula e um número.');
    }

    // Confirmar senha
    if (senha !== senhaConfirm) {
        errors.push('As senhas não coincidem.');
    }

    // Se houver erros, enviar para o frontend
    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    // Caso sucesso
    res.status(200).json({ success: true, message: 'Dados válidos!' });
});

module.exports = router;


