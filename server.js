// ============================================================
// server.js — Backend Saqua Verde (com suporte a vídeos)
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

const SECRET_KEY = process.env.SECRET_KEY || 'sua_chave_secreta_muito_segura_troque_em_producao';
const PORT = process.env.PORT || 8080;

// -------------------------------------------------------
// PASTA DE VÍDEOS — cria automaticamente se não existir
// -------------------------------------------------------
const VIDEOS_DIR = path.join(__dirname, 'public', 'videos');
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  console.log('📁 Pasta public/videos criada automaticamente.');
}

// -------------------------------------------------------
// MULTER — configuração de upload de vídeos
// -------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, VIDEOS_DIR),
  filename: (req, file, cb) => {
    // Nome único: timestamp + nome original sanitizado
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50);
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB máximo
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de vídeo são permitidos (MP4, WebM, OGG, MOV).'));
    }
  },
});

// -------------------------------------------------------
// BANCO DE DADOS
// -------------------------------------------------------
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'saquarema_verdee',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('🛑 ERRO: Falha ao conectar ao banco de dados:', err.message);
    process.exit(1);
  }
  console.log('✅ Pool de conexões ao banco de dados criado com sucesso!');
  connection.release();

  // Adiciona coluna video_url se não existir
  db.query(`
    ALTER TABLE eventos ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) DEFAULT NULL
  `, (err) => {
    if (err) {
      // MySQL < 5.7 não suporta IF NOT EXISTS no ALTER
      // Tenta verificar se coluna já existe
      db.query(`SHOW COLUMNS FROM eventos LIKE 'video_url'`, (err2, rows) => {
        if (!err2 && rows.length === 0) {
          db.query(`ALTER TABLE eventos ADD COLUMN video_url VARCHAR(500) DEFAULT NULL`, (err3) => {
            if (!err3) console.log('✅ Coluna video_url adicionada à tabela eventos.');
          });
        }
      });
    } else {
      console.log('✅ Coluna video_url verificada/criada na tabela eventos.');
    }
  });
});

// -------------------------------------------------------
// MIDDLEWARES
// -------------------------------------------------------
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// -------------------------------------------------------
// AUTENTICAÇÃO
// -------------------------------------------------------
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ message: 'Token não fornecido.' });
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(403).json({ message: 'Formato de token inválido.' });
  }
  jwt.verify(parts[1], SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token inválido ou expirado.' });
    req.usuario = decoded.usuario;
    next();
  });
};

// -------------------------------------------------------
// HEALTH CHECK
// -------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// -------------------------------------------------------
// ENDPOINTS PÚBLICOS
// -------------------------------------------------------
app.get('/api/eventos', (req, res) => {
  db.query('SELECT * FROM eventos ORDER BY data_evento DESC, hora_evento DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro interno ao listar eventos.' });
    res.json(results);
  });
});

app.get('/api/eventos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: 'ID inválido.' });
  db.query('SELECT * FROM eventos WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro interno.' });
    if (results.length === 0) return res.status(404).json({ message: 'Item não encontrado.' });
    res.json(results[0]);
  });
});

// -------------------------------------------------------
// UPLOAD DE VÍDEO (PROTEGIDO)
// POST /api/eventos/:id/video
// -------------------------------------------------------
app.post('/api/eventos/:id/video', verifyToken, upload.single('video'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: 'ID inválido.' });
  if (!req.file) return res.status(400).json({ message: 'Nenhum arquivo enviado.' });

  const videoUrl = `/videos/${req.file.filename}`;

  // Se já tinha vídeo, deleta o arquivo antigo
  db.query('SELECT video_url FROM eventos WHERE id = ?', [id], (err, results) => {
    if (!err && results.length > 0 && results[0].video_url) {
      const oldFile = path.join(__dirname, 'public', results[0].video_url);
      if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
    }

    db.query('UPDATE eventos SET video_url = ? WHERE id = ?', [videoUrl, id], (err2, result) => {
      if (err2) return res.status(500).json({ message: 'Erro ao salvar vídeo no banco.' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Evento não encontrado.' });
      res.json({ message: 'Vídeo enviado com sucesso!', video_url: videoUrl });
    });
  });
});

// REMOVER VÍDEO (PROTEGIDO)
// DELETE /api/eventos/:id/video
app.delete('/api/eventos/:id/video', verifyToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: 'ID inválido.' });

  db.query('SELECT video_url FROM eventos WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Evento não encontrado.' });

    const videoUrl = results[0].video_url;
    if (videoUrl) {
      const filePath = path.join(__dirname, 'public', videoUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    db.query('UPDATE eventos SET video_url = NULL WHERE id = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ message: 'Erro ao remover vídeo.' });
      res.json({ message: 'Vídeo removido com sucesso.' });
    });
  });
});

// -------------------------------------------------------
// AUTENTICAÇÃO
// -------------------------------------------------------
app.post('/api/register-admin', async (req, res) => {
  const { usuario, senha, nome } = req.body;
  if (!usuario || !senha || !nome) return res.status(400).json({ message: 'Nome, usuário e senha são obrigatórios.' });
  if (senha.length < 6) return res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres.' });
  try {
    const hashedPassword = await bcrypt.hash(senha, 10);
    db.query('INSERT INTO administradores (usuario, senha, nome) VALUES (?, ?, ?)',
      [usuario.trim(), hashedPassword, nome.trim()],
      (err, result) => {
        if (err) {
          if (err.errno === 1062) return res.status(409).json({ message: 'Usuário já existe.' });
          return res.status(500).json({ message: 'Erro interno ao cadastrar.' });
        }
        res.status(201).json({ message: 'Administrador cadastrado!', id: result.insertId });
      }
    );
  } catch { res.status(500).json({ message: 'Erro interno.' }); }
});

app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) return res.status(400).json({ message: 'Usuário e senha obrigatórios.' });
  db.query('SELECT * FROM administradores WHERE usuario = ?', [usuario.trim()], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro interno.' });
    if (results.length === 0) return res.status(401).json({ message: 'Usuário ou senha incorretos.' });
    const admin = results[0];
    if (!bcrypt.compareSync(senha, admin.senha)) return res.status(401).json({ message: 'Usuário ou senha incorretos.' });
    const token = jwt.sign({ usuario: admin.usuario, id: admin.id }, SECRET_KEY, { expiresIn: '8h' });
    res.json({ token, message: 'Login realizado com sucesso!' });
  });
});

// -------------------------------------------------------
// CRUD PROTEGIDO
// -------------------------------------------------------
app.post('/api/eventos', verifyToken, (req, res) => {
  const { nome, descricao, tipo, data_evento, hora_evento } = req.body;
  if (!nome || !descricao || !data_evento) return res.status(400).json({ message: 'Nome, descrição e data são obrigatórios.' });
  const tiposValidos = ['Evento', 'Praia', 'Trilha', 'Ponto Turístico'];
  if (tipo && !tiposValidos.includes(tipo)) return res.status(400).json({ message: 'Tipo inválido.' });
  db.query(
    'INSERT INTO eventos (nome, descricao, tipo, data_evento, hora_evento) VALUES (?, ?, ?, ?, ?)',
    [nome.trim(), descricao.trim(), tipo, data_evento, hora_evento || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erro ao cadastrar item.' });
      res.status(201).json({ id: result.insertId, nome, descricao, tipo, data_evento, hora_evento, message: 'Item cadastrado!' });
    }
  );
});

app.put('/api/eventos/:id', verifyToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: 'ID inválido.' });
  const { nome, descricao, tipo, data_evento, hora_evento } = req.body;
  if (!nome || !descricao || !data_evento) return res.status(400).json({ message: 'Nome, descrição e data são obrigatórios.' });
  db.query(
    'UPDATE eventos SET nome = ?, descricao = ?, tipo = ?, data_evento = ?, hora_evento = ? WHERE id = ?',
    [nome.trim(), descricao.trim(), tipo, data_evento, hora_evento || null, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Falha ao atualizar item.' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Item não encontrado.' });
      res.status(200).json({ message: 'Item atualizado!', id });
    }
  );
});

app.delete('/api/eventos/:id', verifyToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ message: 'ID inválido.' });

  // Deleta vídeo associado antes de excluir o evento
  db.query('SELECT video_url FROM eventos WHERE id = ?', [id], (err, results) => {
    if (!err && results.length > 0 && results[0].video_url) {
      const filePath = path.join(__dirname, 'public', results[0].video_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    db.query('DELETE FROM eventos WHERE id = ?', [id], (err2, result) => {
      if (err2) return res.status(500).json({ message: 'Erro ao excluir item.' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Item não encontrado.' });
      res.status(204).send();
    });
  });
});

app.post('/api/manutencao/reset-id', verifyToken, (req, res) => {
  db.query('ALTER TABLE eventos AUTO_INCREMENT = 1', (err) => {
    if (err) return res.status(500).json({ message: 'Falha ao resetar contador.' });
    res.status(200).json({ message: 'Contador resetado com sucesso.' });
  });
});

// -------------------------------------------------------
// INICIAR SERVIDOR
// -------------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`   Front-end web: http://localhost:${PORT}/`);
  console.log(`   API:           http://localhost:${PORT}/api/health`);
  console.log(`   Vídeos:        http://localhost:${PORT}/videos/`);
  console.log(`   Para o app mobile, use o IP da sua máquina na rede local.\n`);
});
