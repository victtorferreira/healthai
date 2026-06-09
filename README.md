# HealthAI Backend

Backend desenvolvido com NestJS para uma plataforma multi-tenant de triagem e acompanhamento de saúde.

## Stack

* NestJS 11
* TypeScript
* PostgreSQL
* TypeORM
* Docker
* Redis
* Swagger

## Funcionalidades Implementadas

* Estrutura base da API em NestJS
* Configuração por variáveis de ambiente
* Integração com PostgreSQL via TypeORM
* Migrations automáticas
* Documentação Swagger
* Docker e Docker Compose
* Multi-tenancy através de Tenant
* Entidades:

  * Tenant
  * User
  * Patient
  * Triage

## Executar o projeto

### Instalar dependências

```bash
npm install
```

### Configurar ambiente

```bash
cp .env.example .env
```

### Subir banco de dados

```bash
docker compose up -d postgres redis
```

### Executar aplicação

```bash
npm run start:dev
```

### Swagger

```text
http://localhost:3000/api/docs
```

## Estrutura

```text
src/
├── database/
│   ├── migrations/
│   └── data-source.ts
├── modules/
│   ├── tenant/
│   ├── user/
│   ├── patient/
│   └── triage/
└── main.ts
```

## Scripts

```bash
npm run start:dev
npm run build
npm run test
npm run lint
npm run migration:run
```

## Status do Projeto

Atualmente o projeto possui a estrutura inicial, banco de dados, entidades e migrations implementadas.

Próximas etapas:

* Autenticação JWT
* CRUDs
* Controllers e Services
* Integração com IA
* Multi-tenancy completo
* Testes automatizados
