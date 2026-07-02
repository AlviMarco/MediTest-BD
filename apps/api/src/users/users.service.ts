import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './user.dto';
import * as bcrypt from 'bcrypt';

function generateReferralCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) || 'USER';
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${randomPart}`;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(requestingRoleId?: number): Promise<User[]> {
    let minRoleId = 1;
    if (requestingRoleId === 2) minRoleId = 3; // Admin -> Moderator + User
    if (requestingRoleId === 3) minRoleId = 4; // Moderator -> User only

    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.role_id >= :minRoleId', { minRoleId })
      .orderBy('user.created_at', 'DESC')
      .getMany();
  }

 async createUser(data: {
    name: string;
    email?: string;
    phone: string;
    password: string;
    role_id?: number;
    blood_group: string;
    division: string;
    district: string;
    upazilla: string;
    union_name?: string;
    referred_by?: string;
    health_coins?: number;
  }): Promise<User> {
    const password_hash = await bcrypt.hash(data.password, 10);

    // Unique referral code generate করো (collision হলে আবার চেষ্টা করবে)
    let referral_code = generateReferralCode(data.name);
    let attempts = 0;
    while (await this.usersRepository.findOne({ where: { referral_code } })) {
      referral_code = generateReferralCode(data.name);
      attempts++;
      if (attempts > 5) break;
    }

    const user = this.usersRepository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password_hash,
      role_id: data.role_id || 4,
      blood_group: data.blood_group,
      division: data.division,
      district: data.district,
      upazilla: data.upazilla,
      union_name: data.union_name,
      referral_code,
      referred_by: data.referred_by,
      health_coins: data.health_coins ?? 0,
    });
    return this.usersRepository.save(user);
  }

  async addHealthCoins(userId: string, amount: number): Promise<void> {
    await this.usersRepository.increment({ id: userId }, 'health_coins', amount);
  }

  async findByReferralCode(code: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { referral_code: code.toUpperCase() },
    });
  }

  async getReferralStats(userId: string) {
    const referredUsers = await this.usersRepository.find({
      where: { referred_by: userId },
      order: { created_at: 'DESC' },
    });

    return {
      total_referrals: referredUsers.length,
      referred_users: referredUsers.map((u) => ({
        id: u.id,
        name: u.name,
        created_at: u.created_at,
      })),
    };
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User পাওয়া যায়নি');
    Object.assign(user, data);
    return this.usersRepository.save(user);
  }

  async deactivateUser(id: string): Promise<{ message: string }> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User পাওয়া যায়নি');
    user.is_active = false;
    await this.usersRepository.save(user);
    return { message: 'User নিষ্ক্রিয় করা হয়েছে' };
  }

  async validatePassword(
    password: string,
    password_hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, password_hash);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { last_login: new Date() });
  }
}