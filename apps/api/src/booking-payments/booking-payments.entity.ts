import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('booking_payments')
export class BookingPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  booking_id: string;

  @Column()
  hospital_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  test_price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount_percent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discounted_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  advance_collected: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commission_percent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commission_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  net_profit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  hospital_payable: number;

  @Column({ type: 'date' })
  payment_date: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}