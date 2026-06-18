import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GoalTypeDto {
  PERSONAL = 'PERSONAL',
  MONEY = 'MONEY',
  HEALTH = 'HEALTH',
  CAREER = 'CAREER',
  LEARNING = 'LEARNING',
  FAMILY = 'FAMILY',
  OTHER = 'OTHER',
}

export class CreateGoalDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: GoalTypeDto })
  @IsEnum(GoalTypeDto)
  type: GoalTypeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  @IsUUID()
  familyMemberId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;
}