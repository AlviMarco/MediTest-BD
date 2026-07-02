import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMedicineDto {
  @ApiProperty({ example: 'Napa' })
  @IsString()
  @IsNotEmpty()
  brand_name: string;

  @ApiProperty({ example: 'Paracetamol' })
  @IsString()
  @IsNotEmpty()
  generic_name: string;

  @ApiProperty({ example: 'Beximco', required: false })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiProperty({ example: 'Tablet', required: false })
  @IsString()
  @IsOptional()
  dosage_form?: string;

  @ApiProperty({ example: '500mg', required: false })
  @IsString()
  @IsOptional()
  strength?: string;

  @ApiProperty({ example: 2.5, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 10, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount_percent?: number;

  @ApiProperty({ example: 2.25, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discounted_price?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  is_available?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  requires_prescription?: boolean;
}

export class UpdateMedicineDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  brand_name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  generic_name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  dosage_form?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  strength?: string;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount_percent?: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discounted_price?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_available?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  requires_prescription?: boolean;
}
