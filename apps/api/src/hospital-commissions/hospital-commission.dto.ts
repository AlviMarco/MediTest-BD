import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class SetCommissionDto {
  @ApiProperty({ example: 'uuid-of-hospital' })
  @IsUUID()
  hospital_id: string;

  @ApiProperty({ example: 30 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  commission_percent: number;
}
