import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authMiddleware from '../middlewares/authMiddleware.js';
import Users from '../models/Users.js';

const router = Router();

// Obtenha o caminho do arquivo atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rota para validar o token
router.get('/validate-token', authMiddleware, (req, res) => {
  res.json({ 
      success: true,
      user: req.user 
  });
});

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

// Rotas Protegidas
router.get('/dashboard', (req, res, next) => {
  if (req.query.token) {
      req.headers.authorization = `Bearer ${req.query.token}`;
  }
  authMiddleware(req, res, next);
}, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

router.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const dashboardData = {
      user: {
        name: user.name,
        email: user.email
      },
      energia: {
        valor: "150,50",
        consumo: "320"
      },
      agua: {
        valor: "85,20",
        consumo: "25"
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    res.status(500).json({ error: 'Erro ao carregar dados do dashboard' });
  }
});
export default router;