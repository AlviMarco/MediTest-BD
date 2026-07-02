import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MedicineOrdersService } from './medicine-orders.service';
import {
  CancelOrderDto,
  CreateMedicineOrderDto,
  UpdateOrderStatusDto,
} from './medicine-order.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Medicine Orders')
@ApiBearerAuth()
@Controller('medicine-orders')
export class MedicineOrdersController {
  constructor(private readonly service: MedicineOrdersService) {}

  // User creates an order (logged-in users only — JwtAuthGuard is global)
  @Post()
  create(@Req() req, @Body() dto: CreateMedicineOrderDto) {
    return this.service.create(req.user.id, dto);
  }

  // Admin / Moderator: view all orders
  @Get()
  @UseGuards(RolesGuard)
  @Roles(1, 2, 3)
  findAll() {
    return this.service.findAll();
  }

  // User: view own order history
  @Get('user/:userId')
  findByUser(@Req() req, @Param('userId') userId: string) {
    // Users can only fetch their own orders unless Admin+
    if (req.user.role_id > 2 && req.user.id !== userId) {
      return this.service.findByUser(req.user.id);
    }
    return this.service.findByUser(userId);
  }

  // Get single order
  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    if (req.user.role_id <= 2) {
      // Admin / Super Admin can view any order
      return this.service.findOne(id);
    }
    return this.service.findOneForUser(id, req.user.id);
  }

  // Admin/Moderator: update order status (confirm/deliver/cancel)
  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(1, 2, 3)
  updateStatus(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.service.updateStatus(id, dto, req.user.id);
  }

  // User: cancel own pending/confirmed order
  @Put(':id/cancel')
  cancel(@Req() req, @Param('id') id: string, @Body() dto: CancelOrderDto) {
    if (req.user.role_id <= 2) {
      // Admin/Super Admin can cancel any order
      return this.service.cancel(id, dto);
    }
    return this.service.cancel(id, dto, req.user.id);
  }
}