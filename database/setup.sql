-- ============================================================
-- database/setup.sql — Saquarema Verde — Script de Configuração
-- ============================================================
-- INSTRUÇÕES DE USO:
-- 1. Abra o MySQL Workbench, phpMyAdmin ou o terminal MySQL.
-- 2. Execute este script completo para criar o banco e as tabelas.
-- 3. Após executar, configure as credenciais no arquivo .env
-- ============================================================

-- Cria o banco de dados (se ainda não existir)
CREATE DATABASE IF NOT EXISTS saquarema_verde
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Seleciona o banco para uso
USE saquarema_verde;

-- -------------------------------------------------------
-- TABELA: administradores
-- Armazena os usuários com acesso ao painel administrativo.
-- As senhas são armazenadas como hash bcrypt (NUNCA texto puro).
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS administradores (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    usuario    VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nome de usuário para login',
    senha      VARCHAR(255) NOT NULL         COMMENT 'Hash bcrypt da senha',
    nome       VARCHAR(150) NOT NULL         COMMENT 'Nome de exibição do administrador',
    criado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- TABELA: eventos
-- Armazena todos os atrativos turísticos: eventos, praias, trilhas e pontos.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS eventos (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    nome         VARCHAR(200) NOT NULL         COMMENT 'Nome do evento ou atrativo',
    descricao    TEXT NOT NULL                 COMMENT 'Descrição detalhada',
    tipo         ENUM('Evento', 'Praia', 'Trilha', 'Ponto Turístico') NOT NULL
                                               COMMENT 'Categoria do item',
    data_evento  DATE DEFAULT NULL             COMMENT 'Data do evento (nulo para praias/trilhas)',
    hora_evento  TIME DEFAULT NULL             COMMENT 'Horário do evento (opcional)',
    video_url    VARCHAR(500) DEFAULT NULL     COMMENT 'Caminho relativo do vídeo em /public/videos/',
    criado_em    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- DADOS INICIAIS (Seed) — Administrador Padrão
-- -------------------------------------------------------
-- ATENÇÃO: Esta senha é "admin123" gerada com bcrypt (salt 10).
-- Troque a senha imediatamente após o primeiro login!
-- Para gerar um novo hash, use: node -e "const b=require('bcryptjs'); b.hash('suasenha',10).then(h=>console.log(h));"
INSERT IGNORE INTO administradores (usuario, senha, nome) VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWC',
    'Administrador Principal'
);

-- -------------------------------------------------------
-- DADOS INICIAIS (Seed) — Eventos de Exemplo
-- -------------------------------------------------------
INSERT IGNORE INTO eventos (id, nome, descricao, tipo, data_evento, hora_evento) VALUES
(1, 'Festa de Nossa Senhora de Nazareth',
 'Festa religiosa e cultural em homenagem à padroeira de Saquarema. Procissão, shows e muita tradição popular.',
 'Evento', '2026-09-08', '09:00:00'),
(2, 'Festival de Inverno de Saquarema',
 'Festival cultural com shows, exposições, gastronomia e atividades para toda a família durante o inverno.',
 'Evento', '2026-07-15', '14:00:00'),
(3, 'Praia de Itaúna',
 'Mundialmente famosa pelas ondas perfeitas para o surfe. Cenário deslumbrante com lagoa ao fundo.',
 'Praia', NULL, NULL),
(4, 'Trilha da Restinga de Massambaba',
 'Trilha ecológica pela restinga com vista para a Lagoa de Araruama. Ideal para observação de aves.',
 'Trilha', NULL, NULL),
(5, 'Igreja Nossa Senhora de Nazareth',
 'Cartão-postal de Saquarema. Igreja histórica do século XVII localizada sobre uma rocha à beira-mar.',
 'Ponto Turístico', NULL, NULL);

-- -------------------------------------------------------
-- CONFIRMAÇÃO
-- -------------------------------------------------------
SELECT 'Banco de dados saquarema_verde configurado com sucesso!' AS Status;
SELECT COUNT(*) AS total_administradores FROM administradores;
SELECT COUNT(*) AS total_eventos FROM eventos;
