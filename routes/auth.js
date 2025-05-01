import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Users from '../models/Users.js';

const router = express.Router();

/**
 * @route POST /login
 * @description Autentica um usuário e retorna um token JWT
 * @access Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validação básica dos campos
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email e senha são obrigatórios'
            });
        }

        // 1. Busca usuário incluindo a senha (que está com select: false no model)
        const user = await Users.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credenciais inválidas'
            });
        }

        // 2. Comparação segura de senhas
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Credenciais inválidas'
            });
        }

        // 3. Verifica se JWT_SECRET está definido
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET não está configurado');
        }

        // 4. Gera token JWT
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        // 5. Remove a senha do objeto de resposta
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        // 6. Configura o cookie HTTP-only seguro
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS em produção
            sameSite: 'strict',
            maxAge: 3600000, // 1 hora em milissegundos
            path: '/' // Disponível em todas as rotas
        });

        // 7. Retorna resposta com token e dados do usuário
        res.status(200).json({
            success: true,
            token, // Para ser armazenado no localStorage (fallback)
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Erro no login:', error);
        
        // Retorna mensagens de erro detalhadas em desenvolvimento
        const errorResponse = {
            success: false,
            error: 'Erro interno no servidor'
        };

        if (process.env.NODE_ENV === 'development') {
            errorResponse.details = error.message;
            errorResponse.stack = error.stack;
        }

        res.status(500).json(errorResponse);
    }
});

/**
 * @route POST /registro
 * @description Cria um novo usuário
 * @access Public
 */
router.post('/registro', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validação dos campos
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Nome, email e senha são obrigatórios'
            });
        }

        // 1. Verifica se o usuário já existe
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Email já cadastrado'
            });
        }

        // 2. Cria o usuário (o hash é feito automaticamente pelo pre-save hook)
        const user = await Users.create({ 
            name, 
            email, 
            password
        });

        // 3. Retorna resposta sem dados sensíveis
        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        
        const errorResponse = {
            success: false,
            error: 'Erro ao criar usuário'
        };

        if (process.env.NODE_ENV === 'development') {
            errorResponse.details = error.message;
        }

        // Tratamento especial para erros de validação do Mongoose
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                errors
            });
        }

        res.status(500).json(errorResponse);
    }
});

export default router;