import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HospitalCommissionsService } from './hospital-commissions.service';
import { SetCommissionDto } from './hospital-commission.dto';
import { ADMIN, Roles, SUPER_ADMIN } from '../auth/roles.decorator';

@ApiTags('Hospital Commissions')
@Controller('hospital-commissions')
export class HospitalCommissionsController {
  constructor(private readonly service: HospitalCommissionsService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'সব hospital এর commission দেখুন' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':hospitalId')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'একটা hospital এর commission দেখুন' })
  findOne(@Param('hospitalId') hospitalId: string) {
    return this.service.findByHospital(hospitalId);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'Commission set করুন (upsert)' })
  set(@Body() body: SetCommissionDto) {
    return this.service.set(body);
  }
}
