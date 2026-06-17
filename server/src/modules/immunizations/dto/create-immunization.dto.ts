import { IsString, IsOptional, IsDateString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateImmunizationDto {
  @ApiProperty()
  @IsString()
  familyMemberId: string;

  @ApiProperty({ description: 'Vaccine / Tika name e.g. BCG, Polio-1, DPT-1, Hepatitis B, Measles' })
  @IsString()
  vaccineName: string;

  @ApiProperty()
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  administeredDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  dose?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentId?: string;
}
