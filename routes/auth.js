// ============================================================
// routes/auth.js — Rotas de Autenticação de Administradores
// ============================================================
// Responsabilidade: login e cadastro de administradores.
// ⚠️  A rota /register-admin é protegida por JWT — apenas um
//     admin já autenticado pode criar outro admin.
// ============================================================
const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../config/db');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// -------------------------------------------------------
// POST /api/login — Autenticação de Administrador (PÚBLICO)
// -------------------------------------------------------
// O rate limiting para esta rota é aplicado no server.js
router.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    // Valida se os campos foram enviados
    if (!usuario || !senha) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    db.query('SELECT * FROM administradores WHERE usuario = ?', [usuario.trim()], (err, results) => {
        if (err) {
            console.error('Erro ao buscar administrador:', err.message);
            return res.status(500).json({ message: 'Erro interno no servidor.' });
        }

        // Verifica se o usuário existe e se a senha está correta (bcrypt)
        if (results.length > 0 && bcrypt.compareSync(senha, results[0].senha)) {
            // Gera o token JWT com prazo de 8 horas
            const token = jwt.sign(
                { id: results[0].id, usuario: results[0].usuario },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );
            return res.json({ token, message: 'Bem-vindo ao Painel Saquarema Verde!' });
        }

        // Resposta genérica para não revelar se o usuário existe ou não (segurança)
        res.status(401).json({ message: 'Usuário ou senha incorretos.' });
    });
});

// -------------------------------------------------------
// POST /api/register-admin — Cria novo admin (🔐 PROTEGIDO)
// -------------------------------------------------------
// ✅ CORREÇÃO DE SEGURANÇA: Esta rota agora exige autenticação.
//    Apenas um admin já logado pode criar outro admin.
router.post('/register-admin', verifyToken, async (req, res) => {
    const { usuario, senha, nome } = req.body;

    if (!usuario || !senha || !nome) {
        return res.status(400).json({ message: 'Usuário, senha e nome são obrigatórios.' });
    }

    try {
        // Gera o hash da senha com custo 10 (bcrypt)
        const hash = await bcrypt.hash(senha, 10);

        db.query(
            'INSERT INTO administradores (usuario, senha, nome) VALUES (?, ?, ?)',
            [usuario.trim(), hash, nome.trim()],
            (err) => {
                if (err) {
                    // Código 1062 = Duplicate Entry no MySQL
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ message: 'Este nome de usuário já está em uso.' });
                    }
                    console.error('Erro ao criar admin:', err.message);
                    return res.status(500).json({ message: 'Erro interno ao criar administrador.' });
                }
                res.status(201).json({ message: 'Administrador criado com sucesso.' });
            }
        );
    } catch (error) {
        console.error('Erro ao gerar hash de senha:', error.message);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

module.exports = router;
