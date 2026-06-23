require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const bodyParser  = require('body-parser');
const path        = require('path');
const rateLimit   = require('express-rate-limit');

// --- Importa os módulos do próprio projeto ---
const db           = require('./config/db');       // Inicializa e testa a conexão com o banco
const eventosRouter = require('./routes/eventos'); // Rotas de CRUD de eventos e vídeos
const authRouter    = require('./routes/auth');    // Rotas de login e criação de admin

const app  = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));


app.use('/videos', express.static(path.join(__dirname, 'public', 'videos')));


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10,                   // máximo de 10 tentativas
    message: { message: 'Muitas tentativas de login. Aguarde 15 minutos e tente novamente.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// -------------------------------------------------------
// ROTAS DA API
// -------------------------------------------------------
app.use('/api/eventos', eventosRouter);  // GET, POST, PUT, DELETE em /api/eventos
app.use('/api',         loginLimiter);   // Aplica rate limit nas rotas de auth
app.use('/api',         authRouter);     // POST /api/login, POST /api/register-admin

// -------------------------------------------------------
// ROTA CATCH-ALL — Serve o frontend para qualquer URL não-API
// -------------------------------------------------------
// Necessário para o Express 5: usa regex pura para capturar qualquer rota
// que NÃO comece com /api, servindo o index.html do painel web.
app.get(/^(?!\/api).*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// -------------------------------------------------------
// INICIALIZAÇÃO DO SERVIDOR
// -------------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
    console.log('=============================================');
    console.log(`🌿 SAQUAREMA VERDE RODANDO`);
    console.log(`🔗 Interface Web: http://localhost:${PORT}`);
    console.log(`📁 Vídeos em:    public/videos/`);
    console.log('=============================================');
});