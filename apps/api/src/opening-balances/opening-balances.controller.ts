import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OpeningBalancesService } from './opening-balances.service';
import { CreateOpeningBalanceDto } from './opening-balances.dto';
import { ADMIN, Roles, SUPER_ADMIN } from '../auth/roles.decorator';

@ApiTags('Opening Balances')
@Controller('opening-balances')
export class OpeningBalancesController {
  constructor(private readonly service: OpeningBalancesService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  findAll() {
    return this.service.findAll();
  }

  @Get('find')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiQuery({ name: 'hospital_id', required: true })
  @ApiQuery({ name: 'period_start', required: true })
  findOne(
    @Query('hospital_id') hospital_id: string,
    @Query('period_start') period_start: string,
  ) {
    return this.service.findByHospitalAndDate(hospital_id, period_start);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'Opening balance set করুন (upsert)' })
  upsert(@Body() body: CreateOpeningBalanceDto) {
    return this.service.upsert(body);
  }
}
