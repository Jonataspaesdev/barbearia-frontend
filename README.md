💈 Sistema de Barbearia – Frontend (React + Vite)
Frontend do sistema Dom Ribeiro desenvolvido com React + Vite, consumindo uma API REST em Spring Boot 3 com autenticação JWT (Stateless).

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
🚫 Bloqueio de domingo (frontend – barbearia fechada)
📲 Integração com WhatsApp (mensagem automática pronta via wa.me)
🛡️ Soft delete de serviços
📈 Faturamento geral e por barbeiro
🎨 Interface moderna em tema escuro
📱 Layout responsivo (mobile-first)
🌐 Página pública estilo Linktree personalizada (Dom Ribeiro)
📋 Página pública de Catálogo de Serviços

🌐 Deploy em Produção
Frontend (Vercel)
https://barbearia-frontend-two.vercel.app

Backend (Render)
https://barbearia-backend-h7da.onrender.com

🌐 Páginas Públicas
O sistema possui páginas públicas ideais para:

Instagram

Google Perfil da Empresa

Divulgação via WhatsApp

🔗 Página Linktree Personalizada
Rota:

/links
Produção:

https://barbearia-frontend-two.vercel.app/links
Funcionalidades:

✔ Identidade visual Dom Ribeiro (preto + dourado)
✔ Logo oficial redonda
✔ Botões grandes e acessíveis (mobile-first)
✔ Agendamento rápido via site
✔ Agendamento direto via WhatsApp
✔ WhatsApp Business
✔ Acesso ao Catálogo de Serviços
✔ Página totalmente independente de login

Essa página funciona como um Linktree próprio da barbearia.

📋 Página Catálogo de Serviços
Rota:

/catalogo
Funcionalidades:

✔ Tabela de preços masculina
✔ Tabela completa de serviços
✔ Visual premium (preto + dourado)
✔ Imagens ampliáveis
✔ Design responsivo

Ideal para envio direto ao cliente.

📲 Integração com WhatsApp (Modo Gratuito)
O sistema possui integração com WhatsApp utilizando link wa.me.

Após confirmar agendamento:

✔ Exibe botão para abrir WhatsApp com mensagem pronta
✔ Mensagem formatada automaticamente com:

Serviço

Barbeiro

Data e horário

Endereço

Observação (se houver)

Status

Link do painel administrativo

Em Meus Agendamentos:

✔ Botão "Falar no WhatsApp" em cada agendamento
✔ Mensagem contextual automática

Implementação 100% gratuita (sem API paga).

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
Acesse:

http://localhost:5173
⚠ Backend Obrigatório
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

✔ Token é removido
✔ Dados do usuário são limpos
✔ Redirecionamento automático para /login

🧭 Layout Global
AppLayout com:

📌 Sidebar fixa
📌 Exibição do usuário logado
📌 Menu dinâmico por role
📌 Botão Sair funcional
📌 Área central com <Outlet />

Arquivo:

src/layouts/AppLayout.jsx
👥 Controle de Acesso
🔹 ROLE_ADMIN
Acesso completo:

/dashboard
/clientes
/servicos
/barbeiros
/agendamentos-admin
/pagamentos
🔹 ROLE_CLIENTE
Acesso restrito:

/agendamentos
/agendamentos/novo
📊 Dashboard Administrativo (ADMIN)
✔ Total de agendamentos filtrados
✔ Faturamento total filtrado
✔ Filtro por período (semana / mês)
✔ Filtro por barbeiro
✔ Faturamento individual por barbeiro
✔ Atualização automática após concluir atendimento

Botão "Compareceu" marca como:

CONCLUIDO
Integração:

PUT /agendamentos/{id}
📅 Fluxo de Agendamento (CLIENTE)
Rotas:

/agendamentos
/agendamentos/novo
Integrações:

POST /agendamentos
GET /servicos
GET /barbeiros
GET /agendamentos/cliente/{clienteId}
DELETE /agendamentos/{id}/cancelar
GET /agendamentos/disponibilidade
✨ Wizard Profissional
1️⃣ Escolher Serviço
2️⃣ Escolher Barbeiro
3️⃣ Escolher Data (domingo bloqueado)
4️⃣ Escolher Horário (grade dinâmica)
5️⃣ Confirmar + Observação
6️⃣ Tela final com botão WhatsApp

🕒 Disponibilidade Dinâmica
Consome:

GET /agendamentos/disponibilidade?barbeiroId=X&data=YYYY-MM-DD
Frontend:

✔ Gera horários automaticamente
✔ Desabilita ocupados
✔ Bloqueia horários passados
✔ Bloqueia domingos
✔ Mostra status visual

📋 Meus Agendamentos
✔ Abas por status
✔ Ordenação automática
✔ Badge visual
✔ Cancelamento com confirmação
✔ Botão direto para WhatsApp

🧭 Rotas do Sistema
/login
/links
/catalogo
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
 ├── auth/
 ├── layouts/
 ├── pages/
 │    ├── agendamentos/
 │    ├── clientes/
 │    ├── barbeiros/
 │    ├── servicos/
 │    ├── LinksCutz.jsx
 │    ├── CatalogoDomRibeiro.jsx
 │    ├── Dashboard.jsx
 │    └── Login.jsx
 ├── styles/
 ├── App.jsx
 └── main.jsx
📈 Status do Projeto
✔ Login funcional
✔ Registro de cliente
✔ Proteção de rotas por role
✔ Interceptor JWT automático
✔ Dashboard administrativo completo
✔ CRUD completo
✔ Fluxo de agendamento profissional
✔ Disponibilidade dinâmica real
✔ WhatsApp integrado (modo gratuito)
✔ Bloqueio de domingo no frontend
✔ Página pública Linktree personalizada
✔ Página pública de catálogo
✔ UX moderna e responsiva

🎯 Objetivo do Projeto
Projeto desenvolvido para estudo e prática de:

Integração Frontend + Backend
Consumo de API REST
Autenticação JWT
Controle de acesso por perfil
Arquitetura Fullstack real
Experiência de usuário profissional
Evolução para monetização real

👨‍💻 Autor
Jonatas Paes
Fullstack Developer | Java | Spring Boot | React
