document.addEventListener('DOMContentLoaded', () => {
    // 🔧 Configurações Iniciais
    const PORT = 8080;
    const BASE_URL = ''; // Usamos vazio para rotas relativas
    const adminToken = localStorage.getItem('adminToken');
    
    // Elementos da Seção de Cadastro/Edição
    const cadastroForm = document.getElementById('cadastroForm'); 
    const mensagemFeedback = document.getElementById('mensagem-cadastro');
    const formTitle = document.getElementById('formTitle');
    const listaEventosAdmin = document.getElementById('lista-eventos-admin');
    
    // Novos Elementos para Vídeo
    const barraProgresso = document.getElementById('barra-progresso');
    const containerProgresso = document.getElementById('container-progresso');
    
    let eventoEmEdicaoId = null; 

    // --- FUNÇÃO DE AJUDA: FORMATAÇÃO DE DATA ---
    const formatarData = (dataStr) => {
        if (!dataStr) return 'Não definida';
        // Pega a parte da data (YYYY-MM-DD)
        const datePart = dataStr.substring(0, 10); 
        // Converte para DD/MM/YYYY
        const parts = datePart.split('-'); 
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return datePart; 
    }

    // 1. VERIFICAÇÃO DE AUTENTICAÇÃO INICIAL
    if (!adminToken) {
        alert('Sua sessão expirou ou você não está logado. Redirecionando...');
        window.location.href = 'login.html';
        return;
    }

    // 2. LÓGICA DE LOGOUT
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            window.location.href = 'login.html';
        });
    }

    // 3. FUNÇÃO PARA CARREGAR LISTA (EXIBE DATA/HORA/VÍDEO)
    async function carregarEventosAdmin() {
        if (!listaEventosAdmin) return;
        listaEventosAdmin.innerHTML = '<p>Carregando itens para administração...</p>';

        try {
            const response = await fetch(`${BASE_URL}/api/eventos`); 
            if (!response.ok) {
                throw new Error('Falha ao buscar itens da lista.');
            }

            const eventos = await response.json();
            listaEventosAdmin.innerHTML = '';

            if (eventos.length === 0) {
                listaEventosAdmin.innerHTML = '<p>Nenhum item cadastrado.</p>';
                return;
            }

            eventos.forEach(evento => {
                const eventoDiv = document.createElement('div');
                eventoDiv.classList.add('card-atracao-admin'); 
                eventoDiv.innerHTML = `
                    <div class="card-content">
                        <h4>ID ${evento.id}: ${evento.nome} (${evento.tipo})</h4>
                        <p>
                            📅 <b>Data:</b> ${formatarData(evento.data_evento)} 
                            🕒 <b>Hora:</b> ${evento.hora_evento || 'Não definida'}
                        </p>
                        <p>${evento.descricao.substring(0, 100)}...</p>
                        ${evento.video_url ? `<small style="color: #28a745;">▶️ Contém vídeo anexado</small>` : `<small style="color: #666;">Sem vídeo</small>`}
                    </div>
                    <div class="card-actions">
                        <button class="btn-editar" onclick="window.abrirFormularioEdicao(${evento.id})">Editar</button>
                        <button class="btn-excluir" onclick="window.excluirEvento(${evento.id})">Excluir</button>
                    </div>
                `;
                listaEventosAdmin.appendChild(eventoDiv);
            });

        } catch (error) {
            console.error('Erro ao carregar lista de admin:', error);
            listaEventosAdmin.innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
        }
    }

    // 4. FUNÇÃO PARA PREENCHER O FORMULÁRIO (EDIÇÃO)
    window.abrirFormularioEdicao = async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/api/eventos/${id}`); 
            if (!response.ok) {
                throw new Error('Item não encontrado.');
            }
            const evento = await response.json();

            // Preenche o formulário
            document.getElementById('nome').value = evento.nome;
            document.getElementById('descricao').value = evento.descricao;
            document.getElementById('tipo').value = evento.tipo;
            document.getElementById('data_evento').value = evento.data_evento ? evento.data_evento.substring(0, 10) : ''; 
            document.getElementById('hora_evento').value = evento.hora_evento || '';

            // Define o modo de edição
            eventoEmEdicaoId = id; 
            formTitle.textContent = `✏️ Editando Item ID ${id}`;
            document.querySelector('.btn-submit').textContent = 'Salvar Alterações';
            mensagemFeedback.textContent = 'Modo de Edição ativado.';
            mensagemFeedback.style.color = '#FFA000'; 

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            alert(`Falha ao buscar dados: ${error.message}`);
        }
    }
    
    // 5. FUNÇÃO PARA LIMPAR O FORMULÁRIO
    function resetFormulario() {
        cadastroForm.reset();
        eventoEmEdicaoId = null; 
        formTitle.textContent = '➕ Inserir Novo Item';
        document.querySelector('.btn-submit').textContent = 'Cadastrar Item';
        mensagemFeedback.textContent = '';
        if (containerProgresso) containerProgresso.style.display = 'none';
    }

    // 6. FUNÇÃO UNIFICADA DE CADASTRO/EDIÇÃO (FormData para Vídeos)
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            mensagemFeedback.textContent = 'Processando...'; 
            mensagemFeedback.style.color = '#00796B';

            // --- ENVIO DOS DADOS COMO JSON PRIMEIRO ---
            const eventoData = {
                nome: document.getElementById('nome').value,
                descricao: document.getElementById('descricao').value,
                tipo: document.getElementById('tipo').value,
                data_evento: document.getElementById('data_evento').value,
                hora_evento: document.getElementById('hora_evento').value
            };

            const videoInput = document.getElementById('video');
            const hasVideo = videoInput && videoInput.files[0];

            let url = `${BASE_URL}/api/eventos`; 
            let method = 'POST';

            if (eventoEmEdicaoId) {
                url = `${BASE_URL}/api/eventos/${eventoEmEdicaoId}`; 
                method = 'PUT';
            }

            try {
                // 1. Enviar dados de texto
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(eventoData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Erro ao salvar o evento');
                }

                const eventoId = eventoEmEdicaoId || data.id;

                // 2. Se tiver vídeo, fazer upload em requisição separada
                if (hasVideo && eventoId) {
                    if (containerProgresso) containerProgresso.style.display = 'block';
                    if (barraProgresso) {
                        barraProgresso.style.width = '40%';
                        barraProgresso.textContent = 'Enviando vídeo...';
                    }

                    const videoFormData = new FormData();
                    videoFormData.append('video', videoInput.files[0]);

                    const videoResponse = await fetch(`${BASE_URL}/api/eventos/${eventoId}/video`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${adminToken}`
                        },
                        body: videoFormData
                    });

                    if (!videoResponse.ok) {
                        const videoData = await videoResponse.json();
                        throw new Error(videoData.message || 'Erro ao fazer upload do vídeo');
                    }

                    if (barraProgresso) {
                        barraProgresso.style.width = '100%';
                        barraProgresso.textContent = 'Sucesso!';
                    }
                }

                alert(method === 'POST' ? 'Cadastrado com sucesso!' : 'Atualizado com sucesso!');
                location.reload(); 

            } catch (error) {
                console.error('Erro:', error);
                mensagemFeedback.textContent = `❌ Erro: ${error.message}`;
                mensagemFeedback.style.color = '#D32F2F';
                if (containerProgresso) containerProgresso.style.display = 'none';
            }
        });
    }

    // 7. FUNÇÃO PARA EXCLUIR ITEM
    window.excluirEvento = async (id) => {
        if (!confirm(`Tem certeza que deseja excluir o item ID ${id}?`)) return;

        try {
            const response = await fetch(`${BASE_URL}/api/eventos/${id}`, { 
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            if (response.status === 204) {
                alert('Item excluído com sucesso!');
                carregarEventosAdmin();
            } else {
                const data = await response.json();
                alert(`Falha: ${data.message}`);
            }

        } catch (error) {
            alert('Erro de conexão ao excluir.');
        }
    }

    carregarEventosAdmin();
});