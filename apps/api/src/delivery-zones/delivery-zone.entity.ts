import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('delivery_zones')
export class DeliveryZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // District name, e.g. "ঢাকা". Use "DEFAULT" as a special row for fallback.
  @Column({ length: 100, unique: true })
  district: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  delivery_charge: number;

  // Order total at or above this amount gets free delivery. 0 = no free delivery offer.
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  free_delivery_threshold: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}