import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTriages1700000004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE triage_urgency_enum AS ENUM ('low', 'medium', 'high', 'emergency');
      CREATE TYPE triage_status_enum  AS ENUM ('pending', 'completed', 'reviewed');

      CREATE TABLE triages (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        symptoms_input      TEXT NOT NULL,
        ai_response         JSONB,
        urgency             triage_urgency_enum,
        suggested_specialty VARCHAR(120),
        ai_guidance         TEXT,
        status              triage_status_enum NOT NULL DEFAULT 'pending',
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at          TIMESTAMPTZ
      );

      CREATE INDEX idx_triages_tenant     ON triages(tenant_id, created_at DESC) WHERE deleted_at IS NULL;
      CREATE INDEX idx_triages_patient    ON triages(patient_id);
      CREATE INDEX idx_triages_urgency    ON triages(urgency) WHERE deleted_at IS NULL;

      -- Comentado: habilitado na semana 4 (RAG com pgvector)
      -- CREATE EXTENSION IF NOT EXISTS vector;
      -- ALTER TABLE triages ADD COLUMN embedding vector(1536);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS triages;
      DROP TYPE IF EXISTS triage_status_enum;
      DROP TYPE IF EXISTS triage_urgency_enum;
    `);
  }
}
