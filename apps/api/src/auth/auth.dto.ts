import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Morshedul Islam' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'test@meditest.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '01712345678' })
  @IsString()
  @Matches(/^01[3-9]\d{8}$/, {
    message: 'phone must be a valid Bangladesh mobile number',
  })
  phone: string;

  @ApiProperty({ example: 'Test1234' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'A+' })
  @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  blood_group: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  @IsNotEmpty()
  division: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Mirpur' })
  @IsString()
  @IsNotEmpty()
  upazilla: string;

  @ApiProperty({ example: 'Pallabi', required: false })
  @IsString()
  @IsOptional()
  union_name?: string;

  @ApiProperty({ example: 'MUNNA3F2A', required: false })
  @IsString()
  @IsOptional()
  referral_code?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'test@meditest.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '01712345678', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Test1234' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
