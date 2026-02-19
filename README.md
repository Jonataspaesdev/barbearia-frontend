💈 Sistema de Barbearia - Frontend (React + Vite)

Frontend do sistema de barbearia desenvolvido com React + Vite, consumindo API REST em Spring Boot 3 com JWT.

Projeto Fullstack com:

🔐 Autenticação JWT

🧭 Controle de acesso por Roles

📊 Dashboard administrativo analítico

💈 CRUD completo de Barbeiros

📅 Fluxo completo de agendamentos

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

📅 Agenda Completa

Tabela com:

Data/Hora

Cliente

Barbeiro

Serviço

Preço

Status (AGENDADO / CANCELADO / FINALIZADO)

Observação

🔎 Filtros Avançados

Filtro por Status

Filtro por Data (Hoje / Próximos 7 dias / Mês)

Filtro por Serviço

Filtro por Barbeiro

Busca por texto

Exportação CSV da agenda filtrada

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

Criação automática com ROLE_CLIENTE

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

Cadastro de barbeiro

Edição de barbeiro

Exclusão com confirmação

Vínculo de serviços

Conversão correta de LocalTime (HH:MM)

Tratamento de erro e feedback visual

Recarregamento manual

📅 Meus Agendamentos (CLIENTE)

Integração com:

GET /agendamentos/cliente/{clienteId}

Lista apenas agendamentos do cliente logado

Exibição de status

Layout em cards

Tratamento de erro 403

❌ Cancelar Agendamento

Integração com:

DELETE /agendamentos/{id}/cancelar

Confirmação antes de cancelar

Atualização automática da lista

Atualiza status para CANCELADO

➕ Marcar Horário

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
