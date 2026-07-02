import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('opening_balances')
export class OpeningBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hospital_id: string;

  @Column({ type: 'date' })
  period_start: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  receivable: number; // hospital আমাদের কাছে পাবে (আমরা দেব)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  payable: number; // আমরা hospital এর কাছে পাব

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}