💈 Sistema de Barbearia - Frontend (React + Vite)

Frontend do sistema de barbearia desenvolvido com React + Vite, consumindo API REST em Spring Boot 3 com JWT.

Projeto Fullstack completo, com arquitetura real de produção e regras de negócio aplicadas no frontend e backend.

🚀 Projeto Fullstack com:

🔐 Autenticação JWT
🧭 Controle de acesso por Roles (ADMIN / CLIENTE)
📊 Dashboard administrativo analítico
📅 Gestão administrativa completa de agendamentos
💈 CRUD completo de Serviços
💈 CRUD completo de Barbeiros
👥 CRUD completo de Clientes
📅 Fluxo inteligente de agendamento (cliente)
🛡️ Soft delete de serviços
🧠 Validações inteligentes no frontend

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
📈 Indicadores

Total de Clientes

Total de Agendamentos

Agendamentos de Hoje

Faturamento Geral

Faturamento do Mês

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

Ordenação por colunas

Soma automática do valor filtrado

Exportação CSV

💈 Gestão de Serviços (ADMIN)

Integração com:

GET /servicos
POST /servicos
PUT /servicos/{id}
DELETE /servicos/{id} (soft delete)

Funcionalidades:

Cadastro

Edição

Desativação (soft delete)

Status visual (Ativo / Inativo)

Recarregamento manual

Validação de preço e duração

Compatibilidade com backend (ativo: true)

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

Apenas serviços ATIVOS podem ser vinculados

Limpeza automática de serviços inativos

Feedback visual

Recarregamento manual

📅 Gestão de Agendamentos (ADMIN)

Nova tela dedicada:

/agendamentos-admin

Funcionalidades:

Listagem completa via GET /agendamentos

Filtros combinados

Ordenação por colunas

Soma automática do valor filtrado

Exportação CSV

Botão Recarregar

📅 Fluxo Inteligente de Agendamento (CLIENTE)

Integração com:

POST /agendamentos
GET /servicos
GET /barbeiros
GET /agendamentos/cliente/{clienteId}
DELETE /agendamentos/{id}/cancelar

Funcionalidades:

Apenas serviços ATIVOS aparecem

Serviço inativo é automaticamente removido da seleção

Validação de data/hora futura

Seleção automática inicial

Redirecionamento após sucesso

Cancelamento com confirmação

Atualização automática da lista

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
 │    ├── servicos/
 │    │     └── ServicosPage.jsx
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
✔ CRUD completo de Serviços
✔ Soft delete funcional
✔ Filtro de serviços ativos
✔ CRUD completo de Barbeiros
✔ Fluxo completo de agendamento
✔ Cancelamento de agendamento

🎯 Objetivo do Projeto

Projeto desenvolvido para estudo e prática de:

Integração Frontend + Backend

Consumo de API REST

Autenticação JWT

Controle de acesso por perfil

Estruturação profissional em React

Arquitetura Fullstack real

👨‍💻 Autor

Jonatas Paes
Fullstack Developer | Java | Spring Boot | React
