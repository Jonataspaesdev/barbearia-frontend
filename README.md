# 💈 Sistema de Barbearia - API REST

Sistema completo para gerenciamento de uma barbearia, desenvolvido com **Spring Boot 3 (Backend)** e **React + Vite (Frontend)**.

Projeto fullstack com autenticação JWT, controle de acesso por roles e regras reais de negócio.

---

# 🚀 Tecnologias Utilizadas

## 🔙 Backend
- Java 17
- Spring Boot 3
- Spring Security
- JWT (Autenticação Stateless)
- Spring Data JPA
- PostgreSQL
- Swagger (OpenAPI)
- Maven

## 🎨 Frontend
- React
- Vite
- React Router DOM
- Axios
- Interceptor JWT
- Controle de rotas por role

---

# 🔐 Autenticação

A API utiliza autenticação via **JWT (JSON Web Token)**.

Após login, o token deve ser enviado no header:


Authorization: Bearer SEU_TOKEN_AQUI


A aplicação é **stateless**, ou seja:
- Não usa sessão
- Toda requisição autenticada depende do token

---

# 👥 Controle de Acesso (Roles)

O sistema possui controle de acesso baseado em roles:

## 🔹 ROLE_ADMIN
Pode:
- Visualizar lista completa de clientes
- Editar clientes
- Excluir clientes
- Gerenciar módulos do sistema
- Visualizar todos os agendamentos

## 🔹 ROLE_CLIENTE
Pode:
- Criar conta
- Realizar login
- Criar agendamentos
- Visualizar apenas seus próprios agendamentos

---

# 🔑 Endpoints de Autenticação

## 📌 Login


POST /auth/login


### Exemplo de requisição:

```json
{
  "email": "admin@admin.com",
  "senha": "123456"
}
Exemplo de resposta:
{
  "token": "JWT_TOKEN_AQUI",
  "email": "admin@admin.com",
  "nome": "Administrador",
  "role": "ROLE_ADMIN"
}
📌 Registro de Cliente
POST /auth/register
Exemplo de requisição:
{
  "nome": "João",
  "email": "joao@email.com",
  "telefone": "61999999999",
  "senha": "123456"
}
Exemplo de resposta:
{
  "usuarioId": 5,
  "clienteId": 5,
  "nome": "João",
  "email": "joao@email.com",
  "role": "ROLE_CLIENTE"
}

Cria automaticamente um usuário com role ROLE_CLIENTE.

🛡️ Regras de Segurança Implementadas

/auth/** → Público

GET /servicos → Público

/clientes → Apenas ADMIN

POST /agendamentos → Apenas CLIENTE autenticado

Cliente só pode visualizar seus próprios agendamentos

Se um cliente tentar acessar agendamentos de outro cliente → retorna 403

O backend ignora clienteId enviado no body e utiliza o cliente do token

👤 Endpoints de Clientes
Criar cliente
POST /clientes

✔ Público

Listar clientes
GET /clientes

🔒 Apenas ADMIN

Atualizar cliente
PUT /clientes/{id}

🔒 Apenas ADMIN

Excluir cliente
DELETE /clientes/{id}

🔒 Apenas ADMIN

📅 Agendamentos
Criar agendamento
POST /agendamentos

✔ Apenas CLIENTE autenticado

Listar agendamentos do cliente
GET /agendamentos/cliente/{clienteId}

✔ Cliente pode acessar apenas o próprio ID
❌ Se tentar outro ID → 403 Forbidden

🧪 Como testar no Swagger

Inicie a aplicação

Acesse:

http://localhost:8080/swagger-ui/index.html

Faça login em /auth/login

Copie o token retornado

Clique em Authorize

Cole:

Bearer SEU_TOKEN
💻 Frontend

O frontend foi desenvolvido com:

React + Vite

React Router

Axios com interceptor JWT

Controle de rotas por role (Admin / Cliente)

Funcionalidades implementadas:

✔ Login
✔ Registro de cliente
✔ Armazenamento de token no LocalStorage
✔ Proteção de rotas por role
✔ Lista de clientes (visível apenas para ADMIN)
✔ Página de agendamentos para CLIENTE

📦 Estrutura do Projeto
backend/
 ├── controller/
 ├── service/
 ├── repository/
 ├── security/
 ├── model/
 └── dto/

frontend/
 ├── pages/
 ├── auth/
 ├── api/
 ├── layouts/
 └── services/
📌 Status do Projeto

🚧 Em desenvolvimento contínuo

✔ Autenticação JWT
✔ Controle de acesso por roles
✔ CRUD de Clientes
✔ Sistema de Agendamentos
🔄 Módulo de pagamentos em construção
🔄 Dashboard administrativo em evolução

🎯 Objetivo do Projeto

Projeto desenvolvido para estudo de:

Arquitetura REST

Segurança com Spring Security

Autenticação JWT

Controle de acesso por roles

Integração fullstack (React + Spring Boot)

Boas práticas de organização de código

👨‍💻 Autor

Jonatas Paes


iniciar o frontend na pasta do arquivo 

npm run dev
