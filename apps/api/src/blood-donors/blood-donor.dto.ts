import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateBloodDonorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  blood_group?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  division?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  upazilla?: string;

  @IsString()
  @IsOptional()
  union_name?: string;

  @IsDateString()
  @IsOptional()
  last_donation_date?: string;

  @IsBoolean()
  @IsOptional()
  is_available?: boolean;
}

export class SearchBloodDonorDto {
  @IsString()
  @IsOptional()
  blood_group?: string;

  @IsString()
  @IsOptional()
  division?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  upazilla?: string;
}