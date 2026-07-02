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

export class CreateDoctorDto {
  @ApiProperty({ example: 'Dr. Mohammad Ali' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Cardiologist' })
  @IsString()
  @IsNotEmpty()
  specialty: string;

  @ApiProperty({ example: 'MBBS, MD, FCPS', required: false })
  @IsString()
  @IsOptional()
  qualification?: string;

  @ApiProperty({ example: 10, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  experience_years?: number;

  @ApiProperty({ example: '01711234567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Senior heart specialist', required: false })
  @IsString()
  @IsOptional()
  bio?: string;
}

export class UpdateDoctorDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  specialty?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  qualification?: string;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  experience_years?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
