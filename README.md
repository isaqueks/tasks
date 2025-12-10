# Task Manager - Sistema de Gerenciamento de Tarefas para Freelancers

Sistema completo para gerenciamento de tarefas, permitindo organizar tarefas por empresa com visão semanal e lista detalhada.

## Tecnologias

- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: React + Vite + TailwindCSS
- **Autenticação**: JWT

## Estrutura do Projeto

```
tasks/
├── backend/          # API NestJS
├── frontend/         # Aplicação React
└── docker-compose.yml # PostgreSQL
```

## Pré-requisitos

- Node.js 18+
- Docker e Docker Compose (para PostgreSQL)
- npm ou yarn

## Configuração

### 1. Banco de Dados

Inicie o PostgreSQL usando Docker Compose:

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend` com:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=taskmanager

JWT_SECRET=your-secret-key-change-in-production
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Inicie o servidor:

```bash
npm run start:dev
```

O backend estará rodando em `http://localhost:3000`

### 3. Frontend

```bash
cd frontend
npm install
```

Crie um arquivo `.env` na pasta `frontend` com:

```env
VITE_API_URL=http://localhost:3000
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## Criando o Primeiro Usuário

Como mencionado no plano, os usuários devem ser criados diretamente no banco de dados. Você pode usar o seguinte SQL (lembre-se de hash a senha com bcrypt):

```sql
INSERT INTO users (id, name, email, password, "createdAt")
VALUES (
  gen_random_uuid(),
  'Seu Nome',
  'seu@email.com',
  '$2b$10$...', -- Senha hashada com bcrypt
  NOW()
);
```

Para gerar o hash da senha, você pode usar um script Node.js:

```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('sua-senha', 10).then(hash => console.log(hash));
```

## Funcionalidades

### Autenticação
- Login com email e senha
- Autenticação JWT
- Proteção de rotas

### Empresas
- CRUD completo de empresas
- Campo CNPJ opcional
- Cada usuário vê apenas suas empresas

### Tarefas
- CRUD completo de tarefas
- Prioridade (Alta, Média, Baixa)
- Data opcional (tarefas sem data ficam no backlog)
- Marcação de conclusão
- Filtros por empresa, prioridade, status e data

### Visão Semanal
- Matriz empresa x dias da semana
- Visualização de tarefas por dia
- Navegação entre semanas
- Indicadores visuais de prioridade e conclusão

### Observações
- Múltiplas observações por tarefa
- CRUD de observações
- Exibição com data de criação

## API Endpoints

### Autenticação
- `POST /auth/login` - Login

### Empresas
- `GET /companies` - Listar empresas
- `POST /companies` - Criar empresa
- `GET /companies/:id` - Obter empresa
- `PATCH /companies/:id` - Atualizar empresa
- `DELETE /companies/:id` - Excluir empresa

### Tarefas
- `GET /tasks` - Listar tarefas (com filtros)
- `POST /tasks` - Criar tarefa
- `GET /tasks/weekly` - Visão semanal
- `GET /tasks/:id` - Obter tarefa
- `PATCH /tasks/:id` - Atualizar tarefa
- `DELETE /tasks/:id` - Excluir tarefa

### Observações
- `GET /tasks/:taskId/observations` - Listar observações
- `POST /tasks/:taskId/observations` - Criar observação
- `DELETE /tasks/:taskId/observations/:id` - Excluir observação

## Desenvolvimento

### Backend
```bash
cd backend
npm run start:dev  # Modo desenvolvimento com hot reload
npm run build      # Build para produção
npm run start:prod # Executar build de produção
```

### Frontend
```bash
cd frontend
npm run dev        # Servidor de desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview do build
```

## Licença

Este projeto é privado.

