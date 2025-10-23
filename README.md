# Barbearia Fio de Ouro - Sistema de Agendamento

Sistema web completo para agendamento de serviços de barbearia com frontend moderno e backend robusto.

## Funcionalidades

### Para Usuários
- Cadastro e login
- Agendamento de serviços com barbeiros
- Visualização de agendamentos
- Sistema de pagamento (cartão/Pix)
- Dashboard pessoal

### Para Barbeiros
- Cadastro e login
- Visualização de agendamentos
- Gerenciamento de preços de serviços
- Cancelamento de agendamentos com motivo

## Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Banco de Dados**: SQLite (local) ou Supabase (produção)
- **Deploy**: Render

## Instalação e Execução

### Local (SQLite)

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o servidor:
   ```bash
   npm start
   ```
4. Acesse: http://localhost:3000

### Produção (Supabase)

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o SQL para criar tabelas (veja `schema.sql`)
3. Configure variáveis de ambiente no Render:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Use `server-supabase.js` como arquivo principal

## Estrutura do Projeto

```
/
├── server.js              # Servidor principal (SQLite)
├── server-supabase.js     # Servidor para Supabase
├── package.json
├── templates/             # Páginas HTML
├── static/                # CSS e assets
├── app.js                 # JavaScript frontend
└── pagamento.js          # Lógica de pagamento
```

## Deploy no Render

1. Conecte seu repositório GitHub
2. Configure o serviço:
   - **Runtime**: Node
   - **Build Command**: npm install
   - **Start Command**: npm start
3. Adicione variáveis de ambiente se usar Supabase

## Banco de Dados

### SQLite (Desenvolvimento)
- Arquivo local `barbearia.db`
- Criado automaticamente na primeira execução

### Supabase (Produção)
- Persistência garantida
- Escalável
- Requer configuração de tabelas

## API Endpoints

- `POST /register` - Registrar usuário
- `POST /login` - Login usuário
- `POST /appointments` - Criar agendamento
- `GET /appointments/:email` - Listar agendamentos do usuário
- `POST /payments` - Processar pagamento
- `POST /register-barber` - Registrar barbeiro
- `POST /login-barber` - Login barbeiro
- `GET /barbeiros` - Listar barbeiros
- `GET /barber-appointments/:email` - Agendamentos do barbeiro
- `POST /cancel-appointment` - Cancelar agendamento

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto é open source e está sob a licença MIT.
