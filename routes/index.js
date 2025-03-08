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

    // Criar o usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Users({ email, name, password: hashedPassword });
    await user.save();

    // Retornar uma resposta JSON com o status 201
    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});



export default router;
