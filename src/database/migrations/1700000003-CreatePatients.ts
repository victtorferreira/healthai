import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePatients1700000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE biological_sex_enum AS ENUM ('male', 'female', 'other');

      CREATE TABLE patients (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
        name                VARCHAR(120) NOT NULL,
        date_of_birth       DATE NOT NULL,
        sex                 biological_sex_enum NOT NULL,
        phone               VARCHAR(20),
        allergies           TEXT,
        chronic_conditions  TEXT,
        current_medications TEXT,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at          TIMESTAMPTZ
      );

      CREATE INDEX idx_patients_tenant ON patients(tenant_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_patients_user   ON patients(user_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS patients;
      DROP TYPE IF EXISTS biological_sex_enum;
    `);
  }
}
