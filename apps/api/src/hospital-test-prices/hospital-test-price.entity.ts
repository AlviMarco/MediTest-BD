import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Hospital } from '../hospitals/hospital.entity';
import { DiagnosticTest } from '../diagnostic-tests/diagnostic-test.entity';

@Entity('hospital_test_prices')
@Unique(['hospital_id', 'test_id'])
export class HospitalTestPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hospital_id: string;

  @Column()
  test_id: string;

  @ManyToOne(() => Hospital)
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;

  @ManyToOne(() => DiagnosticTest)
  @JoinColumn({ name: 'test_id' })
  test: DiagnosticTest;

  @Column({ default: 0 })
  price: number;

  @Column({ length: 100, nullable: true })
  report_delivery_time: string;

  @Column({ default: true })
  is_available: boolean;

  @Column({ nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: 0 })
discount_percent: number;
// discount percentage, যেমন: 10 মানে ১০% ছাড়

@Column({ default: 0 })
discounted_price: number;
// discount এর পরে দাম

  @UpdateDateColumn()
  updated_at: Date;
}