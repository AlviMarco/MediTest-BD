import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DeliveryZonesService } from './delivery-zones.service';
import { CreateDeliveryZoneDto, UpdateDeliveryZoneDto } from './delivery-zone.dto';

@ApiTags('Delivery Zones')
@Controller('delivery-zones')
export class DeliveryZonesController {
  constructor(private readonly service: DeliveryZonesService) {}

  // Public — mobile app needs this to show delivery charge during checkout
  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // Admin/Super Admin only — create new zone
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(1, 2)
  @Post()
  create(@Body() dto: CreateDeliveryZoneDto) {
    return this.service.create(dto);
  }

  // Admin/Super Admin only — update zone
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(1, 2)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeliveryZoneDto) {
    return this.service.update(id, dto);
  }

  // Admin/Super Admin only — delete zone
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(1, 2)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}