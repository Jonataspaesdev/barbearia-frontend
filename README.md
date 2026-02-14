# 💈 Sistema de Barbearia - API REST

API REST desenvolvida em **Spring Boot 3** para gerenciamento completo de uma barbearia.

---

## 🚀 Tecnologias Utilizadas

- Java 17
- Spring Boot 3
- Spring Security
- JWT (Autenticação Stateless)
- Spring Data JPA
- PostgreSQL
- Swagger (OpenAPI)
- Maven
- React + Vite (Frontend)

---

## 🔐 Autenticação

A API utiliza autenticação via **JWT Token**.

Após login, o token deve ser enviado no header:


Authorization: Bearer SEU_TOKEN_AQUI


---

## 👥 Controle de Acesso (Roles)

O sistema possui controle de acesso por **roles**:

### 🔹 ROLE_ADMIN
- Visualizar lista completa de clientes
- Editar clientes
- Excluir clientes
- Gerenciar sistema

### 🔹 ROLE_CLIENTE
- Criar conta
- Realizar login
- Marcar horário
- Comprar produtos (futuro)

---

## 🔑 Endpoints de Autenticação

### 📌 Login

POST /auth/login


### Exemplo de requisição:

```json
{
  "email": "admin@admin.com",
  "senha": "123456"
}
Exemplo de resposta:
{
  "token": "TOKEN_AQUI",
  "email": "admin@admin.com",
  "nome": "Administrador",
  "role": "ROLE_ADMIN"
}
📌 Registro de Cliente
POST /auth/register
{
  "nome": "João",
  "email": "joao@email.com",
  "telefone": "61999999999",
  "senha": "123456"
}

Cria um usuário com role ROLE_CLIENTE.

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

✔ Cliente autenticado

Listar agendamentos
GET /agendamentos

🔒 Admin / regras específicas

🧪 Como testar no Swagger

Inicie a aplicação

Acesse:

http://localhost:8080/swagger-ui/index.html

Faça login em /auth/login

Copie o token

Clique em Authorize

Cole:

Bearer SEU_TOKEN
💻 Frontend

O frontend foi desenvolvido com:

React

Vite

React Router

Axios com interceptor JWT

Funcionalidades:

Login

Registro de cliente

Controle por role

Lista de clientes visível apenas para ADMIN

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
 └── layouts/
📌 Status do Projeto

🚧 Em desenvolvimento
✔ Autenticação JWT
✔ Controle por roles
✔ CRUD Clientes
✔ Agendamentos
🔄 Módulo de vendas em construção

👨‍💻 Autor

Desenvolvido por Jonatas Paes
Projeto para portfólio e estudo de arquitetura fullstack.
