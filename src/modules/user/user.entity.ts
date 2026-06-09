import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Tenant } from '../tenant/tenant.entity';

export enum UserRole {
  TENANT_ADMIN = 'tenant_admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

@Entity('users')
@Index(['tenantId', 'email'], { unique: true })
export class User extends BaseEntity {
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 120 })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    name: 'last_login_at',
    type: 'timestamp',
    nullable: true,
  })
  lastLoginAt: Date | null;
}
