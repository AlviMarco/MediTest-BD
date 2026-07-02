import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('blood_donors')
export class BloodDonor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 5 })
  blood_group: string;

  @Column({ length: 100 })
  division: string;

  @Column({ length: 100 })
  district: string;

  @Column({ length: 100 })
  upazilla: string;

  @Column({ length: 100, nullable: true })
  union_name: string;

  @Column({ default: true })
  is_available: boolean;

  @Column({ nullable: true })
  last_donated_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}