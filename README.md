# 💈 Sistema de Barbearia – Frontend (React + Vite)

Frontend do sistema de barbearia desenvolvido com **React + Vite**, consumindo uma API REST em **Spring Boot 3** com autenticação JWT (Stateless).

Projeto Fullstack com arquitetura real de produção, regras de negócio no backend e experiência profissional no frontend.

---

## 🚀 Projeto Fullstack com

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
🌐 Página pública estilo Linktree personalizada (CUTZ Links)

---

## 🌐 Página Pública – CUTZ Links

O sistema possui uma página pública de links personalizada:
/links


Disponível em produção:
https://barbearia-frontend-two.vercel.app/links


### Funcionalidades:

✔ Logo personalizada CUTZ com efeito neon  
✔ Design moderno com glow verde  
✔ Botões grandes e acessíveis (mobile-first)  
✔ Agendamento rápido via site  
✔ Agendamento direto via WhatsApp  
✔ WhatsApp Business  
✔ Totalmente independente do login  

Essa página funciona como um **Linktree próprio da barbearia**, ideal para Instagram, Google Perfil da Empresa e divulgação.

---

## 🛠 Tecnologias Utilizadas

- React
- Vite
- React Router DOM
- Axios
- Interceptor JWT automático
- Controle de rotas por Role (ADMIN / CLIENTE)
- Layout global com Sidebar
- CSS próprio (sem framework externo)
- LocalStorage para persistência de autenticação

---

## ▶️ Como Executar o Frontend

Abra o terminal na pasta do projeto:

```bash
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

✔ Token é removido
✔ Dados do usuário são limpos
✔ Redirecionamento automático para /login

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
✔ Total de agendamentos filtrados
✔ Faturamento total filtrado
✔ Filtro por período (semana / mês)
✔ Filtro por barbeiro
✔ Faturamento individual por barbeiro
✔ Atualização automática após concluir atendimento

Botão "Compareceu" marca agendamento como:

CONCLUIDO
Integração:

PUT /agendamentos/{id}
📅 Gestão de Agendamentos (ADMIN)
Rota:

/agendamentos-admin
Funcionalidades:

✔ Listagem completa via GET /agendamentos
✔ Filtros combinados
✔ Busca textual
✔ Soma automática do valor filtrado
✔ Botão "Compareceu" funcional
✔ Interface moderna e responsiva

💈 Gestão de Serviços (ADMIN)
Integração com:

GET /servicos
POST /servicos
PUT /servicos/{id}
DELETE /servicos/{id}
✔ Cadastro
✔ Edição
✔ Soft delete
✔ Validação de preço e duração

💈 Gestão de Barbeiros (ADMIN)
Integração com:

GET /barbeiros
POST /barbeiros
PUT /barbeiros/{id}
DELETE /barbeiros/{id}
✔ Cadastro
✔ Edição
✔ Exclusão
✔ Vínculo de serviços
✔ Conversão correta de LocalTime (HH:MM)

📅 Fluxo de Agendamento (CLIENTE)
Rotas:

/agendamentos
/agendamentos/novo
Integração com backend:

POST /agendamentos
GET /servicos
GET /barbeiros
GET /agendamentos/cliente/{clienteId}
DELETE /agendamentos/{id}/cancelar
GET /agendamentos/disponibilidade
✨ Wizard Profissional (Novo Agendamento)
1️⃣ Escolher Serviço
2️⃣ Escolher Barbeiro
3️⃣ Escolher Data
4️⃣ Escolher Horário (grade dinâmica)
5️⃣ Confirmar + Observação

🕒 Disponibilidade Dinâmica Real
Consome:

GET /agendamentos/disponibilidade?barbeiroId=X&data=YYYY-MM-DD
Frontend:

✔ Gera horários automaticamente
✔ Desabilita ocupados
✔ Bloqueia horários passados
✔ Mostra status visual

📋 Meus Agendamentos (Cliente)
✔ Abas por status
✔ Ordenação automática
✔ Badge visual
✔ Cancelamento com confirmação

🧭 Rotas do Sistema
/login
/links
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
✔ Página pública Linktree personalizada
✔ UX moderna e responsiva

🎯 Objetivo do Projeto
Projeto desenvolvido para estudo e prática de:

Integração Frontend + Backend

Consumo de API REST

Autenticação JWT

Controle de acesso por perfil

Arquitetura Fullstack real

Experiência de usuário profissional

👨‍💻 Autor
Jonatas Paes
Fullstack Developer | Java | Spring Boot | React


