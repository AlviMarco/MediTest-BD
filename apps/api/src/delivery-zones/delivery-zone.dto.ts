import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateDeliveryZoneDto {
  @IsString()
  @IsNotEmpty()
  district: string;

  @IsNumber()
  @Min(0)
  delivery_charge: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  free_delivery_threshold?: number;
}

export class UpdateDeliveryZoneDto {
  @IsString()
  @IsOptional()
  district?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  delivery_charge?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  free_delivery_threshold?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}