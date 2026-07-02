import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { MedicineOrderItem } from './medicine-order-item.entity';

@Entity('medicine_orders')
export class MedicineOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ length: 30, unique: true, nullable: true })
  order_number: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // pending | confirmed | delivered | cancelled

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  delivery_charge: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ length: 50, nullable: true })
  coupon_code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'text' })
  delivery_address: string;

  @Column({ type: 'varchar', length: 20 })
  delivery_phone: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  confirmed_by: string;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string;

  @OneToMany(() => MedicineOrderItem, (item) => item.order, {
    cascade: true,
  })
  items: MedicineOrderItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}