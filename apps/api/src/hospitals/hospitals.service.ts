import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hospital } from './hospital.entity';
import { CreateHospitalDto, UpdateHospitalDto } from './hospital.dto';

@Injectable()
export class HospitalsService {
  constructor(
    @InjectRepository(Hospital)
    private hospitalsRepository: Repository<Hospital>,
  ) {}

  // সব hospital দেখানো
  async findAll(query: {
    city?: string;
    area?: string;
    emergency?: boolean;
    icu?: boolean;
    type?: string;
  }) {
    const where: any = { is_active: true };

    if (query.city) where.city = query.city;
    if (query.area) where.area = query.area;
    if (query.emergency) where.emergency_available = true;
    if (query.icu) where.icu_available = true;
    if (query.type) where.type = query.type;

    return this.hospitalsRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  // একটা hospital দেখানো
  async findOne(id: string) {
    const hospital = await this.hospitalsRepository.findOne({
      where: { id },
    });

    if (!hospital) {
      throw new NotFoundException('Hospital পাওয়া যায়নি');
    }

    return hospital;
  }

  // নতুন hospital বানানো
  async create(data: CreateHospitalDto, userId: string) {
    const hospital = this.hospitalsRepository.create({
      ...data,
      added_by: userId,
    });

    return this.hospitalsRepository.save(hospital);
  }

  // hospital update করা
  async update(id: string, data: UpdateHospitalDto) {
    const hospital = await this.findOne(id);

    Object.assign(hospital, data);

    return this.hospitalsRepository.save(hospital);
  }

  // hospital delete করা
  async remove(id: string) {
    const hospital = await this.findOne(id);

    hospital.is_active = false;

    await this.hospitalsRepository.save(hospital);

    return { message: 'Hospital সফলভাবে মুছে ফেলা হয়েছে' };
  }

  // নাম দিয়ে hospital search করা
  async search(keyword: string) {
    return this.hospitalsRepository
      .createQueryBuilder('hospital')
      .where('hospital.is_active = :active', { active: true })
      .andWhere(
        '(hospital.name ILIKE :keyword OR hospital.area ILIKE :keyword OR hospital.city ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      )
      .orderBy('hospital.name', 'ASC')
      .getMany();
  }

  // nearby hospital খোঁজা
  async findNearby(lat: number, lng: number, radiusKm: number = 5) {
    return this.hospitalsRepository
      .createQueryBuilder('hospital')
      .where('hospital.is_active = :active', { active: true })
      .andWhere('hospital.latitude IS NOT NULL')
      .andWhere('hospital.longitude IS NOT NULL')
      .andWhere(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(hospital.latitude)) * cos(radians(hospital.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(hospital.latitude)))) < :radius`,
        { lat, lng, radius: radiusKm },
      )
      .orderBy(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(hospital.latitude)) * cos(radians(hospital.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(hospital.latitude))))`,
        'ASC',
      )
      .getMany();
  }
}