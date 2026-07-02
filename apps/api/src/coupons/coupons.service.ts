import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './coupon.entity';
import { CouponUsage } from './coupon-usage.entity';
import { CreateCouponDto, UpdateCouponDto } from './coupon.dto';

export interface CouponCalculationResult {
  valid: boolean;
  coupon?: Coupon;
  discount_amount: number;
  free_delivery: boolean;
  message?: string;
}

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private repo: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private usageRepo: Repository<CouponUsage>,
  ) {}

  async create(dto: CreateCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.repo.findOne({ where: { code } });
    if (existing) {
      throw new BadRequestException(`কুপন কোড "${code}" ইতিমধ্যে আছে`);
    }

    const coupon = this.repo.create({
      ...dto,
      code,
      value: dto.value ?? 0,
      max_discount: dto.max_discount ?? 0,
      min_order_amount: dto.min_order_amount ?? 0,
      usage_limit: dto.usage_limit ?? 0,
      per_user_limit: dto.per_user_limit ?? 1,
      expires_at: dto.expires_at ? new Date(dto.expires_at) : null,
      is_active: true,
    });

    return this.repo.save(coupon);
  }

  async findAll() {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string) {
    const coupon = await this.repo.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('কুপন পাওয়া যায়নি');
    }
    return coupon;
  }

  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await this.findOne(id);

    if (dto.code) {
      dto.code = dto.code.trim().toUpperCase();
    }

    Object.assign(coupon, {
      ...dto,
      expires_at: dto.expires_at ? new Date(dto.expires_at) : coupon.expires_at,
    });

    return this.repo.save(coupon);
  }

  async remove(id: string) {
    const coupon = await this.findOne(id);
    await this.repo.remove(coupon);
    return { message: 'কুপন মুছে ফেলা হয়েছে' };
  }

  // Validate and calculate discount for a given coupon code + order amount + user
  async validateAndCalculate(
    code: string,
    orderAmount: number,
    userId: string,
  ): Promise<CouponCalculationResult> {
    const coupon = await this.repo.findOne({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return {
        valid: false,
        discount_amount: 0,
        free_delivery: false,
        message: 'কুপন কোডটি সঠিক নয়',
      };
    }

    if (!coupon.is_active) {
      return {
        valid: false,
        discount_amount: 0,
        free_delivery: false,
        message: 'এই কুপনটি বর্তমানে সক্রিয় নয়',
      };
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return {
        valid: false,
        discount_amount: 0,
        free_delivery: false,
        message: 'কুপনের মেয়াদ শেষ হয়ে গেছে',
      };
    }

    if (
      Number(coupon.min_order_amount) > 0 &&
      orderAmount < Number(coupon.min_order_amount)
    ) {
      return {
        valid: false,
        discount_amount: 0,
        free_delivery: false,
        message: `এই কুপন ব্যবহারের জন্য সর্বনিম্ন ৳${coupon.min_order_amount} এর অর্ডার করতে হবে`,
      };
    }

    if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
      return {
        valid: false,
        discount_amount: 0,
        free_delivery: false,
        message: 'এই কুপনের ব্যবহারের সীমা শেষ হয়ে গেছে',
      };
    }

    if (coupon.per_user_limit > 0) {
      const userUsageCount = await this.usageRepo.count({
        where: { coupon_id: coupon.id, user_id: userId },
      });
      if (userUsageCount >= coupon.per_user_limit) {
        return {
          valid: false,
          discount_amount: 0,
          free_delivery: false,
          message: 'আপনি এই কুপনটি আগেই ব্যবহার করেছেন',
        };
      }
    }

    // Calculate discount based on type
    let discountAmount = 0;
    let freeDelivery = false;

    if (coupon.type === 'percentage') {
      discountAmount = (orderAmount * Number(coupon.value)) / 100;
      if (Number(coupon.max_discount) > 0) {
        discountAmount = Math.min(discountAmount, Number(coupon.max_discount));
      }
    } else if (coupon.type === 'fixed_amount') {
      discountAmount = Math.min(Number(coupon.value), orderAmount);
    } else if (coupon.type === 'free_delivery') {
      freeDelivery = true;
    }

    return {
      valid: true,
      coupon,
      discount_amount: Math.round(discountAmount * 100) / 100,
      free_delivery: freeDelivery,
    };
  }

  // Call this when an order is successfully placed with a coupon
  async recordUsage(couponId: string, userId: string, orderId: string) {
    const usage = this.usageRepo.create({
      coupon_id: couponId,
      user_id: userId,
      order_id: orderId,
    });
    await this.usageRepo.save(usage);

    await this.repo.increment({ id: couponId }, 'used_count', 1);
  }
}