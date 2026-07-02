import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { ADMIN, MODERATOR, Roles, SUPER_ADMIN } from '../auth/roles.decorator';
import {
  CreateHospitalTestPriceDto,
  UpdateHospitalTestPriceDto,
} from './hospital-test-price.dto';
import { HospitalTestPricesService } from './hospital-test-prices.service';

@ApiTags('Hospital Test Prices')
@Controller('hospital-test-prices')
export class HospitalTestPricesController {
  constructor(private readonly service: HospitalTestPricesService) {}

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search hospital test prices by test name' })
  @ApiQuery({ name: 'test', required: true })
  async searchByTestName(@Query('test') testName: string) {
    return this.service.searchByTestName(testName);
  }

  @Public()
  @Get('hospital/:hospitalId')
  @ApiOperation({ summary: 'Get all test prices for a hospital' })
  async findByHospital(@Param('hospitalId') hospitalId: string) {
    return this.service.findByHospital(hospitalId);
  }

  @Public()
  @Get('test/:testId')
  @ApiOperation({ summary: 'Get hospitals and prices for a test' })
  async findByTest(@Param('testId') testId: string) {
    return this.service.findByTest(testId);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN, MODERATOR)
  @ApiOperation({ summary: 'Create a hospital test price' })
  async create(@Body() body: CreateHospitalTestPriceDto) {
    return this.service.create(body, 'admin');
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN, MODERATOR)
  @ApiOperation({ summary: 'Update a hospital test price' })
  async update(@Param('id') id: string, @Body() body: UpdateHospitalTestPriceDto) {
    return this.service.update(id, body, 'admin');
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'Delete a hospital test price' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
