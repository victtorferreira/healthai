import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Tenant } from '../tenant/tenant.entity';
import { Patient } from '../patient/patient.entity';

export enum TriageUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EMERGENCY = 'emergency',
}

export enum TriageStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed',
}

@Entity('triages')
@Index(['tenantId', 'createdAt'])
@Index(['patientId'])
export class Triage extends BaseEntity {
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  // O que o paciente descreveu
  @Column({ name: 'symptoms_input', type: 'text' })
  symptomsInput: string;

  // Resposta bruta da IA (JSON)
  @Column({ name: 'ai_response', type: 'jsonb', nullable: true })
  aiResponse: Record<string, unknown> | null;

  // Campos extraídos da resposta da IA
  @Column({
    type: 'enum',
    enum: TriageUrgency,
    nullable: true,
  })
  urgency: TriageUrgency | null;

  @Column({
    name: 'suggested_specialty',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  suggestedSpecialty: string | null;

  @Column({ name: 'ai_guidance', type: 'text', nullable: true })
  aiGuidance: string | null;

  @Column({
    type: 'enum',
    enum: TriageStatus,
    default: TriageStatus.PENDING,
  })
  status: TriageStatus;

  // Embedding para RAG (pgvector) — adicionado na semana 4
  // @Column({ type: 'vector', dimensions: 1536, nullable: true })
  // embedding: number[] | null;
}
