# 💈 Sistema de Gerenciamento de Barbearia (TCC)

Este projeto é um sistema web desenvolvido como Trabalho de Conclusão de Curso (TCC). O objetivo é automatizar processos de agendamento, gestão de serviços e pagamentos para barbearias, oferecendo uma interface intuitiva para o cliente e uma ferramenta de controle eficiente para o administrador.

---

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias:

- **Frontend:** HTML5, CSS3 e JavaScript (ES6+).
- **Backend:** [Node.js](https://nodejs.org/) com o framework Express.
- **Banco de Dados:** [SQLite](https://www.sqlite.org/) (armazenamento local via arquivo `barbearia.db`).
- **Pagamentos:** Integração de lógica para processamento de pagamentos (`pagamento.js`).
- **Templates:** Motores de renderização para páginas dinâmicas.

---

## 📋 Funcionalidades (MVP)

- [x] **Agendamento Online:** Clientes podem escolher serviços e horários.
- [x] **Gestão de Serviços:** Cadastro e listagem de cortes, barbas e tratamentos.
- [x] **Módulo de Pagamento:** Fluxo para processamento de transações.
- [x] **Persistência de Dados:** Uso de banco de dados relacional para armazenar agendamentos e usuários.
- [ ] **Painel Administrativo:** (Em desenvolvimento) Para visualização de relatórios e controle de agenda.

---

## 🔧 Como Executar o Projeto

Para rodar este projeto localmente, você precisará ter o [Node.js](https://nodejs.org/) instalado em sua máquina.

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/leaguechampions677-beep/TCC.git](https://github.com/leaguechampions677-beep/TCC.git)
Acesse a pasta do projeto:

Bash

cd TCC
Instale as dependências:

Bash

npm install
Inicie o servidor:

Bash

npm start 
# ou
node server.js
Acesse no navegador: http://localhost:3000 (ou a porta configurada no seu server.js)

📂 Estrutura de Arquivos
server.js: Ponto de entrada da aplicação (configuração do servidor Express).

app.js: Lógica principal das rotas e middleware.

barbearia.db: Arquivo do banco de dados SQLite.

/templates: Arquivos HTML/EJS da aplicação.

/static: Arquivos estáticos (CSS, Imagens, JS Client-side).

pagamento.js: Módulo responsável pela lógica financeira.

🛠 Próximos Passos (To-Do)
Conforme detalhado nos arquivos TODO.md e TODO-backend.md:

[ ] Refatoração das rotas de autenticação.

[ ] Melhoria na responsividade da interface mobile.

[ ] Implementação de notificações via WhatsApp/E-mail.
