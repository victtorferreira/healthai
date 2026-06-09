import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTenants1700000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE tenant_status_enum AS ENUM ('active', 'inactive', 'suspended');
      CREATE TYPE tenant_plan_enum   AS ENUM ('free', 'basic', 'pro');

      CREATE TABLE tenants (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name         VARCHAR(120) NOT NULL,
        slug         VARCHAR(60)  NOT NULL UNIQUE,
        email        VARCHAR(120) NOT NULL UNIQUE,
        status       tenant_status_enum NOT NULL DEFAULT 'active',
        plan         tenant_plan_enum   NOT NULL DEFAULT 'free',
        max_patients INT NOT NULL DEFAULT 100,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at   TIMESTAMPTZ
      );

      CREATE INDEX idx_tenants_slug   ON tenants(slug);
      CREATE INDEX idx_tenants_status ON tenants(status) WHERE deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS tenants;
      DROP TYPE IF EXISTS tenant_plan_enum;
      DROP TYPE IF EXISTS tenant_status_enum;
    `);
  }
}
