import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticTest } from './diagnostic-test.entity';
import { CreateDiagnosticTestDto, UpdateDiagnosticTestDto } from './diagnostic-test.dto';

@Injectable()
export class DiagnosticTestsService {
  constructor(
    @InjectRepository(DiagnosticTest)
    private testsRepository: Repository<DiagnosticTest>,
  ) {}

  // সব test দেখানো (is_active filter নেই — admin panel এ সব দেখাবে)
  async findAll(query: { category?: string }) {
    const where: any = {};
    if (query.category) where.category = query.category;

    return this.testsRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  // একটা test দেখানো
  async findOne(id: string) {
    const test = await this.testsRepository.findOne({
      where: { id },
    });

    if (!test) {
      throw new NotFoundException('Test পাওয়া যায়নি');
    }

    return test;
  }

  // নতুন test বানানো
  async create(data: CreateDiagnosticTestDto, userId: string) {
    const test = this.testsRepository.create({
      ...data,
      added_by: userId,
    });

    return this.testsRepository.save(test);
  }

  // test update করা
  async update(id: string, data: UpdateDiagnosticTestDto) {
    const test = await this.findOne(id);
    Object.assign(test, data);
    return this.testsRepository.save(test);
  }

  // test delete করা (hard delete — DB থেকে সরে যাবে)
  async remove(id: string) {
    const test = await this.findOne(id);
    await this.testsRepository.remove(test);
    return { message: 'Test সফলভাবে মুছে ফেলা হয়েছে' };
  }

  // নাম দিয়ে search করা (public — শুধু active)
  async search(keyword: string) {
    return this.testsRepository
      .createQueryBuilder('test')
      .where('test.is_active = :active', { active: true })
      .andWhere(
        '(test.name ILIKE :keyword OR test.category ILIKE :keyword OR test.description ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      )
      .orderBy('test.name', 'ASC')
      .getMany();
  }

  // সব category দেখানো
  async getCategories() {
    const result = await this.testsRepository
      .createQueryBuilder('test')
      .select('DISTINCT test.category', 'category')
      .andWhere('test.category IS NOT NULL')
      .getRawMany();

    return result.map((r) => r.category);
  }
}