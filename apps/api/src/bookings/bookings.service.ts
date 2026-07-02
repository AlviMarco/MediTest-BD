import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { CreateBookingDto, UpdateBookingStatusDto, UpdateBookingDto } from './booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  // নতুন booking করা
  async create(data: CreateBookingDto) {
    const booking = this.bookingsRepository.create({
      ...data,
      status: 'pending',
    });
    return this.bookingsRepository.save(booking);
  }

  // একজন user এর সব booking দেখানো
  async findByUser(userId: string) {
    return this.bookingsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  // সব pending booking দেখানো (Moderator এর জন্য)
  async findPending() {
    return this.bookingsRepository.find({
      where: { status: 'pending' },
      order: { created_at: 'ASC' },
    });
  }

  // সব booking দেখানো (Admin এর জন্য)
  async findAll() {
    return this.bookingsRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  // একটা booking দেখানো
  async findOne(id: string) {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking পাওয়া যায়নি');
    }

    return booking;
  }

  // booking সম্পাদনা করা (Admin/Moderator করবে)
  async update(id: string, data: UpdateBookingDto) {
    const booking = await this.findOne(id);

    if (data.status !== undefined) booking.status = data.status;
    if (data.booking_date !== undefined) booking.booking_date = data.booking_date;
    if (data.booking_time !== undefined) booking.booking_time = data.booking_time;
    if (data.notes !== undefined) booking.notes = data.notes;
    if (data.special_requirements !== undefined) booking.special_requirements = data.special_requirements;

    return this.bookingsRepository.save(booking);
  }

  // booking status update করা (Moderator করবে)
  async updateStatus(
    id: string,
    data: UpdateBookingStatusDto,
    moderatorId: string,
  ) {
    const booking = await this.findOne(id);

    booking.status = data.status;

    if (data.status === 'confirmed') {
      booking.confirmed_by = moderatorId;
    }

    if (data.status === 'cancelled' && data.cancellation_reason) {
      booking.cancellation_reason = data.cancellation_reason;
    }

    return this.bookingsRepository.save(booking);
  }

  // booking cancel করা (User করবে)
  async cancel(id: string, reason?: string) {
    const booking = await this.findOne(id);

    if (booking.status !== 'pending') {
      throw new NotFoundException('শুধু pending booking বাতিল করা যাবে');
    }

    booking.status = 'cancelled';
    booking.cancellation_reason = reason || 'User কর্তৃক বাতিল';

    return this.bookingsRepository.save(booking);
  }
}