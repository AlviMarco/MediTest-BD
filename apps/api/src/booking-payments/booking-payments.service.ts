import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BookingPayment } from './booking-payments.entity';
import { CreateBookingPaymentDto } from './booking-payments.dto';

@Injectable()
export class BookingPaymentsService {
  constructor(
    @InjectRepository(BookingPayment)
    private repo: Repository<BookingPayment>,
  ) {}

  async create(data: CreateBookingPaymentDto) {
    const discount_amount = (data.test_price * data.discount_percent) / 100;
    const discounted_price = data.test_price - discount_amount;
    const commission_amount = (data.test_price * data.commission_percent) / 100;
    const net_profit = commission_amount - discount_amount;
    const hospital_payable = discounted_price - net_profit;

    const payment = this.repo.create({
      ...data,
      discount_amount,
      discounted_price,
      commission_amount,
      net_profit,
      hospital_payable,
    });

    return this.repo.save(payment);
  }

  async findAll() {
    return this.repo.find({ order: { payment_date: 'DESC' } });
  }

  async findOne(id: string) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Payment পাওয়া যায়নি');
    return p;
  }

  async remove(id: string) {
    const p = await this.findOne(id);
    await this.repo.remove(p);
    return { message: 'Payment মুছে ফেলা হয়েছে' };
  }

  async getAnalytics(hospital_id: string, from: string, to: string) {
    const where: any = {
      payment_date: Between(from, to),
    };
    if (hospital_id !== 'all') where.hospital_id = hospital_id;

    const payments = await this.repo.find({ where, order: { payment_date: 'ASC' } });

    const summary = payments.reduce(
      (acc, p) => {
        acc.total_test_price += Number(p.test_price);
        acc.total_discount += Number(p.discount_amount);
        acc.total_collected += Number(p.discounted_price);
        acc.total_advance += Number(p.advance_collected);
        acc.total_commission += Number(p.commission_amount);
        acc.total_net_profit += Number(p.net_profit);
        acc.total_hospital_payable += Number(p.hospital_payable);
        acc.balance_due += Number(p.hospital_payable) - Number(p.advance_collected);
        return acc;
      },
      {
        total_test_price: 0,
        total_discount: 0,
        total_collected: 0,
        total_advance: 0,
        total_commission: 0,
        total_net_profit: 0,
        total_hospital_payable: 0,
        balance_due: 0,
      },
    );

    return { payments, summary };
  }
}