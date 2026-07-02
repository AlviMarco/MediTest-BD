import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { BloodDonorsModule } from './blood-donors/blood-donors.module';
import { BookingPaymentsModule } from './booking-payments/booking-payments.module';
import { BookingsModule } from './bookings/bookings.module';
import { CouponsModule } from './coupons/coupons.module';
import { DeliveryZonesModule } from './delivery-zones/delivery-zones.module';
import { DiagnosticTestsModule } from './diagnostic-tests/diagnostic-tests.module';
import { DoctorsModule } from './doctors/doctors.module';
import { HospitalCommissionsModule } from './hospital-commissions/hospital-commissions.module';
import { HospitalTestPricesModule } from './hospital-test-prices/hospital-test-prices.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { MedicineOrdersModule } from './medicine-orders/medicine-orders.module';
import { MedicinesModule } from './medicines/medicines.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OpeningBalancesModule } from './opening-balances/opening-balances.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import {
  toBoolean,
  toNumber,
  validateEnvironment,
} from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnvironment,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: toNumber(process.env.THROTTLE_TTL_MS, 60_000),
        limit: toNumber(process.env.THROTTLE_LIMIT, 120),
      },
    ]),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: toBoolean(process.env.DB_SSL, true)
        ? { rejectUnauthorized: false }
        : false,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize:
        process.env.NODE_ENV !== 'production' &&
        toBoolean(process.env.DB_SYNCHRONIZE, true),
      logging: toBoolean(process.env.DB_LOGGING, false),
    }),

    AuthModule,
    UsersModule,
    HospitalsModule,
    DiagnosticTestsModule,
    HospitalTestPricesModule,
    DoctorsModule,
    BookingsModule,
    MedicinesModule,
    BloodDonorsModule,
    MedicineOrdersModule,
    DeliveryZonesModule,
    CouponsModule,
    NotificationsModule,
    TasksModule,
    HospitalCommissionsModule,
    BookingPaymentsModule,
    OpeningBalancesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
