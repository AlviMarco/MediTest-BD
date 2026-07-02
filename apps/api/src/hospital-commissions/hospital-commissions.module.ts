import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalCommission } from './hospital-commission.entity';
import { HospitalCommissionsService } from './hospital-commissions.service';
import { HospitalCommissionsController } from './hospital-commissions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HospitalCommission])],
  controllers: [HospitalCommissionsController],
  providers: [HospitalCommissionsService],
  exports: [HospitalCommissionsService],
})
export class HospitalCommissionsModule {}