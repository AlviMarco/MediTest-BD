import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryZone } from './delivery-zone.entity';
import { CreateDeliveryZoneDto, UpdateDeliveryZoneDto } from './delivery-zone.dto';

export const DEFAULT_ZONE_KEY = 'DEFAULT';

@Injectable()
export class DeliveryZonesService {
  constructor(
    @InjectRepository(DeliveryZone)
    private repo: Repository<DeliveryZone>,
  ) {}

  async create(dto: CreateDeliveryZoneDto) {
    const existing = await this.repo.findOne({
      where: { district: dto.district },
    });
    if (existing) {
      throw new BadRequestException(
        `"${dto.district}" এর জন্য zone ইতিমধ্যে আছে`,
      );
    }

    const zone = this.repo.create({
      district: dto.district,
      delivery_charge: dto.delivery_charge,
      free_delivery_threshold: dto.free_delivery_threshold ?? 0,
      is_active: true,
    });
    return this.repo.save(zone);
  }

  async findAll() {
    return this.repo.find({ order: { district: 'ASC' } });
  }

  async findOne(id: string) {
    const zone = await this.repo.findOne({ where: { id } });
    if (!zone) {
      throw new NotFoundException('Delivery zone পাওয়া যায়নি');
    }
    return zone;
  }

  async update(id: string, dto: UpdateDeliveryZoneDto) {
    const zone = await this.findOne(id);
    Object.assign(zone, dto);
    return this.repo.save(zone);
  }

  async remove(id: string) {
    const zone = await this.findOne(id);
    await this.repo.remove(zone);
    return { message: 'Delivery zone মুছে ফেলা হয়েছে' };
  }

  // Calculate delivery charge for a given district and order subtotal
  async calculateCharge(district: string, subtotal: number): Promise<number> {
    let zone = await this.repo.findOne({
      where: { district, is_active: true },
    });

    if (!zone) {
      zone = await this.repo.findOne({
        where: { district: DEFAULT_ZONE_KEY, is_active: true },
      });
    }

    if (!zone) {
      return 0; // no zones configured at all — no charge
    }

    if (
      zone.free_delivery_threshold > 0 &&
      subtotal >= Number(zone.free_delivery_threshold)
    ) {
      return 0;
    }

    return Number(zone.delivery_charge);
  }
}