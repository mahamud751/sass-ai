import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ConvertTargetFormat {
  PDF = 'pdf',
  DOCX = 'docx',
}

export enum ConvertMode {
  EXACT = 'exact',
  RICH = 'rich',
  TEXT = 'text',
}

export class ConvertFileDto {
  @ApiProperty()
  @IsString()
  fileId: string;

  @ApiProperty({ enum: ConvertTargetFormat })
  @IsEnum(ConvertTargetFormat)
  targetFormat: ConvertTargetFormat;

  @ApiPropertyOptional({ enum: ConvertMode, default: ConvertMode.EXACT })
  @IsOptional()
  @IsEnum(ConvertMode)
  mode?: ConvertMode;
}