import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EditFileHtmlDto {
  @ApiProperty()
  @IsString()
  fileId: string;

  @ApiProperty({ description: 'Full HTML document from format editor' })
  @IsString()
  html: string;

  @ApiProperty({ description: 'Editor asset bundle id (images/styles folder)' })
  @IsString()
  editBundleId: string;

  @ApiPropertyOptional({ description: 'Also export exact PDF after save' })
  @IsOptional()
  @IsBoolean()
  exportPdf?: boolean;

  @ApiPropertyOptional({ description: 'Plain text from editor at open (browser innerText)' })
  @IsOptional()
  @IsString()
  baselinePlainText?: string;

  @ApiPropertyOptional({ description: 'Plain text after edits (browser innerText)' })
  @IsOptional()
  @IsString()
  editedPlainText?: string;
}