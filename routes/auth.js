import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Users from '../models/Users.js';

const router = express.Router();

// Rota de login para autenticação e geração do token JWT
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verifica se o usuário existe
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Usuário não encontrado!' });
        }

        // Verifica a senha
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Senha incorreta!' });
        }

        // Gerar o token JWT
        const token = jwt.sign(
            { id: user._id, email: user.email }, // Payload do token
            process.env.JWT_SECRET, // Chave secreta do .env
            { expiresIn: '1h' } // Token válido por 1 hora
        );

        res.json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar login' });
    }
});

export default router;
