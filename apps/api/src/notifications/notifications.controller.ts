import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ADMIN, MODERATOR, Roles, SUPER_ADMIN } from '../auth/roles.decorator';
import { CreateNotificationDto } from './notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(SUPER_ADMIN, ADMIN, MODERATOR)
  @ApiOperation({ summary: 'Send a notification' })
  async create(@Body() body: CreateNotificationDto) {
    return this.notificationsService.create(body);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user notifications' })
  async findByUser(@Req() req, @Param('userId') userId: string) {
    return this.notificationsService.findByUser(this.authorizedUserId(req, userId));
  }

  @Get('user/:userId/unread')
  @ApiOperation({ summary: 'Get unread user notifications' })
  async findUnread(@Req() req, @Param('userId') userId: string) {
    return this.notificationsService.findUnread(this.authorizedUserId(req, userId));
  }

  @Get('user/:userId/count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Req() req, @Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(
      this.authorizedUserId(req, userId),
    );
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('user/:userId/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Req() req, @Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(
      this.authorizedUserId(req, userId),
    );
  }

  private authorizedUserId(req: any, requestedUserId: string) {
    if (req.user?.role_id <= MODERATOR) {
      return requestedUserId;
    }
    return req.user.id;
  }
}
