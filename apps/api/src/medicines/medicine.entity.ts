import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('medicines')
export class Medicine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  brand_name: string;

  @Column({ length: 150 })
  generic_name: string;

  @Column({ length: 150, nullable: true })
  manufacturer: string;

  @Column({ length: 100, nullable: true })
  dosage_form: string;

  @Column({ length: 100, nullable: true })
  strength: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount_percent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discounted_price: number;

  @Column({ default: true })
  is_available: boolean;

  @Column({ default: false })
  requires_prescription: boolean;

  @Column({ nullable: true })
  added_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}