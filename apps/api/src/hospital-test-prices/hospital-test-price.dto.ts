import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateHospitalTestPriceDto {
  @ApiProperty({ example: 'bde6ec10-ea85-44f5-ba66-9a9653e6e816' })
  @IsUUID()
  hospital_id: string;

  @ApiProperty({ example: '87d30a82-6f17-4f11-802a-ba95d47cf48c' })
  @IsUUID()
  test_id: string;

  @ApiProperty({ example: 500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: '2 hours', required: false })
  @IsString()
  @IsOptional()
  report_delivery_time?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  is_available?: boolean;
}

export class UpdateHospitalTestPriceDto {
  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  report_delivery_time?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_available?: boolean;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount_percent?: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discounted_price?: number;
}
