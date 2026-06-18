import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineInstruction, ReminderFrequency } from '@prisma/client';

export class PrescriptionItemDto {
  @ApiProperty()
  @IsString()
  medicineName: string;

  @ApiProperty()
  @IsString()
  dosage: string;

  @ApiPropertyOptional({ enum: ReminderFrequency })
  @IsOptional()
  @IsEnum(ReminderFrequency)
  frequency?: ReminderFrequency;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  times?: string[];

  @ApiPropertyOptional({ enum: MedicineInstruction })
  @IsOptional()
  @IsEnum(MedicineInstruction)
  instruction?: MedicineInstruction;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePrescriptionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  familyMemberId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doctorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hospitalName?: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  healthRecordId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileId?: string;

  @ApiProperty({ type: [PrescriptionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];
}