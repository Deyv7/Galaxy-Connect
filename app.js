// /app.js
const express = require('express');
const app = express();

// Middleware para processar dados enviados no formulário (incluído no Express 4.16+)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rota de validação
const validationRoutes = require('./routes/validationRoutes');
app.use('/api', validationRoutes);

// Rotas
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
})

app.get('/registro', (req, res) => {
    res.sendFile(__dirname + '/public/registro.html');
})

// Servindo arquivos estáticos (CSS, JS, imagens, etc.)
app.use(express.static('public'));

// Porta do servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
