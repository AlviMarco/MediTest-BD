import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  // percentage | fixed_amount | free_delivery
  @Column({ length: 20 })
  type: string;

  // percentage: 0-100, fixed_amount: টাকা, free_delivery: 0 (unused)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  value: number;

  // percentage discount-এ সর্বোচ্চ কত টাকা ছাড় দেওয়া হবে (cap). 0 = no cap.
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  max_discount: number;

  // কুপন apply করতে minimum কত টাকার order লাগবে
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  min_order_amount: number;

  // মোট কতবার এই কুপন ব্যবহার করা যাবে (সব user মিলিয়ে). 0 = unlimited.
  @Column({ default: 0 })
  usage_limit: number;

  // একজন user কতবার ব্যবহার করতে পারবে. 0 = unlimited.
  @Column({ default: 1 })
  per_user_limit: number;

  // এখন পর্যন্ত কতবার ব্যবহার হয়েছে
  @Column({ default: 0 })
  used_count: number;

  @Column({ nullable: true })
  expires_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}