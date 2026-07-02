import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';
import { CreateDoctorDto, UpdateDoctorDto } from './doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
  ) {}

  // সব doctor দেখানো
  async findAll(query: { specialty?: string }) {
    const where: any = { is_active: true };
    if (query.specialty) where.specialty = query.specialty;

    return this.doctorsRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  // একটা doctor দেখানো
  async findOne(id: string) {
    const doctor = await this.doctorsRepository.findOne({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor পাওয়া যায়নি');
    }

    return doctor;
  }

  // নতুন doctor বানানো
  async create(data: CreateDoctorDto, userId: string) {
    const doctor = this.doctorsRepository.create({
      ...data,
      added_by: userId,
    });

    return this.doctorsRepository.save(doctor);
  }

  // doctor update করা
  async update(id: string, data: UpdateDoctorDto) {
    const doctor = await this.findOne(id);
    Object.assign(doctor, data);
    return this.doctorsRepository.save(doctor);
  }

  // doctor delete করা
  async remove(id: string) {
    const doctor = await this.findOne(id);
    doctor.is_active = false;
    await this.doctorsRepository.save(doctor);
    return { message: 'Doctor সফলভাবে মুছে ফেলা হয়েছে' };
  }

  // নাম বা specialty দিয়ে search
  async search(keyword: string) {
    return this.doctorsRepository
      .createQueryBuilder('doctor')
      .where('doctor.is_active = :active', { active: true })
      .andWhere(
        '(doctor.name ILIKE :keyword OR doctor.specialty ILIKE :keyword OR doctor.qualification ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      )
      .orderBy('doctor.name', 'ASC')
      .getMany();
  }

  // সব specialty দেখানো
  async getSpecialties() {
    const result = await this.doctorsRepository
      .createQueryBuilder('doctor')
      .select('DISTINCT doctor.specialty', 'specialty')
      .where('doctor.is_active = :active', { active: true })
      .getRawMany();

    return result.map((r) => r.specialty);
  }
}