document.addEventListener('DOMContentLoaded', () => {
    const listaEventos = document.getElementById('lista-eventos');
    // DEFINIMOS A URL DO BACKEND AQUI
    const API_BASE_URL = 'https://saquarema-verde-backend.onrender.com';

    if (!listaEventos) {
        console.error("Elemento 'lista-eventos' não encontrado.");
        return;
    }

    const formatarData = (dataStr) => {
        if (!dataStr) return 'Não definida';
        const datePart = dataStr.substring(0, 10);
        const parts = datePart.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return datePart;
    };

    async function carregarEventos() {
        try {
            // USAMOS A URL COMPLETA PARA NÃO DAR ERRO 404
            const response = await fetch(saquarema-verde-backend.onrender.com/api/eventos);
            
            if (!response.ok) throw new Error(`Erro ao carregar dados: ${response.status}`);

            const eventos = await response.json();
            listaEventos.innerHTML = '';

            if (eventos.length === 0) {
                listaEventos.innerHTML = '<p>Nenhum evento/atração cadastrado(a) no momento.</p>';
                return;
            }

            eventos.forEach(evento => {
                const eventoDiv = document.createElement('div');
                eventoDiv.classList.add('card-atracao');

                let dataHoraHtml = '';
                if (evento.tipo === 'Evento') {
                    dataHoraHtml = `
                        <p class="card-details">
                            📅 Data: ${formatarData(evento.data_evento)} 
                            🕒 Hora: ${evento.hora_evento || 'Não definida'}
                        </p>
                    `;
                } else if (evento.data_evento) {
                    dataHoraHtml = `
                        <p class="card-details-small">
                            📅 Data: ${formatarData(evento.data_evento)}
                        </p>
                    `;
                }

                let videoHtml = '';
                if (evento.video_url) {
                    videoHtml = `
                        <div class="card-video">
                            <button class="btn-play-video" onclick="toggleVideo(this, '${API_BASE_URL}/${evento.video_url}')">
                                ▶️ Assistir Vídeo
                            </button>
                            <div class="video-container" style="display:none; margin-top:12px">
                                <video 
                                    controls 
                                    style="width:100%; border-radius:8px; max-height:280px"
                                    preload="metadata"
                                >
                                    <source src="${API_BASE_URL}/${evento.video_url}" type="video/mp4">
                                    Seu navegador não suporta vídeos.
                                </video>
                            </div>
                        </div>
                    `;
                }

                eventoDiv.innerHTML = `
                    <h3>${evento.nome}</h3>
                    <p><strong>Tipo:</strong> ${evento.tipo || 'Não especificado'}</p>
                    ${dataHoraHtml}
                    <p><strong>Descrição:</strong> ${evento.descricao}</p>
                    ${videoHtml}
                `;

                listaEventos.appendChild(eventoDiv);
            });

        } catch (error) {
            console.error('Falha ao carregar itens:', error);
            listaEventos.innerHTML = `<p style="color: red;">Erro de conexão com o servidor: ${error.message}</p>`;
        }
    }

    carregarEventos();
});

// Função global para o botão de vídeo
window.toggleVideo = function(btn, videoUrl) {
    const container = btn.nextElementSibling;
    const video = container.querySelector('video');

    if (container.style.display === 'none') {
        container.style.display = 'block';
        btn.textContent = '⏹️ Fechar Vídeo';
        video.src = videoUrl;
        video.play();
    } else {
        container.style.display = 'none';
        btn.textContent = '▶️ Assistir Vídeo';
        video.pause();
        video.src = '';
    }
};