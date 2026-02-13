💈 Sistema de Barbearia - FRONTEND (React)

Frontend desenvolvido em React + Vite para consumir a API do sistema de barbearia (Spring Boot + JWT), com:

🔐 Login com JWT

🧭 Rotas protegidas (PrivateRoute)

🌐 Integração com API via Axios (interceptor com Bearer Token)

📋 Telas do sistema (em evolução)

🚀 Tecnologias Utilizadas

React

Vite

JavaScript

React Router DOM

Axios

CSS básico (sem framework por enquanto)

🔗 Integração com o Backend

Este frontend consome o backend rodando em:

Backend: http://localhost:8080

Swagger: http://localhost:8080/swagger-ui/index.html

📌 Endpoints principais usados pelo front:

POST /auth/login (gera token JWT)

GET /servicos (listar serviços)

🔐 Autenticação (JWT)

O login gera um token e o frontend salva no localStorage.

Depois disso, todas as requisições protegidas enviam automaticamente:

Authorization: Bearer SEU_TOKEN

✅ Isso é feito via interceptor do Axios.

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
🧭 Rotas e Proteção

/login → público

/dashboard → protegido (precisa estar logado)

A proteção é feita pelo componente:

PrivateRoute.jsx

Se não tiver token, o usuário é redirecionado para /login.

📌 Funcionalidades Implementadas (Frontend)
✅ Login

Formulário com email e senha

Chama /auth/login

Salva token no localStorage

Redireciona para /dashboard

✅ Dashboard (Protegido)

Página protegida por token

Base pronta para mostrar dados reais (serviços, clientes, etc.)

📂 Estrutura do Projeto (Frontend)
src/
  api/
    api.js              # Axios + interceptor JWT
  auth/
    auth.js             # salvar / pegar token
    PrivateRoute.jsx    # rota protegida
  pages/
    Login.jsx
    Dashboard.jsx
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

⚠️ Se a porta 5173 estiver ocupada, o Vite pode subir em 5174.

✅ Requisitos para funcionar

Antes de rodar o frontend, o backend precisa estar rodando:

http://localhost:8080
📈 Status do Projeto

🚧 Frontend em desenvolvimento
✅ Login + JWT funcionando
✅ Rotas protegidas funcionando

Próximas telas (planejadas):

Clientes (CRUD)

Serviços (CRUD)

Barbeiros (CRUD + soft delete + reativar)

Agendamentos (CRUD)

Pagamentos (pagar + relatório por período)

👨‍💻 Autor

Jonatas Paes
Fullstack em evolução | Java | Spring Boot | React
