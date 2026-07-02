import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicine } from './medicine.entity';
import { CreateMedicineDto, UpdateMedicineDto } from './medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private medicinesRepository: Repository<Medicine>,
  ) {}

  // সব medicine দেখানো
  async findAll(query: { dosage_form?: string }) {
    const where: any = { is_available: true };
    if (query.dosage_form) where.dosage_form = query.dosage_form;

    return this.medicinesRepository.find({
      where,
      order: { brand_name: 'ASC' },
    });
  }

  // একটা medicine দেখানো
  async findOne(id: string) {
    const medicine = await this.medicinesRepository.findOne({
      where: { id },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine পাওয়া যায়নি');
    }

    return medicine;
  }

  // নতুন medicine বানানো
  async create(data: CreateMedicineDto, userId: string) {
    const medicine = this.medicinesRepository.create({
      ...data,
      added_by: userId,
    });

    return this.medicinesRepository.save(medicine);
  }

  // medicine update করা
  async update(id: string, data: UpdateMedicineDto) {
    const medicine = await this.findOne(id);
    Object.assign(medicine, data);
    return this.medicinesRepository.save(medicine);
  }

  // medicine delete করা
  async remove(id: string) {
    const medicine = await this.findOne(id);
    medicine.is_available = false;
    await this.medicinesRepository.save(medicine);
    return { message: 'Medicine সফলভাবে মুছে ফেলা হয়েছে' };
  }

  // brand বা generic নাম দিয়ে search
  async search(keyword: string) {
    return this.medicinesRepository
      .createQueryBuilder('medicine')
      .where('medicine.is_available = :available', { available: true })
      .andWhere(
        '(medicine.brand_name ILIKE :keyword OR medicine.generic_name ILIKE :keyword OR medicine.manufacturer ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      )
      .orderBy('medicine.brand_name', 'ASC')
      .getMany();
  }
}