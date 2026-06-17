import { IsString, IsOptional, IsDateString, IsArray, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCycleDto {
  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  cycleLength?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  flow?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  symptoms?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  familyMemberId?: string;
}
