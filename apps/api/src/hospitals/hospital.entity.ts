import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('hospitals')
export class Hospital {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 50, default: 'hospital' })
  type: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ length: 100, nullable: true })
  area: string;

  @Column({ length: 100, default: 'Dhaka' })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ default: false })
  emergency_available: boolean;

  @Column({ default: false })
  icu_available: boolean;

  @Column({ default: false })
  ambulance_available: boolean;

  @Column({ type: 'time', nullable: true })
  opening_time: string;

  @Column({ type: 'time', nullable: true })
  closing_time: string;

  @Column({ default: false })
  is_open_24h: boolean;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  added_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}