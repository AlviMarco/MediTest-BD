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
import { HospitalsService } from './hospitals.service';
import { CreateHospitalDto, UpdateHospitalDto } from './hospital.dto';
import { Public } from '../auth/public.decorator';
import { ADMIN, MODERATOR, Roles, SUPER_ADMIN } from '../auth/roles.decorator';

@ApiTags('Hospitals')
@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'সব hospital দেখুন' })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'area', required: false })
  @ApiQuery({ name: 'emergency', required: false })
  @ApiQuery({ name: 'icu', required: false })
  @ApiQuery({ name: 'type', required: false })
  async findAll(
    @Query('city') city?: string,
    @Query('area') area?: string,
    @Query('emergency') emergency?: boolean,
    @Query('icu') icu?: boolean,
    @Query('type') type?: string,
  ) {
    return this.hospitalsService.findAll({ city, area, emergency, icu, type });
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Hospital search করুন' })
  @ApiQuery({ name: 'keyword', required: true })
  async search(@Query('keyword') keyword: string) {
    return this.hospitalsService.search(keyword);
  }

  @Public()
  @Get('nearby')
  @ApiOperation({ summary: 'কাছের hospital খুঁজুন' })
  @ApiQuery({ name: 'lat', required: true })
  @ApiQuery({ name: 'lng', required: true })
  @ApiQuery({ name: 'radius', required: false })
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius?: number,
  ) {
    return this.hospitalsService.findNearby(lat, lng, radius);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'একটা hospital দেখুন' })
  async findOne(@Param('id') id: string) {
    return this.hospitalsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'নতুন hospital যোগ করুন (Admin)' })
  async create(@Body() body: CreateHospitalDto) {
    return this.hospitalsService.create(body, 'admin');
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN, MODERATOR)
  @ApiOperation({ summary: 'Hospital update করুন (Admin/Moderator)' })
  async update(@Param('id') id: string, @Body() body: UpdateHospitalDto) {
    return this.hospitalsService.update(id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'Hospital মুছুন (Admin)' })
  async remove(@Param('id') id: string) {
    return this.hospitalsService.remove(id);
  }
}
