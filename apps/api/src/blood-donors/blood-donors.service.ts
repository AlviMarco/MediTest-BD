import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodDonor } from './blood-donor.entity';
import { User } from '../users/user.entity';
import { SearchBloodDonorDto, UpdateBloodDonorDto } from './blood-donor.dto';

const COOLDOWN_DAYS = 90;

@Injectable()
export class BloodDonorsService {
  constructor(
    @InjectRepository(BloodDonor)
    private repo: Repository<BloodDonor>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  // User-এর profile data থেকে এক ক্লিকে donor হওয়া
  async becomeDonor(userId: string) {
    // আগেই donor আছে কিনা চেক করো
    const existing = await this.repo.findOne({ where: { user_id: userId } });
    if (existing) {
      throw new BadRequestException('আপনি ইতিমধ্যে একজন রক্তদাতা');
    }

    // User profile থেকে data নিয়ে আসো
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User পাওয়া যায়নি');
    }

    if (!user.blood_group || !user.division || !user.district || !user.upazilla) {
      throw new BadRequestException(
        'রক্তদাতা হওয়ার জন্য Blood Group এবং সম্পূর্ণ Address প্রয়োজন। প্রোফাইল আপডেট করুন।',
      );
    }

    const donor = this.repo.create({
      user_id: user.id,
      name: user.name,
      phone: user.phone,
      blood_group: user.blood_group,
      division: user.division,
      district: user.district,
      upazilla: user.upazilla,
      union_name: user.union_name,
      is_available: true,
    });

    return this.repo.save(donor);
  }

  async findAll(filters?: SearchBloodDonorDto) {
    const qb = this.repo.createQueryBuilder('donor');

    if (filters?.blood_group) {
      qb.andWhere('donor.blood_group = :bg', { bg: filters.blood_group });
    }
    if (filters?.division) {
      qb.andWhere('LOWER(donor.division) = LOWER(:division)', {
        division: filters.division,
      });
    }
    if (filters?.district) {
      qb.andWhere('LOWER(donor.district) = LOWER(:district)', {
        district: filters.district,
      });
    }
    if (filters?.upazilla) {
      qb.andWhere('LOWER(donor.upazilla) = LOWER(:upazilla)', {
        upazilla: filters.upazilla,
      });
    }

    qb.andWhere('donor.is_available = true');
    qb.orderBy('donor.created_at', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const donor = await this.repo.findOne({ where: { id } });
    if (!donor) {
      throw new NotFoundException('Blood donor record not found');
    }
    return donor;
  }

  async findByUser(userId: string) {
    return this.repo.findOne({ where: { user_id: userId } });
  }

  async update(id: string, dto: UpdateBloodDonorDto) {
    const donor = await this.findOne(id);

    if (dto.last_donation_date) {
      donor.last_donated_at = new Date(dto.last_donation_date) as any;
      donor.is_available = false;
    }

    Object.assign(donor, {
      ...dto,
      is_available:
        dto.is_available !== undefined
          ? dto.is_available
          : donor.is_available,
    });

    return this.repo.save(donor);
  }

  async markAvailable(id: string) {
    const donor = await this.findOne(id);

    if (donor.last_donated_at) {
      const lastDate = new Date(donor.last_donated_at);
      const daysSince = Math.floor(
        (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSince < COOLDOWN_DAYS) {
        throw new BadRequestException(
          `Donor must wait ${COOLDOWN_DAYS - daysSince} more day(s) before becoming available again (90-day cooldown).`,
        );
      }
    }

    donor.is_available = true;
    return this.repo.save(donor);
  }
}