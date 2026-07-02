import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingPayment } from './booking-payments.entity';
import { BookingPaymentsService } from './booking-payments.service';
import { BookingPaymentsController } from './booking-payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BookingPayment])],
  controllers: [BookingPaymentsController],
  providers: [BookingPaymentsService],
  exports: [BookingPaymentsService],
})
export class BookingPaymentsModule {}