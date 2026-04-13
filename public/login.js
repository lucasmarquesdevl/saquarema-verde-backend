document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const mensagemErro = document.getElementById('mensagem-erro');
    
    // URL DO SEU BACKEND NO RENDER
    const API_BASE_URL = 'https://saquarema-verde-backend.onrender.com';

    // Se o admin tentar acessar a página de login já autenticado, manda direto pro painel
    if (localStorage.getItem('adminToken')) {
        window.location.href = 'admin.html';
        return;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Limpa mensagens e dá feedback de carregamento
            mensagemErro.textContent = 'Verificando credenciais...'; 
            mensagemErro.style.color = '#00796B';

            const usuario = document.getElementById('usuario').value;
            const senha = document.getElementById('senha').value;

            try {
                // Faz a chamada para o Render usando a URL completa
                const response = await fetch(`${API_BASE_URL}/api/login`, { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ usuario, senha })
                });

                const data = await response.json();

                if (response.ok) {
                    // Login bem-sucedido: Salva o token e redireciona
                    localStorage.setItem('adminToken', data.token);
                    window.location.href = 'admin.html';
                } else {
                    // Falha no login (usuário ou senha errados)
                    mensagemErro.textContent = data.message || 'Usuário ou senha incorretos.';
                    mensagemErro.style.color = 'red';
                }

            } catch (error) {
                console.error('Erro de rede:', error);
                // Se o Render estiver "dormindo", pode cair aqui no primeiro segundo
                mensagemErro.textContent = 'Erro de conexão. O servidor pode estar iniciando, tente novamente em instantes.';
                mensagemErro.style.color = 'red';
            }
        });
    }
});