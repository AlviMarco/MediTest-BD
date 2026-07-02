import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto, UpdateMedicineDto } from './medicine.dto';
import { Public } from '../auth/public.decorator';
import { ADMIN, Roles, SUPER_ADMIN } from '../auth/roles.decorator';

@ApiTags('Medicines')
@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'সব medicine দেখুন' })
  @ApiQuery({ name: 'dosage_form', required: false })
  async findAll(@Query('dosage_form') dosage_form?: string) {
    return this.medicinesService.findAll({ dosage_form });
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Medicine search করুন' })
  @ApiQuery({ name: 'keyword', required: true })
  async search(@Query('keyword') keyword: string) {
    return this.medicinesService.search(keyword);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'একটা medicine দেখুন' })
  async findOne(@Param('id') id: string) {
    return this.medicinesService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'নতুন medicine যোগ করুন (Admin)' })
  async create(@Body() body: CreateMedicineDto) {
    return this.medicinesService.create(body, 'admin');
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'Medicine update করুন (Admin)' })
  async update(@Param('id') id: string, @Body() body: UpdateMedicineDto) {
    return this.medicinesService.update(id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'Medicine মুছুন (Admin)' })
  async remove(@Param('id') id: string) {
    return this.medicinesService.remove(id);
  }
}
