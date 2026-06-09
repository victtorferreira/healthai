# HealthAI Backend

Backend em NestJS para uma plataforma multi-tenant de triagem e acompanhamento de saude. No estado atual, o projeto implementa a fundacao da API: bootstrap da aplicacao, configuracao de ambiente, conexao com PostgreSQL via TypeORM, entidades de dominio e migrations para o schema inicial.

> Estado atual: ainda nao existem controllers, services, DTOs, autenticacao, endpoints de CRUD ou integracao real com IA. Algumas dependencias e campos ja preparam esse caminho, mas esses fluxos ainda nao estao implementados.

## O que ja esta implementado

- Aplicacao NestJS com prefixo global `api/v1`.
- Configuracao global por `.env` usando `@nestjs/config`.
- Conexao com PostgreSQL usando `@nestjs/typeorm`.
- Execucao automatica das migrations ao subir a aplicacao (`migrationsRun: true`).
- DataSource separado para uso da CLI do TypeORM.
- Swagger habilitado fora de producao em `/api/docs`.
- CORS configurado para `FRONTEND_URL` ou `http://localhost:5173`.
- ValidationPipe global com `whitelist`, `forbidNonWhitelisted` e `transform`.
- Entidades TypeORM para `Tenant`, `User`, `Patient` e `Triage`.
- Migrations manuais para criar tabelas, enums, indices e relacionamentos.
- Dockerfile multi-stage para desenvolvimento, build e producao.
- Docker Compose com API, PostgreSQL com pgvector e Redis.
- Pipeline de CI com GitHub Actions.

## Stack usada

| Area | Tecnologia |
| --- | --- |
| Runtime | Node.js 22 |
| Linguagem | TypeScript |
| Framework | NestJS 11 |
| Banco de dados | PostgreSQL 16 via `pgvector/pgvector:pg16` |
| ORM | TypeORM |
| Configuracao | `@nestjs/config` e `dotenv` |
| Documentacao da API | Swagger / OpenAPI |
| Testes | Jest e Supertest |
| Containerizacao | Docker e Docker Compose |
| CI | GitHub Actions |

Dependencias como `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`, `pg` e Redis no Compose ja estao presentes para etapas futuras, mas nem todas sao usadas por fluxos de API neste momento.

## Estrutura do projeto

```text
.
+-- .github/
|   +-- workflows/
|       +-- ci.yml
+-- src/
|   +-- app.module.ts
|   +-- main.ts
|   +-- database/
|   |   +-- base.entity.ts
|   |   +-- data-source.ts
|   |   +-- migrations/
|   |       +-- 1700000001-CreateTenants.ts
|   |       +-- 1700000002-CreateUsers.ts
|   |       +-- 1700000003-CreatePatients.ts
|   |       +-- 1700000004-CreateTriages.ts
|   +-- modules/
|       +-- tenant/
|       |   +-- tenant.entity.ts
|       +-- user/
|       |   +-- user.entity.ts
|       +-- patient/
|       |   +-- patient.entity.ts
|       +-- triage/
|           +-- triage.entity.ts
+-- test/
|   +-- app.e2e-spec.ts
|   +-- jest-e2e.json
+-- docker-compose.yml
+-- Dockerfile
+-- package.json
+-- tsconfig.json
+-- tsconfig.build.json
```

## Como a aplicacao inicializa

O ponto de entrada e `src/main.ts`.

1. Cria a aplicacao Nest a partir do `AppModule`.
2. Define o prefixo global como `api/v1`.
3. Registra um `ValidationPipe` global:
   - `whitelist: true`: remove campos nao declarados no DTO.
   - `forbidNonWhitelisted: true`: rejeita campos extras.
   - `transform: true`: converte tipos automaticamente.
4. Habilita CORS:
   - origem padrao: `http://localhost:5173`;
   - origem customizavel por `FRONTEND_URL`;
   - `credentials: true`.
5. Habilita Swagger quando `NODE_ENV` nao e `production`.
6. Sobe o servidor na porta definida em `PORT` ou `3000`.

Como ainda nao ha controllers registrados, a aplicacao sobe, conecta ao banco e expoe a documentacao Swagger, mas ainda nao possui endpoints de negocio.

## Modulo principal

O `AppModule` importa:

- `ConfigModule.forRoot`: carrega variaveis de ambiente a partir de `.env`.
- `TypeOrmModule.forRootAsync`: cria a conexao PostgreSQL usando `ConfigService`.

Configuracao atual do TypeORM:

| Opcao | Valor / comportamento |
| --- | --- |
| `type` | `postgres` |
| `host` | `DB_HOST` ou `localhost` |
| `port` | `DB_PORT` ou `5432` |
| `username` | `DB_USER` ou `healthai` |
| `password` | `DB_PASS` ou `healthai_pass` |
| `database` | `DB_NAME` ou `healthai_db` |
| `entities` | `modules/**/*.entity.{ts,js}` |
| `migrations` | `database/migrations/*.{ts,js}` |
| `migrationsTableName` | `migrations_history` |
| `migrationsRun` | `true` |
| `synchronize` | `false` |
| `logging` | ativo quando `NODE_ENV=development` |

Os modulos de dominio (`TenantModule`, `AuthModule`, `UserModule`, `PatientModule`, `TriageModule`) aparecem apenas comentados. Hoje existem as entidades, mas nao os modulos Nest completos com controllers e providers.

## Modelo base das entidades

Todas as entidades herdam de `BaseEntity`, definida em `src/database/base.entity.ts`.

| Campo | Coluna | Tipo | Descricao |
| --- | --- | --- | --- |
| `id` | `id` | UUID | chave primaria gerada automaticamente |
| `createdAt` | `created_at` | timestamp | data de criacao |
| `updatedAt` | `updated_at` | timestamp | data da ultima atualizacao |
| `deletedAt` | `deleted_at` | timestamp nullable | suporte a soft delete |

## Entidades implementadas

### Tenant

Arquivo: `src/modules/tenant/tenant.entity.ts`

Representa uma clinica, organizacao ou cliente dentro da arquitetura multi-tenant.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `name` | string | ate 120 caracteres |
| `slug` | string | unico, ate 60 caracteres |
| `email` | string | unico, ate 120 caracteres |
| `status` | enum | `active`, `inactive`, `suspended`; padrao `active` |
| `plan` | enum | `free`, `basic`, `pro`; padrao `free` |
| `maxPatients` | number | coluna `max_patients`, padrao `100` |

### User

Arquivo: `src/modules/user/user.entity.ts`

Representa usuarios vinculados a um tenant.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `tenantId` | UUID | FK para `tenants.id` |
| `tenant` | Tenant | `ManyToOne`, `ON DELETE CASCADE` |
| `name` | string | ate 120 caracteres |
| `email` | string | ate 120 caracteres |
| `passwordHash` | string | coluna `password_hash` |
| `role` | enum | `tenant_admin`, `doctor`, `patient`; padrao `patient` |
| `isActive` | boolean | coluna `is_active`, padrao `true` |
| `lastLoginAt` | Date/null | coluna `last_login_at` |

Restricao importante: `tenantId + email` e unico. Isso permite que tenants diferentes tenham usuarios com o mesmo email, mas impede duplicidade dentro do mesmo tenant.

### Patient

Arquivo: `src/modules/patient/patient.entity.ts`

Representa o cadastro clinico basico de um paciente dentro de um tenant.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `tenantId` | UUID | FK para `tenants.id` |
| `tenant` | Tenant | `ManyToOne`, `ON DELETE CASCADE` |
| `userId` | UUID/null | FK opcional para `users.id` |
| `user` | User/null | `ManyToOne`, `ON DELETE SET NULL` |
| `name` | string | ate 120 caracteres |
| `dateOfBirth` | string/date | coluna `date_of_birth`, tipo `date` |
| `sex` | enum | `male`, `female`, `other` |
| `phone` | string/null | ate 20 caracteres |
| `allergies` | text/null | alergias conhecidas |
| `chronicConditions` | text/null | coluna `chronic_conditions` |
| `currentMedications` | text/null | coluna `current_medications` |

### Triage

Arquivo: `src/modules/triage/triage.entity.ts`

Representa uma triagem de sintomas enviada por um paciente. O modelo ja possui campos preparados para armazenar uma resposta de IA, mas a chamada real para IA ainda nao esta implementada.

| Campo | Tipo | Regras |
| --- | --- | --- |
| `tenantId` | UUID | FK para `tenants.id` |
| `tenant` | Tenant | `ManyToOne`, `ON DELETE CASCADE` |
| `patientId` | UUID | FK para `patients.id` |
| `patient` | Patient | `ManyToOne`, `ON DELETE CASCADE` |
| `symptomsInput` | text | sintomas informados pelo paciente |
| `aiResponse` | jsonb/null | resposta bruta da IA |
| `urgency` | enum/null | `low`, `medium`, `high`, `emergency` |
| `suggestedSpecialty` | string/null | especialidade sugerida |
| `aiGuidance` | text/null | orientacao gerada |
| `status` | enum | `pending`, `completed`, `reviewed`; padrao `pending` |

Ha um campo `embedding` comentado para uso futuro com pgvector/RAG.

## Migrations

As migrations ficam em `src/database/migrations`.

| Migration | O que cria |
| --- | --- |
| `1700000001-CreateTenants.ts` | enums de tenant, tabela `tenants`, indices por slug e status |
| `1700000002-CreateUsers.ts` | enum de papel de usuario, tabela `users`, FK para tenant, indice unico por tenant/email |
| `1700000003-CreatePatients.ts` | enum de sexo biologico, tabela `patients`, FKs para tenant e usuario |
| `1700000004-CreateTriages.ts` | enums de urgencia/status, tabela `triages`, FKs para tenant e paciente |

A tabela usada para registrar migrations executadas e `migrations_history`.

### Observacao sobre UUID

As migrations usam `gen_random_uuid()` como valor padrao para IDs. Em PostgreSQL, essa funcao normalmente depende da extensao `pgcrypto`. A migration atual nao executa `CREATE EXTENSION IF NOT EXISTS pgcrypto;`, entao a primeira migration pode falhar se a extensao nao estiver habilitada no banco.

## Banco de dados e multi-tenancy

O isolamento multi-tenant esta modelado por coluna `tenant_id` nas tabelas principais:

- `users.tenant_id`;
- `patients.tenant_id`;
- `triages.tenant_id`.

Relacionamentos principais:

```text
tenants  1---N users
tenants  1---N patients
tenants  1---N triages
users    1---N patients  (opcional do lado de patient)
patients 1---N triages
```

Hoje essa regra esta refletida no schema e nas entidades. A aplicacao ainda nao possui services/controllers aplicando filtros por tenant nas consultas.

## Variaveis de ambiente

| Variavel | Padrao / exemplo | Uso atual |
| --- | --- | --- |
| `NODE_ENV` | `development` | controla logs e Swagger |
| `PORT` | `3000` | porta da API |
| `DB_HOST` | `localhost` | host do PostgreSQL |
| `DB_PORT` | `5432` | porta do PostgreSQL |
| `DB_USER` | `healthai` | usuario do PostgreSQL |
| `DB_PASS` | `healthai_pass` | senha do PostgreSQL |
| `DB_NAME` | `healthai_db` | nome do banco |
| `JWT_SECRET` | exemplo local | ainda nao usado |
| `JWT_EXPIRES_IN` | `15m` | ainda nao usado |
| `JWT_REFRESH_SECRET` | exemplo local | ainda nao usado |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | ainda nao usado |
| `OPENAI_API_KEY` | `sk-...` | ainda nao usado |
| `REDIS_HOST` | `localhost` | Redis sobe no Compose, mas ainda nao e usado pela app |
| `REDIS_PORT` | `6379` | Redis sobe no Compose, mas ainda nao e usado pela app |

No Docker Compose, o servico `api` sobrescreve `DB_HOST` para `postgres` e `REDIS_HOST` para `redis`.

## Como rodar localmente

### 1. Instalar dependencias

```bash
npm install
```

### 2. Criar o arquivo `.env`

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### 3. Subir banco e Redis

```bash
docker compose up -d postgres redis
```

### 4. Rodar migrations

As migrations rodam automaticamente quando a aplicacao sobe, porque `migrationsRun` esta como `true`.

Tambem e possivel rodar manualmente:

```bash
npm run migration:run
```

### 5. Iniciar a API em desenvolvimento

```bash
npm run start:dev
```

URLs esperadas:

| Recurso | URL |
| --- | --- |
| API | `http://localhost:3000/api/v1` |
| Swagger | `http://localhost:3000/api/docs` |

Como ainda nao ha controllers, acessar a raiz da API nao retorna recursos de negocio.

## Rodando com Docker Compose

Para subir a stack completa:

```bash
docker compose up --build
```

Servicos definidos:

| Servico | Container | Porta | Descricao |
| --- | --- | --- | --- |
| `api` | `healthai_api` | `3000:3000` | aplicacao NestJS |
| `postgres` | `healthai_postgres` | `5432:5432` | PostgreSQL com pgvector |
| `redis` | `healthai_redis` | `6379:6379` | Redis 7 Alpine |

O servico `api` depende dos healthchecks de `postgres` e `redis`.

## Scripts disponiveis

| Script | Descricao |
| --- | --- |
| `npm run build` | compila o projeto Nest para `dist` |
| `npm run format` | formata arquivos TypeScript em `src` e `test` |
| `npm run start` | inicia a aplicacao com Nest |
| `npm run start:dev` | inicia em modo watch |
| `npm run start:debug` | inicia em modo debug/watch |
| `npm run start:prod` | executa `node dist/main` |
| `npm run lint` | executa ESLint com `--fix` |
| `npm run test` | executa testes unitarios configurados para `src` |
| `npm run test:watch` | executa testes em watch mode |
| `npm run test:cov` | executa testes com coverage |
| `npm run test:debug` | executa Jest com inspector |
| `npm run test:e2e` | executa testes e2e em `test` |
| `npm run migration:run` | aplica migrations via CLI do TypeORM |
| `npm run migration:revert` | reverte a ultima migration |
| `npm run migration:generate` | gera migration a partir das entidades |
| `npm run migration:show` | lista status das migrations |

## Testes

Existe um teste e2e padrao em `test/app.e2e-spec.ts`, criado pelo template do Nest. Ele espera que `GET /` retorne `Hello World!`.

No estado atual, esse endpoint nao existe, porque nao ha `AppController` implementado. Portanto, esse teste precisa ser atualizado ou removido quando os primeiros controllers reais forem criados.

## CI/CD

O workflow `.github/workflows/ci.yml` roda em:

- push para `main` e `develop`;
- pull request para `main`.

Job `test`:

- sobe PostgreSQL com imagem `pgvector/pgvector:pg16`;
- instala dependencias com `npm ci`;
- roda typecheck com `npx tsc --noEmit`;
- roda lint;
- roda testes;
- roda build.

Job `docker`:

- depende do job `test`;
- roda somente na branch `main`;
- faz build da imagem Docker usando o target `production`.

Atencao: o workflow usa `cache-dependency-path: backend/package-lock.json`, mas neste projeto o `package-lock.json` esta na raiz. Se este repositorio nao estiver dentro de uma pasta `backend`, esse caminho de cache deve ser ajustado.

## O que ainda nao esta implementado

- controllers HTTP;
- services de negocio;
- DTOs;
- modulos Nest de dominio;
- autenticacao com login, JWT e refresh token;
- guards e decorators de tenant/usuario;
- CRUD de tenants, usuarios, pacientes e triagens;
- chamada para OpenAI;
- streaming de resposta;
- RAG com pgvector;
- uso de Redis/BullMQ;
- notificacoes;
- seeds;
- testes alinhados ao comportamento atual da API.

## Proximos passos sugeridos

1. Corrigir ou remover o teste e2e padrao.
2. Confirmar a versao desejada do TypeORM no `package.json`.
3. Adicionar `CREATE EXTENSION IF NOT EXISTS pgcrypto;` antes do uso de `gen_random_uuid()`, se necessario.
4. Criar modulos Nest reais para `tenant`, `user`, `patient` e `triage`.
5. Implementar DTOs, controllers e services por recurso.
6. Implementar autenticacao e escopo por tenant.
7. Adicionar testes para os fluxos realmente existentes.
