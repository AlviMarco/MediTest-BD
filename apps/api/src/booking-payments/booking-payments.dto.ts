import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateBookingPaymentDto {
  @ApiProperty()
  @IsUUID()
  booking_id: string;

  @ApiProperty()
  @IsUUID()
  hospital_id: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  test_price: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount_percent: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  advance_collected: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  commission_percent: number;

  @ApiProperty()
  @IsDateString()
  payment_date: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
