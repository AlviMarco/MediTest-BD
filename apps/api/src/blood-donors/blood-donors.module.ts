import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloodDonorsService } from './blood-donors.service';
import { BloodDonorsController } from './blood-donors.controller';
import { BloodDonor } from './blood-donor.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BloodDonor, User])],
  controllers: [BloodDonorsController],
  providers: [BloodDonorsService],
  exports: [BloodDonorsService],
})
export class BloodDonorsModule {}