// ============================================================
// routes/eventos.js — Rotas de Eventos e Vídeos
// ============================================================
// Responsabilidade: CRUD completo de eventos e upload de vídeos.
// Todas as rotas de escrita são protegidas pelo middleware verifyToken.
// ============================================================
const express    = require('express');
const path       = require('path');
const fs         = require('fs');
const multer     = require('multer');
const db         = require('../config/db');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// -------------------------------------------------------
// CONFIGURAÇÃO DO MULTER (Upload de Vídeos)
// -------------------------------------------------------
const VIDEOS_DIR = path.join(__dirname, '..', 'public', 'videos');

// Cria a pasta de vídeos se não existir
if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
    console.log('📁 Pasta de vídeos criada em:', VIDEOS_DIR);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, VIDEOS_DIR),
    filename: (req, file, cb) => {
        // Sanitiza o nome do arquivo para evitar problemas com caracteres especiais
        const ext = path.extname(file.originalname);
        const safeName = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `${Date.now()}_${safeName}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // Limite de 500MB por arquivo
    fileFilter: (req, file, cb) => {
        const tiposPermitidos = ['video/mp4', 'video/webm', 'video/quicktime'];
        if (tiposPermitidos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo inválido. Apenas MP4, WebM e MOV são aceitos.'));
        }
    },
});

// -------------------------------------------------------
// VALIDAÇÃO DE INPUT (Campos obrigatórios para eventos)
// -------------------------------------------------------
/**
 * Valida os campos obrigatórios antes de inserir/atualizar.
 * Retorna um array de mensagens de erro (vazio se tudo estiver correto).
 */
const validarEvento = ({ nome, descricao, tipo }) => {
    const erros = [];
    if (!nome || nome.trim() === '')      erros.push('O campo "nome" é obrigatório.');
    if (!descricao || descricao.trim() === '') erros.push('O campo "descricao" é obrigatório.');
    if (!tipo || tipo.trim() === '')       erros.push('O campo "tipo" é obrigatório.');
    return erros;
};

// -------------------------------------------------------
// GET /api/eventos — Lista todos os eventos (PÚBLICO)
// -------------------------------------------------------
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM eventos ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar eventos:', err.message);
            return res.status(500).json({ message: 'Erro interno ao buscar os dados.' });
        }
        res.json(results);
    });
});

// -------------------------------------------------------
// GET /api/eventos/:id — Busca evento por ID (PÚBLICO)
// -------------------------------------------------------
router.get('/:id', (req, res) => {
    db.query('SELECT * FROM eventos WHERE id = ?', [req.params.id], (err, results) => {
        if (err) {
            console.error('Erro ao buscar evento:', err.message);
            return res.status(500).json({ message: 'Erro interno ao buscar o item.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Item não encontrado.' });
        }
        res.json(results[0]);
    });
});

// -------------------------------------------------------
// POST /api/eventos — Cria novo evento (PROTEGIDO)
// -------------------------------------------------------
router.post('/', verifyToken, (req, res) => {
    const { nome, descricao, tipo, data_evento, hora_evento } = req.body;

    // Valida campos obrigatórios antes de ir ao banco
    const erros = validarEvento({ nome, descricao, tipo });
    if (erros.length > 0) {
        return res.status(400).json({ message: 'Dados inválidos.', erros });
    }

    const sql = 'INSERT INTO eventos (nome, descricao, tipo, data_evento, hora_evento) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nome.trim(), descricao.trim(), tipo.trim(), data_evento || null, hora_evento || null], (err, result) => {
        if (err) {
            console.error('Erro ao criar evento:', err.message);
            return res.status(500).json({ message: 'Erro interno ao cadastrar o item.' });
        }
        res.status(201).json({ id: result.insertId, message: 'Item cadastrado com sucesso.' });
    });
});

// -------------------------------------------------------
// PUT /api/eventos/:id — Atualiza evento (PROTEGIDO)
// -------------------------------------------------------
router.put('/:id', verifyToken, (req, res) => {
    const { nome, descricao, tipo, data_evento, hora_evento } = req.body;

    // Valida campos obrigatórios antes de ir ao banco
    const erros = validarEvento({ nome, descricao, tipo });
    if (erros.length > 0) {
        return res.status(400).json({ message: 'Dados inválidos.', erros });
    }

    const sql = 'UPDATE eventos SET nome=?, descricao=?, tipo=?, data_evento=?, hora_evento=? WHERE id=?';
    db.query(sql, [nome.trim(), descricao.trim(), tipo.trim(), data_evento || null, hora_evento || null, req.params.id], (err) => {
        if (err) {
            console.error('Erro ao atualizar evento:', err.message);
            return res.status(500).json({ message: 'Erro interno ao atualizar o item.' });
        }
        res.json({ message: 'Item atualizado com sucesso.' });
    });
});

// -------------------------------------------------------
// DELETE /api/eventos/:id — Remove evento (PROTEGIDO)
// -------------------------------------------------------
router.delete('/:id', verifyToken, (req, res) => {
    db.query('DELETE FROM eventos WHERE id = ?', [req.params.id], (err) => {
        if (err) {
            console.error('Erro ao excluir evento:', err.message);
            return res.status(500).json({ message: 'Erro interno ao excluir o item.' });
        }
        res.status(204).send();
    });
});

// -------------------------------------------------------
// POST /api/eventos/:id/video — Upload de vídeo (PROTEGIDO)
// -------------------------------------------------------
router.post('/:id/video', verifyToken, upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Nenhum vídeo foi enviado.' });
    }

    const videoPath = `videos/${req.file.filename}`;
    db.query('UPDATE eventos SET video_url = ? WHERE id = ?', [videoPath, req.params.id], (err) => {
        if (err) {
            console.error('Erro ao vincular vídeo:', err.message);
            return res.status(500).json({ message: 'Erro ao vincular o vídeo ao evento.' });
        }
        res.json({ message: 'Vídeo enviado e vinculado com sucesso!', video_url: videoPath });
    });
});

// -------------------------------------------------------
// DELETE /api/eventos/:id/video — Remove vídeo (PROTEGIDO)
// -------------------------------------------------------
router.delete('/:id/video', verifyToken, (req, res) => {
    db.query('SELECT video_url FROM eventos WHERE id = ?', [req.params.id], (err, results) => {
        if (err) {
            console.error('Erro ao buscar vídeo:', err.message);
            return res.status(500).json({ message: 'Erro ao buscar o vídeo.' });
        }

        // Se existe um arquivo físico no disco, remove de forma assíncrona
        if (results.length > 0 && results[0].video_url) {
            const fullPath = path.join(__dirname, '..', 'public', results[0].video_url);
            // fs.unlink (assíncrono) é melhor que fs.unlinkSync pois não bloqueia o servidor
            fs.unlink(fullPath, (unlinkErr) => {
                if (unlinkErr) console.log('ℹ️  Arquivo de vídeo não encontrado no disco (já foi removido).');
            });
        }

        db.query('UPDATE eventos SET video_url = NULL WHERE id = ?', [req.params.id], () => {
            res.json({ message: 'Vídeo removido com sucesso.' });
        });
    });
});

// -------------------------------------------------------
// POST /api/manutencao/reset-id — Reinicia contagem (PROTEGIDO)
// -------------------------------------------------------
router.post('/manutencao/reset-id', verifyToken, (req, res) => {
    db.query('ALTER TABLE eventos AUTO_INCREMENT = 1', () => {
        res.json({ message: 'Contador de IDs reiniciado.' });
    });
});

module.exports = router;
