# 🌿 Saqua Verde

Plataforma híbrida de turismo para Saquarema - RJ. Disponível como **site web** e **aplicativo mobile (Android)**, com painel administrativo para gerenciamento de eventos, trilhas, praias e pontos turísticos.

---

## 📱 Plataformas

| Plataforma | Tecnologia | Descrição |
|---|---|---|
| Web | HTML, CSS, JavaScript | Site público + painel admin |
| Mobile | React Native + Expo | App Android com player de vídeo |
| Backend | Node.js + Express + MySQL | API REST compartilhada |

---

## ✨ Funcionalidades

### Público (Web e Mobile)
- Listagem de eventos, trilhas, praias e pontos turísticos
- Filtro visual por tipo com cores e emojis
- Exibição de data e hora dos eventos
- Player de vídeo nos cards (quando disponível)
- No mobile: vídeo abre em tela cheia

### Painel Administrativo
- Login seguro com JWT (token de 8 horas)
- Cadastrar, editar e excluir itens
- Upload de vídeo MP4 diretamente no formulário
- Barra de progresso de upload em tempo real
- Pré-visualização do vídeo antes de enviar
- Remoção de vídeo por item

---

## 🗂️ Estrutura do Projeto

```
saqua-verde-backend/          # Servidor Node.js
├── server.js                 # API REST + upload de vídeos
├── package.json
└── public/                   # Front-end web (servido pelo Express)
    ├── index.html            # Página pública
    ├── index.js
    ├── admin.html            # Painel administrativo
    ├── admin.js
    ├── login.html
    ├── login.js
    ├── styles.css
    └── videos/              # Vídeos enviados (gerado automaticamente)

saqua-verde-mobile/           # App React Native
├── App.js
├── app.json
├── package.json
└── src/
    ├── context/
    │   └── AuthContext.js    # Autenticação global JWT
    ├── navigation/
    │   ├── RootNavigator.js
    │   ├── PublicNavigator.js
    │   └── AdminNavigator.js
    ├── screens/
    │   ├── HomeScreen.js         # Lista pública de eventos
    │   ├── EventoDetailScreen.js # Detalhes + player de vídeo
    │   ├── LoginScreen.js        # Login admin
    │   ├── AdminListScreen.js    # Lista admin com CRUD
    │   └── AdminFormScreen.js    # Formulário criar/editar
    └── services/
        └── api.js               # Chamadas à API
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js v18+
- MySQL
- Expo Go (no celular) ou Android Studio

### 1. Backend

```bash
# Entre na pasta do backend
cd saqua-verde-backend

# Instale as dependências
npm install

# Configure o banco de dados MySQL
# Crie o banco: saquarema_verde
# Execute as tabelas abaixo

# Inicie o servidor
node server.js
```

**SQL para criar as tabelas:**
```sql
CREATE DATABASE IF NOT EXISTS saquarema_verde;
USE saquarema_verde;

CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  tipo VARCHAR(100),
  data_evento DATE,
  hora_evento TIME,
  video_url VARCHAR(500) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS administradores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL
);
```

**Criar admin via terminal:**
```bash
curl -X POST http://localhost:8080/api/register-admin \
  -H "Content-Type: application/json" \
  -d "{\"usuario\":\"admin\",\"senha\":\"sua_senha\",\"nome\":\"Seu Nome\"}"
```

### 2. App Mobile

```bash
# Entre na pasta do app
cd saqua-verde-mobile

# Instale as dependências
npm install
npx expo install expo-av expo-secure-store

# Configure o IP do backend em src/services/api.js
# BASE_URL = 'http://SEU_IP_LOCAL:8080'

# Inicie o app
npx expo start
```

Escaneie o QR Code com o **Expo Go** no celular.

---

## 🌐 Deploy em Produção

### Backend — Railway (Gratuito)
1. Crie uma conta em [railway.app](https://railway.app)
2. Crie um serviço MySQL no Railway
3. Faça deploy do backend pelo GitHub
4. Configure as variáveis de ambiente:

```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=saquarema_verde
SECRET_KEY=sua_chave_secreta
PORT=8080
```

5. Atualize `BASE_URL` no `api.js` do mobile com a URL gerada pelo Railway

### App Mobile — APK + Play Store
```bash
# Instale o EAS CLI
npm install -g eas-cli

# Login na conta Expo
eas login

# Gerar APK para testes
eas build -p android --profile preview

# Gerar bundle para Play Store
eas build -p android --profile production
```

---

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend:

```env
SECRET_KEY=sua_chave_super_secreta
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=saquarema_verde
PORT=8080
```

---

## 📦 Dependências Principais

### Backend
| Pacote | Uso |
|---|---|
| express | Servidor HTTP |
| mysql2 | Conexão com banco de dados |
| jsonwebtoken | Autenticação JWT |
| bcryptjs | Criptografia de senhas |
| multer | Upload de arquivos de vídeo |
| cors | Permitir requisições do mobile |

### Mobile
| Pacote | Uso |
|---|---|
| expo | Framework base |
| react-navigation | Navegação entre telas |
| expo-av | Player de vídeo em tela cheia |
| expo-secure-store | Armazenamento seguro do token JWT |

---

## 📸 Telas do App

- **Home** — Lista de eventos com cards coloridos por tipo
- **Detalhes** — Informações completas + botão de vídeo em tela cheia
- **Login Admin** — Autenticação segura
- **Admin Lista** — Gerenciamento com botões editar/excluir
- **Admin Formulário** — Cadastro e edição com upload de vídeo

---

## 👨‍💻 Desenvolvimento

Projeto desenvolvido como plataforma híbrida de turismo para Saquarema - RJ, transformando um site web simples em uma solução completa com app mobile nativo e suporte a vídeos.

**Tecnologias:** Node.js · Express · MySQL · React Native · Expo · JWT · Multer
