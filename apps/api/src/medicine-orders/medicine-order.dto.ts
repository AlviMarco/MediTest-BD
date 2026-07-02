import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  medicine_id: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateMedicineOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  delivery_address: string;

  // Delivery charge calculation-এর জন্য district দরকার
  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  delivery_phone: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  coupon_code?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string; // pending | confirmed | delivered | cancelled
}

export class CancelOrderDto {
  @IsString()
  @IsOptional()
  cancellation_reason?: string;
}