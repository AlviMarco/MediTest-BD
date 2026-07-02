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
import { DiagnosticTestsService } from './diagnostic-tests.service';
import { CreateDiagnosticTestDto, UpdateDiagnosticTestDto } from './diagnostic-test.dto';
import { Public } from '../auth/public.decorator';
import { ADMIN, Roles, SUPER_ADMIN } from '../auth/roles.decorator';

@ApiTags('Diagnostic Tests')
@Controller('diagnostic-tests')
export class DiagnosticTestsController {
  constructor(private readonly diagnosticTestsService: DiagnosticTestsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'সব diagnostic test দেখুন' })
  @ApiQuery({ name: 'category', required: false })
  async findAll(@Query('category') category?: string) {
    return this.diagnosticTestsService.findAll({ category });
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Test search করুন' })
  @ApiQuery({ name: 'keyword', required: true })
  async search(@Query('keyword') keyword: string) {
    return this.diagnosticTestsService.search(keyword);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'সব category দেখুন' })
  async getCategories() {
    return this.diagnosticTestsService.getCategories();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'একটা test দেখুন' })
  async findOne(@Param('id') id: string) {
    return this.diagnosticTestsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'নতুন test যোগ করুন (Admin)' })
  async create(@Body() body: CreateDiagnosticTestDto) {
    return this.diagnosticTestsService.create(body, 'admin');
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'Test update করুন (Admin)' })
  async update(@Param('id') id: string, @Body() body: UpdateDiagnosticTestDto) {
    return this.diagnosticTestsService.update(id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(SUPER_ADMIN, ADMIN)
  @ApiOperation({ summary: 'Test মুছুন (Admin)' })
  async remove(@Param('id') id: string) {
    return this.diagnosticTestsService.remove(id);
  }
}
