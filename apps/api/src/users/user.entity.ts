import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150, unique: true, nullable: true })
  email: string;

  @Column({ length: 20, unique: true })
  phone: string;

  @Column({ nullable: true })
  password_hash: string;

  @Column({ default: 4 })
  role_id: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  last_login: Date;

  @Column({ length: 50, nullable: true })
  blood_group: string;

  @Column({ length: 100, nullable: true })
  division: string;

  @Column({ length: 100, nullable: true })
  district: string;

  @Column({ length: 100, nullable: true })
  upazilla: string;

  @Column({ length: 100, nullable: true })
  union_name: string;

  @Column({ length: 20, unique: true, nullable: true })
  referral_code: string;

  @Column({ type: 'uuid', nullable: true })
  referred_by: string;

  @Column({ default: 0 })
  health_coins: number;

  @CreateDateColumn()
  created_at: Date;
}