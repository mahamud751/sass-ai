import { IsString, IsOptional, IsDateString, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCareerGoalDto {
  @ApiProperty()
  @IsString()
  targetRole: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetCompany?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  familyMemberId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  salaryGoal?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  currentSkills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  roadmap?: any;
}
