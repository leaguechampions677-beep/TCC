document.addEventListener('DOMContentLoaded', async () => {
    const metodoPagamentoSelect = document.getElementById('metodo-pagamento');
    const cartaoFields = document.getElementById('cartao-fields');
    const pixFields = document.getElementById('pix-fields');
    const pagamentoForm = document.getElementById('pagamento-form');
    const resumoAgendamento = document.getElementById('resumo-agendamento');

    // Função para validar número do cartão usando algoritmo de Luhn
    function validarCartaoLuhn(numero) {
        numero = numero.replace(/\s+/g, '');
        if (!/^\d{13,19}$/.test(numero)) return false;

        let soma = 0;
        let alternar = false;
        for (let i = numero.length - 1; i >= 0; i--) {
            let digito = parseInt(numero.charAt(i), 10);
            if (alternar) {
                digito *= 2;
                if (digito > 9) digito -= 9;
            }
            soma += digito;
            alternar = !alternar;
        }
        return soma % 10 === 0;
    }

    // Função para formatar número do cartão
    function formatarNumeroCartao(value) {
        return value.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Função para alternar a exibição dos campos de pagamento
    function toggleMetodoPagamento() {
        if (metodoPagamentoSelect.value === 'cartao') {
            cartaoFields.style.display = 'block';
            pixFields.style.display = 'none';
        } else if (metodoPagamentoSelect.value === 'pix') {
            cartaoFields.style.display = 'none';
            pixFields.style.display = 'block';
        }
    }

    // Adiciona o evento para alternar os campos quando o método de pagamento for alterado
    metodoPagamentoSelect.addEventListener('change', toggleMetodoPagamento);

    // Formatar número do cartão em tempo real
    const numeroCartaoInput = document.getElementById('numero-cartao');
    numeroCartaoInput.addEventListener('input', (e) => {
        e.target.value = formatarNumeroCartao(e.target.value);
    });

    // Garante que a exibição inicial esteja correta
    toggleMetodoPagamento();

    // Carregar resumo do agendamento
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const appointment_id = localStorage.getItem('appointment_id');
    if (usuarioLogado && appointment_id) {
        try {
            const response = await fetch(`http://localhost:3000/appointments/${usuarioLogado.email}`);
            const agendamentos = await response.json();
            const agendamento = agendamentos.find(a => a.id == appointment_id);
            if (agendamento) {
                resumoAgendamento.innerHTML = `
                    <p><strong>Serviço:</strong> ${agendamento.servico}</p>
                    <p><strong>Data:</strong> ${agendamento.data}</p>
                    <p><strong>Hora:</strong> ${agendamento.hora}</p>
                    <p><strong>Valor:</strong> R$ 50,00</p>
                `;
            } else {
                resumoAgendamento.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
            }
        } catch (error) {
            resumoAgendamento.innerHTML = '<p>Erro ao carregar agendamento.</p>';
        }
    } else {
        resumoAgendamento.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
    }

    // Lógica para finalizar o pagamento
    pagamentoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const metodo = metodoPagamentoSelect.value;
        let pagamentoConfirmado = false;

        if (metodo === 'cartao') {
            const numeroCartao = document.getElementById('numero-cartao').value.replace(/\s+/g, '');
            const nomeCartao = document.getElementById('nome-cartao').value.trim();
            const expiracao = document.getElementById('expiracao').value;
            const cvv = document.getElementById('cvv').value;

            if (!validarCartaoLuhn(numeroCartao)) {
                alert('Número do cartão inválido.');
                return;
            }
            if (!nomeCartao) {
                alert('Nome no cartão é obrigatório.');
                return;
            }
            if (!/^\d{2}\/\d{2}$/.test(expiracao)) {
                alert('Expiração inválida (formato MM/AA).');
                return;
            }
            if (!/^\d{3}$/.test(cvv)) {
                alert('CVV inválido.');
                return;
            }
            pagamentoConfirmado = true;
        } else if (metodo === 'pix') {
            // Simulação de pagamento Pix com geração de chave aleatória
            const chavePix = 'pix-' + Math.random().toString(36).substr(2, 9) + '@barbearia.com';
            document.getElementById('chave-pix').textContent = chavePix;
            pagamentoConfirmado = confirm('Chave Pix gerada: ' + chavePix + '\n\nAo clicar em OK, você confirma que o pagamento via Pix foi realizado.');
        }

        if (pagamentoConfirmado) {
            const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
            const appointment_id = localStorage.getItem('appointment_id');
            try {
                const response = await fetch('http://localhost:3000/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_email: usuarioLogado.email, appointment_id, metodo })
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Pagamento processado com sucesso! Seu agendamento está confirmado.');
                    // Limpar dados após pagamento
                    localStorage.removeItem('usuarioLogado');
                    localStorage.removeItem('appointment_id');
                    window.location.href = 'index.html'; // Redireciona para início
                } else {
                    alert(data.error);
                }
            } catch (error) {
                alert('Erro ao processar pagamento.');
            }
        } else {
            alert('O pagamento não foi finalizado. Tente novamente.');
        }
    });
});