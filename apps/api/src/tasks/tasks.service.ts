import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto, UpdateTaskStatusDto } from './task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  // নতুন task তৈরি করা (Admin)
  async create(data: CreateTaskDto) {
    const task = this.tasksRepository.create(data);
    return this.tasksRepository.save(task);
  }

  // সব task দেখানো (Admin)
  async findAll() {
    return this.tasksRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  // একজন moderator এর task দেখানো
  async findByModerator(moderatorId: string) {
    return this.tasksRepository.find({
      where: { assigned_to: moderatorId },
      order: { created_at: 'DESC' },
    });
  }

  // pending task দেখানো
  async findPending(moderatorId: string) {
    return this.tasksRepository.find({
      where: { assigned_to: moderatorId, status: 'assigned' },
      order: { created_at: 'ASC' },
    });
  }

  // একটা task দেখানো
  async findOne(id: string) {
    const task = await this.tasksRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task পাওয়া যায়নি');
    }

    return task;
  }

  // task status update করা (Moderator)
  async updateStatus(id: string, data: UpdateTaskStatusDto) {
    const task = await this.findOne(id);

    task.status = data.status;

    if (data.status === 'completed') {
      task.completed_at = new Date();
    }

    return this.tasksRepository.save(task);
  }

  // task delete করা (Admin)
  async remove(id: string) {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
    return { message: 'Task সফলভাবে মুছে ফেলা হয়েছে' };
  }
}