import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto, UpdateBookingDto } from './booking.dto';
import { Public } from '../auth/public.decorator';
import { ADMIN, MODERATOR, Roles, SUPER_ADMIN } from '../auth/roles.decorator';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'নতুন booking করুন' })
  async create(@Body() body: CreateBookingDto) {
    return this.bookingsService.create(body);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN, MODERATOR)
  @ApiOperation({ summary: 'সব booking দেখুন (Admin)' })
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Get('pending')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN, MODERATOR)
  @ApiOperation({ summary: 'সব pending booking দেখুন (Moderator)' })
  async findPending() {
    return this.bookingsService.findPending();
  }

  @Public()
  @Get('user/:userId')
  @ApiOperation({ summary: 'একজন user এর সব booking দেখুন' })
  async findByUser(@Param('userId') userId: string) {
    return this.bookingsService.findByUser(userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'একটা booking দেখুন' })
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN, MODERATOR)
  @ApiOperation({ summary: 'Booking তথ্য update করুন (Admin/Moderator)' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, body);
  }

  @Put(':id/status')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN, MODERATOR)
  @ApiOperation({ summary: 'Booking status update করুন (Moderator)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, body, 'moderator');
  }

  @Public()
  @Put(':id/cancel')
  @ApiOperation({ summary: 'Booking cancel করুন (User)' })
  async cancel(
    @Param('id') id: string,
    @Query('reason') reason?: string,
  ) {
    return this.bookingsService.cancel(id, reason);
  }
}
