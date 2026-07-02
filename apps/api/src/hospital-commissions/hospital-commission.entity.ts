import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('hospital_commissions')
export class HospitalCommission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hospital_id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commission_percent: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}