import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePregnancyDto {
  @ApiProperty()
  @IsString()
  familyMemberId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  lmpDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  conceptionDate?: string;

  @ApiProperty()
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
