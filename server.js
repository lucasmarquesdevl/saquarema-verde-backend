// ============================================================
// server.js — Backend Saqua Verde (Express 5 Definitive Fix)
// ============================================================
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

// -------------------------------------------------------
// CONFIGURAÇÕES E AMBIENTE LOCAL
// -------------------------------------------------------
const SECRET_KEY = 'chave_mestra_saquarema_2026';
const PORT = 8080;

// Pasta de vídeos vinculada ao diretório public definido no README
const VIDEOS_DIR = path.join(__dirname, 'public', 'videos');

if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
    console.log('📁 Estrutura de diretórios para vídeos preparada.');
}

// -------------------------------------------------------
// MULTER — CONFIGURAÇÃO DE UPLOAD
// -------------------------------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, VIDEOS_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const safeName = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `${Date.now()}_${safeName}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // Limite de 500MB
    fileFilter: (req, file, cb) => {
        const tipos = ['video/mp4', 'video/webm', 'video/quicktime'];
        tipos.includes(file.mimetype) ? cb(null, true) : cb(new Error('Tipo inválido.'));
    },
});

// -------------------------------------------------------
// BANCO DE DADOS (CONFIGURADO PARA LOCALHOST)
// -------------------------------------------------------
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Padrão XAMPP/WAMP
    database: 'saquarema_verdee',
    port: 3306,
    ssl: false, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Verificação de Conexão Inicial
db.getConnection((err, conn) => {
    if (err) {
        console.error('🛑 ERRO: MySQL não detectado. Ligue o XAMPP/WAMP.');
    } else {
        console.log('✅ Conexão estável com o Banco de Dados Local.');
        conn.release();
    }
});

// Migração simples para garantir a coluna de vídeo
db.query(`ALTER TABLE eventos ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) DEFAULT NULL`, (err) => {
    if (err) console.log('ℹ️ Coluna video_url verificada.');
});

// -------------------------------------------------------
// MIDDLEWARES DE SISTEMA
// -------------------------------------------------------
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(VIDEOS_DIR));

// -------------------------------------------------------
// PROTEÇÃO DE ROTAS (JWT)
// -------------------------------------------------------
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).json({ message: 'Acesso restrito.' });
    
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Sessão inválida.' });
        req.usuario = decoded.usuario;
        next();
    });
};

// -------------------------------------------------------
// API - EVENTOS E ATRAÇÕES
// -------------------------------------------------------
app.get('/api/eventos', (req, res) => {
    const sql = 'SELECT * FROM eventos ORDER BY data_evento DESC, hora_evento DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erro ao buscar dados.' });
        res.json(results);
    });
});

app.get('/api/eventos/:id', (req, res) => {
    db.query('SELECT * FROM eventos WHERE id = ?', [req.params.id], (err, resu) => {
        if (err || resu.length === 0) return res.status(404).json({ message: 'Item inexistente.' });
        res.json(resu[0]);
    });
});

app.post('/api/eventos', verifyToken, (req, res) => {
    const { nome, descricao, tipo, data_evento, hora_evento } = req.body;
    const sql = 'INSERT INTO eventos (nome, descricao, tipo, data_evento, hora_evento) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nome, descricao, tipo, data_evento, hora_evento], (err, result) => {
        if (err) return res.status(500).json({ message: 'Erro no cadastro.' });
        res.status(201).json({ id: result.insertId });
    });
});

app.put('/api/eventos/:id', verifyToken, (req, res) => {
    const { nome, descricao, tipo, data_evento, hora_evento } = req.body;
    const sql = 'UPDATE eventos SET nome=?, descricao=?, tipo=?, data_evento=?, hora_evento=? WHERE id=?';
    db.query(sql, [nome, descricao, tipo, data_evento, hora_evento, req.params.id], (err) => {
        if (err) return res.status(500).json({ message: 'Erro na atualização.' });
        res.json({ message: 'Atualizado com sucesso.' });
    });
});

app.delete('/api/eventos/:id', verifyToken, (req, res) => {
    db.query('DELETE FROM eventos WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).send();
        res.status(204).send();
    });
});

// -------------------------------------------------------
// API - GESTÃO DE VÍDEOS
// -------------------------------------------------------
app.post('/api/eventos/:id/video', verifyToken, upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Nenhum vídeo enviado.' });
    const videoPath = `videos/${req.file.filename}`;
    db.query('UPDATE eventos SET video_url = ? WHERE id = ?', [videoPath, req.params.id], (err) => {
        if (err) return res.status(500).json({ message: 'Erro ao vincular vídeo.' });
        res.json({ message: 'Vídeo carregado!', video_url: videoPath });
    });
});

app.delete('/api/eventos/:id/video', verifyToken, (req, res) => {
    db.query('SELECT video_url FROM eventos WHERE id = ?', [req.params.id], (err, resu) => {
        if (resu.length > 0 && resu[0].video_url) {
            const fullPath = path.join(__dirname, 'public', resu[0].video_url);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
        db.query('UPDATE eventos SET video_url = NULL WHERE id = ?', [req.params.id], () => {
            res.json({ message: 'Vídeo excluído.' });
        });
    });
});

// -------------------------------------------------------
// API - AUTENTICAÇÃO E ADMIN
// -------------------------------------------------------
app.post('/api/login', (req, res) => {
    const { usuario, senha } = req.body;
    db.query('SELECT * FROM administradores WHERE usuario = ?', [usuario], (err, results) => {
        if (results.length > 0 && bcrypt.compareSync(senha, results[0].senha)) {
            const token = jwt.sign({ id: results[0].id }, SECRET_KEY, { expiresIn: '8h' });
            return res.json({ token, message: 'Bem-vindo!' });
        }
        res.status(401).json({ message: 'Credenciais inválidas.' });
    });
});

app.post('/api/register-admin', async (req, res) => {
    const { usuario, senha, nome } = req.body;
    const hash = await bcrypt.hash(senha, 10);
    db.query('INSERT INTO administradores (usuario, senha, nome) VALUES (?, ?, ?)',
    [usuario, hash, nome], (err) => {
        if (err) return res.status(409).json({ message: 'Usuário já existe.' });
        res.status(201).json({ message: 'Admin criado.' });
    });
});

// -------------------------------------------------------
// MANUTENÇÃO E INICIALIZAÇÃO
// -------------------------------------------------------
app.post('/api/manutencao/reset-id', verifyToken, (req, res) => {
    db.query('ALTER TABLE eventos AUTO_INCREMENT = 1', (err) => {
        res.json({ message: 'Contador reiniciado.' });
    });
});

// SOLUÇÃO DEFINITIVA EXPRESS 5: Regex puro para capturar qualquer rota
app.get(/^(?!\/api).*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('=============================================');
    console.log(`🌿 SAQUAREMA VERDE RODANDO LOCALMENTE`);
    console.log(`🔗 Interface: http://localhost:${PORT}`);
    console.log(`📁 Vídeos: ${VIDEOS_DIR}`);
    console.log('=============================================');
    console.log(`🚀 Servidor acessível na rede: http://192.168.1.102:${PORT}`);
});
// FIM DO ARQUIVO - LINHA 240