import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CouponsService } from './coupons.service';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
} from './coupon.dto';

@ApiTags('Coupons')
@ApiBearerAuth()
@Controller('coupons')
export class CouponsController {
  constructor(private readonly service: CouponsService) {}

  // Logged-in user checks if a coupon code is valid for their order
  @Post('validate')
  validate(@Req() req, @Body() dto: ValidateCouponDto) {
    return this.service.validateAndCalculate(
      dto.code,
      dto.order_amount,
      req.user.id,
    );
  }

  // Admin/Super Admin only — list all coupons
  @UseGuards(RolesGuard)
  @Roles(1, 2)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(1, 2)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(1, 2)
  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.service.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(1, 2)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(1, 2)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}