💈 Sistema de Barbearia – Frontend (React + Vite)
Frontend do sistema de barbearia desenvolvido com React + Vite, consumindo uma API REST em Spring Boot 3 com autenticação JWT (Stateless).

Projeto Fullstack com arquitetura real de produção, regras de negócio no backend e experiência profissional no frontend.

🚀 Projeto Fullstack com
🔐 Autenticação JWT (Stateless)
🧭 Controle de acesso por Roles (ADMIN / CLIENTE)
📊 Dashboard administrativo analítico com filtros
📅 Gestão administrativa completa de agendamentos
💈 CRUD completo de Serviços
💈 CRUD completo de Barbeiros
👥 CRUD completo de Clientes
📅 Fluxo inteligente de agendamento (Wizard Profissional)
🕒 Disponibilidade dinâmica real por barbeiro
🛡️ Soft delete de serviços
📈 Faturamento geral e por barbeiro
🎨 Interface moderna em tema escuro
📱 Layout responsivo (mobile-first)

🛠 Tecnologias Utilizadas
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
Abra o terminal na pasta do projeto:

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

baseURL: "http://localhost:8080";
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

Dados do usuário são limpos

Redirecionamento automático para /login

🧭 Layout Global
O sistema utiliza um AppLayout global:

📌 Sidebar fixa
📌 Exibição do usuário logado
📌 Menu dinâmico por role
📌 Botão Sair funcional
📌 Área central com <Outlet />

Arquivo principal:

src/layouts/AppLayout.jsx
👥 Controle de Acesso
🔹 ROLE_ADMIN
Acesso completo ao sistema:

/dashboard

/clientes

/servicos

/barbeiros

/agendamentos-admin

/pagamentos

Menu administrativo completo exibido na sidebar.

🔹 ROLE_CLIENTE
Acesso restrito a:

/agendamentos

/agendamentos/novo

Menu limitado exibido na sidebar.

📊 Dashboard Administrativo (ADMIN)
Dashboard analítico com:

✔ Total de agendamentos filtrados
✔ Faturamento total filtrado
✔ Filtro por período (semana / mês)
✔ Filtro por barbeiro
✔ Faturamento individual por barbeiro
✔ Atualização automática após concluir atendimento

O botão "Compareceu" marca o agendamento como:

CONCLUIDO
Integrado com:

PUT /agendamentos/{id}
📅 Gestão de Agendamentos (ADMIN)
Rota:

/agendamentos-admin
Funcionalidades:

✔ Listagem completa via GET /agendamentos
✔ Filtros combinados (Status, Data, Barbeiro, Serviço)
✔ Busca textual
✔ Soma automática do valor filtrado
✔ Botão "Compareceu" funcional
✔ Atualização automática
✔ Interface moderna e responsiva

💈 Gestão de Serviços (ADMIN)
Integração com:

GET /servicos

POST /servicos

PUT /servicos/{id}

DELETE /servicos/{id} (Soft delete)

Funcionalidades:

✔ Cadastro
✔ Edição
✔ Desativação (soft delete)
✔ Status visual (Ativo / Inativo)
✔ Validação de preço e duração
✔ Compatibilidade com backend (ativo: true)

💈 Gestão de Barbeiros (ADMIN)
Integração com:

GET /barbeiros

POST /barbeiros

PUT /barbeiros/{id}

DELETE /barbeiros/{id}

Funcionalidades:

✔ Cadastro
✔ Edição
✔ Exclusão com confirmação
✔ Vínculo de serviços
✔ Conversão correta de LocalTime (HH:MM)
✔ Apenas serviços ATIVOS podem ser vinculados

📅 Fluxo de Agendamento (CLIENTE)
Rotas
/agendamentos

/agendamentos/novo

Integração com backend
POST /agendamentos

GET /servicos

GET /barbeiros

GET /agendamentos/cliente/{clienteId}

DELETE /agendamentos/{id}/cancelar

GET /agendamentos/disponibilidade

✨ Wizard Profissional (Novo Agendamento)
Fluxo passo a passo:

1️⃣ Escolher Serviço
2️⃣ Escolher Barbeiro
3️⃣ Escolher Data
4️⃣ Escolher Horário (grade visual dinâmica)
5️⃣ Confirmar + Observação opcional

🕒 Disponibilidade Dinâmica Real
Consome:

GET /agendamentos/disponibilidade?barbeiroId=X&data=YYYY-MM-DD
O backend retorna:

horaEntrada

horaSaida

horários ocupados

O frontend:

✔ Gera slots automaticamente
✔ Desabilita horários ocupados
✔ Bloqueia horários passados
✔ Mostra status visual Disponível / Indisponível

📋 Meus Agendamentos (Cliente)
Tela moderna com:

🔵 Abas rápidas:

Agendados

Concluídos

Cancelados

Todos

Funcionalidades:

✔ Ordenação automática por data
✔ Badge visual por status
✔ Cancelamento com confirmação
✔ Atualização automática

🧭 Rotas do Sistema
/login
/dashboard
/clientes
/servicos
/barbeiros
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
✔ Layout global responsivo
✔ Dashboard administrativo com filtro profissional
✔ Faturamento geral e por barbeiro
✔ Botão Compareceu funcional
✔ Tela dedicada de agendamentos (ADMIN)
✔ CRUD completo de Serviços
✔ Soft delete funcional
✔ CRUD completo de Barbeiros
✔ Fluxo completo de agendamento
✔ Disponibilidade dinâmica real
✔ Cancelamento de agendamento
✔ Histórico organizado por status
✔ UX profissional

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


