# 📡 API Reference — Saquarema Verde Backend

Base URL local: `http://localhost:8080`  
Autenticação: **Bearer Token (JWT)**  
Formato: **JSON** (exceto upload de vídeo, que usa `multipart/form-data`)

---

## 🔐 Autenticação

### POST `/api/login`
Autentica um administrador e retorna um token JWT.

> **Rate Limit:** Máximo de 10 tentativas por IP a cada 15 minutos.

**Body (JSON):**
```json
{ "usuario": "admin", "senha": "suasenha" }
```
**Resposta de Sucesso (200):**
```json
{ "token": "eyJhbGciOiJ...", "message": "Bem-vindo ao Painel Saquarema Verde!" }
```
**Resposta de Erro (401):**
```json
{ "message": "Usuário ou senha incorretos." }
```

---

### POST `/api/register-admin`
Cria um novo administrador. **🔐 Requer token JWT.**

**Headers:** `Authorization: Bearer <token>`  
**Body (JSON):**
```json
{ "usuario": "novo_admin", "senha": "senhasegura", "nome": "Nome Completo" }
```
**Resposta de Sucesso (201):**
```json
{ "message": "Administrador criado com sucesso." }
```

---

## 🗺️ Eventos e Atrativos

### GET `/api/eventos`
Lista todos os eventos/atrativos. **Público.**

**Resposta de Sucesso (200):**
```json
[
  {
    "id": 1,
    "nome": "Festa de Nossa Senhora de Nazareth",
    "descricao": "...",
    "tipo": "Evento",
    "data_evento": "2026-09-08",
    "hora_evento": "09:00:00",
    "video_url": "videos/1234567890_video.mp4"
  }
]
```

---

### GET `/api/eventos/:id`
Busca um evento específico pelo ID. **Público.**

**Resposta de Sucesso (200):** Objeto do evento.  
**Resposta de Erro (404):** `{ "message": "Item não encontrado." }`

---

### POST `/api/eventos`
Cria um novo evento. **🔐 Requer token JWT.**

**Headers:** `Authorization: Bearer <token>`  
**Body (JSON):**
```json
{
  "nome": "Nome do Evento",
  "descricao": "Descrição detalhada",
  "tipo": "Evento",
  "data_evento": "2026-12-31",
  "hora_evento": "20:00"
}
```
> **Tipos válidos:** `"Evento"` | `"Praia"` | `"Trilha"` | `"Ponto Turístico"`  
> `data_evento` e `hora_evento` são opcionais para Praias e Trilhas.

**Resposta de Sucesso (201):** `{ "id": 6, "message": "Item cadastrado com sucesso." }`  
**Resposta de Erro (400):** `{ "message": "Dados inválidos.", "erros": ["..."] }`

---

### PUT `/api/eventos/:id`
Atualiza um evento existente. **🔐 Requer token JWT.**

**Headers:** `Authorization: Bearer <token>`  
**Body (JSON):** Mesmos campos do POST.  
**Resposta de Sucesso (200):** `{ "message": "Item atualizado com sucesso." }`

---

### DELETE `/api/eventos/:id`
Remove um evento. **🔐 Requer token JWT.**

**Headers:** `Authorization: Bearer <token>`  
**Resposta de Sucesso (204):** Sem corpo.

---

## 🎬 Gestão de Vídeos

### POST `/api/eventos/:id/video`
Faz upload de um vídeo para um evento. **🔐 Requer token JWT.**

**Headers:** `Authorization: Bearer <token>`  
**Body:** `multipart/form-data` com campo `video` (arquivo MP4/WebM/MOV, máx 500MB)

**Resposta de Sucesso (200):**
```json
{ "message": "Vídeo enviado e vinculado com sucesso!", "video_url": "videos/123_video.mp4" }
```

---

### DELETE `/api/eventos/:id/video`
Remove o vídeo de um evento. **🔐 Requer token JWT.**

**Headers:** `Authorization: Bearer <token>`  
**Resposta de Sucesso (200):** `{ "message": "Vídeo removido com sucesso." }`

---

## 📋 Códigos de Status HTTP

| Código | Significado |
|--------|------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 204 | Sucesso sem conteúdo (DELETE) |
| 400 | Dados inválidos (Bad Request) |
| 401 | Token inválido ou expirado |
| 403 | Token não fornecido |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: usuário já existe) |
| 429 | Muitas requisições (rate limit) |
| 500 | Erro interno do servidor |
