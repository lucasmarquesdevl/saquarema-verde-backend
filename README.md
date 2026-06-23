# 🌿 Saquarema Verde Online

Uma plataforma digital desenvolvida para facilitar o acesso às informações ambientais, turísticas e culturais do Circuito Saquarema Verde, com foco no Parque Estadual da Costa do Sol e na Reserva Ecológica Estadual de Jacarepiá.

## 👥 Membros da Equipe
- **Cláudia Trindade Marques**
- **Elizeu da Costa Oliveira**
- **Lucas Trindade Marques**

---

## 📘 Visão Geral do Projeto
O município de Saquarema, no Rio de Janeiro, é marcado por uma rica diversidade geográfica: áreas costeiras mundialmente conhecidas pelo surf e ambientes montanhosos que atraem moradores e turistas em busca de natureza e aventura.

Apesar dessa diversidade, muitos visitantes enfrentam dificuldades para encontrar informações atualizadas e confiáveis sobre trilhas, eventos, regras de visitação e condições ambientais. Pensando nisso, surge a plataforma:

### 🖥️ Saquarema Verde Online
Um website intuitivo e acessível que centraliza informações essenciais para promover o ecoturismo, a conscientização ambiental e a aproximação entre visitantes e a comunidade local.

---

## 🎯 O Desafio
Desenvolver uma solução digital capaz de:
- Unificar informações sobre biodiversidade, trilhas, cachoeiras e eventos do Circuito Saquarema Verde.
- Proporcionar acesso fácil e rápido a dados atualizados.
- Auxiliar o planejamento de visitas, tornando o turismo mais sustentável, consciente e seguro.
- Atender às demandas dos parques e reservas com foco na experiência do usuário.
- Facilitar o planejamento de visitas, reunindo dados sobre trilhas, cachoeiras, biodiversidade e mirantes.
- Centralizar dados atualizados: condições das trilhas, regras, horários de funcionamento, disponibilidade.
- Permitir aos administradores atualizar rapidamente eventos e disponibilidade.
- Promover o turismo sustentável e a interação com a comunidade local.

---

## 👥 Atores Envolvidos
### 👨‍💼 Administradores
- Responsáveis pela gestão do conteúdo do site.
- Podem atualizar informações sobre trilhas, eventos, disponibilidade e novidades.
- Devem ter acesso a área restrita, segura e com autenticação.

### 🧭 Visitantes
- Usuários que buscam informações sobre ecoturismo.
- Procuram trilhas, atividades ao ar livre, dicas de segurança, eventos e regras de visitação.

---

## 🛠️ Stack Tecnológica (Backend)
Com base no `package.json` e `server.js` fornecidos, a arquitetura atual do Backend é a seguinte:
- **Linguagem:** JavaScript (Node.js)
- **Framework:** Express.js
- **Banco de Dados:** MySQL (com mysql2)
- **Autenticação:** JWT (JSON Web Tokens) com `jsonwebtoken` e `bcryptjs` para hashing de senhas.
- **Middleware:** `cors` e `body-parser`
- **Uploads:** `multer` (para vídeos locais)

---

## 🚀 Como Executar o Projeto (Backend)
Siga os passos abaixo para configurar e rodar o servidor localmente.

### 1. Pré-Requisitos
Certifique-se de ter instalado:
- Node.js (v18+)
- MySQL (via XAMPP, WAMP ou MySQL Workbench)

### 2. Configuração do Banco de Dados
Crie um banco de dados chamado `saquarema_verdee`.
*(Nota: Certifique-se de iniciar o Apache e MySQL no seu servidor local)*

### 3. Instalação e Inicialização
1. Clone o repositório:
   ```bash
   git clone https://github.com/lucasmarquesdevl/saquarema-verde-backend.git
   cd saquarema-verde-backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor:
   ```bash
   npm start
   ```
   *O servidor estará rodando em http://localhost:8080*

---

## 🛠️ Requisitos do Sistema

### 🔐 Login para Administradores
- Área restrita com autenticação obrigatória.
- Proteção e privacidade dos dados dos administradores.
- Em um ambiente de produção, credenciais NUNCA devem ser codificadas diretamente (Use Variáveis de Ambiente `process.env`).

### 🕒 Gestão de Disponibilidade
- Configuração de horários de funcionamento das trilhas e eventos.
- Controle de temporadas e atualizações em tempo real.

### ⚡ Desempenho Rápido
- O sistema deve suportar alto volume de acessos simultâneos.
- Respostas rápidas e fluidez em toda a navegação.

### 🎨 Interface Intuitiva
- Navegação simples e acessível.
- Design pensado para todos os públicos, incluindo turistas sem experiência digital.

### 🔒 Segurança de Dados
- Proteção de credenciais e informações administrativas.
- Boas práticas de segurança e prevenção de ataques.

---

## 🌎 Impacto Esperado
Este projeto tem forte impacto social e ambiental:
- Incentiva o turismo sustentável.
- Facilita o acesso a áreas naturais pouco divulgadas.
- Aproxima visitantes da comunidade local e da natureza.
- Promove a conscientização ambiental e o cuidado com trilhas e reservas.
- Auxilia parques e reservas na organização e comunicação com o público.

## 📌 Objetivo Geral
Criar um website moderno, funcional e seguro que simplifique o acesso às informações do Circuito Saquarema Verde, promovendo experiências enriquecedoras e responsáveis nas áreas naturais da região.

## 🤝 Contribuição
O projeto incentiva estudantes, profissionais e entusiastas a desenvolvem soluções inovadoras e colaborativas. Todo insight é bem-vindo na construção de uma plataforma cada vez mais eficiente.

---
**Entregáveis:**
- **Protótipos:** [Ver Telas e Protótipos Web (PROTOTIPOS.md)](./PROTOTIPOS.md)
- **Apresentação:** [Slides da Apresentação (Apresentacao.pdf)](./Apresentacao.pdf)
