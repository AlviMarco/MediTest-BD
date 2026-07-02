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
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto, UpdateDoctorDto } from './doctor.dto';
import { Public } from '../auth/public.decorator';
import { ADMIN, Roles, SUPER_ADMIN } from '../auth/roles.decorator';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'সব doctor দেখুন' })
  @ApiQuery({ name: 'specialty', required: false })
  async findAll(@Query('specialty') specialty?: string) {
    return this.doctorsService.findAll({ specialty });
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Doctor search করুন' })
  @ApiQuery({ name: 'keyword', required: true })
  async search(@Query('keyword') keyword: string) {
    return this.doctorsService.search(keyword);
  }

  @Public()
  @Get('specialties')
  @ApiOperation({ summary: 'সব specialty দেখুন' })
  async getSpecialties() {
    return this.doctorsService.getSpecialties();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'একটা doctor দেখুন' })
  async findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'নতুন doctor যোগ করুন (Admin)' })
  async create(@Body() body: CreateDoctorDto) {
    return this.doctorsService.create(body, 'admin');
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'Doctor update করুন (Admin)' })
  async update(@Param('id') id: string, @Body() body: UpdateDoctorDto) {
    return this.doctorsService.update(id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'Doctor মুছুন (Admin)' })
  async remove(@Param('id') id: string) {
    return this.doctorsService.remove(id);
  }
}
