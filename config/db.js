const mysql = require('mysql2');


const db = mysql.createPool({
    host:            process.env.DB_HOST     || 'localhost',
    port:            process.env.DB_PORT     || 3306,
    user:            process.env.DB_USER     || 'root',
    password:        process.env.DB_PASSWORD || '',
    database:        process.env.DB_NAME     || 'saquarema_verdee',
    ssl:             false,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit:      0,
});

// Testa a conexão na inicialização para dar feedback imediato ao desenvolvedor
db.getConnection((err, conn) => {
    if (err) {
        console.error('🛑 ERRO: MySQL não detectado. Verifique se o XAMPP/WAMP está ligado e se as credenciais no .env estão corretas.');
        console.error('   Detalhes:', err.message);
    } else {
        console.log('✅ Conexão estável com o Banco de Dados Local.');
        conn.release();
    }
});

// Garante que a coluna de vídeo existe na tabela (migração simples)
// Em produção, isso seria feito por um sistema de migrations (ex: Flyway, Knex migrations)
db.query(
    `ALTER TABLE eventos ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) DEFAULT NULL`,
    (err) => {
        if (err) console.log('ℹ️  Coluna video_url verificada (já existe ou tabela não encontrada).');
    }
);

module.exports = db;
