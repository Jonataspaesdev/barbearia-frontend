💈 Sistema de Barbearia - Frontend (React + Vite)

Frontend do sistema de barbearia desenvolvido com React + Vite, consumindo a API Spring Boot com autenticação JWT.

Projeto Fullstack com controle de acesso por roles e layout administrativo profissional com sidebar global.

🚀 Tecnologias Utilizadas

React

Vite

React Router DOM

Axios

Interceptor JWT automático

Controle de rotas por Role (ADMIN / CLIENTE)

Layout global com Sidebar

LocalStorage para persistência de autenticação

▶️ Como Executar o Frontend

Abra o terminal na pasta do projeto frontend:

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

Token é removido

Dados do usuário são removidos

Usuário é redirecionado para /login

🧭 Layout do Sistema

O sistema utiliza um AppLayout global, contendo:

Sidebar fixa

Exibição do usuário logado

Controle de exibição de menus por role

Botão Sair

Área central com <Outlet /> para renderização das páginas

👥 Controle de Acesso (Frontend)

O sistema protege rotas com base na role:

🔹 ROLE_ADMIN

Pode acessar:

/clientes

/servicos

/barbeiros

/pagamentos

Dashboard administrativo

Menu administrativo completo visível na sidebar.

🔹 ROLE_CLIENTE

Pode acessar:

/agendamentos

/agendamentos/novo

Dashboard do cliente

Menu limitado exibido na sidebar.

📅 Funcionalidades Implementadas
🔐 Login

Integração com POST /auth/login

Armazena token e dados do usuário

Redirecionamento automático por role

📝 Registro de Cliente

Integração com POST /auth/register

Cria conta automaticamente com ROLE_CLIENTE

👥 Gestão de Clientes (ADMIN)

Integração com:

GET /clientes

POST /clientes

PUT /clientes/{id}

Funcionalidades:

Cadastro de cliente

Edição de cliente

Listagem protegida por role

Recarregamento manual

📅 Meus Agendamentos (CLIENTE)

Integração com:

GET /agendamentos/cliente/{clienteId}

Funcionalidades:

Lista apenas agendamentos do cliente logado

Exibição de status

Tratamento de erro 403

Layout em cards

❌ Cancelar Agendamento

Integração com:

DELETE /agendamentos/{id}/cancelar

Funcionalidades:

Botão "Cancelar" visível apenas para status permitido

Confirmação antes de cancelar

Recarrega lista automaticamente

Atualiza status para CANCELADO

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
/servicos (ADMIN)
/barbeiros (ADMIN)
/pagamentos (ADMIN)
/agendamentos (CLIENTE)
/agendamentos/novo (CLIENTE)
📁 Estrutura do Projeto
src/
 ├── api/
 │    └── api.js
 ├── auth/
 │    ├── auth.js
 │    └── PrivateRoute.jsx
 ├── components/
 │    ├── Sidebar.jsx
 │    ├── Topbar.jsx
 │    └── Loading.jsx
 ├── layouts/
 │    └── AppLayout.jsx
 ├── pages/
 │    ├── agendamentos/
 │    │    ├── MeusAgendamentosPage.jsx
 │    │    └── NovoAgendamentoPage.jsx
 │    ├── clientes/
 │    │    └── ClientesPage.jsx
 │    ├── Dashboard.jsx
 │    └── Login.jsx
 ├── styles/
 │    └── layout.css
 ├── App.jsx
 └── main.jsx
📌 Requisitos para Funcionar

O backend deve possuir:

GET /servicos público

GET /barbeiros público ou permitido para CLIENTE

Autenticação JWT funcionando

GET /agendamentos/cliente/{clienteId} validando por token

DELETE /agendamentos/{id}/cancelar funcionando

📈 Status do Projeto

✔ Login funcional
✔ Registro de cliente
✔ Proteção de rotas por role
✔ Interceptor JWT automático
✔ Layout global com sidebar
✔ Listagem de clientes (ADMIN)
✔ Fluxo completo de agendamento (CLIENTE)
✔ Cancelamento de agendamento
✔ Controle de menu por role

🚧 Melhorias visuais e dashboard analítico em evolução

🎯 Objetivo do Projeto

Projeto desenvolvido para estudo e prática de:

Integração Frontend + Backend

Consumo de API REST

Autenticação JWT

Controle de acesso por perfil

Layout administrativo React

Organização de código profissional

👨‍💻 Autor

Jonatas Paes
Fullstack Developer | Java | Spring Boot | React
