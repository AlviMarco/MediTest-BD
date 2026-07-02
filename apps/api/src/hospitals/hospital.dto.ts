import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateHospitalDto {
  @ApiProperty({ example: 'Dhaka Medical College Hospital' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'hospital', enum: ['hospital', 'diagnostic', 'clinic'] })
  @IsIn(['hospital', 'diagnostic', 'clinic'])
  type: string;

  @ApiProperty({ example: 'Mahakhali, Dhaka' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Mahakhali', required: false })
  @IsString()
  @IsOptional()
  area?: string;

  @ApiProperty({ example: 'Dhaka', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 23.7808, required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: 90.4213, required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ example: '01711234567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  emergency_available?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  icu_available?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  ambulance_available?: boolean;

  @ApiProperty({ example: '08:00', required: false })
  @IsString()
  @IsOptional()
  opening_time?: string;

  @ApiProperty({ example: '22:00', required: false })
  @IsString()
  @IsOptional()
  closing_time?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  is_open_24h?: boolean;
}

export class UpdateHospitalDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  area?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  emergency_available?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  icu_available?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  ambulance_available?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  opening_time?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  closing_time?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_open_24h?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_verified?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
