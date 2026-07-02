import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  // নতুন notification তৈরি করা
  async create(data: CreateNotificationDto) {
    const notification = this.notificationsRepository.create(data);
    return this.notificationsRepository.save(notification);
  }

  // একজন user এর সব notification দেখানো
  async findByUser(userId: string) {
    return this.notificationsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  // unread notification দেখানো
  async findUnread(userId: string) {
    return this.notificationsRepository.find({
      where: { user_id: userId, is_read: false },
      order: { created_at: 'DESC' },
    });
  }

  // notification read করা
  async markAsRead(id: string) {
    await this.notificationsRepository.update(id, { is_read: true });
    return { message: 'Notification read হয়েছে' };
  }

  // সব notification read করা
  async markAllAsRead(userId: string) {
    await this.notificationsRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
    return { message: 'সব notification read হয়েছে' };
  }

  // unread count দেখানো
  async getUnreadCount(userId: string) {
    const count = await this.notificationsRepository.count({
      where: { user_id: userId, is_read: false },
    });
    return { count };
  }
}