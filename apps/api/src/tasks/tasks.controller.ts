import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskStatusDto } from './task.dto';
import { ADMIN, MODERATOR, Roles, SUPER_ADMIN } from '../auth/roles.decorator';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'নতুন task তৈরি করুন (Admin)' })
  async create(@Body() body: CreateTaskDto) {
    return this.tasksService.create(body);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN, MODERATOR)
  @ApiOperation({ summary: 'সব task দেখুন (Admin)' })
  async findAll() {
    return this.tasksService.findAll();
  }

  @Get('moderator/:moderatorId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Moderator এর সব task দেখুন' })
  async findByModerator(@Param('moderatorId') moderatorId: string) {
    return this.tasksService.findByModerator(moderatorId);
  }

  @Get('moderator/:moderatorId/pending')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Moderator এর pending task দেখুন' })
  async findPending(@Param('moderatorId') moderatorId: string) {
    return this.tasksService.findPending(moderatorId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'একটা task দেখুন' })
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Put(':id/status')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN, MODERATOR)
  @ApiOperation({ summary: 'Task status update করুন (Moderator)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateStatus(id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'Task মুছুন (Admin)' })
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
