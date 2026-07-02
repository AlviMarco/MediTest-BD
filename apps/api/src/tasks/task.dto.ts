import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Update all MRI prices in Dhaka' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Update all hospital MRI test prices in Dhaka', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'f207795d-9bae-42ee-b3e5-cf6159981c95' })
  @IsUUID()
  assigned_by: string;

  @ApiProperty({ example: 'f207795d-9bae-42ee-b3e5-cf6159981c95' })
  @IsUUID()
  assigned_to: string;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  deadline?: Date;
}

export class UpdateTaskStatusDto {
  @ApiProperty({ example: 'accepted', enum: ['accepted', 'in_progress', 'completed'] })
  @IsIn(['accepted', 'in_progress', 'completed'])
  status: string;
}
