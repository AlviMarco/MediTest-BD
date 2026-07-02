import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @Matches(/^01[3-9]\d{8}$/, {
    message: 'phone must be a valid Bangladesh mobile number',
  })
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 4, enum: [1, 2, 3, 4], required: false })
  @IsIn([1, 2, 3, 4])
  @IsOptional()
  role_id?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
