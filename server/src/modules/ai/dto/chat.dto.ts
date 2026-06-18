import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatDto {
  @ApiProperty({ example: 'What medicine does my mother take tonight?' })
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class LinkedInPreviewDto {
  @ApiProperty({ example: 'https://www.linkedin.com/in/mahamud-pino' })
  @IsString()
  url: string;
}
