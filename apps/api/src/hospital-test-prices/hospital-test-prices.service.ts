import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HospitalTestPrice } from './hospital-test-price.entity';
import { CreateHospitalTestPriceDto, UpdateHospitalTestPriceDto } from './hospital-test-price.dto';

@Injectable()
export class HospitalTestPricesService {
  constructor(
    @InjectRepository(HospitalTestPrice)
    private pricesRepository: Repository<HospitalTestPrice>,
  ) {}

  // একটা hospital এর সব test price দেখানো
  async findByHospital(hospitalId: string) {
    return this.pricesRepository
      .createQueryBuilder('price')
      .leftJoinAndSelect('price.test', 'test')
      .where('price.hospital_id = :hospitalId', { hospitalId })
      .orderBy('price.created_at', 'ASC')
      .getMany();
  }

  // একটা test কোন কোন hospital এ আছে দেখানো
  async findByTest(testId: string) {
    return this.pricesRepository
      .createQueryBuilder('price')
      .leftJoinAndSelect('price.hospital', 'hospital')
      .where('price.test_id = :testId', { testId })
      .andWhere('price.is_available = :available', { available: true })
      .orderBy('price.price', 'ASC')
      .getMany();
  }

  // test নাম দিয়ে search
  async searchByTestName(testName: string) {
    return this.pricesRepository
      .createQueryBuilder('price')
      .leftJoinAndSelect('price.hospital', 'hospital')
      .leftJoinAndSelect('price.test', 'test')
      .where('price.is_available = :available', { available: true })
      .andWhere('hospital.is_active = :active', { active: true })
      .andWhere('test.name ILIKE :name', { name: `%${testName}%` })
      .orderBy('price.price', 'ASC')
      .getMany();
  }

  // নতুন price যোগ করা
  async create(data: CreateHospitalTestPriceDto, userId: string) {
    const existing = await this.pricesRepository.findOne({
      where: {
        hospital_id: data.hospital_id,
        test_id: data.test_id,
      },
    });

    if (existing) {
      throw new BadRequestException('এই hospital এ এই test এর price আগেই আছে');
    }

    const price = this.pricesRepository.create({
      ...data,
      updated_by: userId,
    });

    return this.pricesRepository.save(price);
  }

  // price update করা
  async update(id: string, data: UpdateHospitalTestPriceDto, userId: string) {
    const price = await this.pricesRepository.findOne({ where: { id } });

    if (!price) {
      throw new NotFoundException('Price পাওয়া যায়নি');
    }

    Object.assign(price, { ...data, updated_by: userId });

    return this.pricesRepository.save(price);
  }

  // price delete করা
  async remove(id: string) {
    const price = await this.pricesRepository.findOne({ where: { id } });

    if (!price) {
      throw new NotFoundException('Price পাওয়া যায়নি');
    }

    await this.pricesRepository.remove(price);

    return { message: 'Price সফলভাবে মুছে ফেলা হয়েছে' };
  }
}