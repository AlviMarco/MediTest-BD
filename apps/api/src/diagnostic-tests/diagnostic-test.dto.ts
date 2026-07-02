import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDiagnosticTestDto {
  @ApiProperty({ example: 'CBC (Complete Blood Count)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Blood Test', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'Complete blood count test', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Hemoglobin: 13.5-17.5 g/dL', required: false })
  @IsString()
  @IsOptional()
  normal_range?: string;

  @ApiProperty({ example: 'Fast for 8 hours', required: false })
  @IsString()
  @IsOptional()
  preparation?: string;
}

export class UpdateDiagnosticTestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  normal_range?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  preparation?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
