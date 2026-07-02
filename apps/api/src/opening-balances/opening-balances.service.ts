import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpeningBalance } from './opening-balances.entity';
import { CreateOpeningBalanceDto } from './opening-balances.dto';

@Injectable()
export class OpeningBalancesService {
  constructor(
    @InjectRepository(OpeningBalance)
    private repo: Repository<OpeningBalance>,
  ) {}

  async upsert(data: CreateOpeningBalanceDto) {
    const existing = await this.repo.findOne({
      where: { hospital_id: data.hospital_id, period_start: data.period_start },
    });
    if (existing) {
      Object.assign(existing, data);
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create(data));
  }

  async findByHospitalAndDate(hospital_id: string, period_start: string) {
    return this.repo.findOne({ where: { hospital_id, period_start } });
  }

  async findAll() {
    return this.repo.find({ order: { period_start: 'DESC' } });
  }
}