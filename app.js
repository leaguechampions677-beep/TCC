document.addEventListener('DOMContentLoaded', () => {

    // Função para validar e-mail
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Função para validar força da senha (mínimo 6 caracteres, com letra e número)
    function validarSenha(senha) {
        return senha.length >= 6 && /[a-zA-Z]/.test(senha) && /\d/.test(senha);
    }

    // Lógica para a página de Cadastro
    const cadastroForm = document.getElementById('cadastro-form');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            const nome = document.getElementById('nome-cadastro').value.trim();
            const email = document.getElementById('email-cadastro').value.trim();
            const senha = document.getElementById('senha-cadastro').value;
            const confirmarSenha = document.getElementById('confirmar-senha').value;

            // Validações
            if (!nome) {
                alert('Nome é obrigatório.');
                return;
            }
            if (!validarEmail(email)) {
                alert('E-mail inválido.');
                return;
            }
            if (!validarSenha(senha)) {
                alert('A senha deve ter pelo menos 6 caracteres, incluindo letras e números.');
                return;
            }
            if (senha !== confirmarSenha) {
                alert('As senhas não coincidem!');
                return;
            }

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, senha })
                });
                const data = await response.json();
                if (response.ok) {
                    alert(`Usuário ${nome} cadastrado com sucesso!`);
                    window.location.href = 'login.html'; // Redireciona para a página de login
                } else {
                    alert(data.error);
                }
            } catch (error) {
                alert('Erro ao conectar ao servidor.');
            }
        });
    }

    // Lógica para a página de Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            const email = document.getElementById('email-login').value.trim();
            const senha = document.getElementById('senha-login').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Login bem-sucedido!');
                    localStorage.setItem('usuarioLogado', JSON.stringify(data.user));
                    window.location.href = 'index.html'; // Redireciona para a página inicial
                } else {
                    alert(data.error);
                }
            } catch (error) {
                alert('Erro ao conectar ao servidor.');
            }
        });
    }

    // Lógica para a página de Cadastro de Barbeiro
    const cadastroBarbeiroForm = document.getElementById('cadastro-barbeiro-form');
    if (cadastroBarbeiroForm) {
        cadastroBarbeiroForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = document.getElementById('nome-barbeiro').value.trim();
            const email = document.getElementById('email-barbeiro').value.trim();
            const senha = document.getElementById('senha-barbeiro').value;
            const confirmarSenha = document.getElementById('confirmar-senha-barbeiro').value;
            const especialidade = document.getElementById('especialidade').value;

            if (!nome || !email || !senha || !especialidade) {
                alert('Preencha todos os campos.');
                return;
            }
            if (!validarEmail(email)) {
                alert('E-mail inválido.');
                return;
            }
            if (!validarSenha(senha)) {
                alert('A senha deve ter pelo menos 6 caracteres, incluindo letras e números.');
                return;
            }
            if (senha !== confirmarSenha) {
                alert('As senhas não coincidem!');
                return;
            }

            try {
                const response = await fetch('/register-barber', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, senha, especialidade })
                });
                const data = await response.json();
                if (response.ok) {
                    alert(`Barbeiro ${nome} cadastrado com sucesso!`);
                    window.location.href = 'barbeiro.html';
                } else {
                    alert(data.error);
                }
            } catch (error) {
                alert('Erro ao conectar ao servidor.');
            }
        });
    }

    // Lógica para a página de Login de Barbeiro
    const loginBarbeiroForm = document.getElementById('login-barbeiro-form');
    if (loginBarbeiroForm) {
        loginBarbeiroForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email-barbeiro-login').value.trim();
            const senha = document.getElementById('senha-barbeiro-login').value;

            try {
                const response = await fetch('/login-barber', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Login bem-sucedido!');
                    localStorage.setItem('barbeiroLogado', JSON.stringify(data.barber));
                    window.location.href = 'dashboard-barbeiro.html';
                } else {
                    alert(data.error);
                }
            } catch (error) {
                alert('Erro ao conectar ao servidor.');
            }
        });
    }

    // Lógica para a página de Agendamento
    const agendamentoForm = document.getElementById('agendamento-form');
    if (agendamentoForm) {
        agendamentoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
            if (!usuarioLogado) {
                alert('Você precisa fazer login primeiro.');
                window.location.href = 'login.html';
                return;
            }

            const servico = document.getElementById('servico').value;
            const barbeiro = document.getElementById('barbeiro').value;
            const data = document.getElementById('data').value;
            const hora = document.getElementById('hora').value;

            if (!servico || !barbeiro || !data || !hora) {
                alert('Preencha todos os campos.');
                return;
            }

            try {
                const response = await fetch('/appointments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_email: usuarioLogado.email, barber_email: barbeiro, servico, data, hora })
                });
                const dataResp = await response.json();
                if (response.ok) {
                    alert('Agendamento realizado com sucesso! Você será redirecionado para o pagamento.');
                    localStorage.setItem('appointment_id', dataResp.id);
                    window.location.href = 'pagamento.html'; // Redireciona para pagamento
                } else {
                    alert(dataResp.error);
                }
            } catch (error) {
                alert('Erro ao conectar ao servidor.');
            }
        });
    }
});
