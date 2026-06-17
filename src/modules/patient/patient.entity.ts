import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Tenant } from '../tenant/tenant.entity';
import { User } from '../user/entities/user.entity';

export enum BiologicalSex {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('patients')
@Index(['tenantId'])
export class Patient extends BaseEntity {
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: true,
  })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ length: 120 })
  name: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: string;

  @Column({
    type: 'enum',
    enum: BiologicalSex,
  })
  sex: BiologicalSex;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  allergies: string | null;

  @Column({ name: 'chronic_conditions', type: 'text', nullable: true })
  chronicConditions: string | null;

  @Column({ name: 'current_medications', type: 'text', nullable: true })
  currentMedications: string | null;
}
