document.addEventListener('DOMContentLoaded', () => {
    // URL DO SEU BACKEND NO RENDER
    const API_BASE_URL = 'https://saquarema-verde-backend.onrender.com';
    
    const adminToken = localStorage.getItem('adminToken');
    const cadastroForm = document.getElementById('cadastroForm');
    const mensagemFeedback = document.getElementById('mensagem-cadastro');
    const formTitle = document.getElementById('formTitle');
    const listaEventosAdmin = document.getElementById('lista-eventos-admin');
    
    let eventoEmEdicaoId = null;
    let videoSelecionado = null;

    const formatarData = (dataStr) => {
        if (!dataStr) return 'Não definida';
        const datePart = dataStr.substring(0, 10);
        const parts = datePart.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return datePart;
    };

    // VERIFICAÇÃO DE LOGIN
    if (!adminToken) {
        alert('Sua sessão expirou ou você não está logado. Redirecionando...');
        window.location.href = 'login.html';
        return;
    }

    // LOGOUT
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            window.location.href = 'login.html';
        });
    }

    // CARREGAR LISTA DE EVENTOS
    async function carregarEventosAdmin() {
        if (!listaEventosAdmin) return;
        listaEventosAdmin.innerHTML = '<p>Carregando itens para administração...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}/api/eventos`);
            if (!response.ok) throw new Error('Falha ao buscar itens da lista.');
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
                            📅 Data: ${formatarData(evento.data_evento)} 
                            🕒 Hora: ${evento.hora_evento || 'Não definida'}
                        </p>
                        <p>${evento.descricao.substring(0, 100)}...</p>
                        ${evento.video_url ? `<p style="color:#00796B; font-size:0.85em">🎬 Vídeo: Disponível</p>` : '<p style="color:#999; font-size:0.85em">🎬 Sem vídeo</p>'}
                    </div>
                    <div class="card-actions">
                        <button class="btn-editar" data-id="${evento.id}">Editar</button>
                        <button class="btn-excluir" data-id="${evento.id}">Excluir</button>
                    </div>
                `;
                listaEventosAdmin.appendChild(eventoDiv);
            });

            // Botões de ação
            listaEventosAdmin.querySelectorAll('.btn-editar').forEach(button => {
                button.addEventListener('click', (e) => preencherFormulario(e.target.dataset.id));
            });
            listaEventosAdmin.querySelectorAll('.btn-excluir').forEach(button => {
                button.addEventListener('click', (e) => {
                    if (confirm(`Tem certeza que deseja excluir o item ID ${e.target.dataset.id}?`)) {
                        excluirEvento(e.target.dataset.id);
                    }
                });
            });

        } catch (error) {
            listaEventosAdmin.innerHTML = `<p style="color: red;">Erro ao carregar lista: ${error.message}</p>`;
        }
    }

    // PREENCHER FORMULÁRIO (MODO EDIÇÃO)
    async function preencherFormulario(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/eventos`);
            if (!response.ok) throw new Error('Item não encontrado.');
            const eventos = await response.json();
            const evento = eventos.find(e => e.id == id);

            if (!evento) throw new Error('Evento não localizado na lista.');

            document.getElementById('nome').value = evento.nome;
            document.getElementById('descricao').value = evento.descricao;
            document.getElementById('tipo').value = evento.tipo;
            document.getElementById('data_evento').value = evento.data_evento ? evento.data_evento.substring(0, 10) : '';
            document.getElementById('hora_evento').value = evento.hora_evento || '';

            eventoEmEdicaoId = id;
            formTitle.textContent = `✏️ Editando Item ID ${id}`;
            document.querySelector('.btn-submit').textContent = 'Salvar Alterações';
            mensagemFeedback.textContent = 'Modo de Edição. Preencha e salve.';
            mensagemFeedback.style.color = '#FFA000';
            mensagemFeedback.style.backgroundColor = '#FFF8E1';

            // Vídeo atual
            const videoContainer = document.getElementById('video-atual-container');
            if (evento.video_url) {
                videoContainer.style.display = 'block';
                document.getElementById('video-atual-nome').textContent = evento.video_url.split('/').pop();
                document.getElementById('video-preview-atual').src = `${API_BASE_URL}/${evento.video_url}`;
            } else {
                videoContainer.style.display = 'none';
            }

            // Reset upload area
            document.getElementById('video-selecionado-preview').style.display = 'none';
            document.getElementById('btn-upload-video').style.display = 'none';
            document.getElementById('input-video').value = '';
            document.getElementById('mensagem-video').textContent = '';
            videoSelecionado = null;

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            alert(`Falha ao buscar dados para edição: ${error.message}`);
        }
    }

    // RESETAR FORMULÁRIO
    function resetarFormulario() {
        cadastroForm.reset();
        eventoEmEdicaoId = null;
        videoSelecionado = null;
        formTitle.textContent = '➕ Inserir Novo Item';
        document.querySelector('.btn-submit').textContent = 'Cadastrar Item';
        mensagemFeedback.textContent = 'Formulário pronto para novo cadastro.';
        mensagemFeedback.style.color = '#00796B';
        mensagemFeedback.style.backgroundColor = '#E0F2F1';
        document.getElementById('video-selecionado-preview').style.display = 'none';
        document.getElementById('video-atual-container').style.display = 'none';
        document.getElementById('input-video').value = '';
    }

    // SUBMISSÃO DO FORMULÁRIO (CADASTRO/EDIÇÃO)
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            mensagemFeedback.textContent = 'Aguarde...';

            const formData = new FormData(cadastroForm);
            const data = Object.fromEntries(formData.entries());
            const method = eventoEmEdicaoId ? 'PUT' : 'POST';
            const url = eventoEmEdicaoId ? `${API_BASE_URL}/api/eventos/${eventoEmEdicaoId}` : `${API_BASE_URL}/api/eventos`;

            try {
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify(data)
                });

                const jsonResponse = await response.json();

                if (response.ok) {
                    mensagemFeedback.textContent = jsonResponse.message || 'Operação realizada com sucesso!';
                    mensagemFeedback.style.color = '#388E3C';
                    mensagemFeedback.style.backgroundColor = '#E8F5E9';

                    // Se for novo e tiver vídeo
                    if (!eventoEmEdicaoId && videoSelecionado && jsonResponse.id) {
                        await uploadVideoPorId(jsonResponse.id);
                    }

                    resetarFormulario();
                    carregarEventosAdmin();
                } else if (response.status === 401 || response.status === 403) {
                    alert('Sessão expirada.');
                    localStorage.removeItem('adminToken');
                    window.location.href = 'login.html';
                } else {
                    mensagemFeedback.textContent = `🚨 Erro: ${jsonResponse.message || 'Falha na operação.'}`;
                }
            } catch (error) {
                mensagemFeedback.textContent = '🚨 Erro de conexão com o servidor.';
            }
        });
    }

    // EXCLUIR EVENTO
    async function excluirEvento(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/eventos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (response.status === 204) {
                alert('Item excluído com sucesso!');
                carregarEventosAdmin();
            } else {
                const data = await response.json();
                alert(`Erro: ${data.message}`);
            }
        } catch (error) {
            alert('Erro de conexão ao tentar excluir.');
        }
    }

    // FUNÇÕES DE VÍDEO GLOBAIS
    window.selecionarVideo = function(input) {
        const file = input.files[0];
        if (!file) return;
        videoSelecionado = file;
        document.getElementById('video-nome-selecionado').textContent = file.name;
        document.getElementById('btn-upload-video').style.display = 'block';
        const url = URL.createObjectURL(file);
        document.getElementById('video-preview-novo').src = url;
        document.getElementById('video-selecionado-preview').style.display = 'block';
    };

    window.uploadVideo = async function() {
        if (!videoSelecionado || !eventoEmEdicaoId) return;
        await uploadVideoPorId(eventoEmEdicaoId);
    };

    async function uploadVideoPorId(id) {
        const progressDiv = document.getElementById('upload-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const mensagemVideo = document.getElementById('mensagem-video');

        progressDiv.style.display = 'block';
        const formData = new FormData();
        formData.append('video', videoSelecionado);

        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const pct = Math.round((e.loaded / e.total) * 100);
                    progressFill.style.width = `${pct}%`;
                    progressText.textContent = `Enviando... ${pct}%`;
                }
            };

            xhr.onload = () => {
                progressDiv.style.display = 'none';
                if (xhr.status === 200) {
                    mensagemVideo.textContent = '✅ Vídeo enviado com sucesso!';
                    const data = JSON.parse(xhr.responseText);
                    document.getElementById('video-preview-atual').src = `${API_BASE_URL}/${data.video_url}`;
                    document.getElementById('video-atual-container').style.display = 'block';
                    videoSelecionado = null;
                    carregarEventosAdmin();
                } else {
                    mensagemVideo.textContent = '🚨 Erro ao enviar vídeo.';
                }
                resolve();
            };

            xhr.open('POST', `${API_BASE_URL}/api/eventos/${id}/video`);
            xhr.setRequestHeader('Authorization', `Bearer ${adminToken}`);
            xhr.send(formData);
        });
    }

    window.removerVideo = async function() {
        if (!eventoEmEdicaoId) return;
        if (!confirm('Deseja remover o vídeo?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/eventos/${eventoEmEdicaoId}/video`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (response.ok) {
                document.getElementById('video-atual-container').style.display = 'none';
                carregarEventosAdmin();
            }
        } catch {
            alert('Erro ao remover vídeo.');
        }
    };

    carregarEventosAdmin();
});