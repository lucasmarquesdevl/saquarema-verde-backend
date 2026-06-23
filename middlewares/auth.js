// ============================================================
// middlewares/auth.js — Middleware de Autenticação JWT
// ============================================================
// Responsabilidade: verificar se o token JWT enviado pelo
// cliente é válido antes de permitir o acesso a rotas protegidas.
// ============================================================
const jwt = require('jsonwebtoken');

/**
 * Middleware que protege rotas administrativas.
 * Verifica o token JWT no cabeçalho 'Authorization: Bearer <token>'.
 * Se o token for válido, adiciona os dados do usuário em req.usuario e chama next().
 * Se não for válido, retorna erro 401 ou 403.
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 1. Verifica se o cabeçalho de autorização foi enviado
    if (!authHeader) {
        return res.status(403).json({ message: 'Acesso restrito. Token não fornecido.' });
    }

    // 2. Extrai o token do formato "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // 3. Verifica a validade do token usando a chave secreta do .env
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Sessão inválida ou expirada. Faça login novamente.' });
        }
        // Adiciona os dados do usuário decodificado na requisição
        req.usuario = decoded.usuario;
        next();
    });
};

module.exports = { verifyToken };
