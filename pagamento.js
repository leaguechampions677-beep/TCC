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
    metodoPagamentoSelect.addEventListener('change', () => {
        toggleMetodoPagamento();
        // Se Pix foi selecionado, gerar QR code imediatamente
        if (metodoPagamentoSelect.value === 'pix') {
            const valor = localStorage.getItem('appointment_value');
            if (valor) {
                const valorFormatado = valor.replace(',', '.');
                const chavePix = 'pix@barbearia.com';
                const pixString = `pix:${chavePix}?amount=${valorFormatado}`;
                document.getElementById('chave-pix').textContent = `Chave Pix: ${chavePix} | Valor: R$ ${valor}`;
                const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixString)}`;
                document.querySelector('.qrcode').src = qrCodeUrl;
            }
        }
    });

    // Formatar número do cartão em tempo real
    const numeroCartaoInput = document.getElementById('numero-cartao');
    numeroCartaoInput.addEventListener('input', (e) => {
        e.target.value = formatarNumeroCartao(e.target.value);
    });

    // Garante que a exibição inicial esteja correta
    toggleMetodoPagamento();

    // Carregar resumo do agendamento
    const userEmail = localStorage.getItem('user_email');
    const appointment_id = localStorage.getItem('appointment_id');
    console.log('userEmail:', userEmail);
    console.log('appointment_id:', appointment_id);
    if (userEmail && appointment_id) {
        try {
            const response = await fetch(`/appointments/${userEmail}`);
            const agendamentos = await response.json();
            console.log('agendamentos:', agendamentos);
            // Encontrar o agendamento mais recente (último da lista, já que está ordenado por data/hora desc)
            const agendamento = agendamentos[0]; // Pegar o primeiro da lista, que é o mais recente
            console.log('agendamento encontrado:', agendamento);
            if (agendamento) {
                // Calcular valor baseado no serviço
                let valor = '50,00'; // Valor padrão
                if (agendamento.servico === 'Corte de Cabelo') {
                    valor = '30,00';
                } else if (agendamento.servico === 'Barba') {
                    valor = '20,00';
                } else if (agendamento.servico === 'Corte + Barba') {
                    valor = '50,00';
                }
                resumoAgendamento.innerHTML = `
                    <p><strong>Serviço:</strong> ${agendamento.servico}</p>
                    <p><strong>Data:</strong> ${agendamento.data}</p>
                    <p><strong>Hora:</strong> ${agendamento.hora}</p>
                    <p><strong>Valor:</strong> R$ ${valor}</p>
                `;
                // Armazenar valor para uso no pagamento
                localStorage.setItem('appointment_value', valor);
                // Atualizar appointment_id se necessário
                localStorage.setItem('appointment_id', agendamento.id);
            } else {
                resumoAgendamento.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
            }
        } catch (error) {
            console.error('Erro ao carregar agendamento:', error);
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
            // Simulação de pagamento Pix com valor incluído
            const valor = localStorage.getItem('appointment_value').replace(',', '.'); // Formatar para 30.00
            const chavePix = 'pix@barbearia.com';
            const pixString = `pix:${chavePix}?amount=${valor}`;
            document.getElementById('chave-pix').textContent = `Chave Pix: ${chavePix} | Valor: R$ ${valor.replace('.', ',')}`;
            // Gerar QR Code usando API gratuita
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixString)}`;
            document.querySelector('.qrcode').src = qrCodeUrl;
            pagamentoConfirmado = confirm(`QR Code Pix gerado para pagamento de R$ ${valor.replace('.', ',')}.\n\nChave: ${chavePix}\n\nAo clicar em OK, você confirma que o pagamento via Pix foi realizado.`);
        }

        if (pagamentoConfirmado) {
            const userEmail = localStorage.getItem('user_email');
            const appointment_id = localStorage.getItem('appointment_id');
            const valor = localStorage.getItem('appointment_value');
            try {
                const response = await fetch('/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_email: userEmail, appointment_id, metodo, valor })
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Pagamento processado com sucesso! Seu agendamento está confirmado.');
                    // Limpar dados após pagamento
                    localStorage.removeItem('appointment_id');
                    localStorage.removeItem('appointment_value');
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