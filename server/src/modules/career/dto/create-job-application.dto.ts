import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobApplicationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  careerGoalId?: string;

  @ApiProperty()
  @IsString()
  company: string;

  @ApiProperty()
  @IsString()
  role: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  appliedDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  interviewDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  salaryOffered?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resumeFileId?: string;
}
