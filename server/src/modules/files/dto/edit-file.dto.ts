import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditFileDto {
  @ApiProperty()
  @IsString()
  fileId: string;

  @ApiProperty({ description: 'Updated document text content' })
  @IsString()
  content: string;
}