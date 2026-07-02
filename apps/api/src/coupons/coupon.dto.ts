import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsIn(['percentage', 'fixed_amount', 'free_delivery'])
  type: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  max_discount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  min_order_amount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  usage_limit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  per_user_limit?: number;

  @IsDateString()
  @IsOptional()
  expires_at?: string;
}

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsIn(['percentage', 'fixed_amount', 'free_delivery'])
  @IsOptional()
  type?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  max_discount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  min_order_amount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  usage_limit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  per_user_limit?: number;

  @IsDateString()
  @IsOptional()
  expires_at?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @Min(0)
  order_amount: number;
}