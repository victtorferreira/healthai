import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1700000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM ('tenant_admin', 'doctor', 'patient');

      CREATE TABLE users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name          VARCHAR(120) NOT NULL,
        email         VARCHAR(120) NOT NULL,
        password_hash TEXT NOT NULL,
        role          user_role_enum NOT NULL DEFAULT 'patient',
        is_active     BOOLEAN NOT NULL DEFAULT TRUE,
        last_login_at TIMESTAMPTZ,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at    TIMESTAMPTZ,
        UNIQUE (tenant_id, email)
      );

      CREATE INDEX idx_users_tenant    ON users(tenant_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_users_email     ON users(email);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS users;
      DROP TYPE IF EXISTS user_role_enum;
    `);
  }
}
