import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicineLogStatus } from '@prisma/client';

export class LogMedicineDto {
  @ApiProperty({ enum: MedicineLogStatus })
  @IsEnum(MedicineLogStatus)
  status: MedicineLogStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Scheduled time slot HH:mm' })
  @IsOptional()
  @IsString()
  scheduledTime?: string;
}
