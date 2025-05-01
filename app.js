import express from 'express';
import router from './routes/router.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Configurar o dotenv primeiro para garantir acesso às variáveis
dotenv.config();

// Conectar ao banco de dados
connectDB();

// Configurar o Express
const app = express();
const port = process.env.PORT || 3000;

// Adicione após os outros middlewares
app.use(cookieParser());

// Atualize as opções CORS para refletir isso
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://galaxyconnect.site',
    'https://galaxyconnect.site'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Aplicar middlewares na ordem correta
app.use(cors(corsOptions)); // CORS primeiro
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rotas
app.use(router);
app.use(authRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Middleware de erro (deve vir depois das rotas)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
});