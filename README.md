✅ README COMPLETO – FULLSTACK PROFISSIONAL

📄 SUBSTITUA SEU README.md POR ESSE:

# 💈 Sistema de Barbearia - Fullstack (Spring Boot + React)

Sistema completo para gerenciamento de uma barbearia, desenvolvido com:

- 🔙 **Spring Boot 3 (Backend)**
- 🎨 **React + Vite (Frontend)**

Projeto fullstack com autenticação JWT (Stateless), controle de acesso por Roles (ADMIN, BARBEIRO, CLIENTE) e regras reais de negócio.

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
- BCrypt (criptografia de senha)

## 🎨 Frontend
- React
- Vite
- React Router DOM
- Axios
- Interceptor JWT automático
- Controle de rotas por Role

---

# 🔐 Autenticação (JWT)

A API utiliza autenticação via **JWT Token**.

Após login, o token deve ser enviado no header:


Authorization: Bearer SEU_TOKEN_AQUI


O sistema é **stateless**, ou seja:
- ❌ Não usa sessão
- ✔ Toda requisição protegida depende do token

---

# 👥 Controle de Acesso (Roles)

| Role | Permissões |
|------|------------|
| ROLE_ADMIN | Controle total do sistema |
| ROLE_BARBEIRO | Visualizar e atualizar seus agendamentos |
| ROLE_CLIENTE | Criar e visualizar seus próprios agendamentos |

---

# 👤 Cadastro de Cliente

Clientes podem criar conta via:


POST /auth/register


### Exemplo:

```json
{
  "nome": "Cliente Teste",
  "email": "cliente1@gmail.com",
  "telefone": "11999990000",
  "senha": "123456"
}
Resposta:
{
  "usuarioId": 10,
  "clienteId": 4,
  "nome": "Cliente Teste",
  "email": "cliente1@gmail.com",
  "role": "ROLE_CLIENTE"
}
Regras:

❌ Email não pode duplicar

🔐 Senha criptografada com BCrypt

✔ Cria automaticamente:

Usuario com ROLE_CLIENTE

Cliente vinculado (OneToOne)

🔑 Login
POST /auth/login
Exemplo:
{
  "email": "admin@admin.com",
  "senha": "123456"
}
Resposta:
{
  "token": "SEU_TOKEN_AQUI",
  "email": "admin@admin.com",
  "nome": "Administrador",
  "role": "ROLE_ADMIN"
}
👑 Usuário Administrador Padrão

Criado automaticamente ao iniciar o sistema:

Email: admin@admin.com

Senha: 123456

Role: ROLE_ADMIN

📌 Funcionalidades Implementadas
👥 Clientes (ADMIN)

Endpoints:

POST   /clientes
GET    /clientes
GET    /clientes/{id}
PUT    /clientes/{id}
DELETE /clientes/{id}

⚠ Apenas ADMIN pode gerenciar clientes manualmente.

✂️ Serviços

Regras:

Nome obrigatório

Nome não pode duplicar

Preço > 0

Duração > 0

Soft delete

Endpoints:

POST   /servicos        (ADMIN)
GET    /servicos        (Público)
GET    /servicos/{id}
PUT    /servicos/{id}   (ADMIN)
DELETE /servicos/{id}   (Soft delete - ADMIN)
💈 Barbeiros

Funcionalidades:

Criar barbeiro (cria automaticamente usuário ROLE_BARBEIRO)

Vincular serviços via servicoIds

Soft delete

Reativar barbeiro

Endpoints:

POST   /barbeiros                  (ADMIN)
GET    /barbeiros                  (Público)
GET    /barbeiros/{id}
PUT    /barbeiros/{id}             (ADMIN)
DELETE /barbeiros/{id}             (ADMIN)
PUT    /barbeiros/{id}/reativar    (ADMIN)
📅 Agendamentos

Funcionalidades:

Cliente cria agendamento

Cliente só vê os seus

Admin vê todos

Barbeiro vê os seus

Regras de Negócio:

❌ Não permite agendar no passado

❌ Não permite fora do horário do barbeiro

❌ Não permite conflito de horário

✔ Calcula automaticamente dataHoraFim

✔ ClienteId associado automaticamente pelo token

Endpoints:

POST   /agendamentos
GET    /agendamentos
GET    /agendamentos/cliente/{clienteId}
GET    /agendamentos/barbeiro/{barbeiroId}
PUT    /agendamentos/{id}
DELETE /agendamentos/{id}/cancelar
💳 Pagamentos

Funcionalidades:

Realiza pagamento

Marca automaticamente agendamento como CONCLUIDO

Impede pagamento duplicado

Endpoint:

POST /pagamentos

Exemplo:

{
  "agendamentoId": 2,
  "valor": 35.0,
  "formaPagamento": "PIX"
}
📊 Relatório Financeiro
GET /pagamentos/relatorio?dataInicio=2026-02-01&dataFim=2026-02-28

Retorna:

Total faturado

Quantidade de pagamentos

Período consultado

🔒 Segurança
Públicos

/auth/**

GET /servicos

GET /barbeiros

Protegidos (JWT obrigatório)

Clientes

Agendamentos

Pagamentos

Serviços (exceto GET)

Barbeiros (exceto GET)

💻 Frontend

Desenvolvido com React + Vite.

Funcionalidades:

✔ Login
✔ Registro de cliente
✔ Interceptor JWT automático
✔ Proteção de rotas por role
✔ Página de Meus Agendamentos
✔ Criar Agendamento (select de serviço e barbeiro)
✔ Lista de clientes (ADMIN)

📦 Estrutura do Projeto
backend/
 ├── controller/
 ├── service/
 ├── repository/
 ├── model/
 ├── security/
 ├── config/
 ├── dto/
 └── exception/

frontend/
 ├── pages/
 ├── auth/
 ├── api/
 ├── layouts/
 └── services/
▶️ Como Executar o Projeto
🔙 Backend
git clone https://github.com/Jonataspaesdev/barbearia-backend.git
cd barbearia-backend
mvn clean install
mvn spring-boot:run

Acesso:

API: http://localhost:8080

Swagger: http://localhost:8080/swagger-ui/index.html

🎨 Frontend

Entre na pasta do frontend:

cd frontend
npm install
npm run dev

Acesse:

http://localhost:5173

📈 Status do Projeto

✔ Backend completo e funcional
✔ Autenticação JWT com Roles
✔ Sistema completo de agendamentos
✔ Pagamentos e relatório financeiro
✔ Frontend funcional integrado
🚧 Melhorias visuais e dashboard administrativo em evolução

🎯 Objetivo do Projeto

Projeto desenvolvido para estudo e prática de:

Arquitetura REST

Segurança com Spring Security

Autenticação JWT

Controle de acesso por roles

Regras reais de negócio

Integração fullstack (React + Spring Boot)

Boas práticas de organização de código

👨‍💻 Autor

Jonatas Paes
Backend Developer | Java | Spring Boot
