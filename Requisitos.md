# 📋 Documento de Requisitos (Saquarema Verde)

Este documento detalha os requisitos levantados para o desenvolvimento da plataforma **Saquarema Verde** (Aplicativo Mobile e Painel Web Administrativo).

## 1. Visão Geral do Sistema
O Saquarema Verde é uma plataforma voltada para o turismo ecológico e cultural da cidade de Saquarema. Ele permite que turistas e moradores encontrem de forma rápida informações sobre **Eventos, Praias, Trilhas e Pontos Turísticos**, incluindo descrições detalhadas, datas e vídeos de divulgação de cada atrativo.

---

## 2. Requisitos Funcionais (RF)

Os requisitos funcionais descrevem o que o sistema deve fazer (suas funcionalidades).

* **RF01 - Listagem de Atrativos (Feed):** O sistema deve exibir para o usuário público uma lista de atrativos turísticos ordenados de forma decrescente (do mais recente para o mais antigo).
* **RF02 - Tipos de Atrativos:** O sistema deve permitir categorizar os itens cadastrados entre: *Praia*, *Trilha*, *Ponto Turístico* e *Evento*.
* **RF03 - Visualização de Detalhes:** O usuário deve ser capaz de visualizar a descrição completa, data, horário e o vídeo promocional (quando disponível) de cada item na tela inicial e no mobile.
* **RF04 - Autenticação Administrativa:** O sistema deve possuir uma tela de login restrita para administradores (com senha criptografada e autenticação por JWT).
* **RF05 - Gestão de Cadastro (CRUD):** O administrador autenticado deve ser capaz de criar, ler, editar e excluir (CRUD) os eventos/atrativos no banco de dados através de um Painel Web.
* **RF06 - Upload de Mídia (Vídeo):** O administrador deve poder realizar o upload de um vídeo curto no formato MP4 (com limite de tamanho de 500MB) para ilustrar o evento cadastrado.

---

## 3. Requisitos Não Funcionais (RNF)

Os requisitos não funcionais descrevem como o sistema deve operar (suas qualidades e restrições).

* **RNF01 - Tecnologias Mobile:** O aplicativo mobile deve ser desenvolvido utilizando **React Native** (Expo) para garantir compatibilidade com Android e iOS a partir de um código unificado.
* **RNF02 - Tecnologias Backend:** A API e o painel de administração devem ser desenvolvidos utilizando **Node.js** com a biblioteca **Express**.
* **RNF03 - Armazenamento de Dados:** Os dados relacionais e o sistema de login devem utilizar um banco de dados local **MySQL**.
* **RNF04 - Desempenho (Mídia):** Os vídeos não devem ser armazenados como dados brutos no MySQL; o sistema deve salvá-los no disco (na pasta `/public/videos`) e armazenar apenas o caminho (URL) no banco de dados para evitar sobrecarga.
* **RNF05 - Responsividade Web:** O Painel Web (HTML/CSS) deve ser responsivo para funcionar tanto em computadores quanto em tablets utilizados pelos gestores turísticos locais.
* **RNF06 - Segurança:** As senhas dos administradores não podem ser salvas em texto puro, exigindo a biblioteca `bcryptjs` para a geração de hash. As rotas de criação/edição/deleção devem obrigatoriamente exigir o envio do Token JWT (Bearer Token).

---

## 4. Regras de Negócio (RN)

* **RN01:** Um atrativo só pode ser cadastrado se possuir Nome, Descrição e um Tipo válido selecionado.
* **RN02:** Para itens do tipo "Evento", os campos de Data e Hora têm grande relevância para ordenação. Itens como "Praia" ou "Trilha" podem ter esses campos vazios.
* **RN03:** O usuário não precisa criar uma conta (cadastro público) para visualizar os atrativos. O acesso à leitura é 100% livre.
* **RN04:** Apenas usuários previamente registrados no banco de dados (tabela `administradores`) têm acesso ao painel de gerenciamento; o sistema não possui rota de "criar conta" na interface web por motivos de segurança.
