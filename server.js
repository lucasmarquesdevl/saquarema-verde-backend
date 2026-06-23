// ============================================================
// server.js — Saquarema Verde Backend (Ponto de Entrada)
// ============================================================
// Este arquivo é o coração da aplicação. Ele:
// 1. Carrega as variáveis de ambiente do arquivo .env
// 2. Configura os middlewares globais (cors, body-parser, etc.)
// 3. Registra as rotas da API (importadas de /routes)
// 4. Inicia o servidor na porta configurada
// ============================================================

// ✅ PASSO 1: Carrega as variáveis de ambiente ANTES de qualquer outra coisa.
//    As variáveis ficam em process.env.NOME_DA_VARIAVEL
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

// -------------------------------------------------------
// MIDDLEWARES GLOBAIS
// -------------------------------------------------------

// CORS: controla quais origens podem acessar esta API.
// Em desenvolvimento, CORS_ORIGIN=* libera tudo.
// Em produção, configure CORS_ORIGIN=https://seusite.com no .env
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve os arquivos estáticos do painel web (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve os vídeos enviados pelo painel web
app.use('/videos', express.static(path.join(__dirname, 'public', 'videos')));

// -------------------------------------------------------
// RATE LIMITING — Proteção contra força bruta no login
// -------------------------------------------------------
// Limita a rota de login a no máximo 10 tentativas por IP a cada 15 minutos.
// Isso impede ataques de força bruta na senha do administrador.
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