import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum TenantPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
}

@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column({ length: 120 })
  name: string;

  @Column({ unique: true, length: 60 })
  slug: string;

  @Column({ unique: true, length: 120 })
  email: string;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.ACTIVE,
  })
  status: TenantStatus;

  @Column({
    type: 'enum',
    enum: TenantPlan,
    default: TenantPlan.FREE,
  })
  plan: TenantPlan;

  @Column({ name: 'max_patients', default: 100 })
  maxPatients: number;
}
