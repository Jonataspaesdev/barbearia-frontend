# 💈 Sistema de Barbearia - Frontend (React + Vite)

Frontend do sistema de barbearia desenvolvido com **React + Vite**, consumindo a API Spring Boot com autenticação JWT.

Projeto fullstack com controle de acesso por roles e integração completa com o backend.

---

# 🚀 Tecnologias Utilizadas

- React
- Vite
- React Router DOM
- Axios
- Interceptor JWT automático
- Controle de rotas por Role (ADMIN / CLIENTE)
- LocalStorage para persistência de autenticação

---

# ▶️ Como Executar o Frontend

Abra o terminal na pasta do projeto frontend:

```bash
npm install
npm run dev

Acesse no navegador:

http://localhost:5173

⚠ O backend deve estar rodando em:

http://localhost:8080

Caso esteja em outra porta, altere no arquivo:

src/api/api.js

Exemplo:

baseURL: "http://localhost:8080"
🔐 Autenticação (JWT)

Após login, o frontend salva no LocalStorage:

token

role

nome

email

clienteId

O token é enviado automaticamente no header via interceptor Axios:

Authorization: Bearer SEU_TOKEN

Se o backend retornar 401:

O token é removido

O usuário é redirecionado para /login

👥 Controle de Acesso (Frontend)

O sistema protege rotas com base na role:

🔹 ROLE_ADMIN

Pode acessar:

/clientes

Dashboard administrativo

🔹 ROLE_CLIENTE

Pode acessar:

/agendamentos

/agendamentos/novo

Dashboard do cliente

📅 Funcionalidades Implementadas
🔐 Login

Integração com POST /auth/login

Armazena token e dados do usuário

📝 Registro de Cliente

Integração com POST /auth/register

Cria conta automaticamente com ROLE_CLIENTE

👥 Lista de Clientes (ADMIN)

Integração com GET /clientes

Rota protegida por role

📅 Meus Agendamentos (CLIENTE)

Integração com:

GET /agendamentos/cliente/{clienteId}

Exibe apenas agendamentos do cliente logado

Tratamento de erro 403

➕ Marcar Horário

Integração com:

POST /agendamentos

Funcionalidades:

Select automático de serviço (GET /servicos)

Select automático de barbeiro (GET /barbeiros)

Validação de data/hora futura

Redirecionamento após sucesso

🧭 Rotas do Sistema

/login

/dashboard

/clientes (ADMIN)

/agendamentos (CLIENTE)

/agendamentos/novo (CLIENTE)

📁 Estrutura do Projeto
src/
 ├── api/
 │    └── api.js
 ├── auth/
 │    └── PrivateRoute.jsx
 ├── pages/
 │    ├── agendamentos/
 │    │    ├── MeusAgendamentosPage.jsx
 │    │    └── NovoAgendamentoPage.jsx
 │    └── clientes/
 │         └── ClientesPage.jsx
 ├── App.jsx
 └── main.jsx
📌 Requisitos para Funcionar

O backend deve possuir:

GET /servicos público

GET /barbeiros público ou permitido para CLIENTE

Autenticação JWT funcionando

GET /agendamentos/cliente/{clienteId} validando por token

📈 Status do Projeto

✔ Login funcional
✔ Registro de cliente
✔ Proteção de rotas por role
✔ Interceptor JWT automático
✔ Listagem de clientes (ADMIN)
✔ Fluxo completo de agendamento (CLIENTE)
✔ Select dinâmico de serviço
✔ Select dinâmico de barbeiro

🚧 Melhorias visuais e dashboard administrativo em evolução

🎯 Objetivo do Projeto

Projeto desenvolvido para estudo e prática de:

Integração Frontend + Backend

Consumo de API REST

Autenticação JWT

Controle de acesso por perfil

Organização de código React

Boas práticas de arquitetura

👨‍💻 Autor

Jonatas Paes
Fullstack Developer | Java | Spring Boot | React
