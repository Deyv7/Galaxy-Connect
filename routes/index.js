import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Users from '../models/Users.js';
import bcrypt from 'bcrypt';

const router = Router();

// Obtenha o caminho do arquivo atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rota para a página inicial
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Rota para a página de login
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Rota para a página de registro
router.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/registro.html'));
});

// Rota para o formulário de registro
router.post('/registro', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se o email já está em uso
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'O email já está em uso.' });
    }

    // Verificar se os campos estão presentes
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // Criptografar a senha com bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o novo usuário
    const user = new Users({
      email,
      name,
      password: hashedPassword,
    });

    // Salvar o usuário no banco de dados
    await user.save();

    // Retornar uma resposta JSON com o status 201
    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

export default router;