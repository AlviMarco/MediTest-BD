import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 'f207795d-9bae-42ee-b3e5-cf6159981c95' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ example: 'Booking Confirmed!' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Your CBC test booking has been confirmed' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'booking', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 'd16fc97f-62ad-41c7-b378-4041d88a53ca', required: false })
  @IsUUID()
  @IsOptional()
  reference_id?: string;

  @ApiProperty({ example: 'booking', required: false })
  @IsString()
  @IsOptional()
  reference_type?: string;
}
