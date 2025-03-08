import express from 'express';
import router from './routes/index.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Configurar o dotenv
dotenv.config();

// Conectar ao banco de dados
connectDB();

// Configurar o Express
const app = express();
const port = 3000;

// Middleware para interpretar o corpo da requisição como JSON
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static('public'));

// Usar as rotas
app.use(router);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
