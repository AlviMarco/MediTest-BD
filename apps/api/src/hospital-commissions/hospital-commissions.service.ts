import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HospitalCommission } from './hospital-commission.entity';
import { SetCommissionDto } from './hospital-commission.dto';

@Injectable()
export class HospitalCommissionsService {
  constructor(
    @InjectRepository(HospitalCommission)
    private repo: Repository<HospitalCommission>,
  ) {}

  async findAll() {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  async findByHospital(hospital_id: string) {
    return this.repo.findOne({ where: { hospital_id } });
  }

  async set(data: SetCommissionDto) {
    const existing = await this.findByHospital(data.hospital_id);
    if (existing) {
      existing.commission_percent = data.commission_percent;
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create(data));
  }
}