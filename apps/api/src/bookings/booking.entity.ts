import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  hospital_id: string;

  @Column({ length: 20 })
  booking_type: string;
  // 'doctor' অথবা 'test'

  @Column({ nullable: true })
  doctor_id: string;

  @Column({ nullable: true })
  test_id: string;

  @Column({ type: 'date' })
  booking_date: string;

  @Column({ type: 'time', nullable: true })
  booking_time: string;

  @Column({ length: 20, default: 'pending' })
  status: string;
  // pending, confirmed, cancelled, completed

  @Column({ nullable: true })
  confirmed_by: string;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  special_requirements: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}