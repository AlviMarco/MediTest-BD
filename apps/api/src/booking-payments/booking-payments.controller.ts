import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingPaymentsService } from './booking-payments.service';
import { CreateBookingPaymentDto } from './booking-payments.dto';
import { ADMIN, Roles, SUPER_ADMIN } from '../auth/roles.decorator';

@ApiTags('Booking Payments')
@Controller('booking-payments')
export class BookingPaymentsController {
  constructor(private readonly service: BookingPaymentsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'নতুন payment record করুন (confirmed booking)' })
  create(@Body() body: CreateBookingPaymentDto) {
    return this.service.create(body);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'সব payment দেখুন' })
  findAll() {
    return this.service.findAll();
  }

  @Get('analytics')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'Analytics — hospital + date range' })
  @ApiQuery({ name: 'hospital_id', required: true })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  getAnalytics(
    @Query('hospital_id') hospital_id: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.service.getAnalytics(hospital_id, from, to);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'Payment মুছুন' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
