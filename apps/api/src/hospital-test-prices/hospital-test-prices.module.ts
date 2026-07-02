import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalTestPricesService } from './hospital-test-prices.service';
import { HospitalTestPricesController } from './hospital-test-prices.controller';
import { HospitalTestPrice } from './hospital-test-price.entity';
import { Hospital } from '../hospitals/hospital.entity';
import { DiagnosticTest } from '../diagnostic-tests/diagnostic-test.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HospitalTestPrice, Hospital, DiagnosticTest]),
  ],
  controllers: [HospitalTestPricesController],
  providers: [HospitalTestPricesService],
  exports: [HospitalTestPricesService],
})
export class HospitalTestPricesModule {}