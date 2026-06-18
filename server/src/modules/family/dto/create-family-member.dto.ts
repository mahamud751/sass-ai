import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsEmail,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RelationType, BloodGroup, Gender } from '@prisma/client';

export class CreateFamilyMemberDto {
  @ApiProperty({ example: 'Mother' })
  @IsString()
  fullName: string;

  @ApiProperty({ enum: RelationType, example: RelationType.MOTHER })
  @IsEnum(RelationType)
  relation: RelationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: BloodGroup })
  @IsOptional()
  @IsEnum(BloodGroup)
  bloodGroup?: BloodGroup;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Create a login so this member can sign in and see their own health data' })
  @IsOptional()
  @IsBoolean()
  createLogin?: boolean;

  @ApiPropertyOptional({ example: 'mother@email.com' })
  @ValidateIf((o) => o.createLogin === true)
  @IsEmail()
  loginEmail?: string;

  @ApiPropertyOptional({ example: 'password123', minLength: 6 })
  @ValidateIf((o) => o.createLogin === true)
  @IsString()
  @MinLength(6)
  password?: string;
}
