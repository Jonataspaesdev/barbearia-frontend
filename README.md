.

💈 Sistema de Barbearia - FRONTEND (React)
Frontend desenvolvido em React + Vite para consumir a API do sistema de barbearia (Spring Boot + JWT).

🚀 Funcionalidades Implementadas
🔐 Login com JWT

🧭 Rotas protegidas (PrivateRoute)

🌐 Integração com API via Axios (Interceptor com Bearer Token)

📊 Dashboard protegido

👥 Tela de Clientes (Cadastro + Listagem)

🎨 Layout com Sidebar (menu lateral fixo)

🛠 Tecnologias Utilizadas
React

Vite

JavaScript

React Router DOM

Axios

CSS puro (sem framework)

🔗 Integração com o Backend
Este frontend consome o backend rodando em:

Backend:

http://localhost:8080
Swagger:

http://localhost:8080/swagger-ui/index.html
📌 Endpoints Utilizados pelo Front
POST /auth/login → Login (gera JWT)

GET /clientes → Listar clientes

POST /clientes → Criar cliente

GET /servicos → Listar serviços

🔐 Autenticação (JWT)
O login gera um token e o frontend salva no localStorage.

Todas as requisições protegidas enviam automaticamente:

Authorization: Bearer SEU_TOKEN
Isso é feito via interceptor do Axios.

🔑 Login
Tela
/login
Backend
POST /auth/login
Exemplo de Requisição
{
  "email": "admin@admin.com",
  "senha": "123456"
}
🧭 Rotas
Rota	Tipo
/login	Pública
/dashboard	Protegida
/clientes	Protegida
A proteção é feita pelo componente:

PrivateRoute.jsx
Se não houver token válido → redireciona para /login.

👥 Tela de Clientes (Implementada)
✅ Funcionalidades
Cadastro de cliente

Listagem automática após salvar

Integração real com backend

Tratamento de erro

Layout centralizado

Sidebar com menu lateral

📂 Estrutura Atual do Projeto
src/
  api/
    api.js
  auth/
    auth.js
    PrivateRoute.jsx
  layouts/
    AppLayout.jsx
  components/
    Loading.jsx
  pages/
    Login.jsx
    Dashboard.jsx
    clientes/
      ClientesPage.jsx
      clientesService.js
  App.jsx
  main.jsx
▶️ Como Executar o Projeto
1️⃣ Clonar o repositório
git clone https://github.com/Jonataspaesdev/barbearia-frontend.git
2️⃣ Entrar na pasta
cd barbearia-frontend
3️⃣ Instalar dependências
npm install
4️⃣ Rodar o frontend
npm run dev
🌐 Acesso
Frontend:

http://localhost:5173
⚠️ Se a porta 5173 estiver ocupada, o Vite pode usar 5174.

✅ Requisitos
O backend precisa estar rodando em:

http://localhost:8080
📈 Status do Projeto
🟢 Login + JWT funcionando
🟢 Rotas protegidas funcionando
🟢 Layout com Sidebar
🟢 Tela de Clientes integrada com backend

Próximas telas:
Serviços (CRUD)

Barbeiros (CRUD + soft delete)

Agendamentos

Pagamentos

Relatório financeiro

👨‍💻 Autor
Jonatas Paes
Fullstack em evolução 🚀
Java | Spring Boot | React


