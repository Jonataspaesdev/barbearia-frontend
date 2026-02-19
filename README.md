💈 Sistema de Barbearia - Frontend (React + Vite)

Frontend do sistema de barbearia desenvolvido com React + Vite, consumindo API REST em Spring Boot 3 com JWT.

Projeto Fullstack completo com:

🔐 Autenticação JWT
🧭 Controle de acesso por Roles
📊 Dashboard administrativo analítico
📅 Gestão administrativa de agendamentos
💈 CRUD completo de Barbeiros
📅 Fluxo completo de agendamentos (cliente)

🚀 Tecnologias Utilizadas

React

Vite

React Router DOM

Axios

Interceptor JWT automático

Controle de rotas por Role (ADMIN / CLIENTE)

Layout global com Sidebar

CSS próprio (sem framework externo)

LocalStorage para persistência de autenticação

▶️ Como Executar o Frontend

Abra o terminal na pasta do projeto frontend:

npm install
npm run dev

Acesse no navegador:

http://localhost:5173
⚠ Backend obrigatório

O backend deve estar rodando em:

http://localhost:8080

Caso esteja em outra porta, altere em:

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

O token é enviado automaticamente via interceptor Axios:

Authorization: Bearer SEU_TOKEN

Se o backend retornar 401 Unauthorized:

Token é removido

Dados do usuário são removidos

Redirecionamento automático para /login

🧭 Layout do Sistema

O sistema utiliza um AppLayout global contendo:

Sidebar fixa

Exibição do usuário logado

Controle de menus por role

Botão Sair

Área central com <Outlet />

Arquivo principal:

src/layouts/AppLayout.jsx
👥 Controle de Acesso
🔹 ROLE_ADMIN

Pode acessar:

/dashboard
/clientes
/servicos
/barbeiros
/pagamentos
/agendamentos-admin

Menu administrativo completo visível na sidebar.

🔹 ROLE_CLIENTE

Pode acessar:

/agendamentos
/agendamentos/novo

Menu limitado exibido na sidebar.

📊 Dashboard Administrativo (ADMIN)

Dashboard completo com:

📈 Indicadores

Total de Clientes

Total de Agendamentos

Agendamentos de Hoje

Faturamento Geral

Faturamento do Mês (Barbearia)

Faturamento do Mês por Barbeiro

📅 Agenda Analítica

Tabela com:

Data/Hora

Cliente

Barbeiro

Serviço

Preço

Status (AGENDADO / CANCELADO / CONCLUIDO)

Observação

🔎 Filtros Avançados

Filtro por Status

Filtro por Data

Filtro por Serviço

Filtro por Barbeiro

Busca por texto

Exportação CSV da agenda filtrada

📅 Gestão de Agendamentos (ADMIN)

Nova tela dedicada:

/agendamentos-admin
Funcionalidades:

Listagem completa via GET /agendamentos

Filtros combinados

Ordenação clicando nas colunas:

Data

Cliente

Barbeiro

Serviço

Preço

Status

Soma automática do valor filtrado

Exportação CSV da lista atual

Botão Recarregar

Layout profissional integrado ao sistema

📅 Funcionalidades Implementadas
🔐 Login

Integração com:

POST /auth/login

Armazena token e dados do usuário

Redirecionamento automático por role

Interceptor JWT automático

📝 Registro de Cliente

Integração com:

POST /auth/register

Criação automática com ROLE_CLIENTE.

👥 Gestão de Clientes (ADMIN)

Integração com:

GET /clientes
POST /clientes
PUT /clientes/{id}

Funcionalidades:

Cadastro

Edição

Listagem protegida por role

Recarregamento manual

💈 Gestão de Barbeiros (ADMIN)

Integração com:

GET /barbeiros
POST /barbeiros
PUT /barbeiros/{id}
DELETE /barbeiros/{id}
GET /servicos

Funcionalidades:

Cadastro

Edição

Exclusão com confirmação

Vínculo de serviços

Conversão correta de LocalTime (HH:MM)

Feedback visual

Recarregamento manual

📅 Meus Agendamentos (CLIENTE)

Integração com:

GET /agendamentos/cliente/{clienteId}

Lista apenas agendamentos do cliente logado

Exibição de status

Layout em cards

Tratamento de erro 403

❌ Cancelar Agendamento (CLIENTE)

Integração com:

DELETE /agendamentos/{id}/cancelar

Confirmação antes de cancelar

Atualização automática da lista

Atualiza status para CANCELADO

➕ Marcar Horário (CLIENTE)

Integração com:

POST /agendamentos
GET /servicos
GET /barbeiros

Select automático de serviço

Select automático de barbeiro

Validação de data/hora futura

Redirecionamento após sucesso

🧭 Rotas do Sistema
/login
/dashboard
/clientes
/servicos
/barbeiros
/pagamentos
/agendamentos-admin
/agendamentos
/agendamentos/novo
📁 Estrutura do Projeto
src/
 ├── api/
 │    └── api.js
 ├── auth/
 │    ├── auth.js
 │    └── PrivateRoute.jsx
 ├── layouts/
 │    └── AppLayout.jsx
 ├── pages/
 │    ├── agendamentos/
 │    │     ├── AgendamentosAdminPage.jsx
 │    │     ├── MeusAgendamentosPage.jsx
 │    │     └── NovoAgendamentoPage.jsx
 │    ├── clientes/
 │    ├── barbeiros/
 │    ├── Dashboard.jsx
 │    └── Login.jsx
 ├── styles/
 │    └── layout.css
 ├── App.jsx
 └── main.jsx
📈 Status do Projeto

✔ Login funcional
✔ Registro de cliente
✔ Proteção de rotas por role
✔ Interceptor JWT automático
✔ Layout global com sidebar
✔ Dashboard administrativo completo
✔ Filtros avançados
✔ Faturamento mensal por barbeiro
✔ Tela dedicada de agendamentos (ADMIN)
✔ Ordenação por colunas
✔ Exportação CSV
✔ Fluxo completo de agendamento
✔ Cancelamento de agendamento
✔ CRUD completo de Barbeiros

🎯 Objetivo do Projeto

Projeto desenvolvido para estudo e prática de:

Integração Frontend + Backend

Consumo de API REST

Autenticação JWT

Controle de acesso por perfil

Layout administrativo React

Organização de código profissional

Estrutura Fullstack real

👨‍💻 Autor

Jonatas Paes
Fullstack Developer | Java | Spring Boot | React
