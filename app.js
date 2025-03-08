import express from 'express';
import router from './routes/index.js'; // Certifique-se de que o caminho está correto

const app = express();
const port = 3000;

app.use(express.static('public')); // Servir arquivos estáticos
app.use(router); // Usar as rotas

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
