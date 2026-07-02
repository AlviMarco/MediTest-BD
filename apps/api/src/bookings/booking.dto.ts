import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'f207795d-9bae-42ee-b3e5-cf6159981c95' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ example: '69900c3b-3ade-4d09-be56-10972e4b7f6c' })
  @IsUUID()
  hospital_id: string;

  @ApiProperty({ example: 'doctor', enum: ['doctor', 'test'] })
  @IsIn(['doctor', 'test'])
  booking_type: string;

  @ApiProperty({ example: '96c90444-5072-4ac7-81ee-b144a5d44a54', required: false })
  @IsUUID()
  @IsOptional()
  doctor_id?: string;

  @ApiProperty({ example: '87d30a82-6f17-4f11-802a-ba95d47cf48c', required: false })
  @IsUUID()
  @IsOptional()
  test_id?: string;

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  booking_date: string;

  @ApiProperty({ example: '10:00', required: false })
  @IsString()
  @IsOptional()
  booking_time?: string;

  @ApiProperty({ example: 'Special notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ example: 'confirmed', enum: ['confirmed', 'cancelled', 'completed'] })
  @IsIn(['confirmed', 'cancelled', 'completed'])
  status: string;

  @ApiProperty({ example: 'Cancellation reason', required: false })
  @IsString()
  @IsOptional()
  cancellation_reason?: string;
}

export class UpdateBookingDto {
  @ApiProperty({ example: 'confirmed', enum: ['pending', 'confirmed', 'cancelled', 'completed'], required: false })
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed'])
  @IsOptional()
  status?: string;

  @ApiProperty({ example: '2026-06-10', required: false })
  @IsDateString()
  @IsOptional()
  booking_date?: string;

  @ApiProperty({ example: '11:00', required: false })
  @IsString()
  @IsOptional()
  booking_time?: string;

  @ApiProperty({ example: 'Updated note', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'Wheelchair needed', required: false })
  @IsString()
  @IsOptional()
  special_requirements?: string;
}
