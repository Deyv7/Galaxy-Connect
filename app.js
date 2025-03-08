import express from 'express';
import router from './routes/index.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRotes from './routes/auth.js';

// Configurar o dotenv
dotenv.config();

// Conectar ao banco de dados
connectDB();

// Configurar o Express
const app = express();
const port = 3000;

// Middleware para interpretar o corpo da requisição como JSON
app.use(express.json());

// Middleware para interpretar o corpo da requisição como URL-encoded
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static('public'));

// Usar as rotas
app.use(router);

// Usar as rotas de autenticação
app.use('/auth', authRotes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
