import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicineOrder } from './medicine-order.entity';
import { MedicineOrderItem } from './medicine-order-item.entity';
import { Medicine } from '../medicines/medicine.entity';
import {
  CancelOrderDto,
  CreateMedicineOrderDto,
  UpdateOrderStatusDto,
} from './medicine-order.dto';
import { DeliveryZonesService } from '../delivery-zones/delivery-zones.service';
import { CouponsService } from '../coupons/coupons.service';

const VALID_STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled'];

@Injectable()
export class MedicineOrdersService {
  constructor(
    @InjectRepository(MedicineOrder)
    private ordersRepo: Repository<MedicineOrder>,
    @InjectRepository(MedicineOrderItem)
    private itemsRepo: Repository<MedicineOrderItem>,
    @InjectRepository(Medicine)
    private medicinesRepo: Repository<Medicine>,
    private deliveryZonesService: DeliveryZonesService,
    private couponsService: CouponsService,
  ) {}

private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    const countToday = await this.ordersRepo
      .createQueryBuilder('order')
      .where('order.created_at BETWEEN :start AND :end', {
        start: todayStart,
        end: todayEnd,
      })
      .getCount();

    const serial = String(countToday + 1).padStart(3, '0');
    return `MED-${dateStr}-${serial}`;
  }
  async create(userId: string, dto: CreateMedicineOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const items: MedicineOrderItem[] = [];
    let subtotal = 0;

    for (const reqItem of dto.items) {
      const medicine = await this.medicinesRepo.findOne({
        where: { id: reqItem.medicine_id },
      });

      if (!medicine) {
        throw new NotFoundException(
          `Medicine ${reqItem.medicine_id} not found`,
        );
      }

      if (!medicine.is_available) {
        throw new BadRequestException(
          `Medicine "${medicine.brand_name}" is currently unavailable`,
        );
      }

      const unitPrice = Number(medicine.price);
      const discountedPrice =
        Number(medicine.discounted_price) > 0
          ? Number(medicine.discounted_price)
          : unitPrice;

      const itemSubtotal = discountedPrice * reqItem.quantity;
      subtotal += itemSubtotal;

      const item = this.itemsRepo.create({
        medicine_id: medicine.id,
        quantity: reqItem.quantity,
        unit_price: unitPrice,
        discounted_price: discountedPrice,
        subtotal: itemSubtotal,
      });

      items.push(item);
    }

    // Delivery charge — district অনুযায়ী calculate
    let deliveryCharge = await this.deliveryZonesService.calculateCharge(
      dto.district,
      subtotal,
    );

    // Coupon — থাকলে validate এবং discount calculate করো
    let discountAmount = 0;
    let appliedCouponId: string | null = null;
    let appliedCouponCode: string | null = null;

    if (dto.coupon_code) {
      const result = await this.couponsService.validateAndCalculate(
        dto.coupon_code,
        subtotal,
        userId,
      );

      if (!result.valid) {
        throw new BadRequestException(result.message || 'কুপন কোড সঠিক নয়');
      }

      discountAmount = result.discount_amount;
      if (result.free_delivery) {
        deliveryCharge = 0;
      }
      appliedCouponId = result.coupon.id;
      appliedCouponCode = result.coupon.code;
    }

    const totalAmount = Math.max(
      0,
      subtotal + deliveryCharge - discountAmount,
    );

    const orderNumber = await this.generateOrderNumber();

    const order = this.ordersRepo.create({
      user_id: userId,
      order_number: orderNumber,
      status: 'pending',
      subtotal,
      delivery_charge: deliveryCharge,
      discount_amount: discountAmount,
      coupon_code: appliedCouponCode,
      total_amount: totalAmount,
      delivery_address: dto.delivery_address,
      delivery_phone: dto.delivery_phone,
      notes: dto.notes,
      items,
    });

    const savedOrder = await this.ordersRepo.save(order);

    // কুপন ব্যবহার হয়ে থাকলে usage record করো
    if (appliedCouponId) {
      await this.couponsService.recordUsage(
        appliedCouponId,
        userId,
        savedOrder.id,
      );
    }

    return savedOrder;
  }

  async findAll() {
    return this.ordersRepo.find({
      relations: { items: { medicine: true } },
      order: { created_at: 'DESC' },
    });
  }

  async findByUser(userId: string) {
    return this.ordersRepo.find({
      where: { user_id: userId },
      relations: { items: { medicine: true } },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.ordersRepo.findOne({
      where: { id },
      relations: { items: { medicine: true } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findOneForUser(id: string, userId: string) {
    const order = await this.findOne(id);

    if (order.user_id !== userId) {
      throw new ForbiddenException('You cannot access this order');
    }

    return order;
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    confirmedBy: string,
  ) {
    const order = await this.findOne(id);

    if (!VALID_STATUSES.includes(dto.status)) {
      throw new BadRequestException(`Invalid status: ${dto.status}`);
    }

    order.status = dto.status;

    if (dto.status === 'confirmed' || dto.status === 'delivered') {
      order.confirmed_by = confirmedBy;
    }

    return this.ordersRepo.save(order);
  }

  async cancel(id: string, dto: CancelOrderDto, userId?: string) {
    const order = await this.findOne(id);

    // If userId provided, ensure user owns the order (user-initiated cancel)
    if (userId && order.user_id !== userId) {
      throw new ForbiddenException('You cannot cancel this order');
    }

    // Users can only cancel while order is still pending.
    // Once Admin/Moderator confirms it, the user can no longer cancel.
    if (userId && order.status !== 'pending') {
      throw new BadRequestException(
        'অর্ডার নিশ্চিত হয়ে গেছে, এখন বাতিল করা যাবে না',
      );
    }

    if (order.status === 'delivered') {
      throw new BadRequestException('Delivered orders cannot be cancelled');
    }

    if (order.status === 'cancelled') {
      throw new BadRequestException('Order is already cancelled');
    }

    order.status = 'cancelled';
    order.cancellation_reason = dto.cancellation_reason ?? null;

    return this.ordersRepo.save(order);
  }
}